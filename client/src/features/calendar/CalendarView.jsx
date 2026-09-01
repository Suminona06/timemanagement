import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckSquare,
  Loader2,
  Trash2,
} from 'lucide-react';
import useTaskStore from '../../stores/taskStore';
import { fetchTimeLogs, deleteTimeLog } from '../../services/timeLogService';
import { formatMinutes, formatTimeOfDay } from '../../utils/timeFormatters';
import DailyTimelineGrid from './components/DailyTimelineGrid';
import WeeklyTimelineGrid from './components/WeeklyTimelineGrid';
import ManualLogModal from '../timer/components/ManualLogModal';
import TaskFormModal from '../tasks/components/TaskFormModal';
import Modal from '../../components/common/Modal';

/**
 * CalendarView — Interactive daily & weekly time-blocking schedule grid.
 * Harmonized with ChronoCraft Warm Lo-Fi light and dark mode.
 */
export default function CalendarView() {
  const { tasks, loadTasks, init } = useTaskStore();

  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'weekly'
  const [currentDate, setCurrentDate] = useState(new Date());

  const [timeLogs, setTimeLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Modal states
  const [isManualLogModalOpen, setIsManualLogModalOpen] = useState(false);
  const [manualModalDefaults, setManualModalDefaults] = useState({});

  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [isDeletingLog, setIsDeletingLog] = useState(false);

  // Compute active query date range based on view mode
  const { startDateStr, endDateStr, dateRangeLabel } = useMemo(() => {
    if (viewMode === 'daily') {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      return {
        startDateStr: dateStr,
        endDateStr: dateStr,
        dateRangeLabel: format(currentDate, 'EEEE, MMMM d, yyyy'),
      };
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return {
        startDateStr: format(start, 'yyyy-MM-dd'),
        endDateStr: format(end, 'yyyy-MM-dd'),
        dateRangeLabel: `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`,
      };
    }
  }, [viewMode, currentDate]);

  // Load time logs whenever date range changes
  const loadLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetchTimeLogs({
        startDate: startDateStr,
        endDate: endDateStr,
        limit: 200,
      });
      setTimeLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load calendar time logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [startDateStr, endDateStr]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Ensure tasks are loaded
  useEffect(() => {
    if (tasks.length === 0) {
      init();
    }
  }, [init, tasks.length]);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate((d) => (viewMode === 'daily' ? subDays(d, 1) : subDays(d, 7)));
  };

  const handleNext = () => {
    setCurrentDate((d) => (viewMode === 'daily' ? addDays(d, 1) : addDays(d, 7)));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter tasks with dueDate falling in the active range
  const rangeTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueStr = format(new Date(t.dueDate), 'yyyy-MM-dd');
      return dueStr >= startDateStr && dueStr <= endDateStr;
    });
  }, [tasks, startDateStr, endDateStr]);

  // Summary stats
  const totalLoggedMinutes = useMemo(() => {
    return timeLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
  }, [timeLogs]);

  // Slot click handler for quick manual log
  const handleSlotClick = (dateStrOrHour, optionalHourStr) => {
    let dateVal = startDateStr;
    let hourVal = '09:00';

    if (viewMode === 'daily') {
      hourVal = dateStrOrHour;
    } else {
      dateVal = dateStrOrHour;
      hourVal = optionalHourStr || '09:00';
    }

    setManualModalDefaults({
      date: dateVal,
      startTime: hourVal,
    });
    setIsManualLogModalOpen(true);
  };

  // Delete single log
  const handleDeleteLog = async (logId) => {
    setIsDeletingLog(true);
    try {
      await deleteTimeLog(logId);
      setSelectedLogDetail(null);
      await loadLogs();
      await loadTasks();
    } catch (err) {
      console.error('Failed to delete log:', err);
    } finally {
      setIsDeletingLog(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-5">
      {/* ── Header & Navigation Bar ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
            <CalendarIcon size={20} className="text-primary-500" />
            Calendar & Time-Blocking
          </h1>
          <p className="text-xs text-surface-500 mt-0.5">
            Visualize your scheduled tasks alongside actual completed focus blocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Daily / Weekly View Switcher */}
          <div className="flex bg-surface-200/80 dark:bg-surface-800 p-1 rounded-2xl border border-surface-300 dark:border-surface-700 shadow-warm-sm">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                viewMode === 'daily'
                  ? 'bg-primary-500 text-white shadow-sm font-bold'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                viewMode === 'weekly'
                  ? 'bg-primary-500 text-white shadow-sm font-bold'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
              }`}
            >
              Week
            </button>
          </div>

          {/* Quick Log Button */}
          <button
            onClick={() => {
              setManualModalDefaults({});
              setIsManualLogModalOpen(true);
            }}
            className="btn-primary text-xs py-2 px-3.5 gap-1.5 shadow-warm-sm"
          >
            <Plus size={14} />
            Log Time
          </button>
        </div>
      </div>

      {/* ── Date Navigator & Summary Bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-50 dark:bg-surface-800 p-3.5 rounded-2xl border border-surface-300 dark:border-surface-700/80 shadow-warm-sm">
        {/* Date Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-xl bg-surface-200/80 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-200 transition-colors shadow-sm"
            title="Previous period"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 rounded-xl text-xs font-bold bg-surface-200/80 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-800 dark:text-surface-100 transition-colors shadow-sm"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-xl bg-surface-200/80 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-200 transition-colors shadow-sm"
            title="Next period"
          >
            <ChevronRight size={16} />
          </button>

          <span className="text-sm font-bold text-surface-900 dark:text-surface-100 ml-2 font-mono">
            {dateRangeLabel}
          </span>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-3 text-xs text-surface-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-primary-500" />
            Tracked: <strong className="text-surface-900 dark:text-surface-100 font-mono">{formatMinutes(totalLoggedMinutes)}</strong>
          </span>
          <span className="text-surface-300 dark:text-surface-600">|</span>
          <span className="flex items-center gap-1.5">
            <CheckSquare size={13} className="text-pastel-chai-dark dark:text-pastel-chai" />
            Due Tasks: <strong className="text-surface-900 dark:text-surface-100 font-mono">{rangeTasks.length}</strong>
          </span>
        </div>
      </div>

      {/* ── Timeline Grid Content ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col">
        {isLoadingLogs ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-surface-400">
            <Loader2 size={24} className="animate-spin text-primary-500" />
            <span className="text-xs font-medium">Loading schedule…</span>
          </div>
        ) : viewMode === 'daily' ? (
          <DailyTimelineGrid
            selectedDate={currentDate}
            timeLogs={timeLogs}
            tasks={rangeTasks}
            onSlotClick={(hourStr) => handleSlotClick(hourStr)}
            onSelectLog={(log) => setSelectedLogDetail(log)}
            onSelectTask={(task) => {
              setSelectedTaskForEdit(task);
              setIsTaskModalOpen(true);
            }}
          />
        ) : (
          <WeeklyTimelineGrid
            weekStartDate={currentDate}
            timeLogs={timeLogs}
            tasks={rangeTasks}
            onSlotClick={(dateStr, hourStr) => handleSlotClick(dateStr, hourStr)}
            onSelectLog={(log) => setSelectedLogDetail(log)}
            onSelectTask={(task) => {
              setSelectedTaskForEdit(task);
              setIsTaskModalOpen(true);
            }}
          />
        )}
      </div>

      {/* ── TimeLog Detail Popover / Modal ────────────────────────────────── */}
      {selectedLogDetail && (
        <Modal
          isOpen={Boolean(selectedLogDetail)}
          onClose={() => setSelectedLogDetail(null)}
          title="Time Log Details"
          size="sm"
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
                {selectedLogDetail.taskId?.title || selectedLogDetail.notes || 'Focus Session'}
              </h3>
              <div className="text-xs text-surface-500 flex items-center gap-2">
                <Clock size={12} className="text-primary-500" />
                <span className="font-mono">
                  {formatTimeOfDay(selectedLogDetail.startTime)} – {formatTimeOfDay(selectedLogDetail.endTime)}
                </span>
                <span className="font-bold text-surface-800 dark:text-surface-200 font-mono">
                  ({formatMinutes(selectedLogDetail.durationMinutes)})
                </span>
              </div>
            </div>

            {selectedLogDetail.notes && (
              <p className="text-xs text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-850 p-3 rounded-xl border border-surface-200 dark:border-surface-700">
                {selectedLogDetail.notes}
              </p>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-surface-200 dark:border-surface-700">
              <button
                onClick={() => handleDeleteLog(selectedLogDetail._id)}
                disabled={isDeletingLog}
                className="btn-danger text-xs py-1.5 px-3 gap-1"
              >
                {isDeletingLog ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Delete Log
              </button>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="btn-ghost text-xs py-1.5 px-3.5"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <ManualLogModal
        isOpen={isManualLogModalOpen}
        onClose={() => setIsManualLogModalOpen(false)}
        onSuccess={loadLogs}
        initialDate={manualModalDefaults.date}
        initialStartTime={manualModalDefaults.startTime}
      />

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTaskForEdit(null);
        }}
        task={selectedTaskForEdit}
      />
    </div>
  );
}
