import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getWeekDates,
  formatLocalDate,
  getTodayDateString,
  formatWeekRange,
  formatDisplayDate,
} from '../utils/dateUtils';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, CheckCircle2 } from 'lucide-react';

export const WeeklyPlanner: React.FC = () => {
  const { tasks, openNewTaskModal } = useApp();

  // Current reference date for the week
  const [refDate, setRefDate] = useState<Date>(() => new Date());

  // Currently selected date string (YYYY-MM-DD)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => getTodayDateString());

  // 7 days for the active week
  const weekDates = useMemo(() => getWeekDates(refDate), [refDate]);
  const weekLabel = useMemo(() => formatWeekRange(weekDates), [weekDates]);
  const todayStr = getTodayDateString();

  // Navigation handlers
  const handlePrevWeek = () => {
    setRefDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setRefDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleGoToToday = () => {
    const today = new Date();
    setRefDate(today);
    setSelectedDateStr(getTodayDateString());
  };

  // Group tasks by dueDate
  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    tasks.forEach((t) => {
      if (t.dueDate) {
        const list = map.get(t.dueDate) || [];
        list.push(t);
        map.set(t.dueDate, list);
      }
    });
    return map;
  }, [tasks]);

  // Tasks scheduled for the currently selected day
  const selectedDayTasks = useMemo(() => {
    return tasksByDate.get(selectedDateStr) || [];
  }, [tasksByDate, selectedDateStr]);

  const selectedDayCompletedCount = selectedDayTasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Calendar Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1B1E21] border border-[#303438]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#FFD166] flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            Weekly Schedule
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F7F7F5] mt-1">
            {weekLabel}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGoToToday}
            className="px-3 py-1.5 text-xs font-medium text-[#A3A8AE] hover:text-[#F7F7F5] bg-[#151719] hover:bg-[#22262A] border border-[#303438] rounded-xl transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl bg-[#151719] border border-[#303438] p-0.5">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-1.5 text-[#A3A8AE] hover:text-[#F7F7F5] transition-colors rounded-lg hover:bg-[#22262A]"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-1.5 text-[#A3A8AE] hover:text-[#F7F7F5] transition-colors rounded-lg hover:bg-[#22262A]"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Week Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {weekDates.map((dayDate) => {
          const dateStr = formatLocalDate(dayDate);
          const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dayDate.getDate();
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDateStr;

          const dayTasks = tasksByDate.get(dateStr) || [];
          const completedCount = dayTasks.filter((t) => t.completed).length;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => setSelectedDateStr(dateStr)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#22262A] border-[#FFD166] shadow-lg shadow-black/40 ring-1 ring-[#FFD166]/50'
                  : 'bg-[#1B1E21] border-[#303438] hover:border-[#FFD166]/30 hover:bg-[#22262A]/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${isSelected ? 'text-[#FFD166]' : 'text-[#A3A8AE]'}`}>
                  {dayName}
                </span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD166]" title="Today" />
                )}
              </div>

              <div className="my-2.5">
                <div className={`text-xl sm:text-2xl font-bold tabular-nums font-mono ${
                  isSelected ? 'text-[#F7F7F5]' : isToday ? 'text-[#FFD166]' : 'text-[#F7F7F5]'
                }`}>
                  {dayNum}
                </div>
              </div>

              {/* Task Counts Indicator */}
              <div className="text-[11px] font-medium text-[#A3A8AE]">
                {dayTasks.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <span className="tabular-nums font-mono text-[#F7F7F5]">{completedCount}/{dayTasks.length}</span>
                    <span>done</span>
                  </div>
                ) : (
                  <span className="text-[#A3A8AE]/50">No tasks</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Task Detail View */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#1B1E21] border border-[#303438] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#303438]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#F7F7F5]">
                {formatDisplayDate(selectedDateStr)}
              </h3>
              {selectedDateStr === todayStr && (
                <span className="text-xs font-semibold text-[#FFD166] bg-[#FFD166]/10 px-2 py-0.5 rounded-md border border-[#FFD166]/20">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-[#A3A8AE] mt-0.5">
              {selectedDayTasks.length} task{selectedDayTasks.length === 1 ? '' : 's'} scheduled{' '}
              {selectedDayTasks.length > 0 && `· ${selectedDayCompletedCount} completed`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => openNewTaskModal(selectedDateStr)}
            className="px-3.5 py-2 text-xs font-semibold text-black bg-gradient-to-r from-[#FFD166] to-[#FF8A00] hover:brightness-110 rounded-xl transition-all shadow-md shadow-[#FF8A00]/20 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Add Task to Day
          </button>
        </div>

        {/* Task List for Selected Day */}
        {selectedDayTasks.length > 0 ? (
          <div className="space-y-3 pt-2">
            {selectedDayTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="py-6">
            <EmptyState
              icon={CalendarIcon}
              title="No tasks scheduled for this day"
              description="Plan ahead by scheduling a high-priority task or focus session."
              actionText="Schedule Task"
              onAction={() => openNewTaskModal(selectedDateStr)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
