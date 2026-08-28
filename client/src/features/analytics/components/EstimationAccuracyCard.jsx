import { Target, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

/**
 * EstimationAccuracyCard — Metrics card analyzing how accurately user estimates task durations.
 *
 * Props:
 *  data — { scorePercentage, totalEvaluatedTasks, accurateTasksCount, underEstimatedCount, overEstimatedCount }
 */
export default function EstimationAccuracyCard({ data = {} }) {
  const {
    scorePercentage = 100,
    totalEvaluatedTasks = 0,
    accurateTasksCount = 0,
    underEstimatedCount = 0,
    overEstimatedCount = 0,
  } = data;

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-success-400 bg-success-500/15 border-success-500/30';
    if (score >= 65) return 'text-warning-400 bg-warning-500/15 border-warning-500/30';
    return 'text-danger-400 bg-danger-500/15 border-danger-500/30';
  };

  const getScoreBadgeText = (score) => {
    if (score >= 85) return 'High Precision';
    if (score >= 65) return 'Moderate Accuracy';
    return 'Needs Improvement';
  };

  return (
    <div className="card p-5 bg-surface-800 border-surface-700 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-surface-700/60">
        <h3 className="text-sm font-semibold text-surface-100 flex items-center gap-2">
          <Target size={16} className="text-primary-400" />
          Estimation Accuracy
        </h3>
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getScoreColor(
            scorePercentage
          )}`}
        >
          {getScoreBadgeText(scorePercentage)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Score Readout */}
        <div className="space-y-0.5">
          <div className="text-3xl sm:text-4xl font-extrabold text-surface-100 font-mono">
            {scorePercentage}%
          </div>
          <p className="text-xs text-surface-400">
            Across {totalEvaluatedTasks} evaluated tasks
          </p>
        </div>

        {/* Mini Breakdown Stat Pills */}
        <div className="space-y-1.5 text-xs text-right">
          <div className="flex items-center justify-end gap-1.5 text-success-400">
            <CheckCircle2 size={13} />
            <span>{accurateTasksCount} on target (±15%)</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-warning-400">
            <TrendingUp size={13} />
            <span>{underEstimatedCount} took longer</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-surface-400">
            <AlertTriangle size={13} />
            <span>{overEstimatedCount} finished early</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div className="space-y-1.5 pt-1">
        <div className="w-full bg-surface-700 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              scorePercentage >= 85
                ? 'bg-success-500'
                : scorePercentage >= 65
                ? 'bg-warning-500'
                : 'bg-danger-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, scorePercentage))}%` }}
          />
        </div>
        <p className="text-[11px] text-surface-500 italic">
          {scorePercentage >= 85
            ? 'Great job! Your planned task estimates match actual tracked times closely.'
            : 'Tip: Consider breaking large tasks into 25-minute blocks for tighter estimates.'}
        </p>
      </div>
    </div>
  );
}
