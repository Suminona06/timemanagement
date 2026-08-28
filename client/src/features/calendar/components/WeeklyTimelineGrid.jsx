import { useMemo, useRef, useEffect } from 'react';
import { format, isToday, isSameDay, addDays, startOfWeek } from 'date-fns';
import TimeBlockItem from './TimeBlockItem';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 50; // 50px per hour in weekly view

/**
 * WeeklyTimelineGrid — 7-day multi-column timeline grid.
 *
 * Props:
 *  weekStartDate — Date object representing start of week (Monday)
 *  timeLogs      — Array of TimeLog objects within this week
 *  tasks         — Array of Task objects with due dates within this week
 *  onSlotClick   — (dateStr, hourStr) => void
 *  onSelectLog   — (log) => void
 *  onSelectTask  — (task) => void
 */
export default function WeeklyTimelineGrid({
  weekStartDate,
  timeLogs = [],
  tasks = [],
  onSlotClick,
  onSelectLog,
  onSelectTask,
}) {
  const containerRef = useRef(null);

  // Generate 7 days of the week (Monday through Sunday)
  const weekDays = useMemo(() => {
    const start = startOfWeek(weekStartDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [weekStartDate]);

  // Auto-scroll to 8:00 AM
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, [weekStartDate]);

  // Group time logs by day index (0 to 6)
  const logsByDay = useMemo(() => {
    const grouped = Array.from({ length: 7 }, () => []);

    timeLogs.forEach((log) => {
      const logDate = new Date(log.startTime);
      const dayIndex = weekDays.findIndex((d) => isSameDay(d, logDate));

      if (dayIndex !== -1) {
        const startMinutes = logDate.getHours() * 60 + logDate.getMinutes();
        const duration = Math.max(15, log.durationMinutes || 15);

        grouped[dayIndex].push({
          ...log,
          top: startMinutes * (HOUR_HEIGHT / 60),
          height: Math.max(22, duration * (HOUR_HEIGHT / 60) - 2),
        });
      }
    });

    return grouped;
  }, [timeLogs, weekDays]);

  // Group scheduled tasks by day index (0 to 6)
  const tasksByDay = useMemo(() => {
    const grouped = Array.from({ length: 7 }, () => []);

    tasks.forEach((task, idx) => {
      if (!task.dueDate) return;
      const dueDate = new Date(task.dueDate);
      const dayIndex = weekDays.findIndex((d) => isSameDay(d, dueDate));

      if (dayIndex !== -1) {
        let startMinutes = 9 * 60;
        if (dueDate.getHours() !== 0 || dueDate.getMinutes() !== 0) {
          startMinutes = dueDate.getHours() * 60 + dueDate.getMinutes();
        } else {
          startMinutes = (9 + (idx % 6)) * 60;
        }

        const duration = Math.max(30, task.estimatedMinutes || 45);

        grouped[dayIndex].push({
          ...task,
          top: startMinutes * (HOUR_HEIGHT / 60),
          height: Math.max(24, duration * (HOUR_HEIGHT / 60) - 2),
        });
      }
    });

    return grouped;
  }, [tasks, weekDays]);

  const handleCellClick = (dayDate, hour) => {
    const dateStr = format(dayDate, 'yyyy-MM-dd');
    const pad = (n) => String(n).padStart(2, '0');
    const hourStr = `${pad(hour)}:00`;
    onSlotClick(dateStr, hourStr);
  };

  return (
    <div className="flex flex-col flex-1 bg-surface-900 border border-surface-700 rounded-2xl shadow-inner overflow-hidden select-none">
      {/* ── Fixed Days Header Row ────────────────────────────────────────── */}
      <div className="flex border-b border-surface-700 bg-surface-850 shrink-0">
        {/* Time gutter spacer */}
        <div className="w-14 shrink-0 border-r border-surface-700" />

        {/* 7 Day Column Headers */}
        <div className="flex-1 grid grid-cols-7 divide-x divide-surface-700">
          {weekDays.map((day) => {
            const today = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className={`py-2.5 px-2 text-center transition-colors ${
                  today ? 'bg-primary-500/10' : ''
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                  {format(day, 'EEE')}
                </div>
                <div
                  className={`inline-flex items-center justify-center w-7 h-7 mt-0.5 rounded-full text-sm font-bold ${
                    today
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-surface-200'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable Hourly Grid ───────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto max-h-[660px] relative"
      >
        <div className="flex min-w-[700px]" style={{ height: 24 * HOUR_HEIGHT }}>
          {/* Time Labels Column */}
          <div className="w-14 shrink-0 border-r border-surface-700 relative bg-surface-850/50">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                className="absolute inset-x-0 pr-2 -mt-2 text-right text-[11px] font-mono text-surface-500"
              >
                {format(new Date().setHours(hour, 0, 0, 0), 'ha')}
              </div>
            ))}
          </div>

          {/* 7 Day Columns Grid */}
          <div className="flex-1 grid grid-cols-7 divide-x divide-surface-700 relative">
            {weekDays.map((day, dayIndex) => {
              const dayLogs = logsByDay[dayIndex] || [];
              const dayTasks = tasksByDay[dayIndex] || [];
              const today = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`relative h-full ${today ? 'bg-primary-500/[0.02]' : ''}`}
                >
                  {/* Horizontal Hour Lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                      onClick={() => handleCellClick(day, hour)}
                      className="absolute inset-x-0 border-b border-surface-800/80 hover:bg-surface-800/40 transition-colors cursor-pointer"
                    />
                  ))}

                  {/* Render Day's Time Logs */}
                  {dayLogs.map((log) => (
                    <TimeBlockItem
                      key={log._id}
                      item={log}
                      type="log"
                      style={{
                        top: `${log.top}px`,
                        height: `${log.height}px`,
                        left: '2px',
                        right: '2px',
                      }}
                      onClick={() => onSelectLog(log)}
                    />
                  ))}

                  {/* Render Day's Scheduled Tasks */}
                  {dayTasks.map((task) => (
                    <TimeBlockItem
                      key={task._id}
                      item={task}
                      type="task"
                      style={{
                        top: `${task.top}px`,
                        height: `${task.height}px`,
                        left: '2px',
                        right: '2px',
                      }}
                      onClick={() => onSelectTask(task)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
