import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  CheckSquare,
  Timer,
  Calendar,
  BarChart2,
  Settings,
  Plus,
  Play,
  Moon,
  Sun,
  Clock,
  ArrowRight,
} from 'lucide-react';
import useTaskStore from '../../stores/taskStore';
import useTimerStore from '../../stores/timerStore';
import useAuthStore from '../../stores/authStore';
import Badge from './Badge';

/**
 * CommandPalette — Spotlight-style global command & task search palette (Cmd+K / Ctrl+K).
 *
 * Props:
 *  isOpen    — Boolean controlling visibility
 *  onClose   — Callback to close the palette
 *  onNewTask — Callback to open Task modal
 */
export default function CommandPalette({ isOpen, onClose, onNewTask }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const { tasks } = useTaskStore();
  const { startTimer } = useTimerStore();
  const { theme, updatePreferences } = useAuthStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static Navigation & Quick Actions
  const staticActions = useMemo(
    () => [
      {
        id: 'nav-dashboard',
        label: 'Go to Dashboard',
        icon: LayoutDashboard,
        category: 'Navigation',
        action: () => {
          navigate('/dashboard');
          onClose();
        },
      },
      {
        id: 'nav-tasks',
        label: 'Go to Tasks Hub',
        icon: CheckSquare,
        category: 'Navigation',
        action: () => {
          navigate('/tasks');
          onClose();
        },
      },
      {
        id: 'nav-timer',
        label: 'Go to Focus Room',
        icon: Timer,
        category: 'Navigation',
        action: () => {
          navigate('/timer');
          onClose();
        },
      },
      {
        id: 'nav-calendar',
        label: 'Go to Calendar & Time-Blocking',
        icon: Calendar,
        category: 'Navigation',
        action: () => {
          navigate('/calendar');
          onClose();
        },
      },
      {
        id: 'nav-analytics',
        label: 'Go to Productivity Analytics',
        icon: BarChart2,
        category: 'Navigation',
        action: () => {
          navigate('/analytics');
          onClose();
        },
      },
      {
        id: 'nav-settings',
        label: 'Go to Settings',
        icon: Settings,
        category: 'Navigation',
        action: () => {
          navigate('/settings');
          onClose();
        },
      },
      {
        id: 'action-new-task',
        label: 'Create New Task',
        icon: Plus,
        category: 'Actions',
        shortcut: 'N',
        action: () => {
          onClose();
          if (onNewTask) onNewTask();
        },
      },
      {
        id: 'action-start-pomodoro',
        label: 'Start 25m Pomodoro Focus Session',
        icon: Play,
        category: 'Actions',
        shortcut: 'P',
        action: () => {
          startTimer({ mode: 'pomodoro', targetSeconds: 25 * 60, phase: 'work' });
          navigate('/timer');
          onClose();
        },
      },
      {
        id: 'action-start-stopwatch',
        label: 'Start Stopwatch Tracking',
        icon: Clock,
        category: 'Actions',
        action: () => {
          startTimer({ mode: 'stopwatch' });
          navigate('/timer');
          onClose();
        },
      },
      {
        id: 'action-toggle-theme',
        label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`,
        icon: theme === 'dark' ? Sun : Moon,
        category: 'Actions',
        action: () => {
          const next = theme === 'dark' ? 'light' : 'dark';
          updatePreferences({ theme: next });
          document.documentElement.classList.toggle('dark', next === 'dark');
          onClose();
        },
      },
    ],
    [navigate, onClose, onNewTask, startTimer, theme, updatePreferences]
  );

  // Dynamic Matching Items (Actions + Filtered Tasks)
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staticActions;

    // Filter static actions
    const matchedActions = staticActions.filter((item) =>
      item.label.toLowerCase().includes(q)
    );

    // Filter tasks
    const matchedTasks = tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 5)
      .map((t) => ({
        id: `task-${t._id}`,
        label: t.title,
        icon: CheckSquare,
        category: 'Tasks',
        taskData: t,
        action: () => {
          startTimer({ taskId: t._id, mode: 'pomodoro', targetSeconds: 25 * 60, phase: 'work' });
          navigate('/timer');
          onClose();
        },
      }));

    return [...matchedActions, ...matchedTasks];
  }, [query, staticActions, tasks, startTimer, navigate, onClose]);

  // Keyboard navigation inside palette list
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((idx) => (idx + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((idx) => (idx - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-surface-950/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-surface-50 dark:bg-surface-850 border border-surface-300 dark:border-surface-700/80 rounded-3xl shadow-warm-lg dark:shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[500px]">
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-200 dark:border-surface-700 bg-surface-100/70 dark:bg-surface-800">
          <Search size={18} className="text-primary-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search tasks... (Press Esc to close)"
            className="w-full bg-transparent text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-surface-500 bg-surface-200 dark:bg-surface-700 rounded-lg border border-surface-300 dark:border-surface-600">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-surface-400">
              No matching commands or tasks found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs transition-all text-left ${
                    isSelected
                      ? 'bg-primary-500/15 text-primary-700 dark:text-primary-300 border border-primary-500/30 font-semibold shadow-warm-sm'
                      : 'text-surface-700 dark:text-surface-300 hover:bg-surface-200/80 dark:hover:bg-surface-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
                    <Icon
                      size={15}
                      className={isSelected ? 'text-primary-500 shrink-0' : 'text-surface-400 dark:text-surface-500 shrink-0'}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.taskData && item.taskData.categoryId && (
                      <Badge
                        label={item.taskData.categoryId.name}
                        color={item.taskData.categoryId.color}
                        size="sm"
                        className="text-[9px] py-0 px-1"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-surface-500">
                    <span className="text-[10px] text-surface-500 bg-surface-200/80 dark:bg-surface-800 px-2 py-0.5 rounded-lg border border-surface-300 dark:border-surface-700 font-medium">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight size={13} className="text-primary-500" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Helper */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface-100/90 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 text-[11px] text-surface-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-surface-200 dark:bg-surface-800 rounded-md border border-surface-300 dark:border-surface-700 text-[10px] font-mono">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-surface-200 dark:bg-surface-800 rounded-md border border-surface-300 dark:border-surface-700 text-[10px] font-mono">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-surface-200 dark:bg-surface-800 rounded-md border border-surface-300 dark:border-surface-700 text-[10px] font-mono">↵</kbd> to select
            </span>
          </div>
          <span className="font-semibold text-primary-600 dark:text-primary-400">ChronoCraft</span>
        </div>
      </div>
    </div>
  );
}
