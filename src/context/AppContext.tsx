import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Task, FocusSession, Priority } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { getTodayDateString, formatLocalDate } from '../utils/dateUtils';

export type AppPage = 'overview' | 'tasks' | 'focus' | 'planner' | 'insights';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  dueDate: string;
  estimatedMinutes?: number;
}

interface AppContextType {
  // Navigation
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;

  // Tasks
  tasks: Task[];
  addTask: (taskData: TaskFormData) => Task;
  updateTask: (id: string, taskData: Partial<TaskFormData>) => void;
  toggleTaskCompleted: (id: string) => void;
  deleteTask: (id: string) => void;

  // Focus Sessions
  sessions: FocusSession[];
  addSession: (session: FocusSession) => void;

  // Timer (Globally available so sessions persist across page transitions)
  timer: ReturnType<typeof usePomodoroTimer>;
  startFocusWithTask: (task: Task) => void;

  // Modals & Dialogs
  isTaskFormOpen: boolean;
  editingTask: Task | null;
  formDefaultDate: string;
  openNewTaskModal: (defaultDate?: string) => void;
  openEditTaskModal: (task: Task) => void;
  closeTaskModal: () => void;

  // Confirmation dialog
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  };
  openConfirmDialog: (config: { title: string; message: string; confirmText?: string; onConfirm: () => void }) => void;
  closeConfirmDialog: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Categories
  categories: string[];
}

const AppContext = createContext<AppContextType | null>(null);

// Retrieve stored tasks, removing any legacy seed records
const getCleanStoredTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem('focusflow_tasks_v2');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((t: Task) => !t.id.startsWith('task_seed_'));
      }
    }
    // Clear legacy v1 seed data if present
    const oldStored = window.localStorage.getItem('focusflow_tasks_v1');
    if (oldStored) {
      window.localStorage.removeItem('focusflow_tasks_v1');
      const parsed = JSON.parse(oldStored);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((t: Task) => !t.id.startsWith('task_seed_'));
        window.localStorage.setItem('focusflow_tasks_v2', JSON.stringify(cleaned));
        return cleaned;
      }
    }
  } catch {
    // fallback to empty
  }
  return [];
};

