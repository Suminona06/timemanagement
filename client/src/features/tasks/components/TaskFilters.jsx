import { Search, SlidersHorizontal, RotateCcw, LayoutList, Columns3 } from 'lucide-react';
import useTaskStore from '../../../stores/taskStore';

const STATUSES   = ['To Do', 'In Progress', 'Completed', 'Archived'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

/**
 * TaskFilters — Filter bar for the tasks view with warm Lo-Fi styling.
 *
 * Features:
 *  - Search input (debounced via setFilter → loadTasks)
 *  - Status / Category / Priority dropdowns
 *  - List / Kanban view toggle with tactile pills
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
      <div className="flex gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"
          />
          <input
            type="search"
            value={activeFilter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            placeholder="Search tasks by title, tag, or description…"
            className="input pl-10 text-xs sm:text-sm"
          />
        </div>

        {/* View toggle */}
        <div className="flex rounded-xl p-1 bg-surface-200/80 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 shadow-warm-sm shrink-0">
          <button
            onClick={() => setActiveView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'list'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
            aria-label="List view"
            title="List view"
          >
            <LayoutList size={14} />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => setActiveView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'kanban'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
            aria-label="Kanban view"
            title="Kanban view"
          >
            <Columns3 size={14} />
            <span className="hidden sm:inline">Kanban</span>
          </button>
        </div>
      </div>

      {/* ── Row 2: Dropdowns + manage categories + reset ──────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status */}
        <select
          value={activeFilter.status}
          onChange={(e) => setFilter({ status: e.target.value })}
          className="input py-1.5 px-3 text-xs w-auto pr-8 cursor-pointer rounded-xl"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Category */}
        <select
          value={activeFilter.categoryId}
          onChange={(e) => setFilter({ categoryId: e.target.value })}
          className="input py-1.5 px-3 text-xs w-auto pr-8 cursor-pointer rounded-xl"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={activeFilter.priority}
          onChange={(e) => setFilter({ priority: e.target.value })}
          className="input py-1.5 px-3 text-xs w-auto pr-8 cursor-pointer rounded-xl"
        >
          <option value="">All Priorities</option>
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
          className="input py-1.5 px-3 text-xs w-auto pr-8 cursor-pointer rounded-xl"
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="dueDate:asc">Due date (Soonest)</option>
          <option value="dueDate:desc">Due date (Furthest)</option>
          <option value="priority:desc">Priority (High to Low)</option>
        </select>

        {/* Manage categories */}
        <button
          onClick={onOpenCategories}
          className="btn-ghost py-1.5 px-3 text-xs gap-1.5 rounded-xl shadow-warm-sm"
          title="Manage categories"
        >
          <SlidersHorizontal size={13} className="text-primary-500" />
          <span>Categories</span>
        </button>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-surface-500
                       hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
