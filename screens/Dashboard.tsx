
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getStreak, getPaceStats, getDateKey, getDailyScore } from '../utils/helpers';
import { ChevronLeft, ChevronRight, Zap, Target, X, Coins } from 'lucide-react';
import { format, endOfMonth, eachDayOfInterval, endOfWeek, isSameMonth, isSameDay, addDays, addMonths } from 'date-fns';
import { LogEntry } from '../types';

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const result = new Date(d.setDate(diff));
  result.setHours(0, 0, 0, 0);
  return result;
};

const Dashboard: React.FC = () => {
  const { data, syncing, deleteLog } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isGlimmering, setIsGlimmering] = useState(false);

  // Trigger subtle shimmer when coins balance updates
  useEffect(() => {
    if (data.totalCoins > 0) {
      setIsGlimmering(true);
      const timer = setTimeout(() => setIsGlimmering(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [data.totalCoins]);

  const streak = getStreak(data.logs);
  const stats = getPaceStats(data);
  const progressPercent = Math.round((stats.completed / stats.total) * 100) || 0;

  const mStart = startOfMonth(currentMonth);
  const mEnd = endOfMonth(mStart);
  const calendarDays = eachDayOfInterval({ 
    start: startOfWeek(mStart), 
    end: endOfWeek(mEnd) 
  });

  const selectedKey = getDateKey(selectedDate);
  const selectedLogs = data.logs[selectedKey] || {};
  
  const groupedLogs = Object.entries(selectedLogs as Record<string, LogEntry>).reduce((acc, [logId, log]) => {
    if (!acc[log.subjectId]) acc[log.subjectId] = [];
    acc[log.subjectId].push({ logId, ...log });
    return acc;
  }, {} as Record<string, (LogEntry & { logId: string })[]>);

  const subjectIds = Object.keys(groupedLogs);

  return (
    <div className="space-y-10 pb-32 animate-in fade-in duration-1000">
      {/* Hero Header - Positioned to handle large titles without overflow */}
      <header className="px-1 pt-2 space-y-4">
        {/* Top Utility Row */}
        <div className="flex justify-end items-center">
          <div className={`
            bg-[#1e293b]/70 backdrop-blur-xl rounded-[1.25rem] py-2 px-3.5 
            border border-amber-500/20 flex items-center space-x-3 
            transition-all duration-500 shadow-xl
            ${isGlimmering ? 'scale-105 border-amber-400 shadow-amber-500/20' : 'scale-100'}
          `}>
            <div className={`
              h-8 w-8 rounded-xl bg-amber-500 flex items-center justify-center text-amber-950 shadow-lg 
              transition-transform duration-500
              ${isGlimmering ? 'animate-bounce' : ''}
            `}>
              <Coins size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-start pr-1">
              <span className={`text-base font-black mono leading-none transition-colors ${isGlimmering ? 'text-white' : 'text-amber-400'}`}>
                {data.totalCoins}
              </span>
              <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-[0.2em] mt-0.5">WALLET</span>
            </div>
          </div>
        </div>

        {/* Brand Row */}
        <div className="space-y-0 text-left">
          <p className="text-white subtitle-fluid font-serif-premium font-light tracking-tight leading-none mb-1 opacity-90">
            mastery <span className="text-white/30">of</span>
          </p>
          <h1 className="text-sky-400 title-fluid font-black tracking-tighter leading-[0.85] uppercase -ml-1 text-glow-blue">
            MEDICINE
          </h1>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <div className="h-[1px] w-8 bg-sky-500/30" />
          <p className="text-[8px] font-black uppercase tracking-luxury text-slate-500">
            {syncing ? 'SYNCING INTELLIGENCE...' : 'SECURED ACCESS'}
          </p>
        </div>
      </header>

      {/* Stats Panel */}
      <section className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group border border-white/5">
          <div className="relative z-10">
             <div className="flex items-center space-x-2 text-sky-400 mb-2.5 opacity-80">
               <Zap size={12} fill="currentColor" />
               <p className="text-[8px] font-black uppercase tracking-luxury">Streak</p>
             </div>
             <p className="text-4xl font-black text-white mono leading-none tracking-tighter">{streak}</p>
             <p className="text-[9px] font-medium text-slate-500 mt-1.5 uppercase">Daily Momentum</p>
          </div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-sky-500/10 blur-3xl rounded-full" />
        </div>

        <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden border border-white/5">
          <div className="relative z-10">
             <div className="flex items-center space-x-2 text-emerald-400 mb-2.5 opacity-80">
               <Target size={12} />
               <p className="text-[8px] font-black uppercase tracking-luxury">Target</p>
             </div>
             <p className="text-4xl font-black text-white mono leading-none tracking-tighter">{progressPercent}%</p>
             <p className="text-[9px] font-medium text-slate-500 mt-1.5 uppercase">Global Completion</p>
          </div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-500/10 blur-3xl rounded-full" />
        </div>
      </section>

      {/* Heatmap Calendar */}
      <section className="glass-card rounded-[2.5rem] p-6 border border-white/5">
        <div className="flex justify-between items-center mb-6 px-1">
           <h3 className="text-[10px] font-black text-white uppercase tracking-luxury opacity-60">{format(currentMonth, 'MMMM yyyy')}</h3>
           <div className="flex items-center space-x-1">
              <button onClick={() => setCurrentMonth(prev => addDays(prev, -30))} className="p-2 text-slate-600 hover:text-white transition-premium active:scale-90"><ChevronLeft size={16} /></button>
              <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className="p-2 text-slate-600 hover:text-white transition-premium active:scale-90"><ChevronRight size={16} /></button>
           </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['S','M','T','W','T','F','S'].map(d => (
            <div key={d} className="text-[8px] font-black text-slate-700 text-center uppercase tracking-luxury mb-2">{d}</div>
          ))}
          {calendarDays.map((day, idx) => {
            const isSel = isSameDay(day, selectedDate);
            const isCur = isSameMonth(day, mStart);
            const score = getDailyScore(data, getDateKey(day));
            
            let bg = 'bg-white/5';
            if (score > 75) bg = 'bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.3)]';
            else if (score > 40) bg = 'bg-sky-500/60';
            else if (score > 0) bg = 'bg-sky-500/30';

            return (
              <button 
                key={idx} 
                onClick={() => setSelectedDate(day)}
                className={`relative aspect-square rounded-xl flex items-center justify-center transition-premium transform active:scale-90 ${!isCur ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <div className={`absolute inset-0 rounded-xl transition-all duration-700 ${bg} ${isSel ? 'ring-1 ring-white ring-offset-2 ring-offset-[#0f172a]' : ''}`} />
                <span className={`relative text-[10px] font-bold ${score > 50 ? 'text-white' : 'text-slate-500'}`}>
                  {format(day, 'd')}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Mastery Feed */}
      <section className="px-1 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
           <p className="text-[8px] font-black text-slate-600 uppercase tracking-luxury">Clinical Session Log</p>
           <div className="flex items-center space-x-3">
              {data.coins[selectedKey] && (
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full animate-in zoom-in duration-300">
                  <Coins size={8} className="text-amber-500" />
                  <span className="text-[8px] font-black text-amber-500 mono">+{data.coins[selectedKey]}</span>
                </div>
              )}
              <span className="text-[9px] font-black text-sky-400/70 mono uppercase tracking-widest">{format(selectedDate, 'MMM d')}</span>
           </div>
        </div>

        {subjectIds.length > 0 ? (
          <div className="space-y-4">
            {subjectIds.map(sid => {
              const subject = data.subjects.find(s => s.id === sid);
              const logs = groupedLogs[sid];
              return (
                <div key={sid} className="glass-card rounded-[2rem] p-6 border border-white/5 animate-in slide-in-from-bottom-2 duration-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <h4 className="text-base font-black text-white tracking-tight leading-none">{subject?.name}</h4>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-luxury">Module Record</p>
                    </div>
                    <div className="px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                      <span className="text-[8px] font-black text-emerald-400 uppercase tracking-luxury">Mastered</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {logs.map(log => (
                      <div key={log.logId} className="group flex items-center bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 transition-premium hover:bg-white/10">
                        <span className="text-[10px] font-black text-slate-200 mono mr-2">CH {log.chapterNumber}</span>
                        <button onClick={() => deleteLog(log.logId, selectedKey)} className="text-slate-600 hover:text-red-400 transition-colors">
                          <X size={10} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-luxury">No Activity Recorded</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
