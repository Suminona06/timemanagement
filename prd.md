# Product Requirement Document (PRD): Personal Time Management Application

**Project Name:** ChronoCraft (Personal Time Management Suite)  
**Target User:** Individual (Self-hosted / Personal Use)  
**Tech Stack:** MERN Stack (MongoDB, Express.js, React.js, Node.js)  
**Document Version:** 1.0.0  
**Date:** August 2026  

---

## 1. Executive Summary & Product Vision

### 1.1 Overview
The Personal Time Management Application is a unified, single-user focused web application designed to help individuals regain control over their time. By combining task management, live time tracking (stopwatch & Pomodoro), interactive time-blocking calendar views, and actionable productivity analytics, the application serves as a central hub for daily planning and reflection.

### 1.2 Vision Statement
To provide a distraction-free, customizable, and high-performance time management experience tailored to personal productivity workflows without unnecessary complexity or enterprise clutter.

### 1.3 Key Objectives
- **Centralize Planning:** Consolidate task lists, project categories, and daily schedules into one cohesive interface.
- **Accurate Time Tracking:** Track actual time spent on activities seamlessly using live timers or manual entry.
- **Visualize Productivity:** Deliver clear analytics comparing planned time vs. actual execution to identify time sinks and improve estimation accuracy.
- **Focus Enhancement:** Integrate structured Pomodoro sessions to maintain deep focus and prevent burnout.

---

## 2. Target Audience & User Persona

- **Primary User:** Software developer / Professional building a self-hosted time management tool for personal use.
- **Core Needs:**
  - Fast, keyboard-friendly UI/UX with modern aesthetics (Dark Mode).
  - Flexible task tagging and category color-coding.
  - Seamless tracking between different projects and learning routines.
  - Privacy and full ownership of time-tracking data.

---

## 3. Technology Stack & System Architecture

### 3.1 Technology Stack
| Layer | Tech / Library | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | UI Components & SPA Architecture |
| **Styling** | Tailwind CSS + Lucide Icons | Responsive modern styling & iconography |
| **State Management** | React Context API / Zustand | Global state for auth, timer, active task |
| **Data Visualization** | Recharts / Chart.js | Productivity dashboards & time distribution charts |
| **Backend API** | Node.js + Express.js | RESTful HTTP API & Authentication |
| **Database** | MongoDB (Mongoose ORM) | Document storage for tasks, logs, user preferences |
| **Authentication** | JWT (JSON Web Tokens) | Secure stateless user session management |
| **Security** | Bcrypt.js, Cors, Helmet | Password hashing and security middleware |

### 3.2 System Architecture Overview
```
+-------------------------------------------------------------------+
|                        React Frontend (Vite)                      |
|   +------------------+   +-------------------+   +------------+   |
|   | Task/Kanban View |   | Stopwatch/Pomodoro|   | Analytics  |   |
|   +------------------+   +-------------------+   +------------+   |
+---------------------------------+---------------------------------+
                                  | HTTP / REST API (JWT Header)
                                  v
+-------------------------------------------------------------------+
|                     Node.js / Express Backend                      |
|  +-------------------+  +-------------------+  +---------------+  |
|  | Auth & Middleware |  | Controllers/Routes|  | Mongoose Models| |
|  +-------------------+  +-------------------+  +---------------+  |
+---------------------------------+---------------------------------+
                                  | Mongoose Connection Driver
                                  v
+-------------------------------------------------------------------+
|                         MongoDB Database                          |
|    [Users]    [Tasks]    [Categories]    [TimeLogs]    [Settings] |
+-------------------------------------------------------------------+
```

---

## 4. Functional Requirements & Feature Specifications

### 4.1 Authentication & User Preferences
- **User Authentication:**
  - Email/Username + Password registration and login.
  - JWT token generation stored securely in browser `localStorage` / HTTP-only cookie.
  - Protected API middleware for user data isolation.
- **User Preferences & Settings:**
  - Custom daily working hour target (e.g., 8 hours/day).
  - Configurable Pomodoro parameters (Work duration, Short Break, Long Break, Long Break Interval).
  - Theme toggle (Dark Mode / Light Mode).

### 4.2 Task & Project/Category Management
- **Category/Project Organization:**
  - Create, edit, and delete categories with distinct custom color hex codes (e.g., Work = `#3B82F6`, Learning = `#10B981`, Personal = `#F59E0B`).
- **Task Features:**
  - **CRUD Operations:** Create, read, update, delete, archive tasks.
  - **Task Attributes:** Title, Description, Category, Priority (`Low`, `Medium`, `High`, `Urgent`), Status (`To Do`, `In Progress`, `Completed`), Estimated Duration (minutes), Actual Duration (auto-calculated from logs), Due Date, Tags.
  - **Task Views:**
    - **List View:** Filterable and sortable task list (by priority, category, status, due date).
    - **Kanban Board:** Drag-and-drop task columns (`To Do`, `In Progress`, `Completed`).

