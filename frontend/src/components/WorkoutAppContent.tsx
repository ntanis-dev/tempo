import React, { Suspense } from 'react';
import { setUpdateCallback, refreshApp } from '../services/serviceWorker';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { useClickToResume } from '../hooks/useClickToResume';
import { useNotifications } from '../hooks/useNotifications';
import { useModalManagement } from '../hooks/useModalManagement';
import { useAchievementProcessing } from '../hooks/useAchievementProcessing';
import { useWakeLock } from '../hooks/useWakeLock';
import { useUIStore } from '../store/uiStore';
import { getBackgroundClass } from '../utils/backgroundClasses';
import { storageService } from '../services/StorageService';
import { SetupScreen } from './SetupScreen';
import { PrepareScreen } from './PrepareScreen';
import { CompleteScreen } from './CompleteScreen';
import { WorkoutScreen } from './WorkoutScreen';
import { AchievementProgressModal } from './achievements/AchievementProgressModal';
import { PauseOverlay } from './workout/PauseOverlay';
import { PWAInstallModal } from './setup/PWAInstallModal';
import { NotificationSystem } from './ui/NotificationSystem';
import { UpdateBar } from './ui/UpdateBar';

// Lazy load heavy modal components
const WorkoutHistory = React.lazy(() => import('./history/WorkoutHistory').then(module => ({ default: module.WorkoutHistory })));
const AchievementsModal = React.lazy(() => import('./achievements/AchievementsModal').then(module => ({ default: module.AchievementsModal })));
const StorageModal = React.lazy(() => import('./StorageModal').then(module => ({ default: module.StorageModal })));
const ExperienceModal = React.lazy(() => import('./levels/ExperienceModal').then(module => ({ default: module.ExperienceModal })));
const PrivacyModal = React.lazy(() => import('./privacy/PrivacyModal').then(module => ({ default: module.PrivacyModal })));

// No loading fallback - modals load instantly
const ModalLoadingFallback = () => null;

export const WorkoutAppContent: React.FC = () => {
  // Muted mode state for re-rendering backgrounds - initialize from storage
  const [mutedMode, setMutedMode] = React.useState(() => storageService.isMutedMode());

  // Listen for muted mode changes and storage events
  React.useEffect(() => {
    const handleMutedModeChange = (event: CustomEvent) => {
      setMutedMode(event.detail);
    };

    const handleStorageChange = () => {
      // When storage is cleared or changes, re-read the muted mode
      setMutedMode(storageService.isMutedMode());
    };

    const handleStorageRefresh = () => {
      // When storage is explicitly refreshed (like after clearing)
      setMutedMode(storageService.isMutedMode());
    };

    window.addEventListener('mutedModeChanged' as any, handleMutedModeChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageRefresh' as any, handleStorageRefresh);

    return () => {
      window.removeEventListener('mutedModeChanged' as any, handleMutedModeChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageRefresh' as any, handleStorageRefresh);
    };
  }, []);

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

  // Wake lock to prevent screen auto-lock during workout
  useWakeLock(workout);

  // UI Store state
  const {
    showUpdateButton,
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
      className={`min-h-screen ${getBackgroundClass(workout, isResetting, isTransitioning, mutedMode)}`}
    >
      {/* Pause overlay */}
      <PauseOverlay
        isVisible={workout.isPaused && !isResetting && (
          workout.phase === 'countdown' ||
          workout.phase === 'work' ||
          workout.phase === 'rest'
        )}
      />

      {/* Modals with Suspense */}
      {modalHandlers.showHistory && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <WorkoutHistory
            history={workoutHistory}
            onClose={modalHandlers.hideWorkoutHistory}
            onClearHistory={modalHandlers.handleClearHistory}
            onShowSuccess={showSuccess}
          />
        </Suspense>
      )}

      {modalHandlers.showAchievements && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <AchievementsModal
            isOpen={modalHandlers.showAchievements}
            onClose={modalHandlers.hideAchievementsModal}
            onShowSuccess={showSuccess}
          />
        </Suspense>
      )}

      {modalHandlers.showStorage && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <StorageModal
            isOpen={modalHandlers.showStorage}
            onClose={modalHandlers.hideStorageModal}
            onExportSuccess={modalHandlers.handleStorageExportSuccess}
            onExportError={modalHandlers.handleStorageExportError}
            onClearSuccess={modalHandlers.handleStorageClearSuccess}
            onImportError={modalHandlers.handleStorageImportError}
            onImportSuccess={modalHandlers.handleStorageImportSuccess}
          />
        </Suspense>
      )}

      {modalHandlers.showLevels && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <ExperienceModal
            isOpen={modalHandlers.showLevels}
            onClose={modalHandlers.hideLevelsModal}
            onShowSuccess={showSuccess}
          />
        </Suspense>
      )}

      {modalHandlers.showPrivacy && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <PrivacyModal
            isOpen={modalHandlers.showPrivacy}
            onClose={modalHandlers.hidePrivacyModal}
          />
        </Suspense>
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
            onShowPrivacy={modalHandlers.showPrivacyModal}
            isTransitioning={isTransitioning}
            isResetting={isResetting}
            waitingForAchievements={waitingForAchievements}
            menuKey={storageRefreshKey}
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