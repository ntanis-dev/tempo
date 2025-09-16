import React from 'react';
import { setUpdateCallback, refreshApp } from '../main';
import { WorkoutHistoryEntry } from '../types';
import { clearWorkoutHistory } from '../utils/storage';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { useClickToResume } from '../hooks/useClickToResume';
import { useNotifications } from '../hooks/useNotifications';
import { useUIStore } from '../store/uiStore';
import { audioManager } from '../utils/audio';
import { achievementProcessor } from '../utils/achievementProcessor';
import { experienceProcessor } from '../utils/experienceProcessor';
import { whatsNewTracker } from '../utils/whatsNewTracker';
import { getBackgroundClass } from '../utils/backgroundClasses';
import { SetupScreen } from './SetupScreen';
import { PrepareScreen } from './PrepareScreen';
import { CompleteScreen } from './CompleteScreen';
import { WorkoutScreen } from './WorkoutScreen';
import { WorkoutHistory } from './history/WorkoutHistory';
import { AchievementsModal } from './achievements/AchievementsModal';
import { AchievementProgressModal } from './achievements/AchievementProgressModal';
import { StorageModal } from './StorageModal';
import { PauseOverlay } from './workout/PauseOverlay';
import { PWAInstallModal } from './setup/PWAInstallModal';
import { ExperienceModal } from './levels/ExperienceModal';
import { WhatsNewModal } from './whats-new/WhatsNewModal';
import { NotificationSystem } from './ui/NotificationSystem';
import { UpdateBar } from './ui/UpdateBar';

const ACHIEVEMENT_MODAL_DATA_KEY = 'tempo-achievement-modal-data';

