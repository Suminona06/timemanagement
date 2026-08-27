# Application Flow & User Journey Document: ChronoCraft

**Project Name:** ChronoCraft (Personal Time Management Suite)  
**Document Version:** 1.0.0  
**Date:** August 2026  
**Reference Documents:** [Product Requirement Document (PRD)](./prd.md) | [System Architecture Document](./architecture.md)  
**Tech Stack:** MERN (MongoDB, Express.js, React.js with Vite, Node.js, Tailwind CSS)

---

## 1. Application Sitemap & Routing Architecture

ChronoCraft is architected as a single-page application (SPA) with clear route-level access control, persistent global UI shells, and modal overlays.

```mermaid
graph TD
    Root([App Root / Entry]) --> RouteGuard{Auth Guard}
    
    %% Public Routes
    RouteGuard -->|Unauthenticated| PublicLayout[Public Auth Shell]
    PublicLayout --> LoginView["/login (Sign In)"]
    PublicLayout --> RegisterView["/register (Sign Up)"]

    %% Protected Routes
    RouteGuard -->|Authenticated| AppShell[Main App Shell + Global ActiveTimerBar]
    
    AppShell --> DashboardView["/dashboard (Executive Hub & Quick Track)"]
    AppShell --> TasksView["/tasks (List & Kanban Views)"]
    AppShell --> FocusTimerView["/timer (Dedicated Pomodoro & Stopwatch)"]
    AppShell --> CalendarView["/calendar (Time-Blocking Grid)"]
    AppShell --> AnalyticsView["/analytics (Reports, Charts & Streaks)"]
    AppShell --> SettingsView["/settings (Preferences & Profile)"]

    %% Global Overlays & Modals
    AppShell -.-> QuickAddModal[Task Quick-Add Modal / Ctrl+K]
    AppShell -.-> ManualLogModal[Manual Time Log Modal]
    AppShell -.-> TaskDetailDrawer[Task Detail & History Drawer]
    AppShell -.-> CategoryModal[Category Manager Modal]
```

### 1.1 Route Directory & Permissions

| Route Path | View / Component | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/login` | `LoginView` | Public | Email/Password authentication & token issuance |
| `/register` | `RegisterView` | Public | Account creation with default preferences |
| `/` or `/dashboard` | `DashboardView` | Protected | Daily summary ring, quick-start timer, upcoming tasks |
| `/tasks` | `TasksView` | Protected | Task management via List or Kanban board |
| `/timer` | `FocusTimerView` | Protected | Deep focus room (large Pomodoro/Stopwatch wheel) |
| `/calendar` | `CalendarView` | Protected | Daily/Weekly time-blocking and actual vs planned grid |
| `/analytics` | `AnalyticsView` | Protected | Category distribution donut, focus trends, accuracy |
| `/settings` | `SettingsView` | Protected | Pomodoro intervals, daily target hours, theme toggle |
| `*` | `NotFoundView` | Public | 404 fallback page redirecting to `/dashboard` or `/login` |

---

## 2. Core User Journey Map

```mermaid
journey
    title ChronoCraft Daily Productivity Lifecycle
    section 1. Authentication & Launch
      Open Application: 5: User
      Restore Session / Token: 5: System
      View Dashboard & Daily Target: 5: User
    section 2. Daily Planning
      Organize Categories & Colors: 4: User
      Create & Estimate Tasks: 5: User
      Review Kanban / Schedule: 4: User
    section 3. Deep Focus & Execution
      Start Live Stopwatch / Pomodoro: 5: User
      Navigate Between Pages (Timer persists): 5: System
      Receive Audio Alert on Phase End: 5: System
      Stop Timer & Auto-Save Log: 5: User, System
    section 4. Review & Reflect
      Inspect Daily/Weekly Time Blocks: 4: User
      Analyze Category Distribution: 5: User
      Check Estimation Accuracy & Streaks: 5: User
