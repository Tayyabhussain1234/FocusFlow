import { Task, Priority } from '../types';
import { getTodayDateString } from './dateUtils';

export interface TaskFilterOptions {
  searchQuery: string;
  status: 'all' | 'active' | 'completed' | 'overdue';
  priority: 'all' | Priority;
  category: string;
  sortBy: 'dueDate-asc' | 'dueDate-desc' | 'priority-desc' | 'priority-asc' | 'createdAt-desc' | 'createdAt-asc' | 'title-asc';
}

const PRIORITY_WEIGHTS: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function filterAndSortTasks(tasks: Task[], options: TaskFilterOptions): Task[] {
  const today = getTodayDateString();
  const query = options.searchQuery.trim().toLowerCase();

  return tasks
    .filter((task) => {
      // Search matching title or description
      if (query) {
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = task.description.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      // Status filter
      if (options.status === 'active' && task.completed) return false;
      if (options.status === 'completed' && !task.completed) return false;
      if (options.status === 'overdue') {
        if (task.completed) return false;
        if (!task.dueDate || task.dueDate >= today) return false;
      }

      // Priority filter
      if (options.priority !== 'all' && task.priority !== options.priority) {
        return false;
      }

      // Category filter
      if (options.category !== 'all' && task.category !== options.category) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (options.sortBy) {
        case 'dueDate-asc': {
          // Tasks without due date go to the bottom
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        case 'dueDate-desc': {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return b.dueDate.localeCompare(a.dueDate);
        }
        case 'priority-desc': {
          const diff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
          return diff !== 0 ? diff : b.createdAt - a.createdAt;
        }
        case 'priority-asc': {
          const diff = PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority];
          return diff !== 0 ? diff : b.createdAt - a.createdAt;
        }
        case 'createdAt-asc':
          return a.createdAt - b.createdAt;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'createdAt-desc':
        default:
          return b.createdAt - a.createdAt;
      }
    });
}

export function validateTaskInput(data: {
  title: string;
  estimatedMinutes?: number | string;
}): { isValid: boolean; errors: { title?: string; estimatedMinutes?: string } } {
  const errors: { title?: string; estimatedMinutes?: string } = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Task title is required';
  } else if (data.title.trim().length > 120) {
    errors.title = 'Title must be 120 characters or less';
  }

  if (data.estimatedMinutes !== undefined && data.estimatedMinutes !== '') {
    const num = Number(data.estimatedMinutes);
    if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
      errors.estimatedMinutes = 'Estimated duration must be a positive integer';
    } else if (num > 1440) {
      errors.estimatedMinutes = 'Duration cannot exceed 1440 minutes (24 hours)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
