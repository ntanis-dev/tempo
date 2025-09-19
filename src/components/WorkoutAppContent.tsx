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
const WhatsNewModal = React.lazy(() => import('./whats-new/WhatsNewModal').then(module => ({ default: module.WhatsNewModal })));

// No loading fallback - modals load instantly
const ModalLoadingFallback = () => null;

export const WorkoutAppContent: React.FC = () => {
  // Muted mode state for re-rendering backgrounds
  const [mutedMode, setMutedMode] = React.useState(false);

  // Listen for muted mode changes
  React.useEffect(() => {
    const handleMutedModeChange = (event: CustomEvent) => {
      setMutedMode(event.detail);
    };

    window.addEventListener('mutedModeChanged' as any, handleMutedModeChange);
    return () => {
      window.removeEventListener('mutedModeChanged' as any, handleMutedModeChange);
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
            onShowSuccess={modalHandlers.handleStorageExportSuccess}
            onClearSuccess={modalHandlers.handleStorageClearSuccess}
            onShowError={modalHandlers.handleStorageError}
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

      {modalHandlers.showWhatsNew && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <WhatsNewModal
            isOpen={modalHandlers.showWhatsNew}
            onClose={modalHandlers.hideWhatsNewModal}
            onMarkAsRead={modalHandlers.handleWhatsNewRead}
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