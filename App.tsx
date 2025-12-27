
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './screens/Dashboard';
import TodayLog from './screens/TodayLog';
import Subjects from './screens/Subjects';
import Settings from './screens/Settings';
import Auth from './screens/Auth';
import { Loader2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading } = useApp();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="animate-spin text-sky-500" size={40} />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard />;
      case 'today': return <TodayLog />;
      case 'subjects': return <Subjects />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen pb-20 max-w-lg mx-auto px-6 pt-8 overflow-x-hidden">
      {renderContent()}
      <Navbar currentTab={currentTab} setTab={setCurrentTab} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;
