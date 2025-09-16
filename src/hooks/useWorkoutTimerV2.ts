import { useState, useEffect, useRef, useCallback } from 'react';
import { WorkoutState, WorkoutHistoryEntry, Phase } from '../types';
import { useWorkoutState } from './useWorkoutState';
import { useWorkoutStatistics } from './useWorkoutStatistics';
import { useQuoteManager } from './useQuoteManager';
import { useWorkoutPhase } from './useWorkoutPhase';
import {
  clearWorkoutState,
  saveWorkoutToHistory,
  loadWorkoutHistory
} from '../utils/storage';
import { audioManager } from '../utils/audio';
import { TIME } from '../constants';

/**
 * Version 2 of useWorkoutTimer that combines the new focused hooks
 * while maintaining the exact same interface as the original
 */
export const useWorkoutTimerV2 = () => {
  // Core state management
  const {
    workout,
    updateWorkout,
    adjustSets,
    adjustTime,
    refreshFromStorage
  } = useWorkoutState();

  // Statistics tracking
  const {
    startWorkoutTracking,
    completeRep
  } = useWorkoutStatistics(workout, updateWorkout);

  // Quote management
  const { resetQuotes } = useQuoteManager(workout, updateWorkout);

  // Phase management
  const {
    transitionToPhase,
    skipPhase: skipPhaseBase,
    resetWorkout: resetWorkoutBase
  } = useWorkoutPhase(workout, updateWorkout);

  // Local state for UI
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryEntry[]>(() =>
    loadWorkoutHistory()
  );

  // Refs for intervals and timeouts
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (workout.phase === 'work' || workout.phase === 'rest' || workout.phase === 'countdown' || workout.phase === 'prepare') {
      if (!workout.isPaused && workout.timeRemaining > 0) {
        intervalRef.current = setInterval(() => {
          updateWorkout(prev => {
            const now = Date.now();

            // Handle countdown
            if (prev.timeRemaining > 1) {
              // Handle work phase reps
              if (prev.phase === 'work') {
                const totalWorkTime = prev.settings.timePerRep * prev.settings.repsPerSet;
                const elapsedTime = totalWorkTime - prev.timeRemaining + 1;
                const newRep = Math.floor(elapsedTime / prev.settings.timePerRep) + 1;

                if (newRep !== prev.currentRep && newRep <= prev.settings.repsPerSet) {
                  audioManager.playRepChange();
                  return {
                    ...prev,
                    currentRep: newRep,
                    timeRemaining: prev.timeRemaining - 1,
                    statistics: {
                      ...prev.statistics,
                      totalRepsCompleted: prev.statistics.totalRepsCompleted + 1,
                      totalTimeExercised: prev.statistics.totalTimeExercised + 1,
                      lastActiveTime: now
                    }
                  };
                }
              }

              return {
                ...prev,
                timeRemaining: prev.timeRemaining - 1,
                statistics: {
                  ...prev.statistics,
                  lastActiveTime: now
                }
              };
            }

            // Handle phase transitions
            if (prev.phase === 'countdown') {
              audioManager.playWorkStart();
              return {
                ...prev,
                phase: 'work' as Phase,
                timeRemaining: prev.settings.timePerRep * prev.settings.repsPerSet,
                currentRep: 1
              };
            }

            if (prev.phase === 'work') {
              const isLastSet = prev.currentSet >= prev.totalSets;
              if (isLastSet) {
                audioManager.playWorkoutComplete();
                saveWorkoutToHistory(prev);
                return {
                  ...prev,
                  phase: 'complete' as Phase,
                  timeRemaining: 0
                };
              }

              audioManager.playRestStart();
              return {
                ...prev,
                phase: 'rest' as Phase,
                timeRemaining: prev.settings.restTime,
                currentRep: 1
              };
            }

            if (prev.phase === 'rest') {
              audioManager.playWorkStart();
              return {
                ...prev,
                phase: 'work' as Phase,
                currentSet: prev.currentSet + 1,
                timeRemaining: prev.settings.timePerRep * prev.settings.repsPerSet,
                currentRep: 1
              };
            }

            if (prev.phase === 'prepare') {
              audioManager.playPreparePhase();
              return {
                ...prev,
                phase: 'countdown' as Phase,
                timeRemaining: TIME.COUNTDOWN_THRESHOLD,
                currentSet: 1
              };
            }

            return prev;
          });
        }, 1000);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [workout.phase, workout.isPaused, workout.timeRemaining, updateWorkout]);

  // Countdown audio effects
  useEffect(() => {
    if (workout.phase === 'countdown' && !workout.isPaused) {
      if (workout.timeRemaining <= TIME.FINAL_COUNTDOWN && workout.timeRemaining > 0) {
        audioManager.playCountdownFinal();
      } else if (workout.timeRemaining > 0) {
        audioManager.playCountdownTick();
      }
    }
  }, [workout.timeRemaining, workout.phase, workout.isPaused]);

  // Save workout to history when complete
  useEffect(() => {
    if (workout.phase === 'complete') {
      saveWorkoutToHistory(workout);
      setWorkoutHistory(loadWorkoutHistory());
    }
  }, [workout.phase]);

  // Public methods
  const startWorkout = useCallback(() => {
    setIsTransitioning(true);
    startWorkoutTracking();

    setTimeout(() => {
      transitionToPhase('prepare');
      setIsTransitioning(false);
    }, TIME.TRANSITION_DELAY);
  }, [startWorkoutTracking, transitionToPhase]);

  const continueToStretch = useCallback(() => {
    setIsTransitioning(true);

    setTimeout(() => {
      transitionToPhase('countdown');
      setIsTransitioning(false);
    }, TIME.TRANSITION_DELAY);
  }, [transitionToPhase]);

  const togglePause = useCallback(() => {
    updateWorkout(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, [updateWorkout]);

  const skipPhase = useCallback(() => {
    if (workout.phase === 'rest' && audioManager.isSoundEnabled()) {
      // Don't allow skipping rest when sound is on
      return;
    }
    skipPhaseBase();
  }, [workout.phase, skipPhaseBase]);

  const resetWorkout = useCallback(() => {
    setIsResetting(true);

    // Clear any running intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Clear transition timeout if exists
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Start transition
    updateWorkout(prev => ({ ...prev, phase: 'transition' as Phase }));

    transitionTimeoutRef.current = setTimeout(() => {
      resetWorkoutBase();
      resetQuotes();
      clearWorkoutState();
      setIsResetting(false);
      setWorkoutHistory(loadWorkoutHistory());
      transitionTimeoutRef.current = null;
    }, TIME.RESET_DELAY);
  }, [updateWorkout, resetWorkoutBase, resetQuotes]);

  return {
    workout,
    isTransitioning,
    isResetting,
    workoutHistory,
    setWorkoutHistory,
    startWorkout,
    continueToStretch,
    togglePause,
    skipPhase,
    resetWorkout,
    adjustSets,
    adjustTime,
    refreshFromStorage
  };
};