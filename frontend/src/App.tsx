import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, LayoutDashboard, Calendar, Award, BarChart3, Sparkles, Sun, Moon,
  LogOut, Settings, Trash2, X, AlertTriangle, Loader2,
} from 'lucide-react';

import { StudyLog, UserStats, PlannerDay, AttemptResult, Achievement, Habit } from './types';
import { INITIAL_ACHIEVEMENTS, INITIAL_HABITS } from './data';
import { api } from './api';
import { useAuth } from './auth/AuthProvider';
import AuthPage from './pages/AuthPage';

import Dashboard from './components/Dashboard';
import DailyRoutine from './components/DailyRoutine';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import GamificationBadges from './components/GamificationBadges';

// ── Default stats ────────────────────────────────────────────────────────────

const DEFAULT_STATS: UserStats = {
  xp: 0, level: 'Beginner Banker', streak: 0, streakHistory: [],
  dailyStudyHoursGoal: 4, weeklyPracticeHoursGoal: 12,
  monthlyMockTestsGoal: 5, targetExamScore: 78,
  preferredTheme: 'banking', accentColor: 'indigo',
};

// ── AppShell — only renders when session exists ───────────────────────────────

function AppShell() {
  const { user, signOut } = useAuth();

  const [loading,      setLoading]      = useState(true);
  const [logs,         setLogs]         = useState<StudyLog[]>([]);
  const [stats,        setStats]        = useState<UserStats>(DEFAULT_STATS);
  const [planner,      setPlanner]      = useState<PlannerDay[]>([]);
  const [attempts,     setAttempts]     = useState<AttemptResult[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [habits,       setHabits]       = useState<Habit[]>([]);
  const [activeTab,      setActiveTab]      = useState<'dashboard' | 'routine' | 'analytics' | 'milestones'>('dashboard');
  const [showSettings,   setShowSettings]   = useState(false);
  const [resetConfirm,   setResetConfirm]   = useState(false);
  const [resetting,      setResetting]      = useState(false);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
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

        if (fetchedHabits.length === 0) {
          const seeded = await Promise.all(
            INITIAL_HABITS.map((h: Habit) => api.post('/api/habits', h))
          );
          setHabits(seeded);
        } else {
          setHabits(fetchedHabits);
        }
      } catch (err) {
        console.error('Bootstrap failed:', err);
        setHabits(INITIAL_HABITS);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  // ── Auto level-up ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    let level: UserStats['level'] = 'Beginner Banker';
    if      (stats.xp >= 3000) level = 'Future Banker';
    else if (stats.xp >= 2005) level = 'Banking Expert';
    else if (stats.xp >= 1200) level = 'Probationary Officer';
    else if (stats.xp >= 500)  level = 'Clerk Aspirant';
    if (stats.level !== level) {
      handleUpdateStats({ level });
      if (level === 'Probationary Officer') handleUnlockAchievement('ach-level-PO');
    }
  }, [stats.xp, loading]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleUpdateStats = useCallback(async (partial: Partial<UserStats>) => {
    const updated = { ...stats, ...partial };
    setStats(updated);
    try { await api.put('/api/stats', updated); }
    catch (err) { console.error('Save stats failed:', err); }
  }, [stats]);

  const handleAddLog = useCallback(async (newLog: Omit<StudyLog, 'id'>) => {
    const log: StudyLog = { ...newLog, id: 'log-' + Date.now() };
    setLogs(prev => [log, ...prev]);
    try { await api.post('/api/logs', log); }
    catch (err) { console.error('Save log failed:', err); }
  }, []);

  const handleUpdateHabits = useCallback(async (updated: Habit[]) => {
    setHabits(updated);
    for (const h of updated) {
      const prev = habits.find(p => p.id === h.id);
      if (!prev) {
        try { await api.post('/api/habits', h); } catch (e) { console.error(e); }
      } else if (JSON.stringify(prev.completedDates) !== JSON.stringify(h.completedDates)) {
        try { await api.patch(`/api/habits/${h.id}/complete`, { completedDates: h.completedDates }); } catch (e) { console.error(e); }
      }
    }
    for (const prev of habits) {
      if (!updated.find(h => h.id === prev.id)) {
        try { await api.delete(`/api/habits/${prev.id}`); } catch (e) { console.error(e); }
      }
    }
  }, [habits]);

  const handleUpdatePlanner = useCallback(async (updated: PlannerDay[]) => {
    setPlanner(updated);
    try {
      await Promise.all(updated.map(day => api.put(`/api/planner/${day.dayName}`, day)));
    } catch (err) { console.error('Save planner failed:', err); }
  }, []);

  const handleAddAttempt = useCallback(async (attempt: AttemptResult) => {
    setAttempts(prev => [attempt, ...prev]);
    try { await api.post('/api/attempts', attempt); }
    catch (err) { console.error('Save attempt failed:', err); }
    if (attempt.score === attempt.totalQuestions && attempt.testTitle.includes('Sectional'))
      handleUnlockAchievement('ach-math-expert');
    if (attempt.totalQuestions > 10)
      handleUnlockAchievement('ach-mock-pioneer');
  }, []);

  const handleUnlockAchievement = useCallback((id: string) => {
    setAchievements(prev => prev.map(a =>
      a.id === id && !a.unlockedAt
        ? { ...a, unlockedAt: new Date().toISOString().split('T')[0] }
        : a
    ));
  }, []);

  const handleReset = useCallback(async () => {
    setResetting(true);
    try {
      await api.post('/api/reset', {});

      // Re-seed habits first, then update local state with the result
      const seeded = await Promise.all(
        INITIAL_HABITS.map((h: Habit) => api.post('/api/habits', h))
      );

      // Only update state after all API calls succeed
      setLogs([]);
      setStats(DEFAULT_STATS);
      setPlanner([]);
      setAttempts([]);
      setHabits(seeded);
      setAchievements(INITIAL_ACHIEVEMENTS);
      setActiveTab('dashboard');
      setResetConfirm(false);
      setShowSettings(false);
    } catch (err) {
      console.error('Reset failed:', err);
      alert('Reset failed. Please try again.');
    } finally {
      setResetting(false);
    }
  }, []);

  // ── Theme ─────────────────────────────────────────────────────────────────

  const getThemeClasses = () => {
    if (stats.preferredTheme === 'dark')    return 'bg-slate-950 text-slate-100 dark';
    if (stats.preferredTheme === 'banking') return 'bg-slate-900 text-slate-100 bg-gradient-to-b from-blue-950 via-slate-950 to-slate-900';
    return 'bg-slate-50 text-slate-800';
  };

  const getAccentClass = (type: 'bg' | 'text' | 'border' | 'hoverBg') => {
    const keys = {
      indigo:  { bg: 'bg-indigo-600',  text: 'text-indigo-600',  border: 'border-indigo-600',  hoverBg: 'hover:bg-indigo-700' },
      cyan:    { bg: 'bg-cyan-600',    text: 'text-cyan-600',    border: 'border-cyan-600',    hoverBg: 'hover:bg-cyan-700' },
      rose:    { bg: 'bg-rose-600',    text: 'text-rose-600',    border: 'border-rose-600',    hoverBg: 'hover:bg-rose-700' },
      violet:  { bg: 'bg-violet-600',  text: 'text-violet-600',  border: 'border-violet-600',  hoverBg: 'hover:bg-violet-700' },
      emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', hoverBg: 'hover:bg-emerald-700' },
    };
    const color = (stats.accentColor in keys ? stats.accentColor : 'indigo') as keyof typeof keys;
    return keys[color][type];
  };

  // ── Data loading screen ───────────────────────────────────────────────────

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

            {/* Theme */}
            <div className="flex items-center gap-1.5 border-r border-slate-700/50 pr-3">
              <Sun       onClick={() => handleUpdateStats({ preferredTheme: 'light' })}   className={`w-4 h-4 cursor-pointer hover:scale-110 transition ${stats.preferredTheme === 'light'   ? 'text-amber-500'  : 'text-slate-400'}`} aria-label="Light" />
              <Moon      onClick={() => handleUpdateStats({ preferredTheme: 'dark' })}    className={`w-4 h-4 cursor-pointer hover:scale-110 transition ${stats.preferredTheme === 'dark'    ? 'text-indigo-400' : 'text-slate-400'}`} aria-label="Dark" />
              <Building2 onClick={() => handleUpdateStats({ preferredTheme: 'banking' })} className={`w-4 h-4 cursor-pointer hover:scale-110 transition ${stats.preferredTheme === 'banking' ? 'text-cyan-400'   : 'text-slate-400'}`} aria-label="Banking Blue" />
            </div>

            {/* Accent */}
            <div className="flex items-center gap-1 border-r border-slate-700/50 pr-3">
              {(['indigo','cyan','rose','violet','emerald'] as const).map(col => {
                const colorMap = { indigo:'bg-indigo-500', cyan:'bg-cyan-400', rose:'bg-rose-500', violet:'bg-violet-500', emerald:'bg-emerald-500' };
                return (
                  <button key={col} onClick={() => handleUpdateStats({ accentColor: col })}
                    className={`w-3.5 h-3.5 rounded-full ${colorMap[col]} transition hover:scale-125 border ${stats.accentColor === col ? 'border-white scale-110' : 'border-transparent'}`}
                    title={col}
                  />
                );
              })}
            </div>

            {/* XP */}
            <div className="flex items-center gap-1 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-300 font-semibold font-mono">{stats.xp} XP</span>
            </div>

            {/* User + settings + sign out */}
            <div className="flex items-center gap-2 border-l border-slate-700/50 pl-3">
              <span className="text-xs text-slate-400 hidden sm:block truncate max-w-35">{user?.email}</span>
              <button onClick={() => { setShowSettings(true); setResetConfirm(false); }} title="Settings" className="text-slate-400 hover:text-slate-200 transition">
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={signOut} title="Sign out" className="text-slate-400 hover:text-red-400 transition">
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">

            {/* Modal header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-100">Settings</h2>
              </div>
              <button onClick={() => { setShowSettings(false); setResetConfirm(false); }} className="text-slate-400 hover:text-slate-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account section */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Account</p>
              <div className="bg-slate-800/60 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-200 font-medium">{user?.email}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Signed in via Supabase</p>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Danger Zone</p>
              <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-300">Reset All Data</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Permanently deletes all your study logs, habits, planner tasks, mock test attempts, and XP. This cannot be undone.
                    </p>
                  </div>
                </div>

                {!resetConfirm ? (
                  <button
                    onClick={() => setResetConfirm(true)}
                    className="w-full py-2.5 rounded-xl border border-red-700/60 text-red-400 text-sm font-semibold hover:bg-red-900/40 transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Reset All Data
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-center text-amber-400 font-medium">Are you sure? This is irreversible.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setResetConfirm(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReset}
                        disabled={resetting}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold transition flex items-center justify-center gap-2"
                      >
                        {resetting
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Resetting…</>
                          : <><Trash2 className="w-3.5 h-3.5" /> Yes, Reset</>
                        }
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 bg-slate-900/30 p-2 rounded-2xl border border-slate-800/65 mb-8">
          {[
            { id: 'dashboard',  label: 'Dashboard',          icon: LayoutDashboard },
            { id: 'routine',    label: 'Daily Routine',      icon: Calendar },
            { id: 'analytics',  label: 'Consistency Audit',  icon: BarChart3 },
            { id: 'milestones', label: 'Milestones & Badges', icon: Award },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`py-3 px-4 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition duration-300 select-none shrink-0 border ${
                activeTab === id
                  ? `text-white border-transparent ${getAccentClass('bg')} shadow-lg`
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'dashboard'  && <Dashboard logs={logs} stats={stats} onAddLog={handleAddLog} onUpdateStats={handleUpdateStats} onReset={handleReset} />}
          {activeTab === 'routine'    && <DailyRoutine stats={stats} onUpdateStats={handleUpdateStats} logs={logs} onAddLog={handleAddLog} habits={habits} onUpdateHabits={handleUpdateHabits} />}
          {activeTab === 'analytics'  && <PerformanceAnalytics logs={logs} />}
          {activeTab === 'milestones' && <GamificationBadges stats={stats} achievements={achievements} onUpdateStats={handleUpdateStats} onUnlockAchievement={handleUnlockAchievement} />}
        </div>

      </main>

      <footer className="border-t border-slate-800 px-6 py-6 mt-12 bg-slate-950/20 text-center">
        <p className="text-xs text-slate-500">Be A Banker • Your Personalized Banking Exam Preparation Companion © 2026</p>
      </footer>

    </div>
  );
}

// ── App — auth gate ───────────────────────────────────────────────────────────

export default function App() {
  const { session, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-10 h-10 text-indigo-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-mono">Loading...</p>
        </div>
      </div>
    );
  }

  return session ? <AppShell /> : <AuthPage />;
}