import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TaskFilters } from '../components/TaskFilters';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';
import { TaskFilterOptions, filterAndSortTasks } from '../utils/taskUtils';
import { CheckSquare, Plus, SearchX, Sparkles } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { tasks, categories, openNewTaskModal } = useApp();

  const [filterOptions, setFilterOptions] = useState<TaskFilterOptions>({
    searchQuery: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    sortBy: 'createdAt-desc',
  });

  const filteredTasks = useMemo(() => {
    return filterAndSortTasks(tasks, filterOptions);
  }, [tasks, filterOptions]);

  const isFilterActive =
    filterOptions.searchQuery !== '' ||
    filterOptions.status !== 'all' ||
    filterOptions.priority !== 'all' ||
    filterOptions.category !== 'all' ||
    filterOptions.sortBy !== 'createdAt-desc';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1B1E21] border border-[#303438]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#FFD166] flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            Smart Task Manager
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F7F7F5] mt-1">
            Task Backlog & Workflow
          </h2>
          <p className="text-xs text-[#A3A8AE] mt-0.5">
            Filter by priority, due date, or functional category to drive focus.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openNewTaskModal()}
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-black bg-gradient-to-r from-[#FFD166] to-[#FF8A00] hover:brightness-110 rounded-xl transition-all shadow-md shadow-[#FF8A00]/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Create Task
        </button>
      </div>

      {/* Filter and Search Controls */}
      <TaskFilters
        filters={filterOptions}
        onChange={setFilterOptions}
        categories={categories}
        totalTasksCount={tasks.length}
        filteredTasksCount={filteredTasks.length}
      />

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : isFilterActive ? (
        <EmptyState
          icon={SearchX}
          title="No tasks match your filters"
          description="Try broadening your search query or resetting active status/priority filters."
          actionText="Clear All Filters"
          onAction={() =>
            setFilterOptions({
              searchQuery: '',
              status: 'all',
              priority: 'all',
              category: 'all',
              sortBy: 'createdAt-desc',
            })
          }
        />
      ) : (
        <EmptyState
          icon={Sparkles}
          title="Your task backlog is empty"
          description="Create your first task to start planning smarter, organizing priorities, and tracking progress."
          actionText="Create First Task"
          onAction={() => openNewTaskModal()}
        />
      )}
    </div>
  );
};