```

---

## 3. End-to-End Feature Flows & Sequence Diagrams

### 3.1 Authentication & Session Rehydration Flow

Handles user onboarding, login token generation, local persistence, route protection, and automatic session restoration.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as React Router / App.jsx
    participant AuthStore as authStore (Zustand/Context)
    participant Storage as LocalStorage
    participant API as Express API (/api/auth)
    participant DB as MongoDB (User Model)

    Note over User,DB: Scenario A: Application Boot / Cold Start
    User->>App: Opens App (e.g., https://chronocraft.local)
    App->>AuthStore: initializeAuth()
    AuthStore->>Storage: Read stored JWT & User Snapshot
    alt Token Exists in LocalStorage
        AuthStore->>API: GET /api/auth/me (Bearer Token)
        alt Token Valid
            API->>DB: User.findById(req.user.id)
            DB-->>API: User details + preferences
            API-->>AuthStore: 200 OK (User Data)
            AuthStore-->>App: isAuthenticated = true
            App-->>User: Render requested protected route
        else Token Invalid / Expired (401)
            API-->>AuthStore: 401 Unauthorized
            AuthStore->>Storage: Clear token & state
            AuthStore-->>App: isAuthenticated = false
            App-->>User: Redirect to /login
        end
    else No Token Found
        AuthStore-->>App: isAuthenticated = false
        App-->>User: Redirect to /login
    end

    Note over User,DB: Scenario B: User Sign In
    User->>App: Submits Login form (email, password)
    App->>API: POST /api/auth/login
    API->>DB: Query User by email
    API->>API: Compare password via bcrypt.compare()
    alt Credentials Valid
        API->>API: Sign JWT with user ID
        API-->>AuthStore: 200 OK { token, user }
        AuthStore->>Storage: Store JWT & user metadata
        AuthStore-->>App: Set state (isAuthenticated = true)
        App-->>User: Navigate to /dashboard
    else Invalid Credentials
        API-->>App: 400/401 Error (Invalid email/password)
        App-->>User: Display error banner
    end
```

---

### 3.2 Category & Task Management Flow

