
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppData, Subject, DailyLog, LogStatus, UserProfile, LogEntry } from '../types';
import { getDateKey } from '../utils/helpers';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AppContextType {
  data: AppData;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  syncing: boolean;
  addSubject: (name: string, chapters: number) => Promise<void>;
  editSubject: (id: string, name: string, chapters: number) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  setupDefaultCurriculum: () => Promise<void>;
  updateExamDate: (date: string) => Promise<boolean>;
  logChapter: (subjectId: string, chapterNumber: number, status: LogStatus, customDate?: string) => Promise<void>;
  deleteLog: (logId: string, date: string) => Promise<void>;
  resetData: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState<AppData>({
    version: '4.0',
    subjects: [],
    logs: {},
    coins: {},
    totalCoins: 0,
    examDate: null,
    startDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const clearAppState = useCallback(() => {
    setUser(null);
    setProfile(null);
    setData({
      version: '4.0',
      subjects: [],
      logs: {},
      coins: {},
      totalCoins: 0,
      examDate: null,
      startDate: format(new Date(), 'yyyy-MM-dd'),
    });
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // If the token is invalid or missing, clear everything
          if (error.message.toLowerCase().includes('refresh token') || error.message.toLowerCase().includes('not found')) {
            console.warn("Zenith Protocol: Stale session detected. Clearing auth cache.");
            await supabase.auth.signOut();
            clearAppState();
          } else {
            console.error("Auth session error:", error);
          }
          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (e) {
        console.error("Critical auth initialization failure:", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED' && !session) {
        clearAppState();
      } else if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [clearAppState]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;
      setLoading(true);
      
      try {
        const { data: userData, error: userErr } = await supabase.from('med_users').select('*').eq('id', user.id).single();
        const { data: subjectData } = await supabase.from('med_subjects').select('*').eq('user_id', user.id);
        const { data: progressData } = await supabase.from('med_progress').select('*').eq('user_id', user.id).order('date', { ascending: false });
        const { data: coinsData } = await supabase.from('med_coins').select('*').eq('user_id', user.id);

        if (userData) {
          setProfile({ id: userData.id, first_name: userData.first_name, last_name: userData.last_name });
          
          const subjects: Subject[] = (subjectData || []).map(s => ({
            id: s.id,
            name: s.name,
            totalChapters: s.total_chapters
          }));

          const logs: AppData['logs'] = {};
          (progressData || []).forEach(p => {
            if (!logs[p.date]) logs[p.date] = {};
            logs[p.date][p.id] = {
              subjectId: p.subject_id,
              chapterNumber: p.topic_number ? parseInt(p.topic_number) : 0,
              status: (p.status || 'completed') as LogStatus,
              timestamp: p.created_at
            };
          });

          const coins: AppData['coins'] = {};
          let totalCoins = 0;
          (coinsData || []).forEach(c => {
            coins[c.date] = c.coins;
            totalCoins += c.coins;
          });

          setData({
            version: '4.0',
            subjects,
            logs,
            coins,
            totalCoins,
            examDate: userData.exam_date,
            startDate: userData.start_date || format(new Date(), 'yyyy-MM-dd')
          });
        }
      } catch (err) {
        console.error('Data acquisition failure:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAllData();
  }, [user]);

  const awardCoins = async (date: string, amount: number) => {
    if (!user) return;
    const currentDayCoins = (data.coins[date] || 0) + amount;
    
    const { error } = await supabase.from('med_coins').upsert({
      user_id: user.id,
      date: date,
      coins: currentDayCoins
    }, { onConflict: 'user_id,date' });

    if (!error) {
      setData(prev => ({
        ...prev,
        coins: { ...prev.coins, [date]: currentDayCoins },
        totalCoins: prev.totalCoins + amount
      }));
    }
  };

  const addSubject = async (name: string, chapters: number) => {
    if (!user) return;
    setSyncing(true);
    const { data: newSub, error } = await supabase.from('med_subjects').insert({ user_id: user.id, name, total_chapters: chapters }).select().single();
    if (!error && newSub) {
      setData(prev => ({
        ...prev,
        subjects: [...prev.subjects, { id: newSub.id, name: newSub.name, totalChapters: newSub.total_chapters }]
      }));
    }
    setSyncing(false);
  };

  const setupDefaultCurriculum = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      await supabase.from('med_subjects').delete().eq('user_id', user.id);
      
      const defaults = [
        { name: 'Medicine', total_chapters: 20 },
        { name: 'Obs', total_chapters: 40 },
        { name: 'Gyn', total_chapters: 42 },
        { name: 'Ortho', total_chapters: 25 },
        { name: 'Peads', total_chapters: 30 },
        { name: 'Ophtha', total_chapters: 22 },
        { name: 'Ent', total_chapters: 95 },
      ];

      const payloads = defaults.map(d => ({
        user_id: user.id,
        name: d.name,
        total_chapters: d.total_chapters
      }));

      const { data: newSubjects, error } = await supabase.from('med_subjects').insert(payloads).select();
      
      if (!error && newSubjects) {
        setData(prev => ({
          ...prev,
          subjects: newSubjects.map(s => ({
            id: s.id,
            name: s.name,
            totalChapters: s.total_chapters
          }))
        }));
      }
    } finally {
      setSyncing(false);
    }
  };

  const editSubject = async (id: string, name: string, chapters: number) => {
    if (!user) return;
    setSyncing(true);
    const { error } = await supabase.from('med_subjects').update({ name, total_chapters: chapters }).eq('id', id);
    if (!error) {
      setData(prev => ({
        ...prev,
        subjects: prev.subjects.map(s => s.id === id ? { ...s, name, totalChapters: chapters } : s)
      }));
    }
    setSyncing(false);
  };

  const deleteSubject = async (id: string) => {
    if (!user) return;
    setSyncing(true);
    try {
      await supabase.from('med_progress').delete().eq('subject_id', id);
      const { error } = await supabase.from('med_subjects').delete().eq('id', id);
      
      if (!error) {
        setData(prev => {
          const newSubjects = prev.subjects.filter(s => s.id !== id);
          const newLogs = { ...prev.logs };
          Object.keys(newLogs).forEach(date => {
            const daily = { ...newLogs[date] };
            Object.keys(daily).forEach(logId => {
              if (daily[logId].subjectId === id) delete daily[logId];
            });
            if (Object.keys(daily).length === 0) delete newLogs[date];
            else newLogs[date] = daily;
          });

          return { ...prev, subjects: newSubjects, logs: newLogs };
        });
      } else {
        throw error;
      }
    } catch (err: any) {
      console.error('Clinical Deletion Error:', err.message);
      alert('Module decommissioning failed.');
    } finally {
      setSyncing(false);
    }
  };

  const updateExamDate = async (examDate: string) => {
    if (!user) return false;
    setSyncing(true);
    try {
      const { error } = await supabase.from('med_users').update({ exam_date: examDate }).eq('id', user.id);
      if (error) throw error;
      setData(prev => ({ ...prev, examDate }));
      return true;
    } finally {
      setSyncing(false);
    }
  };

  const logChapter = async (subjectId: string, chapterNumber: number, status: LogStatus, customDate?: string) => {
    if (!user) return;
    setSyncing(true);
    const dateKey = customDate || getDateKey();
    const subject = data.subjects.find(s => s.id === subjectId);
    
    try {
      const payload = {
        user_id: user.id,
        subject_id: subjectId,
        subject_name: subject?.name || 'Unknown',
        date: dateKey,
        status: 'completed',
        topic_number: chapterNumber.toString(),
        chapters_completed: 1
      };

      const { data: newRow, error } = await supabase.from('med_progress').insert(payload).select().single();
      
      if (error) throw error;

      if (newRow) {
        setData(prev => ({
          ...prev,
          logs: {
            ...prev.logs,
            [dateKey]: {
              ...(prev.logs[dateKey] || {}),
              [newRow.id]: {
                subjectId,
                chapterNumber,
                status: 'completed',
                timestamp: newRow.created_at
              }
            }
          }
        }));

        await awardCoins(dateKey, 10);
      }
    } catch (err: any) {
      console.error('Clinical Sync Error:', err.message);
    } finally {
      setSyncing(false);
    }
  };

  const deleteLog = async (logId: string, date: string) => {
    if (!user) return;
    setSyncing(true);
    try {
      await supabase.from('med_progress').delete().eq('id', logId);
      setData(prev => {
        const newLogs = { ...prev.logs };
        if (newLogs[date]) {
          delete newLogs[date][logId];
          if (Object.keys(newLogs[date]).length === 0) delete newLogs[date];
        }
        return { ...prev, logs: newLogs };
      });
      await awardCoins(date, -10);
    } finally {
      setSyncing(false);
    }
  };

  const resetData = async () => {
    if (!user || !confirm('Wipe clinical database?')) return;
    setSyncing(true);
    try {
      await supabase.from('med_subjects').delete().eq('user_id', user.id);
      await supabase.from('med_progress').delete().eq('user_id', user.id);
      await supabase.from('med_coins').delete().eq('user_id', user.id);
      setData(prev => ({ ...prev, subjects: [], logs: {}, coins: {}, totalCoins: 0 }));
    } finally {
      setSyncing(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearAppState();
  };

  return (
    <AppContext.Provider value={{ 
      data, user, profile, loading, syncing, 
      addSubject, editSubject, deleteSubject, setupDefaultCurriculum,
      updateExamDate, logChapter, deleteLog, resetData, signOut 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
