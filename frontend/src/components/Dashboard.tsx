import React, { useState } from 'react';
import { 
  Flame, Clock, Award, BookOpen, Plus, ClipboardList, CheckCircle2, TrendingUp, Calendar, AlertCircle
} from 'lucide-react';
import { StudyLog, UserStats } from '../types';

interface DashboardProps {
  logs: StudyLog[];
  stats: UserStats;
  onAddLog: (log: Omit<StudyLog, 'id'>) => void;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

export default function Dashboard({ logs, stats, onAddLog, onUpdateStats }: DashboardProps) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [logSubject, setLogSubject] = useState<'Quant' | 'Reasoning' | 'English'>('Quant');
  const [logTopic, setLogTopic] = useState('');
  const [logType, setLogType] = useState<'Video' | 'Practice' | 'Revision'>('Practice');
  const [logDuration, setLogDuration] = useState('30');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.date === todayStr);
  const todayMinutes = todayLogs.reduce((acc, current) => acc + current.durationMinutes, 0);
  
  const totalMinutes = logs.reduce((acc, current) => acc + current.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const goalMinutes = stats.dailyStudyHoursGoal * 60;
  const todayProgressPercent = Math.min(100, Math.round((todayMinutes / (goalMinutes || 1)) * 105));

  // Subject breakdowns
  const quantMinutes = logs.filter(l => l.subject === 'Quant').reduce((acc, cur) => acc + cur.durationMinutes, 0);
  const reasoningMinutes = logs.filter(l => l.subject === 'Reasoning').reduce((acc, cur) => acc + cur.durationMinutes, 0);
  const englishMinutes = logs.filter(l => l.subject === 'English').reduce((acc, cur) => acc + cur.durationMinutes, 0);
  const overallMinutes = quantMinutes + reasoningMinutes + englishMinutes || 1;

  // Custom 28-day Heatmap calculations
  const getHeatmapDays = () => {
    const days = [];
    const dateCursor = new Date();
    // Offset by 27 days to get 28 days total
    dateCursor.setDate(dateCursor.getDate() - 27);

    for (let i = 0; i < 28; i++) {
      const curStr = dateCursor.toISOString().split('T')[0];
      const dayLogs = logs.filter(l => l.date === curStr);
      const dayMins = dayLogs.reduce((acc, cur) => acc + cur.durationMinutes, 0);
      days.push({
        date: curStr,
        minutes: dayMins,
        dayNum: dateCursor.getDate(),
        month: dateCursor.toLocaleString('default', { month: 'short' }),
        dayOfWeek: dateCursor.toLocaleString('default', { weekday: 'short' })
      });
      dateCursor.setDate(dateCursor.getDate() + 1);
    }
    return days;
  };

  const heatmapDays = getHeatmapDays();

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTopic.trim()) {
      setErrorMsg('Please specify a topic (e.g. Profit & Loss, Syllogism)');
      return;
    }
    const duration = parseInt(logDuration, 10);
    if (isNaN(duration) || duration <= 0) {
      setErrorMsg('Please enter a valid study duration in minutes');
      return;
    }

    onAddLog({
      date: todayStr,
      subject: logSubject,
      topic: logTopic.trim(),
      type: logType,
      durationMinutes: duration
    });

    // Add XP points (e.g., 2 XP per minute of study)
    const earnedXp = duration * 2;
    // Streak logic - verify if did study today and wasn't already in street history
    let newStreak = stats.streak;
    let newStreakHistory = [...stats.streakHistory];
    if (!stats.streakHistory.includes(todayStr)) {
      newStreakHistory.push(todayStr);
      // check if had study yesterday too
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (stats.streakHistory.includes(yesterdayStr) || stats.streak === 0) {
        newStreak = stats.streak + 1;
      } else {
        newStreak = 1; // broken streak reset
      }
    }

    onUpdateStats({
      xp: stats.xp + earnedXp,
      streak: newStreak,
      streakHistory: newStreakHistory
    });

    setLogTopic('');
    setErrorMsg('');
    setShowLogModal(false);
  };

  return (
    <div id="dashboard-tab" className="space-y-6">
      {/* Header and Streak summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <span className="bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1 rounded-full font-mono uppercase tracking-widest font-semibold border border-cyan-500/30">
            Prep Rank: {stats.level}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-slate-100">
            Welcome Back, Future Banker!
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Sustaining healthy study habits ensures high competitive rank percentiles. Tick off daily routines, review revision sheets, and consult the AI Habit Coach.
          </p>
        </div>

        {/* Level and XP summary card */}
        <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm self-start md:self-auto min-w-[220px]">
          <div className="bg-amber-500/20 p-3 rounded-lg text-amber-500 border border-amber-500/30">
            <Flame className="w-8 h-8 fill-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="text-sm text-slate-400 font-medium">Study Streak</div>
            <div className="text-2xl font-bold text-amber-400">{stats.streak} Days</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">{stats.xp} Total XP earned</div>
          </div>
        </div>
      </div>

      {/* Main Core Widgets (Progress & Subject Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Progress Ring Widget */}
        <div id="progress-goal-ring" className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-between min-h-[300px]">
          <div className="w-full">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Today's Target
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active tracking against your selected daily goal ({stats.dailyStudyHoursGoal} hours)
            </p>
          </div>

          <div className="relative w-40 h-40 flex items-center justify-center my-4">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * todayProgressPercent) / 100}
                className="text-blue-600 dark:text-blue-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{todayMinutes}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Minutes</div>
            </div>
          </div>

          <div className="text-center w-full">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {todayProgressPercent}% towards goal ({stats.dailyStudyHoursGoal * 60} mins)
            </span>
            <button 
              id="btn-log-study"
              onClick={() => setShowLogModal(true)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Log Study Minutes
            </button>
          </div>
        </div>

        {/* Total stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-2">
          {/* Total Study Hours */}
          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900/40 dark:to-slate-950 p-6 rounded-2xl border border-indigo-100/50 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="bg-indigo-500/10 w-10 h-10 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-4">Total Logged Time</h4>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{totalHours} Hours</p>
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 mt-4">
              <TrendingUp className="w-3.5 h-3.5" /> Tracked systematically across subjects
            </div>
          </div>

          {/* Practice Questions Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900/40 dark:to-slate-950 p-6 rounded-2xl border border-emerald-100/50 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="bg-emerald-500/10 w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-4">Habit Sessions Completed</h4>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">
                {logs.length} Sessions
              </p>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-4">
              <CheckCircle2 className="w-3.5 h-3.5" /> High consistency in registered study routines
            </div>
          </div>

          {/* Level Progress Rank badge info */}
          <div className="bg-gradient-to-br from-amber-50 to-white dark:from-slate-900/40 dark:to-slate-950 p-6 rounded-2xl border border-amber-100/50 dark:border-slate-800/80 shadow-sm flex flex-col justify-between col-span-1 sm:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold uppercase tracking-wide">Banking Progression</span>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">Level: {stats.level}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                  Earn XP by logging hours, finishing mock tests, completing math challenges, and memorizing terms.
                </p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-950/40 p-4 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                <Award className="w-8 h-8" />
              </div>
            </div>

            {/* Level progression helper bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mb-1">
                <span>{stats.xp} XP Earned</span>
                <span>Next level at {Math.max(2000, Math.ceil(stats.xp / 1000) * 1000)} XP</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (stats.xp % 1000) / 10)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject distribution indicator */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mt-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Subject Prep Share</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Aggregated distribution of all tracked study logs</p>

        {overallMinutes > 0 ? (
          <div className="mt-4 space-y-4">
            <div className="flex gap-2 h-4 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 transition-all" 
                style={{ width: `${(quantMinutes / overallMinutes) * 100}%` }}
                title={`Quant: ${quantMinutes} mins`}
              ></div>
              <div 
                className="bg-indigo-500 transition-all" 
                style={{ width: `${(reasoningMinutes / overallMinutes) * 100}%` }}
                title={`Reasoning: ${reasoningMinutes} mins`}
              ></div>
              <div 
                className="bg-rose-500 transition-all" 
                style={{ width: `${(englishMinutes / overallMinutes) * 100}%` }}
                title={`English: ${englishMinutes} mins`}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-1 text-center">
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block"></span> Quant
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {Math.round((quantMinutes / overallMinutes) * 100)}% ({quantMinutes} min)
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block"></span> Reasoning
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {Math.round((reasoningMinutes / overallMinutes) * 100)}% ({reasoningMinutes} min)
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block"></span> English
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {Math.round((englishMinutes / overallMinutes) * 100)}% ({englishMinutes} min)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-sm">
            No study sessions logged yet. Use the button above to begin!
          </div>
        )}
      </div>

      {/* Feature 10: Study Consistency Heatmap Widget */}
      <div id="study-heatmap-widget" className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Prep Intensity Heatmap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualizes continuous preparation. Click cells to view logged dates.
            </p>
          </div>
          {/* Heatmap legend keys */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/80">
            <span>Missed</span>
            <span className="w-2.5 h-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm"></span>
            <span className="w-2.5 h-2.5 bg-blue-200 dark:bg-blue-900/50 rounded-sm"></span>
            <span className="w-2.5 h-2.5 bg-blue-400 dark:bg-blue-600 rounded-sm"></span>
            <span className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-400 rounded-sm"></span>
            <span>Intense</span>
          </div>
        </div>

        {/* 28-day horizontal cell grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px] grid grid-cols-7 gap-2.5 py-2">
            {heatmapDays.map((day, idx) => {
              // Decide background color depending on study hours logged
              let bgClass = "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700/50 hover:scale-105 active:scale-95";
              let minutesLabel = "0 minutes";
              if (day.minutes > 0) {
                minutesLabel = `${day.minutes} minutes`;
                if (day.minutes < 30) {
                  bgClass = "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 hover:scale-105 active:scale-95";
                } else if (day.minutes < 60) {
                  bgClass = "bg-blue-300 dark:bg-blue-800/70 text-blue-800 dark:text-blue-200 border border-blue-400 dark:border-blue-700/50 hover:scale-105 active:scale-95";
                } else {
                  bgClass = "bg-blue-600 dark:bg-blue-500 text-white border border-blue-700 dark:border-blue-400 hover:scale-105 active:scale-95";
                }
              }

              return (
                <div 
                  key={idx}
                  title={`${day.date}: ${minutesLabel}`}
                  className={`p-3 rounded-xl transition-all cursor-pointer flex flex-col justify-between h-20 shadow-sm ${bgClass}`}
                >
                  <span className="text-[10px] font-mono font-medium block uppercase tracking-wider">{day.dayOfWeek}</span>
                  <div className="text-right">
                    <span className="text-sm font-black block">{day.dayNum}</span>
                    <span className="text-[9px] uppercase tracking-tighter opacity-80">{day.month}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Log Activity Modal Dialog */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-2xl max-w-lg w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" /> Log Banking Study Session
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add lectures, mock practice hours, or vocabulary revision to accumulate XP points!
            </p>

            {errorMsg && (
              <div className="mt-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-lg flex items-center gap-2 border border-rose-100 dark:border-rose-900/30">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveLog} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['Quant', 'Reasoning', 'English'] as const).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setLogSubject(sub)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        logSubject === sub 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Activity Type</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['Video', 'Practice', 'Revision'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLogType(type)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        logType === type 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Topic Studied</label>
                <input
                  type="text"
                  placeholder="e.g. Percentage, Blood Relations, Reading Comprehension"
                  value={logTopic}
                  onChange={(e) => setLogTopic(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Duration (Minutes)</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {['15', '30', '45', '60', '90', '120'].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setLogDuration(mins)}
                      className={`py-2 rounded-lg text-xs font-bold border transition ${
                        logDuration === mins 
                          ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                  <input
                    type="number"
                    placeholder="Custom"
                    value={['15', '30', '45', '60', '90', '120'].includes(logDuration) ? '' : logDuration}
                    onChange={(e) => setLogDuration(e.target.value)}
                    className="p-1 px-2 border rounded-lg text-center text-xs text-slate-800 dark:text-slate-200 dark:bg-slate-950 select-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogModal(false);
                    setErrorMsg('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
                >
                  Save Log (+{parseInt(logDuration || '0', 10) * 2 || 0} XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
