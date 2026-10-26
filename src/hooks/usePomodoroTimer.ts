import { useState, useEffect, useRef, useCallback } from 'react';
import { SessionType, TimerStatus, TimerSettings, FocusSession } from '../types';
import { playTimerCompletionSound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface PersistedTimerState {
  status: TimerStatus;
  sessionType: SessionType;
  remainingSeconds: number;
  totalDurationSeconds: number;
  targetEndTime: number | null;
  startedAt: number | null;
  activeTaskId: string | null;
  activeTaskTitle: string | null;
}

const TIMER_STORAGE_KEY = 'focusflow_timer_state_v1';
const SETTINGS_STORAGE_KEY = 'focusflow_timer_settings_v1';

const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  soundEnabled: true,
  autoStartBreaks: false,
};

export function usePomodoroTimer(
  onSessionCompleted?: (session: FocusSession) => void
) {
  // Timer settings
  const [settings, setSettings] = useState<TimerSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Save settings on change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save timer settings to localStorage', e);
    }
  }, [settings]);

  // Initial calculation of session duration in seconds
  const getDurationForType = useCallback(
    (type: SessionType): number => {
      switch (type) {
        case 'focus':
          return Math.max(1, settings.focusDuration) * 60;
        case 'shortBreak':
          return Math.max(1, settings.shortBreakDuration) * 60;
        case 'longBreak':
          return Math.max(1, settings.longBreakDuration) * 60;
      }
    },
    [settings]
  );

  // Initialize state with restore logic
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => getDurationForType('focus'));
  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(() => getDurationForType('focus'));
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTaskTitle, setActiveTaskTitle] = useState<string | null>(null);

  const targetEndTimeRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Helper to persist timer state
  const persistState = useCallback(
    (customState?: Partial<PersistedTimerState>) => {
      try {
        const stateToSave: PersistedTimerState = {
          status,
          sessionType,
          remainingSeconds,
          totalDurationSeconds,
          targetEndTime: targetEndTimeRef.current,
          startedAt: startedAtRef.current,
          activeTaskId,
          activeTaskTitle,
          ...customState,
        };
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (e) {
        console.warn('Could not persist timer state', e);
      }
    },
    [status, sessionType, remainingSeconds, totalDurationSeconds, activeTaskId, activeTaskTitle]
  );

  // Handle genuine session completion
  const handleSessionComplete = useCallback(
    (completedSessionType: SessionType, taskId: string | null, taskTitle: string | null, durationSecs: number, startedAtTime: number) => {
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      targetEndTimeRef.current = null;
      startedAtRef.current = null;

      setStatus('completed');
      setRemainingSeconds(0);

      // Play audio chime if enabled
      if (settings.soundEnabled) {
        playTimerCompletionSound();
      }

      // Confetti burst for focus session
      if (completedSessionType === 'focus') {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#FFD166', '#FF8A00', '#72D6A0'],
          });
        } catch {
          // Ignore confetti errors if blocked
        }
      }

      // Record completed session
      const completedSession: FocusSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        taskId: taskId || undefined,
        taskTitle: taskTitle || undefined,
        sessionType: completedSessionType,
        durationMinutes: Math.round(durationSecs / 60),
        startedAt: startedAtTime,
        completedAt: Date.now(),
        status: 'completed',
      };

      if (onSessionCompleted) {
        onSessionCompleted(completedSession);
      }

      persistState({
        status: 'completed',
        remainingSeconds: 0,
        targetEndTime: null,
        startedAt: null,
      });
    },
    [settings.soundEnabled, onSessionCompleted, persistState]
  );

  // Restore state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (!saved) return;
      const parsed: PersistedTimerState = JSON.parse(saved);

      if (parsed.status === 'running' && parsed.targetEndTime) {
        const now = Date.now();
        const diff = Math.ceil((parsed.targetEndTime - now) / 1000);

        if (diff <= 0) {
          // Session finished while user was away
          setSessionType(parsed.sessionType);
          setTotalDurationSeconds(parsed.totalDurationSeconds);
          setActiveTaskId(parsed.activeTaskId);
          setActiveTaskTitle(parsed.activeTaskTitle);
          handleSessionComplete(
            parsed.sessionType,
            parsed.activeTaskId,
            parsed.activeTaskTitle,
            parsed.totalDurationSeconds,
            parsed.startedAt || now - parsed.totalDurationSeconds * 1000
          );
        } else {
          // Resume running timer seamlessly
          setSessionType(parsed.sessionType);
          setTotalDurationSeconds(parsed.totalDurationSeconds);
          setActiveTaskId(parsed.activeTaskId);
          setActiveTaskTitle(parsed.activeTaskTitle);
          setRemainingSeconds(diff);
          setStatus('running');
          targetEndTimeRef.current = parsed.targetEndTime;
          startedAtRef.current = parsed.startedAt || now;
        }
      } else if (parsed.status === 'paused') {
        setSessionType(parsed.sessionType);
        setTotalDurationSeconds(parsed.totalDurationSeconds);
        setActiveTaskId(parsed.activeTaskId);
        setActiveTaskTitle(parsed.activeTaskTitle);
        setRemainingSeconds(parsed.remainingSeconds);
        setStatus('paused');
      }
    } catch (e) {
      console.warn('Could not restore timer state', e);
    }
  }, [handleSessionComplete]);

  // Main countdown loop when running
  useEffect(() => {
    if (status !== 'running') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const checkTime = () => {
      if (!targetEndTimeRef.current) return;
      const now = Date.now();
      const diff = Math.ceil((targetEndTimeRef.current - now) / 1000);

      if (diff <= 0) {
        const completedType = sessionType;
        const currentTaskId = activeTaskId;
        const currentTaskTitle = activeTaskTitle;
        const duration = totalDurationSeconds;
        const started = startedAtRef.current || now - duration * 1000;

        handleSessionComplete(completedType, currentTaskId, currentTaskTitle, duration, started);
      } else {
        setRemainingSeconds(diff);
      }
    };

    // Run tick every 500ms for responsiveness without high CPU usage
    intervalRef.current = window.setInterval(checkTime, 500);

    // Visibility change handler to immediately catch up after tab throttling
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'running') {
        checkTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status, sessionType, activeTaskId, activeTaskTitle, totalDurationSeconds, handleSessionComplete]);

  // Controls: Start or Resume
  const startTimer = useCallback(() => {
    const now = Date.now();
    const duration = remainingSeconds;
    const targetEnd = now + duration * 1000;

    targetEndTimeRef.current = targetEnd;
    if (!startedAtRef.current) {
      startedAtRef.current = now;
    }

    setStatus('running');
    persistState({
      status: 'running',
      targetEndTime: targetEnd,
      startedAt: startedAtRef.current,
      remainingSeconds: duration,
    });
  }, [remainingSeconds, persistState]);

  // Controls: Pause
  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (targetEndTimeRef.current) {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / 1000));
      setRemainingSeconds(remaining);
      targetEndTimeRef.current = null;

      setStatus('paused');
      persistState({
        status: 'paused',
        remainingSeconds: remaining,
        targetEndTime: null,
      });
    } else {
      setStatus('paused');
      persistState({ status: 'paused' });
    }
  }, [persistState]);

  // Controls: Reset
  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    targetEndTimeRef.current = null;
    startedAtRef.current = null;

    const baseDuration = getDurationForType(sessionType);
    setRemainingSeconds(baseDuration);
    setTotalDurationSeconds(baseDuration);
    setStatus('idle');

    persistState({
      status: 'idle',
      remainingSeconds: baseDuration,
      totalDurationSeconds: baseDuration,
      targetEndTime: null,
      startedAt: null,
    });
  }, [sessionType, getDurationForType, persistState]);

  // Controls: Switch session type
  const switchSessionType = useCallback(
    (newType: SessionType) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      targetEndTimeRef.current = null;
      startedAtRef.current = null;

      const duration = getDurationForType(newType);
      setSessionType(newType);
      setRemainingSeconds(duration);
      setTotalDurationSeconds(duration);
      setStatus('idle');

      persistState({
        sessionType: newType,
        status: 'idle',
        remainingSeconds: duration,
        totalDurationSeconds: duration,
        targetEndTime: null,
        startedAt: null,
      });
    },
    [getDurationForType, persistState]
  );

  // Controls: Select associated task
  const selectTask = useCallback(
    (task: { id: string; title: string } | null) => {
      setActiveTaskId(task ? task.id : null);
      setActiveTaskTitle(task ? task.title : null);

      persistState({
        activeTaskId: task ? task.id : null,
        activeTaskTitle: task ? task.title : null,
      });
    },
    [persistState]
  );

  // Update durations when settings change (if currently idle)
  const updateSettings = useCallback(
    (newSettings: Partial<TimerSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...newSettings };
        return next;
      });

      if (status === 'idle') {
        const duration = (newSettings.focusDuration || settings.focusDuration) * 60;
        if (sessionType === 'focus') {
          setRemainingSeconds(duration);
          setTotalDurationSeconds(duration);
        }
      }
    },
    [status, sessionType, settings.focusDuration]
  );

  // Progress percentage (0 to 1)
  const progress = totalDurationSeconds > 0 
    ? Math.max(0, Math.min(1, (totalDurationSeconds - remainingSeconds) / totalDurationSeconds))
    : 0;

  // Format MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return {
    sessionType,
    status,
    remainingSeconds,
    totalDurationSeconds,
    formattedTime: formatTime(remainingSeconds),
    progress,
    activeTaskId,
    activeTaskTitle,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    switchSessionType,
    selectTask,
    updateSettings,
  };
}
