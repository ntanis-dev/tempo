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
    // Only run timer for active phases (not prepare which is static)
    const isActivePhase = ['work', 'rest', 'countdown'].includes(workout.phase);

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

  // Still counting down (including the last second)
  if (state.timeRemaining >= 1) {
    const newState = handleCountdown(state, now);

    // If we just hit 0, transition to next phase
    if (newState.timeRemaining === 0) {
      return handlePhaseTransition(newState);
    }

    return newState;
  }

  // Already at 0, should not happen but handle gracefully
  return state;
}

/**
 * Handle countdown logic for work and other phases
 */
function handleCountdown(state: WorkoutState, now: number): WorkoutState {
  let updatedStats = { ...state.statistics, lastActiveTime: now };

  // Play countdown sound for last 5 seconds of stretch (countdown) and rest phases
  // When timeRemaining is 6, it becomes 5 after decrement (visual shows 5)
  // When timeRemaining is 2, it becomes 1 after decrement (visual shows 1)
  if ((state.phase === 'countdown' || state.phase === 'rest') &&
      state.timeRemaining <= TIME.PREPARE_THRESHOLD + 1 &&
      state.timeRemaining >= 2) {
    // Play final sound when visual will show 1 (timeRemaining is 2)
    if (state.timeRemaining === 2) {
      audioManager.playCountdownFinal();
    } else {
      audioManager.playCountdownTick();
    }
  }

  // Update phase-specific statistics
  switch (state.phase) {
    case 'work':
      updatedStats.totalTimeExercised += 1;
      break;
    case 'rest':
      updatedStats.totalTimeRested += 1;
      break;
    case 'countdown':
      updatedStats.totalTimeStretched += 1;
      break;
    // Note: 'prepare' phase is static and doesn't count time
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
        const completedState = {
          ...state,
          phase: 'complete' as Phase,
          timeRemaining: 0,
          statistics: {
            ...state.statistics,
            workoutEndTime: Date.now()
          }
        };
        saveWorkoutToHistory(completedState);
        return completedState;
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

    // Note: 'prepare' phase never reaches here since timer doesn't run for it

    default:
      return state;
  }
}