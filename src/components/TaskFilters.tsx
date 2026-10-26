import React from 'react';
import { TaskFilterOptions } from '../utils/taskUtils';
import { Priority } from '../types';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface TaskFiltersProps {
  filters: TaskFilterOptions;
  onChange: (newFilters: TaskFilterOptions) => void;
  categories: string[];
  totalTasksCount: number;
  filteredTasksCount: number;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onChange,
  categories,
  totalTasksCount,
  filteredTasksCount,
}) => {
  const isFiltered =
    filters.searchQuery !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all' ||
    filters.sortBy !== 'createdAt-desc';

  const handleClearFilters = () => {
    onChange({
      searchQuery: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      sortBy: 'createdAt-desc',
    });
  };

  const statusOptions: { id: TaskFilterOptions['status']; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'overdue', label: 'Overdue' },
  ];

  return (
    <div className="space-y-3">
      {/* Search Bar & Quick Status Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A8AE]" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#1B1E21] border border-[#303438] text-sm text-[#F7F7F5] placeholder-[#A3A8AE]/60 focus:outline-none focus:border-[#FFD166] transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#A3A8AE] hover:text-[#F7F7F5]"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Segmented Control */}
        <div className="flex items-center p-1 rounded-xl bg-[#1B1E21] border border-[#303438] shrink-0 overflow-x-auto">
          {statusOptions.map((opt) => {
            const isActive = filters.status === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ ...filters, status: opt.id })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#22262A] text-[#FFD166] shadow-sm'
                    : 'text-[#A3A8AE] hover:text-[#F7F7F5]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Filter Dropdowns & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#A3A8AE]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#FFD166]" />
            <select
              value={filters.priority}
              onChange={(e) =>
                onChange({ ...filters, priority: e.target.value as 'all' | Priority })
              }
              aria-label="Filter by priority"
              className="px-2.5 py-1.5 rounded-lg bg-[#1B1E21] border border-[#303438] text-xs text-[#F7F7F5] focus:outline-none focus:border-[#FFD166]"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            aria-label="Filter by category"
            className="px-2.5 py-1.5 rounded-lg bg-[#1B1E21] border border-[#303438] text-xs text-[#F7F7F5] focus:outline-none focus:border-[#FFD166]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-[#A3A8AE]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#FFD166]" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onChange({
                  ...filters,
                  sortBy: e.target.value as TaskFilterOptions['sortBy'],
                })
              }
              aria-label="Sort tasks by"
              className="px-2.5 py-1.5 rounded-lg bg-[#1B1E21] border border-[#303438] text-xs text-[#F7F7F5] focus:outline-none focus:border-[#FFD166]"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="dueDate-asc">Due Date (Soonest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="priority-desc">Priority (High to Low)</option>
              <option value="priority-asc">Priority (Low to High)</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>

          {/* Clear Filters Action */}
          {isFiltered && (
            <button
              onClick={handleClearFilters}
              className="px-2.5 py-1.5 text-xs font-medium text-[#FF7373] hover:text-[#ff9494] bg-[#FF7373]/10 hover:bg-[#FF7373]/20 border border-[#FF7373]/20 rounded-lg transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Task Counter */}
        <div className="text-xs text-[#A3A8AE] tabular-nums font-mono">
          Showing <span className="font-semibold text-[#F7F7F5]">{filteredTasksCount}</span> of{' '}
          <span className="font-semibold text-[#F7F7F5]">{totalTasksCount}</span> tasks
        </div>
      </div>
    </div>
  );
};
