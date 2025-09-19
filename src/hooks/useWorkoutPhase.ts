import { useCallback, useRef } from 'react';
import { WorkoutState, Phase } from '../types';
import { audioManager } from '../utils/audio';
import { clearWorkoutState } from '../utils/storage';
import { TIME } from '../constants';

export const useWorkoutPhase = (
  workout: WorkoutState,
  updateWorkout: (updater: (prev: WorkoutState) => WorkoutState) => void
) => {
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const transitionToPhase = useCallback((newPhase: Phase, additionalUpdates?: Partial<WorkoutState>) => {
    updateWorkout(prev => {
      let updates: Partial<WorkoutState> = { phase: newPhase };

      // Handle phase-specific logic
      switch (newPhase) {
        case 'prepare':
          updates = {
            ...updates,
            timeRemaining: 0  // Prepare phase is static, no countdown
          };
          break;

        case 'countdown':
          updates = {
            ...updates,
            currentSet: prev.currentSet === 0 ? 1 : prev.currentSet,
            timeRemaining: prev.settings.stretchTime,
            currentRep: 1
          };
          audioManager.playPreparePhase();
          break;

        case 'work':
          updates = {
            ...updates,
            timeRemaining: prev.settings.timePerRep * prev.settings.repsPerSet,
            currentRep: 1
          };
          audioManager.playWorkStart();
          break;

        case 'rest': {
          // Don't increment currentSet here - it stays the same during rest
          const isComplete = prev.currentSet >= prev.totalSets;

          if (isComplete) {
            return transitionToComplete(prev);
          }

          updates = {
            ...updates,
            timeRemaining: prev.settings.restTime,
            currentRep: 1
          };
          audioManager.playRestStart();
          break;
        }

        case 'complete':
          return transitionToComplete(prev);

        case 'setup':
          clearWorkoutState();
          updates = {
            ...updates,
            currentSet: 0,
            timeRemaining: 0,
            isPaused: false,
            currentRep: 1
          };
          break;
      }

      return {
        ...prev,
        ...updates,
        ...additionalUpdates
      };
    });
  }, [updateWorkout]);

  const transitionToComplete = (state: WorkoutState): WorkoutState => {
    audioManager.playWorkoutComplete();
    return {
      ...state,
      phase: 'complete',
      timeRemaining: 0,
      isPaused: false
    };
  };

  const skipPhase = useCallback(() => {
    // Determine next phase based on current phase
    switch (workout.phase) {
      case 'countdown':
        // Skip from countdown (stretch) to work
        transitionToPhase('work', {
          timeRemaining: workout.settings.timePerRep * workout.settings.repsPerSet,
          currentRep: 1
        });
        break;

      case 'work':
        // Skip from work to rest (or complete if last set)
        if (workout.currentSet >= workout.totalSets) {
          transitionToPhase('complete');
        } else {
          transitionToPhase('rest', {
            timeRemaining: workout.settings.restTime,
            currentRep: 1,
            statistics: {
              ...workout.statistics,
              setsCompleted: workout.currentSet
            }
          });
        }
        break;

      case 'rest':
        // Skip from rest to next work phase
        transitionToPhase('work', {
          currentSet: workout.currentSet + 1,
          timeRemaining: workout.settings.timePerRep * workout.settings.repsPerSet,
          currentRep: 1
        });
        break;

      default:
        // No skip for other phases
        break;
    }
  }, [workout, transitionToPhase]);

  const resetWorkout = useCallback(() => {
    // Cancel any pending reset
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }

    // Transition to setup with animation
    updateWorkout(prev => ({
      ...prev,
      phase: 'transition' as Phase
    }));

    resetTimeoutRef.current = setTimeout(() => {
      transitionToPhase('setup');
      resetTimeoutRef.current = null;
    }, TIME.RESET_DELAY);
  }, [updateWorkout, transitionToPhase]);

  return {
    transitionToPhase,
    skipPhase,
    resetWorkout
  };
};