// Cloud Backup & Data Sync Utility
// Allows Exporting and Importing app JSON backups and generating Sync Base64 codes

export interface AppBackupPayload {
  version: string;
  timestamp: string;
  preferences?: any;
  chart?: any;
  slots?: any;
  tasks?: any;
  events?: any;
  workShifts?: any;
  notes?: any;
  habits?: any;
  hourlyRate?: any;
}

export const exportAppBackup = (): AppBackupPayload => {
  const payload: AppBackupPayload = {
    version: '2.0.0',
    timestamp: new Date().toISOString()
  };

  try {
    const pref = localStorage.getItem('omniflow_preferences');
    if (pref) payload.preferences = JSON.parse(pref);

    const chart = localStorage.getItem('omniflow_chart');
    if (chart) payload.chart = JSON.parse(chart);

    const slots = localStorage.getItem('omniflow_slots');
    if (slots) payload.slots = JSON.parse(slots);

    const tasks = localStorage.getItem('omniflow_tasks');
    if (tasks) payload.tasks = JSON.parse(tasks);

    const events = localStorage.getItem('omniflow_events');
    if (events) payload.events = JSON.parse(events);

    const workShifts = localStorage.getItem('omniflow_work_shifts');
    if (workShifts) payload.workShifts = JSON.parse(workShifts);

    const notes = localStorage.getItem('omniflow_notes');
    if (notes) payload.notes = JSON.parse(notes);

    const habits = localStorage.getItem('omniflow_habits');
    if (habits) payload.habits = JSON.parse(habits);

    const hourlyRate = localStorage.getItem('omniflow_work_hourly_rate');
    if (hourlyRate) payload.hourlyRate = hourlyRate;
  } catch (e) {
    console.error('Error generating backup payload', e);
  }

  return payload;
};

export const downloadBackupJSON = () => {
  const payload = exportAppBackup();
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OmniFlow_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateBackupBase64 = (): string => {
  const payload = exportAppBackup();
  const str = JSON.stringify(payload);
  return btoa(encodeURIComponent(str));
};

export const importAppBackup = (payload: AppBackupPayload): boolean => {
  try {
    if (!payload || typeof payload !== 'object') return false;

    if (payload.preferences) {
      localStorage.setItem('omniflow_preferences', JSON.stringify(payload.preferences));
    }
    if (payload.chart) {
      localStorage.setItem('omniflow_chart', JSON.stringify(payload.chart));
    }
    if (payload.slots) {
      localStorage.setItem('omniflow_slots', JSON.stringify(payload.slots));
    }
    if (payload.tasks) {
      localStorage.setItem('omniflow_tasks', JSON.stringify(payload.tasks));
    }
    if (payload.events) {
      localStorage.setItem('omniflow_events', JSON.stringify(payload.events));
    }
    if (payload.workShifts) {
      localStorage.setItem('omniflow_work_shifts', JSON.stringify(payload.workShifts));
    }
    if (payload.notes) {
      localStorage.setItem('omniflow_notes', JSON.stringify(payload.notes));
    }
    if (payload.habits) {
      localStorage.setItem('omniflow_habits', JSON.stringify(payload.habits));
    }
    if (payload.hourlyRate) {
      localStorage.setItem('omniflow_work_hourly_rate', String(payload.hourlyRate));
    }

    return true;
  } catch (e) {
    console.error('Error importing payload', e);
    return false;
  }
};

export const restoreFromBase64 = (base64Str: string): boolean => {
  try {
    const jsonStr = decodeURIComponent(atob(base64Str.trim()));
    const payload = JSON.parse(jsonStr);
    return importAppBackup(payload);
  } catch (e) {
    console.error('Invalid base64 backup code', e);
    return false;
  }
};
