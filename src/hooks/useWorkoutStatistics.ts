import React from 'react';
import { WorkoutState } from '../types';

export const useWorkoutStatistics = (
  workout: WorkoutState,
  updateWorkout: (updater: (prev: WorkoutState) => WorkoutState) => void
) => {
  const pauseStartTimeRef = React.useRef<number | null>(null);
  const lastPhaseChangeRef = React.useRef<number>(Date.now());

  // Initialize pause tracking from persisted state
  React.useEffect(() => {
    if (workout.isPaused && workout.statistics.pauseStartTime && !pauseStartTimeRef.current) {
      pauseStartTimeRef.current = workout.statistics.pauseStartTime;
    }
  }, [workout.isPaused, workout.statistics.pauseStartTime]);

  // Update statistics based on phase
  const updateStatistics = React.useCallback((phase: string, timeElapsed: number) => {
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

  // Track pause time with persistence
  React.useEffect(() => {
    if (workout.isPaused && !pauseStartTimeRef.current) {
      const pauseStartTime = Date.now();
      pauseStartTimeRef.current = pauseStartTime;

      // Persist pause start time
      updateWorkout(prev => ({
        ...prev,
        statistics: {
          ...prev.statistics,
          pauseStartTime,
          lastActiveTime: Date.now()
        }
      }));
    } else if (!workout.isPaused && pauseStartTimeRef.current) {
      const pauseDuration = Date.now() - pauseStartTimeRef.current;
      updateWorkout(prev => ({
        ...prev,
        statistics: {
          ...prev.statistics,
          // Round to avoid floating point accumulation
          totalTimePaused: Math.round(prev.statistics.totalTimePaused + pauseDuration / 1000),
          pauseStartTime: null, // Clear pause start time
          lastActiveTime: Date.now()
        }
      }));
      pauseStartTimeRef.current = null;
    }
  }, [workout.isPaused, updateWorkout]);

  // Track phase changes - removed statistics update since timer handles it now
  React.useEffect(() => {
    lastPhaseChangeRef.current = Date.now();
  }, [workout.phase]);

  const startWorkoutTracking = React.useCallback(() => {
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