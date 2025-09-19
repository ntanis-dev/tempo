import { useCallback, useRef } from 'react';
import { WorkoutState, Phase } from '../types';
import { audioManager } from '../utils/audio';
import { musicManager } from '../utils/music';
import { clearWorkoutState, saveWorkoutToHistory } from '../utils/storage';
import { TIME } from '../constants';

export const useWorkoutPhase = (
  workout: WorkoutState,
  updateWorkout: (updater: (prev: WorkoutState) => WorkoutState) => void
) => {
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const transitionToPhase = useCallback((newPhase: Phase, additionalUpdates?: Partial<WorkoutState>) => {
    updateWorkout(prev => {
      let updates: Partial<WorkoutState> = { phase: newPhase };

      // Handle phase-specific logic and music transitions
      switch (newPhase) {
        case 'prepare':
          updates = {
            ...updates,
            timeRemaining: 0  // Prepare phase is static, no countdown
          };
          musicManager.startMusic('prepare');
          break;

        case 'countdown':
          updates = {
            ...updates,
            currentSet: prev.currentSet === 0 ? 1 : prev.currentSet,
            timeRemaining: prev.settings.stretchTime,
            currentRep: 1
          };
          audioManager.playPreparePhase();
          musicManager.startMusic('countdown');
          break;

        case 'work':
          updates = {
            ...updates,
            timeRemaining: prev.settings.timePerRep * prev.settings.repsPerSet,
            currentRep: 1
          };
          audioManager.playWorkStart();
          musicManager.startMusic('work');
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
          musicManager.startMusic('rest');
          break;
        }

        case 'complete':
          musicManager.startMusic('complete');
          return transitionToComplete(prev);

        case 'setup':
          clearWorkoutState();
          musicManager.startMusic('setup');
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
    const completedState = {
      ...state,
      phase: 'complete',
      timeRemaining: 0,
      isPaused: false,
      statistics: {
        ...state.statistics,
        workoutEndTime: Date.now()
      }
    };
    // Save to history when completing via skip
    saveWorkoutToHistory(completedState);
    return completedState;
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
            currentRep: 1
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

    // Stop music during transition
    musicManager.stopMusic();

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