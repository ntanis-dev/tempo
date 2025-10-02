// Single source of truth for workout calculations
import { WorkoutState } from '../types';

// Set completion logic
export const getCompletedSets = (workout: WorkoutState): number => {
  if (workout.phase === 'countdown' || workout.phase === 'prepare') {
    return 0; // No sets completed yet
  } else if (workout.phase === 'work') {
    // Show sets completed before the current one
    return workout.currentSet - 1;
  } else if (workout.phase === 'rest') {
    // During rest, we just completed currentSet so show it as complete
    return workout.currentSet;
  } else if (workout.phase === 'complete') {
    return workout.totalSets; // All sets completed
  }
  return 0;
};

// Progress calculations
export const calculateWorkoutProgress = (workout: WorkoutState): number => {
  const completedSets = getCompletedSets(workout);
  return (completedSets / workout.totalSets) * 100;
};

// Remaining time calculations
export const calculateRemainingTime = (workout: WorkoutState): number => {
  let remainingTime = 0;

  if (workout.phase === 'prepare') {
    // Prepare phase doesn't have a timer - just show total workout time
    remainingTime = workout.settings.stretchTime +
      (workout.totalSets * workout.settings.timePerRep * workout.settings.repsPerSet) +
      ((workout.totalSets - 1) * workout.settings.restTime);
  } else if (workout.phase === 'countdown') {
    // Current countdown time + all work time + rest time between sets
    remainingTime = workout.timeRemaining +
      (workout.totalSets * workout.settings.timePerRep * workout.settings.repsPerSet) +
      ((workout.totalSets - 1) * workout.settings.restTime);
  } else if (workout.phase === 'work') {
    // Current work time + remaining sets work time + rest time
    const remainingSets = workout.totalSets - workout.currentSet;
    remainingTime = workout.timeRemaining + 
      (remainingSets * workout.settings.timePerRep * workout.settings.repsPerSet) +
      (remainingSets * workout.settings.restTime);
  } else if (workout.phase === 'rest') {
    // After completing currentSet, resting before next set
    // Remaining sets = totalSets - currentSet (sets left to do)
    const remainingSets = workout.totalSets - workout.currentSet;
    remainingTime = workout.timeRemaining +
      (remainingSets * workout.settings.timePerRep * workout.settings.repsPerSet) +
      ((remainingSets - 1) * workout.settings.restTime); // One less rest than remaining sets
  }
  
  return Math.max(0, remainingTime);
};

// Rep calculation during work phase
export const getCurrentRep = (workout: WorkoutState): number => {
  if (workout.phase !== 'work') return 1;
  
  const totalWorkTime = workout.settings.timePerRep * workout.settings.repsPerSet;
  const elapsedTime = totalWorkTime - workout.timeRemaining;
  return Math.min(Math.floor(elapsedTime / workout.settings.timePerRep) + 1, workout.settings.repsPerSet);
};