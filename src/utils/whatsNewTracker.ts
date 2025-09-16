import { storageService } from '../services/storageService';

export class WhatsNewTracker {
  private currentVersion: string;
  private lastReadVersion: string | null;

  constructor(currentVersion: string) {
    this.currentVersion = currentVersion;
    this.lastReadVersion = storageService.isWhatsNewRead(currentVersion) ? currentVersion : null;

    // If no version has been read before (first visit), automatically mark current as read
    // This prevents the indicator from showing on first visit
    if (this.lastReadVersion === null) {
      this.markAsRead();
    }
  }

  hasUnreadUpdates(): boolean {
    // Show indicator only if there's a different version than what was last read
    return this.lastReadVersion !== null && this.lastReadVersion !== this.currentVersion;
  }

  markAsRead(): void {
    this.lastReadVersion = this.currentVersion;
    storageService.markWhatsNewAsRead(this.currentVersion);
  }

  getCurrentVersion(): string {
    return this.currentVersion;
  }

  getLastReadVersion(): string | null {
    return this.lastReadVersion;
  }

  refreshFromStorage(): void {
    this.lastReadVersion = storageService.isWhatsNewRead(this.currentVersion) ? this.currentVersion : null;
  }
}

// Export a singleton instance
export const whatsNewTracker = new WhatsNewTracker('1.6.0');