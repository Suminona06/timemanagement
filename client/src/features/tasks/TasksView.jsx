import { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, ClipboardList } from 'lucide-react';
import useTaskStore from '../../stores/taskStore';
import TaskCard from './components/TaskCard';
import TaskFilters from './components/TaskFilters';
import QuickAddInput from './components/QuickAddInput';
import TaskFormModal from './components/TaskFormModal';
import KanbanBoard from './components/KanbanBoard';
import CategoryModal from './components/CategoryModal';

/**
 * TasksView — Main tasks page: list view, kanban view, filters, CRUD modals.
 * Harmonized for light and dark mode.
 */
export default function TasksView() {
  const {
    tasks,
    isLoading,
    error,
    activeView,
    removeTask,
    changeTaskStatus,
    clearError,
    init,
  } = useTaskStore();

  // ── Modal state ────────────────────────────────────────────────────────
  const [taskModal, setTaskModal] = useState({
    isOpen: false,
    task: null,          // null = create mode; task object = edit mode
    defaultStatus: 'To Do', // used when opening from a kanban column + button
  });
  const [catModalOpen,     setCatModalOpen]     = useState(false);
  const [deleteTarget,     setDeleteTarget]     = useState(null);
  const [isDeleting,       setIsDeleting]       = useState(false);

  // ── Load on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    init();
  }, [init]);

  // ── Open modal handlers ────────────────────────────────────────────────
  const openCreateModal = useCallback((defaultStatus = 'To Do') => {
    setTaskModal({ isOpen: true, task: null, defaultStatus });
  }, []);

  const openEditModal = useCallback((task) => {
    setTaskModal({ isOpen: true, task, defaultStatus: task.status });
  }, []);

  const closeTaskModal = useCallback(() => {
    setTaskModal((m) => ({ ...m, isOpen: false, task: null }));
  }, []);

  // ── Delete handlers ────────────────────────────────────────────────────
  const confirmDelete = useCallback((task) => setDeleteTarget(task), []);
  const cancelDelete  = useCallback(() => setDeleteTarget(null), []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await removeTask(deleteTarget._id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Quick complete ─────────────────────────────────────────────────────
  const handleComplete = useCallback((task) => {
    if (task.status !== 'Completed') {
      changeTaskStatus(task._id, 'Completed');
    }
  }, [changeTaskStatus]);

  return (
    <div className="flex flex-col h-full gap-5">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">Tasks</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="btn-primary shadow-warm-sm"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────── */}
      {error && (
        <div
          className="flex gap-2 p-3.5 rounded-2xl bg-danger-500/10
                     border border-danger-500/30 text-danger-600 dark:text-danger-400 text-sm shadow-warm-sm"
          onClick={clearError}
          role="alert"
        >
          <span>⚠</span>
          <span className="flex-1">{error}</span>
          <button className="text-danger-500 hover:text-danger-600">✕</button>
        </div>
      )}

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <TaskFilters onOpenCategories={() => setCatModalOpen(true)} />

      {/* ── Quick Add Input ──────────────────────────────────────────── */}
      <QuickAddInput />

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading && tasks.length === 0 ? (
          /* Initial loading spinner */
          <div className="flex items-center justify-center h-40">
            <Loader2 size={28} className="animate-spin text-primary-500" />
          </div>
        ) : tasks.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-52 gap-3">
            <ClipboardList size={36} className="text-surface-400 dark:text-surface-600" />
            <p className="text-surface-500 text-sm">No tasks found.</p>
            <button onClick={() => openCreateModal()} className="btn-primary text-sm py-1.5 px-4 shadow-warm-sm">
              <Plus size={14} /> Create your first task
            </button>
          </div>
        ) : activeView === 'kanban' ? (
          /* Kanban board */
          <KanbanBoard
            tasks={tasks}
            onEdit={openEditModal}
            onDelete={confirmDelete}
            onNewTask={openCreateModal}
          />
        ) : (
          /* List view */
          <div className="space-y-2.5 overflow-y-auto h-full pr-1">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={() => openEditModal(task)}
                onDelete={() => confirmDelete(task)}
                onComplete={() => handleComplete(task)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Delete confirmation dialog ───────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4
                        bg-surface-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-50 dark:bg-surface-800 border border-surface-300 dark:border-surface-700/80 rounded-3xl
                          shadow-warm-lg dark:shadow-2xl p-6 max-w-sm w-full space-y-4 animate-slide-up">
            <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">Delete task?</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400">
              <strong className="text-surface-900 dark:text-surface-200">&ldquo;{deleteTarget.title}&rdquo;</strong> will be
              permanently deleted. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-200 dark:border-surface-700">
              <button onClick={cancelDelete} className="btn-ghost text-xs py-2 px-3.5">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-danger text-xs py-2 px-4 shadow-sm"
              >
                {isDeleting
                  ? <Loader2 size={14} className="animate-spin" />
                  : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <TaskFormModal
        isOpen={taskModal.isOpen}
        onClose={closeTaskModal}
        task={taskModal.task}
      />

      <CategoryModal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
      />
    </div>
  );
}
