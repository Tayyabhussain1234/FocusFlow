import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';
import { calculateSummary, formatMinutesToHours } from '../utils/statistics';
import { getTodayDateString, getRelativeDueDateLabel } from '../utils/dateUtils';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  ListTodo,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { tasks, sessions, setCurrentPage, openNewTaskModal, timer } = useApp();

  const summary = useMemo(() => calculateSummary(tasks, sessions), [tasks, sessions]);
  const todayStr = getTodayDateString();

  // Tasks due today or overdue
  const todayAndOverdueTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.completed) return false;
        if (!t.dueDate) return false;
        return t.dueDate <= todayStr;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, todayStr]);

  // Next up tasks (active tasks due tomorrow or later, or without due date)
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.completed && (!t.dueDate || t.dueDate > todayStr))
      .slice(0, 3);
  }, [tasks, todayStr]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1B1E21] via-[#22262A] to-[#1B1E21] border border-[#303438] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FFD166]">
            <Sparkles className="w-3.5 h-3.5" />
            FocusFlow Command Center
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F7F7F5] mt-1">
            Focus on what moves the needle.
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#A3A8AE] max-w-xl">
            {tasks.length === 0
              ? 'Your workspace is ready. Create your first task or start a focus session to begin.'
              : todayAndOverdueTasks.length > 0
              ? `You have ${todayAndOverdueTasks.length} priority task${
                  todayAndOverdueTasks.length === 1 ? '' : 's'
                } needing your attention today.`
              : 'All scheduled priorities for today are completed. Ready for deep work or planning ahead!'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentPage('focus')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD166] to-[#FF8A00] text-black font-semibold text-xs sm:text-sm hover:brightness-110 shadow-md shadow-[#FF8A00]/25 transition-all flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {timer.status === 'running' ? 'View Active Timer' : 'Start Focus Block'}
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Completed"
          value={summary.todayCompletedTasks}
          subtext="Tasks logged today"
          icon={CheckCircle2}
        />
        <StatCard
          label="Today's Focus Time"
          value={`${summary.todayFocusMinutes}m`}
          subtext="Deep concentration"
          icon={Clock}
        />
        <StatCard
          label="Priority Queue"
          value={todayAndOverdueTasks.length}
          subtext={
            summary.overdueTasks > 0
              ? `${summary.overdueTasks} overdue`
              : 'Zero overdue tasks'
          }
          icon={AlertTriangle}
        />
        <StatCard
          label="Overall Velocity"
          value={`${summary.completionRate}%`}
          subtext={`${summary.completedTasks} of ${summary.totalTasks} total tasks`}
          icon={ListTodo}
        />
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Priorities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#1B1E21] border border-[#303438] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#303438]">
              <div>
                <h3 className="text-base font-bold text-[#F7F7F5] flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-[#FFD166]" />
                  Today & Overdue Priorities
                </h3>
                <p className="text-xs text-[#A3A8AE] mt-0.5">
                  Tasks requiring completion before the day ends
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage('tasks')}
                className="text-xs font-semibold text-[#FFD166] hover:underline flex items-center gap-1"
              >
                <span>All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayAndOverdueTasks.length > 0 ? (
              <div className="space-y-3 pt-1">
                {todayAndOverdueTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="py-6">
                <EmptyState
                  icon={CheckCircle2}
                  title="No urgent tasks right now"
                  description="Your today queue is clear! Schedule your next priority or start a freestyle focus session."
                  actionText="Add New Task"
                  onAction={() => openNewTaskModal(todayStr)}
                />
              </div>
            )}
          </div>

          {/* Upcoming Preview */}
          {upcomingTasks.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#1B1E21] border border-[#303438]">
              <div className="flex items-center justify-between pb-3 border-b border-[#303438] mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A3A8AE]">
                  Upcoming Next
                </h4>
                <button
                  type="button"
                  onClick={() => setCurrentPage('planner')}
                  className="text-xs text-[#FFD166] hover:underline flex items-center gap-1"
                >
                  <span>Open Planner</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2.5">
                {upcomingTasks.map((t) => (
                  <TaskCard key={t.id} task={t} showFocusAction={false} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Quick Focus Widget & Navigation Cards */}
        <div className="space-y-6">
          {/* Quick Focus Widget */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#1B1E21] border border-[#303438] text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#FFD166] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Focus Engine
              </span>
              <span className="text-xs text-[#A3A8AE]">
                {timer.settings.focusDuration}m standard
              </span>
            </div>

            <div className="py-4">
              <div className="text-4xl sm:text-5xl font-extrabold text-[#F7F7F5] tabular-nums font-mono">
                {timer.formattedTime}
              </div>
              <div className="mt-2 text-xs text-[#A3A8AE] truncate max-w-[200px] mx-auto">
                {timer.activeTaskTitle ? timer.activeTaskTitle : 'Unlinked Focus Session'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (timer.status === 'running') {
                    timer.pauseTimer();
                  } else {
                    timer.startTimer();
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD166] to-[#FF8A00] text-black font-semibold text-xs hover:brightness-110 shadow-md shadow-[#FF8A00]/20 transition-all"
              >
                {timer.status === 'running' ? 'Pause' : 'Start Focus'}
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('focus')}
                className="px-3 py-2.5 rounded-xl bg-[#151719] hover:bg-[#22262A] border border-[#303438] text-xs text-[#A3A8AE] hover:text-[#F7F7F5] transition-colors"
                title="Open full focus timer screen"
              >
                Expand
              </button>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="p-5 rounded-2xl bg-[#1B1E21] border border-[#303438] space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A3A8AE]">
              Workspace Short-cuts
            </h4>

            <button
              type="button"
              onClick={() => setCurrentPage('planner')}
              className="w-full p-3 rounded-xl bg-[#151719] hover:bg-[#22262A] border border-[#303438] hover:border-[#FFD166]/40 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#FFD166]" />
                <div>
                  <div className="text-xs font-semibold text-[#F7F7F5] group-hover:text-[#FFD166] transition-colors">
                    Weekly Calendar
                  </div>
                  <div className="text-[11px] text-[#A3A8AE]">
                    Plan upcoming work days
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#A3A8AE] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage('insights')}
              className="w-full p-3 rounded-xl bg-[#151719] hover:bg-[#22262A] border border-[#303438] hover:border-[#FFD166]/40 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#72D6A0]" />
                <div>
                  <div className="text-xs font-semibold text-[#F7F7F5] group-hover:text-[#FFD166] transition-colors">
                    Productivity Insights
                  </div>
                  <div className="text-[11px] text-[#A3A8AE]">
                    Analyze focus curves & charts
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#A3A8AE] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
