
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { CheckIn, Language, UserState, Theme, CyclePhase, CheckInType, BodyPayload } from './types';
import { translations } from './translations';
import Home from './views/Home';
import Timeline from './views/Timeline';
import Insights from './views/Insights';
import Chat from './views/Chat';
import Profile from './views/Profile';
import CheckInModal from './components/CheckInModal';
import * as Icons from 'lucide-react';

interface AppContextType {
  state: UserState;
  addLog: (log: Omit<CheckIn, 'id' | 'timestamp'>) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  updateUser: (name: string, bio: string, conditions: string[]) => void;
  logout: () => void;
  syncWithAppleHealth: () => Promise<void>;
  t: any;
  currentCycleInfo: { day: number; phase: CyclePhase; progress: number; phaseDay: number; phaseTotal: number };
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

const App: React.FC = () => {
  const [state, setState] = useState<UserState>(() => {
    const saved = localStorage.getItem('hormonaflow_pro_final_v4');
    return saved ? JSON.parse(saved) : {
      language: 'es',
      name: localStorage.getItem('temp_user') || 'User',
      preferences: {
        theme: 'light' as Theme,
        bio: '',
        cycleLength: 28,
        conditions: [],
        isHealthSynced: false,
        lastSyncTimestamp: undefined
      },
      logs: [],
      periodHistory: []
    };
  });

  const [activeTab, setActiveTab] = useState<'home' | 'timeline' | 'insights' | 'chat' | 'profile'>('home');
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('hormonaflow_pro_final_v4', JSON.stringify(state));
    const root = window.document.documentElement;
    if (state.preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.preferences.theme, state]);

  const addLog = (log: Omit<CheckIn, 'id' | 'timestamp'>) => {
    const newLog: CheckIn = { ...log, id: crypto.randomUUID(), timestamp: Date.now() };
    let newPeriodHistory = [...state.periodHistory];
    if (log.type === CheckInType.Body && (log.payload as BodyPayload).periodDayOne) {
      newPeriodHistory = [newLog.timestamp, ...newPeriodHistory].sort((a,b) => b - a);
    }
    setState(prev => ({ ...prev, logs: [newLog, ...prev.logs], periodHistory: newPeriodHistory }));
  };

  const currentCycleInfo = useMemo(() => {
    if (state.periodHistory.length === 0) {
      return { day: 1, phase: CyclePhase.Folicular, progress: 0, phaseDay: 1, phaseTotal: 10 };
    }
    const lastDayOne = state.periodHistory[0];
    const diffDays = Math.max(1, Math.ceil(Math.abs(Date.now() - lastDayOne) / (1000 * 60 * 60 * 24)));
    const cycleDay = ((diffDays - 1) % state.preferences.cycleLength) + 1;

    let phase: CyclePhase;
    let phaseDay: number, phaseTotal: number;

    if (cycleDay <= 5) { phase = CyclePhase.Menstruacion; phaseDay = cycleDay; phaseTotal = 5; }
    else if (cycleDay <= 13) { phase = CyclePhase.Folicular; phaseDay = cycleDay - 5; phaseTotal = 8; }
    else if (cycleDay <= 17) { phase = CyclePhase.Ovulacion; phaseDay = cycleDay - 13; phaseTotal = 4; }
    else { phase = CyclePhase.Lutea; phaseDay = cycleDay - 17; phaseTotal = 11; }

    return { day: cycleDay, phase, progress: (cycleDay / state.preferences.cycleLength) * 100, phaseDay, phaseTotal };
  }, [state.periodHistory, state.preferences.cycleLength]);

  const toggleTheme = () => setState(prev => ({
    ...prev,
    preferences: { ...prev.preferences, theme: prev.preferences.theme === 'light' ? 'dark' : 'light' }
  }));

  const setLanguage = (lang: Language) => setState(prev => ({ ...prev, language: lang }));

  const updateUser = (name: string, bio: string, conditions: string[]) => 
    setState(prev => ({ ...prev, name, preferences: { ...prev.preferences, bio, conditions } }));

