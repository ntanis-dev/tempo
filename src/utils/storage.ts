import { WorkoutState, TimerSettings, WorkoutHistoryEntry } from '../types';
import { Achievement } from '../types/achievements';
import { STORAGE_KEYS, DEFAULTS } from '../constants';
import { storageService } from '../services/storageService';

export const DEFAULT_SETTINGS: TimerSettings = DEFAULTS.SETTINGS;
export const DEFAULT_STATISTICS = DEFAULTS.STATISTICS;

export const saveWorkoutState = (state: WorkoutState) => {
  storageService.saveWorkoutState(state);
};

export const loadWorkoutState = (): WorkoutState | null => {
  return storageService.getWorkoutState();
};

export const saveTotalSets = (sets: number) => {
  // This function is deprecated - workout settings are now handled by StorageService
  console.warn('saveTotalSets is deprecated, use StorageService.saveWorkoutSettings instead');
  localStorage.setItem(STORAGE_KEYS.SETS, sets.toString());
};

export const loadTotalSets = (): number => {
  // This function is deprecated - workout settings are now handled by StorageService
  console.warn('loadTotalSets is deprecated, use StorageService.getWorkoutSettings instead');
  const saved = localStorage.getItem(STORAGE_KEYS.SETS);
  return saved ? parseInt(saved, 10) : DEFAULTS.TOTAL_SETS;
};

export const saveSettings = (settings: TimerSettings) => {
  storageService.saveWorkoutSettings(settings);
};

export const loadSettings = (): TimerSettings => {
  return storageService.getWorkoutSettings() || DEFAULT_SETTINGS;
};

export const clearWorkoutState = () => {
  storageService.clearWorkoutState();
};

export const saveWorkoutToHistory = (workout: WorkoutState) => {
  storageService.saveWorkoutToHistory(workout);
};

export const loadWorkoutHistory = (): WorkoutHistoryEntry[] => {
  return storageService.getWorkoutHistory();
};

export const clearWorkoutHistory = () => {
  storageService.clearWorkoutHistory();
};

export const saveSoundEnabled = (enabled: boolean) => {
  storageService.setSoundEnabled(enabled);
};

export const loadSoundEnabled = (): boolean => {
  return storageService.isSoundEnabled();
};

export const saveSoundVolume = (volume: number) => {
  storageService.setVolume(volume);
};

export const loadSoundVolume = (): number => {
  return storageService.getVolume();
};

export const savePreviousVolume = (volume: number) => {
  // This function is deprecated - previous volume is not handled by StorageService
  console.warn('savePreviousVolume is deprecated');
  localStorage.setItem(STORAGE_KEYS.PREVIOUS_VOLUME, volume.toString());
};

export const loadPreviousVolume = (): number => {
  // This function is deprecated - previous volume is not handled by StorageService
  console.warn('loadPreviousVolume is deprecated');
  const saved = localStorage.getItem(STORAGE_KEYS.PREVIOUS_VOLUME);
  return saved !== null ? parseFloat(saved) : DEFAULTS.SOUND_VOLUME;
};

export const saveAchievements = (achievements: Achievement[]) => {
  storageService.saveAchievements(achievements);
};

export const loadAchievements = (): Achievement[] => {
  return storageService.getAchievements();
};

export const clearAchievements = () => {
  storageService.resetAchievements();
};