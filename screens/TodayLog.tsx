
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getDateKey, getLatestCompletedChapter, getPaceStats } from '../utils/helpers';
import { BookOpen, Zap, CheckCircle2, ArrowUpRight, X, Loader2, Coins } from 'lucide-react';
import { LogEntry } from '../types';

const TodayLog: React.FC = () => {
  const { data, logChapter, deleteLog, syncing } = useApp();
  const [activeRewards, setActiveRewards] = useState<{id: string, x: number, y: number}[]>([]);
  
  const dateKey = getDateKey();
  const todayLogs = data.logs[dateKey] || {};
  const stats = getPaceStats(data);

  const handleSecure = async (subjectId: string, currentNext: number, e: React.MouseEvent) => {
    if (syncing) return;
    
    // Create floating reward at click position
    const id = Math.random().toString(36).substring(7);
    setActiveRewards(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    
    // Cleanup reward after animation
    setTimeout(() => {
      setActiveRewards(prev => prev.filter(r => r.id !== id));
    }, 1500);

    await logChapter(subjectId, currentNext, 'completed');
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700 relative">
      {/* Precision Header */}
      <header className="px-1 pt-2">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-white text-xl font-serif-premium font-light tracking-tight leading-none opacity-60">
              session <span className="text-white/30">objective</span>
            </p>
            <h2 className="text-sky-400 text-5xl font-black tracking-tighter leading-none uppercase text-glow-blue">
              {stats.suggested} <span className="text-white text-3xl">Units</span>
            </h2>
          </div>
          <div className="text-right space-y-2">
            <div className="flex items-center justify-end space-x-1.5">
              <Zap size={10} className="text-emerald-500 fill-emerald-500" />
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{stats.todayDone} SECURED</p>
            </div>
            <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981] transition-all duration-1000"
                style={{ width: `${Math.min(100, (stats.todayDone / (stats.suggested || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Clinical Sprint Modules */}
      <div className="space-y-6 px-1">
        {data.subjects.length === 0 ? (
          <div className="py-24 text-center glass-card rounded-[3rem] border border-dashed border-white/10">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-luxury">Inventory Vacant</p>
          </div>
        ) : (
          data.subjects.map(subject => {
            const lastCompleted = getLatestCompletedChapter(subject.id, data.logs);
            const isFinished = lastCompleted >= subject.totalChapters;
            const nextUnit = lastCompleted + 1;
            
            const subjectTodayLogs = Object.entries(todayLogs)
              .filter(([_, log]) => (log as LogEntry).subjectId === subject.id)
              .map(([id, log]) => ({ id, ...(log as LogEntry) }))
              .sort((a, b) => b.chapterNumber - a.chapterNumber);

            const progressPercent = (lastCompleted / subject.totalChapters) * 100;

            return (
              <div 
                key={subject.id}
                className={`glass-card p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative transition-premium ${isFinished ? 'opacity-40 grayscale' : ''}`}
              >
                {/* Subject Header with Protocols */}
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white tracking-tighter leading-none uppercase">{subject.name}</h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Status: <span className="text-sky-400">{lastCompleted}/{subject.totalChapters} Mastered</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-6">
                  {!isFinished ? (
                    <>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-700"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <button 
                        disabled={syncing}
                        onClick={(e) => handleSecure(subject.id, nextUnit, e)}
                        className="group relative w-full h-20 bg-white text-slate-950 rounded-3xl flex items-center justify-center transition-premium active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] overflow-hidden"
                      >
                        <span className="relative z-10 text-xs font-black uppercase tracking-[0.4em]">Secure Unit {nextUnit}</span>
                        <div className="absolute inset-0 bg-sky-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                      </button>
                    </>
                  ) : (
                    <div className="py-4 flex items-center space-x-3 text-emerald-400">
                      <CheckCircle2 size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Clinical Protocol Complete</span>
                    </div>
                  )}

                  {subjectTodayLogs.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/5 space-y-2">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-luxury mb-3">Session Progress</p>
                      <div className="flex flex-wrap gap-2">
                        {subjectTodayLogs.map(log => (
                          <div key={log.id} className="flex items-center bg-emerald-500/10 border border-emerald-500/20 pl-3 pr-2 py-1.5 rounded-xl animate-in zoom-in-95 duration-300">
                            <span className="text-[10px] font-black text-emerald-500 mono mr-2">CH {log.chapterNumber}</span>
                            <button 
                              onClick={() => deleteLog(log.id, dateKey)}
                              className="text-emerald-500/30 hover:text-red-400 transition-colors"
                            >
                              <ArrowUpRight size={12} className="rotate-45" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Reward Layer */}
      {activeRewards.map(reward => (
        <div 
          key={reward.id}
          className="fixed pointer-events-none z-[100] flex items-center space-x-2 bg-amber-500 text-amber-950 px-3 py-1.5 rounded-full font-black text-[10px] uppercase shadow-xl animate-out fade-out slide-out-to-top-12 duration-1000"
          style={{ left: reward.x, top: reward.y - 20, transform: 'translateX(-50%)' }}
        >
          <Coins size={12} />
          <span>+10</span>
        </div>
      ))}

      {/* Sync State Indicator */}
      {syncing && (
        <div className="fixed top-6 right-6 z-[60] animate-in fade-in duration-500">
          <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-sky-500/30 px-4 py-2 rounded-full flex items-center space-x-2 shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest">Encrypting...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayLog;
