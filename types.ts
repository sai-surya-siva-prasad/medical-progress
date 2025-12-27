
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Subject {
  id: string;
  name: string;
  totalChapters: number;
}

export type LogStatus = 'completed' | 'incomplete';

export interface LogEntry {
  subjectId: string;
  chapterNumber: number;
  status: LogStatus;
  timestamp: string;
}

export interface DailyLog {
  [logId: string]: LogEntry; // Unique key for each discrete chapter completion
}

export interface AppData {
  version: '4.0';
  subjects: Subject[];
  logs: { [dateKey: string]: DailyLog };
  coins: { [dateKey: string]: number }; // New: coins per day
  totalCoins: number; // New: total wallet balance
  examDate: string | null;
  startDate: string;
}
