import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';

// ── Auth views (public) ────────────────────────────────────────────────────────
import LoginView    from './features/auth/LoginView';
import RegisterView from './features/auth/RegisterView';
import ProtectedRoute from './features/auth/ProtectedRoute';

// ── Feature views ──────────────────────────────────────────────────────────────
import TasksView      from './features/tasks/TasksView';
import FocusTimerView from './features/timer/FocusTimerView';
import CalendarView   from './features/calendar/CalendarView';

/**
 * App.jsx — Root router and route definitions.
 *
 * Route structure:
 *  /login      → LoginView    (public)
 *  /register   → RegisterView (public)
 *  /           → Protected wrapper → nested routes rendered inside AppShell
 *    /dashboard
 *    /tasks
 *    /timer
 *    /calendar
 *    /analytics
 *    /settings
 *
 * Phase 3+ views will replace placeholder pages as they are implemented.
 */
function App() {
  const { checkAuth, theme } = useAuthStore();

  // ── On mount: verify persisted token is still valid ──────────────────────
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ── Apply theme class to <html> on every theme change ────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ─────────────────────────────────────────────── */}
        <Route path="/login"    element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />

        {/* ── Protected routes (wrapped inside AppShell) ────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" icon="📊" />} />
          <Route path="/tasks"     element={<TasksView />} />
          <Route path="/timer"     element={<FocusTimerView />} />
          <Route path="/calendar"  element={<CalendarView />} />
          <Route path="/analytics" element={<PlaceholderPage title="Analytics" icon="📈" />} />
          <Route path="/settings"  element={<PlaceholderPage title="Settings" icon="⚙️" />} />
        </Route>

        {/* ── Redirect root to dashboard ────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── 404 catch-all ─────────────────────────────────────────────── */}
        <Route path="*" element={<PlaceholderPage title="404 — Page Not Found" icon="🔍" />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Temporary placeholder used until each feature view is implemented.
 * Replaced phase by phase.
 */
function PlaceholderPage({ title, icon }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 text-center
                    space-y-4 animate-fade-in">
      <div className="text-5xl">{icon}</div>
      <h2 className="text-xl font-semibold text-surface-100">{title}</h2>
      <p className="text-sm text-surface-500 max-w-xs">
        This view is coming in an upcoming phase. The AppShell and navigation are live ✅
      </p>
    </div>
  );
}

export default App;
