const mongoose = require('mongoose');
const TimeLog = require('../models/TimeLog');
const Task = require('../models/Task');

// Helper: Format date as YYYY-MM-DD in local time
function formatDateKey(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ─── GET /api/analytics/summary ───────────────────────────────────────────────
/**
 * Computes high-performance productivity analytics for the authenticated user.
 *
 * Query params:
 *  period — 'today' | 'week' | 'month' | 'all' (default: 'week')
 */
const getAnalyticsSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { period = 'week' } = req.query;

    const now = new Date();
    let startDate = new Date();
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    let daysCount = 7;

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        daysCount = 1;
        break;
      case 'month':
        startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        daysCount = 30;
        break;
      case 'all':
        startDate = new Date(0); // Epoch
        daysCount = 90;
        break;
      case 'week':
      default:
        startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        daysCount = 7;
        break;
    }

    // ── 1. Match Filter for TimeLogs ──────────────────────────────────────────
    const matchStage = {
      userId,
      startTime: { $gte: startDate, $lte: endDate },
    };

    // ── 2. Run Aggregations in Parallel ───────────────────────────────────────
    const [
      categoryAggregation,
      dailyTrendAggregation,
      totalStats,
      timeOfDayAggregation,
      tasksForAccuracy,
      pastLogsForStreak,
    ] = await Promise.all([
      // A. Category Breakdown
      TimeLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$categoryId',
            totalMinutes: { $sum: '$durationMinutes' },
            sessionCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryDetails',
          },
        },
        {
          $unwind: {
            path: '$categoryDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        { $sort: { totalMinutes: -1 } },
      ]),

      // B. Daily Focus Trend
      TimeLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$startTime' },
            },
            totalMinutes: { $sum: '$durationMinutes' },
            sessionCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // C. Overall Summary in Period
      TimeLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalMinutes: { $sum: '$durationMinutes' },
            totalSessions: { $sum: 1 },
            avgSessionMinutes: { $avg: '$durationMinutes' },
          },
        },
      ]),

      // D. Time of Day Distribution (Hour groups)
      TimeLog.aggregate([
        { $match: matchStage },
        {
          $project: {
            durationMinutes: 1,
            hour: { $hour: '$startTime' },
          },
        },
        {
          $project: {
            durationMinutes: 1,
            timeSlot: {
              $switch: {
                branches: [
                  { case: { $and: [{ $gte: ['$hour', 5] }, { $lt: ['$hour', 12] }] }, then: 'Morning' },
                  { case: { $and: [{ $gte: ['$hour', 12] }, { $lt: ['$hour', 17] }] }, then: 'Afternoon' },
                  { case: { $and: [{ $gte: ['$hour', 17] }, { $lt: ['$hour', 22] }] }, then: 'Evening' },
                ],
                default: 'Night',
              },
            },
          },
        },
        {
          $group: {
            _id: '$timeSlot',
            totalMinutes: { $sum: '$durationMinutes' },
          },
        },
      ]),

      // E. Tasks with both actual and estimated minutes for Estimation Accuracy
      Task.find({
        userId,
        actualMinutes: { $gt: 0 },
        estimatedMinutes: { $gt: 0 },
      })
        .select('title estimatedMinutes actualMinutes status priority')
        .lean(),

      // F. Logs in the past 60 days for streak calculation
      TimeLog.aggregate([
        {
          $match: {
            userId,
            startTime: {
              $gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$startTime' },
            },
            totalMinutes: { $sum: '$durationMinutes' },
          },
        },
      ]),
    ]);

    // ── 3. Post-Process Category Breakdown ────────────────────────────────────
    const totalMinutesPeriod = totalStats[0]?.totalMinutes || 0;
    const categoryBreakdown = categoryAggregation.map((cat) => ({
      categoryId: cat._id || null,
      name: cat.categoryDetails?.name || 'Uncategorized',
      color: cat.categoryDetails?.color || '#64748B',
      totalMinutes: cat.totalMinutes,
      totalHours: Number((cat.totalMinutes / 60).toFixed(1)),
      sessionCount: cat.sessionCount,
      percentage:
        totalMinutesPeriod > 0
          ? Math.round((cat.totalMinutes / totalMinutesPeriod) * 100)
          : 0,
    }));

    // ── 4. Fill Zeroes in Daily Focus Trend ────────────────────────────────────
    const trendMap = new Map();
    dailyTrendAggregation.forEach((item) => {
      trendMap.set(item._id, item.totalMinutes);
    });

    const dailyTrend = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = formatDateKey(d);
      const minutes = trendMap.get(dateKey) || 0;

      dailyTrend.push({
        date: dateKey,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalMinutes: minutes,
        totalHours: Number((minutes / 60).toFixed(1)),
      });
    }

    // ── 5. Calculate Estimation Accuracy ──────────────────────────────────────
    let totalAccuracyScore = 0;
    let accurateTasksCount = 0;
    let underEstimatedCount = 0;
    let overEstimatedCount = 0;

    tasksForAccuracy.forEach((task) => {
      const est = task.estimatedMinutes;
      const act = task.actualMinutes;

      // Ratio: 100% when exact, falls off symmetrically
      const ratio = Math.min(est, act) / Math.max(est, act);
      totalAccuracyScore += ratio * 100;

      if (act > est * 1.15) {
        underEstimatedCount++; // Took longer than expected
      } else if (act < est * 0.85) {
        overEstimatedCount++; // Took less than expected
      } else {
        accurateTasksCount++; // Within 15% margin
      }
    });

    const avgEstimationAccuracy =
      tasksForAccuracy.length > 0
        ? Math.round(totalAccuracyScore / tasksForAccuracy.length)
        : 100;

    // ── 6. Calculate Consecutive Days Streak ──────────────────────────────────
    const dailyGoalHours = req.user.preferences?.dailyGoalHours || 8;
    const dailyGoalMinutes = dailyGoalHours * 60;

    const streakMap = new Map();
    pastLogsForStreak.forEach((item) => {
      streakMap.set(item._id, item.totalMinutes);
    });

    let currentStreak = 0;
    const todayKey = formatDateKey(now);
    const todayMinutes = streakMap.get(todayKey) || 0;

    // Start checking from yesterday backwards (or today if today has activity)
    let checkDate = new Date(now);
    if (todayMinutes === 0) {
      // Check from yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateKey = formatDateKey(checkDate);
      const mins = streakMap.get(dateKey) || 0;

      // Count streak if at least 15 minutes or reached daily goal
      if (mins >= 15) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // ── 7. Format Time of Day Distribution ────────────────────────────────────
    const timeOfDaySlots = ['Morning', 'Afternoon', 'Evening', 'Night'];
    const timeOfDayMap = new Map();
    timeOfDayAggregation.forEach((item) => timeOfDayMap.set(item._id, item.totalMinutes));

    const timeOfDayDistribution = timeOfDaySlots.map((slot) => ({
      slot,
      totalMinutes: timeOfDayMap.get(slot) || 0,
      totalHours: Number(((timeOfDayMap.get(slot) || 0) / 60).toFixed(1)),
    }));

    // ── 8. Assemble Full Response Payload ─────────────────────────────────────
    res.status(200).json({
      success: true,
      data: {
        period,
        summary: {
          totalMinutes: totalMinutesPeriod,
          totalHours: Number((totalMinutesPeriod / 60).toFixed(1)),
          totalSessions: totalStats[0]?.totalSessions || 0,
          avgSessionMinutes: Math.round(totalStats[0]?.avgSessionMinutes || 0),
        },
        categoryBreakdown,
        dailyTrend,
        estimationAccuracy: {
          scorePercentage: avgEstimationAccuracy,
          totalEvaluatedTasks: tasksForAccuracy.length,
          accurateTasksCount,
          underEstimatedCount,
          overEstimatedCount,
        },
        streak: {
          currentStreakDays: currentStreak,
          dailyGoalHours,
          todayTrackedMinutes: todayMinutes,
          todayGoalPercent: Math.min(
            100,
            Math.round((todayMinutes / dailyGoalMinutes) * 100)
          ),
        },
        timeOfDayDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsSummary,
};