  const syncWithAppleHealth = async () => {
    return new Promise<void>((resolve) => {
      // Simulación de Bridge HealthKit real
      setTimeout(() => {
        const appleHealthData = {
          lastPeriods: [
            Date.now() - (2 * 24 * 60 * 60 * 1000), // Hace 2 días
            Date.now() - (30 * 24 * 60 * 60 * 1000), // Hace 30 días
            Date.now() - (61 * 24 * 60 * 60 * 1000), // Hace 61 días
          ],
          averageCycleLength: 29
        };

        setState(prev => ({ 
          ...prev, 
          periodHistory: appleHealthData.lastPeriods,
          preferences: { 
            ...prev.preferences, 
            isHealthSynced: true, 
            lastSyncTimestamp: Date.now(),
            cycleLength: appleHealthData.averageCycleLength 
          }
        }));
        resolve();
      }, 2000);
    });
  };

  const t = translations[state.language];

  return (
    <AppContext.Provider value={{ state, addLog, setLanguage, toggleTheme, updateUser, logout: () => { localStorage.removeItem('temp_user'); window.location.reload(); }, syncWithAppleHealth, t, currentCycleInfo }}>
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-cream dark:bg-obsidian text-stone-900 dark:text-stone-100 shadow-2xl relative overflow-hidden transition-colors duration-700">
        
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="glow-orb absolute top-[-10%] left-[-15%] w-[120%] h-[50%] bg-rose-500/20 dark:bg-rose-900/10 rounded-full"></div>
          <div className="glow-orb absolute bottom-[5%] right-[-10%] w-[100%] h-[50%] bg-indigo-500/20 dark:bg-indigo-900/10 rounded-full"></div>
        </div>

        <header className="sticky top-0 z-30 bg-cream/70 dark:bg-obsidian/70 backdrop-blur-2xl px-6 py-4 safe-top flex justify-between items-center border-b border-stone-200/20 dark:border-stone-800/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 shadow-xl flex items-center justify-center text-white ring-2 ring-white/20">
                <Icons.Flame size={20} />
             </div>
             <h1 className="font-serif text-xl font-bold tracking-tight text-stone-800 dark:text-stone-50">HormonaFlow</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center transition-all active:scale-90"
              aria-label="Toggle Theme"
            >
              {state.preferences.theme === 'light' ? <Icons.Moon size={20} className="text-stone-700" /> : <Icons.Sun size={20} className="text-amber-400" />}
            </button>
            <button 
              onClick={() => setLanguage(state.language === 'en' ? 'es' : 'en')} 
              className="px-4 py-2.5 rounded-2xl glass-card text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 active:scale-90"
            >
              {state.language}
            </button>
          </div>
        </header>

        <main className="flex-1 pb-32 overflow-y-auto relative z-10 scrollbar-hide">
          {activeTab === 'home' && <Home />}
          {activeTab === 'timeline' && <Timeline />}
          {activeTab === 'insights' && <Insights />}
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'profile' && <Profile />}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 glass-card !bg-white/80 dark:!bg-black/80 !border-t-0 safe-bottom rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
          <div className="flex justify-around items-center h-20 px-6">
            <NavButton icon="Layout" active={activeTab === 'home'} onClick={() => setActiveTab('home')} label={t.home} />
            <NavButton icon="Activity" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} label={t.timeline} />
            
            <div className="relative -top-8">
               <button 
                onClick={() => setIsCheckInModalOpen(true)} 
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 shadow-stone-900/30 dark:shadow-stone-100/10`}
               >
                  <Icons.Plus size={32} />
               </button>
            </div>

            <NavButton icon="Sparkles" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} label={t.insights} />
            <NavButton icon="User" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} label={t.profile} />
          </div>
        </nav>

        {isCheckInModalOpen && <CheckInModal onClose={() => setIsCheckInModalOpen(false)} />}
      </div>
    </AppContext.Provider>
  );
};

const NavButton = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => {
  const IconComponent = (Icons as any)[icon];
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center transition-all ${active ? 'text-rose-600 scale-105' : 'text-stone-400 dark:text-stone-600'}`}>
      <IconComponent size={24} strokeWidth={active ? 2.5 : 1.5} />
      <span className={`text-[9px] mt-1.5 font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
    </button>
  );
};

export default App;
