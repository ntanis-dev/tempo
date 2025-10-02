import { useEffect } from 'react';
import { WorkoutState } from '../types';
import { wakeLockManager } from '../utils/wakeLock';

/**
 * Hook to manage wake lock based on workout phase
 * Prevents screen from auto-locking during active workout phases
 */
export const useWakeLock = (workout: WorkoutState) => {
  useEffect(() => {
    // Phases where we want to keep screen on
    const activePhases = ['prepare', 'countdown', 'work', 'rest'];
    const shouldKeepScreenOn = activePhases.includes(workout.phase);

    if (shouldKeepScreenOn) {
      // Request wake lock when entering active phase
      wakeLockManager.requestWakeLock();
    } else {
      // Release wake lock when not in active phase
      wakeLockManager.releaseWakeLock();
    }

    // Cleanup: release wake lock when component unmounts
    return () => {
      wakeLockManager.releaseWakeLock();
    };
  }, [workout.phase]);
};