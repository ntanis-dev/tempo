import React from 'react';
import { WorkoutHistory } from '../components/history/WorkoutHistory';
import { AchievementsModal } from '../components/achievements/AchievementsModal';
import { StorageModal } from '../components/StorageModal';
import { ExperienceModal } from '../components/levels/ExperienceModal';
import { PWAInstallModal } from '../components/setup/PWAInstallModal';
import { AchievementProgressModal } from '../components/achievements/AchievementProgressModal';
import { useUIStore } from '../store/uiStore';
import { WorkoutHistoryEntry } from '../types';
import { clearWorkoutHistory } from '../utils/storage';
import { achievementProcessor } from '../utils/achievementProcessor';
import { experienceProcessor } from '../utils/experienceProcessor';
import { audioManager } from '../utils/audio';
import { storageService } from "../services/StorageService";

interface ModalContainerProps {
  workoutHistory: WorkoutHistoryEntry[];
  setWorkoutHistory: React.Dispatch<React.SetStateAction<WorkoutHistoryEntry[]>>;
  refreshWorkoutFromStorage: () => void;
}

export const ModalContainer: React.FC<ModalContainerProps> = React.memo(({
  workoutHistory,
  setWorkoutHistory,
  refreshWorkoutFromStorage
}) => {
  const {
    showHistory,
    showAchievements,
    showStorage,
    showLevels,
    achievementModalData,
    setShowHistory,
    setShowAchievements,
    setShowStorage,
    setShowLevels,
    setAchievementModalData,
    showSuccess,
    showError,
    incrementStorageRefreshKey
  } = useUIStore();

  const handleStorageExportSuccess = () => {
    setShowStorage(false);
    showSuccess('Export Successful', 'Your backup file has been downloaded successfully.');
  };

  const handleStorageClearSuccess = () => {
    // Refresh all storage-dependent states
    achievementProcessor.resetAchievements();
    experienceProcessor.resetExperience();
    refreshWorkoutFromStorage();
    audioManager.refreshFromStorage();
    incrementStorageRefreshKey();
    showSuccess('Storage Cleared', 'All your data have been cleared.');
  };

  const handleStorageImportSuccess = () => {
    setShowStorage(false);
    achievementProcessor.refreshFromStorage();
    experienceProcessor.refreshFromStorage();
    refreshWorkoutFromStorage();
    audioManager.refreshFromStorage();
    incrementStorageRefreshKey();
    showSuccess('Import Successful', 'Your backup has been restored successfully.');
  };

  const handleStorageError = (error: string) => {
    showError('Import Failed', error);
  };

  const handleClearHistory = () => {
    clearWorkoutHistory();
    setWorkoutHistory([]);
  };

  const handleCloseAchievementModal = () => {
    setAchievementModalData(null);
    storageService.clearAchievementModalData();
  };

  return (
    <>
      {showHistory && (
        <WorkoutHistory
          history={workoutHistory}
          onClose={() => setShowHistory(false)}
          onClearHistory={handleClearHistory}
          onShowSuccess={showSuccess}
        />
      )}

      {showAchievements && (
        <AchievementsModal
          isOpen={showAchievements}
          onClose={() => setShowAchievements(false)}
          onShowSuccess={showSuccess}
        />
      )}

      {showStorage && (
        <StorageModal
          isOpen={showStorage}
          onClose={() => setShowStorage(false)}
          onShowSuccess={handleStorageExportSuccess}
          onClearSuccess={handleStorageClearSuccess}
          onShowError={handleStorageError}
          onImportSuccess={handleStorageImportSuccess}
        />
      )}

      {showLevels && (
        <ExperienceModal
          isOpen={showLevels}
          onClose={() => setShowLevels(false)}
          onShowSuccess={showSuccess}
        />
      )}

      <PWAInstallModal />

      {achievementModalData && (
        <AchievementProgressModal
          isOpen={true}
          achievements={achievementModalData.unlockedAchievements}
          progressAchievements={achievementModalData.progressAchievements}
          workoutData={achievementModalData.workoutData}
          onClose={handleCloseAchievementModal}
        />
      )}
    </>
  );
});