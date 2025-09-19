import React from 'react';
import { WorkoutHistoryEntry, Phase } from '../types';
import { useWorkoutState } from './useWorkoutState';
import { useWorkoutStatistics } from './useWorkoutStatistics';
import { useQuoteManager } from './useQuoteManager';
import { useWorkoutPhase } from './useWorkoutPhase';
import { useTimerLogic } from './useTimerLogic';
import {
  clearWorkoutState,
  loadWorkoutHistory
} from '../utils/storage';
import { audioManager } from '../utils/audio';
import { TIME } from '../constants';

/**
 * useWorkoutTimer - Combines focused hooks for clean architecture
 * while maintaining the exact same interface
 */
export const useWorkoutTimer = () => {
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
    startWorkoutTracking
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
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [workoutHistory, setWorkoutHistory] = React.useState<WorkoutHistoryEntry[]>(() =>
    loadWorkoutHistory()
  );

  // Ref for transition timeout
  const transitionTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Use optimized timer logic
  useTimerLogic(workout, updateWorkout);

  // Update workout history when workout completes
  React.useEffect(() => {
    if (workout.phase === 'complete') {
      setWorkoutHistory(loadWorkoutHistory());
    }
  }, [workout.phase]);

  // Public methods
  const startWorkout = React.useCallback(() => {
    setIsTransitioning(true);
    startWorkoutTracking();
    audioManager.playStartSound(); // Play start sound when workout begins

    setTimeout(() => {
      transitionToPhase('prepare');
      setIsTransitioning(false);
    }, TIME.TRANSITION_DELAY);
  }, [startWorkoutTracking, transitionToPhase]);

  const continueToStretch = React.useCallback(() => {
    setIsTransitioning(true);

    setTimeout(() => {
      transitionToPhase('countdown');
      setIsTransitioning(false);
    }, TIME.TRANSITION_DELAY);
  }, [transitionToPhase]);

  const togglePause = React.useCallback(() => {
    updateWorkout(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, [updateWorkout]);

  const skipPhase = React.useCallback(() => {
    if (workout.phase === 'rest' && audioManager.isSoundEnabled()) {
      // Don't allow skipping rest when sound is on
      return;
    }
    skipPhaseBase();
  }, [workout.phase, skipPhaseBase]);

  const resetWorkout = React.useCallback(() => {
    setIsResetting(true);

    // Play sad sound only if giving up (not when workout is complete)
    if (workout.phase !== 'complete') {
      audioManager.playResetSound();
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
  }, [workout.phase, updateWorkout, resetWorkoutBase, resetQuotes]);

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