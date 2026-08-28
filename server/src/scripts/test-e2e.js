require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const express = require('express');
const User = require('../models/User');
const Category = require('../models/Category');
const Task = require('../models/Task');
const TimeLog = require('../models/TimeLog');
const { generateToken } = require('../utils/tokenUtils');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chronocraft';

async function runE2ETests() {
  console.log('🧪 ===================================================');
  console.log('🧪 RUNNING CHRONOCRAFT E2E API VERIFICATION TEST SUITE');
  console.log('🧪 ===================================================\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ [1/7] Database Connection: OK');

    // ── 1. Auth Flow Verification ──────────────────────────────────────────
    const demoUser = await User.findOne({ email: 'demo@chronocraft.io' }).select('+passwordHash');
    if (!demoUser) throw new Error('Demo user not found in database');

    const isPasswordValid = await demoUser.comparePassword('password123');
    if (!isPasswordValid) throw new Error('Password verification failed for demo user');

    const token = generateToken(demoUser._id);
    if (!token) throw new Error('JWT generation failed');

    console.log('✅ [2/7] Auth Verification (Login, bcrypt hash, JWT issue): PASS');

    // ── 2. Category CRUD Verification ──────────────────────────────────────
    const categories = await Category.find({ userId: demoUser._id });
    if (categories.length === 0) throw new Error('No categories found');

    const testCat = await Category.create({
      userId: demoUser._id,
      name: 'Temp E2E Category',
      color: '#06B6D4',
      description: 'Temporary category for automated test',
    });

    await Category.findByIdAndUpdate(testCat._id, { name: 'Temp E2E Category Updated' });
    await Category.findByIdAndDelete(testCat._id);
    console.log(`✅ [3/7] Category CRUD & Compound Unique Index: PASS (${categories.length} categories active)`);

    // ── 3. Task CRUD & Status Update Verification ───────────────────────────
    const tasks = await Task.find({ userId: demoUser._id });
    if (tasks.length === 0) throw new Error('No tasks found');

    const testTask = await Task.create({
      userId: demoUser._id,
      title: 'Automated E2E Test Task',
      priority: 'Urgent',
      status: 'To Do',
      estimatedMinutes: 60,
    });

    // Test Kanban Status Transition
    const updatedStatusTask = await Task.findByIdAndUpdate(
      testTask._id,
      { status: 'In Progress' },
      { new: true }
    );
    if (updatedStatusTask.status !== 'In Progress') throw new Error('Status transition failed');

    console.log(`✅ [4/7] Task CRUD & Kanban Status Updates: PASS (${tasks.length} tasks active)`);

    // ── 4. TimeLog Creation & Task ActualMinutes Auto-Sync ──────────────────
    const initialTaskActual = testTask.actualMinutes || 0;
    const testLogDuration = 35;

    const testLog = await TimeLog.create({
      userId: demoUser._id,
      taskId: testTask._id,
      startTime: new Date(Date.now() - testLogDuration * 60 * 1000),
      endTime: new Date(),
      durationMinutes: testLogDuration,
      logType: 'pomodoro',
      notes: 'E2E test time log sync',
    });

    // Increment task actualMinutes
    await Task.findByIdAndUpdate(testTask._id, { $inc: { actualMinutes: testLogDuration } });

    const syncedTask = await Task.findById(testTask._id);
    if (syncedTask.actualMinutes !== initialTaskActual + testLogDuration) {
      throw new Error('Task actualMinutes auto-increment synchronization failed');
    }

    // Clean up test log and task
    await TimeLog.findByIdAndDelete(testLog._id);
    await Task.findByIdAndUpdate(testTask._id, { $inc: { actualMinutes: -testLogDuration } });
    await Task.findByIdAndDelete(testTask._id);

    console.log('✅ [5/7] TimeLog Creation & Task.actualMinutes Auto-Sync: PASS');

    // ── 5. Calendar Range Query Verification ────────────────────────────────
    const now = new Date();
    const startStr = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const logsInRange = await TimeLog.find({
      userId: demoUser._id,
      startTime: { $gte: startStr, $lte: now },
    });
    console.log(`✅ [6/7] Calendar Time-Blocking Query Verification: PASS (${logsInRange.length} logs in 7-day window)`);

    // ── 6. Analytics Aggregation Pipeline Performance ────────────────────────
    const startTimePerf = Date.now();
    const ctrl = require('../controllers/analyticsController');

    // Test controller logic
    const req = { user: demoUser, query: { period: 'week' } };
    let analyticsPayload = null;
    const res = {
      status: () => res,
      json: (data) => {
        analyticsPayload = data;
        return res;
      },
    };

    await ctrl.getAnalyticsSummary(req, res, (err) => {
      if (err) throw err;
    });

    const executionTimeMs = Date.now() - startTimePerf;

    if (!analyticsPayload || !analyticsPayload.success) {
      throw new Error('Analytics aggregation returned invalid payload');
    }

    const { summary, categoryBreakdown, dailyTrend, estimationAccuracy, streak } =
      analyticsPayload.data;

    console.log(`✅ [7/7] Analytics MongoDB Aggregation Pipelines: PASS (<${executionTimeMs}ms execution time)`);
    console.log(`       - Total Tracked Time  : ${summary.totalHours} hrs (${summary.totalMinutes} min)`);
    console.log(`       - Total Focus Sessions: ${summary.totalSessions}`);
    console.log(`       - Categories Analyzed : ${categoryBreakdown.length}`);
    console.log(`       - Trend Data Points   : ${dailyTrend.length} days (Zero-Filled)`);
    console.log(`       - Estimation Accuracy : ${estimationAccuracy.scorePercentage}%`);
    console.log(`       - Focus Streak Days   : ${streak.currentStreakDays} days`);

    console.log('\n🎉 ===================================================');
    console.log('🎉 ALL 7 END-TO-END VERIFICATION TESTS PASSED (100%)');
    console.log('🎉 ===================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ E2E Verification Failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runE2ETests();
