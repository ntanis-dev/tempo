import { AchievementDefinition } from './first-workout';

export const dedicationAchievements: AchievementDefinition[] = [
  {
    id: 'no_pause_workout',
    title: 'Unstoppable',
    description: 'Complete a workout without pausing.',
    icon: '🌪️',
    category: 'dedication',
    rarity: 'rare',
    
    checkUnlock: (workout) => workout.statistics.totalTimePaused === 0,
    hasSessionProgress: () => true,
    getSessionProgress: () => '+ No pause workout'
  },
  
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete 10 workouts without pausing.',
    icon: '💎',
    category: 'dedication',
    rarity: 'epic',
    maxProgress: 10,
    
    checkUnlock: (workout, data) => data.consecutiveNoPauseWorkouts >= 10,
    calculateProgress: (data) => data.consecutiveNoPauseWorkouts,
    hasSessionProgress: () => {
      // Only show progress if this workout had no pauses
      return true; // Will be handled by the processor logic
    },
    getSessionProgress: () => '+ 1 workout without pause'
  }
];