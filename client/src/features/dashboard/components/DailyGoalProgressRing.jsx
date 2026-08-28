import { Sparkles, CheckCircle2, Award, Zap } from 'lucide-react';
import { formatMinutes } from '../../../utils/timeFormatters';

/**
 * DailyGoalProgressRing — Circular progress ring visualizing today's tracked focus time vs daily goal.
 *
 * Props:
 *  todayMinutes   — Total minutes tracked today (number)
 *  dailyGoalHours — User configured target hours per day (default: 8)
 *  size           — Ring diameter (default: 180)
 */
export default function DailyGoalProgressRing({
  todayMinutes = 0,
  dailyGoalHours = 8,
  size = 180,
}) {
  const goalMinutes = Math.max(60, dailyGoalHours * 60);
  const percent = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));
  const isGoalReached = percent >= 100;

  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const remainingMinutes = Math.max(0, goalMinutes - todayMinutes);

  return (
    <div className="card p-5 bg-surface-800 border-surface-700 flex flex-col items-center text-center justify-between h-full relative overflow-hidden">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-surface-700/60">
        <h3 className="text-sm font-semibold text-surface-100 flex items-center gap-2">
          <Zap size={16} className="text-amber-400" />
          Daily Focus Goal
        </h3>
        <span className="text-xs text-surface-400 font-medium">
          Target: {dailyGoalHours}h
        </span>
      </div>

      {/* Center SVG Ring Meter */}
      <div className="relative my-3 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#334155"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isGoalReached ? '#10B981' : '#3B82F6'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
            style={{
              filter: isGoalReached ? 'drop-shadow(0 0 8px rgba(16,185,129,0.5))' : 'none',
            }}
          />
        </svg>

        {/* Center Labels */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-surface-100 font-mono tracking-tight">
            {percent}%
          </span>
          <span className="text-[11px] text-surface-400 font-medium mt-0.5">
            {formatMinutes(todayMinutes)}
          </span>
        </div>
      </div>

      {/* Bottom Status Text */}
      <div className="w-full pt-1">
        {isGoalReached ? (
          <div className="flex items-center justify-center gap-1.5 text-xs text-success-400 font-semibold bg-success-500/10 py-1.5 rounded-lg border border-success-500/20">
            <CheckCircle2 size={14} />
            Daily Goal Accomplished! 🎉
          </div>
        ) : (
          <p className="text-xs text-surface-400">
            <strong className="text-surface-200">{formatMinutes(remainingMinutes)}</strong> left to reach your daily goal.
          </p>
        )}
      </div>
    </div>
  );
}
