import React from 'react';
import { useApp } from '../context/AppContext';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { formatDisplayDate } from '../utils/dateUtils';
import { Timer, CheckCircle2, History, Coffee, Flame } from 'lucide-react';

export const FocusPage: React.FC = () => {
  const { sessions } = useApp();

  const completedFocusSessions = sessions.filter(
    (s) => s.status === 'completed' && s.sessionType === 'focus'
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Timer Section */}
      <PomodoroTimer />

      {/* Focus Protocol Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#1B1E21] border border-[#303438] flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#22262A] flex items-center justify-center text-[#FFD166] shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#F7F7F5]">Single-Task Rule</h4>
            <p className="mt-1 text-xs text-[#A3A8AE] leading-relaxed">
              Link one task per focus block. Silence interruptions until the chime rings.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1B1E21] border border-[#303438] flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#22262A] flex items-center justify-center text-[#72D6A0] shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#F7F7F5]">Rest Discipline</h4>
            <p className="mt-1 text-xs text-[#A3A8AE] leading-relaxed">
              Step away from screens during short breaks to replenish cognitive stamina.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1B1E21] border border-[#303438] flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#22262A] flex items-center justify-center text-[#FF8A00] shrink-0">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#F7F7F5]">State Resiliency</h4>
            <p className="mt-1 text-xs text-[#A3A8AE] leading-relaxed">
              Timer timestamps persist in background and survive browser tab reloads.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Completed Sessions Log */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#1B1E21] border border-[#303438] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#303438]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#FFD166]" />
            <h3 className="text-base font-bold text-[#F7F7F5]">
              Session Completion Log
            </h3>
          </div>
          <span className="text-xs text-[#A3A8AE] font-mono tabular-nums">
            {completedFocusSessions.length} total sessions
          </span>
        </div>

        {completedFocusSessions.length > 0 ? (
          <div className="divide-y divide-[#303438]/50">
            {completedFocusSessions.slice(0, 8).map((session) => {
              const sessionDate = new Date(session.completedAt);
              const timeStr = sessionDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const dateStr = sessionDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={session.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-[#72D6A0]" />
                    <div className="truncate">
                      <div className="font-medium text-[#F7F7F5] truncate">
                        {session.taskTitle || 'Freestyle Focus Session'}
                      </div>
                      <div className="text-[#A3A8AE] text-[11px]">
                        {dateStr} at {timeStr}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <span className="font-mono tabular-nums text-[#FFD166] font-semibold">
                      +{session.durationMinutes}m
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#22262A] text-[#72D6A0] text-[11px] font-medium border border-[#72D6A0]/20">
                      Completed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#A3A8AE]">
            No completed focus sessions recorded yet. Start your first session above!
          </div>
        )}
      </div>
    </div>
  );
};
