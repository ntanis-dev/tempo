import { create } from 'zustand';
import { AchievementModalData } from '../types/achievements';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

interface UIStore {
  // Modal states
  showHistory: boolean;
  showAchievements: boolean;
  showStorage: boolean;
  showLevels: boolean;
  showWhatsNew: boolean;
  showUpdateButton: boolean;
  waitingForAchievements: boolean;
  achievementModalData: AchievementModalData | null;

  // Notifications
  notifications: Notification[];

  // Keys for force re-renders
  whatsNewKey: number;
  storageRefreshKey: number;

  // Modal actions
  setShowHistory: (show: boolean) => void;
  setShowAchievements: (show: boolean) => void;
  setShowStorage: (show: boolean) => void;
  setShowLevels: (show: boolean) => void;
  setShowWhatsNew: (show: boolean) => void;
  setShowUpdateButton: (show: boolean) => void;
  setWaitingForAchievements: (waiting: boolean) => void;
  setAchievementModalData: (data: AchievementModalData | null) => void;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;

  // Key actions
  incrementWhatsNewKey: () => void;
  incrementStorageRefreshKey: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  showHistory: false,
  showAchievements: false,
  showStorage: false,
  showLevels: false,
  showWhatsNew: false,
  showUpdateButton: false,
  waitingForAchievements: false,
  achievementModalData: null,
  notifications: [],
  whatsNewKey: 0,
  storageRefreshKey: 0,

  // Modal actions
  setShowHistory: (show) => set({ showHistory: show }),
  setShowAchievements: (show) => set({ showAchievements: show }),
  setShowStorage: (show) => set({ showStorage: show }),
  setShowLevels: (show) => set({ showLevels: show }),
  setShowWhatsNew: (show) => set({ showWhatsNew: show }),
  setShowUpdateButton: (show) => set({ showUpdateButton: show }),
  setWaitingForAchievements: (waiting) => set({ waitingForAchievements: waiting }),
  setAchievementModalData: (data) => set({ achievementModalData: data }),

  // Notification actions
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          duration: notification.duration ?? 4000,
          dismissible: notification.dismissible ?? true
        }
      ]
    })),

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),

  clearAllNotifications: () => set({ notifications: [] }),

  showSuccess: (title, message) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'success',
          title,
          message,
          duration: 4000,
          dismissible: true
        }
      ]
    })),

  showError: (title, message) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'error',
          title,
          message,
          duration: 4000,
          dismissible: true
        }
      ]
    })),

  showWarning: (title, message) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'warning',
          title,
          message,
          duration: 4000,
          dismissible: true
        }
      ]
    })),

  showInfo: (title, message) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'info',
          title,
          message,
          duration: 4000,
          dismissible: true
        }
      ]
    })),

  // Key actions
  incrementWhatsNewKey: () =>
    set((state) => ({ whatsNewKey: state.whatsNewKey + 1 })),

  incrementStorageRefreshKey: () =>
    set((state) => ({ storageRefreshKey: state.storageRefreshKey + 1 }))
}));