Enables creating categories with color coding, organizing tasks via List or Kanban views, updating task statuses, and preserving historical log data upon deletion.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant TaskUI as TasksView / KanbanBoard
    participant TaskStore as taskStore
    participant API as Express API (/api/tasks & /api/categories)
    participant DB as MongoDB

    Note over User,DB: 1. Create Category & Task
    User->>TaskUI: Creates category "Work" (#3B82F6)
    TaskUI->>API: POST /api/categories { name: "Work", color: "#3B82F6" }
    API->>DB: Insert Category Document
    DB-->>API: Category Object
    API-->>TaskUI: 201 Created (Append to Category List)

    User->>TaskUI: Creates task "Build REST API" (Est: 120m, Priority: High)
    TaskUI->>API: POST /api/tasks { title, categoryId, priority, estimatedMinutes: 120 }
    API->>DB: Insert Task Document (status: "To Do", actualMinutes: 0)
    DB-->>API: Task Object
    API-->>TaskStore: Append task to active state
    TaskStore-->>TaskUI: Render task card in "To Do" column

    Note over User,DB: 2. Drag-and-Drop Status Change (Kanban)
    User->>TaskUI: Drags task card from "To Do" to "In Progress"
    TaskUI->>TaskStore: Optimistic update (status = "In Progress")
    TaskUI->>API: PUT /api/tasks/:id { status: "In Progress" }
    API->>DB: Task.findByIdAndUpdate(id, { status: "In Progress" })
    DB-->>API: Updated Task Document
    API-->>TaskStore: Sync confirmed state

    Note over User,DB: 3. Category Deletion & Data Safety Cascade
    User->>TaskUI: Deletes category "Work"
    TaskUI->>API: DELETE /api/categories/:id
    API->>DB: Update associated Tasks -> set categoryId = null
    API->>DB: Update associated TimeLogs -> set categoryId = null
    API->>DB: Delete Category document
    DB-->>API: Success
    API-->>TaskUI: 200 OK (Tasks retained as "Uncategorized")
```

---

### 3.3 Live Time Tracking & Timer Engine Flow (Drift-Resilient)

This flow details how the client guarantees millisecond-accurate time tracking resilient to browser background tab throttling, route changes, and tab closures, finishing with database log persistence and task duration aggregation.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Global ActiveTimerBar / TimerView
    participant Store as timerStore (State + LocalStorage Sync)
    participant Audio as AudioNotificationManager
    participant API as Express API (/api/timelogs)
    participant DB as MongoDB (TimeLog & Task)

    Note over User,DB: 1. Timer Initialization
    User->>UI: Selects Task #101 & clicks "Start Timer" (Stopwatch or Pomodoro)
    UI->>Store: startTimer({ taskId: "101", mode: "pomodoro", targetMinutes: 25 })
    Store->>Store: Set startTimestamp = Date.now(), isRunning = true
    Store->>Store: Save snapshot to LocalStorage: { taskId, mode, startTimestamp, accumulatedSeconds: 0 }
    Store-->>UI: Trigger active timer ticker (computed via Date.now() - startTimestamp)

    Note over User,DB: 2. Page Refresh or Background Tab Throttling
    User->>UI: Navigates to /analytics or minimizes browser tab
    Note over UI,Store: Timer ticker calculates elapsed time using Epoch Delta,<br/>completely immune to setInterval throttling
    User->>UI: Restores window / navigates back to /tasks
    UI->>Store: rehydrateTimer()
    Store-->>UI: Seamlessly display exact elapsed time without loss

    Note over User,DB: 3. Pomodoro Phase Completion
    Store->>Store: Elapsed time reaches target duration (25m)
    Store->>Audio: Play phase-switch sound ('phase-switch.mp3')
    Store->>UI: Send browser notification ("Work block finished! Take a 5-min break.")
    Store->>Store: Switch mode to "shortBreak" (target: 5m)

    Note over User,DB: 4. Stop & Persist Time Log
    User->>UI: Clicks "Stop & Save Log"
    UI->>Store: stopTimer()
    Store->>Store: Compute final durationMinutes = Math.round(totalSeconds / 60)
    Store->>Store: Clear LocalStorage snapshot
    Store->>API: POST /api/timelogs { taskId, categoryId, startTime, endTime, durationMinutes, logType: "pomodoro" }
    
    API->>DB: Insert TimeLog document
    API->>DB: Task.findByIdAndUpdate(taskId, { $inc: { actualMinutes: durationMinutes } })
    DB-->>API: Saved Log & Updated Task
    API-->>Store: 201 Created
    Store-->>UI: Display success toast notification & update task actualMinutes badge
```

---

### 3.4 Time-Blocking & Calendar Interaction Flow

Allows users to inspect daily/weekly timeline grids, view completed time logs mapped directly to hours of the day, and schedule future task blocks.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant CalUI as CalendarView (Daily/Weekly Timeline)
    participant API as Express API (/api/timelogs & /api/tasks)
    participant DB as MongoDB

    User->>CalUI: Opens /calendar (Selects "Day View" - Current Date)
    CalUI->>API: GET /api/timelogs?startDate=YYYY-MM-DDT00:00:00Z&endDate=YYYY-MM-DDT23:59:59Z
    CalUI->>API: GET /api/tasks?status=To Do,In Progress
    API->>DB: Query TimeLogs within time boundaries
    API->>DB: Query Scheduled Tasks
    DB-->>API: Records array
    API-->>CalUI: 200 OK { timelogs: [...], scheduledTasks: [...] }

    CalUI->>CalUI: Maps completed logs as solid colored blocks (by Category color)
    CalUI->>CalUI: Maps scheduled task time allocations as outlined blocks

    Note over User,DB: Manual Time-Block Entry
    User->>CalUI: Drags time slot on timeline (02:00 PM - 03:30 PM)
    CalUI->>CalUI: Opens "Add Time Log" modal prefilled with start/end times
    User->>CalUI: Selects Task & adds notes "Refactoring Auth Middleware"
    CalUI->>API: POST /api/timelogs { startTime, endTime, durationMinutes: 90, taskId, notes }
    API->>DB: Save TimeLog & update Task.actualMinutes (+90)
    DB-->>API: 201 Created
    API-->>CalUI: Update calendar timeline with new time block
```

---

### 3.5 Analytics & Productivity Reflection Flow

Aggregates productivity data on demand using MongoDB aggregation pipelines to visualize category time distribution, daily trends vs goals, and estimation accuracy.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant AnalyticsUI as AnalyticsView
    participant API as Express API (/api/analytics)
    participant Service as analyticsService.js
    participant DB as MongoDB Aggregation Pipeline

    User->>AnalyticsUI: Navigates to /analytics (Selects timeframe: "This Week")
    AnalyticsUI->>API: GET /api/analytics/summary?period=week
    
    par Query Distribution & Trends
        API->>Service: getCategoryDistribution(userId, startDate, endDate)
        Service->>DB: Execute $match -> $group ($sum durationMinutes) -> $lookup (categories)
        DB-->>Service: Aggregated Category Breakdown
    and Query Focus Trends & Streak
        API->>Service: getDailyFocusTrends(userId, startDate, endDate)
        Service->>DB: Execute $group by date (YYYY-MM-DD) -> compare with dailyGoalHours
        DB-->>Service: Daily Tracked Hours & Goal Delta
    and Query Estimation Accuracy
        API->>Service: getEstimationAccuracy(userId, startDate, endDate)
        Service->>DB: Task.aggregate([ estimatedMinutes vs actualMinutes ])
        DB-->>Service: Accuracy Metrics & Variance
    end

    Service-->>API: Formatted Analytics Payload
    API-->>AnalyticsUI: 200 OK { distribution: [...], trends: [...], accuracy: {...}, streakCount: 4 }
    AnalyticsUI->>AnalyticsUI: Render Recharts Donut Chart (Time by Category)
    AnalyticsUI->>AnalyticsUI: Render Recharts Bar Chart (Tracked vs Daily Goal)
    AnalyticsUI->>AnalyticsUI: Render Accuracy Meter & Streak Badge
```

---

### 3.6 Settings & Preference Customization Flow

Allows users to personalize their focus work session lengths, target working hours, and theme styling.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant SettingsUI as SettingsView / TopNav
    participant UIStore as uiStore / authStore
    participant API as Express API (/api/auth/preferences)
    participant DB as MongoDB

    Note over User,DB: 1. Theme Toggle (Instant Client-side Reaction)
    User->>SettingsUI: Toggles Dark Mode / Light Mode switch
    SettingsUI->>UIStore: setTheme('dark' | 'light')
    UIStore->>UIStore: Toggle document.documentElement class ('dark')
    UIStore->>API: PUT /api/auth/preferences { theme: 'dark' }
    API->>DB: User.findByIdAndUpdate(userId, { 'preferences.theme': 'dark' })

    Note over User,DB: 2. Pomodoro & Daily Goal Configuration
    User->>SettingsUI: Sets Work: 50m, Short Break: 10m, Daily Goal: 7h
    User->>SettingsUI: Clicks "Save Settings"
    SettingsUI->>API: PUT /api/auth/preferences { pomodoroWorkMinutes: 50, pomodoroShortBreakMinutes: 10, dailyGoalHours: 7 }
    API->>DB: Update User preferences embedded subdocument
    DB-->>API: Updated User object
    API-->>SettingsUI: 200 OK (Preferences Saved)
    SettingsUI-->>User: Show confirmation toast & update timer presets
```

---

## 4. Global State Architecture & Synchronization

The application coordinates four modular frontend stores to maintain high responsiveness and state continuity across routes:

```mermaid
graph TD
    subgraph Global Frontend Stores
        AuthStore["authStore<br/>• user<br/>• token<br/>• preferences<br/>• isAuthenticated"]
        TimerStore["timerStore<br/>• isRunning<br/>• mode (stopwatch/pomodoro)<br/>• activeTaskId<br/>• startTimestamp<br/>• elapsedSeconds"]
        TaskStore["taskStore<br/>• taskList<br/>• categories<br/>• filters<br/>• activeView (list/kanban)"]
        UIStore["uiStore<br/>• theme (dark/light)<br/>• sidebarOpen<br/>• activeModal"]
    end

    subgraph Browser Storage & APIs
        LS_Token[LocalStorage: jwt_token]
        LS_Timer[LocalStorage: active_timer_snapshot]
        LS_Theme[LocalStorage: theme_pref]
        AudioAPI[Web Audio API / Sounds]
        NotifyAPI[Web Notification API]
    end

    subgraph Backend Services
        AxiosClient[Axios Interceptor Instance]
    end

    AuthStore <-->|Sync Auth Token| LS_Token
    TimerStore <-->|Snapshot State Backup| LS_Timer
    TimerStore -->|Trigger Sound| AudioAPI
    TimerStore -->|Trigger Push| NotifyAPI
    UIStore <-->|Theme Preference| LS_Theme

    AuthStore -->|Inject Bearer Header| AxiosClient
    TimerStore -->|POST /api/timelogs| AxiosClient
    TaskStore -->|CRUD Tasks/Categories| AxiosClient
```

---

## 5. Error Handling, Edge Cases & Resilience Flows

### 5.1 Token Expiry & Automatic Logout
* **Trigger:** API returns `401 Unauthorized` on any protected request due to expired JWT.
* **Flow:** Axios response interceptor catches `401`, triggers `authStore.logout()`, removes the token from `localStorage`, cancels any active timer snapshot, and redirects the user to `/login` with a session-expired notification.

### 5.2 Network Outage During Timer Stop
* **Trigger:** User stops a timer while internet connectivity is temporarily interrupted.
* **Flow:**
  1. The client catches the network failure during `POST /api/timelogs`.
  2. The timer store retains the log entry in a `pending_logs` queue inside `localStorage`.
  3. UI displays a warning banner: *"Network offline. Log saved locally and will sync when connection is restored."*
  4. An online event listener (`window.addEventListener('online')`) automatically retries syncing pending logs to the backend.

### 5.3 Background Tab Throttling & Zero Clock Drift
* **Trigger:** Modern browsers throttle `setInterval` callbacks to once per minute when tabs are placed in the background.
* **Mitigation:**
  - Timer calculations never increment counters by step ticks.
  - The elapsed time is always calculated dynamically as:
    $$\text{Elapsed Time} = \text{accumulatedSeconds} + \left\lfloor \frac{\text{Date.now()} - \text{startTimestamp}}{1000} \right\rfloor$$
  - When the tab regains focus, the next tick instantly computes the exact current elapsed time with zero drift.

---

## 6. Screen Transition & Interaction Matrix

| Current Screen | Action / User Event | Target Screen / State Change | Global Side Effects |
| :--- | :--- | :--- | :--- |
| **Any Screen** | Clicks "Start Timer" on any task card | Starts timer in `ActiveTimerBar` | Snapshot saved to `localStorage`; timer runs across all routes |
| **Any Screen** | Presses `Ctrl + K` or `Cmd + K` | Opens `QuickAddModal` | Focus set to Task Title input field |
| **Dashboard** | Clicks "Go to Focus Room" | Navigates to `/timer` | Mounts full-screen Pomodoro/Stopwatch focus interface |
| **Tasks View** | Switches view toggle (List $\leftrightarrow$ Kanban) | Toggles component view | Updates `taskStore.activeView` |
| **Tasks View** | Drags card to "Completed" column | Moves column; task status $\to$ `Completed` | Dispatches `PUT /api/tasks/:id`; triggers success badge |
| **Calendar** | Clicks an empty hour slot | Opens `ManualLogModal` | Prefills start/end times in modal |
| **Analytics** | Changes filter dropdown (e.g. "This Month") | Refreshes chart displays | Triggers aggregation queries with new date boundaries |
| **Settings** | Changes Pomodoro work duration | Updates preset timers | Updates User preferences in DB and `authStore` |
