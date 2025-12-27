
import React from 'react';
import { LayoutDashboard, CheckCircle2, BookOpen, Settings } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Mastery', icon: LayoutDashboard },
    { id: 'today', label: 'Session', icon: CheckCircle2 },
    { id: 'subjects', label: 'Modules', icon: BookOpen },
    { id: 'settings', label: 'Profile', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/80 backdrop-blur-3xl border-t border-white/5 px-6 pb-safe flex justify-around items-center h-20 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`relative flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
              isActive ? 'text-white scale-110' : 'text-slate-600'
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-0'}`}>
              {tab.label}
            </span>
            {isActive && (
              <div className="absolute -top-3 w-1.5 h-1.5 bg-sky-500 rounded-full shadow-[0_0_10px_#0ea5e9] animate-in zoom-in" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default Navbar;
