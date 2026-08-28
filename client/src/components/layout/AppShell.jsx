import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  CalendarDays,
  BarChart2,
  Settings,
  LogOut,
  Clock,
  Menu,
  X,
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

// ── Sidebar navigation items ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks' },
  { to: '/timer',     icon: Timer,           label: 'Focus Timer' },
  { to: '/calendar',  icon: CalendarDays,    label: 'Calendar' },
  { to: '/analytics', icon: BarChart2,       label: 'Analytics' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
];

/**
 * AppShell — Persistent application layout wrapping all authenticated views.
 *
 * Layout:
 *   ┌─────────────────────────────────────────┐
 *   │  TopNav (mobile: hamburger, all: user)  │
 *   ├────────────┬────────────────────────────┤
 *   │  Sidebar   │   Main content (children)  │
 *   │ (desktop)  │                            │
 *   └────────────┴────────────────────────────┘
 *
 * On mobile the sidebar is hidden and toggled via the hamburger button.
 */
export default function AppShell({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900 text-surface-200">

      {/* ── Mobile sidebar backdrop ─────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          flex flex-col w-60 shrink-0
          bg-surface-800 border-r border-surface-700
          transform transition-transform duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-700">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-500 text-white shrink-0">
            <Clock size={18} />
          </div>
          <span className="text-base font-semibold text-surface-100 tracking-tight">
            ChronoCraft
          </span>
          {/* Close button — mobile only */}
          <button
            className="ml-auto lg:hidden text-surface-400 hover:text-surface-200 transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                 transition-colors duration-150
                 ${isActive
                   ? 'bg-primary-500/15 text-primary-400'
                   : 'text-surface-400 hover:bg-surface-700 hover:text-surface-200'
                 }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-surface-700 space-y-2">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full
                            bg-primary-500/20 text-primary-400 text-sm font-semibold shrink-0">
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">
                {user?.username ?? 'User'}
              </p>
              <p className="text-xs text-surface-500 truncate">{user?.email ?? ''}</p>
            </div>
          </div>
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm
                       font-medium text-surface-400 hover:bg-danger-500/10
                       hover:text-danger-400 transition-colors duration-150"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* TopNav */}
        <header className="flex items-center gap-3 px-4 h-14 shrink-0
                           bg-surface-800 border-b border-surface-700">
          {/* Hamburger — mobile only */}
          <button
            className="lg:hidden text-surface-400 hover:text-surface-200 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Page title placeholder — views can override via <title> */}
          <div className="flex-1" />

          {/* Right-side: user avatar chip */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full
                            bg-primary-500/20 text-primary-400 text-sm font-semibold">
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-surface-300">
              {user?.username}
            </span>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
