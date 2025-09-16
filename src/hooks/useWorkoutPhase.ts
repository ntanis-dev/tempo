import { useCallback, useRef } from 'react';
import { WorkoutState, Phase } from '../types';
import { getPhases } from '../utils/timer';
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
          updates.timeRemaining = prev.settings.stretchTime;
          break;

        case 'countdown':
          updates = {
            ...updates,
            currentSet: prev.currentSet === 0 ? 1 : prev.currentSet,
            timeRemaining: TIME.COUNTDOWN_THRESHOLD,
            currentRep: 1
          };
          audioManager.playPreparePhase();
          break;

        case 'work':
          updates.timeRemaining = prev.settings.timePerRep;
          audioManager.playWorkStart();
          break;

        case 'rest':
          const nextSet = prev.currentSet + 1;
          const isComplete = nextSet > prev.totalSets;

          if (isComplete) {
            return transitionToComplete(prev);
          }

          updates = {
            ...updates,
            currentSet: nextSet,
            timeRemaining: prev.settings.restTime,
            currentRep: 1
          };
          audioManager.playRestStart();
          break;

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
    const phases = getPhases(workout);
    const currentIndex = phases.indexOf(workout.phase);

    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];

      if (workout.phase === 'rest' && workout.currentSet >= workout.totalSets) {
        transitionToPhase('complete');
      } else {
        transitionToPhase(nextPhase as Phase);
      }
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