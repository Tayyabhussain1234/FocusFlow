import React from 'react';
import { useApp, AppPage } from '../context/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  Calendar,
  BarChart3,
  Zap,
  X,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentPage, setCurrentPage, timer, tasks, sessions } = useApp();

  const navItems: { id: AppPage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
    { id: 'focus', label: 'Focus Timer', icon: Timer },
    { id: 'planner', label: 'Weekly Planner', icon: Calendar },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
  ];

  const handleNavigate = (page: AppPage) => {
    setCurrentPage(page);
    onClose();
  };

  const activeTasksCount = tasks.filter((t) => !t.completed).length;
  const isTimerActive = timer.status === 'running' || timer.status === 'paused';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-[#151719] border-r border-[#303438] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-[#303438]">
            <div
              onClick={() => handleNavigate('overview')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF8A00] to-[#FFD166] flex items-center justify-center shadow-md shadow-[#FF8A00]/20 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 text-black fill-current stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#F7F7F5] group-hover:text-[#FFD166] transition-colors">
                FocusFlow
              </span>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1 text-[#A3A8AE] hover:text-[#F7F7F5] md:hidden rounded-lg hover:bg-[#22262A]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#22262A] text-[#FFD166] border border-[#303438] font-semibold shadow-sm'
                      : 'text-[#A3A8AE] hover:text-[#F7F7F5] hover:bg-[#1B1E21]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFD166]' : 'text-[#A3A8AE]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {/* Badges / Status */}
                  {item.id === 'tasks' && activeTasksCount > 0 && (
                    <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-md bg-[#22262A] text-[#A3A8AE]">
                      {activeTasksCount}
                    </span>
                  )}
                  {item.id === 'focus' && isTimerActive && (
                    <span className="flex items-center gap-1.5 text-xs font-mono tabular-nums text-[#FFD166]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFD166] animate-pulse" />
                      {timer.formattedTime}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile / Workspace Footer */}
        <div className="p-4 border-t border-[#303438]">
          <div className="p-3 rounded-xl bg-[#1B1E21] border border-[#303438] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#22262A] border border-[#303438] flex items-center justify-center text-[#FFD166] shrink-0 font-bold text-xs">
              FF
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#F7F7F5] truncate">
                My Workspace
              </div>
              <div className="text-[11px] text-[#A3A8AE] truncate flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-[#72D6A0]" />
                Local Session Active
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