### 4.3 Time Tracking & Timers
- **Live Stopwatch:**
  - Select a task and start/pause/stop a real-time timer.
  - Persists timer state during navigation across app pages.
  - Auto-creates a `TimeLog` entry upon stopping the timer.
- **Pomodoro Timer:**
  - Interactive timer supporting Work / Short Break / Long Break phases.
  - Audio notification bells on phase completion.
  - Link Pomodoro sessions directly to specific tasks.
- **Manual Time Entry:**
  - Add past logs specifying Start Time, End Time, Duration, Category, Task, and Notes.

### 4.4 Time-Blocking & Calendar View
- **Interactive Schedule:**
  - Daily & Weekly timeline grid view.
  - Visual blocks representing scheduled tasks vs. completed time logs.
  - Drag-and-drop or click-to-add time slot allocation.

### 4.5 Analytics & Productivity Dashboard
- **Visual Reports:**
  - **Time Allocation Chart:** Donut chart breaking down hours spent by Category/Project.
  - **Daily Focus Trend:** Bar chart comparing daily tracked hours vs. daily goal target over the past 7/30 days.
  - **Estimation Accuracy:** Comparison metric between Estimated Minutes vs. Actual Logged Minutes.
  - **Streak Tracker:** Continuous days achieving target focused work hours.

---

## 5. Database Schema & Data Models

### 5.1 User Schema (`User.js`)
```javascript
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  preferences: {
    dailyGoalHours: { type: Number, default: 8 },
    pomodoroWorkMinutes: { type: Number, default: 25 },
    pomodoroShortBreakMinutes: { type: Number, default: 5 },
    pomodoroLongBreakMinutes: { type: Number, default: 15 },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' }
  },
  createdAt: { type: Date, default: Date.now }
}
```

