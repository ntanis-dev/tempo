import { storageService } from './StorageService';
import { WorkoutState } from '../types';

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

class AnalyticsService {
  private userId: string;
  private pingInterval: NodeJS.Timeout | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.userId = this.getOrCreateUserId();
    this.startPinging();
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

  async trackWorkoutComplete(workout: WorkoutState): Promise<void> {
    await this.sendRequest('/track/workout', {
      workoutStart: new Date(workout.statistics.workoutStartTime || Date.now()).toISOString(),
      workoutEnd: new Date(workout.statistics.workoutEndTime || Date.now()).toISOString(),
      totalSets: workout.totalSets,
      repsPerSet: workout.settings.repsPerSet,
      timeStretched: workout.statistics.totalTimeStretched,
      timeExercised: workout.statistics.totalTimeExercised,
      timeRested: workout.statistics.totalTimeRested,
      timePaused: workout.statistics.totalTimePaused,
      completed: true
    });
  }

  disable(): void {
    this.isEnabled = false;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Reload user ID after import (called from StorageService)
  reloadUserId(): void {
    this.userId = this.getOrCreateUserId();
  }

  enable(): void {
    this.isEnabled = true;
    this.startPinging();
  }

  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();