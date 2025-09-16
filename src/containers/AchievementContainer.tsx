import React, { useEffect, useCallback } from 'react';
import { WorkoutState } from '../types';
import { useUIStore } from '../store/uiStore';
import { achievementProcessor } from '../utils/achievementProcessor';
import { experienceProcessor } from '../utils/experienceProcessor';
import { audioManager } from '../utils/audio';

interface AchievementContainerProps {
  workout: WorkoutState;
  isSetupPhase: boolean;
}

const ACHIEVEMENT_MODAL_DATA_KEY = 'tempo-achievement-modal-data';

export const AchievementContainer: React.FC<AchievementContainerProps> = React.memo(({
  workout,
  isSetupPhase
}) => {
  const {
    achievementModalData,
    setAchievementModalData,
    setWaitingForAchievements,
    incrementStorageRefreshKey
  } = useUIStore();

  // Process achievements when workout completes
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

  useEffect(() => {
    if (workout.phase === 'complete' && workout.statistics.workoutStartTime) {
      const workoutId = workout.statistics.workoutStartTime?.toString();
      const lastProcessedWorkout = localStorage.getItem('tempo-last-processed-workout');

      if (lastProcessedWorkout !== workoutId) {
        processWorkoutAchievements();
        localStorage.setItem('tempo-last-processed-workout', workoutId);
      }
    }
  }, [workout.phase, workout.statistics.workoutStartTime, processWorkoutAchievements]);

  // Check for pending achievement modal data on app load/refresh
  useEffect(() => {
    // Only show achievements modal when on setup screen
    if (!isSetupPhase) return;

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
  }, [achievementModalData, isSetupPhase, setAchievementModalData]);


  // Handle showing achievements after workout reset
  const checkForPendingAchievements = (): boolean => {
    const savedModalData = localStorage.getItem(ACHIEVEMENT_MODAL_DATA_KEY);
    if (!savedModalData) return false;

    try {
      const modalData = JSON.parse(savedModalData);
      return (modalData.unlockedAchievements?.length > 0 || modalData.progressAchievements?.length > 0);
    } catch {
      return false;
    }
  };

  // Public method to handle reset with achievements
  React.useImperativeHandle(
    React.useRef(null),
    () => ({
      handleResetWithAchievements: () => {
        const hasAchievements = checkForPendingAchievements();
        setWaitingForAchievements(hasAchievements);

        if (hasAchievements) {
          const savedModalData = localStorage.getItem(ACHIEVEMENT_MODAL_DATA_KEY);
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
        }
      }
    }),
    [setAchievementModalData, setWaitingForAchievements]
  );

  return null; // This is a logic-only container
});