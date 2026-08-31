import { Zap, CheckCircle2 } from 'lucide-react';
import { formatMinutes } from '../../../utils/timeFormatters';

/**
 * DailyGoalProgressRing — Circular progress ring visualizing today's tracked focus time vs daily goal.
 * Styled with ChronoCraft Warm Lo-Fi & Pastel palette.
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

  // Warm Lo-Fi Ring Color
  const ringColor = isGoalReached ? '#8DA780' : '#C88A58';

  return (
    <div className="card p-5 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 shadow-warm-sm flex flex-col items-center text-center justify-between h-full relative overflow-hidden">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-700/60">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
          <Zap size={16} className="text-primary-500" />
          Daily Focus Goal
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-surface-200/70 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
          Target: {dailyGoalHours}h
        </span>
      </div>

      {/* Center SVG Ring Meter */}
      <div className="relative my-3 flex items-center justify-center">
        {isGoalReached && (
          <div
            className="absolute inset-2 rounded-full filter blur-xl opacity-20 pointer-events-none"
            style={{ backgroundColor: ringColor }}
          />
        )}
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-surface-200 dark:text-surface-700"
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
            style={{
              filter: isGoalReached ? 'drop-shadow(0 0 8px rgba(141,167,128,0.6))' : 'drop-shadow(0 0 6px rgba(200,138,88,0.4))',
            }}
          />
        </svg>

        {/* Center Labels */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-surface-900 dark:text-surface-100 font-mono tracking-tight">
            {percent}%
          </span>
          <span className="text-xs text-surface-500 font-medium mt-0.5 font-mono">
            {formatMinutes(todayMinutes)}
          </span>
        </div>
      </div>

      {/* Bottom Status Text */}
      <div className="w-full pt-1">
        {isGoalReached ? (
          <div className="flex items-center justify-center gap-1.5 text-xs text-pastel-matcha-dark dark:text-pastel-matcha font-bold bg-pastel-matcha-light/40 dark:bg-pastel-matcha/20 py-2 rounded-xl border border-pastel-matcha/30">
            <CheckCircle2 size={15} />
            Daily Goal Accomplished! 🎉
          </div>
        ) : (
          <p className="text-xs text-surface-500">
            <strong className="text-surface-800 dark:text-surface-200">{formatMinutes(remainingMinutes)}</strong> left to reach today&apos;s mindful target.
          </p>
        )}
      </div>
    </div>
  );
}
