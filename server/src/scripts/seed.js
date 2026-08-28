require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Task = require('../models/Task');
const TimeLog = require('../models/TimeLog');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chronocraft';

/**
 * seed.js — Realistic test dataset generator for ChronoCraft.
 * Creates Demo User, Categories, Scheduled Tasks, and 14-day Historical TimeLogs.
 */
async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully.');

    // ── 1. Create or Find Demo User ──────────────────────────────────────────
    const demoEmail = 'demo@chronocraft.io';
    let user = await User.findOne({ email: demoEmail });

    if (user) {
      console.log('🧹 Cleaning existing data for demo user:', demoEmail);
      await Promise.all([
        Category.deleteMany({ userId: user._id }),
        Task.deleteMany({ userId: user._id }),
        TimeLog.deleteMany({ userId: user._id }),
      ]);
    } else {
      console.log('👤 Creating demo user account...');
      user = await User.create({
        username: 'alex_rivera',
        email: demoEmail,
        passwordHash: 'password123', // Will be hashed by User pre-save hook
        preferences: {
          dailyGoalHours: 6,
          pomodoroWorkMinutes: 25,
          pomodoroShortBreakMinutes: 5,
          pomodoroLongBreakMinutes: 15,
          longBreakInterval: 4,
          theme: 'dark',
          soundEnabled: true,
        },
      });
      console.log('✅ Demo user created:', user.email);
    }

    // ── 2. Create Categories ────────────────────────────────────────────────
    console.log('📁 Seeding categories...');
    const categoriesData = [
      { name: 'Core Engineering', color: '#3B82F6', description: 'Architecture, backend APIs & database' },
      { name: 'UI / UX Design',   color: '#EC4899', description: 'Figma mockups, design systems & animations' },
      { name: 'Product Growth',   color: '#8B5CF6', description: 'User research, analytics & marketing' },
      { name: 'Self Learning',    color: '#10B981', description: 'Reading papers, tutorials & AI research' },
      { name: 'Health & Wellness',color: '#F59E0B', description: 'Workouts, meditation & posture breaks' },
    ];

    const categories = await Category.insertMany(
      categoriesData.map((c) => ({ ...c, userId: user._id }))
    );
    console.log(`✅ Seeded ${categories.length} categories.`);

    const [catEng, catDesign, catGrowth, catLearn, catHealth] = categories;

    // ── 3. Create Tasks ─────────────────────────────────────────────────────
    console.log('📋 Seeding tasks...');
    const now = new Date();
    const addDays = (d, n) => new Date(d.getTime() + n * 24 * 60 * 60 * 1000);

    const tasksData = [
      {
        title: 'Design high-converting Landing Page hero section',
        description: 'Explore dark-mode glassmorphic cards and interactive SVG preview.',
        categoryId: catDesign._id,
        priority: 'High',
        status: 'Completed',
        estimatedMinutes: 90,
        actualMinutes: 110,
        dueDate: addDays(now, -3),
        tags: ['design', 'figma', 'ui'],
      },
      {
        title: 'Implement MongoDB Aggregation for Analytics Engine',
        description: 'Write performant multi-stage pipelines for daily focus trends & streaks.',
        categoryId: catEng._id,
        priority: 'Urgent',
        status: 'Completed',
        estimatedMinutes: 120,
        actualMinutes: 135,
        dueDate: addDays(now, -1),
        tags: ['backend', 'mongodb', 'performance'],
      },
      {
        title: 'Build Drift-Resilient Timer Engine with Web Workers',
        description: 'Ensure timer uses epoch timestamps to eliminate tab throttling clock lag.',
        categoryId: catEng._id,
        priority: 'Urgent',
        status: 'Completed',
        estimatedMinutes: 60,
        actualMinutes: 50,
        dueDate: addDays(now, -2),
        tags: ['engine', 'state', 'hooks'],
      },
      {
        title: 'Interactive 24-Hour Time-Blocking Calendar Grid',
        description: 'Render side-by-side lanes for planned tasks vs completed time logs.',
        categoryId: catEng._id,
        priority: 'High',
        status: 'In Progress',
        estimatedMinutes: 180,
        actualMinutes: 120,
        dueDate: now, // Due Today
        tags: ['calendar', 'frontend', 'recharts'],
      },
      {
        title: 'Design Iconography & Color Tokens for Dark Mode',
        description: 'Audit WCAG contrast ratios across all semantic badge components.',
        categoryId: catDesign._id,
        priority: 'Medium',
        status: 'In Progress',
        estimatedMinutes: 60,
        actualMinutes: 30,
        dueDate: now, // Due Today
        tags: ['tokens', 'accessibility'],
      },
      {
        title: 'Audit User Onboarding Drop-off Funnel',
        description: 'Analyze telemetry logs from register to first focus session completion.',
        categoryId: catGrowth._id,
        priority: 'High',
        status: 'To Do',
        estimatedMinutes: 75,
        actualMinutes: 0,
        dueDate: addDays(now, 1),
        tags: ['analytics', 'funnel', 'growth'],
      },
      {
        title: 'Read Google DeepMind Paper on Agentic Planning',
        description: 'Summarize insights on autonomous reasoning trajectories.',
        categoryId: catLearn._id,
        priority: 'Medium',
        status: 'In Progress',
        estimatedMinutes: 90,
        actualMinutes: 45,
        dueDate: addDays(now, 2),
        tags: ['ai', 'research', 'deepmind'],
      },
      {
        title: 'Morning Yoga & Core Posture Workout',
        description: 'Daily spinal decompression and ergonomic stretching routine.',
        categoryId: catHealth._id,
        priority: 'Low',
        status: 'Completed',
        estimatedMinutes: 30,
        actualMinutes: 30,
        dueDate: now,
        tags: ['wellness', 'routine'],
      },
      {
        title: 'Implement Global Command Palette (Cmd+K)',
        description: 'Add fuzzy spotlight search for actions, views, and quick timers.',
        categoryId: catEng._id,
        priority: 'High',
        status: 'Completed',
        estimatedMinutes: 90,
        actualMinutes: 80,
        dueDate: addDays(now, -1),
        tags: ['ux', 'shortcuts'],
      },
      {
        title: 'Optimize Webpack/Vite Bundle Chunk Splitting',
        description: 'Lazy load Recharts and date-fns to reduce initial JS payload under 200kb.',
        categoryId: catEng._id,
        priority: 'Medium',
        status: 'To Do',
        estimatedMinutes: 60,
        actualMinutes: 0,
        dueDate: addDays(now, 3),
        tags: ['vite', 'optimization'],
      },
      {
        title: 'Draft Monthly Product Update Newsletter',
        description: 'Highlight new Kanban board, focus room sound alerts, and calendar view.',
        categoryId: catGrowth._id,
        priority: 'Low',
        status: 'To Do',
        estimatedMinutes: 45,
        actualMinutes: 0,
        dueDate: addDays(now, 4),
        tags: ['newsletter', 'marketing'],
      },
      {
        title: 'Refactor REST API Error Handlers to RFC 7807 Standard',
        description: 'Provide structured machine-readable error details on all endpoints.',
        categoryId: catEng._id,
        priority: 'Low',
        status: 'Archived',
        estimatedMinutes: 60,
        actualMinutes: 45,
        dueDate: addDays(now, -6),
        tags: ['api', 'refactor'],
      },
      {
        title: 'Conduct 5 User Feedback Interviews',
        description: 'Interview beta users on Pomodoro timer usability and sound cues.',
        categoryId: catGrowth._id,
        priority: 'Medium',
        status: 'To Do',
        estimatedMinutes: 150,
        actualMinutes: 0,
        dueDate: addDays(now, 5),
        tags: ['interviews', 'ux'],
      },
    ];

    const tasks = await Task.insertMany(
      tasksData.map((t) => ({ ...t, userId: user._id }))
    );
    console.log(`✅ Seeded ${tasks.length} tasks.`);

    // ── 4. Generate 14-Day Historical TimeLogs ──────────────────────────────
    console.log('⏱ Generating 14-day historical TimeLogs...');
    const timeLogsData = [];

    // Realistic time slots per day over last 14 days
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const dayDate = addDays(now, -dayOffset);
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

      // 3 to 6 focus sessions per weekday, 1 to 2 on weekends
      const sessionCount = isWeekend ? 2 : 4 + (dayOffset % 3);

      let currentHour = 9; // Start at 9:00 AM

      for (let s = 0; s < sessionCount; s++) {
        const durationMinutes = [25, 30, 45, 50, 60][(dayOffset + s) % 5];
        const taskObj = tasks[(dayOffset + s) % tasks.length];

        const startTime = new Date(dayDate);
        startTime.setHours(currentHour, (s * 10) % 60, 0, 0);

        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

        timeLogsData.push({
          userId: user._id,
          taskId: taskObj._id,
          categoryId: taskObj.categoryId,
          startTime,
          endTime,
          durationMinutes,
          logType: s % 2 === 0 ? 'pomodoro' : 'stopwatch',
          notes: `Deep focus sprint on ${taskObj.title.slice(0, 35)}...`,
        });

        // Advance schedule
        currentHour += Math.floor(durationMinutes / 60) + 1;
        if (currentHour >= 19) break; // Don't log past 7 PM
      }
    }

    const logs = await TimeLog.insertMany(timeLogsData);
    console.log(`✅ Seeded ${logs.length} realistic TimeLogs across the last 14 days.`);

    console.log('\n🎉 ================================================');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('🎉 ================================================');
    console.log('📧 Demo Login Email    : demo@chronocraft.io');
    console.log('🔑 Demo Login Password : password123');
    console.log(`📊 Total Categories    : ${categories.length}`);
    console.log(`📋 Total Tasks         : ${tasks.length}`);
    console.log(`⏱ Total TimeLogs      : ${logs.length}`);
    console.log('🎉 ================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database Seeding Failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();
