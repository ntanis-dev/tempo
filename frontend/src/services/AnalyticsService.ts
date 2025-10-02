import { storageService } from './StorageService';
import { WorkoutState, WorkoutHistoryEntry } from '../types';

// Determine API URL based on current environment
function getApiUrl(): string {
  // If served from the same origin (production build), use relative URL
  if (window.location.port === '3001' || window.location.hostname !== 'localhost') {
    return '/api';
  }

  // Development mode - Vite dev server proxies /api to backend
  return '/api';
}

const ANALYTICS_URL = getApiUrl();
const USER_ID_KEY = 'tempo-user-id';
const PING_INTERVAL = 60000; // Ping every minute
const RETRY_INTERVALS = [
  5000,     // 5 seconds
  30000,    // 30 seconds
  60000,    // 1 minute
  300000,   // 5 minutes
  900000,   // 15 minutes
  3600000   // 1 hour (then repeat hourly)
];

class AnalyticsService {
  private userId: string;
  private pingInterval: NodeJS.Timeout | null = null;
  private retryInterval: NodeJS.Timeout | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.userId = this.getOrCreateUserId();
    this.startPinging();
    this.startRetrySync();
  }

  private getOrCreateUserId(): string {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  }

  private async sendRequest(endpoint: string, data: any): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await fetch(`${ANALYTICS_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId: this.userId
        })
      });
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.debug('Analytics request failed:', error);
    }
  }

  startPinging(): void {
    // Send initial ping
    this.ping();

    // Set up interval for regular pings
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      this.ping();
    }, PING_INTERVAL);

    // Also ping on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.ping();
      }
    });
  }

  private async ping(): Promise<void> {
    await this.sendRequest('/track/ping', {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }

  async trackWorkoutStart(workout: WorkoutState): Promise<void> {
    await this.sendRequest('/track/workout', {
      workoutStart: new Date(workout.statistics.workoutStartTime || Date.now()).toISOString(),
      totalSets: workout.totalSets,
      repsPerSet: workout.settings.repsPerSet,
      timeStretched: 0,
      timeExercised: 0,
      timeRested: 0,
      timePaused: 0,
      completed: false
    });
  }

  async trackWorkoutComplete(workout: WorkoutState): Promise<boolean> {
    // Get the workout from history to get its unique ID
    const history = storageService.getWorkoutHistory();
    const workoutEntry = history.find(entry =>
      entry.date === workout.statistics.workoutStartTime
    );

    const uniqueId = workoutEntry?.uniqueId || `${workout.statistics.workoutStartTime}_fallback`;

    try {
      const response = await fetch(`${ANALYTICS_URL}/track/workout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          uniqueId: uniqueId, // Send unique ID for server-side deduplication
          workoutStart: new Date(workout.statistics.workoutStartTime || Date.now()).toISOString(),
          workoutEnd: new Date(workout.statistics.workoutEndTime || Date.now()).toISOString(),
          totalSets: workout.totalSets,
          repsPerSet: workout.settings.repsPerSet,
          timeStretched: workout.statistics.totalTimeStretched,
          timeExercised: workout.statistics.totalTimeExercised,
          timeRested: workout.statistics.totalTimeRested,
          timePaused: workout.statistics.totalTimePaused,
          completed: true
        })
      });

      const success = response.ok;

      // Update sync status in storage
      if (workoutEntry) {
        storageService.updateWorkoutSyncStatus(workoutEntry.id, success, Date.now());
      }

      return success;
    } catch (error) {
      console.debug('Failed to track workout:', error);

      // Mark as failed sync attempt
      if (workoutEntry) {
        storageService.updateWorkoutSyncStatus(workoutEntry.id, false, Date.now());
      }

      return false;
    }
  }

  // Sync a specific workout entry
  async syncWorkoutEntry(entry: WorkoutHistoryEntry): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      const response = await fetch(`${ANALYTICS_URL}/track/workout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          uniqueId: entry.uniqueId || `${entry.date}_fallback`,
          workoutStart: new Date(entry.date).toISOString(),
          workoutEnd: new Date(entry.statistics.workoutEndTime || entry.date).toISOString(),
          totalSets: entry.totalSets,
          repsPerSet: entry.repsPerSet,
          timeStretched: entry.statistics.totalTimeStretched,
          timeExercised: entry.statistics.totalTimeExercised,
          timeRested: entry.statistics.totalTimeRested,
          timePaused: entry.statistics.totalTimePaused,
          completed: true
        })
      });

      const success = response.ok;
      storageService.updateWorkoutSyncStatus(entry.id, success, Date.now());
      return success;
    } catch (error) {
      console.debug('Failed to sync workout:', error);
      storageService.updateWorkoutSyncStatus(entry.id, false, Date.now());
      return false;
    }
  }

  // Start retry sync mechanism for failed workouts
  private startRetrySync(): void {
    // Initial sync attempt for any unsynced workouts
    this.syncUnsyncedWorkouts();

    // Set up retry interval
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }

    // Check for unsynced workouts periodically
    this.retryInterval = setInterval(() => {
      this.syncUnsyncedWorkouts();
    }, 60000); // Check every minute
  }

  // Attempt to sync all unsynced workouts
  private async syncUnsyncedWorkouts(): Promise<void> {
    if (!this.isEnabled) return;

    const unsyncedWorkouts = storageService.getUnsyncedWorkouts();

    for (const workout of unsyncedWorkouts) {
      // Calculate retry delay based on number of attempts
      const attempts = workout.syncAttempts || 0;
      const retryIndex = Math.min(attempts, RETRY_INTERVALS.length - 1);
      const retryDelay = RETRY_INTERVALS[retryIndex];

      const lastAttempt = workout.lastSyncAttempt || 0;
      const timeSinceLastAttempt = Date.now() - lastAttempt;

      // Only retry if enough time has passed since last attempt
      if (timeSinceLastAttempt >= retryDelay) {
        await this.syncWorkoutEntry(workout);
      }
    }
  }

  disable(): void {
    this.isEnabled = false;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
  }

  // Reload user ID after import (called from StorageService)
  reloadUserId(): void {
    this.userId = this.getOrCreateUserId();
    // Sync any unsynced workouts from the import
    this.syncUnsyncedWorkouts();
  }

  enable(): void {
    this.isEnabled = true;
    this.startPinging();
    this.startRetrySync();
  }

  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();