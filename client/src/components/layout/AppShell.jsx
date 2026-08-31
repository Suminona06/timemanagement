import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import useTimerStore from '../../stores/timerStore';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import Sidebar from './Sidebar';
import ActiveTimerBar from './ActiveTimerBar';
import CommandPalette from '../common/CommandPalette';
import TaskFormModal from '../../features/tasks/components/TaskFormModal';

/**
 * AppShell — Persistent application layout wrapping all authenticated views.
 */
export default function AppShell({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { status, startTimer, pauseTimer, resumeTimer } = useTimerStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Keyboard Shortcuts: Toggle timer on Spacebar
  const handleToggleTimer = useCallback(() => {
    if (status === 'running') {
      pauseTimer();
    } else if (status === 'paused') {
      resumeTimer();
    } else {
      startTimer({ mode: 'pomodoro', targetSeconds: 25 * 60, phase: 'work' });
    }
  }, [status, pauseTimer, resumeTimer, startTimer]);

  // Global Keyboard Shortcuts (Cmd+K, Space, Esc)
  useKeyboardShortcuts({
    onToggleCommandPalette: () => setCommandPaletteOpen((prev) => !prev),
    onToggleTimer: handleToggleTimer,
    onEscape: () => {
      setCommandPaletteOpen(false);
      setTaskModalOpen(false);
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-100 dark:bg-surface-900 text-surface-700 dark:text-surface-200">
      {/* ── Modular Sidebar Navigation ──────────────────────────────────── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* ── Main Workspace Area ─────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* TopNav Header */}
        <header className="flex items-center justify-between gap-3 px-4 sm:px-6 h-14 shrink-0
                           bg-surface-50/90 dark:bg-surface-800/90 backdrop-blur-sm
                           border-b border-surface-300 dark:border-surface-700/80 shadow-warm-sm z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger Button (Mobile Only) */}
            <button
              className="lg:hidden p-2 rounded-xl text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar navigation"
            >
              <Menu size={20} />
            </button>

            {/* Quick Command Palette Search Button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-200/60 dark:bg-surface-700/50 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 text-xs border border-surface-300 dark:border-surface-600/50 shadow-warm-sm transition-all"
              title="Open Command Palette (Ctrl+K / Cmd+K)"
            >
              <Search size={13} className="text-primary-500" />
              <span>Search or jump to...</span>
              <kbd className="ml-1 text-[10px] font-mono bg-surface-50 dark:bg-surface-800 px-1.5 py-0.5 rounded-lg border border-surface-300 dark:border-surface-700 text-surface-400">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Active Timer Bar ticker */}
          <div className="flex items-center justify-center">
            <ActiveTimerBar />
          </div>

          {/* Right-side user avatar chip */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl
                            bg-primary-500/15 border border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-bold shadow-sm">
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <span className="hidden md:block text-xs font-semibold text-surface-700 dark:text-surface-300">
              {user?.username}
            </span>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* ── Global Modals ──────────────────────────────────────────────── */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNewTask={() => setTaskModalOpen(true)}
      />

      <TaskFormModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
      />
    </div>
  );
}
