import { Navigate, Outlet } from 'react-router-dom';
import { Clock } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import AppShell from '../../components/layout/AppShell';

/**
 * ProtectedRoute — Navigation guard for authenticated-only pages.
 *
 * Behaviour:
 *  1. While `isInitializing` is true (i.e. checkAuth() hasn't returned yet) →
 *     Show a full-screen loading spinner. This is the CRITICAL gate that
 *     prevents premature redirect to /login before token verification completes.
 *
 *  2. If not authenticated (and initialization is done) → redirect to /login
 *
 *  3. If authenticated → render <AppShell> with <Outlet /> inside it
 *
 * Root Cause Fixed:
 *  Previously, `isAuthenticated` was false on first render (not persisted to
 *  localStorage), and `isLoading` only became true *after* checkAuth() was
 *  called. This created a 1-frame window where ProtectedRoute saw
 *  `isLoading=false, isAuthenticated=false` and redirected immediately.
 *
 *  Fix: `isInitializing` starts as `true` in the store (before any render)
 *  and is only set to `false` once `checkAuth()` fully resolves.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isInitializing, isLoading } = useAuthStore();

  // ── Block all rendering until the first auth check is complete ─────────────
  // This prevents the redirect race condition on page reload.
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-900">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl overflow-hidden bg-primary-500/10 border border-primary-500/30 flex items-center justify-center shadow-warm-md">
              <img
                src="/logo.jpg"
                alt="ChronoCraft"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <Clock size={28} className="absolute text-primary-400 -z-10" />
            </div>
            <div className="absolute -inset-1.5 rounded-3xl border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-surface-800 dark:text-surface-200 tracking-tight">ChronoCraft</p>
            <p className="text-xs text-surface-500 mt-0.5">Restoring your mindful session…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Not authenticated → redirect to login ──────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ── Authenticated → render shell with nested route content ────────────────
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
