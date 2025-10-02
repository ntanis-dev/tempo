import { AchievementDefinition } from './first-workout';

export const timeAchievements: AchievementDefinition[] = [
  {
    id: 'total_50_hours',
    title: 'Time Master',
    description: 'Accumulate 50 hours of total workout time (pausing not included).',
    icon: '⏰',
    category: 'endurance',
    rarity: 'epic',
    maxProgress: 180000, // 50 hours in seconds
    
    checkUnlock: (workout, data) => data.cumulativeTimeSeconds >= 180000,
    calculateProgress: (data) => data.cumulativeTimeSeconds,
    hasSessionProgress: (workoutData) => (workoutData?.timeSeconds || 0) > 0,
    getSessionProgress: (workoutData) => {
      if (!workoutData?.timeSeconds || workoutData.timeSeconds === 0) return '+ 0:00';
      const minutes = Math.floor(workoutData.timeSeconds / 60);
      const seconds = workoutData.timeSeconds % 60;
      return `+ ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }
];