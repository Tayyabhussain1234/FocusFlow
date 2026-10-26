/**
 * Date utilities using consistent local calendar strings (YYYY-MM-DD)
 * to prevent timezone-related off-by-one errors.
 */

// Formats a Date object to YYYY-MM-DD in local time
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parses YYYY-MM-DD into a local Date object set at 00:00:00
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Today's date string in local time (YYYY-MM-DD)
export function getTodayDateString(): string {
  return formatLocalDate(new Date());
}

// Returns an array of 7 Date objects starting from the Monday (or specified start) of the given reference date's week
export function getWeekDates(refDate: Date): Date[] {
  const current = new Date(refDate);
  // Get day of week (0 is Sunday, 1 is Monday, ..., 6 is Saturday)
  const dayOfWeek = current.getDay();
  // We align week to start on Monday (ISO-like standard for planning)
  // Monday is 1; Sunday is 7 in 1-based index
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(current.getFullYear(), current.getMonth(), current.getDate() + diffToMonday);
  
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
  }
  return days;
}

// Human readable date string, e.g. "Monday, October 25"
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Full date format, e.g. "Monday, October 25, 2026"
export function formatFullDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Relative date label: "Today", "Tomorrow", "Yesterday", or "Oct 25"
export function getRelativeDueDateLabel(dueDateStr: string): { label: string; isOverdue: boolean; isToday: boolean } {
  if (!dueDateStr) return { label: '', isOverdue: false, isToday: false };

  const todayStr = getTodayDateString();
  if (dueDateStr === todayStr) {
    return { label: 'Today', isOverdue: false, isToday: true };
  }

  const today = parseLocalDate(todayStr);
  const due = parseLocalDate(dueDateStr);
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { label: 'Tomorrow', isOverdue: false, isToday: false };
  }
  if (diffDays === -1) {
    return { label: 'Yesterday', isOverdue: true, isToday: false };
  }
  if (diffDays < 0) {
    return { label: `${Math.abs(diffDays)}d overdue`, isOverdue: true, isToday: false };
  }

  return {
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue: false,
    isToday: false,
  };
}

// Range format for week header, e.g. "Oct 19 – Oct 25, 2026"
export function formatWeekRange(dates: Date[]): string {
  if (dates.length === 0) return '';
  const first = dates[0];
  const last = dates[dates.length - 1];

  const firstMonth = first.toLocaleDateString('en-US', { month: 'short' });
  const lastMonth = last.toLocaleDateString('en-US', { month: 'short' });
  const year = last.getFullYear();

  if (firstMonth === lastMonth) {
    return `${firstMonth} ${first.getDate()} – ${last.getDate()}, ${year}`;
  }
  return `${firstMonth} ${first.getDate()} – ${lastMonth} ${last.getDate()}, ${year}`;
}
