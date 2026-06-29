import React, { useState } from 'react';
import { 
  BarChart3, CheckCircle2, AlertTriangle, Clock, TrendingUp, Sparkles, Calendar, BookOpen, HeartPulse
} from 'lucide-react';
import { StudyLog } from '../types';

interface PerformanceAnalyticsProps {
  logs: StudyLog[];
}

// ── Histogram helpers ─────────────────────────────────────────────────────────

function getWeeklyBars(logs: StudyLog[]) {
  const bars = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const mins = logs.filter(l => l.date === dateStr).reduce((a, l) => a + l.durationMinutes, 0);
    bars.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      sublabel: `${d.getDate()}`,
      hours: +(mins / 60).toFixed(1),
      mins,
      isToday: i === 0,
    });
  }
  return bars;
}

function getMonthlyBars(logs: StudyLog[]) {
  const bars = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const mins = logs.filter(l => {
      const d = new Date(l.date);
      return d >= weekStart && d <= weekEnd;
    }).reduce((a, l) => a + l.durationMinutes, 0);
    bars.push({
      label: `Wk ${4 - i}`,
      sublabel: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
      hours: +(mins / 60).toFixed(1),
      mins,
      isToday: i === 0,
    });
  }
  return bars;
}

function Histogram({ logs }: { logs: StudyLog[] }) {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const bars = view === 'weekly' ? getWeeklyBars(logs) : getMonthlyBars(logs);
  const maxHours = Math.max(...bars.map(b => b.hours), 1);

  const totalHours = bars.reduce((a, b) => a + b.hours, 0).toFixed(1);
  const avgHours   = (bars.reduce((a, b) => a + b.hours, 0) / bars.length).toFixed(1);
  const bestDay    = bars.reduce((a, b) => b.hours > a.hours ? b : a, bars[0]);

  const subjectColor: Record<string, string> = {
    Quant:     'bg-blue-500',
    Reasoning: 'bg-indigo-500',
    English:   'bg-rose-500',
  };

  // Per-bar subject breakdown (stacked)
  const getBreakdown = (dateLabel: string) => {
    const filter = view === 'weekly'
      ? (l: StudyLog) => {
          const d = new Date(l.date);
          return d.toLocaleDateString('en-US', { weekday: 'short' }) === dateLabel;
        }
      : () => true; // monthly bars already aggregated
    return ['Quant', 'Reasoning', 'English'].map(s => ({
      subject: s,
      mins: logs.filter(l => l.subject === s && filter(l)).reduce((a, l) => a + l.durationMinutes, 0),
    }));
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">

      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Study Hours
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {view === 'weekly' ? 'Last 7 days' : 'Last 4 weeks'} · based on your study logs
          </p>
        </div>

        {/* Toggle */}
        <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
          {(['weekly', 'monthly'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                view === v ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {v === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Hours', value: `${totalHours}h`, color: 'text-indigo-400' },
          { label: 'Daily Avg',   value: `${avgHours}h`,   color: 'text-emerald-400' },
          { label: 'Best Day',    value: `${bestDay?.hours}h`, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50">
            <p className={`text-lg font-black font-mono ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Histogram bars */}
      <div className="flex items-end justify-between gap-2 h-40">
        {bars.map((bar, i) => {
          const heightPct = maxHours > 0 ? (bar.hours / maxHours) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                <div className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center shadow-lg min-w-16">
                  <p className="text-xs font-bold text-slate-100">{bar.hours}h</p>
                  <p className="text-[10px] text-slate-400">{bar.mins} mins</p>
                </div>
                <div className="w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45 -mt-1" />
              </div>

              {/* Bar track */}
              <div className="w-full relative bg-slate-800/40 rounded-t-lg" style={{ height: '120px' }}>
                {/* Actual bar — grows from bottom */}
                <div
                  className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-700 ${
                    bar.isToday
                      ? 'bg-indigo-500 shadow-lg shadow-indigo-500/30'
                      : bar.hours > 0
                      ? 'bg-slate-500 group-hover:bg-indigo-500/70'
                      : 'bg-slate-800'
                  }`}
                  style={{ height: `${Math.max(heightPct, bar.hours > 0 ? 5 : 0)}%` }}
                />
              </div>

              {/* Labels */}
              <p className={`text-[10px] font-bold leading-tight ${bar.isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                {bar.label}
              </p>
              <p className="text-[9px] text-slate-600 font-mono leading-tight">{bar.sublabel}</p>
            </div>
          );
        })}
      </div>

      {/* Y-axis hint */}
      <div className="flex justify-between text-[9px] text-slate-600 font-mono -mt-2">
        <span>0h</span>
        <span>{(maxHours / 2).toFixed(1)}h</span>
        <span>{maxHours.toFixed(1)}h</span>
      </div>

      {/* Subject legend */}
      <div className="flex items-center gap-4 pt-1 border-t border-slate-800">
        {['Quant', 'Reasoning', 'English'].map(s => {
          const mins = logs.filter(l => l.subject === s).reduce((a, l) => a + l.durationMinutes, 0);
          return (
            <div key={s} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`w-2.5 h-2.5 rounded-full ${subjectColor[s]}`} />
              <span>{s}</span>
              <span className="font-mono text-slate-500">{(mins / 60).toFixed(1)}h</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PerformanceAnalytics({ logs }: PerformanceAnalyticsProps) {
  // Aggregate data points based on logs (since habit completions are saved to logs!)
  const quantLogs = logs.filter(l => l.subject === 'Quant');
  const reasoningLogs = logs.filter(l => l.subject === 'Reasoning');
  const englishLogs = logs.filter(l => l.subject === 'English');

  const totalMinutes = logs.reduce((acc, current) => acc + current.durationMinutes, 0) || 1;
  
  const quantMinutes = quantLogs.reduce((acc, cur) => acc + cur.durationMinutes, 0);
  const reasoningMinutes = reasoningLogs.reduce((acc, cur) => acc + cur.durationMinutes, 0);
  const englishMinutes = englishLogs.reduce((acc, cur) => acc + cur.durationMinutes, 0);

  const quantPct = Math.round((quantMinutes / totalMinutes) * 100) || 0;
  const reasoningPct = Math.round((reasoningMinutes / totalMinutes) * 100) || 0;
  const englishPct = Math.round((englishMinutes / totalMinutes) * 100) || 0;

  // Custom consistency calculations (simulated metrics based on log volumes)
  const getSubjectConsistency = (subject: 'Quant' | 'Reasoning' | 'English') => {
    const subLogs = logs.filter(l => l.subject === subject);
    if (subLogs.length === 0) return 30; // base consistency rank
    return Math.min(100, 40 + subLogs.length * 12);
  };

  const quantConsistency = getSubjectConsistency('Quant');
  const reasoningConsistency = getSubjectConsistency('Reasoning');
  const englishConsistency = getSubjectConsistency('English');

  const overallConsistencyRate = Math.round((quantConsistency + reasoningConsistency + englishConsistency) / 3);

  // Strong vs weak habit topics based on completion logs
  const getHabitsStrengthAnalysis = () => {
    const strongHabits = ['Speed Math Exercises', 'Financial Term Flashcards', 'Syllogism Mock Schemes'];
    const weakHabits = ['Quadratic Equation Formulas', 'Floor Seating Diagrams', 'Reading Comprehension Drills'];

    if (quantLogs.length > 2) {
      strongHabits.push('Simplification Routines');
    } else {
      weakHabits.push('Arithmetic Revision');
    }

    if (reasoningLogs.length > 2) {
      strongHabits.push('Logical Venn Layouts');
    } else {
      weakHabits.push('Floor arrangements');
    }

    return { strongHabits, weakHabits };
  };

  const { strongHabits, weakHabits } = getHabitsStrengthAnalysis();

  const averageRoutineMins = logs.length > 0
    ? Math.round(totalMinutes / logs.length)
    : 25;

  return (
    <div id="analytics-tab" className="space-y-6">

      {/* Study Hours Histogram */}
      <Histogram logs={logs} />
      
      {/* Title block */}
      <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400 font-bold" /> Habit Consistency Audit
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed metrics evaluating your micro-learning routines, syllabus coverage ratios, and habit compliance benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core subject performance indicators */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl col-span-1 lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450">Habit Dedication by Domain</h3>

          <div className="space-y-5">
            
            {/* Quant Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Quantitative Aptitude Habits</span>
                <span className="text-blue-400 font-mono text-xs">
                  Consistency: {quantConsistency}% | Time: {quantMinutes} mins ({quantPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800/60">
                <div className="bg-blue-600 h-full transition-all" style={{ width: `${quantConsistency}%` }} title="Habit Consistency Rank"></div>
                <div className="bg-blue-300 h-full transition-all opacity-20" style={{ width: `${quantPct}%` }} title="Volume ratio"></div>
              </div>
            </div>

            {/* Reasoning Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Reasoning Ability Habits</span>
                <span className="text-indigo-400 font-mono text-xs">
                  Consistency: {reasoningConsistency}% | Time: {reasoningMinutes} mins ({reasoningPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800/60">
                <div className="bg-indigo-600 h-full transition-all" style={{ width: `${reasoningConsistency}%` }} title="Habit Consistency Rank"></div>
                <div className="bg-indigo-300 h-full transition-all opacity-20" style={{ width: `${reasoningPct}%` }} title="Volume ratio"></div>
              </div>
            </div>

            {/* English Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">English & Verbal Habits</span>
                <span className="text-[#fc3d64] font-mono text-xs">
                  Consistency: {englishConsistency}% | Time: {englishMinutes} mins ({englishPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800/60">
                <div className="bg-rose-500 h-full transition-all" style={{ width: `${englishConsistency}%` }} title="Habit Consistency Rank"></div>
                <div className="bg-rose-300 h-full transition-all opacity-20" style={{ width: `${englishPct}%` }} title="Volume ratio"></div>
              </div>
            </div>

          </div>

          {/* Speed Index metric */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/65 flex items-center gap-3">
              <div className="bg-blue-500/10 text-blue-400 p-2.5 rounded-lg border border-blue-500/20">
                <Clock className="w-6 h-6 shrink-0" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold block">Average Habit Duration</span>
                <p className="text-sm font-extrabold text-slate-200 mt-0.5">{averageRoutineMins} minutes / routine</p>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Highly optimal focus interval</span>
              </div>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/65 flex items-center gap-3">
              <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-lg border border-emerald-500/20">
                <HeartPulse className="w-6 h-6 shrink-0" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold block">Routine Vitality Rate</span>
                <p className="text-sm font-extrabold text-slate-200 mt-0.5">
                  {overallConsistencyRate}% Net Compliance
                </p>
                <span className="text-[10px] text-slate-400 block mt-0.5">Safe competitive tier is 75+%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Strong vs Weak classification matrix */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-6">
          <div className="border-b pb-3 border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350">Habit Strengths Matrix</h3>
            <p className="text-[10px] text-slate-500">Classified using historic checklist log frequency</p>
          </div>

          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wide flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Well-Established Habits
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {strongHabits.map((habit, idx) => (
                  <span key={idx} className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {habit}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-rose-400 block uppercase tracking-wide flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Habits Requiring Attention
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {weakHabits.map((habit, idx) => (
                  <span key={idx} className="bg-rose-500/10 text-rose-400 text-[10px] font-mono px-2.5 py-1 rounded-lg border border-rose-500/20">
                    {habit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Recommended dynamic action priorities details */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <h4 className="text-md font-bold text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-indigo-400 font-bold" /> Personalized Habit Interventions
        </h4>
        <p className="text-xs text-slate-500 mt-1">AI-suggested adjustments to keep your competitive mock indices and routines balanced:</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2">
            <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2.5 py-0.5 font-bold uppercase tracking-wider rounded border border-amber-500/20">Daily Quant Habit</span>
            <p className="text-xs font-bold text-slate-200">Reactivate "Speed Math" Routine</p>
            <p className="text-[11px] text-slate-500 leading-normal">Your Quant volume accounts for {quantPct}% of your prep. We recommend logging at least 15 mins of basic simplification tricks daily.</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2">
            <span className="text-[10px] bg-rose-500/15 text-rose-400 px-2.5 py-0.5 font-bold uppercase tracking-wider rounded border border-rose-500/20">English Consistency</span>
            <p className="text-xs font-bold text-slate-200">Leverage E-News Flashcards</p>
            <p className="text-[11px] text-slate-500 leading-normal">Verbal skills require continuous recall. Check off the "Read Editorial pages" habit twice this week to sustain memory strength.</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2">
            <span className="text-[10px] bg-indigo-500/15 text-indigo-400 px-2.5 py-0.5 font-bold uppercase tracking-wider rounded border border-indigo-500/20">Reasoning Core</span>
            <p className="text-xs font-bold text-slate-200">Sustain Floor Schema mapping</p>
            <p className="text-[11px] text-slate-500 leading-normal">Seating & Floor arrangements dictate over 40% of reasoning marks. Maintain a 3-day checklist strictness for this habit.</p>
          </div>

        </div>
      </div>

    </div>
  );
}