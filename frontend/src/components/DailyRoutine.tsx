import React, { useState } from 'react';
import { 
  CheckCircle2, Plus, Flame, Clock, RefreshCw, BookOpen, Calculator, Compass, Sparkles, Trash2, ChevronRight, Bookmark, AlertCircle, BookOpenCheck
} from 'lucide-react';
import { Habit, StudyLog, UserStats, VocabularyWord, FormulaCard, PuzzleChallenge } from '../types';
import { INITIAL_VOCABULARY, INITIAL_FORMULAS, INITIAL_PUZZLES } from '../data';

interface DailyRoutineProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  logs: StudyLog[];
  onAddLog: (log: Omit<StudyLog, 'id'>) => void;
  habits: Habit[];
  onUpdateHabits: (habits: Habit[]) => void;
}

export default function DailyRoutine({ 
  stats, 
  onUpdateStats, 
  logs, 
  onAddLog, 
  habits, 
  onUpdateHabits 
}: DailyRoutineProps) {
  const [activeTab, setActiveTab] = useState<'checklist' | 'manage' | 'vault'>('checklist');
  
  // Custom Habit Creator Form State
  const [customName, setCustomName] = useState('');
  const [customSubject, setCustomSubject] = useState<'Quant' | 'Reasoning' | 'English' | 'General'>('Quant');
  const [customType, setCustomType] = useState<'Video' | 'Practice' | 'Revision'>('Practice');
  const [customDuration, setCustomDuration] = useState('30');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Interactive Vault State (Helper cards inside Habits list)
  const [vocabIndex, setVocabIndex] = useState(0);
  const [formulaIdx, setFormulaIdx] = useState(0);
  const [puzzleIdx, setPuzzleIdx] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];

  // Create customized habits
  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setErrorMsg('Habit name cannot be blank.');
      return;
    }
    const mins = parseInt(customDuration, 10);
    if (isNaN(mins) || mins <= 0) {
      setErrorMsg('Duration must be a positive integer.');
      return;
    }

    const newHabit: Habit = {
      id: 'habit-' + Date.now(),
      name: customName.trim(),
      subject: customSubject,
      type: customType,
      durationMinutes: mins,
      completedDates: [],
      isCustom: true
    };

    onUpdateHabits([...habits, newHabit]);
    setCustomName('');
    setSuccessMsg('Custom habit successfully registered in daily routine!');
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteHabit = (id: string) => {
    onUpdateHabits(habits.filter(h => h.id !== id));
    setConfirmDeleteId(null);
  };

  // Check off or Uncheck a habit
  const handleToggleHabitCompletion = (habit: Habit) => {
    const isCompletedStr = habit.completedDates.includes(todayStr);
    let updatedCompletedDates = [...habit.completedDates];

    if (isCompletedStr) {
      // Unchecking: remove date from list
      updatedCompletedDates = updatedCompletedDates.filter(d => d !== todayStr);
      // Subtract XP points (2 XP per duration minute)
      const penaltyXp = habit.durationMinutes * 2;
      onUpdateStats({ 
        xp: Math.max(0, stats.xp - penaltyXp)
      });
    } else {
      // Checking: add date
      updatedCompletedDates.push(todayStr);
      // Log as a StudyLog instantly to keep Stats Heatmap updated!
      onAddLog({
        date: todayStr,
        subject: habit.subject === 'General' ? 'English' : habit.subject as any,
        topic: `Completed habit: ${habit.name}`,
        type: habit.type,
        durationMinutes: habit.durationMinutes
      });

      // Award XP points
      const awardedXp = habit.durationMinutes * 2 + 10; // extra habit bonus
      
      // Update streak history and current count
      let newStreak = stats.streak;
      let newStreakHistory = [...stats.streakHistory];
      if (!stats.streakHistory.includes(todayStr)) {
        newStreakHistory.push(todayStr);
        // check if yesterday was completed
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (stats.streakHistory.includes(yesterdayStr) || stats.streak === 0) {
          newStreak = stats.streak + 1;
        } else {
          newStreak = 1;
        }
      }

      onUpdateStats({
        xp: stats.xp + awardedXp,
        streak: newStreak,
        streakHistory: newStreakHistory
      });
    }

    // Save modifications back
    onUpdateHabits(habits.map(h => h.id === habit.id ? { ...h, completedDates: updatedCompletedDates } : h));
  };

  // Calculate stats for today
  const completedTodayList = habits.filter(h => h.completedDates.includes(todayStr));
  const completionRateToday = habits.length > 0 
    ? Math.round((completedTodayList.length / habits.length) * 100) 
    : 0;

  return (
    <div id="daily-routine-tab" className="space-y-6">
      
      {/* Top Header Information */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-3 py-1 rounded-full font-mono font-semibold uppercase tracking-widest border border-emerald-500/20">
            Micro-Learning Engine
          </span>
          <h2 className="text-2xl font-black mt-2 text-slate-100 flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-emerald-400" /> Daily Habits Planner
          </h2>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Success in PO and Clerk exams is built on small, continuous efforts. Establish study routines, review formula cards, and check off habits daily to cement preparation.
          </p>
        </div>

        {/* Dynamic Habit Completion Ring info */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center gap-4 min-w-[200px]">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-500"
                strokeDasharray={`${completionRateToday}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute font-mono text-slate-200 text-xs font-bold">{completionRateToday}%</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Today's Habits</div>
            <div className="text-sm font-extrabold text-slate-200">
              {completedTodayList.length} of {habits.length} Done
            </div>
          </div>
        </div>
      </div>

      {/* Internal Menu Toggles */}
      <div className="flex gap-2 border-b border-slate-800/80 pb-0.5">
        {[
          { id: 'checklist', label: 'Today\'s Checklist', badge: habits.length - completedTodayList.length },
          { id: 'manage', label: 'Build Habits', badge: null },
          { id: 'vault', label: 'Study & Revision Vault', badge: null }
        ].map((subTab) => (
          <button
            key={subTab.id}
            onClick={() => setActiveTab(subTab.id as any)}
            className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider relative transition-colors ${
              activeTab === subTab.id 
                ? 'text-emerald-400 font-extrabold border-b-2 border-emerald-500' 
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <span>{subTab.label}</span>
            {subTab.badge !== null && subTab.badge > 0 && (
              <span className="ml-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                {subTab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sub Tabs Content rendered */}
      {activeTab === 'checklist' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Habit Checklist col-span-2 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450">Active Routine Checklist</h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +{completedTodayList.reduce((acc, h) => acc + h.durationMinutes * 2 + 10, 0)} potential XP today
                </span>
              </div>

              {habits.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  <p>Your habit routine is empty!</p>
                  <button 
                    onClick={() => setActiveTab('manage')}
                    className="mt-3 text-xs font-bold text-emerald-400 hover:underline"
                  >
                    + Establish some healthy banking study habits now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {habits.map((habit) => {
                    const done = habit.completedDates.includes(todayStr);
                    const subjectColors = {
                      Quant: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      Reasoning: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                      English: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                      General: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    };

                    return (
                      <div 
                        key={habit.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          done 
                            ? 'bg-emerald-950/20 border-emerald-900/50 opacity-75' 
                            : 'bg-slate-900/60 border-slate-800/85 hover:border-slate-700/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            id={`btn-check-${habit.id}`}
                            onClick={() => handleToggleHabitCompletion(habit)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                              done 
                                ? 'bg-emerald-500/25 border-emerald-500 text-emerald-400' 
                                : 'border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/5 text-transparent'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4 fill-current text-white/10" />
                          </button>
                          
                          <div>
                            <span className={`text-sm font-bold ${done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {habit.name}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${subjectColors[habit.subject]}`}>
                                {habit.subject}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> {habit.durationMinutes} mins
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                • {habit.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right side: complete status + delete */}
                        <div className="flex items-center gap-2">
                          {done ? (
                            <span className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                              Complete
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleHabitCompletion(habit)}
                              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition"
                            >
                              Check Off
                            </button>
                          )}

                          {/* Delete button */}
                          {confirmDeleteId === habit.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteHabit(habit.id)}
                                className="text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[10px] font-bold text-slate-400 hover:text-slate-200 bg-slate-700 px-2 py-1 rounded transition"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(habit.id)}
                              className="text-slate-600 hover:text-red-400 transition p-1 rounded hover:bg-red-400/10"
                              title="Delete habit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Micro Quick Hacks */}
            <div className="bg-gradient-to-r from-blue-950/20 to-slate-900/40 p-5 rounded-2xl border border-slate-800/80">
              <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">Aspirant Habit Science</h4>
              <p className="text-xs text-slate-350 leading-relaxed mt-2">
                "It takes 21 days to form a habit and 3 Months to turn it into a banking exam success statement." Checking off habits registers actual session logs, keeps your heatmap green, and multiplies your status metrics. Start with short <span className="font-semibold text-white">15-minute intervals</span> for consistency over intensity.
              </p>
            </div>
          </div>

          {/* Side Acceleration Vault Checklist */}
          <div className="space-y-6">
            <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">Quick-Launch Habit Help</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                No external notes? Use our dynamic revision decks below to execute your dailies right here!
              </p>

              <div className="space-y-4">
                
                {/* 1. Vocabulary deck helper */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#fc3d64]">E-NEWS FLASHCARD</span>
                    <span className="text-[10px] text-slate-500 font-mono">Word {vocabIndex + 1}/{INITIAL_VOCABULARY.length}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-200">{INITIAL_VOCABULARY[vocabIndex].word}</h4>
                  <p className="text-xs text-slate-400 mt-1 italic">"{INITIAL_VOCABULARY[vocabIndex].meaning}"</p>
                  <p className="text-[11px] text-slate-500 mt-2 bg-slate-900/40 p-2 rounded">
                    <strong>Usage:</strong> {INITIAL_VOCABULARY[vocabIndex].example}
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800/50">
                    <button 
                      onClick={() => setVocabIndex((vocabIndex + 1) % INITIAL_VOCABULARY.length)}
                      className="text-[10px] font-bold text-rose-400 hover:underline flex items-center gap-0.5"
                    >
                      Next word <ChevronRight className="w-3 h-3" />
                    </button>
                    <span className="text-[9px] uppercase font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                      Subject: English
                    </span>
                  </div>
                </div>

                {/* 2. Formula deck helper */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#2fafee]">MATH ACCELERATOR</span>
                    <span className="text-[10px] text-slate-500 font-mono">Rule {formulaIdx + 1}/{INITIAL_FORMULAS.length}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-200">{INITIAL_FORMULAS[formulaIdx].title}</h4>
                  <div className="bg-slate-900/90 p-2 rounded-lg font-mono text-xs text-cyan-400 border border-slate-800 mt-2 text-center select-all">
                    {INITIAL_FORMULAS[formulaIdx].formula}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">{INITIAL_FORMULAS[formulaIdx].description}</p>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800/50">
                    <button 
                      onClick={() => setFormulaIdx((formulaIdx + 1) % INITIAL_FORMULAS.length)}
                      className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-0.5"
                    >
                      Next key formula <ChevronRight className="w-3 h-3" />
                    </button>
                    <span className="text-[9px] uppercase font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                      Subject: Quant
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      )}

      {activeTab === 'manage' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Custom Habit Creator Form Component */}
          <div className="bg-slate-900/20 p-6 rounded-2xl border border-slate-800 max-w-xl lg:col-span-2">
            <h3 className="text-md font-bold text-slate-200 mb-2">Register Custom Daily Habit</h3>
            <p className="text-xs text-slate-500 mb-6">Create micro-routines tailored to your target weaknesses. E.g. "Draft 3 Circular arrangements" or "Read Banking Gazettes Daily".</p>

            {errorMsg && (
              <div className="mb-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs p-3 rounded-lg flex items-center gap-2 animate-pulse">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Habit Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Try to solve 5 Data Interpretation sets"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Focus Domain</label>
                  <select
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value as any)}
                    className="w-full text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Quant">Quantitative Aptitude</option>
                    <option value="Reasoning">Reasoning Ability</option>
                    <option value="English">Verbal English Language</option>
                    <option value="General">Banking & Financial Awareness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Syllabus Type</label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value as any)}
                    className="w-full text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Practice">Practice Worksheets</option>
                    <option value="Revision">Revision / Memorization</option>
                    <option value="Video">Video / Conceptual Lectures</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 pt-1">Planned Micro-Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {['15', '30', '45', '60'].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setCustomDuration(mins)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                        customDuration === mins 
                          ? 'bg-emerald-500 border-transparent text-slate-950' 
                          : 'bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  <Plus className="w-4 h-4 text-slate-950" /> Add Habit to Daily Routine
                </button>
              </div>
            </form>
          </div>

          {/* Active habits management directory */}
          <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 mb-4">Manage Routine List</h3>
            <p className="text-xs text-slate-500 mb-4">You can remove custom habits or prune the schedule here.</p>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {habits.map((h) => (
                <div key={h.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                  <div>
                    <div className="text-xs font-bold text-slate-200 line-clamp-1">{h.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">{h.subject} • {h.durationMinutes} mins</div>
                  </div>
                  {h.isCustom ? (
                    <button
                      onClick={() => handleDeleteHabit(h.id)}
                      className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded">Core</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'vault' && (
        <div className="space-y-6">
          <div className="bg-slate-900/10 p-4 rounded-xl border border-slate-800 text-[13px] text-slate-400">
            Access core theoretical resources to cover your revision and video reading habits offline of external files.
          </div>

          {/* Full-width Grid content decks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. vocabulary deck */}
            <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[#fc3d64] bg-[#fc3d64]/10 border border-[#fc3d64]/20 text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  English Vocab Ledger
                </span>
                <p className="text-xs text-slate-400 mt-2 mb-4">Review these high-frequency terminology items to verify verbal readiness.</p>

                <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-center text-[10px] text-indigo-400 font-mono mb-2">
                    <span>STATUS: HIGH LEVEL</span>
                    <span>#{vocabIndex + 1} of {INITIAL_VOCABULARY.length}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-100">{INITIAL_VOCABULARY[vocabIndex].word}</h4>
                  <p className="text-xs text-slate-350 italic">"{INITIAL_VOCABULARY[vocabIndex].meaning}"</p>
                  <p className="text-xs text-slate-450 bg-slate-900/60 p-2.5 rounded-lg">
                    <strong>Sample Sentence:</strong> {INITIAL_VOCABULARY[vocabIndex].example}
                  </p>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500">Synonyms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {INITIAL_VOCABULARY[vocabIndex].synonyms.map(syn => (
                        <span key={syn} className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono">{syn}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-center mt-4 pt-2">
                <button
                  onClick={() => setVocabIndex((vocabIndex - 1 + INITIAL_VOCABULARY.length) % INITIAL_VOCABULARY.length)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setVocabIndex((vocabIndex + 1) % INITIAL_VOCABULARY.length)}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs py-2 rounded-xl transition"
                >
                  Next Word
                </button>
              </div>
            </div>

            {/* 2. Math Formula ledger */}
            <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  Quantitative Math Rules
                </span>
                <p className="text-xs text-slate-400 mt-2 mb-4">Formula and equation cheatsheets for DI, Arithmetic, and Algebra.</p>

                <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-center text-[10px] text-cyan-400 font-mono mb-2">
                    <span>SHORTCUT LEDGER</span>
                    <span>#{formulaIdx + 1} of {INITIAL_FORMULAS.length}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{INITIAL_FORMULAS[formulaIdx].title}</h4>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-cyan-400 text-center select-all">
                    {INITIAL_FORMULAS[formulaIdx].formula}
                  </div>
                  <p className="text-xs text-slate-350">{INITIAL_FORMULAS[formulaIdx].description}</p>
                  <p className="text-xs text-slate-450 bg-slate-900/60 p-2.5 rounded-lg">
                    <strong>Demo:</strong> {INITIAL_FORMULAS[formulaIdx].example}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-center mt-4 pt-2">
                <button
                  onClick={() => setFormulaIdx((formulaIdx - 1 + INITIAL_FORMULAS.length) % INITIAL_FORMULAS.length)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFormulaIdx((formulaIdx + 1) % INITIAL_FORMULAS.length)}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white text-xs py-2 rounded-xl transition text-center"
                >
                  Next Formula
                </button>
              </div>
            </div>

            {/* 3. Logical Puzzles study ledger */}
            <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  Reasoning Puzzle Guides
                </span>
                <p className="text-xs text-slate-400 mt-2 mb-4">Learn circular, floor, scheduling arrangements structures.</p>

                <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-center text-[10px] text-indigo-400 font-mono mb-2">
                    <span>SCHEMA ARRAYS</span>
                    <span>#{puzzleIdx + 1} of {INITIAL_PUZZLES.length}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{INITIAL_PUZZLES[puzzleIdx].title}</h4>
                  <p className="text-xs text-slate-350">{INITIAL_PUZZLES[puzzleIdx].description}</p>
                  
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Clues Ledger:</span>
                    <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                      {INITIAL_PUZZLES[puzzleIdx].dataPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-center mt-4 pt-2">
                <button
                  onClick={() => setPuzzleIdx((puzzleIdx - 1 + INITIAL_PUZZLES.length) % INITIAL_PUZZLES.length)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPuzzleIdx((puzzleIdx + 1) % INITIAL_PUZZLES.length)}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs py-2 rounded-xl transition"
                >
                  Next Guide
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}