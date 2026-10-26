export type Priority = 'low' | 'medium' | 'high';

export type TaskCategory = 'Work' | 'Study' | 'Personal' | 'Health' | 'Finance' | string;

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: TaskCategory;
  dueDate: string; // YYYY-MM-DD
  estimatedMinutes?: number;
  completed: boolean;
  createdAt: number; // timestamp ms
  completedAt: number | null; // timestamp ms
}

export type SessionType = 'focus' | 'shortBreak' | 'longBreak';

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  sessionType: SessionType;
  durationMinutes: number;
  startedAt: number;
  completedAt: number;
  status: 'completed' | 'interrupted';
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerSettings {
  focusDuration: number; // in minutes (default 25)
  shortBreakDuration: number; // in minutes (default 5)
  longBreakDuration: number; // in minutes (default 15)
  soundEnabled: boolean;
  autoStartBreaks: boolean;
}

export interface DayActivity {
  date: string; // YYYY-MM-DD
  dayName: string;
  shortDate: string;
  completedTasks: number;
  focusMinutes: number;
  totalTasksScheduled: number;
}
