import { WorkoutState, TimerSettings, WorkoutHistoryEntry } from '../types';
import { STORAGE_KEYS, DEFAULTS } from '../constants';

export const DEFAULT_SETTINGS: TimerSettings = DEFAULTS.SETTINGS;
export const DEFAULT_STATISTICS = DEFAULTS.STATISTICS;

export const saveWorkoutState = (state: WorkoutState) => {
  localStorage.setItem(STORAGE_KEYS.WORKOUT, JSON.stringify(state));
};

export const loadWorkoutState = (): WorkoutState | null => {
  const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT);
  return saved ? JSON.parse(saved) : null;
};

export const saveTotalSets = (sets: number) => {
  localStorage.setItem(STORAGE_KEYS.SETS, sets.toString());
};

export const loadTotalSets = (): number => {
  const saved = localStorage.getItem(STORAGE_KEYS.SETS);
  return saved ? parseInt(saved, 10) : DEFAULTS.TOTAL_SETS;
};

export const saveSettings = (settings: TimerSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const loadSettings = (): TimerSettings => {
  const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

export const clearWorkoutState = () => {
  localStorage.removeItem(STORAGE_KEYS.WORKOUT);
};

export const saveWorkoutToHistory = (workout: WorkoutState) => {
  const historyEntry: WorkoutHistoryEntry = {
    id: Date.now().toString(),
    date: workout.statistics.workoutStartTime || Date.now(),
    totalSets: workout.totalSets,
    repsPerSet: workout.settings.repsPerSet,
    timePerRep: workout.settings.timePerRep,
    restTime: workout.settings.restTime,
    stretchTime: workout.settings.stretchTime,
    statistics: workout.statistics
  };

  const existingHistory = loadWorkoutHistory();
  const newHistory = [historyEntry, ...existingHistory].slice(0, DEFAULTS.HISTORY_LIMIT);
  
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
};

export const loadWorkoutHistory = (): WorkoutHistoryEntry[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return saved ? JSON.parse(saved) : [];
};

export const clearWorkoutHistory = () => {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
};

export const saveSoundEnabled = (enabled: boolean) => {
  localStorage.setItem(STORAGE_KEYS.SOUND, enabled.toString());
};

export const loadSoundEnabled = (): boolean => {
  const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
  return saved !== null ? saved === 'true' : DEFAULTS.SOUND_ENABLED;
};

export const saveSoundVolume = (volume: number) => {
  localStorage.setItem(STORAGE_KEYS.SOUND_VOLUME, volume.toString());
};

export const loadSoundVolume = (): number => {
  const saved = localStorage.getItem(STORAGE_KEYS.SOUND_VOLUME);
  return saved !== null ? parseFloat(saved) : DEFAULTS.SOUND_VOLUME;
};

export const savePreviousVolume = (volume: number) => {
  localStorage.setItem(STORAGE_KEYS.PREVIOUS_VOLUME, volume.toString());
};

export const loadPreviousVolume = (): number => {
  const saved = localStorage.getItem(STORAGE_KEYS.PREVIOUS_VOLUME);
  return saved !== null ? parseFloat(saved) : DEFAULTS.SOUND_VOLUME;
};

export const saveAchievements = (achievements: any[]) => {
  localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
};

export const loadAchievements = (): any[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  return saved ? JSON.parse(saved) : [];
};

export const clearAchievements = () => {
  localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
};