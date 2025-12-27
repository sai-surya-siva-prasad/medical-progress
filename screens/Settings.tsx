
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar as CalendarIcon, 
  Download, 
  Trash, 
  Shield, 
  LogOut, 
  User as UserIcon, 
  RefreshCcw, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  isAfter, 
  getYear,
  getMonth,
  addDays
} from 'date-fns';

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const result = new Date(d.setDate(diff));
  result.setHours(0, 0, 0, 0);
  return result;
};
const setYear = (date: Date, year: number) => {
  const d = new Date(date);
  d.setFullYear(year);
  return d;
};
const setMonth = (date: Date, month: number) => {
  const d = new Date(date);
  d.setMonth(month);
  return d;
};
const subMonths = (d: Date, n: number) => addMonths(d, -n);

const Settings: React.FC = () => {
  const { data, user, profile, syncing, updateExamDate, resetData, signOut } = useApp();
  const [viewDate, setViewDate] = useState(data.examDate ? new Date(data.examDate) : new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [pickerMode, setPickerMode] = useState<'none' | 'month' | 'year'>('none');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = getYear(new Date());
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medsprint-backup-${format(new Date(), 'yyyyMMdd')}.json`;
    a.click();
  };

  const handleDateSelect = async (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    const success = await updateExamDate(formatted);
    if (success) {
      setSaveIndicator(true);
      setTimeout(() => setSaveIndicator(false), 2000);
      setShowCalendar(false);
    }
  };

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ 
    start: startOfWeek(monthStart), 
    end: endOfWeek(monthEnd) 
  });

  const selectedDate = data.examDate ? new Date(data.examDate) : null;

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-1000 px-2">
      <header className="flex justify-between items-start pt-4">
        <div className="space-y-1">
          <p className="text-white text-4xl font-serif-premium font-light tracking-tight leading-none mb-1 opacity-90">
             clinical <span className="text-white/40">access</span>
          </p>
          <h1 className="text-sky-400 text-6xl font-black tracking-tighter leading-none uppercase -ml-1 text-glow-blue">
            PROFILE
          </h1>
        </div>
        <div className="flex items-center space-x-3 mt-1">
          {saveIndicator && (
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 animate-in slide-in-from-right-4">
              <CheckCircle2 size={12} />
              <span className="text-[9px] font-black uppercase tracking-luxury">Synced</span>
            </div>
          )}
          {syncing && <RefreshCcw className="animate-spin text-sky-400" size={20} />}
        </div>
      </header>

      {/* User Status */}
      <section className="glass-card rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="h-20 w-20 bg-white text-slate-950 rounded-[2rem] flex items-center justify-center shadow-[0_15px_40px_-10px_rgba(255,255,255,0.3)]">
              <UserIcon size={32} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black text-white leading-none tracking-tight">
                {profile ? `${profile.first_name}` : 'Student'} <span className="text-white/40">{profile?.last_name}</span>
              </p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-luxury truncate max-w-[140px]">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="h-14 w-14 flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-premium rounded-2xl active:scale-90"
          >
            <LogOut size={24} />
          </button>
        </div>
      </section>

      {/* Target Definition */}
      <section className="glass-card rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-10">
          <button 
            onClick={() => {
              setShowCalendar(!showCalendar);
              setPickerMode('none');
            }}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex items-center space-x-6">
              <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-premium ${showCalendar ? 'bg-sky-500 text-white shadow-[0_0_25px_rgba(14,165,233,0.4)]' : 'bg-white/5 text-sky-400'}`}>
                <CalendarIcon size={26} strokeWidth={1.5} />
              </div>
              <div className="text-left space-y-1">
                <p className="text-lg font-black text-white leading-none tracking-tight">Clinical Deadline</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-luxury">
                  {data.examDate ? format(new Date(data.examDate), 'MMMM do, yyyy') : 'Define Goal'}
                </p>
              </div>
            </div>
            <div className={`transition-premium text-slate-700 ${showCalendar ? 'rotate-90 text-sky-400' : ''}`}>
               <ChevronRight size={24} />
            </div>
          </button>

          {showCalendar && (
            <div className="mt-10 pt-10 border-t border-white/5 animate-in slide-in-from-top-6 duration-700">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                   <div className="flex space-x-2">
                      <button 
                        onClick={() => setPickerMode(pickerMode === 'month' ? 'none' : 'month')}
                        className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-luxury transition-premium ${pickerMode === 'month' ? 'bg-white text-slate-950 shadow-xl' : 'bg-white/5 text-slate-400'}`}
                      >
                        {months[getMonth(viewDate)]}
                      </button>
                      <button 
                         onClick={() => setPickerMode(pickerMode === 'year' ? 'none' : 'year')}
                         className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-luxury transition-premium ${pickerMode === 'year' ? 'bg-white text-slate-950 shadow-xl' : 'bg-white/5 text-slate-400'}`}
                      >
                        {getYear(viewDate)}
                      </button>
                   </div>
                   <div className="flex items-center space-x-1">
                      <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-3 text-slate-500 hover:text-white"><ChevronLeft size={20} /></button>
                      <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-3 text-slate-500 hover:text-white"><ChevronRight size={20} /></button>
                   </div>
                </div>

                {pickerMode !== 'none' && (
                  <div className="bg-white/5 p-6 rounded-3xl grid grid-cols-3 gap-2 animate-in zoom-in-95 duration-500">
                    {pickerMode === 'year' ? years.map(y => (
                      <button key={y} onClick={() => { setViewDate(setYear(viewDate, y)); setPickerMode('none'); }} className={`py-4 rounded-2xl text-[11px] font-black ${getYear(viewDate) === y ? 'bg-white text-slate-950' : 'text-slate-500 hover:text-white'}`}>{y}</button>
                    )) : months.map((m, i) => (
                      <button key={m} onClick={() => { setViewDate(setMonth(viewDate, i)); setPickerMode('none'); }} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-luxury ${getMonth(viewDate) === i ? 'bg-white text-slate-950' : 'text-slate-500 hover:text-white'}`}>{m.slice(0, 3)}</button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-7 gap-2">
                  {['S','M','T','W','T','F','S'].map(d => (
                    <span key={d} className="text-[10px] font-black text-slate-700 text-center uppercase mb-4 tracking-luxury">{d}</span>
                  ))}
                  {days.map((day, i) => {
                    const isSel = selectedDate && isSameDay(day, selectedDate);
                    const isTday = isToday(day);
                    const isCurrentMonth = getMonth(day) === getMonth(viewDate);
                    const isPast = !isAfter(day, new Date()) && !isToday(day);

                    return (
                      <button
                        key={i}
                        disabled={isPast}
                        onClick={() => handleDateSelect(day)}
                        className={`
                          aspect-square flex flex-col items-center justify-center rounded-2xl text-[12px] font-black transition-premium
                          ${!isCurrentMonth ? 'opacity-10 pointer-events-none' : 'opacity-100'}
                          ${isSel ? 'bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.5)] scale-110' : 'text-slate-300'}
                          ${isTday && !isSel ? 'ring-2 ring-sky-500 ring-offset-4 ring-offset-[#0f172a]' : ''}
                          ${isPast ? 'text-slate-800' : 'active:scale-90 hover:bg-white/5'}
                        `}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Protocol Controls */}
      <section className="glass-card rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
        <button onClick={handleExport} className="w-full p-10 flex items-center space-x-6 hover:bg-white/5 transition-premium border-b border-white/5 group">
          <div className="h-16 w-16 bg-white/5 text-emerald-400 rounded-2xl flex items-center justify-center border border-white/5 group-active:scale-90">
            <Download size={24} strokeWidth={1.5} />
          </div>
          <div className="text-left space-y-1">
            <p className="text-lg font-black text-white leading-none tracking-tight">Export Cloud Data</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-luxury">Clinical JSON Backup</p>
          </div>
        </button>

        <button onClick={resetData} className="w-full p-10 flex items-center space-x-6 hover:bg-red-500/5 transition-premium group">
          <div className="h-16 w-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center border border-red-500/20 group-active:scale-90">
            <Trash size={24} strokeWidth={1.5} />
          </div>
          <div className="text-left space-y-1">
            <p className="text-lg font-black text-red-500 leading-none tracking-tight">Emergency Reset</p>
            <p className="text-[10px] text-red-400/30 font-black uppercase tracking-luxury">Purge Clinical Inventory</p>
          </div>
        </button>
      </section>

      {/* Brand Footer */}
      <section className="bg-sky-950/40 rounded-[3.5rem] p-16 text-white relative overflow-hidden shadow-2xl border border-sky-500/10 text-center space-y-8">
        <div className="relative z-10 space-y-4">
          <h3 className="text-3xl font-serif-premium font-light tracking-tight leading-none">MedSprint <span className="text-sky-500">Elite</span></h3>
          <p className="text-[10px] font-black text-sky-400/60 uppercase tracking-luxury">System Integration v4.1</p>
        </div>
        <p className="relative z-10 text-sm text-sky-100/40 leading-relaxed font-medium px-4">
          Built for the surgical precision of medical training. Efficiency is the only metric that matters.
        </p>
        <div className="relative z-10 mx-auto flex items-center justify-center space-x-3 text-[10px] font-black uppercase tracking-luxury bg-white/5 backdrop-blur-3xl w-fit px-8 py-4 rounded-3xl border border-white/10 text-sky-300">
          <Shield size={16} />
          <span>Clinical Standard</span>
        </div>
        <div className="absolute inset-0 bg-radial-gradient from-sky-500/10 to-transparent pointer-events-none" />
      </section>
    </div>
  );
};

export default Settings;
