import { useEffect, useCallback } from 'react';
import { WorkoutState } from '../types';
import { useUIStore } from '../store/uiStore';
import { audioManager } from '../utils/audio';
import { achievementProcessor } from '../utils/achievementProcessor';
import { experienceProcessor } from '../utils/experienceProcessor';
import { storageService } from '../services/storageService';

// Remove this constant as we now use StorageService methods

/**
 * Custom hook to handle achievement processing and modal display
 */
export const useAchievementProcessing = (workout: WorkoutState, resetWorkout: () => void) => {
  const {
    waitingForAchievements,
    achievementModalData,
    setWaitingForAchievements,
    setAchievementModalData,
    incrementStorageRefreshKey,
  } = useUIStore();

  const processWorkoutAchievements = useCallback(() => {
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
      storageService.saveAchievementModalData(modalData);
    }

    // Force refresh of level displays after XP processing
    incrementStorageRefreshKey();
  }, [workout, incrementStorageRefreshKey]);

  // Process achievements when workout completes
  useEffect(() => {
    if (workout.phase === 'complete' && workout.statistics.workoutStartTime) {
      const workoutId = workout.statistics.workoutStartTime?.toString();
      const lastProcessedWorkout = storageService.getLastProcessedWorkout();

      if (lastProcessedWorkout !== workoutId) {
        processWorkoutAchievements();
        storageService.setLastProcessedWorkout(workoutId);
      }
    }
  }, [workout.phase, workout.statistics.workoutStartTime, processWorkoutAchievements]);

  // Check for pending achievement modal data on app load/refresh
  useEffect(() => {
    // Only show achievements modal when on setup screen
    if (workout.phase !== 'setup') return;

    const savedModalData = storageService.getAchievementModalData();
    if (savedModalData && !achievementModalData) {
      if (savedModalData.unlockedAchievements?.length > 0 || savedModalData.progressAchievements?.length > 0) {
        setAchievementModalData(savedModalData);

        // Play sound once if there are unlocked achievements
        if (savedModalData.unlockedAchievements?.length > 0) {
          audioManager.playAchievementUnlock();
        }
      }
    }
  }, [achievementModalData, workout.phase, setAchievementModalData]);

  const handleResetWorkout = useCallback(() => {
    // Check if there are achievements to show BEFORE resetting
    const savedModalData = storageService.getAchievementModalData();
    const hasAchievements = savedModalData ?
      (savedModalData.unlockedAchievements?.length > 0 || savedModalData.progressAchievements?.length > 0) : false;

    // Set waiting state if achievements will show
    setWaitingForAchievements(hasAchievements);

    // Reset the workout first
    resetWorkout();

    // Check if there are achievements to show
    if (savedModalData) {
      // Show modal after a short delay to let reset animation complete
      setTimeout(() => {
        setAchievementModalData(savedModalData);

        // Play sound once if there are unlocked achievements
        if (savedModalData.unlockedAchievements?.length > 0) {
          audioManager.playAchievementUnlock();
        }
      }, 750);
    }
  }, [resetWorkout, setWaitingForAchievements, setAchievementModalData]);

  const handleRestSkipAttempt = useCallback(() => {
    // Process rest skip attempt for achievements
    // Just track the attempt - will be processed at workout completion
    achievementProcessor.processRestSkipAttempt();
  }, []);

  const handleCloseAchievementModal = useCallback(() => {
    setAchievementModalData(null);
    setWaitingForAchievements(false);
    storageService.clearAchievementModalData();
  }, [setAchievementModalData, setWaitingForAchievements]);

  return {
    achievementModalData,
    waitingForAchievements,
    handleResetWorkout,
    handleRestSkipAttempt,
    handleCloseAchievementModal,
  };
};