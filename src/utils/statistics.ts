import { Task, FocusSession, DayActivity } from '../types';
import { formatLocalDate, parseLocalDate, getTodayDateString } from './dateUtils';

export interface ProductivitySummary {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  overdueTasks: number;
  completionRate: number; // 0 to 100
  totalFocusMinutes: number;
  totalFocusSessions: number;
  todayCompletedTasks: number;
  todayFocusMinutes: number;
}

export interface CategoryBreakdown {
  name: string;
  count: number;
  completedCount: number;
  percentage: number;
}

export function calculateSummary(tasks: Task[], sessions: FocusSession[]): ProductivitySummary {
  const todayStr = getTodayDateString();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;

  const overdueTasks = tasks.filter((t) => {
    return !t.completed && t.dueDate && t.dueDate < todayStr;
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Completed focus sessions
  const completedSessions = sessions.filter((s) => s.status === 'completed' && s.sessionType === 'focus');
  const totalFocusMinutes = completedSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalFocusSessions = completedSessions.length;

  // Today's metrics
  const todayStart = parseLocalDate(todayStr).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  const todayCompletedTasks = tasks.filter((t) => {
    return t.completed && t.completedAt && t.completedAt >= todayStart && t.completedAt < todayEnd;
  }).length;

  const todayFocusMinutes = completedSessions.filter((s) => {
    return s.completedAt >= todayStart && s.completedAt < todayEnd;
  }).reduce((acc, s) => acc + s.durationMinutes, 0);

  return {
    totalTasks,
    completedTasks,
    activeTasks,
    overdueTasks,
    completionRate,
    totalFocusMinutes,
    totalFocusSessions,
    todayCompletedTasks,
    todayFocusMinutes,
  };
}

export function calculateDailyActivity(
  tasks: Task[],
  sessions: FocusSession[],
  daysCount: 7 | 30 = 7
): DayActivity[] {
  const result: DayActivity[] = [];
  const today = new Date();
  const completedSessions = sessions.filter((s) => s.status === 'completed' && s.sessionType === 'focus');

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const dateStr = formatLocalDate(d);
    const dayStart = d.setHours(0, 0, 0, 0);
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    // Completed tasks on this day
    const completedOnDay = tasks.filter((t) => {
      return t.completed && t.completedAt && t.completedAt >= dayStart && t.completedAt < dayEnd;
    }).length;

    // Focus minutes on this day
    const focusMinutesOnDay = completedSessions
      .filter((s) => s.completedAt >= dayStart && s.completedAt < dayEnd)
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    // Scheduled tasks for this day (due date matches)
    const scheduledOnDay = tasks.filter((t) => t.dueDate === dateStr).length;

    const shortDate = daysCount === 7 
      ? d.toLocaleDateString('en-US', { weekday: 'short' })
      : d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

    result.push({
      date: dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
      shortDate,
      completedTasks: completedOnDay,
      focusMinutes: focusMinutesOnDay,
      totalTasksScheduled: scheduledOnDay,
    });
  }

  return result;
}

export function calculateCategoryBreakdown(tasks: Task[]): CategoryBreakdown[] {
  if (tasks.length === 0) return [];

  const counts: Record<string, { total: number; completed: number }> = {};

  tasks.forEach((task) => {
    const cat = task.category || 'General';
    if (!counts[cat]) {
      counts[cat] = { total: 0, completed: 0 };
    }
    counts[cat].total += 1;
    if (task.completed) {
      counts[cat].completed += 1;
    }
  });

  return Object.entries(counts).map(([name, data]) => ({
    name,
    count: data.total,
    completedCount: data.completed,
    percentage: Math.round((data.total / tasks.length) * 100),
  })).sort((a, b) => b.count - a.count);
}

export function formatMinutesToHours(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}
