import { WorkoutState } from '../types';
import { TIME } from '../constants';

export const getBackgroundClass = (
  workout: WorkoutState,
  isResetting: boolean,
  isTransitioning: boolean,
  isMuted: boolean = false
): string => {
  const suffix = isMuted ? '-muted' : '';

  if (isResetting) {
    return `background-resetting${suffix}`;
  }
  if (isTransitioning && workout.phase === 'setup') {
    return `background-transitioning${suffix}`;
  }
  if (isTransitioning && workout.phase === 'prepare') {
    return `background-countdown${suffix}`; // Background changes immediately even though phase is still 'prepare'
  }
  if (workout.phase === 'prepare') {
    return `background-prepare${suffix}`;
  }
  if (workout.phase === 'countdown') {
    if (workout.timeRemaining <= TIME.PREPARE_THRESHOLD) {
      return `background-countdown-prepare${suffix}`;
    }
  }
  if (workout.phase === 'rest') {
    if (workout.timeRemaining <= TIME.PREPARE_THRESHOLD) {
      return `background-rest-prepare${suffix}`;
    }
  }
  return `background-${workout.phase}${suffix}`;
};