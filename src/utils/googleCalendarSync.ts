import { TimetableChart, DayCode, Preferences } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

declare global {
  interface Window {
    google?: any;
  }
}

export interface SyncProgressInfo {
  status: 'idle' | 'authorizing' | 'syncing' | 'completed' | 'error';
  current: number;
  total: number;
  currentSubject?: string;
  errorMessage?: string;
  syncedAccountEmail?: string;
  syncedCalendarName?: string;
}

export interface GoogleCalendarItem {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
}

export interface GoogleSyncOptions {
  promptSelectAccount?: boolean;
  loginHint?: string;
  targetCalendarId?: string;
}

/**
 * Fetch list of user's Google Calendars so user can choose which calendar to sync to
 */
export async function fetchUserGoogleCalendars(accessToken: string): Promise<GoogleCalendarItem[]> {
  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((c: any) => ({
      id: c.id,
      summary: c.summary + (c.primary ? ' (Primary)' : ''),
      primary: !!c.primary,
      backgroundColor: c.backgroundColor
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch authenticated Google account user email
 */
export async function fetchGoogleUserEmail(accessToken: string): Promise<string | undefined> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      return data.email;
    }
  } catch {}
  return undefined;
}

const DAY_INDEX: Record<DayCode, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6
};

/**
 * Calculates next Date for a given DayCode and HH:mm time
 */
function getUpcomingDayDate(dayCode: DayCode, timeStr: string): Date {
  const targetDayIdx = DAY_INDEX[dayCode];
  const now = new Date();
  const currentDayIdx = now.getDay();
  
  let daysUntil = (targetDayIdx - currentDayIdx + 7) % 7;
  const [hours, mins] = timeStr.split(':').map(Number);
  
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysUntil);
  targetDate.setHours(hours || 0, mins || 0, 0, 0);
  
  return targetDate;
}

function formatIsoLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}

/**
 * Direct 1-Click Google Calendar API Uploader
 */
