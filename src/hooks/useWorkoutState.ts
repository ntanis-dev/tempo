import React from 'react';
import { WorkoutState, TimerSettings } from '../types';
import {
  saveWorkoutState,
  loadWorkoutState,
  saveSettings,
  loadSettings,
  DEFAULT_STATISTICS
} from '../utils/storage';
import { storageService } from '../services/StorageService';
import { validateSets, validateReps, validateTimePerRep, validateRestTime, validateStretchTime } from '../utils/validation';
import { useDebugMode } from '../contexts/DebugContext';
import { DEFAULTS } from '../constants';

// Core workout state management
export const useWorkoutState = () => {
  const [isDebugMode] = useDebugMode();

  const [workout, setWorkout] = React.useState<WorkoutState>(() => {
    const savedState = loadWorkoutState();
    if (savedState && savedState.phase !== 'setup' && savedState.phase !== 'transition') {
      return {
        ...savedState,
        isPaused: savedState.phase === 'complete' ? false : (savedState.isPaused ?? true),
        settings: savedState.settings || loadSettings(),
        usedQuotes: savedState.usedQuotes || [],
        currentQuote: savedState.currentQuote || '',
        usedCalmingQuotes: savedState.usedCalmingQuotes || [],
        currentCalmingQuote: savedState.currentCalmingQuote || '',
        usedPreExerciseQuotes: savedState.usedPreExerciseQuotes || [],
        currentPreExerciseQuote: savedState.currentPreExerciseQuote || '',
        usedPostWorkoutQuotes: savedState.usedPostWorkoutQuotes || [],
        currentPostWorkoutQuote: savedState.currentPostWorkoutQuote || '',
        statistics: savedState.statistics || DEFAULT_STATISTICS
      };
    }
    return {
      phase: 'setup',
      currentSet: 0,
      totalSets: storageService.getWorkoutSettings()?.totalSets || DEFAULTS.TOTAL_SETS,
      timeRemaining: 0,
      isPaused: false,
      currentRep: 1,
      settings: loadSettings(),
      usedQuotes: [],
      currentQuote: '',
      usedCalmingQuotes: [],
      currentCalmingQuote: '',
      usedPreExerciseQuotes: [],
      currentPreExerciseQuote: '',
      usedPostWorkoutQuotes: [],
      currentPostWorkoutQuote: '',
      statistics: DEFAULT_STATISTICS
    };
  });

  const updateWorkout = React.useCallback((updater: (prev: WorkoutState) => WorkoutState) => {
    setWorkout(prev => {
      const newState = updater(prev);
      // Save to storage when phase changes or important state changes
      if (newState.phase !== 'setup' && newState.phase !== 'transition') {
        saveWorkoutState(newState);
      }
      return newState;
    });
  }, []);

  const adjustSets = React.useCallback((delta: number) => {
    setWorkout(prev => {
      const newSets = validateSets(prev.totalSets + delta);

      // Save totalSets as part of WorkoutSettings
      const newWorkoutSettings = {
        ...prev.settings,
        totalSets: newSets
      };
      storageService.saveWorkoutSettings(newWorkoutSettings);

      return { ...prev, totalSets: newSets };
    });
  }, []);

  const adjustTime = React.useCallback((type: keyof TimerSettings, delta: number) => {
    setWorkout(prev => {
      let newValue = prev.settings[type] + delta;

      switch (type) {
        case 'repsPerSet':
          newValue = validateReps(newValue);
          break;
        case 'timePerRep':
          newValue = validateTimePerRep(newValue);
          break;
        case 'restTime':
          newValue = validateRestTime(newValue, isDebugMode);
          break;
        case 'stretchTime':
          newValue = validateStretchTime(newValue, isDebugMode);
          break;
      }

      const newSettings = { ...prev.settings, [type]: newValue };
      saveSettings(newSettings);

      return { ...prev, settings: newSettings };
    });
  }, [isDebugMode]);

  const refreshFromStorage = React.useCallback(() => {
    const savedState = loadWorkoutState();
    const settings = loadSettings();
    const workoutSettings = storageService.getWorkoutSettings();
    const totalSets = workoutSettings?.totalSets || DEFAULTS.TOTAL_SETS;

    if (savedState && savedState.phase !== 'setup' && savedState.phase !== 'transition') {
      setWorkout({
        ...savedState,
        isPaused: savedState.phase === 'complete' ? false : (savedState.isPaused ?? true),
        settings: savedState.settings || settings,
        statistics: savedState.statistics || DEFAULT_STATISTICS,
        totalSets: savedState.totalSets || totalSets
      });
    } else {
      // When no saved state or in setup, reset to defaults
      setWorkout(prev => ({
        ...prev,
        phase: 'setup',
        currentSet: 0,
        timeRemaining: 0,
        isPaused: false,
        currentRep: 1,
        settings,
        totalSets,
        statistics: DEFAULT_STATISTICS
      }));
    }
  }, []);

  return {
    workout,
    setWorkout,
    updateWorkout,
    adjustSets,
    adjustTime,
    refreshFromStorage
  };
};