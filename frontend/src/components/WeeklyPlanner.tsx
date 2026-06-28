import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, Circle, Trash2, Clock, BookOpen } from 'lucide-react';
import { PlannerDay } from '../types';

interface WeeklyPlannerProps {
  planner: PlannerDay[];
  onUpdatePlanner: (updated: PlannerDay[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SUBJECT_COLORS: Record<string, string> = {
  Quant:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Reasoning: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  English:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Mock:      'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const TODAY_NAME = new Date().toLocaleDateString('en-US', { weekday: 'long' });

export default function WeeklyPlanner({ planner, onUpdatePlanner }: WeeklyPlannerProps) {
  const [activeDay, setActiveDay]       = useState<string>(DAYS.includes(TODAY_NAME) ? TODAY_NAME : 'Monday');
  const [showAddTask, setShowAddTask]   = useState(false);
  const [taskName, setTaskName]         = useState('');
  const [taskSubject, setTaskSubject]   = useState<'Quant' | 'Reasoning' | 'English' | 'Mock'>('Quant');
  const [taskDuration, setTaskDuration] = useState('30');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeDayData = planner.find(d => d.dayName === activeDay) ?? { dayName: activeDay, tasks: [] };
  const completedCount = activeDayData.tasks.filter(t => t.completed).length;
  const totalCount     = activeDayData.tasks.length;
  const totalMins      = activeDayData.tasks.reduce((acc, t) => acc + t.durationMinutes, 0);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const updateDay = (dayName: string, updater: (day: PlannerDay) => PlannerDay) => {
    const updated = DAYS.map(d => {
      const existing = planner.find(p => p.dayName === d) ?? { dayName: d, tasks: [] };
      return d === dayName ? updater(existing) : existing;
    });
    onUpdatePlanner(updated);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddTask = () => {
    if (!taskName.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      task: taskName.trim(),
      subject: taskSubject,
      durationMinutes: parseInt(taskDuration) || 30,
      completed: false,
    };
    updateDay(activeDay, day => ({ ...day, tasks: [...day.tasks, newTask] }));
    setTaskName('');
    setTaskDuration('30');
    setShowAddTask(false);
  };

  const handleToggle = (taskId: string) => {
    updateDay(activeDay, day => ({
      ...day,
      tasks: day.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
    }));
  };

  const handleDelete = (taskId: string) => {
    updateDay(activeDay, day => ({
      ...day,
      tasks: day.tasks.filter(t => t.id !== taskId),
    }));
    setConfirmDeleteId(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-linear-to-r from-indigo-950 via-slate-900 to-blue-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-1">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-widest">Weekly Planner</h2>
        </div>
        <p className="text-xs text-slate-400">Plan your study tasks for each day of the week. Track completion and stay consistent.</p>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map(day => {
          const dayData   = planner.find(d => d.dayName === day) ?? { tasks: [] };
          const done      = dayData.tasks.filter(t => t.completed).length;
          const total     = dayData.tasks.length;
          const isToday   = day === TODAY_NAME;
          const isActive  = day === activeDay;

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border transition text-xs font-bold ${
                isActive
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                  : isToday
                  ? 'bg-indigo-950/60 border-indigo-700/50 text-indigo-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="uppercase tracking-wider">{day.slice(0, 3)}</span>
              {total > 0 && (
                <span className={`text-[10px] mt-1 font-mono ${done === total ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {done}/{total}
                </span>
              )}
              {isToday && <span className="text-[9px] mt-0.5 text-indigo-300 font-mono">TODAY</span>}
            </button>
          );
        })}
      </div>

      {/* Day content */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">

        {/* Day header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">{activeDay}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalCount === 0
                ? 'No tasks planned yet'
                : `${completedCount}/${totalCount} tasks done · ${totalMins} mins planned`}
            </p>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="w-24">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Task list */}
        <div className="space-y-2 mb-4">
          {activeDayData.tasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No tasks for {activeDay} yet. Add one below!
            </div>
          ) : (
            activeDayData.tasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                  task.completed
                    ? 'bg-emerald-950/20 border-emerald-900/40 opacity-70'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left: checkbox + task info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button onClick={() => handleToggle(task.id)} className="shrink-0">
                    {task.completed
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      : <Circle className="w-5 h-5 text-slate-600 hover:text-indigo-400 transition" />
                    }
                  </button>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {task.task}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${SUBJECT_COLORS[task.subject]}`}>
                        {task.subject}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {task.durationMinutes}m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: delete */}
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  {confirmDeleteId === task.id ? (
                    <>
                      <button onClick={() => handleDelete(task.id)} className="text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition">Yes</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] font-bold text-slate-400 bg-slate-700 px-2 py-1 rounded transition">No</button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(task.id)}
                      className="text-slate-600 hover:text-red-400 p-1 rounded hover:bg-red-400/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add task form */}
        {showAddTask ? (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
            <input
              type="text"
              placeholder="Task name (e.g. Solve 20 Quant questions)"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
              autoFocus
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex gap-2 flex-wrap">
              {(['Quant', 'Reasoning', 'English', 'Mock'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setTaskSubject(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition ${
                    taskSubject === s ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs text-slate-500">Duration:</span>
              {['15', '30', '45', '60', '90'].map(m => (
                <button
                  key={m}
                  onClick={() => setTaskDuration(m)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition ${
                    taskDuration === m ? 'bg-slate-200 text-slate-900 border-slate-200' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}m
                </button>
              ))}
              <input
                type="number"
                placeholder="Custom"
                value={['15','30','45','60','90'].includes(taskDuration) ? '' : taskDuration}
                onChange={e => setTaskDuration(e.target.value)}
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddTask(false); setTaskName(''); }}
                className="flex-1 py-2 text-xs font-bold text-slate-400 border border-slate-700 rounded-xl hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={!taskName.trim()}
                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl transition"
              >
                Add Task
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddTask(true)}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:text-indigo-400 hover:border-indigo-700/50 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Add Task for {activeDay}
          </button>
        )}
      </div>

      {/* Weekly overview */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Weekly Overview</h4>
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map(day => {
            const dayData = planner.find(d => d.dayName === day) ?? { tasks: [] };
            const done    = dayData.tasks.filter(t => t.completed).length;
            const total   = dayData.tasks.length;
            const pct     = total > 0 ? (done / total) * 100 : 0;
            const isToday = day === TODAY_NAME;

            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className="flex flex-col items-center gap-1"
              >
                <span className={`text-[9px] font-mono uppercase ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {day.slice(0, 3)}
                </span>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-600 font-mono">{total > 0 ? `${done}/${total}` : '–'}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}