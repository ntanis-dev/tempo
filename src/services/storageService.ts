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
    SOUND_ENABLED: 'tempo-sound-enabled',
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

    const entry: WorkoutHistoryEntry = {
      id: workout.statistics.workoutStartTime.toString(), // Use start time as ID for consistency
      date: workout.statistics.workoutStartTime,
      totalSets: workout.totalSets,
      repsPerSet: workout.settings.repsPerSet,
      timePerRep: workout.settings.timePerRep,
      restTime: workout.settings.restTime,
      stretchTime: workout.settings.stretchTime,
      statistics: workout.statistics
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
  isSoundEnabled(): boolean {
    return this.getItem(this.KEYS.SOUND_ENABLED, true);
  }

  setSoundEnabled(enabled: boolean): void {
    this.setItem(this.KEYS.SOUND_ENABLED, enabled);
  }

  getVolume(): number {
    return this.getItem(this.KEYS.VOLUME, 50);
  }

  setVolume(volume: number): void {
    this.setItem(this.KEYS.VOLUME, volume);
  }

  isWhatsNewRead(version: string): boolean {
    return this.getItem(this.KEYS.WHATS_NEW_READ, '') === version;
  }

  markWhatsNewAsRead(version: string): void {
    this.setItem(this.KEYS.WHATS_NEW_READ, version);
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
    const data = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      workout: {
        state: this.getWorkoutState(),
        settings: this.getWorkoutSettings(),
        history: this.getWorkoutHistory()
      },
      achievements: this.getAchievements(),
      experience: this.getExperience(),
      preferences: {
        soundEnabled: this.isSoundEnabled(),
        volume: this.getVolume()
      }
    };

    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): void {
    const data = JSON.parse(jsonString);

    // Import workout data
    if (data.workout) {
      if (data.workout.state) this.saveWorkoutState(data.workout.state);
      if (data.workout.settings) this.saveWorkoutSettings(data.workout.settings);
      if (data.workout.history) this.setItem(this.KEYS.WORKOUT_HISTORY, data.workout.history);
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
      if (typeof data.preferences.soundEnabled === 'boolean') {
        this.setSoundEnabled(data.preferences.soundEnabled);
      }
      if (typeof data.preferences.volume === 'number') {
        this.setVolume(data.preferences.volume);
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