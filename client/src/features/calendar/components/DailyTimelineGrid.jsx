import { useEffect, useRef, useMemo } from 'react';
import { isToday, format } from 'date-fns';
import TimeBlockItem from './TimeBlockItem';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // 60px per hour (1px per minute)

/**
 * DailyTimelineGrid — 24-hour vertical timeline grid showing logged time vs scheduled tasks.
 *
 * Props:
 *  selectedDate — Date object
 *  timeLogs     — Array of TimeLog objects for this date
 *  tasks        — Array of Task objects with due date matching this date
 *  onSlotClick  — (startTimeStr) => void
 *  onSelectLog  — (log) => void
 *  onSelectTask — (task) => void
 */
export default function DailyTimelineGrid({
  selectedDate,
  timeLogs = [],
  tasks = [],
  onSlotClick,
  onSelectLog,
  onSelectTask,
}) {
  const containerRef = useRef(null);
  const isSelectedDateToday = isToday(selectedDate);

  // Auto-scroll to current hour or 8:00 AM on initial load
  useEffect(() => {
    if (containerRef.current) {
      const targetHour = isSelectedDateToday ? new Date().getHours() : 8;
      const scrollPosition = Math.max(0, (targetHour - 1) * HOUR_HEIGHT);
      containerRef.current.scrollTop = scrollPosition;
    }
  }, [selectedDate, isSelectedDateToday]);

  // Current time marker position in minutes
  const now = new Date();
  const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();

  // Position calculation helper for time logs
  const positionedLogs = useMemo(() => {
    return timeLogs.map((log) => {
      const start = new Date(log.startTime);
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const duration = Math.max(15, log.durationMinutes || 15);

      return {
        ...log,
        top: startMinutes * (HOUR_HEIGHT / 60),
        height: Math.max(26, duration * (HOUR_HEIGHT / 60) - 2),
      };
    });
  }, [timeLogs]);

  // Position calculation for scheduled tasks
  const positionedTasks = useMemo(() => {
    return tasks.map((task, idx) => {
      let startMinutes = 9 * 60; // Default 09:00 AM if no time specified
      if (task.dueDate) {
        const due = new Date(task.dueDate);
        if (due.getHours() !== 0 || due.getMinutes() !== 0) {
          startMinutes = due.getHours() * 60 + due.getMinutes();
        } else {
          // Stagger default tasks if multiple on the same day
          startMinutes = (9 + (idx % 8)) * 60;
        }
      }
      const duration = Math.max(30, task.estimatedMinutes || 45);

      return {
        ...task,
        top: startMinutes * (HOUR_HEIGHT / 60),
        height: Math.max(32, duration * (HOUR_HEIGHT / 60) - 2),
      };
    });
  }, [tasks]);

  const handleGridClick = (e, hour) => {
    // Only trigger if clicked on background grid, not on a time block
    if (e.target === e.currentTarget || e.target.classList.contains('hour-slot')) {
      const pad = (n) => String(n).padStart(2, '0');
      const startStr = `${pad(hour)}:00`;
      onSlotClick(startStr);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-y-auto bg-surface-900 border border-surface-700 rounded-2xl shadow-inner max-h-[720px] select-none"
    >
      {/* Grid Canvas */}
      <div className="relative min-w-[500px]" style={{ height: 24 * HOUR_HEIGHT }}>
        {/* Hour Rows */}
        {HOURS.map((hour) => {
          const hourLabel = format(new Date().setHours(hour, 0, 0, 0), 'ha');
          return (
            <div
              key={hour}
              style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              onClick={(e) => handleGridClick(e, hour)}
              className="hour-slot absolute inset-x-0 flex border-b border-surface-800/80 hover:bg-surface-800/30 transition-colors cursor-pointer group"
            >
              {/* Time Label Column */}
              <div className="w-16 shrink-0 text-right pr-3 -mt-2.5 text-xs font-mono text-surface-500 group-hover:text-surface-300 transition-colors">
                {hourLabel}
              </div>

              {/* 30-minute subtle dashed divider */}
              <div className="flex-1 relative border-l border-surface-700">
                <div
                  className="absolute inset-x-0 border-b border-surface-800/40 border-dashed"
                  style={{ top: HOUR_HEIGHT / 2 }}
                />
              </div>
            </div>
          );
        })}

        {/* Current Time Red Line Marker */}
        {isSelectedDateToday && (
          <div
            style={{ top: currentMinutesFromMidnight * (HOUR_HEIGHT / 60) }}
            className="absolute inset-x-0 z-30 flex items-center pointer-events-none"
          >
            <div className="w-14 text-right pr-2 text-[10px] font-mono font-bold text-danger-400">
              {format(now, 'HH:mm')}
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-danger-500 shrink-0 -ml-1.5 shadow-sm" />
            <div className="flex-1 border-t-2 border-danger-500/80" />
          </div>
        )}

        {/* Time Blocks Container: Two visual lanes (Actual Logs on left, Planned Tasks on right) */}
        <div className="absolute inset-y-0 left-16 right-0 grid grid-cols-2 gap-2 px-2 pointer-events-none">
          {/* Lane 1: Actual Tracked Time Logs */}
          <div className="relative h-full pointer-events-auto">
            {positionedLogs.map((log) => (
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
          </div>

          {/* Lane 2: Planned / Scheduled Tasks */}
          <div className="relative h-full pointer-events-auto">
            {positionedTasks.map((task) => (
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
        </div>
      </div>
    </div>
  );
}
