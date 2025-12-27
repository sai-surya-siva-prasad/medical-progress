
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Loader2, X, Layers, AlertTriangle } from 'lucide-react';
import { Subject } from '../types';

const Subjects: React.FC = () => {
  const { data, addSubject, deleteSubject, syncing } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', chapters: '' });
  const [busy, setBusy] = useState(false);

  const handleAdd = async () => {
    if (form.name && form.chapters) {
      setBusy(true);
      await addSubject(form.name, Math.abs(parseInt(form.chapters)) || 1);
      setForm({ name: '', chapters: '' });
      setIsAdding(false);
      setBusy(false);
    }
  };

  const executeDelete = async () => {
    if (confirmDeleteId) {
      setBusy(true);
      await deleteSubject(confirmDeleteId);
      setConfirmDeleteId(null);
      setBusy(false);
    }
  };

  const selectedSubjectToDelete = data.subjects.find(s => s.id === confirmDeleteId);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700 max-w-md mx-auto">
      {/* Header - Scaled down for minimalism */}
      <header className="flex justify-between items-end px-1 pt-2">
        <div className="space-y-0.5">
          <p className="text-white text-lg font-serif-premium font-light tracking-tight opacity-50">
             clinical <span className="italic opacity-60">inventory</span>
          </p>
          <h1 className="text-white text-3xl font-black tracking-tighter uppercase leading-none">
            MODULES
          </h1>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsAdding(true)}
            className="h-10 w-10 bg-white text-slate-950 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </header>

      {/* Adding Module Form */}
      {isAdding && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Module Name</label>
              <input 
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:border-sky-500/50 outline-none transition-all"
                placeholder="e.g. Cardiology"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Units (Chapters)</label>
              <input 
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:border-sky-500/50 outline-none transition-all"
                placeholder="Count"
                type="number"
                value={form.chapters}
                onChange={(e) => setForm({...form, chapters: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button disabled={busy} onClick={() => setIsAdding(false)} className="h-12 font-black uppercase text-[9px] tracking-widest text-slate-500 bg-white/5 rounded-xl active:scale-95 transition-all">Cancel</button>
              <button disabled={busy} onClick={handleAdd} className="h-12 font-black uppercase text-[9px] tracking-widest text-slate-950 bg-white rounded-xl flex items-center justify-center active:scale-95 transition-all">
                {busy || syncing ? <Loader2 className="animate-spin" size={14} /> : 'Add Module'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module List */}
      <div className="space-y-3 px-1">
        {data.subjects.map(subject => (
          <div key={subject.id} className="glass-card p-4 rounded-2xl flex items-center justify-between group transition-all border border-white/5 hover:border-white/10 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="h-11 w-11 bg-white/5 text-slate-500 rounded-xl flex items-center justify-center border border-white/5 group-hover:text-sky-400 group-hover:bg-sky-500/5 transition-all">
                <Layers size={18} strokeWidth={1.5} />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-white text-sm tracking-tight leading-none">{subject.name}</h3>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{subject.totalChapters} Units</p>
              </div>
            </div>
            <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
              <button onClick={() => setConfirmDeleteId(subject.id)} className="p-2.5 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}

        {data.subjects.length === 0 && !isAdding && (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 opacity-40">
             <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-2">
               <Layers size={20} className="text-slate-600" />
             </div>
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-luxury">Clinical Inventory Empty</p>
          </div>
        )}
      </div>

      {/* Minimal Custom Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative glass-card w-full max-w-xs p-8 rounded-[2rem] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mb-2">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white tracking-tight uppercase">Confirm Deletion</h3>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed px-2">
                  Permanently decommission <span className="text-white">"{selectedSubjectToDelete?.name}"</span>? 
                  All clinical logs and masteries will be wiped.
                </p>
              </div>
              <div className="flex flex-col w-full space-y-2 pt-4">
                <button 
                  onClick={executeDelete} 
                  disabled={busy}
                  className="w-full h-12 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-red-500/20"
                >
                  {busy ? <Loader2 className="animate-spin mx-auto" size={14} /> : 'Confirm Deletion'}
                </button>
                <button 
                  onClick={() => setConfirmDeleteId(null)} 
                  disabled={busy}
                  className="w-full h-12 bg-white/5 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync State Overlay for busy actions */}
      {busy && !confirmDeleteId && (
        <div className="fixed top-6 right-6 z-[60] animate-in fade-in">
          <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-sky-500/30 px-4 py-2 rounded-full flex items-center space-x-2 shadow-2xl">
            <Loader2 className="animate-spin text-sky-400" size={12} />
            <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
