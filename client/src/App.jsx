import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

/**
 * App.jsx — Root router and route definitions.
 *
 * Current state (Phase 1): placeholder routes with simple text labels.
 * Routes will be replaced with real views as each phase is implemented:
 *
 *  Phase 2  → LoginView, RegisterView, ProtectedRoute, AppShell
 *  Phase 3  → TasksView
 *  Phase 4  → FocusTimerView
 *  Phase 5  → CalendarView
 *  Phase 6  → AnalyticsView
 *  Phase 7  → DashboardView
 *  Phase 8  → SettingsView
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── Public routes (Phase 2) ───────────────────────── */}
        <Route path="/login"    element={<PlaceholderPage title="Login" />} />
        <Route path="/register" element={<PlaceholderPage title="Register" />} />

        {/* ── Protected routes (Phase 2+) ──────────────────── */}
        <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
        <Route path="/tasks"     element={<PlaceholderPage title="Tasks" />} />
        <Route path="/timer"     element={<PlaceholderPage title="Focus Timer" />} />
        <Route path="/calendar"  element={<PlaceholderPage title="Calendar" />} />
        <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
        <Route path="/settings"  element={<PlaceholderPage title="Settings" />} />

        {/* ── 404 Catch-all ─────────────────────────────────── */}
        <Route path="*" element={<PlaceholderPage title="404 — Page Not Found" />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Temporary placeholder used during Phase 1.
 * Replaced by real views in subsequent phases.
 */
function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center
                    bg-surface-900 text-surface-200">
      <div className="card p-10 text-center space-y-4 max-w-sm w-full mx-4">
        {/* Logo / Brand mark */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-500
                        flex items-center justify-center text-white text-2xl font-bold">
          ⏱
        </div>
        <h1 className="text-xl font-semibold text-surface-100">ChronoCraft</h1>
        <p className="text-surface-400 text-sm">
          <span className="font-medium text-primary-400">{title}</span>
          <br />
          This page is under construction.
        </p>
        <div className="text-xs text-surface-500 pt-2">
          Task 1.3 — Vite + React + Tailwind scaffold ✅
        </div>
      </div>
    </div>
  );
}

export default App;
