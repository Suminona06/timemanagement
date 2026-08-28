import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import TaskCard from './TaskCard';
import useTaskStore from '../../../stores/taskStore';

const COLUMNS = [
  { id: 'To Do',       label: 'To Do',       accent: 'border-t-surface-500',   count_bg: 'bg-surface-600'    },
  { id: 'In Progress', label: 'In Progress',  accent: 'border-t-primary-500',   count_bg: 'bg-primary-500/20' },
  { id: 'Completed',   label: 'Completed',    accent: 'border-t-success-500',   count_bg: 'bg-success-500/20' },
  { id: 'Archived',    label: 'Archived',     accent: 'border-t-surface-600',   count_bg: 'bg-surface-700'    },
];

/**
 * KanbanBoard — Four-column drag-and-drop board using @hello-pangea/dnd.
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
    if (newStatus === source.droppableId) return; // same column, just reordering (not persisted)

    // Optimistic update + API call (rollback handled inside changeTaskStatus)
    await changeTaskStatus(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colTasks = columns[col.id] || [];
          return (
            <div
              key={col.id}
              className={clsx(
                'flex flex-col rounded-xl border border-surface-700 border-t-2',
                'bg-surface-850 min-w-[260px] w-[280px] shrink-0',
                col.accent
              )}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-surface-700">
                <span className="text-sm font-semibold text-surface-200 flex-1">
                  {col.label}
                </span>
                <span
                  className={clsx(
                    'text-xs font-medium px-1.5 py-0.5 rounded-full',
                    col.count_bg,
                    'text-surface-300'
                  )}
                >
                  {colTasks.length}
                </span>
                <button
                  onClick={() => onNewTask(col.id)}
                  className="p-1 rounded-md text-surface-500 hover:text-primary-400
                             hover:bg-primary-500/10 transition-colors"
                  aria-label={`Add task to ${col.label}`}
                  title={`Add to ${col.label}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={clsx(
                      'flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]',
                      'transition-colors duration-150',
                      snapshot.isDraggingOver && 'bg-primary-500/5 rounded-b-xl'
                    )}
                  >
                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <p className="text-center text-xs text-surface-600 py-6 select-none">
                        Drop tasks here
                      </p>
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
