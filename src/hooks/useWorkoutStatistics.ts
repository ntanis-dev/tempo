import { useCallback, useRef, useEffect } from 'react';
import { WorkoutState } from '../types';

export const useWorkoutStatistics = (
  workout: WorkoutState,
  updateWorkout: (updater: (prev: WorkoutState) => WorkoutState) => void
) => {
  const pauseStartTimeRef = useRef<number | null>(null);
  const lastPhaseChangeRef = useRef<number>(Date.now());

  // Update statistics based on phase
  const updateStatistics = useCallback((phase: string, timeElapsed: number) => {
    updateWorkout(prev => {
      const stats = { ...prev.statistics };

      switch (phase) {
        case 'work':
          stats.totalTimeExercised += timeElapsed;
          break;
        case 'rest':
          stats.totalTimeRested += timeElapsed;
          break;
        case 'prepare':
          stats.totalTimeStretched += timeElapsed;
          break;
      }

      stats.lastActiveTime = Date.now();
      return { ...prev, statistics: stats };
    });
  }, [updateWorkout]);

  // Track pause time
  useEffect(() => {
    if (workout.isPaused && !pauseStartTimeRef.current) {
      pauseStartTimeRef.current = Date.now();
    } else if (!workout.isPaused && pauseStartTimeRef.current) {
      const pauseDuration = Date.now() - pauseStartTimeRef.current;
      updateWorkout(prev => ({
        ...prev,
        statistics: {
          ...prev.statistics,
          totalTimePaused: prev.statistics.totalTimePaused + pauseDuration / 1000,
          lastActiveTime: Date.now()
        }
      }));
      pauseStartTimeRef.current = null;
    }
  }, [workout.isPaused, updateWorkout]);

  // Track phase changes for statistics
  useEffect(() => {
    const now = Date.now();
    const timeInLastPhase = (now - lastPhaseChangeRef.current) / 1000;

    if (timeInLastPhase > 0.5) { // Only count if phase lasted more than 0.5 seconds
      const previousPhase = getPreviousPhase(workout.phase);
      if (previousPhase) {
        updateStatistics(previousPhase, timeInLastPhase);
      }
    }

    lastPhaseChangeRef.current = now;
  }, [workout.phase, updateStatistics]);

  const startWorkoutTracking = useCallback(() => {
    updateWorkout(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        workoutStartTime: Date.now(),
        lastActiveTime: Date.now()
      }
    }));
  }, [updateWorkout]);

  return {
    startWorkoutTracking,
    updateStatistics
  };
};

// Helper function to determine previous phase
function getPreviousPhase(currentPhase: string): string | null {
  const phaseTransitions: Record<string, string> = {
    'countdown': 'prepare',
    'work': 'countdown',
    'rest': 'work',
    'complete': 'work'
  };
  return phaseTransitions[currentPhase] || null;
}