import { useState, useEffect, useRef } from 'react';
import { PomodoroPhase } from '@/types/types';

export const usePomodoro = () => {
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [timeLeft, setTimeLeft] = useState(Number(localStorage.getItem('work')) || 25 * 60);
  const [isPausedByPomodoro, setIsPausedByPomodoro] = useState(false);
  const [showBreakMessage, setShowBreakMessage] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = setInterval(() => {
      if (phase === 'work' && !isPausedByPomodoro) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setPhase('break');
            setTimeLeft(5 * 60);
            setIsPausedByPomodoro(true);
            setShowBreakMessage(true);
            return 0;
          }
          return prev - 1;
        });
      } else if (phase === 'break') {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setPhase('work');
            setTimeLeft(25 * 60);
            setIsPausedByPomodoro(false);
            setShowBreakMessage(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, isPausedByPomodoro]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    phase,
    timeLeft,
    isPausedByPomodoro,
    showBreakMessage,
    setIsPausedByPomodoro,
    setShowBreakMessage,
    formatTime,
  };
};
