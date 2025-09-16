import { create } from 'zustand';
import { WorkoutState, Phase, TimerSettings, WorkoutStatistics } from '../types';
import {
  saveWorkoutState,
  loadWorkoutState,
  saveTotalSets,
  loadTotalSets,
  saveSettings,
  loadSettings,
  clearWorkoutState,
  DEFAULT_SETTINGS,
  DEFAULT_STATISTICS
} from '../utils/storage';
import { validateSets, validateReps, validateTimePerRep, validateRestTime, validateStretchTime } from '../utils/validation';

interface WorkoutStore extends WorkoutState {
  // Actions
  setPhase: (phase: Phase) => void;
  setTimeRemaining: (time: number) => void;
  setPaused: (isPaused: boolean) => void;
  setCurrentRep: (rep: number) => void;
  setCurrentSet: (set: number) => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
  updateStatistics: (stats: Partial<WorkoutStatistics>) => void;
  adjustSets: (delta: number) => void;
  adjustTime: (type: keyof TimerSettings, delta: number, isDebugMode?: boolean) => void;
  reset: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const initialState = (): WorkoutState => {
  const savedState = loadWorkoutState();
  if (savedState && savedState.phase !== 'setup' && savedState.phase !== 'transition') {
    return {
      ...savedState,
      isPaused: savedState.phase === 'complete' ? false : (savedState.isPaused ?? true),
      settings: savedState.settings || loadSettings(),
      statistics: savedState.statistics || DEFAULT_STATISTICS
    };
  }

  return {
    phase: 'setup',
    currentSet: 0,
    totalSets: loadTotalSets(),
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
};

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  ...initialState(),

  setPhase: (phase) => set({ phase }),

  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),

  setPaused: (isPaused) => set({ isPaused }),

  setCurrentRep: (currentRep) => set({ currentRep }),

  setCurrentSet: (currentSet) => set({ currentSet }),

  updateSettings: (settings) =>
    set((state) => {
      const newSettings = { ...state.settings, ...settings };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  updateStatistics: (stats) =>
    set((state) => ({
      statistics: { ...state.statistics, ...stats }
    })),

  adjustSets: (delta) =>
    set((state) => {
      const newSets = validateSets(state.totalSets + delta);
      saveTotalSets(newSets);
      return { totalSets: newSets };
    }),

  adjustTime: (type, delta, isDebugMode = false) =>
    set((state) => {
      let newValue = state.settings[type] + delta;

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

      const newSettings = { ...state.settings, [type]: newValue };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  reset: () => {
    clearWorkoutState();
    set({
      phase: 'setup',
      currentSet: 0,
      timeRemaining: 0,
      isPaused: false,
      currentRep: 1,
      usedQuotes: [],
      currentQuote: '',
      usedCalmingQuotes: [],
      currentCalmingQuote: '',
      usedPreExerciseQuotes: [],
      currentPreExerciseQuote: '',
      usedPostWorkoutQuotes: [],
      currentPostWorkoutQuote: '',
      statistics: DEFAULT_STATISTICS
    });
  },

  loadFromStorage: () => {
    const state = initialState();
    set(state);
  },

  saveToStorage: () => {
    const state = get();
    if (state.phase !== 'setup' && state.phase !== 'transition') {
      saveWorkoutState(state);
    }
  }
}));