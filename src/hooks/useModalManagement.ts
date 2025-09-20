import { useCallback } from 'react';
import { useUIStore } from '../store/uiStore';
import { audioManager } from '../utils/audio';
import { achievementProcessor } from '../utils/achievementProcessor';
import { experienceProcessor } from '../utils/experienceProcessor';
import { clearWorkoutHistory } from '../utils/storage';
import { WorkoutHistoryEntry } from '../types';
import { storageService } from "../services/StorageService";
import { useDebugMode } from '../contexts/DebugContext';

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
    setShowHistory,
    setShowAchievements,
    setShowStorage,
    setShowLevels,
    setAchievementModalData,
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
    const history = storageService.getWorkoutHistory();
    setWorkoutHistory(history);
    // Don't close the modal and don't show notification here (WorkoutHistory component will handle it)
  }, [setWorkoutHistory]);

  // Achievements Modal
  const showAchievementsModal = useCallback(() => {
    setShowAchievements(true);
  }, [setShowAchievements]);

  const hideAchievementsModal = useCallback(() => {
    setShowAchievements(false);
  }, [setShowAchievements]);

  const showAchievementUnlockedModal = useCallback(
    (achievementId: string, title: string, description: string, icon: string, rarity: string, category: string) => {
      setAchievementModalData({
        isOpen: true,
        achievementId,
        title,
        description,
        icon,
        rarity,
        category,
      });
    },
    [setAchievementModalData]
  );

  // Storage Modal
  const showStorageModal = useCallback(() => {
    setShowStorage(true);
  }, [setShowStorage]);

  const hideStorageModal = useCallback(() => {
    setShowStorage(false);
  }, [setShowStorage]);

  const handleStorageClearSuccess = useCallback(() => {
    setShowStorage(false);

    // Clear and refresh all storage-related states
    achievementProcessor.resetAchievements();
    experienceProcessor.resetExperience();
    refreshWorkoutFromStorage();

    // Refresh audio settings
    audioManager.refreshFromStorage();

    // Force level display refresh
    incrementStorageRefreshKey();

    // Force debug mode to false
    setDebugMode(false);

    // Dispatch custom event for components to refresh
    window.dispatchEvent(new Event('storageRefresh'));

    showSuccess('Storage Cleared', 'All your data have been cleared.');
  }, [refreshWorkoutFromStorage, incrementStorageRefreshKey, showSuccess, setDebugMode, setShowStorage]);

  const handleStorageExportSuccess = useCallback(() => {
    showSuccess('Export Successful', 'Your backup has been downloaded successfully.');
  }, [showSuccess]);

  const handleStorageImportSuccess = useCallback(() => {
    setShowStorage(false);

    // Refresh all storage-dependent states
    achievementProcessor.refreshFromStorage();
    experienceProcessor.refreshFromStorage();
    refreshWorkoutFromStorage();

    // Refresh audio settings
    audioManager.refreshFromStorage();

    // Force level display refresh
    incrementStorageRefreshKey();

    // Dispatch custom event for components to refresh
    window.dispatchEvent(new Event('storageRefresh'));

    showSuccess('Import Successful', 'Your backup has been restored successfully.');
  }, [setShowStorage, refreshWorkoutFromStorage, incrementStorageRefreshKey, showSuccess]);

  const handleStorageImportError = useCallback((error: string) => {
    showError('Import Failed', error);
  }, [showError]);

  const handleStorageExportError = useCallback((error: string) => {
    showError('Export Failed', error);
  }, [showError]);

  // Levels Modal
  const showLevelsModal = useCallback(() => {
    setShowLevels(true);
  }, [setShowLevels]);

  const hideLevelsModal = useCallback(() => {
    setShowLevels(false);
  }, [setShowLevels]);

  return {
    // Modal states
    showHistory,
    showAchievements,
    showStorage,
    showLevels,

    // History modal actions
    showWorkoutHistory,
    hideWorkoutHistory,
    handleClearHistory,

    // Achievements modal actions
    showAchievementsModal,
    hideAchievementsModal,
    showAchievementUnlockedModal,

    // Storage modal actions
    showStorageModal,
    hideStorageModal,
    handleStorageClearSuccess,
    handleStorageExportSuccess,
    handleStorageImportSuccess,
    handleStorageImportError,
    handleStorageExportError,

    // Levels modal actions
    showLevelsModal,
    hideLevelsModal,
  };
};