import React, { useEffect, useCallback } from 'react';
import { WorkoutState } from '../types';
import { useUIStore } from '../store/uiStore';
import { achievementProcessor } from '../utils/achievementProcessor';
import { experienceProcessor } from '../utils/experienceProcessor';
import { audioManager } from '../utils/audio';
import { storageService } from "../services/StorageService";

interface AchievementContainerProps {
  workout: WorkoutState;
  isSetupPhase: boolean;
}

// Remove this constant as we now use StorageService methods

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
      storageService.saveAchievementModalData(modalData);
    }

    // Force refresh of level displays after XP processing
    incrementStorageRefreshKey();
  }, [workout, incrementStorageRefreshKey]);

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
    if (!isSetupPhase) return;

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
  }, [achievementModalData, isSetupPhase, setAchievementModalData]);


  // Handle showing achievements after workout reset
  const checkForPendingAchievements = (): boolean => {
    const savedModalData = storageService.getAchievementModalData();
    if (!savedModalData) return false;

    return (savedModalData.unlockedAchievements?.length > 0 || savedModalData.progressAchievements?.length > 0);
  };

  // Public method to handle reset with achievements
  React.useImperativeHandle(
    React.useRef(null),
    () => ({
      handleResetWithAchievements: () => {
        const hasAchievements = checkForPendingAchievements();
        setWaitingForAchievements(hasAchievements);

        if (hasAchievements) {
          const savedModalData = storageService.getAchievementModalData();
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
        }
      }
    }),
    [setAchievementModalData, setWaitingForAchievements]
  );

  return null; // This is a logic-only container
});