### 5.2 Category Schema (`Category.js`)
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  color: { type: String, default: '#3B82F6' },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```

### 5.3 Task Schema (`Task.js`)
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['To Do', 'In Progress', 'Completed', 'Archived'], default: 'To Do' },
  estimatedMinutes: { type: Number, default: 0 },
  actualMinutes: { type: Number, default: 0 },
  dueDate: { type: Date },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 5.4 TimeLog Schema (`TimeLog.js`)
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
  logType: { type: String, enum: ['stopwatch', 'pomodoro', 'manual'], default: 'stopwatch' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 6. API Endpoint Design

### 6.1 Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate and return JWT token
- `GET /api/auth/me` - Fetch authenticated user profile & preferences
- `PUT /api/auth/preferences` - Update user preferences

### 6.2 Category Routes (`/api/categories`)
- `GET /api/categories` - Fetch all categories for user
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category details/color
- `DELETE /api/categories/:id` - Delete category

### 6.3 Task Routes (`/api/tasks`)
- `GET /api/tasks` - Fetch filtered tasks (by status, category, priority)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task details
- `PUT /api/tasks/:id` - Update task attributes/status
- `DELETE /api/tasks/:id` - Delete task

### 6.4 TimeLog Routes (`/api/timelogs`)
- `GET /api/timelogs` - Fetch time logs (query params for date ranges)
- `POST /api/timelogs` - Create a new time log entry
- `DELETE /api/timelogs/:id` - Delete a time log entry

### 6.5 Analytics Routes (`/api/analytics`)
- `GET /api/analytics/summary` - Aggregate metrics (total hours today/week, category breakdown, estimation accuracy)

---

## 7. UI/UX Wireframe Concepts & Key Screens

1. **Dashboard & Active Timer Bar:** Top navigation with quick-start timer, daily goal progress ring, and task quick-add input.
2. **Task Hub (Kanban / List):** Tabbed switching between Kanban columns and detail list view with quick category color badges.
3. **Focus Room (Timer Page):** Large minimal Pomodoro counter with ambient visual feedback and current active task focus card.
4. **Time Blocking Calendar:** Hourly time grid allowing task placement and visual comparison between planned time slots vs actual log overlays.
5. **Analytics Dashboard:** Clean charts powered by Recharts with date range selectors (Today, This Week, This Month).

---

## 8. Non-Functional Requirements

- **Performance:** Page load under 1.5 seconds; instant timer controls with zero drift latency.
- **Security:** Password hashing using bcrypt salt factor >= 10; sanitized DB queries protecting against NOSQL injection.
- **Data Integrity:** Cascading handling when categories are removed (preserve logs with unassigned category or block deletion).
- **Usability:** Responsive layout optimized for desktop view with mobile web accessibility for checking tasks on the go.

---

## 9. Development Roadmap & Implementation Milestones

### Phase 1: MVP Core (Week 1)
- [ ] Setup Node.js/Express server and MongoDB connection.
- [ ] Implement JWT Auth endpoints & User Mongoose model.
- [ ] Build basic React frontend with Vite & Tailwind CSS setup.
- [ ] Implement Category and Task CRUD APIs & UI lists.

### Phase 2: Timers & Persistence (Week 2)
- [ ] Build Live Stopwatch & Pomodoro UI components.
- [ ] Connect timer actions to TimeLog API endpoints.
- [ ] Persist active timer session across routes using React Context.

### Phase 3: Calendar & Analytics (Week 3)
- [ ] Develop interactive daily/weekly time grid view.
- [ ] Build Analytics page with Recharts (Category distribution, focus trends).
- [ ] Add Task estimation vs actual time comparison.

### Phase 4: Polish & Refinement (Week 4)
- [ ] Implement dark/light mode toggle.
- [ ] Add sound alerts & browser notifications for timer completion.
- [ ] Final testing, bug fixes, and deployment guide (Docker / Vercel + Render).

---

## 10. Extension Feature: Custom Music & Nada Dering (Custom Ringtones & Focus Audio)

### 10.1 Overview & Objective
Menambahkan fitur kustomisasi audio yang fleksibel ke dalam aplikasi untuk meningkatkan pengalaman fokus dan memberi fleksibilitas kepada pengguna dalam memilih nada dering (alarm chime) saat sesi Pomodoro/timer selesai, serta musik latar (ambient sound / focus music) saat bekerja.

### 10.2 Custom Ringtone & Alarm Notification (Nada Dering Timer)
- **Built-in Sound Library:** Pilihan nada dering bawaan berkualitas tinggi (contoh: *Zen Bell, Digital Chime, Marimba, Gentle Harp, Arcade Beep, Classic Bell*).
- **Custom Sound Upload:** Pengguna dapat mengunggah file audio sendiri (`.mp3`, `.wav`, `.ogg`, `.m4a`) untuk dijadikan nada dering.
- **Audio Assignment:**
  - Nada dering saat sesi fokus/kerja selesai (*Work Session Complete*).
  - Nada dering saat waktu istirahat selesai (*Break Session Complete*).
  - Nada pengingat tugas (*Task Due Reminder*).
- **Volume & Preview Control:** Slider pengatur volume (0-100%) dan tombol *Test/Preview* suara sebelum disimpan.

### 10.3 Ambient Background Focus Music & Soundscapes
- **Built-in Ambient Loops:** Pilihan audio fokus latar belakang yang dapat diputar secara berulang (*looping*) di halaman Focus Room (`/timer`), seperti:
  - *Rain & Thunder*
  - *Coffee Shop Ambience*
  - *White Noise / Brown Noise*
  - *Lo-Fi Beats / Deep Focus Drone*
  - *Ocean Waves*
- **Ambient Music Controls:** Widget pemutar musik ambient di Focus Timer (Play, Pause, Volume Terpisah dari Alarm, Loop Toggle).
- **Custom Audio Track Support:** Kemampuan memutar link streaming audio atau file audio lokal pengguna saat sesi timer berjalan.

### 10.4 Storage & Technical Architecture
- **Client-Side Storage (IndexedDB / Local Cache):** File audio kustom yang diunggah pengguna disimpan di browser menggunakan `IndexedDB` agar tidak membebani server dan tidak perlu transfer bandwidth berulang.
- **Audio Engine (HTML5 Audio / Web Audio API):** Menggunakan HTML5 Audio API dengan fallback Web Audio API Synthesizer agar audio tetap berbunyi andal meskipun tab sedang tidak aktif (*background tab*).
- **Schema Preferences Update (`User.js`):**
  ```javascript
  preferences: {
    // ... existing preferences ...
    soundEnabled: { type: Boolean, default: true },
    alarmVolume: { type: Number, default: 80 }, // 0 - 100
    workAlarmTone: { type: String, default: 'zen-bell' }, // 'zen-bell' | 'digital' | 'marimba' | 'custom'
    breakAlarmTone: { type: String, default: 'gentle-harp' },
    ambientSound: { type: String, default: 'none' }, // 'none' | 'rain' | 'cafe' | 'lofi' | 'waves'
    ambientVolume: { type: Number, default: 50 }
  }
  ```

### 10.5 UI/UX Integration Points
1. **Settings Page (`/settings`):** Tab/Section khusus *Sound & Notifications* dengan audio selector, volume slider, upload custom audio button, dan audio preview player.
2. **Focus Room (`/timer`):** Ambient sound player widget di bagian pojok bawah atau samping layar dengan tombol cepat ganti suara latar.
3. **Active Timer Bar:** Ikon mute/unmute cepat untuk nada dering dan background music.

