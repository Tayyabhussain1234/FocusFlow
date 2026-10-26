import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SessionType } from '../types';
import { Play, Pause, RotateCcw, Settings2, Volume2, VolumeX, Maximize2, Minimize2, CheckCircle2, Sparkles, Target } from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const { timer, tasks, sessions } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Settings local state
  const [tempFocus, setTempFocus] = useState(timer.settings.focusDuration);
  const [tempShort, setTempShort] = useState(timer.settings.shortBreakDuration);
  const [tempLong, setTempLong] = useState(timer.settings.longBreakDuration);

  // Focus sessions count today
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todaySessionsCount = sessions.filter(
    (s) => s.status === 'completed' && s.sessionType === 'focus' && s.completedAt >= todayStart
  ).length;

  const totalSessionsCount = sessions.filter(
    (s) => s.status === 'completed' && s.sessionType === 'focus'
  ).length;

  // Uncompleted tasks for dropdown selection
  const activeTasks = tasks.filter((t) => !t.completed);

  // Circular progress calculations
  const radius = 135;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // timer.progress is 0 to 1
  const strokeDashoffset = circumference * (1 - timer.progress);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    timer.updateSettings({
      focusDuration: Math.max(1, Math.min(120, Number(tempFocus) || 25)),
      shortBreakDuration: Math.max(1, Math.min(60, Number(tempShort) || 5)),
      longBreakDuration: Math.max(1, Math.min(60, Number(tempLong) || 15)),
    });
    setShowSettings(false);
  };

  const sessionTypes: { id: SessionType; label: string; defaultMins: number }[] = [
    { id: 'focus', label: 'Focus', defaultMins: timer.settings.focusDuration },
    { id: 'shortBreak', label: 'Short Break', defaultMins: timer.settings.shortBreakDuration },
    { id: 'longBreak', label: 'Long Break', defaultMins: timer.settings.longBreakDuration },
  ];

  return (
    <div
      className={`relative rounded-3xl transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#101112] flex flex-col items-center justify-center p-6'
          : 'bg-[#1B1E21] border border-[#303438] p-6 sm:p-8'
      }`}
    >
      {/* Header bar within timer card: Top tools (Sound, Settings, Fullscreen) */}
      <div className="w-full flex items-center justify-between gap-3 mb-6">
        {/* Session Type Segmented Selector */}
        <div className="flex items-center p-1 rounded-xl bg-[#151719] border border-[#303438]">
          {sessionTypes.map((st) => {
            const isActive = timer.sessionType === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => timer.switchSessionType(st.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#22262A] text-[#FFD166] shadow-sm'
                    : 'text-[#A3A8AE] hover:text-[#F7F7F5]'
                }`}
              >
                {st.label} ({st.defaultMins}m)
              </button>
            );
          })}
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => timer.updateSettings({ soundEnabled: !timer.settings.soundEnabled })}
            className={`p-2 rounded-xl border transition-colors ${
              timer.settings.soundEnabled
                ? 'bg-[#151719] border-[#303438] text-[#FFD166]'
                : 'bg-[#151719] border-[#303438] text-[#A3A8AE] hover:text-[#F7F7F5]'
            }`}
            title={timer.settings.soundEnabled ? 'Mute chime' : 'Enable audio chime'}
            aria-label={timer.settings.soundEnabled ? 'Mute audio chime' : 'Enable audio chime'}
          >
            {timer.settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-[#151719] border border-[#303438] text-[#A3A8AE] hover:text-[#F7F7F5] transition-colors"
            title="Configure durations"
            aria-label="Configure durations"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-[#151719] border border-[#303438] text-[#A3A8AE] hover:text-[#F7F7F5] transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Distraction-free fullscreen'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Distraction-free fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Associated Task Selector */}
      <div className="w-full max-w-md mx-auto mb-6">
        <label htmlFor="timer-task-select" className="sr-only">
          Link Task to Session
        </label>
        <div className="relative flex items-center">
          <Target className="absolute left-3 w-4 h-4 text-[#FFD166]" />
          <select
            id="timer-task-select"
            value={timer.activeTaskId || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                timer.selectTask(null);
              } else {
                const found = tasks.find((t) => t.id === val);
                if (found) {
                  timer.selectTask({ id: found.id, title: found.title });
                }
              }
            }}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[#151719] border border-[#303438] text-[#F7F7F5] focus:outline-none focus:border-[#FFD166] transition-colors truncate"
          >
            <option value="">No task linked (Freestyle focus)</option>
            {activeTasks.map((t) => (
              <option key={t.id} value={t.id}>
                Focus on: {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Circular Progress Ring */}
      <div className="relative flex items-center justify-center my-4 sm:my-8">
        <svg
          className="w-64 h-64 sm:w-80 sm:h-80 -rotate-90 transform"
          viewBox="0 0 320 320"
        >
          <defs>
            <linearGradient id="focusFlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD166" />
              <stop offset="100%" stopColor="#FF8A00" />
            </linearGradient>
            <filter id="timerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="#22262A"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Active Animated Progress Arc */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="url(#focusFlowGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500 ease-linear"
            filter={timer.status === 'running' ? 'url(#timerGlow)' : undefined}
          />
        </svg>

        {/* Center Timer Display & Status */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#FFD166] mb-1">
            {timer.sessionType === 'focus'
              ? 'Focus Session'
              : timer.sessionType === 'shortBreak'
              ? 'Short Rest'
              : 'Long Rest'}
          </span>

          <div className="text-5xl sm:text-6xl font-extrabold text-[#F7F7F5] tabular-nums font-mono tracking-tight drop-shadow-md">
            {timer.formattedTime}
          </div>

          <div className="mt-2 text-xs font-medium text-[#A3A8AE] max-w-[200px] truncate">
            {timer.activeTaskTitle ? (
              <span className="text-[#F7F7F5]">{timer.activeTaskTitle}</span>
            ) : (
              <span>Deep Work Block</span>
            )}
          </div>

          <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#A3A8AE]/80">
            {timer.status === 'running' ? (
              <span className="text-[#72D6A0]">Session In Progress</span>
            ) : timer.status === 'paused' ? (
              <span className="text-[#FFD166]">Session Paused</span>
            ) : timer.status === 'completed' ? (
              <span className="text-[#72D6A0]">Session Finished</span>
            ) : (
              <span>Ready</span>
            )}
          </div>
        </div>
      </div>

      {/* Timer Action Buttons */}
      <div className="w-full max-w-sm mx-auto flex items-center justify-center gap-4 mt-2">
        {timer.status !== 'running' ? (
          <button
            type="button"
            onClick={timer.startTimer}
            className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-[#FFD166] to-[#FF8A00] text-black font-bold text-sm sm:text-base hover:brightness-110 shadow-lg shadow-[#FF8A00]/25 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            {timer.status === 'paused' ? 'Resume' : 'Start Focus'}
          </button>
        ) : (
          <button
            type="button"
            onClick={timer.pauseTimer}
            className="flex-1 py-3 px-6 rounded-2xl bg-[#22262A] hover:bg-[#303438] text-[#F7F7F5] border border-[#303438] font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
          >
            <Pause className="w-4 h-4 fill-current text-[#FFD166]" />
            Pause
          </button>
        )}

        <button
          type="button"
          onClick={timer.resetTimer}
          className="p-3.5 rounded-2xl bg-[#151719] hover:bg-[#22262A] text-[#A3A8AE] hover:text-[#F7F7F5] border border-[#303438] transition-colors"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Session Completion Banner when completed */}
      {timer.status === 'completed' && (
        <div className="w-full max-w-md mx-auto mt-6 p-4 rounded-2xl bg-[#72D6A0]/10 border border-[#72D6A0]/30 text-center animate-in fade-in duration-200">
          <div className="flex items-center justify-center gap-2 text-[#72D6A0] font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Session Complete!
          </div>
          <p className="mt-1 text-xs text-[#A3A8AE]">
            {timer.sessionType === 'focus'
              ? 'Great work! Take a well-deserved break to refresh your mind.'
              : 'Break completed. Ready to start your next focus session?'}
          </p>
          <div className="mt-3 flex justify-center gap-2">
            {timer.sessionType === 'focus' ? (
              <button
                onClick={() => timer.switchSessionType('shortBreak')}
                className="px-4 py-1.5 rounded-xl bg-[#22262A] text-xs font-semibold text-[#FFD166] hover:bg-[#303438] border border-[#303438]"
              >
                Start Short Break
              </button>
            ) : (
              <button
                onClick={() => timer.switchSessionType('focus')}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FFD166] to-[#FF8A00] text-xs font-semibold text-black"
              >
                Start Next Focus
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completed Sessions Counter strip */}
      <div className="mt-8 pt-6 border-t border-[#303438] flex flex-wrap items-center justify-around gap-4 text-center">
        <div>
          <div className="text-xl sm:text-2xl font-bold text-[#F7F7F5] tabular-nums font-mono">
            {todaySessionsCount}
          </div>
          <div className="text-xs text-[#A3A8AE] flex items-center justify-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3 text-[#FFD166]" />
            Completed Today
          </div>
        </div>

        <div className="h-8 w-px bg-[#303438] hidden sm:block" />

        <div>
          <div className="text-xl sm:text-2xl font-bold text-[#F7F7F5] tabular-nums font-mono">
            {todaySessionsCount * timer.settings.focusDuration}m
          </div>
          <div className="text-xs text-[#A3A8AE] mt-0.5">
            Total Today Focus
          </div>
        </div>

        <div className="h-8 w-px bg-[#303438] hidden sm:block" />

        <div>
          <div className="text-xl sm:text-2xl font-bold text-[#F7F7F5] tabular-nums font-mono">
            {totalSessionsCount}
          </div>
          <div className="text-xs text-[#A3A8AE] mt-0.5">
            All-Time Sessions
          </div>
        </div>
      </div>

      {/* Duration Customization Modal / Popover */}
      {showSettings && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="timer-settings-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[#1B1E21] border border-[#303438] p-6 shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between pb-3 border-b border-[#303438]">
              <h3 id="timer-settings-title" className="text-sm font-bold text-[#F7F7F5]">
                Configure Durations
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[#A3A8AE] hover:text-[#F7F7F5] text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="mt-4 space-y-3.5">
              <div>
                <label htmlFor="settings-focus-dur" className="block text-xs font-semibold text-[#A3A8AE] mb-1">
                  Focus Duration (minutes)
                </label>
                <input
                  id="settings-focus-dur"
                  type="number"
                  min="1"
                  max="120"
                  value={tempFocus}
                  onChange={(e) => setTempFocus(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#151719] border border-[#303438] text-[#F7F7F5] text-sm focus:outline-none focus:border-[#FFD166]"
                />
              </div>

              <div>
                <label htmlFor="settings-short-dur" className="block text-xs font-semibold text-[#A3A8AE] mb-1">
                  Short Break (minutes)
                </label>
                <input
                  id="settings-short-dur"
                  type="number"
                  min="1"
                  max="60"
                  value={tempShort}
                  onChange={(e) => setTempShort(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#151719] border border-[#303438] text-[#F7F7F5] text-sm focus:outline-none focus:border-[#FFD166]"
                />
              </div>

              <div>
                <label htmlFor="settings-long-dur" className="block text-xs font-semibold text-[#A3A8AE] mb-1">
                  Long Break (minutes)
                </label>
                <input
                  id="settings-long-dur"
                  type="number"
                  min="1"
                  max="60"
                  value={tempLong}
                  onChange={(e) => setTempLong(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#151719] border border-[#303438] text-[#F7F7F5] text-sm focus:outline-none focus:border-[#FFD166]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3.5 py-1.5 text-xs text-[#A3A8AE] hover:text-[#F7F7F5] border border-[#303438] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-black bg-gradient-to-r from-[#FFD166] to-[#FF8A00] rounded-xl shadow-md"
                >
                  Apply Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
