import { AchievementDefinition } from './first-workout';

export const milestoneAchievements: AchievementDefinition[] = [
  {
    id: 'workout_30_min',
    title: 'Time Warrior',
    description: 'Complete a workout lasting 30+ minutes.',
    icon: '⏳',
    category: 'milestone',
    rarity: 'rare',
    
    checkUnlock: (workout) => {
      const totalTimeSeconds = workout.statistics.totalTimeStretched +
                             workout.statistics.totalTimeExercised +
                             workout.statistics.totalTimeRested;
      return Math.floor(totalTimeSeconds / 60) >= 30;
    },

    hasSessionProgress: () => true,
    getSessionProgress: (workoutData) => `+ ${Math.floor((workoutData?.timeSeconds || 0) / 60)} min workout`
  },
  
  {
    id: 'workout_45_min',
    title: 'Endurance Champion',
    description: 'Complete a workout lasting 45+ minutes.',
    icon: '🏆',
    category: 'milestone',
    rarity: 'epic',
    
    checkUnlock: (workout) => {
      const totalTimeSeconds = workout.statistics.totalTimeStretched +
                             workout.statistics.totalTimeExercised +
                             workout.statistics.totalTimeRested;
      return Math.floor(totalTimeSeconds / 60) >= 45;
    },

    hasSessionProgress: () => true,
    getSessionProgress: (workoutData) => `+ ${Math.floor((workoutData?.timeSeconds || 0) / 60)} min workout`
  },
  
  {
    id: 'single_30_sets',
    title: 'Endurance Master',
    description: 'Complete 30+ sets in a single workout.',
    icon: '💪',
    category: 'milestone',
    rarity: 'epic',
    
    checkUnlock: (workout) => workout.totalSets >= 30,
    hasSessionProgress: () => true,
    getSessionProgress: (workoutData) => `+ ${workoutData?.sets || 0} sets in one workout`
  }
];