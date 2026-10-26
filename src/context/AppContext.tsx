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

// Default starter tasks
const getInitialTasks = (): Task[] => {
  const today = new Date();
  const todayStr = formatLocalDate(today);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = formatLocalDate(tomorrow);

  const inThreeDays = new Date(today);
  inThreeDays.setDate(today.getDate() + 3);
  const inThreeDaysStr = formatLocalDate(inThreeDays);

  const now = Date.now();

  return [
    {
      id: 'task_seed_1',
      title: 'Review user experience audit & wireframes',
      description: 'Analyze mobile touch targets, visual hierarchy, and focus state accessibility for upcoming sprint.',
      priority: 'high',
      category: 'Work',
      dueDate: todayStr,
      estimatedMinutes: 45,
      completed: true,
      createdAt: now - 86400000 * 2,
      completedAt: now - 3600000 * 2,
    },
    {
      id: 'task_seed_2',
      title: 'Prepare Weekly Engineering Architecture Sync',
      description: 'Synthesize module decoupling strategies, persistence reliability, and performance benchmarks.',
      priority: 'high',
      category: 'Work',
      dueDate: todayStr,
      estimatedMinutes: 50,
      completed: false,
      createdAt: now - 86400000,
      completedAt: null,
    },
    {
      id: 'task_seed_3',
      title: 'Deep dive into reactive state algorithms & memoization',
      description: 'Study fine-grained reactivity patterns, memory profiling, and virtual DOM diffing mechanisms.',
      priority: 'medium',
      category: 'Study',
      dueDate: tomorrowStr,
      estimatedMinutes: 60,
      completed: false,
      createdAt: now - 86400000 * 3,
      completedAt: null,
    },
    {
      id: 'task_seed_4',
      title: 'Refactor data validation & boundary safety',
      description: 'Ensure safe serialization and type assertions for local storage collections.',
      priority: 'medium',
      category: 'Work',
      dueDate: yesterdayStr,
      estimatedMinutes: 30,
      completed: true,
      createdAt: now - 86400000 * 4,
      completedAt: now - 86400000,
    },
    {
      id: 'task_seed_5',
      title: 'Mindful evening review & reading session',
      description: 'Review productivity journal, reflect on deep focus blocks, and plan next day priorities.',
      priority: 'low',
      category: 'Personal',
      dueDate: todayStr,
      estimatedMinutes: 25,
      completed: false,
      createdAt: now - 86400000,
      completedAt: null,
    },
    {
      id: 'task_seed_6',
      title: 'Quarterly financial budget allocation & ledger sync',
      description: 'Reconcile business expenses, review subscriptions, and allocate development tooling budgets.',
      priority: 'low',
      category: 'Finance',
      dueDate: inThreeDaysStr,
      estimatedMinutes: 40,
      completed: false,
      createdAt: now - 86400000 * 2,
      completedAt: null,
    },
  ];
};

// Initial focus sessions for authentic historical charts
const getInitialSessions = (): FocusSession[] => {
  const now = Date.now();
  const dayMs = 86400000;

  return [
    {
      id: 'session_init_1',
      taskId: 'task_seed_1',
      taskTitle: 'Review user experience audit & wireframes',
      sessionType: 'focus',
      durationMinutes: 25,
      startedAt: now - 3600000 * 3,
      completedAt: now - 3600000 * 2.5,
      status: 'completed',
    },
    {
      id: 'session_init_2',
      taskId: 'task_seed_1',
      taskTitle: 'Review user experience audit & wireframes',
      sessionType: 'focus',
      durationMinutes: 25,
      startedAt: now - 3600000 * 2.4,
      completedAt: now - 3600000 * 1.9,
      status: 'completed',
    },
    {
      id: 'session_init_3',
      taskId: 'task_seed_4',
      taskTitle: 'Refactor data validation & boundary safety',
      sessionType: 'focus',
      durationMinutes: 25,
      startedAt: now - dayMs - 3600000 * 4,
      completedAt: now - dayMs - 3600000 * 3.5,
      status: 'completed',
    },
    {
      id: 'session_init_4',
      taskId: 'task_seed_4',
      taskTitle: 'Refactor data validation & boundary safety',
      sessionType: 'focus',
      durationMinutes: 25,
      startedAt: now - dayMs * 2 - 3600000 * 5,
      completedAt: now - dayMs * 2 - 3600000 * 4.5,
      status: 'completed',
    },
    {
      id: 'session_init_5',
      sessionType: 'focus',
      durationMinutes: 25,
      startedAt: now - dayMs * 3 - 3600000 * 6,
      completedAt: now - dayMs * 3 - 3600000 * 5.5,
      status: 'completed',
    },
  ];
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

  // Tasks state with safe localStorage persistence
  const [tasks, setTasks] = useLocalStorage<Task[]>('focusflow_tasks_v1', getInitialTasks());

  // Focus sessions state with persistence
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>('focusflow_sessions_v1', getInitialSessions());

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
