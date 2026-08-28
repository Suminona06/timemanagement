import { Search, SlidersHorizontal, RotateCcw, LayoutList, Columns3 } from 'lucide-react';
import useTaskStore from '../../../stores/taskStore';

const STATUSES   = ['To Do', 'In Progress', 'Completed', 'Archived'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

/**
 * TaskFilters — Filter bar for the tasks view.
 *
 * Features:
 *  - Search input (debounced via setFilter → loadTasks)
 *  - Status / Category / Priority dropdowns
 *  - List / Kanban view toggle
 *  - Reset filters button
 *
 * Props:
 *  onOpenCategories — () => void — opens CategoryModal
 */
export default function TaskFilters({ onOpenCategories }) {
  const {
    categories,
    activeFilter,
    activeView,
    setFilter,
    resetFilters,
    setActiveView,
  } = useTaskStore();

  const hasActiveFilters =
    activeFilter.status     ||
    activeFilter.categoryId ||
    activeFilter.priority   ||
    activeFilter.search;

  return (
    <div className="space-y-3">
      {/* ── Row 1: Search + View toggle ───────────────────────────────── */}
      <div className="flex gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none"
          />
          <input
            type="search"
            value={activeFilter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            placeholder="Search tasks…"
            className="input pl-9"
          />
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-surface-600 overflow-hidden shrink-0">
          <button
            onClick={() => setActiveView('list')}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
              activeView === 'list'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-800 text-surface-400 hover:text-surface-200'
            }`}
            aria-label="List view"
            title="List view"
          >
            <LayoutList size={15} />
          </button>
          <button
            onClick={() => setActiveView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors border-l border-surface-600 ${
              activeView === 'kanban'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-800 text-surface-400 hover:text-surface-200'
            }`}
            aria-label="Kanban view"
            title="Kanban view"
          >
            <Columns3 size={15} />
          </button>
        </div>
      </div>

      {/* ── Row 2: Dropdowns + manage categories + reset ──────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status */}
        <select
          value={activeFilter.status}
          onChange={(e) => setFilter({ status: e.target.value })}
          className="input py-1.5 text-xs w-auto pr-7 cursor-pointer"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Category */}
        <select
          value={activeFilter.categoryId}
          onChange={(e) => setFilter({ categoryId: e.target.value })}
          className="input py-1.5 text-xs w-auto pr-7 cursor-pointer"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={activeFilter.priority}
          onChange={(e) => setFilter({ priority: e.target.value })}
          className="input py-1.5 text-xs w-auto pr-7 cursor-pointer"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={`${activeFilter.sortBy}:${activeFilter.order}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split(':');
            setFilter({ sortBy, order });
          }}
          className="input py-1.5 text-xs w-auto pr-7 cursor-pointer"
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="dueDate:asc">Due date ↑</option>
          <option value="dueDate:desc">Due date ↓</option>
          <option value="priority:desc">Priority ↓</option>
        </select>

        {/* Manage categories */}
        <button
          onClick={onOpenCategories}
          className="btn-ghost py-1.5 text-xs gap-1.5"
          title="Manage categories"
        >
          <SlidersHorizontal size={13} />
          Categories
        </button>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-surface-400
                       hover:text-surface-200 transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
