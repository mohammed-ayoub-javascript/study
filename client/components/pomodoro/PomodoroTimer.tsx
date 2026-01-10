import React from 'react';
import { PomodoroPhase } from '@/types/types';

interface PomodoroTimerProps {
  phase: PomodoroPhase;
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  phase,
  timeLeft,
  formatTime,
}) => {
  return (
    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm p-3 rounded-xl border border-white/20 shadow-lg z-30">
      <div className="flex flex-col items-center">
        <div
          className={`text-lg font-bold ${phase === 'work' ? 'text-green-400' : 'text-yellow-400'}`}
        >
          {phase === 'work' ? 'عمل' : 'راحة'}
        </div>
        <div className="text-2xl font-mono font-bold text-white">
          {formatTime(timeLeft)}
        </div>
        
      </div>
    </div>
  );
};