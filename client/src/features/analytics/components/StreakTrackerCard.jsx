import { Flame, CheckCircle2, Zap } from 'lucide-react';
import { formatMinutes } from '../../../utils/timeFormatters';

/**
 * StreakTrackerCard — Displays consecutive focus days streak and daily goal achievement.
 *
 * Props:
 *  data — { currentStreakDays, dailyGoalHours, todayTrackedMinutes, todayGoalPercent }
 */
export default function StreakTrackerCard({ data = {} }) {
  const {
    currentStreakDays = 0,
    dailyGoalHours = 8,
    todayTrackedMinutes = 0,
    todayGoalPercent = 0,
  } = data;

  const isGoalReached = todayGoalPercent >= 100;

  return (
    <div className="card p-5 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 shadow-warm-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-700/60">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
          <Zap size={16} className="text-primary-500" />
          Focus Streak & Goal
        </h3>
        {isGoalReached ? (
          <span className="text-[11px] font-bold text-pastel-matcha-dark dark:text-pastel-matcha bg-pastel-matcha-light/40 dark:bg-pastel-matcha/20 border border-pastel-matcha/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 size={12} /> Daily Goal Met
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-surface-500">
            Goal: {dailyGoalHours}h / day
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Streak Flame Counter */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-2xl ${
              currentStreakDays > 0
                ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/30 shadow-warm-sm'
                : 'bg-surface-200 dark:bg-surface-700 text-surface-400'
            }`}
          >
            <Flame size={26} className={currentStreakDays > 0 ? 'fill-current animate-pulse' : ''} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-100 font-mono tracking-tight">
              {currentStreakDays} {currentStreakDays === 1 ? 'Day' : 'Days'}
            </div>
            <p className="text-xs text-surface-500 font-medium">Consecutive focus streak</p>
          </div>
        </div>

        {/* Today's Goal Readout */}
        <div className="text-right space-y-0.5">
          <div className="text-lg font-bold text-surface-900 dark:text-surface-100 font-mono">
            {formatMinutes(todayTrackedMinutes)}
          </div>
          <p className="text-xs text-surface-500">
            of {dailyGoalHours}h goal ({todayGoalPercent}%)
          </p>
        </div>
      </div>

      {/* Daily Goal Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="w-full bg-surface-200 dark:bg-surface-700 h-2.5 rounded-full overflow-hidden border border-surface-300/40 dark:border-surface-600/40">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isGoalReached ? 'bg-success-500' : 'bg-primary-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(3, todayGoalPercent))}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-surface-500 font-medium font-mono">
          <span>0h</span>
          <span>{Math.round(dailyGoalHours / 2)}h</span>
          <span>{dailyGoalHours}h target</span>
        </div>
      </div>
    </div>
  );
}
