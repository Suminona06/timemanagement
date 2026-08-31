import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { formatMinutes } from '../../../utils/timeFormatters';
import Badge from '../../../components/common/Badge';

/**
 * TodayScheduleCard — Displays today's planned tasks and completed focus time blocks.
 *
 * Props:
 *  todayTasks — Array of Task objects due today
 *  todayLogs  — Array of TimeLog objects recorded today
 */
export default function TodayScheduleCard({ todayTasks = [], todayLogs = [] }) {
  const hasItems = todayTasks.length > 0 || todayLogs.length > 0;

  return (
    <div className="card p-5 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 shadow-warm-sm space-y-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-700/60">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
          <Calendar size={16} className="text-primary-500" />
          Today&apos;s Schedule & Logs
        </h3>
        <Link
          to="/calendar"
          className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold flex items-center gap-0.5 transition-colors"
        >
          <span>View Calendar</span>
          <ChevronRight size={13} />
        </Link>
      </div>

      {!hasItems ? (
        <div className="flex flex-col items-center justify-center py-8 text-surface-400 gap-2">
          <Calendar size={28} className="opacity-40 text-surface-300 dark:text-surface-600" />
          <p className="text-xs">No scheduled tasks or time blocks for today.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {/* Scheduled Tasks Due Today */}
          {todayTasks.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider block">
                Tasks Due Today ({todayTasks.length})
              </span>
              {todayTasks.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between p-2 rounded-xl bg-surface-100 dark:bg-surface-850 border border-surface-300 dark:border-surface-700/80 text-xs shadow-warm-sm"
                >
                  <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                    <CheckCircle2
                      size={14}
                      className={t.status === 'Completed' ? 'text-success-500' : 'text-surface-400'}
                    />
                    <span
                      className={`truncate font-semibold ${
                        t.status === 'Completed'
                          ? 'line-through text-surface-400 dark:text-surface-500'
                          : 'text-surface-800 dark:text-surface-200'
                      }`}
                    >
                      {t.title}
                    </span>
                  </div>
                  <Badge
                    label={t.priority}
                    variant={t.priority === 'Urgent' ? 'danger' : t.priority === 'High' ? 'default' : 'warning'}
                    size="sm"
                    className="text-[9px] py-0 px-1.5 shrink-0"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Completed Focus Sessions Today */}
          {todayLogs.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider block">
                Completed Focus Blocks ({todayLogs.length})
              </span>
              {todayLogs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between p-2 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs shadow-warm-sm"
                >
                  <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                    <Sparkles size={13} className="text-primary-500 shrink-0" />
                    <span className="text-surface-800 dark:text-surface-200 font-semibold truncate">
                      {log.taskId?.title || log.notes || 'Focus Session'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-surface-500 font-mono shrink-0">
                    <Clock size={11} className="text-primary-500" />
                    <span>{formatMinutes(log.durationMinutes)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
