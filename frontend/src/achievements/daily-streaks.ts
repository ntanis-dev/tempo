import { AchievementDefinition } from './first-workout';

export const dailyStreakAchievements: AchievementDefinition[] = [
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Complete workouts on 3 different days.',
    icon: '🌱',
    category: 'consistency',
    rarity: 'common',
    maxProgress: 3,
    
    checkUnlock: (workout, data) => data.totalWorkoutDays >= 3,
    calculateProgress: (data) => data.totalWorkoutDays,
    hasSessionProgress: (workoutData) => workoutData?.isNewDay === true,
    getSessionProgress: (workoutData) => workoutData?.isNewDay ? '+ 1 day' : '+ 0 days'
  },
  
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Complete workouts on 7 different days.',
    icon: '🔥',
    category: 'consistency',
    rarity: 'rare',
    maxProgress: 7,
    
    checkUnlock: (workout, data) => data.totalWorkoutDays >= 7,
    calculateProgress: (data) => data.totalWorkoutDays,
    hasSessionProgress: (workoutData) => workoutData?.isNewDay === true,
    getSessionProgress: (workoutData) => workoutData?.isNewDay ? '+ 1 day' : '+ 0 days'
  },
  
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Complete workouts on 30 different days.',
    icon: '💎',
    category: 'consistency',
    rarity: 'epic',
    maxProgress: 30,
    
    checkUnlock: (workout, data) => data.totalWorkoutDays >= 30,
    calculateProgress: (data) => data.totalWorkoutDays,
    hasSessionProgress: (workoutData) => workoutData?.isNewDay === true,
    getSessionProgress: (workoutData) => workoutData?.isNewDay ? '+ 1 day' : '+ 0 days'
  },
  
  {
    id: 'streak_100',
    title: 'Century Champion',
    description: 'Complete workouts on 100 different days.',
    icon: '👑',
    category: 'consistency',
    rarity: 'legendary',
    maxProgress: 100,
    
    checkUnlock: (workout, data) => data.totalWorkoutDays >= 100,
    calculateProgress: (data) => data.totalWorkoutDays,
    hasSessionProgress: (workoutData) => workoutData?.isNewDay === true,
    getSessionProgress: (workoutData) => workoutData?.isNewDay ? '+ 1 day' : '+ 0 days'
  },
  
  {
    id: 'streak_180',
    title: 'Half Year Hero',
    description: 'Complete workouts on 180 different days.',
    icon: '🌟',
    category: 'consistency',
    rarity: 'legendary',
    maxProgress: 180,
    
    checkUnlock: (workout, data) => data.totalWorkoutDays >= 180,
    calculateProgress: (data) => data.totalWorkoutDays,
    hasSessionProgress: (workoutData) => workoutData?.isNewDay === true,
    getSessionProgress: (workoutData) => workoutData?.isNewDay ? '+ 1 day' : '+ 0 days'
  },
  
  {
    id: 'streak_365',
    title: 'Year Warrior',
    description: 'Complete workouts on 365 different days.',
    icon: '🏅',
    category: 'consistency',
    rarity: 'legendary',
    maxProgress: 365,
    
    checkUnlock: (workout, data) => data.totalWorkoutDays >= 365,
    calculateProgress: (data) => data.totalWorkoutDays,
    hasSessionProgress: (workoutData) => workoutData?.isNewDay === true,
    getSessionProgress: (workoutData) => workoutData?.isNewDay ? '+ 1 day' : '+ 0 days'
  }
];