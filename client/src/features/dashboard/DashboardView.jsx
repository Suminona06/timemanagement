import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  Flame,
  Sparkles,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { format, isToday } from 'date-fns';
import useAuthStore from '../../stores/authStore';
import useTaskStore from '../../stores/taskStore';
import useTimerStore from '../../stores/timerStore';
import { fetchTimeLogs } from '../../services/timeLogService';
import { formatMinutes } from '../../utils/timeFormatters';
import DailyGoalProgressRing from './components/DailyGoalProgressRing';
import QuickStartWidget from './components/QuickStartWidget';
import TodayScheduleCard from './components/TodayScheduleCard';
import RecentTasksWidget from './components/RecentTasksWidget';

/**
 * Get friendly time of day greeting based on local clock.
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * DashboardView — Executive Central Hub view combining daily goals, quick actions, and task overview.
 */
export default function DashboardView() {
  const { user } = useAuthStore();
  const { tasks, init } = useTaskStore();
  const { pomodoroCyclesCompleted } = useTimerStore();

  const [todayLogs, setTodayLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const dailyGoalHours = user?.preferences?.dailyGoalHours || 8;

  // Load today's time logs
  const loadTodayLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchTimeLogs({
        startDate: todayStr,
        endDate: todayStr,
        limit: 100,
      });
      setTodayLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load today logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    init();
    loadTodayLogs();
  }, [init, loadTodayLogs]);

  // Compute today's total tracked minutes
  const todayTrackedMinutes = useMemo(() => {
    return todayLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
  }, [todayLogs]);

  // Tasks due today
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate)));
  }, [tasks]);

  // Task stats
  const completedTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'Completed').length;
  }, [tasks]);

  const greeting = getGreeting();
  const formattedToday = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 animate-fade-in">
      {/* ── Welcome Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-100 flex items-center gap-2">
            <LayoutDashboard size={24} className="text-primary-400" />
            {greeting}, {user?.username || 'Focus Master'}!
          </h1>
          <p className="text-xs sm:text-sm text-surface-400 mt-0.5">
            {formattedToday} · Ready to make today productive and focused?
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/timer"
            className="btn-primary text-xs py-2 px-3 gap-1.5 shadow-md shadow-primary-500/20"
          >
            <Sparkles size={14} />
            Focus Room
          </Link>
          <Link
            to="/analytics"
            className="btn-ghost text-xs py-2 px-3 gap-1.5"
          >
            <TrendingUp size={14} />
            Analytics
          </Link>
        </div>
      </div>

      {/* ── Top Summary KPI Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Today's Focus Time */}
        <div className="card p-4 bg-surface-800 border-surface-700 space-y-1">
          <span className="text-xs text-surface-400 font-medium flex items-center gap-1.5">
            <Clock size={14} className="text-primary-400" />
            Focus Time Today
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-surface-100 font-mono">
            {formatMinutes(todayTrackedMinutes)}
          </div>
          <p className="text-[11px] text-surface-500">
            Target: {dailyGoalHours}h ({Math.min(100, Math.round((todayTrackedMinutes / (dailyGoalHours * 60)) * 100))}%)
          </p>
        </div>

        {/* KPI 2: Tasks Completed */}
        <div className="card p-4 bg-surface-800 border-surface-700 space-y-1">
          <span className="text-xs text-surface-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Tasks Completed
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-surface-100 font-mono">
            {completedTasksCount} <span className="text-sm font-sans font-medium text-surface-400">/ {tasks.length}</span>
          </div>
          <p className="text-[11px] text-surface-500">
            {tasks.length - completedTasksCount} tasks remaining
          </p>
        </div>

        {/* KPI 3: Today's Focus Sessions */}
        <div className="card p-4 bg-surface-800 border-surface-700 space-y-1">
          <span className="text-xs text-surface-400 font-medium flex items-center gap-1.5">
            <Sparkles size={14} className="text-cyan-400" />
            Sessions Logged
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-surface-100 font-mono">
            {todayLogs.length}
          </div>
          <p className="text-[11px] text-surface-500">
            {pomodoroCyclesCompleted} Pomodoro cycles total
          </p>
        </div>

        {/* KPI 4: Scheduled Due Today */}
        <div className="card p-4 bg-surface-800 border-surface-700 space-y-1">
          <span className="text-xs text-surface-400 font-medium flex items-center gap-1.5">
            <Calendar size={14} className="text-amber-400" />
            Tasks Due Today
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-surface-100 font-mono">
            {todayTasks.length}
          </div>
          <p className="text-[11px] text-surface-500">
            <Link to="/calendar" className="text-primary-400 hover:underline">
              View on calendar →
            </Link>
          </p>
        </div>
      </div>

      {/* ── Main 2x2 Executive Widgets Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Widget 1: Daily Goal Progress Ring */}
        <DailyGoalProgressRing
          todayMinutes={todayTrackedMinutes}
          dailyGoalHours={dailyGoalHours}
        />

        {/* Widget 2: Quick Start Launcher */}
        <QuickStartWidget />

        {/* Widget 3: Today's Schedule & Completed Logs */}
        <TodayScheduleCard
          todayTasks={todayTasks}
          todayLogs={todayLogs}
        />

        {/* Widget 4: Active & Pending Tasks */}
        <RecentTasksWidget />
      </div>
    </div>
  );
}
