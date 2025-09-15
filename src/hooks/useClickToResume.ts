import { useEffect } from 'react';
import { WorkoutState } from '../types';

export const useClickToResume = (
  workout: WorkoutState,
  onResume: () => void
) => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't resume if clicking on a button or any element inside a button
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        return;
      }
      
      if (workout.isPaused && workout.phase !== 'setup' && workout.phase !== 'complete') {
        onResume();
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [workout.isPaused, workout.phase, onResume]);
};