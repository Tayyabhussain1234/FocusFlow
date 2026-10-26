import React from 'react';
import { useApp } from '../context/AppContext';
import { formatFullDate } from '../utils/dateUtils';
import { Menu, Plus, Timer, Zap } from 'lucide-react';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const { currentPage, setCurrentPage, openNewTaskModal, timer } = useApp();

  const getPageInfo = () => {
    switch (currentPage) {
      case 'overview':
        return { title: 'Overview', subtitle: 'Plan Smarter. Focus Deeper. Achieve More.' };
      case 'tasks':
        return { title: 'Task Manager', subtitle: 'Organize priorities, deadlines, and deep work items.' };
      case 'focus':
        return { title: 'Pomodoro Focus Timer', subtitle: 'Distraction-free environment for intentional work.' };
      case 'planner':
        return { title: 'Weekly Planner', subtitle: 'Schedule, forecast, and distribute your cognitive load.' };
      case 'insights':
        return { title: 'Productivity Insights', subtitle: 'Actionable performance telemetry and velocity trends.' };
    }
  };

  const pageInfo = getPageInfo();
  const currentDate = formatFullDate();
  const isTimerActive = timer.status === 'running' || timer.status === 'paused';

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-[#303438] bg-[#101112]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Button & Breadcrumb Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-xl text-[#A3A8AE] hover:text-[#F7F7F5] hover:bg-[#1B1E21] md:hidden transition-colors"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-[#F7F7F5] leading-tight">
              {pageInfo.title}
            </h1>
          </div>
          <div className="hidden sm:block text-xs text-[#A3A8AE] truncate max-w-md">
            {currentDate}
          </div>
        </div>
      </div>

      {/* Right: Timer Quick Chip & Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Active Timer Chip (if running or paused outside the focus tab) */}
        {isTimerActive && currentPage !== 'focus' && (
          <button
            type="button"
            onClick={() => setCurrentPage('focus')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#22262A] hover:bg-[#303438] border border-[#FFD166]/30 text-xs text-[#FFD166] transition-colors"
            title="Focus session active — click to view timer"
          >
            <Timer className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-mono tabular-nums font-semibold">{timer.formattedTime}</span>
          </button>
        )}

        {/* Primary Action Button: Add Task */}
        <button
          type="button"
          onClick={() => openNewTaskModal()}
          className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-black bg-gradient-to-r from-[#FFD166] to-[#FF8A00] hover:brightness-110 rounded-xl transition-all shadow-md shadow-[#FF8A00]/25 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Task</span>
        </button>
      </div>
    </header>
  );
};
