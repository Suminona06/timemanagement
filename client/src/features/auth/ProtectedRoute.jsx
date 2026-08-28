import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import AppShell from '../../components/layout/AppShell';

/**
 * ProtectedRoute — Navigation guard for authenticated-only pages.
 *
 * Behaviour:
 *  - If `isLoading` is true  → show a centered spinner while checkAuth() runs
 *  - If not authenticated    → redirect to /login (replace history so back-button
 *                              doesn't return to the protected page)
 *  - If authenticated        → render <AppShell> with <Outlet /> inside it
 *
 * Usage in router:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardView />} />
 *     <Route path="/tasks"     element={<TasksView />} />
 *     ...
 *   </Route>
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // ── Loading state: checkAuth() is in flight on first app load ─────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-10 w-10 text-primary-500"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="text-sm text-surface-400">Loading ChronoCraft…</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated: redirect to login ──────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ── Authenticated: render shell with nested route content ─────────────────
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
