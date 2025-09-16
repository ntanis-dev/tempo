import React from 'react';
import { ProgressBar } from '../ui/ProgressBar';
import { WorkoutState } from '../../types';
import { formatDuration } from '../../utils/formatters';
import { calculateRemainingTime, calculateWorkoutProgress } from '../../utils/workoutCalculations';

interface WorkoutProgressProps {
  workout: WorkoutState;
}

export const WorkoutProgress: React.FC<WorkoutProgressProps> = React.memo(({
  workout,
}) => {
  // Memoize expensive calculations
  const remainingTime = React.useMemo(() => calculateRemainingTime(workout), [workout]);

  // Calculate sets-based progress percentage
  const setsProgress = React.useMemo(() => calculateWorkoutProgress(workout), [workout]);

  // Memoize time-based percentage calculation
  const timePercentage = React.useMemo(() => {
    if (workout.phase === 'setup' || workout.phase === 'prepare') return 0;
    if (workout.phase === 'complete') return 100;

    // Total workout duration
    const totalTime = workout.settings.stretchTime +
      (workout.totalSets * workout.settings.timePerRep * workout.settings.repsPerSet) +
      ((workout.totalSets - 1) * workout.settings.restTime);

    const elapsedTime = totalTime - remainingTime;
    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  }, [workout, remainingTime]);

  return (
    <div className="mb-10 font-sans">
      <ProgressBar
        progress={setsProgress}
        label={`Set ${workout.currentSet} of ${workout.totalSets}`}
        labelClassName={workout.phase === 'countdown' ? 'opacity-0' : ''}
        showPercentage={false}
        customRightText={`${formatDuration(remainingTime)} • ${Math.round(timePercentage)}%`}
        height="lg"
      />
    </div>
  );
});