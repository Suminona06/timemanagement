import { useState, useEffect, useCallback } from 'react';
import {
  BarChart2,
  Clock,
  Flame,
  Sparkles,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { fetchAnalyticsSummary } from '../../services/analyticsService';
import { formatMinutes } from '../../utils/timeFormatters';
import CategoryDonutChart from './components/CategoryDonutChart';
import FocusTrendBarChart from './components/FocusTrendBarChart';
import EstimationAccuracyCard from './components/EstimationAccuracyCard';
import StreakTrackerCard from './components/StreakTrackerCard';

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week',  label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all',   label: 'All Time' },
];

/**
 * AnalyticsView — Comprehensive productivity dashboard and metrics reporting view.
 * Styled with ChronoCraft Warm Lo-Fi & Pastel palette.
 */
export default function AnalyticsView() {
  const [period, setPeriod] = useState('week');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchAnalyticsSummary(period);
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics summary.');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = analyticsData?.summary || {};
  const categoryBreakdown = analyticsData?.categoryBreakdown || [];
  const dailyTrend = analyticsData?.dailyTrend || [];
  const estimationAccuracy = analyticsData?.estimationAccuracy || {};
  const streak = analyticsData?.streak || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 animate-fade-in">
      {/* ── Page Header & Period Selector ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-300 dark:border-surface-700/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
            <BarChart2 size={24} className="text-primary-500" />
            Productivity Analytics
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Actionable insights on your focus time, category allocation, and precision.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex bg-surface-200/80 dark:bg-surface-800 p-1 rounded-2xl border border-surface-300 dark:border-surface-700 self-start sm:self-auto shadow-warm-sm">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                period === p.id
                  ? 'bg-primary-500 text-white shadow-sm font-bold'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-danger-500/10 border border-danger-500/30 text-danger-600 dark:text-danger-400 text-sm font-medium shadow-warm-sm">
          {error}
        </div>
      )}

      {isLoading && !analyticsData ? (
        <div className="flex flex-col items-center justify-center h-80 gap-3 text-surface-400">
          <Loader2 size={32} className="animate-spin text-primary-500" />
          <p className="text-sm font-medium">Calculating productivity metrics…</p>
        </div>
      ) : (
        <>
          {/* ── Metric KPI Cards ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Total Focus Hours */}
            <div className="card p-4 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 border-l-[4px] border-l-primary-500 shadow-warm-sm space-y-1">
              <span className="text-xs text-surface-500 font-semibold flex items-center gap-1.5">
                <Clock size={14} className="text-primary-500" />
                Total Focus Time
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-100 font-mono tracking-tight">
                {summary.totalHours ?? 0} <span className="text-sm font-sans font-medium text-surface-500">hrs</span>
              </div>
              <p className="text-[11px] text-surface-500">
                {formatMinutes(summary.totalMinutes || 0)} total logged
              </p>
            </div>

            {/* KPI 2: Total Sessions */}
            <div className="card p-4 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 border-l-[4px] border-l-pastel-chai-dark dark:border-l-pastel-chai shadow-warm-sm space-y-1">
              <span className="text-xs text-surface-500 font-semibold flex items-center gap-1.5">
                <Sparkles size={14} className="text-pastel-chai-dark dark:text-pastel-chai" />
                Focus Sessions
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-100 font-mono tracking-tight">
                {summary.totalSessions ?? 0}
              </div>
              <p className="text-[11px] text-surface-500">
                Avg. {summary.avgSessionMinutes ?? 0}m per session
              </p>
            </div>

            {/* KPI 3: Accuracy Score */}
            <div className="card p-4 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 border-l-[4px] border-l-pastel-matcha-dark dark:border-l-pastel-matcha shadow-warm-sm space-y-1">
              <span className="text-xs text-surface-500 font-semibold flex items-center gap-1.5">
                <TrendingUp size={14} className="text-pastel-matcha-dark dark:text-pastel-matcha" />
                Estimation Accuracy
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-100 font-mono tracking-tight">
                {estimationAccuracy.scorePercentage ?? 100}%
              </div>
              <p className="text-[11px] text-surface-500">
                {estimationAccuracy.accurateTasksCount ?? 0} of {estimationAccuracy.totalEvaluatedTasks ?? 0} tasks on target
              </p>
            </div>

            {/* KPI 4: Active Streak */}
            <div className="card p-4 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 border-l-[4px] border-l-pastel-peach-dark dark:border-l-pastel-peach shadow-warm-sm space-y-1">
              <span className="text-xs text-surface-500 font-semibold flex items-center gap-1.5">
                <Flame size={14} className="text-pastel-peach-dark dark:text-pastel-peach" />
                Current Streak
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-100 font-mono tracking-tight">
                {streak.currentStreakDays ?? 0} <span className="text-sm font-sans font-medium text-surface-500">days</span>
              </div>
              <p className="text-[11px] text-surface-500">
                Goal: {streak.dailyGoalHours ?? 8}h / day
              </p>
            </div>
          </div>

          {/* ── Charts Grid (Donut Chart & Bar Chart) ────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CategoryDonutChart data={categoryBreakdown} />
            <FocusTrendBarChart
              data={dailyTrend}
              dailyGoalHours={streak.dailyGoalHours || 8}
            />
          </div>

          {/* ── Deep Analytics Grid (Accuracy & Streak Tracker) ──────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <EstimationAccuracyCard data={estimationAccuracy} />
            <StreakTrackerCard data={streak} />
          </div>
        </>
      )}
    </div>
  );
}
