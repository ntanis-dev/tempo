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
    WORKOUT_NOTES: 'tempo-workout-notes',
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

  // Generate a unique ID for workout deduplication
  private generateUniqueWorkoutId(workout: WorkoutState): string {
    const startTime = workout.statistics.workoutStartTime || Date.now();
    const totalTime = workout.statistics.totalTimeStretched +
                     workout.statistics.totalTimeExercised +
                     workout.statistics.totalTimeRested;
    const random = Math.random().toString(36).substring(2, 8);
    return `${startTime}_${totalTime}_${workout.totalSets}_${random}`;
  }

  saveWorkoutToHistory(workout: WorkoutState): void {
    if (!workout.statistics.workoutStartTime) return;

    const history = this.getWorkoutHistory();
    const uniqueId = this.generateUniqueWorkoutId(workout);

    // Check if this workout was already saved (prevent duplicates on refresh)
    // Check both old method (for backwards compatibility) and new uniqueId
    const isDuplicate = history.some(entry =>
      entry.uniqueId === uniqueId ||
      (entry.date === workout.statistics.workoutStartTime &&
       entry.totalSets === workout.totalSets &&
       entry.repsPerSet === workout.settings.repsPerSet)
    );

    if (isDuplicate) {
      return; // Don't save duplicate
    }

    // Clean statistics to remove runtime-only fields
    const cleanedStats = { ...workout.statistics };
    delete cleanedStats.pauseStartTime; // This is runtime-only, not for storage

    const entry: WorkoutHistoryEntry = {
      id: workout.statistics.workoutStartTime.toString(), // Use start time as ID for consistency
      uniqueId: uniqueId, // Unique identifier for server deduplication
      serverSynced: false, // Will be set to true when successfully sent to server
      syncAttempts: 0, // Track number of sync attempts
      date: workout.statistics.workoutStartTime,
      totalSets: workout.totalSets,
      repsPerSet: workout.settings.repsPerSet,
      timePerRep: workout.settings.timePerRep,
      restTime: workout.settings.restTime,
      stretchTime: workout.settings.stretchTime,
      statistics: cleanedStats
    };

    const updatedHistory = [entry, ...history].slice(0, 2048); // Keep last 2048 workouts (~5+ years of daily workouts)
    this.setItem(this.KEYS.WORKOUT_HISTORY, updatedHistory);
  }

  clearWorkoutHistory(): void {
    this.removeItem(this.KEYS.WORKOUT_HISTORY);
  }

  // Update sync status for a workout
  updateWorkoutSyncStatus(workoutId: string, synced: boolean, attemptTime?: number): void {
    const history = this.getWorkoutHistory();
    const index = history.findIndex(entry => entry.id === workoutId || entry.uniqueId === workoutId);

    if (index !== -1) {
      history[index].serverSynced = synced;
      if (attemptTime) {
        history[index].lastSyncAttempt = attemptTime;
        history[index].syncAttempts = (history[index].syncAttempts || 0) + 1;
      }
      this.setItem(this.KEYS.WORKOUT_HISTORY, history);
    }
  }

  // Get all unsynced workouts
  getUnsyncedWorkouts(): WorkoutHistoryEntry[] {
    const history = this.getWorkoutHistory();
    return history.filter(entry => !entry.serverSynced);
  }

  // Workout notes methods
  getWorkoutNotes(workoutId: string): string {
    const allNotes = this.getItem<Record<string, string>>(this.KEYS.WORKOUT_NOTES, {});
    return allNotes[workoutId] || '';
  }

  getAllWorkoutNotes(): Record<string, string> {
    return this.getItem<Record<string, string>>(this.KEYS.WORKOUT_NOTES, {});
  }

  saveWorkoutNotes(workoutId: string, notes: string): void {
    const allNotes = this.getItem<Record<string, string>>(this.KEYS.WORKOUT_NOTES, {});
    if (notes.trim()) {
      allNotes[workoutId] = notes;
    } else {
      // Remove empty notes to save space
      delete allNotes[workoutId];
    }
    this.setItem(this.KEYS.WORKOUT_NOTES, allNotes);
  }

  clearAllWorkoutNotes(): void {
    this.removeItem(this.KEYS.WORKOUT_NOTES);
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
    const allNotes = this.getAllWorkoutNotes();

    // Clean up history entries and include notes with each workout
    const cleanHistory = this.getWorkoutHistory().map(entry => {
      const cleanedStats = { ...entry.statistics };
      // Remove runtime-only field that shouldn't be persisted
      delete cleanedStats.pauseStartTime;

      // Include notes if they exist for this workout
      const workoutWithNotes = {
        ...entry,
        statistics: cleanedStats
      };

      if (allNotes[entry.id]) {
        workoutWithNotes.notes = allNotes[entry.id];
      }

      return workoutWithNotes;
    });

    // Get user ID from localStorage for analytics tracking continuity
    const userId = localStorage.getItem('tempo-user-id');

    const data = {
      exportDate: new Date().toISOString(),
      userId: userId, // Include user ID for cross-device tracking
      workout: {
        settings: this.getWorkoutSettings(), // This includes totalSets
        history: cleanHistory // Now includes notes within each workout
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

    // Restore user ID if present (for analytics continuity across devices)
    if (data.userId) {
      localStorage.setItem('tempo-user-id', data.userId);
      // Notify analytics service to reload the user ID
      import('./AnalyticsService').then(module => {
        module.analyticsService.reloadUserId();
      });
    }

    // Import workout data
    if (data.workout) {
      // Import settings (includes totalSets)
      if (data.workout.settings) {
        this.saveWorkoutSettings(data.workout.settings);
      }

      // Import history
      if (data.workout.history) {
        const notesMap: Record<string, string> = {};

        // Clean up history entries and extract notes
        const cleanedHistory = data.workout.history.map((entry: any) => {
          const cleanedEntry = { ...entry };

          // Clean up statistics if needed
          if (entry.statistics && entry.statistics.pauseStartTime !== undefined) {
            const cleanedStats = { ...entry.statistics };
            delete cleanedStats.pauseStartTime;
            cleanedEntry.statistics = cleanedStats;
          }

          // Extract notes from the workout entry
          if (entry.notes) {
            notesMap[entry.id] = entry.notes;
            // Remove notes from the history entry (they're stored separately)
            delete cleanedEntry.notes;
          }

          // Preserve sync status from backup
          // If these fields don't exist, they'll be undefined (backward compatible)
          return cleanedEntry;
        });

        this.setItem(this.KEYS.WORKOUT_HISTORY, cleanedHistory);

        // Import extracted notes or legacy notes format
        if (Object.keys(notesMap).length > 0) {
          this.setItem(this.KEYS.WORKOUT_NOTES, notesMap);
        } else if (data.workout.notes) {
          // Support legacy format where notes were separate
          this.setItem(this.KEYS.WORKOUT_NOTES, data.workout.notes);
        }
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