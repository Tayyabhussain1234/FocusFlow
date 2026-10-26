import React from 'react';
import { Task } from '../types';
import { useApp } from '../context/AppContext';
import { getRelativeDueDateLabel } from '../utils/dateUtils';
import { Check, Edit3, Trash2, Play, Clock, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  showFocusAction?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  showFocusAction = true,
}) => {
  const { toggleTaskCompleted, openConfirmDialog, deleteTask, openEditTaskModal, startFocusWithTask } = useApp();

  const dueInfo = getRelativeDueDateLabel(task.dueDate);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    } else {
      openEditTaskModal(task);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    openConfirmDialog({
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      confirmText: 'Delete Task',
      onConfirm: () => deleteTask(task.id),
    });
  };

  const handleStartFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    startFocusWithTask(task);
  };

  return (
    <div
      className={`group relative p-4 rounded-xl border transition-all duration-200 ${
        task.completed
          ? 'bg-[#151719]/60 border-[#303438]/50 opacity-75'
          : 'bg-[#1B1E21] border-[#303438] hover:border-[#FFD166]/40 hover:shadow-lg hover:shadow-black/40'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Custom Accessible Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
          onClick={() => toggleTaskCompleted(task.id)}
          className={`shrink-0 mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-[#72D6A0] border-[#72D6A0] text-black'
              : 'border-[#303438] hover:border-[#FFD166] bg-[#151719]'
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`text-sm font-medium leading-snug break-words ${
                task.completed ? 'line-through text-[#A3A8AE]' : 'text-[#F7F7F5]'
              }`}
            >
              {task.title}
            </h4>

            {/* Quick Actions (visible on hover / focus) */}
            <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {showFocusAction && !task.completed && (
                <button
                  type="button"
                  onClick={handleStartFocus}
                  title="Focus on this task in Pomodoro"
                  className="p-1 rounded-lg text-[#A3A8AE] hover:text-[#FFD166] hover:bg-[#22262A] transition-colors"
                  aria-label="Start Pomodoro focus session for this task"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              )}
              <button
                type="button"
                onClick={handleEdit}
                title="Edit task"
                className="p-1 rounded-lg text-[#A3A8AE] hover:text-[#F7F7F5] hover:bg-[#22262A] transition-colors"
                aria-label="Edit task"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                title="Delete task"
                className="p-1 rounded-lg text-[#A3A8AE] hover:text-[#FF7373] hover:bg-[#22262A] transition-colors"
                aria-label="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-[#A3A8AE] line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Zero-Pill Quiet Metadata Row */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-[#A3A8AE]">
            {/* Category */}
            <span className="font-medium text-[#F7F7F5]/80">{task.category}</span>

            <span aria-hidden="true" className="text-[#303438]">·</span>

            {/* Priority Indicator */}
            <span className="flex items-center gap-1 font-medium capitalize">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  task.priority === 'high'
                    ? 'bg-[#FF7373]'
                    : task.priority === 'medium'
                    ? 'bg-[#FFD166]'
                    : 'bg-[#A3A8AE]'
                }`}
              />
              <span
                className={
                  task.priority === 'high'
                    ? 'text-[#FF7373]'
                    : task.priority === 'medium'
                    ? 'text-[#FFD166]'
                    : 'text-[#A3A8AE]'
                }
              >
                {task.priority}
              </span>
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <>
                <span aria-hidden="true" className="text-[#303438]">·</span>
                <span
                  className={`flex items-center gap-1 ${
                    dueInfo.isOverdue && !task.completed
                      ? 'text-[#FF7373] font-semibold'
                      : dueInfo.isToday && !task.completed
                      ? 'text-[#FFD166] font-semibold'
                      : 'text-[#A3A8AE]'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>{dueInfo.label}</span>
                </span>
              </>
            )}

            {/* Estimated Duration */}
            {task.estimatedMinutes && (
              <>
                <span aria-hidden="true" className="text-[#303438]">·</span>
                <span className="flex items-center gap-1 text-[#A3A8AE]">
                  <Clock className="w-3 h-3" />
                  <span className="tabular-nums font-mono">{task.estimatedMinutes}m</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
