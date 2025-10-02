import React from 'react';
import { formatTime } from '../../utils/formatters';

interface WorkoutTimerProps {
  timeRemaining: number;
  phase: string;
}

export const WorkoutTimer: React.FC<WorkoutTimerProps> = React.memo(({ timeRemaining }) => {
  return (
    <div className="text-8xl font-bold mb-10 tabular-nums font-mono">
      {formatTime(timeRemaining)}
    </div>
  );
});