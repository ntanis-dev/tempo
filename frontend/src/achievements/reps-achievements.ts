import { AchievementDefinition } from './first-workout';

export const repsAchievements: AchievementDefinition[] = [
  {
    id: 'total_1000_reps',
    title: 'Rep Machine',
    description: 'Complete 1,000 total reps across all workouts.',
    icon: '⚡',
    category: 'endurance',
    rarity: 'rare',
    maxProgress: 1000,
    
    checkUnlock: (workout, data) => data.cumulativeReps >= 1000,
    calculateProgress: (data) => data.cumulativeReps,
    hasSessionProgress: (workoutData) => (workoutData?.reps || 0) > 0,
    getSessionProgress: (workoutData) => `+ ${workoutData?.reps || 0} ${(workoutData?.reps || 0) === 1 ? 'rep' : 'reps'}`
  },
  
  {
    id: 'total_5000_reps',
    title: 'Rep Legend',
    description: 'Complete 5,000 total reps across all workouts.',
    icon: '⭐',
    category: 'endurance',
    rarity: 'epic',
    maxProgress: 5000,
    
    checkUnlock: (workout, data) => data.cumulativeReps >= 5000,
    calculateProgress: (data) => data.cumulativeReps,
    hasSessionProgress: (workoutData) => (workoutData?.reps || 0) > 0,
    getSessionProgress: (workoutData) => `+ ${workoutData?.reps || 0} ${(workoutData?.reps || 0) === 1 ? 'rep' : 'reps'}`
  },
  
  {
    id: 'total_10000_reps',
    title: 'Rep God',
    description: 'Complete 10,000 total reps across all workouts.',
    icon: '🔥',
    category: 'endurance',
    rarity: 'legendary',
    maxProgress: 10000,
    
    checkUnlock: (workout, data) => data.cumulativeReps >= 10000,
    calculateProgress: (data) => data.cumulativeReps,
    hasSessionProgress: (workoutData) => (workoutData?.reps || 0) > 0,
    getSessionProgress: (workoutData) => `+ ${workoutData?.reps || 0} ${(workoutData?.reps || 0) === 1 ? 'rep' : 'reps'}`
  }
];