// Single source of truth for workout calculations
import { WorkoutState } from '../types';

// Set completion logic
export const getCompletedSets = (workout: WorkoutState): number => {
  if (workout.phase === 'countdown') {
    return 0; // No sets completed yet
  } else if (workout.phase === 'work') {
    // If it's the final set and timer is 0, count it as complete
    if (workout.currentSet === workout.totalSets && workout.timeRemaining === 0) {
      return workout.currentSet;
    }
    return workout.currentSet - 1; // Current set not complete until work ends
  } else if (workout.phase === 'rest') {
    return workout.currentSet; // Current set's work is complete
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
  
  if (workout.phase === 'countdown') {
    // Current stretch time + all work time + rest time between sets
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
    // Current rest time + remaining sets work time + remaining rest time
    const remainingSets = workout.totalSets - workout.currentSet;
    remainingTime = workout.timeRemaining + 
      (remainingSets * workout.settings.timePerRep * workout.settings.repsPerSet) +
      ((remainingSets - 1) * workout.settings.restTime);
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