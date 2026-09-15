import { TimetableChart, TimeSlot, DayCode, Preferences } from '../types';

const DAY_MAP_TO_RRULE: Record<DayCode, string> = {
  MON: 'MO',
  TUE: 'TU',
  WED: 'WE',
  THU: 'TH',
  FRI: 'FR',
  SAT: 'SA',
  SUN: 'SU'
};

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
 * Format a Date object into ICS local date-time string YYYYMMDDTHHMMSS
 */
function formatIcsDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const mins = pad(date.getMinutes());
  const secs = pad(date.getSeconds());
  return `${year}${month}${day}T${hours}${mins}${secs}`;
}

/**
 * Find the next upcoming Date for a given DayCode
 */
function getNextDayDate(dayCode: DayCode, timeStr: string): Date {
  const targetDayIdx = DAY_INDEX[dayCode];
  const now = new Date();
  const currentDayIdx = now.getDay();
  
  let daysUntil = (targetDayIdx - currentDayIdx + 7) % 7;
  // If today is target day, calculate from today or next week
  const [hours, mins] = timeStr.split(':').map(Number);
  
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysUntil);
  targetDate.setHours(hours || 0, mins || 0, 0, 0);
  
  return targetDate;
}

/**
 * Generates an RFC-5545 compliant .ics calendar file with weekly recurring events
 */
export function generateTimetableIcs(
  chart: TimetableChart,
  slots: TimeSlot[],
  notes: Record<string, string>,
  preferences: Preferences,
  calendarTitle: string = 'My Class Timetable'
): string {
  const nowStr = formatIcsDateTime(new Date()) + 'Z';
  const days: DayCode[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  let icsLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Student Timetable Web App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarTitle}`,
    'X-WR-TIMEZONE:Asia/Yangon'
  ];

  days.forEach(day => {
    const activities = chart[day] || [];
    activities.forEach(act => {
      if (!act.name || !act.start || !act.end) return;

      const rruleDay = DAY_MAP_TO_RRULE[day];
      const startDate = getNextDayDate(day, act.start);
      
      const [endH, endM] = act.end.split(':').map(Number);
      const endDate = new Date(startDate);
      endDate.setHours(endH || (startDate.getHours() + 1), endM || 0, 0, 0);

      const dtStart = formatIcsDateTime(startDate);
      const dtEnd = formatIcsDateTime(endDate);
      const uid = `timetable-${day}-${act.slots?.join('-') || act.start}-${Math.random().toString(36).substring(2, 9)}@timetable.app`;
      
      // Find associated notes for this activity
      const noteParts: string[] = [];
      (act.slots || []).forEach(slotId => {
        const noteKey = `${day}_slot${slotId}`;
        if (notes[noteKey]) {
          noteParts.push(notes[noteKey]);
        }
      });
      
      const description = noteParts.length > 0
        ? `Notes: ${noteParts.join(' | ')}\\nTime: ${act.timeStr || (act.start + ' - ' + act.end)}`
        : `Class Time: ${act.timeStr || (act.start + ' - ' + act.end)}`;

      const category = act.category === 'personal' ? 'Personal' : act.category === 'relationship' ? 'Activity' : 'Academic';

      const leadTimeMinutes = preferences.calendarAlarmLeadTime !== undefined ? preferences.calendarAlarmLeadTime : (preferences.reminderTime || 10);

      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`UID:${uid}`);
      icsLines.push(`DTSTAMP:${nowStr}`);
      icsLines.push(`DTSTART:${dtStart}`);
      icsLines.push(`DTEND:${dtEnd}`);
      icsLines.push(`RRULE:FREQ=WEEKLY;BYDAY=${rruleDay}`);
      icsLines.push(`SUMMARY:${act.name}`);
      icsLines.push(`DESCRIPTION:${description}`);
      icsLines.push(`CATEGORIES:${category}`);
      icsLines.push('STATUS:CONFIRMED');
      icsLines.push('TRANSP:OPAQUE');
      
      // Native Phone Alarm & Notification Triggers (RFC 5545 VALARM)
      if (leadTimeMinutes >= 0) {
        // Display Pop-up Notification
        icsLines.push('BEGIN:VALARM');
        icsLines.push(`TRIGGER:-PT${leadTimeMinutes}M`);
        icsLines.push('ACTION:DISPLAY');
        icsLines.push(`DESCRIPTION:${act.name} (${act.timeStr || act.start})`);
        icsLines.push('END:VALARM');

        // Audio Chime / Alarm Sound Trigger
        icsLines.push('BEGIN:VALARM');
        icsLines.push(`TRIGGER:-PT${leadTimeMinutes}M`);
        icsLines.push('ACTION:AUDIO');
        icsLines.push('END:VALARM');
      }

      icsLines.push('END:VEVENT');
    });
  });

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n');
}

/**
 * Triggers automatic download of .ics calendar file
 */
export function downloadTimetableIcs(
  chart: TimetableChart,
  slots: TimeSlot[],
  notes: Record<string, string>,
  preferences: Preferences,
  calendarTitle?: string
): void {
  const icsContent = generateTimetableIcs(chart, slots, notes, preferences, calendarTitle);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'class_timetable_schedule.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a direct Google Calendar web URL to add an event
 */
export function getGoogleCalendarWebUrl(
  title: string,
  details: string,
  startDate: Date,
  endDate: Date,
  isWeekly: boolean = true
): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatUtc = (d: Date) => {
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  };

  const dates = `${formatUtc(startDate)}/${formatUtc(endDate)}`;
  let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}`;
  if (isWeekly) {
    url += `&recur=${encodeURIComponent('RRULE:FREQ=WEEKLY;COUNT=16')}`;
  }
  return url;
}

