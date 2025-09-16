import { useEffect, useCallback } from 'react';
import { WorkoutState } from '../types';
import { useUIStore } from '../store/uiStore';
import { audioManager } from '../utils/audio';
import { achievementProcessor } from '../utils/achievementProcessor';
import { experienceProcessor } from '../utils/experienceProcessor';

const ACHIEVEMENT_MODAL_DATA_KEY = 'tempo-achievement-modal-data';

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

  // Process achievements when workout completes
  useEffect(() => {
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
  useEffect(() => {
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
      localStorage.setItem(ACHIEVEMENT_MODAL_DATA_KEY, JSON.stringify(modalData));
    }

    // Force refresh of level displays after XP processing
    incrementStorageRefreshKey();
  }, [workout, incrementStorageRefreshKey]);

  const handleResetWorkout = useCallback(() => {
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
  }, [resetWorkout, setWaitingForAchievements, setAchievementModalData]);

  const handleRestSkipAttempt = useCallback(() => {
    // Process rest skip attempt for achievements
    // Just track the attempt - will be processed at workout completion
    achievementProcessor.processRestSkipAttempt();
  }, []);

  const handleCloseAchievementModal = useCallback(() => {
    setAchievementModalData(null);
    setWaitingForAchievements(false);
    localStorage.removeItem(ACHIEVEMENT_MODAL_DATA_KEY);
  }, [setAchievementModalData, setWaitingForAchievements]);

  return {
    achievementModalData,
    waitingForAchievements,
    handleResetWorkout,
    handleRestSkipAttempt,
    handleCloseAchievementModal,
  };
};