import { Clock, CheckSquare, Sparkles, AlertCircle } from 'lucide-react';
import { formatTimeOfDay, formatMinutes } from '../../../utils/timeFormatters';
import Badge from '../../../components/common/Badge';

/**
 * TimeBlockItem — Renders a single time block on the calendar grid.
 * Supports both completed TimeLogs (solid colored block) and scheduled Tasks (outlined block).
 *
 * Props:
 *  item        — TimeLog object or Task object
 *  type        — 'log' | 'task'
 *  style       — Absolute positioning style { top, height, left, width }
 *  onClick     — () => void
 *  onStartTask — (task) => void — quick start timer for scheduled tasks
 */
export default function TimeBlockItem({
  item,
  type = 'log',
  style = {},
  onClick,
  onStartTask,
}) {
  const isLog = type === 'log';

  // Extract metadata
  const title = isLog
    ? item.taskId?.title || item.notes || 'Focus Session'
    : item.title;

  const categoryName = item.categoryId?.name || item.taskId?.categoryId?.name;
  const categoryColor = item.categoryId?.color || item.taskId?.categoryId?.color || '#3B82F6';

  const startTimeStr = isLog ? formatTimeOfDay(item.startTime) : null;
  const endTimeStr = isLog ? formatTimeOfDay(item.endTime) : null;
  const duration = isLog ? item.durationMinutes : item.estimatedMinutes;

  if (isLog) {
    return (
      <div
        onClick={onClick}
        style={{
          ...style,
          borderLeft: `4px solid ${categoryColor}`,
          backgroundColor: `${categoryColor}20`,
        }}
        className="absolute rounded-lg p-1.5 sm:p-2 cursor-pointer select-none overflow-hidden transition-all duration-150 hover:brightness-125 hover:shadow-lg border border-surface-700/60 z-10 group"
        title={`${title} (${startTimeStr} - ${endTimeStr}, ${formatMinutes(duration)})`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold text-surface-100 truncate flex-1">
            {title}
          </span>
          <span className="text-[10px] font-mono text-surface-300 shrink-0">
            {formatMinutes(duration)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-surface-400 mt-0.5 truncate">
          <Clock size={10} className="shrink-0" />
          <span>
            {startTimeStr} - {endTimeStr}
          </span>
          {categoryName && (
            <span className="hidden sm:inline opacity-75">· {categoryName}</span>
          )}
        </div>
      </div>
    );
  }

  // Scheduled Task item
  return (
    <div
      onClick={onClick}
      style={style}
      className="absolute rounded-lg p-1.5 sm:p-2 cursor-pointer select-none overflow-hidden transition-all duration-150 bg-surface-800/90 hover:bg-surface-750 border-2 border-dashed border-primary-500/50 hover:border-primary-400 z-10 group"
      title={`Scheduled Task: ${title} (${item.priority})`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-medium text-surface-200 truncate flex-1 flex items-center gap-1">
          <CheckSquare size={11} className="text-primary-400 shrink-0" />
          {title}
        </span>
        <Badge
          label={item.priority}
          variant={item.priority === 'Urgent' ? 'danger' : item.priority === 'High' ? 'warning' : 'muted'}
          size="sm"
          className="text-[9px] py-0 px-1"
        />
      </div>

      {item.estimatedMinutes > 0 && (
        <div className="text-[10px] text-surface-400 mt-0.5 flex items-center gap-1">
          <Clock size={10} />
          <span>Est: {formatMinutes(item.estimatedMinutes)}</span>
        </div>
      )}
    </div>
  );
}
