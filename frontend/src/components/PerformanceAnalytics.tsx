import React from 'react';
import { 
  BarChart3, CheckCircle2, AlertTriangle, Clock, TrendingUp, Sparkles, Calendar, BookOpen, HeartPulse
} from 'lucide-react';
import { StudyLog } from '../types';

interface PerformanceAnalyticsProps {
  logs: StudyLog[];
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
