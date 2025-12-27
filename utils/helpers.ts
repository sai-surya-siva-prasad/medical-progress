
import { format, differenceInDays, isSameDay, addDays } from 'date-fns';
import { AppData, LogEntry } from '../types';

const parseISO = (s: string) => {
  if (!s) return new Date();
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const subDays = (d: Date, n: number) => addDays(d, -n);

export const getDateKey = (date: Date = new Date()) => format(date, 'yyyy-MM-dd');

/**
 * Finds the highest chapter number completed for a subject across all history.
 */
export const getLatestCompletedChapter = (subjectId: string, logs: AppData['logs']): number => {
  let maxChapter = 0;
  Object.values(logs).forEach(dailyLog => {
    Object.values(dailyLog).forEach(entry => {
      if (entry.subjectId === subjectId && entry.status === 'completed') {
        if (entry.chapterNumber > maxChapter) {
          maxChapter = entry.chapterNumber;
        }
      }
    });
  });
  return maxChapter;
};

// Add helper to get set of completed chapters for a specific subject
/**
 * Returns a set of unique chapter numbers completed for a specific subject.
 */
export const getCompletedChaptersSet = (subjectId: string, logs: AppData['logs']): Set<number> => {
  const completedSet = new Set<number>();
  Object.values(logs).forEach(dailyLog => {
    Object.values(dailyLog).forEach(entry => {
      if (entry.subjectId === subjectId && entry.status === 'completed') {
        completedSet.add(entry.chapterNumber);
      }
    });
  });
  return completedSet;
};

/**
 * Calculates the total number of unique chapters completed.
 */
export const getTotalCompletedCount = (logs: AppData['logs']): number => {
  const completedSet = new Set<string>();
  Object.values(logs).forEach(dailyLog => {
    Object.values(dailyLog).forEach(entry => {
      if (entry.status === 'completed') {
        completedSet.add(`${entry.subjectId}-${entry.chapterNumber}`);
      }
    });
  });
  return completedSet.size;
};

export const getDailyScore = (data: AppData, dateKey: string): number => {
  const dayLog = data.logs[dateKey];
  if (!dayLog) return 0;
  const stats = getPaceStats(data);
  const completions = Object.values(dayLog).filter(l => l.status === 'completed').length;
  if (stats.suggested === 0) return 100;
  return Math.min(100, Math.round((completions / stats.suggested) * 100));
};

export const getStreak = (logs: AppData['logs']): number => {
  let streak = 0;
  let current = startOfToday();
  while (true) {
    const key = getDateKey(current);
    const dayLog = logs[key];
    const hasActivity = dayLog && Object.keys(dayLog).length > 0;
    if (hasActivity) {
      streak++;
      current = subDays(current, 1);
    } else {
      break;
    }
  }
  return streak;
};

export const getPaceStats = (data: AppData) => {
  const total = data.subjects.reduce((acc, s) => acc + s.totalChapters, 0);
  const completed = getTotalCompletedCount(data.logs);
  const remaining = Math.max(0, total - completed);
  
  const today = startOfToday();
  const exam = data.examDate ? parseISO(data.examDate) : null;
  const daysLeft = exam ? differenceInDays(exam, today) : 30;
  
  const suggested = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : remaining;
  
  const todayKey = getDateKey();
  const todayDone = data.logs[todayKey] ? Object.values(data.logs[todayKey]).filter(l => l.status === 'completed').length : 0;

  return { 
    total, 
    completed, 
    remaining, 
    daysLeft, 
    suggested, 
    todayDone 
  };
};