export async function uploadTimetableToGoogleCalendar(
  chart: TimetableChart,
  notes: Record<string, string>,
  preferences: Preferences,
  onProgress?: (info: SyncProgressInfo) => void,
  options?: GoogleSyncOptions
): Promise<{ success: boolean; count: number; error?: string; userEmail?: string; calendarId?: string }> {
  const clientId = (firebaseConfig as any).oAuthClientId || '930929686953-hj27rgm9fvnnc9j5acla0g04ikd0pgiu.apps.googleusercontent.com';

  if (!clientId) {
    const msg = 'Google OAuth Client ID is missing.';
    onProgress?.({ status: 'error', current: 0, total: 0, errorMessage: msg });
    return { success: false, count: 0, error: msg };
  }

  // Ensure Google Identity Services is available
  if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
    const msg = 'Google Accounts library is loading. Please try again in a moment.';
    onProgress?.({ status: 'error', current: 0, total: 0, errorMessage: msg });
    return { success: false, count: 0, error: msg };
  }

  onProgress?.({ status: 'authorizing', current: 0, total: 0 });

  return new Promise((resolve) => {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            const err = tokenResponse.error_description || tokenResponse.error;
            onProgress?.({ status: 'error', current: 0, total: 0, errorMessage: err });
            return resolve({ success: false, count: 0, error: err });
          }

          const accessToken = tokenResponse.access_token;
          if (!accessToken) {
            const err = 'Failed to acquire access token';
            onProgress?.({ status: 'error', current: 0, total: 0, errorMessage: err });
            return resolve({ success: false, count: 0, error: err });
          }

          try {
            // Fetch account info
            const userEmail = await fetchGoogleUserEmail(accessToken);

            // Flatten all activities
            const days: DayCode[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
            const allItems: Array<{ day: DayCode; act: any }> = [];

            days.forEach((d) => {
              (chart[d] || []).forEach((act) => {
                if (act.name && act.start && act.end) {
                  allItems.push({ day: d, act });
                }
              });
            });

            if (allItems.length === 0) {
              const msg = 'အချိန်ဇယားထဲတွင် ထည့်သွင်းထားသော ဘာသာရပ် မရှိသေးပါ (No classes to sync).';
              onProgress?.({ status: 'error', current: 0, total: 0, errorMessage: msg, syncedAccountEmail: userEmail });
              return resolve({ success: false, count: 0, error: msg, userEmail });
            }

            const total = allItems.length;
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Yangon';
            const alarmLead = preferences.calendarAlarmLeadTime !== undefined
              ? preferences.calendarAlarmLeadTime
              : (preferences.reminderTime || 10);

            const targetCalendarId = options?.targetCalendarId || 'primary';
            let uploadedCount = 0;

            for (let i = 0; i < total; i++) {
              const { day, act } = allItems[i];
              onProgress?.({
                status: 'syncing',
                current: i + 1,
                total,
                currentSubject: `${act.name} (${day})`,
                syncedAccountEmail: userEmail
              });

              const startDate = getUpcomingDayDate(day, act.start);
              const [endH, endM] = act.end.split(':').map(Number);
              const endDate = new Date(startDate);
              endDate.setHours(endH || (startDate.getHours() + 1), endM || 0, 0, 0);

              const startIso = formatIsoLocal(startDate);
              const endIso = formatIsoLocal(endDate);

              // Find associated notes
              const noteParts: string[] = [];
              (act.slots || []).forEach((slotId: number) => {
                const noteKey = `${day}_slot${slotId}`;
                if (notes[noteKey]) {
                  noteParts.push(notes[noteKey]);
                }
              });

              const description = noteParts.length > 0
                ? `Notes: ${noteParts.join(' | ')}\nTimetable Class: ${act.name}\nDay: ${day}\nTime: ${act.timeStr || (act.start + '-' + act.end)}`
                : `Timetable Class: ${act.name}\nDay: ${day}\nTime: ${act.timeStr || (act.start + '-' + act.end)}`;

              const eventPayload: any = {
                summary: act.name,
                description,
                start: {
                  dateTime: startIso,
                  timeZone
                },
                end: {
                  dateTime: endIso,
                  timeZone
                },
                recurrence: [
                  'RRULE:FREQ=WEEKLY;COUNT=16' // 16 weeks semester recurring
                ],
                reminders: {
                  useDefault: false,
                  overrides: [
                    { method: 'popup', minutes: alarmLead }
                  ]
                }
              };

              const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(targetCalendarId)}/events`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventPayload)
              });

              if (res.ok) {
                uploadedCount++;
              } else {
                console.warn(`Failed to upload event ${act.name}:`, await res.text());
              }
            }

            onProgress?.({
              status: 'completed',
              current: uploadedCount,
              total,
              syncedAccountEmail: userEmail
            });

            resolve({ success: true, count: uploadedCount, userEmail, calendarId: targetCalendarId });
          } catch (err: any) {
            const msg = err?.message || 'Error occurred while creating Google Calendar events.';
            onProgress?.({ status: 'error', current: 0, total: 0, errorMessage: msg });
            resolve({ success: false, count: 0, error: msg });
          }
        }
      });

      // Allow switching account via prompt: 'select_account' or login_hint
      const requestConfig: any = {};
      if (options?.promptSelectAccount) {
        requestConfig.prompt = 'select_account';
      } else {
        requestConfig.prompt = '';
      }
      if (options?.loginHint) {
        requestConfig.login_hint = options.loginHint;
      }

      tokenClient.requestAccessToken(requestConfig);
    } catch (err: any) {
      const msg = err?.message || 'Failed to initialize Google Calendar login.';
      onProgress?.({ status: 'error', current: 0, total: 0, errorMessage: msg });
      resolve({ success: false, count: 0, error: msg });
    }
  });
}
