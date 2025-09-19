import { useCallback } from 'react';
import { useUIStore } from '../store/uiStore';
import { audioManager } from '../utils/audio';
import { achievementProcessor } from '../utils/achievementProcessor';
import { experienceProcessor } from '../utils/experienceProcessor';
import { whatsNewTracker } from '../utils/whatsNewTracker';
import { clearWorkoutHistory } from '../utils/storage';
import { WorkoutHistoryEntry } from '../types';
import { storageService } from "../services/StorageService";
import { useDebugMode } from '../contexts/DebugContext';

// Remove this constant as we now use StorageService methods

/**
 * Custom hook to manage all modal states and their related actions
 */
export const useModalManagement = (
  refreshWorkoutFromStorage: () => void,
  setWorkoutHistory: (history: WorkoutHistoryEntry[]) => void,
  showSuccess: (title: string, message: string) => void,
  showError: (title: string, message: string) => void
) => {
  const {
    showHistory,
    showAchievements,
    showStorage,
    showLevels,
    showWhatsNew,
    setShowHistory,
    setShowAchievements,
    setShowStorage,
    setShowLevels,
    setShowWhatsNew,
    setAchievementModalData,
    incrementWhatsNewKey,
    incrementStorageRefreshKey,
  } = useUIStore();

  const [, setDebugMode] = useDebugMode();

  // History Modal
  const showWorkoutHistory = useCallback(() => {
    setShowHistory(true);
  }, [setShowHistory]);

  const hideWorkoutHistory = useCallback(() => {
    setShowHistory(false);
  }, [setShowHistory]);

  const handleClearHistory = useCallback(() => {
    clearWorkoutHistory();
    setWorkoutHistory([]);
  }, [setWorkoutHistory]);

  // Achievements Modal
  const showAchievementsModal = useCallback(() => {
    // Pre-load achievements before showing modal to prevent layout shift
    achievementProcessor.getAchievements();
    // Small delay to ensure achievements are processed
    setTimeout(() => {
      setShowAchievements(true);
    }, 50);
  }, [setShowAchievements]);

  const hideAchievementsModal = useCallback(() => {
    setShowAchievements(false);
  }, [setShowAchievements]);

  const handleCloseAchievementModal = useCallback(() => {
    setAchievementModalData(null);
    storageService.clearAchievementModalData();
  }, [setAchievementModalData]);

  // Storage Modal
  const showStorageModal = useCallback(() => {
    setShowStorage(true);
  }, [setShowStorage]);

  const hideStorageModal = useCallback(() => {
    setShowStorage(false);
  }, [setShowStorage]);

  const handleStorageExportSuccess = useCallback(() => {
    setShowStorage(false);
    showSuccess('Export Successful', 'Your backup file has been downloaded successfully.');
  }, [setShowStorage, showSuccess]);

  const handleStorageClearSuccess = useCallback(() => {
    // Refresh all storage-dependent states
    achievementProcessor.resetAchievements();
    experienceProcessor.resetExperience();
    refreshWorkoutFromStorage();

    // Refresh audio settings
    audioManager.refreshFromStorage();

    // Force menu re-render to show red indicator
    incrementWhatsNewKey();

    // Refresh the whats new tracker
    whatsNewTracker.refreshFromStorage();

    // Force level display refresh
    incrementStorageRefreshKey();

    // Force debug mode to false
    setDebugMode(false);

    showSuccess('Storage Cleared', 'All your data have been cleared.');
  }, [refreshWorkoutFromStorage, incrementWhatsNewKey, incrementStorageRefreshKey, showSuccess, setDebugMode]);

  const handleStorageImportSuccess = useCallback(() => {
    setShowStorage(false);
    // Refresh all storage-dependent states
    achievementProcessor.refreshFromStorage();
    experienceProcessor.refreshFromStorage();
    refreshWorkoutFromStorage();

    // Refresh audio settings
    audioManager.refreshFromStorage();

    // Force menu re-render
    incrementWhatsNewKey();

    // Force level display refresh
    incrementStorageRefreshKey();

    showSuccess('Import Successful', 'Your backup has been restored successfully.');
  }, [setShowStorage, refreshWorkoutFromStorage, incrementWhatsNewKey, incrementStorageRefreshKey, showSuccess]);

  const handleStorageError = useCallback((error: string) => {
    showError('Import Failed', error);
  }, [showError]);

  // Levels Modal
  const showLevelsModal = useCallback(() => {
    setShowLevels(true);
  }, [setShowLevels]);

  const hideLevelsModal = useCallback(() => {
    setShowLevels(false);
  }, [setShowLevels]);

  // What's New Modal
  const showWhatsNewModal = useCallback(() => {
    setShowWhatsNew(true);
  }, [setShowWhatsNew]);

  const hideWhatsNewModal = useCallback(() => {
    setShowWhatsNew(false);
  }, [setShowWhatsNew]);

  const handleWhatsNewRead = useCallback(() => {
    whatsNewTracker.markAsRead();
    // Force menu re-render by updating the key
    incrementWhatsNewKey();
  }, [incrementWhatsNewKey]);

  return {
    // Modal states
    showHistory,
    showAchievements,
    showStorage,
    showLevels,
    showWhatsNew,

    // History modal actions
    showWorkoutHistory,
    hideWorkoutHistory,
    handleClearHistory,

    // Achievements modal actions
    showAchievementsModal,
    hideAchievementsModal,
    handleCloseAchievementModal,

    // Storage modal actions
    showStorageModal,
    hideStorageModal,
    handleStorageExportSuccess,
    handleStorageClearSuccess,
    handleStorageImportSuccess,
    handleStorageError,

    // Levels modal actions
    showLevelsModal,
    hideLevelsModal,

    // What's New modal actions
    showWhatsNewModal,
    hideWhatsNewModal,
    handleWhatsNewRead,
  };
};