import React, { useState } from 'react';
import { 
  Award, Flame, Sparkles, CheckCircle2, TrendingUp, BookOpen, Calendar, AlertCircle, BookmarkCheck, Star
} from 'lucide-react';
import { Achievement, UserStats } from '../types';

interface GamificationBadgesProps {
  stats: UserStats;
  achievements: Achievement[];
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onUnlockAchievement: (id: string) => void;
}

export default function GamificationBadges({ 
  stats, 
  achievements, 
  onUpdateStats, 
  onUnlockAchievement 
}: GamificationBadgesProps) {
  const [claimedToday, setClaimedToday] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'info', text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleClaimLoginBonus = () => {
    if (claimedToday) return;
    setClaimedToday(true);
    
    // Increment XP
    onUpdateStats({
      xp: stats.xp + 100
    });

    // Check if streak unlocks dynamic Banker award
    if (stats.streak >= 3) {
      const ConsistentBanker = achievements.find(a => a.id === 'ach-streak-3');
      if (ConsistentBanker && !ConsistentBanker.unlockedAt) {
        onUnlockAchievement('ach-streak-3');
        showNotification('success', "STREAK UNLOCKED! You earned the 'Consistent Banker' badge for completing 3 daily streaks!");
      } else {
        showNotification('success', "Daily habit attendance checked! +100 XP points logged.");
      }
    } else {
      showNotification('success', "Daily habit attendance checked! +100 XP points logged.");
    }
  };

  // Helper dynamic rendering of Lucide icons based on standard strings
  const getBadgeIcon = (iconName: string) => {
    if (iconName === 'Flame') return <Flame className="w-6 h-6 shrink-0 text-amber-500 fill-amber-500/10" />;
    if (iconName === 'Calculator') return <TrendingUp className="w-6 h-6 shrink-0 text-cyan-400" />;
    if (iconName === 'Award') return <Award className="w-6 h-6 shrink-0 text-yellow-400 fill-yellow-400/10" />;
    if (iconName === 'TrendingUp') return <BookmarkCheck className="w-6 h-6 shrink-0 text-[#2fafee]" />;
    if (iconName === 'BookOpen') return <BookOpen className="w-6 h-6 shrink-0 text-rose-450" />;
    
    return <Award className="w-6 h-6 text-emerald-400" />;
  };

  const levelProgress = stats.xp % 1000;
  const levelPercentage = Math.min(100, Math.round((levelProgress / 1000) * 100));

  return (
    <div id="milestones-tab" className="space-y-6">

      {/* Inline Notification Banner standard helper */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-500/15 text-emerald-350 border-emerald-500/30' 
            : 'bg-indigo-500/15 text-indigo-350 border-indigo-500/30'
        }`}>
          <Star className="w-5 h-5 text-yellow-400 animate-spin shrink-0" />
          <div className="text-xs font-bold font-sans">{notification.text}</div>
        </div>
      )}
      
      {/* Dynamic Status / Streak Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core level block */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-widest border border-indigo-500/20">
            Aspirant Rank Index
          </span>
          <h3 className="text-xl font-black text-slate-100">{stats.level}</h3>
          
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{stats.xp} Total XP</span>
              <span>Next Level ({(Math.ceil((stats.xp + 1) / 1000) || 1) * 1000} XP)</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/80">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${levelPercentage || 10}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-500 block mt-2 text-right">XP multiplier matches rank thresholds</span>
          </div>
        </div>

        {/* Attendance interactive booster */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-widest border border-emerald-500/10">
              Routine Check-In
            </span>
            <h4 className="text-md font-bold text-slate-200 mt-3">Daily Attendance Verifier</h4>
            <p className="text-xs text-slate-500 mt-1">Claim your daily 100 XP focus allowance to amplify your leveling progress.</p>
          </div>

          <button
            onClick={handleClaimLoginBonus}
            disabled={claimedToday}
            className={`w-full mt-4 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              claimedToday 
                ? 'bg-slate-950 text-slate-500 border border-slate-850 cursor-not-allowed font-medium' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow shadow-emerald-500/10'
            }`}
          >
            {claimedToday ? <CheckCircle2 className="w-4 h-4 text-slate-500" /> : <Calendar className="w-4 h-4" />}
            {claimedToday ? 'Claimed Today' : 'Claim Daily Bonus (+100 XP)'}
          </button>
        </div>

        {/* Streak card progress */}
        <div className="bg-gradient-to-br from-amber-500/5 to-slate-900/40 border border-amber-500/10 dark:border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full font-mono font-bold uppercase border border-amber-500/25">
                STREAK ENERGY
              </span>
              <h4 className="text-xl font-black text-amber-400 mt-3">{stats.streak} Days Active</h4>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Solve consecutive calendar days to keep multipliers green. High streakers advance toward Future Banker rank double-time!
              </p>
            </div>
            <div className="bg-amber-500/20 p-3 rounded-xl border border-amber-500/30 text-amber-500 animate-pulse">
              <Flame className="w-7 h-7 fill-amber-500" />
            </div>
          </div>
        </div>

      </div>

      {/* Badges and milestone listing */}
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-bold text-slate-200">Aspirational Consistency Matrix</h3>
        <p className="text-xs text-slate-400 mt-0.5 pb-4 border-b border-slate-800">
          Unlock milestone badges based on study weeks, logged habit counts, and streak numbers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {achievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;
            return (
              <div 
                key={ach.id} 
                className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked 
                    ? 'bg-slate-950/60 border-slate-850' 
                    : 'bg-slate-900/20 border-slate-900 opacity-60 grayscale'
                }`}
              >
                <div className={`p-3 rounded-lg border shrink-0 ${
                  isUnlocked 
                    ? 'bg-indigo-500/10 border-indigo-500/20' 
                    : 'bg-slate-950 border-slate-850'
                }`}>
                  {getBadgeIcon(ach.iconName)}
                </div>

                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <h4 className="text-xs font-black text-slate-200">{ach.title}</h4>
                    {isUnlocked && (
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase font-mono">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-450 leading-normal">{ach.description.replace('Mock Test', 'Habits Log')}</p>
                  
                  <span className="text-[9px] font-mono font-bold text-indigo-400 block pt-1 uppercase">
                    Worth +{ach.xpValue} XP points
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
