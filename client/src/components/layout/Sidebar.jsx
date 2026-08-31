import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  CalendarDays,
  BarChart2,
  Settings,
  LogOut,
  Clock,
  X,
} from 'lucide-react';

// ── Sidebar navigation items ────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks' },
  { to: '/timer',     icon: Timer,           label: 'Focus Timer' },
  { to: '/calendar',  icon: CalendarDays,    label: 'Calendar' },
  { to: '/analytics', icon: BarChart2,       label: 'Analytics' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
];

/**
 * Sidebar — ChronoCraft cozy Lo-Fi sidebar navigation drawer.
 */
export default function Sidebar({ isOpen, onClose, user, onLogout }) {
  return (
    <>
      {/* ── Mobile Backdrop ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Aside Container ──────────────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col w-64 shrink-0
          bg-surface-50 dark:bg-surface-800
          border-r border-surface-300 dark:border-surface-700/80
          shadow-warm-md lg:shadow-none
          transform transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* ── Brand Logo Header ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-300 dark:border-surface-700/80 bg-surface-100/50 dark:bg-surface-850/40">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden bg-primary-500/10 border border-primary-500/30 text-primary-400 shrink-0 shadow-warm-sm">
            <img
              src="/logo.jpg"
              alt="ChronoCraft Logo"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <Clock size={20} className="absolute text-primary-500 dark:text-primary-400 -z-10" />
          </div>
          <div className="min-w-0">
            <span className="text-base font-bold text-surface-900 dark:text-surface-100 tracking-tight block">
              ChronoCraft
            </span>
            <span className="text-[10px] text-primary-600 dark:text-primary-400 font-medium tracking-wide uppercase">
              Mindful Time
            </span>
          </div>

          {/* Close button — mobile only */}
          <button
            className="ml-auto lg:hidden p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation Links ───────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                 transition-all duration-150 group
                 ${isActive
                   ? 'bg-primary-500/15 text-primary-700 dark:text-primary-300 font-semibold shadow-warm-sm border border-primary-500/20'
                   : 'text-surface-600 dark:text-surface-400 hover:bg-surface-200/70 dark:hover:bg-surface-700/60 hover:text-surface-900 dark:hover:text-surface-200'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-surface-400 dark:text-surface-500 group-hover:text-primary-500'
                    }`}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── User Footer & Logout ───────────────────────────────────────── */}
        <div className="p-3 border-t border-surface-300 dark:border-surface-700/80 bg-surface-100/40 dark:bg-surface-850/30 space-y-2">
          {/* User profile badge */}
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-surface-200/50 dark:bg-surface-700/30 border border-surface-300/60 dark:border-surface-700/50">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white text-xs font-bold shrink-0 shadow-sm">
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-surface-800 dark:text-surface-200 truncate">
                {user?.username ?? 'Craft User'}
              </p>
              <p className="text-[10px] text-surface-500 truncate">{user?.email ?? ''}</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs
                       font-medium text-surface-500 hover:text-danger-500 hover:bg-danger-500/10
                       border border-transparent hover:border-danger-500/20 transition-all duration-150"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
