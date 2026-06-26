import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, LayoutDashboard, Calendar, Award, BarChart3, Sparkles, Sun, Moon,
} from 'lucide-react';

import { StudyLog, UserStats, PlannerDay, AttemptResult, Achievement, Habit } from './types';
import { INITIAL_ACHIEVEMENTS, INITIAL_HABITS } from './data';

import Dashboard from './components/Dashboard';
import DailyRoutine from './components/DailyRoutine';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import GamificationBadges from './components/GamificationBadges';

// ── Environment variable for API URL ───────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL;

// ── API helpers ──────────────────────────────────────────────────────────────

const api = {
  get: (url: string) =>
    fetch(`${API_URL}${url}`).then(r => r.json()),

  post: (url: string, body: unknown) =>
    fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(r => r.json()),

  put: (url: string, body: unknown) =>
    fetch(`${API_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(r => r.json()),

  patch: (url: string, body: unknown) =>
    fetch(`${API_URL}${url}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(r => r.json()),

  delete: (url: string) =>
    fetch(`${API_URL}${url}`, {
      method: 'DELETE',
    }),
};

// ── Default values (used only while API loads or on first boot) ──────────────

const DEFAULT_STATS: UserStats = {
  xp: 0, level: 'Beginner Banker', streak: 0, streakHistory: [],
  dailyStudyHoursGoal: 4, weeklyPracticeHoursGoal: 12,
  monthlyMockTestsGoal: 5, targetExamScore: 78,
  preferredTheme: 'banking', accentColor: 'indigo',
};

// ── Component ────────────────────────────────────────────────────────────────

export default function App() {
  const [loading, setLoading]         = useState(true);
  const [logs, setLogs]               = useState<StudyLog[]>([]);
  const [stats, setStats]             = useState<UserStats>(DEFAULT_STATS);
  const [planner, setPlanner]         = useState<PlannerDay[]>([]);
  const [attempts, setAttempts]       = useState<AttemptResult[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [habits, setHabits]           = useState<Habit[]>([]);
  const [activeTab, setActiveTab]     = useState<'dashboard' | 'routine' | 'analytics' | 'milestones'>('dashboard');

  // ── Bootstrap: load everything from FastAPI on mount ──────────────────────
  useEffect(() => {
    async function bootstrap() {
      try {
        const [fetchedStats, fetchedLogs, fetchedHabits, fetchedPlanner, fetchedAttempts] =
          await Promise.all([
            api.get('/api/stats'),
            api.get('/api/logs'),
            api.get('/api/habits'),
            api.get('/api/planner'),
            api.get('/api/attempts'),
          ]);

        setStats(fetchedStats);
        setLogs(fetchedLogs);
        setPlanner(fetchedPlanner);
        setAttempts(fetchedAttempts);

        // Seed habits from data.ts on first boot (DB returns empty array)
        if (fetchedHabits.length === 0) {
          const seeded = await Promise.all(
            INITIAL_HABITS.map((h: Habit) => api.post('/api/habits', h))
          );
          setHabits(seeded);
        } else {
          setHabits(fetchedHabits);
        }
      } catch (err) {
        console.error('Failed to load from API, falling back to defaults:', err);
        setHabits(INITIAL_HABITS);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  // ── Auto-level up based on XP ─────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    let targetLevel: UserStats['level'] = 'Beginner Banker';
    if (stats.xp >= 3000)      targetLevel = 'Future Banker';
    else if (stats.xp >= 2005) targetLevel = 'Banking Expert';
    else if (stats.xp >= 1200) targetLevel = 'Probationary Officer';
    else if (stats.xp >= 500)  targetLevel = 'Clerk Aspirant';

    if (stats.level !== targetLevel) {
      handleUpdateStats({ level: targetLevel });
      if (targetLevel === 'Probationary Officer') handleUnlockAchievement('ach-level-PO');
    }
  }, [stats.xp, loading]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleUpdateStats = useCallback(async (partial: Partial<UserStats>) => {
    const updated = { ...stats, ...partial };
    setStats(updated);
    try {
      await api.put('/api/stats', updated);
    } catch (err) {
      console.error('Failed to save stats:', err);
    }
  }, [stats]);

  const handleAddLog = useCallback(async (newLog: Omit<StudyLog, 'id'>) => {
    const log: StudyLog = { ...newLog, id: 'log-' + Date.now() };
    setLogs(prev => [log, ...prev]);
    try {
      await api.post('/api/logs', log);
    } catch (err) {
      console.error('Failed to save log:', err);
    }
  }, []);

  const handleUpdateHabits = useCallback(async (updated: Habit[]) => {
    setHabits(updated);
    // Find habits that changed completedDates and sync them
    updated.forEach(async (h) => {
      const prev = habits.find(p => p.id === h.id);
      if (!prev) {
        // New custom habit
        try { await api.post('/api/habits', h); } catch (e) { console.error(e); }
      } else if (JSON.stringify(prev.completedDates) !== JSON.stringify(h.completedDates)) {
        try { await api.patch(`/api/habits/${h.id}/complete`, { completedDates: h.completedDates }); } catch (e) { console.error(e); }
      }
    });
    // Handle deletions
    habits.forEach(async (prev) => {
      if (!updated.find(h => h.id === prev.id)) {
        try { await api.delete(`/api/habits/${prev.id}`); } catch (e) { console.error(e); }
      }
    });
  }, [habits]);

  const handleUpdatePlanner = useCallback(async (updated: PlannerDay[]) => {
    setPlanner(updated);
    try {
      await Promise.all(
        updated.map(day => api.put(`/api/planner/${day.dayName}`, day))
      );
    } catch (err) {
      console.error('Failed to save planner:', err);
    }
  }, []);

  const handleAddAttempt = useCallback(async (attempt: AttemptResult) => {
    setAttempts(prev => [attempt, ...prev]);
    try {
      await api.post('/api/attempts', attempt);
    } catch (err) {
      console.error('Failed to save attempt:', err);
    }
    if (attempt.score === attempt.totalQuestions && attempt.testTitle.includes('Sectional')) {
      handleUnlockAchievement('ach-math-expert');
    }
    if (attempt.totalQuestions > 10) {
      handleUnlockAchievement('ach-mock-pioneer');
    }
  }, []);

  const handleUnlockAchievement = useCallback((id: string) => {
    setAchievements(prev => prev.map(ach =>
      ach.id === id && !ach.unlockedAt
        ? { ...ach, unlockedAt: new Date().toISOString().split('T')[0] }
        : ach
    ));
  }, []);

  // ── Theme helpers ─────────────────────────────────────────────────────────

  const getThemeClasses = () => {
    if (stats.preferredTheme === 'dark')    return 'bg-slate-950 text-slate-100 dark';
    if (stats.preferredTheme === 'banking') return 'bg-slate-900 text-slate-100 bg-gradient-to-b from-blue-950 via-slate-950 to-slate-900';
    return 'bg-slate-50 text-slate-800';
  };

  const getAccentClass = (type: 'bg' | 'text' | 'border' | 'hoverBg') => {
    const keys = {
      indigo:  { bg: 'bg-indigo-600',  text: 'text-indigo-600 dark:text-indigo-400',  border: 'border-indigo-600',  hoverBg: 'hover:bg-indigo-700' },
      cyan:    { bg: 'bg-cyan-600',    text: 'text-cyan-600 dark:text-cyan-400',      border: 'border-cyan-600',    hoverBg: 'hover:bg-cyan-700' },
      rose:    { bg: 'bg-rose-600',    text: 'text-rose-600 dark:text-rose-450',      border: 'border-rose-600',    hoverBg: 'hover:bg-rose-700' },
      violet:  { bg: 'bg-violet-600',  text: 'text-violet-600 dark:text-violet-400',  border: 'border-violet-600',  hoverBg: 'hover:bg-violet-700' },
      emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-450',border: 'border-emerald-600', hoverBg: 'hover:bg-emerald-700' },
    };
    const color = (stats.accentColor in keys ? stats.accentColor : 'indigo') as keyof typeof keys;
    return keys[color][type];
  };

  // ── Loading screen ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-10 h-10 text-indigo-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-mono">Loading your data...</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getThemeClasses()}`}>

      {/* Header */}
      <header className="border-b border-slate-200/20 px-6 py-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white shadow-lg ${getAccentClass('bg')}`}>
              <Building2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-sans uppercase tracking-widest text-slate-100">Be A Banker</h1>
                <span className="bg-amber-400/20 text-amber-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">COMPETITIVE</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Personalized Exam Prep Companion for SBI, IBPS, and RBI Officers</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 p-2.5 rounded-xl border border-slate-700/30">

            {/* Theme selectors */}
            <div className="flex items-center gap-1.5 border-r border-slate-700/50 pr-3">
              <Sun    onClick={() => handleUpdateStats({ preferredTheme: 'light' })}   className={`w-4 h-4 cursor-pointer hover:scale-110 transition ${stats.preferredTheme === 'light'   ? 'text-amber-500' : 'text-slate-400'}`} title="Light Theme" />
              <Moon   onClick={() => handleUpdateStats({ preferredTheme: 'dark' })}    className={`w-4 h-4 cursor-pointer hover:scale-110 transition ${stats.preferredTheme === 'dark'    ? 'text-indigo-400' : 'text-slate-400'}`} title="Dark Theme" />
              <Building2 onClick={() => handleUpdateStats({ preferredTheme: 'banking' })} className={`w-4 h-4 cursor-pointer hover:scale-110 transition ${stats.preferredTheme === 'banking' ? 'text-cyan-400' : 'text-slate-400'}`} title="Banking Blue" />
            </div>

            {/* Accent color picker */}
            <div className="flex items-center gap-1 border-r border-slate-700/50 pr-3">
              {(['indigo', 'cyan', 'rose', 'violet', 'emerald'] as const).map(col => {
                const colorMap = { indigo: 'bg-indigo-500', cyan: 'bg-cyan-400', rose: 'bg-rose-500', violet: 'bg-violet-500', emerald: 'bg-emerald-500' };
                return (
                  <button key={col} onClick={() => handleUpdateStats({ accentColor: col })}
                    className={`w-3.5 h-3.5 rounded-full ${colorMap[col]} transition hover:scale-125 border ${stats.accentColor === col ? 'border-white scale-110' : 'border-transparent'}`}
                    title={`${col} accent`}
                  />
                );
              })}
            </div>

            {/* XP indicator */}
            <div className="flex items-center gap-1 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-350 font-semibold font-mono">{stats.xp} XP</span>
            </div>

          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Navigation tabs */}
        <div className="flex overflow-x-auto gap-2 bg-slate-900/30 p-2 rounded-2xl border border-slate-800/65 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard',         icon: LayoutDashboard },
            { id: 'routine',   label: 'Daily Routine',     icon: Calendar },
            { id: 'analytics', label: 'Consistency Audit', icon: BarChart3 },
            { id: 'milestones',label: 'Milestones & Badges',icon: Award },
          ].map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id as any)}
                className={`py-3 px-4 rounded-xl flex items-center gap-2 text-xs font-bold font-sans uppercase tracking-wider transition duration-300 select-none shrink-0 border ${
                  isActive ? `text-white border-transparent ${getAccentClass('bg')} shadow-lg` : 'text-slate-450 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'dashboard' && (
            <Dashboard
              logs={logs}
              stats={stats}
              onAddLog={handleAddLog}
              onUpdateStats={handleUpdateStats}
            />
          )}
          {activeTab === 'routine' && (
            <DailyRoutine
              stats={stats}
              onUpdateStats={handleUpdateStats}
              logs={logs}
              onAddLog={handleAddLog}
              habits={habits}
              onUpdateHabits={handleUpdateHabits}
            />
          )}
          {activeTab === 'analytics' && (
            <PerformanceAnalytics logs={logs} />
          )}
          {activeTab === 'milestones' && (
            <GamificationBadges
              stats={stats}
              achievements={achievements}
              onUpdateStats={handleUpdateStats}
              onUnlockAchievement={handleUnlockAchievement}
            />
          )}
        </div>

      </main>

      <footer className="border-t border-slate-800 px-6 py-6 mt-12 bg-slate-950/20 text-center">
        <p className="text-xs text-slate-500">
          Be A Banker • Your Personalized Banking Exam Preparation Companion © 2026
        </p>
      </footer>

    </div>
  );
}