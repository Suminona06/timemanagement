import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import TaskCard from './TaskCard';
import useTaskStore from '../../../stores/taskStore';

const COLUMNS = [
  {
    id: 'To Do',
    label: 'To Do',
    accent: 'border-t-primary-400',
    count_bg: 'bg-primary-500/15 text-primary-700 dark:text-primary-300 border border-primary-500/20',
  },
  {
    id: 'In Progress',
    label: 'In Progress',
    accent: 'border-t-warning-500',
    count_bg: 'bg-warning-500/15 text-warning-700 dark:text-warning-300 border border-warning-500/20',
  },
  {
    id: 'Completed',
    label: 'Completed',
    accent: 'border-t-success-500',
    count_bg: 'bg-success-500/15 text-success-700 dark:text-success-300 border border-success-500/20',
  },
  {
    id: 'Archived',
    label: 'Archived',
    accent: 'border-t-surface-400',
    count_bg: 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400 border border-surface-300 dark:border-surface-600',
  },
];

/**
 * KanbanBoard — Four-column drag-and-drop board with ChronoCraft Lo-Fi tactile aesthetic.
 *
 * Props:
 *  tasks        — Array of task objects from taskStore
 *  onEdit       — (task) => void
 *  onDelete     — (task) => void
 *  onNewTask    — (defaultStatus) => void — open TaskFormModal pre-set to a column's status
 */
export default function KanbanBoard({ tasks, onEdit, onDelete, onNewTask }) {
  const { changeTaskStatus } = useTaskStore();

  // Group tasks by status
  const columns = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {});

  // ── Drag end handler ─────────────────────────────────────────────────────
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a column or same column + same position → no-op
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const newStatus = destination.droppableId;
    if (newStatus === source.droppableId) return; // same column reordering

    // Optimistic update + API call (rollback handled inside changeTaskStatus)
    await changeTaskStatus(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto pb-4 pt-1 px-1">
        {COLUMNS.map((col) => {
          const colTasks = columns[col.id] || [];
          return (
            <div
              key={col.id}
              className={clsx(
                'flex flex-col rounded-2xl border border-surface-300 dark:border-surface-700/80 border-t-[3px]',
                'bg-surface-100/70 dark:bg-surface-850/80 min-w-[280px] w-[300px] shrink-0 shadow-warm-sm',
                col.accent
              )}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-3.5 py-3 border-b border-surface-300 dark:border-surface-700/80 bg-surface-50/60 dark:bg-surface-800/40 rounded-t-2xl">
                <span className="text-xs font-bold text-surface-900 dark:text-surface-100 tracking-tight flex-1">
                  {col.label}
                </span>
                <span
                  className={clsx(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    col.count_bg
                  )}
                >
                  {colTasks.length}
                </span>
                <button
                  onClick={() => onNewTask(col.id)}
                  className="p-1 rounded-lg text-surface-400 hover:text-primary-500 dark:hover:text-primary-400
                             hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                  aria-label={`Add task to ${col.label}`}
                  title={`Add to ${col.label}`}
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={clsx(
                      'flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[140px]',
                      'transition-colors duration-150 rounded-b-2xl',
                      snapshot.isDraggingOver && 'bg-primary-500/10 dark:bg-primary-500/5'
                    )}
                  >
                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex flex-col items-center justify-center text-center py-8 text-surface-400 gap-1.5 select-none">
                        <Sparkles size={16} className="text-surface-300 dark:text-surface-600" />
                        <p className="text-xs">No tasks here</p>
                      </div>
                    )}

                    {colTasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <TaskCard
                              task={task}
                              onEdit={() => onEdit(task)}
                              onDelete={() => onDelete(task)}
                              onComplete={() =>
                                task.status !== 'Completed' &&
                                changeTaskStatus(task._id, 'Completed')
                              }
                              dragHandle={provided.dragHandleProps}
                              isDragging={snapshot.isDragging}
                              compact
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
