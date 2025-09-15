import { AchievementDefinition } from './first-workout';

export const weeklyStreakAchievements: AchievementDefinition[] = [
  {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Complete at least one workout per week for 12 weeks.',
    icon: '👑',
    category: 'consistency',
    rarity: 'epic',
    maxProgress: 12,
    
    checkUnlock: (workout, data) => data.weeklyStreak >= 12,
    calculateProgress: (data) => data.weeklyStreak,
    hasSessionProgress: (workoutData) => {
      // Show progress if it's the first workout ever OR if it's a consecutive week
      return !workoutData?.lastWorkoutDate || workoutData?.isNewWeek === true;
    },
    getSessionProgress: (workoutData) => {
      if (!workoutData?.lastWorkoutDate) return '+ 1 week'; // First workout ever
      return workoutData?.isNewWeek ? '+ 1 week' : '+ 0 weeks';
    }
  }
];