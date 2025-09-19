import { useEffect, useRef } from 'react';
import { WorkoutState, Phase } from '../types';
import { audioManager } from '../utils/audio';
import { saveWorkoutToHistory } from '../utils/storage';
import { TIME } from '../constants';

/**
 * Optimized timer logic hook that handles workout countdown and phase transitions
 */
export const useTimerLogic = (
  workout: WorkoutState,
  updateWorkout: (updater: (prev: WorkoutState) => WorkoutState) => void
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Main timer effect
  useEffect(() => {
    // Only run timer for active phases
    const isActivePhase = ['work', 'rest', 'countdown', 'prepare'].includes(workout.phase);

    if (!isActivePhase || workout.isPaused || workout.timeRemaining <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      updateWorkout(prev => handleTimerTick(prev));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [workout.phase, workout.isPaused, workout.timeRemaining, updateWorkout]);

  // Countdown audio effects - removed for stretch phase
  // The countdown phase is actually the stretch phase now, so no countdown sounds needed

  // Save to history on completion
  useEffect(() => {
    if (workout.phase === 'complete') {
      saveWorkoutToHistory(workout);
    }
  }, [workout.phase, workout]);
};

/**
 * Handle a single timer tick - extracted for clarity and testability
 */
function handleTimerTick(state: WorkoutState): WorkoutState {
  const now = Date.now();

  // Still counting down
  if (state.timeRemaining > 1) {
    return handleCountdown(state, now);
  }

  // Time's up - handle phase transition
  return handlePhaseTransition(state);
}

/**
 * Handle countdown logic for work and other phases
 */
function handleCountdown(state: WorkoutState, now: number): WorkoutState {
  let updatedStats = { ...state.statistics, lastActiveTime: now };

  // Update phase-specific statistics
  switch (state.phase) {
    case 'work':
      updatedStats.totalTimeExercised += 1;
      break;
    case 'rest':
      updatedStats.totalTimeRested += 1;
      break;
    case 'prepare':
      updatedStats.totalTimeStretched += 1;
      break;
    case 'countdown':
      updatedStats.totalTimeStretched += 1;
      break;
  }

  // Special handling for work phase reps
  if (state.phase === 'work') {
    const totalWorkTime = state.settings.timePerRep * state.settings.repsPerSet;
    const elapsedTime = totalWorkTime - state.timeRemaining + 1;
    const newRep = Math.floor(elapsedTime / state.settings.timePerRep) + 1;

    // Rep changed - play sound and update stats
    if (newRep !== state.currentRep && newRep <= state.settings.repsPerSet) {
      audioManager.playRepChange();
      return {
        ...state,
        currentRep: newRep,
        timeRemaining: state.timeRemaining - 1,
        statistics: {
          ...updatedStats,
          totalRepsCompleted: state.statistics.totalRepsCompleted + 1
        }
      };
    }
  }

  // Regular countdown
  return {
    ...state,
    timeRemaining: state.timeRemaining - 1,
    statistics: updatedStats
  };
}

/**
 * Handle transitions between workout phases
 */
function handlePhaseTransition(state: WorkoutState): WorkoutState {
  switch (state.phase) {
    case 'countdown':
      // Countdown → Work
      audioManager.playWorkStart();
      return {
        ...state,
        phase: 'work' as Phase,
        timeRemaining: state.settings.timePerRep * state.settings.repsPerSet,
        currentRep: 1
      };

    case 'work': {
      // Work → Rest or Complete
      const isLastSet = state.currentSet >= state.totalSets;

      if (isLastSet) {
        // Workout complete!
        audioManager.playWorkoutComplete();
        saveWorkoutToHistory(state);
        return {
          ...state,
          phase: 'complete' as Phase,
          timeRemaining: 0
        };
      } else {
        // Move to rest
        audioManager.playRestStart();
        return {
          ...state,
          phase: 'rest' as Phase,
          timeRemaining: state.settings.restTime,
          currentRep: 1,
          statistics: {
            ...state.statistics,
            setsCompleted: state.currentSet
          }
        };
      }
    }

    case 'rest':
      // Rest → Work (next set)
      audioManager.playWorkStart();
      return {
        ...state,
        phase: 'work' as Phase,
        currentSet: state.currentSet + 1,
        timeRemaining: state.settings.timePerRep * state.settings.repsPerSet,
        currentRep: 1
      };

    case 'prepare':
      // Prepare phase doesn't auto-transition - stays at 0 until user continues
      return {
        ...state,
        timeRemaining: 0
      };

    default:
      return state;
  }
}