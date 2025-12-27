
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getDateKey, getCompletedChaptersSet, getPaceStats } from '../utils/helpers';
import { Zap, CheckCircle2, Coins, ChevronRight } from 'lucide-react';
import { LogEntry } from '../types';

const TodayLog: React.FC = () => {
  const { data, logChapter, deleteLog, syncing } = useApp();
  const [activeRewards, setActiveRewards] = useState<{id: string, x: number, y: number}[]>([]);
  const [clickedUnit, setClickedUnit] = useState<{sid: string, ch: number} | null>(null);
  
  const dateKey = getDateKey();
  const todayLogs = data.logs[dateKey] || {};
  const stats = getPaceStats(data);

  const handleToggleUnit = async (subjectId: string, chapterNumber: number, isCompleted: boolean, logId?: string, e?: React.MouseEvent) => {
    if (syncing) return;

    if (isCompleted && logId) {
      await deleteLog(logId, dateKey);
    } else {
      setClickedUnit({ sid: subjectId, ch: chapterNumber });
      
      // Reward Animation
      if (e) {
        const id = Math.random().toString(36).substring(7);
        setActiveRewards(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => {
          setActiveRewards(prev => prev.filter(r => r.id !== id));
        }, 1000);
      }

      await logChapter(subjectId, chapterNumber, 'completed');
      setTimeout(() => setClickedUnit(null), 400);
    }
  };

  return (
    <div className="space-y-10 pb-40 animate-in fade-in duration-700 relative">
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

      {/* Grid-Based Module Inventory */}
      <div className="space-y-12 px-1">
        {data.subjects.length === 0 ? (
          <div className="py-24 text-center glass-card rounded-[3rem] border border-dashed border-white/10">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-luxury">Inventory Vacant</p>
          </div>
        ) : (
          data.subjects.map(subject => {
            const completedSet = getCompletedChaptersSet(subject.id, data.logs);
            const chapters = Array.from({ length: subject.totalChapters }, (_, i) => i + 1);
            
            // Map logs for deletion
            const logMap: Record<number, string> = {};
            Object.entries(todayLogs).forEach(([id, log]) => {
              const entry = log as LogEntry;
              if (entry.subjectId === subject.id) {
                logMap[entry.chapterNumber] = id;
              }
            });

            const progressPercent = Math.round((completedSet.size / subject.totalChapters) * 100);

            return (
              <div key={subject.id} className="space-y-6">
                {/* Module Header */}
                <div className="flex justify-between items-end px-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-2xl font-black text-white tracking-tighter leading-none uppercase">{subject.name}</h3>
                      <div className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-md">
                        <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest">{progressPercent}%</span>
                      </div>
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      Mastery Status: {completedSet.size}/{subject.totalChapters}
                    </p>
                  </div>
                </div>

                {/* Unit Matrix Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2.5">
                  {chapters.map(ch => {
                    const isCompleted = completedSet.has(ch);
                    const isToday = !!logMap[ch];
                    const isProcessing = clickedUnit?.sid === subject.id && clickedUnit?.ch === ch && syncing;

                    return (
                      <button
                        key={ch}
                        onClick={(e) => handleToggleUnit(subject.id, ch, isToday, logMap[ch], e)}
                        disabled={syncing && !isProcessing}
                        className={`
                          aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden group
                          ${isCompleted 
                            ? 'bg-emerald-500 text-white shadow-[0_5px_15px_-5px_rgba(16,185,129,0.4)] scale-100' 
                            : 'bg-white/5 border border-white/10 text-slate-500 active:scale-90'
                          }
                          ${isProcessing ? 'animate-pulse bg-emerald-400' : ''}
                          ${!isCompleted && ch === Math.min(...chapters.filter(c => !completedSet.has(c))) ? 'ring-2 ring-sky-500/50 ring-offset-2 ring-offset-[#020617]' : ''}
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={14} strokeWidth={3} className="animate-in zoom-in duration-300" />
                        ) : (
                          <span className="text-[10px] font-bold mono">{ch}</span>
                        )}
                        
                        {/* Interactive Sparkle */}
                        <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Reward Overlay */}
      {activeRewards.map(reward => (
        <div 
          key={reward.id}
          className="fixed pointer-events-none z-[100] flex items-center space-x-2 bg-amber-500 text-amber-950 px-3 py-1.5 rounded-full font-black text-[10px] uppercase shadow-xl animate-out fade-out slide-out-to-top-16 duration-1000"
          style={{ left: reward.x, top: reward.y - 20, transform: 'translateX(-50%)' }}
        >
          <Coins size={12} />
          <span>+10</span>
        </div>
      ))}

      {/* Background Hint */}
      <div className="fixed bottom-24 left-0 right-0 px-8 pointer-events-none opacity-20">
        <div className="flex items-center justify-center space-x-3 text-[8px] font-black text-slate-500 uppercase tracking-luxury">
          <span>Toggle units to update protocol</span>
          <ChevronRight size={10} />
        </div>
      </div>
    </div>
  );
};

export default TodayLog;
