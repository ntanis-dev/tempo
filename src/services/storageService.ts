import { WorkoutState, WorkoutHistoryEntry, WorkoutSettings } from '../types';
import { Achievement } from '../types/achievements';
import { ExperienceData } from '../types/experience';

// Achievement modal data type
interface AchievementModalData {
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
  category: string;
}

/**
 * Centralized storage service for all localStorage operations
 * Provides type-safe methods for reading and writing data
 */
class StorageService {
  // Storage keys
  private readonly KEYS = {
    // Workout related
    WORKOUT_STATE: 'tempo-workout-state',
    WORKOUT_SETTINGS: 'tempo-workout-settings',
    WORKOUT_HISTORY: 'tempo-workout-history',
    LAST_PROCESSED_WORKOUT: 'tempo-last-processed-workout',

    // Achievement related
    ACHIEVEMENTS: 'tempo-achievements-v2',
    ACHIEVEMENT_MODAL_DATA: 'tempo-achievement-modal-data',
    REST_SKIP_ATTEMPTS: 'tempo-rest-skip-attempts',

    // Experience related
    EXPERIENCE: 'tempo-experience',

    // UI related
    VOLUME: 'tempo-volume',
    WHATS_NEW_READ: 'tempo-whats-new-read',
    PWA_DETECTED: 'tempo-pwa-detected',
    MUTED_MODE: 'tempo-muted-mode',

    // App related
    INSTALL_PROMPT_SHOWN: 'tempo-install-prompt-shown',
    APP_VERSION: 'tempo-app-version',
    DEBUG_MODE: 'tempo-debug-mode',
  } as const;

