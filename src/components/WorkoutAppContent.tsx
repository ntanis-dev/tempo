import React from 'react';
import { setUpdateCallback, refreshApp } from '../main';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { useClickToResume } from '../hooks/useClickToResume';
import { useNotifications } from '../hooks/useNotifications';
import { useModalManagement } from '../hooks/useModalManagement';
import { useAchievementProcessing } from '../hooks/useAchievementProcessing';
import { useUIStore } from '../store/uiStore';
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

export const WorkoutAppContent: React.FC = () => {
  // Core workout functionality
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

  // Notification system
  const {
    notifications,
    dismissNotification,
    showError,
    showSuccess
  } = useNotifications();

  // Modal management
  const modalHandlers = useModalManagement(
    refreshWorkoutFromStorage,
    setWorkoutHistory,
    showSuccess,
    showError
  );

  // Achievement processing
  const {
    achievementModalData,
    waitingForAchievements,
    handleResetWorkout,
    handleRestSkipAttempt,
    handleCloseAchievementModal,
  } = useAchievementProcessing(workout, resetWorkout);

  // UI Store state
  const {
    showUpdateButton,
    whatsNewKey,
    storageRefreshKey,
    setShowUpdateButton,
  } = useUIStore();

  // Handle click to resume when paused
  useClickToResume(workout, togglePause);

  // Set up update callback
  React.useEffect(() => {
    setUpdateCallback(() => {
      setShowUpdateButton(true);
    });
  }, [setShowUpdateButton]);

  return (
    <div
      id="main-container"
      className={`min-h-screen ${getBackgroundClass(workout, isResetting, isTransitioning)}`}
    >
      {/* Pause overlay */}
      <PauseOverlay
        isVisible={workout.isPaused && !isResetting && (
          workout.phase === 'countdown' ||
          workout.phase === 'work' ||
          workout.phase === 'rest'
        )}
      />

      {/* Modals */}
      {modalHandlers.showHistory && (
        <WorkoutHistory
          history={workoutHistory}
          onClose={modalHandlers.hideWorkoutHistory}
          onClearHistory={modalHandlers.handleClearHistory}
          onShowSuccess={showSuccess}
        />
      )}

      {modalHandlers.showAchievements && (
        <AchievementsModal
          isOpen={modalHandlers.showAchievements}
          onClose={modalHandlers.hideAchievementsModal}
          onShowSuccess={showSuccess}
        />
      )}

      {modalHandlers.showStorage && (
        <StorageModal
          isOpen={modalHandlers.showStorage}
          onClose={modalHandlers.hideStorageModal}
          onShowSuccess={modalHandlers.handleStorageExportSuccess}
          onClearSuccess={modalHandlers.handleStorageClearSuccess}
          onShowError={modalHandlers.handleStorageError}
          onImportSuccess={modalHandlers.handleStorageImportSuccess}
        />
      )}

      {modalHandlers.showLevels && (
        <ExperienceModal
          isOpen={modalHandlers.showLevels}
          onClose={modalHandlers.hideLevelsModal}
          onShowSuccess={showSuccess}
        />
      )}

      {modalHandlers.showWhatsNew && (
        <WhatsNewModal
          isOpen={modalHandlers.showWhatsNew}
          onClose={modalHandlers.hideWhatsNewModal}
          onMarkAsRead={modalHandlers.handleWhatsNewRead}
        />
      )}

      <PWAInstallModal />

      <UpdateBar
        isVisible={showUpdateButton}
        onRefresh={refreshApp}
      />

      {achievementModalData && (
        <AchievementProgressModal
          isOpen={true}
          achievements={achievementModalData.unlockedAchievements}
          progressAchievements={achievementModalData.progressAchievements}
          workoutData={achievementModalData.workoutData}
          onClose={handleCloseAchievementModal}
        />
      )}

      {/* Main app container */}
      <div id="app-container" className="relative">
        {/* Workout screens */}
        {(workout.phase === 'setup' || workout.phase === 'transition') && (
          <SetupScreen
            workout={workout}
            onAdjustSets={adjustSets}
            onAdjustTime={adjustTime}
            onStartWorkout={startWorkout}
            onShowHistory={modalHandlers.showWorkoutHistory}
            onShowAchievements={modalHandlers.showAchievementsModal}
            onShowStorage={modalHandlers.showStorageModal}
            onShowLevels={modalHandlers.showLevelsModal}
            onShowWhatsNew={modalHandlers.showWhatsNewModal}
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