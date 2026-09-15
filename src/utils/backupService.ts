import { CloudBackupSnapshot, TimetableChart, TimeSlot, ImportantEvent, Habit, Preferences, WorkShiftItem, Transaction } from '../types';

const BACKUP_SNAPSHOTS_KEY = 'omniflow_cloud_snapshots_v1';
const AUTO_BACKUP_LAST_TIME_KEY = 'omniflow_last_auto_backup';

export interface CompleteAppData {
  version: string;
  timestamp: string;
  lifeMode: 'student' | 'workplace';
  preferences: Preferences;
  slots: TimeSlot[];
  dataChart: TimetableChart;
  events: ImportantEvent[];
  habits: Habit[];
  workShifts?: WorkShiftItem[];
  transactions?: Transaction[];
  notes?: Record<string, string>;
}

class BackupService {
  // Get all saved snapshots
  getSnapshots(): CloudBackupSnapshot[] {
    try {
      const data = localStorage.getItem(BACKUP_SNAPSHOTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Create a new snapshot
  createSnapshot(fullData: CompleteAppData, label?: string): CloudBackupSnapshot {
    const rawData = JSON.stringify(fullData);
    const snapshots = this.getSnapshots();

    const summaryParts: string[] = [];
    if (fullData.lifeMode === 'workplace') {
      summaryParts.push(`${fullData.workShifts?.length || 0} Work Shifts`);
    } else {
      const totalClasses = Object.values(fullData.dataChart || {}).reduce((acc, c) => acc + (c?.length || 0), 0);
      summaryParts.push(`${totalClasses} Classes`);
    }
    summaryParts.push(`${fullData.transactions?.length || 0} Transactions`);
    summaryParts.push(`${fullData.events?.length || 0} Deadlines`);
    summaryParts.push(`${fullData.habits?.length || 0} Habits`);

    const newSnapshot: CloudBackupSnapshot = {
      id: 'snap_' + Date.now(),
      timestamp: new Date().toISOString(),
      label: label || `Auto Backup (${new Date().toLocaleDateString('my-MM')})`,
      dataSummary: summaryParts.join(' • '),
      rawData
    };

    // Keep latest 10 snapshots
    const updated = [newSnapshot, ...snapshots].slice(0, 10);
    localStorage.setItem(BACKUP_SNAPSHOTS_KEY, JSON.stringify(updated));
    localStorage.setItem(AUTO_BACKUP_LAST_TIME_KEY, new Date().toISOString());

    return newSnapshot;
  }

  // Export as downloadable JSON file
  downloadBackupJSON(fullData: CompleteAppData) {
    const jsonStr = JSON.stringify(fullData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `OmniFlow_${fullData.lifeMode || 'app'}_Backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Delete a snapshot
  deleteSnapshot(id: string) {
    const snapshots = this.getSnapshots().filter(s => s.id !== id);
    localStorage.setItem(BACKUP_SNAPSHOTS_KEY, JSON.stringify(snapshots));
    return snapshots;
  }
}

export const backupService = new BackupService();