  // Generic storage methods
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Failed to read ${key} from storage:`, error);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to write ${key} to storage:`, error);
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from storage:`, error);
    }
  }

  // Workout methods
  getWorkoutState(): Partial<WorkoutState> | null {
    return this.getItem(this.KEYS.WORKOUT_STATE, null);
  }

  saveWorkoutState(state: Partial<WorkoutState>): void {
    this.setItem(this.KEYS.WORKOUT_STATE, state);
  }

  clearWorkoutState(): void {
    this.removeItem(this.KEYS.WORKOUT_STATE);
  }

  getWorkoutSettings(): WorkoutSettings | null {
    return this.getItem(this.KEYS.WORKOUT_SETTINGS, null);
  }

  saveWorkoutSettings(settings: WorkoutSettings): void {
    this.setItem(this.KEYS.WORKOUT_SETTINGS, settings);
  }

  // Workout history methods
  getWorkoutHistory(): WorkoutHistoryEntry[] {
    return this.getItem(this.KEYS.WORKOUT_HISTORY, []);
  }

  saveWorkoutToHistory(workout: WorkoutState): void {
    if (!workout.statistics.workoutStartTime) return;

    const history = this.getWorkoutHistory();

    // Check if this workout was already saved (prevent duplicates on refresh)
    // Use workoutStartTime as unique identifier since it's set when workout begins
    const isDuplicate = history.some(entry =>
      entry.date === workout.statistics.workoutStartTime &&
      entry.totalSets === workout.totalSets &&
      entry.repsPerSet === workout.settings.repsPerSet
    );

    if (isDuplicate) {
      return; // Don't save duplicate
    }

    // Clean statistics to remove runtime-only fields
    const cleanedStats = { ...workout.statistics };
    delete cleanedStats.pauseStartTime; // This is runtime-only, not for storage

    const entry: WorkoutHistoryEntry = {
      id: workout.statistics.workoutStartTime.toString(), // Use start time as ID for consistency
      date: workout.statistics.workoutStartTime,
      totalSets: workout.totalSets,
      repsPerSet: workout.settings.repsPerSet,
      timePerRep: workout.settings.timePerRep,
      restTime: workout.settings.restTime,
      stretchTime: workout.settings.stretchTime,
      statistics: cleanedStats
    };

    const updatedHistory = [entry, ...history].slice(0, 50); // Keep last 50 workouts
    this.setItem(this.KEYS.WORKOUT_HISTORY, updatedHistory);
  }

  clearWorkoutHistory(): void {
    this.removeItem(this.KEYS.WORKOUT_HISTORY);
  }

  // Achievement methods
  getAchievements(): Achievement[] {
    return this.getItem(this.KEYS.ACHIEVEMENTS, []);
  }

  saveAchievements(achievements: Achievement[]): void {
    this.setItem(this.KEYS.ACHIEVEMENTS, achievements);
  }

  resetAchievements(): void {
    this.removeItem(this.KEYS.ACHIEVEMENTS);
  }

  getAchievementModalData(): AchievementModalData | null {
    return this.getItem(this.KEYS.ACHIEVEMENT_MODAL_DATA, null);
  }

  saveAchievementModalData(data: AchievementModalData): void {
    this.setItem(this.KEYS.ACHIEVEMENT_MODAL_DATA, data);
  }

  clearAchievementModalData(): void {
    this.removeItem(this.KEYS.ACHIEVEMENT_MODAL_DATA);
  }

  getRestSkipAttempts(): number {
    return this.getItem(this.KEYS.REST_SKIP_ATTEMPTS, 0);
  }

  incrementRestSkipAttempts(): void {
    const current = this.getRestSkipAttempts();
    this.setItem(this.KEYS.REST_SKIP_ATTEMPTS, current + 1);
  }

  clearRestSkipAttempts(): void {
    this.removeItem(this.KEYS.REST_SKIP_ATTEMPTS);
  }

  // Experience methods
  getExperience(): ExperienceData {
    return this.getItem(this.KEYS.EXPERIENCE, {
      totalXP: 0,
      currentLevel: 1
    });
  }

  saveExperience(data: ExperienceData): void {
    this.setItem(this.KEYS.EXPERIENCE, data);
  }

  resetExperience(): void {
    this.removeItem(this.KEYS.EXPERIENCE);
  }

  // UI preference methods
  getVolume(): number {
    return this.getItem(this.KEYS.VOLUME, 50);
  }

  setVolume(volume: number): void {
    this.setItem(this.KEYS.VOLUME, volume);
  }

  // App state methods
  getLastProcessedWorkout(): string | null {
    return this.getItem(this.KEYS.LAST_PROCESSED_WORKOUT, null);
  }

  setLastProcessedWorkout(workoutId: string): void {
    this.setItem(this.KEYS.LAST_PROCESSED_WORKOUT, workoutId);
  }

  // Debug mode methods
  isDebugMode(): boolean {
    return this.getItem(this.KEYS.DEBUG_MODE, false);
  }

  setDebugMode(enabled: boolean): void {
    this.setItem(this.KEYS.DEBUG_MODE, enabled);
  }

  // Muted mode methods
  isMutedMode(): boolean {
    return this.getItem(this.KEYS.MUTED_MODE, false);
  }

  setMutedMode(enabled: boolean): void {
    this.setItem(this.KEYS.MUTED_MODE, enabled);
  }

  // Export/Import methods
  exportAllData(): string {
    // Clean up history entries to remove runtime-only fields
    const cleanHistory = this.getWorkoutHistory().map(entry => {
      const cleanedStats = { ...entry.statistics };
      // Remove runtime-only field that shouldn't be persisted
      delete cleanedStats.pauseStartTime;
      return {
        ...entry,
        statistics: cleanedStats
      };
    });

    const data = {
      exportDate: new Date().toISOString(),
      workout: {
        settings: this.getWorkoutSettings(), // This includes totalSets
        history: cleanHistory
      },
      achievements: this.getAchievements(),
      experience: this.getExperience(),
      preferences: {
        volume: this.getVolume(),
        mutedMode: this.isMutedMode(),
        debugMode: this.isDebugMode()
      }
    };

    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): void {
    const data = JSON.parse(jsonString);

    // Import workout data
    if (data.workout) {
      // Import settings (includes totalSets)
      if (data.workout.settings) {
        this.saveWorkoutSettings(data.workout.settings);
      }

      // Import history
      if (data.workout.history) {
        // Clean up history entries in case they have pauseStartTime
        const cleanedHistory = data.workout.history.map((entry: any) => {
          if (entry.statistics && entry.statistics.pauseStartTime !== undefined) {
            const cleanedStats = { ...entry.statistics };
            delete cleanedStats.pauseStartTime;
            return { ...entry, statistics: cleanedStats };
          }
          return entry;
        });
        this.setItem(this.KEYS.WORKOUT_HISTORY, cleanedHistory);
      }
    }

    // Import achievements
    if (data.achievements) {
      this.saveAchievements(data.achievements);
    }

    // Import experience
    if (data.experience) {
      this.saveExperience(data.experience);
    }

    // Import preferences
    if (data.preferences) {
      if (typeof data.preferences.volume === 'number') {
        this.setVolume(data.preferences.volume);
      }
      // Handle legacy soundEnabled field for backwards compatibility
      if (typeof data.preferences.soundEnabled === 'boolean' && !('volume' in data.preferences)) {
        // If old format with soundEnabled but no volume, convert to volume
        this.setVolume(data.preferences.soundEnabled ? 50 : 0);
      }
      if (typeof data.preferences.mutedMode === 'boolean') {
        this.setMutedMode(data.preferences.mutedMode);
      }
      if (typeof data.preferences.debugMode === 'boolean') {
        this.setDebugMode(data.preferences.debugMode);
      }
    }
  }

  clearAllData(): void {
    // Clear all app data except PWA detection
    Object.entries(this.KEYS).forEach(([, value]) => {
      if (value !== this.KEYS.PWA_DETECTED) {
        this.removeItem(value);
      }
    });
  }
}

// Export singleton instance
export const storageService = new StorageService();