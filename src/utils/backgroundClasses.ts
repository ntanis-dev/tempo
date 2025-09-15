import { WorkoutState } from '../types';
import { TIME } from '../constants';

export const getBackgroundClass = (
  workout: WorkoutState,
  isResetting: boolean,
  isTransitioning: boolean
): string => {
  if (isResetting) {
    return 'background-resetting';
  }
  if (isTransitioning && workout.phase === 'setup') {
    return 'background-transitioning';
  }
  if (isTransitioning && workout.phase === 'prepare') {
    return 'background-countdown'; // Background changes immediately even though phase is still 'prepare'
  }
  if (workout.phase === 'prepare') {
    return 'background-prepare';
  }
  if (workout.phase === 'countdown') {
    if (workout.timeRemaining <= TIME.PREPARE_THRESHOLD) {
      return 'background-countdown-prepare';
    }
  }
  if (workout.phase === 'rest') {
    if (workout.timeRemaining <= TIME.PREPARE_THRESHOLD) {
      return 'background-rest-prepare';
    }
  }
  return `background-${workout.phase}`;
};