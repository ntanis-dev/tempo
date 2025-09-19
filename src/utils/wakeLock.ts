/**
 * Wake Lock utility to prevent screen from auto-locking during workout
 */
class WakeLockManager {
  private wakeLock: WakeLockSentinel | null = null;
  private isSupported: boolean = false;

  constructor() {
    // Check if Wake Lock API is supported
    this.isSupported = 'wakeLock' in navigator;
  }

  /**
   * Request wake lock to keep screen on
   */
  async requestWakeLock(): Promise<void> {
    if (!this.isSupported) {
      return;
    }

    try {
      // Release existing lock if any
      if (this.wakeLock) {
        await this.releaseWakeLock();
      }

      // Request new wake lock
      this.wakeLock = await (navigator as any).wakeLock.request('screen');

      // Re-acquire lock if page becomes visible again (e.g., after tab switch)
      document.addEventListener('visibilitychange', this.handleVisibilityChange);

      // Listen for release event
      this.wakeLock.addEventListener('release', () => {
        // Wake Lock was released
      });
    } catch (err) {
      console.error('Failed to acquire wake lock:', err);
    }
  }

  /**
   * Release wake lock to allow screen to auto-lock again
   */
  async releaseWakeLock(): Promise<void> {
    if (!this.wakeLock) return;

    try {
      await this.wakeLock.release();
      this.wakeLock = null;

      // Remove visibility change listener
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    } catch (err) {
      console.error('Failed to release wake lock:', err);
    }
  }

  /**
   * Handle visibility change to re-acquire lock when page becomes visible
   */
  private handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && this.wakeLock === null && this.isSupported) {
      await this.requestWakeLock();
    }
  };

  /**
   * Check if wake lock is currently active
   */
  isActive(): boolean {
    return this.wakeLock !== null && !this.wakeLock.released;
  }
}

export const wakeLockManager = new WakeLockManager();