// Retrieve stored sessions, removing any legacy seed records
const getCleanStoredSessions = (): FocusSession[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem('focusflow_sessions_v2');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((s: FocusSession) => !s.id.startsWith('session_init_'));
      }
    }
    // Clear legacy v1 seed data if present
    const oldStored = window.localStorage.getItem('focusflow_sessions_v1');
    if (oldStored) {
      window.localStorage.removeItem('focusflow_sessions_v1');
      const parsed = JSON.parse(oldStored);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((s: FocusSession) => !s.id.startsWith('session_init_'));
        window.localStorage.setItem('focusflow_sessions_v2', JSON.stringify(cleaned));
        return cleaned;
      }
    }
  } catch {
    // fallback to empty
  }
  return [];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation state (supports hash routing / back-forward navigation)
  const [currentPage, setCurrentPageState] = useState<AppPage>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as AppPage;
      if (['overview', 'tasks', 'focus', 'planner', 'insights'].includes(hash)) {
        return hash;
      }
    }
    return 'overview';
  });

  const setCurrentPage = useCallback((page: AppPage) => {
    setCurrentPageState(page);
    if (typeof window !== 'undefined') {
      window.location.hash = page;
    }
  }, []);

  // Sync hash back/forward
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AppPage;
      if (['overview', 'tasks', 'focus', 'planner', 'insights'].includes(hash)) {
        setCurrentPageState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Tasks state initialized completely clean without dummy data
  const [tasks, setTasks] = useLocalStorage<Task[]>('focusflow_tasks_v2', getCleanStoredTasks());

  // Focus sessions state initialized completely clean without dummy data
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>('focusflow_sessions_v2', getCleanStoredSessions());

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  // Handle focus session completed
  const handleSessionCompleted = useCallback(
    (newSession: FocusSession) => {
      setSessions((prev) => [newSession, ...prev]);
      if (newSession.sessionType === 'focus') {
        showToast(
          `Focus session complete! (+${newSession.durationMinutes}m focus logged)`,
          'success'
        );
      } else {
        showToast('Break finished! Ready for the next deep focus block.', 'info');
      }
    },
    [setSessions, showToast]
  );

  // Global Pomodoro timer instance
  const timer = usePomodoroTimer(handleSessionCompleted);

  // Quick action: start focus timer with a specific task
  const startFocusWithTask = useCallback(
    (task: Task) => {
      timer.selectTask({ id: task.id, title: task.title });
      timer.switchSessionType('focus');
      setCurrentPage('focus');
      showToast(`Ready to focus on "${task.title}". Click Start when ready!`, 'info');
    },
    [timer, setCurrentPage, showToast]
  );

  // Task actions
  const addTask = useCallback(
    (taskData: TaskFormData): Task => {
      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        priority: taskData.priority,
        category: taskData.category || 'General',
        dueDate: taskData.dueDate || '',
        estimatedMinutes: taskData.estimatedMinutes ? Number(taskData.estimatedMinutes) : undefined,
        completed: false,
        createdAt: Date.now(),
        completedAt: null,
      };

      setTasks((prev) => [newTask, ...prev]);
      showToast('Task created successfully', 'success');
      return newTask;
    },
    [setTasks, showToast]
  );

  const updateTask = useCallback(
    (id: string, taskData: Partial<TaskFormData>) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            title: taskData.title !== undefined ? taskData.title.trim() : t.title,
            description: taskData.description !== undefined ? taskData.description.trim() : t.description,
            priority: taskData.priority !== undefined ? taskData.priority : t.priority,
            category: taskData.category !== undefined ? taskData.category : t.category,
            dueDate: taskData.dueDate !== undefined ? taskData.dueDate : t.dueDate,
            estimatedMinutes:
              taskData.estimatedMinutes !== undefined
                ? taskData.estimatedMinutes ? Number(taskData.estimatedMinutes) : undefined
                : t.estimatedMinutes,
          };
        })
      );
      showToast('Task updated successfully', 'success');
    },
    [setTasks, showToast]
  );

  const toggleTaskCompleted = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? Date.now() : null,
          };
        })
      );
    },
    [setTasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast('Task deleted', 'info');
    },
    [setTasks, showToast]
  );

  const addSession = useCallback(
    (session: FocusSession) => {
      setSessions((prev) => [session, ...prev]);
    },
    [setSessions]
  );

  // Modals
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string>(getTodayDateString());

  const openNewTaskModal = useCallback((defaultDate?: string) => {
    setEditingTask(null);
    setFormDefaultDate(defaultDate || getTodayDateString());
    setIsTaskFormOpen(true);
  }, []);

  const openEditTaskModal = useCallback((task: Task) => {
    setEditingTask(task);
    setFormDefaultDate(task.dueDate || getTodayDateString());
    setIsTaskFormOpen(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
  }, []);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const openConfirmDialog = useCallback(
    (config: { title: string; message: string; confirmText?: string; onConfirm: () => void }) => {
      setConfirmDialog({
        isOpen: true,
        title: config.title,
        message: config.message,
        confirmText: config.confirmText,
        onConfirm: () => {
          config.onConfirm();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
      });
    },
    []
  );

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Dynamic categories list extracted from tasks + standard defaults
  const categories = useMemo(() => {
    const defaultCats = ['Work', 'Study', 'Personal', 'Health', 'Finance'];
    const taskCats = tasks.map((t) => t.category).filter(Boolean);
    const set = new Set([...defaultCats, ...taskCats]);
    return Array.from(set);
  }, [tasks]);

  const value = useMemo(
    () => ({
      currentPage,
      setCurrentPage,
      tasks,
      addTask,
      updateTask,
      toggleTaskCompleted,
      deleteTask,
      sessions,
      addSession,
      timer,
      startFocusWithTask,
      isTaskFormOpen,
      editingTask,
      formDefaultDate,
      openNewTaskModal,
      openEditTaskModal,
      closeTaskModal,
      confirmDialog,
      openConfirmDialog,
      closeConfirmDialog,
      toasts,
      showToast,
      removeToast,
      categories,
    }),
    [
      currentPage,
      setCurrentPage,
      tasks,
      addTask,
      updateTask,
      toggleTaskCompleted,
      deleteTask,
      sessions,
      addSession,
      timer,
      startFocusWithTask,
      isTaskFormOpen,
      editingTask,
      formDefaultDate,
      openNewTaskModal,
      openEditTaskModal,
      closeTaskModal,
      confirmDialog,
      openConfirmDialog,
      closeConfirmDialog,
      toasts,
      showToast,
      removeToast,
      categories,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
