import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Priority } from '../types';
import { validateTaskInput } from '../utils/taskUtils';
import { X, Calendar, Clock, Tag, Flag } from 'lucide-react';

export const TaskForm: React.FC = () => {
  const {
    isTaskFormOpen,
    editingTask,
    formDefaultDate,
    closeTaskModal,
    addTask,
    updateTask,
    categories,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Work');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>('');
  const [errors, setErrors] = useState<{ title?: string; estimatedMinutes?: string }>({});

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      if (categories.includes(editingTask.category)) {
        setCategory(editingTask.category);
        setIsCustomCategory(false);
      } else {
        setCategory('custom');
        setCustomCategory(editingTask.category);
        setIsCustomCategory(true);
      }
      setDueDate(editingTask.dueDate || '');
      setEstimatedMinutes(editingTask.estimatedMinutes ? String(editingTask.estimatedMinutes) : '');
    } else {
      // New task default values
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Work');
      setIsCustomCategory(false);
      setCustomCategory('');
      setDueDate(formDefaultDate || '');
      setEstimatedMinutes('30');
    }
    setErrors({});
  }, [editingTask, formDefaultDate, isTaskFormOpen, categories]);

  if (!isTaskFormOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateTaskInput({
      title,
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const finalCategory = isCustomCategory
      ? (customCategory.trim() || 'General')
      : category;

    const taskPayload = {
      title,
      description,
      priority,
      category: finalCategory,
      dueDate,
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
    };

    if (editingTask) {
      updateTask(editingTask.id, taskPayload);
    } else {
      addTask(taskPayload);
    }

    closeTaskModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="w-full max-w-lg my-8 rounded-2xl bg-[#1B1E21] border border-[#303438] p-6 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#303438]">
          <h2 id="task-form-title" className="text-lg font-bold text-[#F7F7F5]">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={closeTaskModal}
            className="text-[#A3A8AE] hover:text-[#F7F7F5] transition-colors p-1 rounded-lg"
            aria-label="Close task form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Task Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-[#A3A8AE] uppercase tracking-wider mb-1.5">
              Task Title <span className="text-[#FF7373]">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              required
              placeholder="e.g., Finalize project architecture proposal"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#151719] border border-[#303438] text-[#F7F7F5] placeholder-[#A3A8AE]/50 text-sm focus:outline-none focus:border-[#FFD166] transition-colors"
              autoFocus
            />
            {errors.title && (
              <p className="mt-1 text-xs text-[#FF7373]">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" className="block text-xs font-semibold text-[#A3A8AE] uppercase tracking-wider mb-1.5">
              Description <span className="text-xs text-[#A3A8AE]/60 normal-case">(optional)</span>
            </label>
            <textarea
              id="task-desc"
              rows={3}
              placeholder="Add key milestones, links, or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#151719] border border-[#303438] text-[#F7F7F5] placeholder-[#A3A8AE]/50 text-sm focus:outline-none focus:border-[#FFD166] transition-colors resize-none"
            />
          </div>

          {/* Priority & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-[#A3A8AE] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-[#FFD166]" />
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#151719] border border-[#303438]">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                        isSelected
                          ? p === 'high'
                            ? 'bg-[#FF7373]/20 text-[#FF7373] border border-[#FF7373]/30 font-semibold'
                            : p === 'medium'
                            ? 'bg-[#FFD166]/20 text-[#FFD166] border border-[#FFD166]/30 font-semibold'
                            : 'bg-[#A3A8AE]/20 text-[#F7F7F5] border border-[#A3A8AE]/30 font-semibold'
                          : 'text-[#A3A8AE] hover:text-[#F7F7F5]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="task-category" className="block text-xs font-semibold text-[#A3A8AE] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#FFD166]" />
                Category
              </label>
              {!isCustomCategory ? (
                <div className="flex gap-1.5">
                  <select
                    id="task-category"
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomCategory(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#151719] border border-[#303438] text-[#F7F7F5] text-sm focus:outline-none focus:border-[#FFD166] transition-colors"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="custom">+ New Category...</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#151719] border border-[#303438] text-[#F7F7F5] text-sm focus:outline-none focus:border-[#FFD166]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(false);
                      setCategory('Work');
                    }}
                    className="px-2.5 py-1 text-xs text-[#A3A8AE] hover:text-[#F7F7F5] border border-[#303438] rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Due Date & Estimated Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-due-date" className="block text-xs font-semibold text-[#A3A8AE] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FFD166]" />
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#151719] border border-[#303438] text-[#F7F7F5] text-sm focus:outline-none focus:border-[#FFD166] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="task-est-minutes" className="block text-xs font-semibold text-[#A3A8AE] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FFD166]" />
                Est. Duration (minutes)
              </label>
              <input
                id="task-est-minutes"
                type="number"
                min="1"
                max="1440"
                placeholder="e.g., 25"
                value={estimatedMinutes}
                onChange={(e) => {
                  setEstimatedMinutes(e.target.value);
                  if (errors.estimatedMinutes) setErrors((prev) => ({ ...prev, estimatedMinutes: undefined }));
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#151719] border border-[#303438] text-[#F7F7F5] text-sm focus:outline-none focus:border-[#FFD166] transition-colors"
              />
              {errors.estimatedMinutes && (
                <p className="mt-1 text-xs text-[#FF7373]">{errors.estimatedMinutes}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 mt-6 border-t border-[#303438] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2 text-sm font-medium text-[#A3A8AE] hover:text-[#F7F7F5] bg-[#151719] hover:bg-[#22262A] border border-[#303438] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-black bg-gradient-to-r from-[#FFD166] to-[#FF8A00] hover:brightness-110 rounded-xl transition-all shadow-md shadow-[#FF8A00]/25"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