export const WorkoutAppContent: React.FC = () => {
  const {
    workout,
    isTransitioning,
    isResetting,
    workoutHistory,
    setWorkoutHistory,
    startWorkout,
    continueToStretch,
    togglePause,
    skipPhase,
    resetWorkout,
    adjustSets,
    adjustTime,
    refreshFromStorage: refreshWorkoutFromStorage
  } = useWorkoutTimer();

  const {
    notifications,
    dismissNotification,
    showError,
    showSuccess
  } = useNotifications();

  // Get all UI state from Zustand store
  const {
    showHistory,
    showAchievements,
    showStorage,
    showLevels,
    showWhatsNew,
    showUpdateButton,
    waitingForAchievements,
    achievementModalData,
    whatsNewKey,
    storageRefreshKey,
    setShowHistory,
    setShowAchievements,
    setShowStorage,
    setShowLevels,
    setShowWhatsNew,
    setShowUpdateButton,
    setWaitingForAchievements,
    setAchievementModalData,
    incrementWhatsNewKey,
    incrementStorageRefreshKey
  } = useUIStore();

  // Process achievements when workout completes
  React.useEffect(() => {
    if (workout.phase === 'complete' && workout.statistics.workoutStartTime) {
      const workoutId = workout.statistics.workoutStartTime?.toString();
      const lastProcessedWorkout = localStorage.getItem('tempo-last-processed-workout');

      if (lastProcessedWorkout !== workoutId) {
        processWorkoutAchievements();
        localStorage.setItem('tempo-last-processed-workout', workoutId);
      }
    }
  }, [workout.phase, workout.statistics.workoutStartTime]);

  // Check for pending achievement modal data on app load/refresh
  React.useEffect(() => {
    // Only show achievements modal when on setup screen
    if (workout.phase !== 'setup') return;

    const savedModalData = localStorage.getItem(ACHIEVEMENT_MODAL_DATA_KEY);
    if (savedModalData && !achievementModalData) {
      try {
        const modalData = JSON.parse(savedModalData);
        if (modalData.unlockedAchievements?.length > 0 || modalData.progressAchievements?.length > 0) {
          setAchievementModalData(modalData);

          // Play sound once if there are unlocked achievements
          if (modalData.unlockedAchievements?.length > 0) {
            audioManager.playAchievementUnlock();
          }
        }
      } catch (error) {
        console.error('Failed to parse saved achievement modal data:', error);
        localStorage.removeItem(ACHIEVEMENT_MODAL_DATA_KEY);
      }
    }
  }, [achievementModalData, workout.phase, setAchievementModalData]);

  const processWorkoutAchievements = () => {
    // Process XP gains (no UI notification)
    experienceProcessor.processWorkoutCompletion(workout);

    // Process achievements (this will unlock some and update progress)
    const { updates, modalData } = achievementProcessor.processWorkoutCompletion(workout);

    // Award XP for achievement unlocks
    updates
      .filter(({ wasJustUnlocked }) => wasJustUnlocked)
      .forEach(() => experienceProcessor.processAchievementUnlock());

    // Store modal data for later display
    if (modalData) {
      localStorage.setItem(ACHIEVEMENT_MODAL_DATA_KEY, JSON.stringify(modalData));
    }

    // Force refresh of level displays after XP processing
    incrementStorageRefreshKey();
  };

  // Handle click to resume when paused
  useClickToResume(workout, togglePause);

  // Set up update callback
  React.useEffect(() => {
    setUpdateCallback(() => {
      setShowUpdateButton(true);
    });
  }, [setShowUpdateButton]);

  const showWorkoutHistory = () => {
    setShowHistory(true);
  };

  const hideWorkoutHistory = () => {
    setShowHistory(false);
  };

  const showAchievementsModal = () => {
    // Pre-load achievements before showing modal to prevent layout shift
    const achievements = achievementProcessor.getAchievements();
    // Small delay to ensure achievements are processed
    setTimeout(() => {
      setShowAchievements(true);
    }, 50);
  };

  const hideAchievementsModal = () => {
    setShowAchievements(false);
  };

  const showStorageModal = () => {
    setShowStorage(true);
  };

  const hideStorageModal = () => {
    setShowStorage(false);
  };

  const showLevelsModal = () => {
    setShowLevels(true);
  };

  const hideLevelsModal = () => {
    setShowLevels(false);
  };

  const showWhatsNewModal = () => {
    setShowWhatsNew(true);
  };

  const hideWhatsNewModal = () => {
    setShowWhatsNew(false);
  };

  const handleWhatsNewRead = () => {
    whatsNewTracker.markAsRead();
    // Force menu re-render by updating the key
    incrementWhatsNewKey();
  };

  const handleStorageExportSuccess = () => {
    setShowStorage(false);
    showSuccess('Export Successful', 'Your backup file has been downloaded successfully.');
  };

  const handleStorageClearSuccess = () => {
    // Refresh all storage-dependent states
    achievementProcessor.resetAchievements();
    experienceProcessor.resetExperience();
    refreshWorkoutFromStorage();

    // Refresh audio settings
    audioManager.refreshFromStorage();

    // Force menu re-render to show red indicator (storage clear removes the read status)
    incrementWhatsNewKey();

    // Refresh the whats new tracker to detect the change
    whatsNewTracker.refreshFromStorage();

    // Force level display refresh
    incrementStorageRefreshKey();

    showSuccess('Storage Cleared', 'All your data have been cleared.');
  };

  const handleStorageImportSuccess = () => {
    setShowStorage(false);
    // Refresh all storage-dependent states
    achievementProcessor.refreshFromStorage();
    experienceProcessor.refreshFromStorage();
    refreshWorkoutFromStorage();

    // Refresh audio settings
    audioManager.refreshFromStorage();

    // Force menu re-render (import might restore read status)
    incrementWhatsNewKey();

    // Force level display refresh
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

  const handleResetWorkout = () => {
    // Check if there are achievements to show BEFORE resetting
    const savedModalData = localStorage.getItem(ACHIEVEMENT_MODAL_DATA_KEY);
    const hasAchievements = savedModalData ? (() => {
      try {
        const modalData = JSON.parse(savedModalData);
        return (modalData.unlockedAchievements?.length > 0 || modalData.progressAchievements?.length > 0);
      } catch {
        return false;
      }
    })() : false;

    // Set waiting state if achievements will show
    setWaitingForAchievements(hasAchievements);

    // Reset the workout first
    resetWorkout();

    // Check if there are achievements to show

    if (savedModalData) {
      try {
        const modalData = JSON.parse(savedModalData);

        // Show modal after a short delay to let reset animation complete
        setTimeout(() => {
          setAchievementModalData(modalData);

          // Play sound once if there are unlocked achievements
          if (modalData.unlockedAchievements?.length > 0) {
            audioManager.playAchievementUnlock();
          }
        }, 750);
      } catch (error) {
        console.error('Failed to parse achievement modal data:', error);
        setWaitingForAchievements(false);
      }
    }
  };

  const handleCloseAchievementModal = () => {
    setAchievementModalData(null);
    setWaitingForAchievements(false);
    localStorage.removeItem(ACHIEVEMENT_MODAL_DATA_KEY);
  };

  const handleRestSkipAttempt = () => {
    // Process rest skip attempt for achievements
    // Just track the attempt - will be processed at workout completion
    achievementProcessor.processRestSkipAttempt();
  };

  return (
    <div
      id="main-container"
      className={`min-h-screen ${getBackgroundClass(workout, isResetting, isTransitioning)}`}
    >
      {/* Pause overlay outside the scaled container */}
      <PauseOverlay isVisible={workout.isPaused && !isResetting && (workout.phase === 'countdown' || workout.phase === 'work' || workout.phase === 'rest')} />

      {/* Modals outside the scaled container */}
      {showHistory && (
        <WorkoutHistory
          history={workoutHistory}
          onClose={hideWorkoutHistory}
          onClearHistory={handleClearHistory}
          onShowSuccess={showSuccess}
        />
      )}

      {/* Achievements Modal outside the scaled container */}
      {showAchievements && (
        <AchievementsModal
          isOpen={showAchievements}
          onClose={hideAchievementsModal}
          onShowSuccess={showSuccess}
        />
      )}

      {/* Storage Modal outside the scaled container */}
      {showStorage && (
        <StorageModal
          isOpen={showStorage}
          onClose={hideStorageModal}
          onShowSuccess={handleStorageExportSuccess}
          onClearSuccess={handleStorageClearSuccess}
          onShowError={handleStorageError}
          onImportSuccess={handleStorageImportSuccess}
        />
      )}

      {/* Levels Modal outside the scaled container */}
      {showLevels && (
        <ExperienceModal
          isOpen={showLevels}
          onClose={hideLevelsModal}
          onShowSuccess={showSuccess}
        />
      )}

      {/* What's New Modal outside the scaled container */}
      {showWhatsNew && (
        <WhatsNewModal
          isOpen={showWhatsNew}
          onClose={hideWhatsNewModal}
          onMarkAsRead={handleWhatsNewRead}
        />
      )}

      {/* PWA Install Modal outside scaled container */}
      <PWAInstallModal />

      {/* Update Bar */}
      <UpdateBar
        isVisible={showUpdateButton}
        onRefresh={refreshApp}
      />

      {/* Achievement Progress Modal */}
      {achievementModalData && (
        <AchievementProgressModal
          isOpen={true}
          achievements={achievementModalData.unlockedAchievements}
          progressAchievements={achievementModalData.progressAchievements}
          workoutData={achievementModalData.workoutData}
          onClose={handleCloseAchievementModal}
        />
      )}

      <div id="app-container" className={'relative'}>
        {(workout.phase === 'setup' || workout.phase === 'transition') && (
          <SetupScreen
            workout={workout}
            onAdjustSets={adjustSets}
            onAdjustTime={adjustTime}
            onStartWorkout={startWorkout}
            onShowHistory={showWorkoutHistory}
            onShowAchievements={showAchievementsModal}
            onShowStorage={showStorageModal}
            onShowLevels={showLevelsModal}
            onShowWhatsNew={showWhatsNewModal}
            onShowSuccess={showSuccess}
            isTransitioning={isTransitioning}
            isResetting={isResetting}
            waitingForAchievements={waitingForAchievements}
            menuKey={whatsNewKey}
            storageRefreshKey={storageRefreshKey}
          />
        )}

        {workout.phase === 'prepare' && (
          <PrepareScreen
            workout={workout}
            onContinue={continueToStretch}
            onResetWorkout={resetWorkout}
            isResetting={isResetting}
            isTransitioning={isTransitioning}
          />
        )}

        {workout.phase === 'complete' && (
          <CompleteScreen
            workout={workout}
            onResetWorkout={handleResetWorkout}
            isResetting={isResetting}
            onShowSuccess={showSuccess}
            onShowError={showError}
            storageRefreshKey={storageRefreshKey}
          />
        )}

        {(workout.phase === 'countdown' || workout.phase === 'work' || workout.phase === 'rest') && (
          <WorkoutScreen
            workout={workout}
            onTogglePause={togglePause}
            onResetWorkout={handleResetWorkout}
            onSkip={skipPhase}
            isResetting={isResetting}
            onShowRestSkipError={handleRestSkipAttempt}
          />
        )}

      </div>

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
};