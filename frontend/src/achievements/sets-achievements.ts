import { AchievementDefinition } from './first-workout';

export const setsAchievements: AchievementDefinition[] = [
  {
    id: 'total_10_sets',
    title: 'Set Starter',
    description: 'Complete 10 total sets across all workouts.',
    icon: '🎯',
    category: 'endurance',
    rarity: 'common',
    maxProgress: 10,
    
    checkUnlock: (workout, data) => data.cumulativeSets >= 10,
    calculateProgress: (data) => data.cumulativeSets,
    hasSessionProgress: (workoutData) => (workoutData?.sets || 0) > 0,
    getSessionProgress: (workoutData) => `+ ${workoutData?.sets || 0} ${(workoutData?.sets || 0) === 1 ? 'set' : 'sets'}`
  },
  
  {
    id: 'total_100_sets',
    title: 'Set Crusher',
    description: 'Complete 100 total sets across all workouts.',
    icon: '💪',
    category: 'endurance',
    rarity: 'rare',
    maxProgress: 100,
    
    checkUnlock: (workout, data) => data.cumulativeSets >= 100,
    calculateProgress: (data) => data.cumulativeSets,
    hasSessionProgress: (workoutData) => (workoutData?.sets || 0) > 0,
    getSessionProgress: (workoutData) => `+ ${workoutData?.sets || 0} ${(workoutData?.sets || 0) === 1 ? 'set' : 'sets'}`
  },
  
  {
    id: 'total_500_sets',
    title: 'Set Destroyer',
    description: 'Complete 500 total sets across all workouts.',
    icon: '🔨',
    category: 'endurance',
    rarity: 'epic',
    maxProgress: 500,
    
    checkUnlock: (workout, data) => data.cumulativeSets >= 500,
    calculateProgress: (data) => data.cumulativeSets,
    hasSessionProgress: (workoutData) => (workoutData?.sets || 0) > 0,
    getSessionProgress: (workoutData) => `+ ${workoutData?.sets || 0} ${(workoutData?.sets || 0) === 1 ? 'set' : 'sets'}`
  },
  
  {
    id: 'total_1000_sets',
    title: 'Set Master',
    description: 'Complete 1,000 total sets across all workouts.',
    icon: '⚔️',
    category: 'endurance',
    rarity: 'legendary',
    maxProgress: 1000,
    
    checkUnlock: (workout, data) => data.cumulativeSets >= 1000,
    calculateProgress: (data) => data.cumulativeSets,
    hasSessionProgress: (workoutData) => (workoutData?.sets || 0) > 0,
    getSessionProgress: (workoutData) => `+ ${workoutData?.sets || 0} ${(workoutData?.sets || 0) === 1 ? 'set' : 'sets'}`
  }
];