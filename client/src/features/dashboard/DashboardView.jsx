import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  Sparkles,
  Calendar,
  TrendingUp,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-300 dark:border-surface-700/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2 tracking-tight">
            <LayoutDashboard size={24} className="text-primary-500" />
            {greeting}, {user?.username || 'Mindful Crafter'}!
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            {formattedToday} · Step into flow and craft your day with intention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/timer"
            className="btn-primary text-xs py-2 px-3.5 gap-1.5 shadow-warm-sm"
          >
            <Sparkles size={14} />
            Focus Room
          </Link>
          <Link
            to="/analytics"
            className="btn-ghost text-xs py-2 px-3.5 gap-1.5 rounded-xl shadow-warm-sm"
          >
            <TrendingUp size={14} className="text-primary-500" />
            Analytics
          </Link>
        </div>
      </div>

      {/* ── Top Summary KPI Cards with Pastel Borders & Accents ──────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Today's Focus Time */}
        <div className="card p-4 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 border-l-[4px] border-l-primary-500 shadow-warm-sm space-y-1">
          <span className="text-xs text-surface-500 font-semibold flex items-center gap-1.5">
            <Clock size={14} className="text-primary-500" />
            Focus Time Today
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-100 font-mono tracking-tight">
            {formatMinutes(todayTrackedMinutes)}
          </div>
          <p className="text-[11px] text-surface-500">
            Target: {dailyGoalHours}h ({Math.min(100, Math.round((todayTrackedMinutes / (dailyGoalHours * 60)) * 100))}%)
          </p>
        </div>

        {/* KPI 2: Tasks Completed */}
        <div className="card p-4 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 border-l-[4px] border-l-pastel-matcha-dark dark:border-l-pastel-matcha shadow-warm-sm space-y-1">
          <span className="text-xs text-surface-500 font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-pastel-matcha-dark dark:text-pastel-matcha" />
            Tasks Completed
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-100 font-mono tracking-tight">
            {completedTasksCount} <span className="text-sm font-sans font-medium text-surface-400">/ {tasks.length}</span>
          </div>
          <p className="text-[11px] text-surface-500">
            {tasks.length - completedTasksCount} tasks remaining
          </p>
        </div>

        {/* KPI 3: Today's Focus Sessions */}
        <div className="card p-4 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 border-l-[4px] border-l-pastel-chai-dark dark:border-l-pastel-chai shadow-warm-sm space-y-1">
          <span className="text-xs text-surface-500 font-semibold flex items-center gap-1.5">
            <Sparkles size={14} className="text-pastel-chai-dark dark:text-pastel-chai" />
            Sessions Logged
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-100 font-mono tracking-tight">
            {todayLogs.length}
          </div>
          <p className="text-[11px] text-surface-500">
            {pomodoroCyclesCompleted} Pomodoro cycles total
          </p>
        </div>

        {/* KPI 4: Scheduled Due Today */}
        <div className="card p-4 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 border-l-[4px] border-l-pastel-peach-dark dark:border-l-pastel-peach shadow-warm-sm space-y-1">
          <span className="text-xs text-surface-500 font-semibold flex items-center gap-1.5">
            <Calendar size={14} className="text-pastel-peach-dark dark:text-pastel-peach" />
            Tasks Due Today
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-100 font-mono tracking-tight">
            {todayTasks.length}
          </div>
          <p className="text-[11px] text-surface-500">
            <Link to="/calendar" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
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
