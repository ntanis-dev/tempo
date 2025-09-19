import { AchievementDefinition } from './first-workout';

export const specialAchievements: AchievementDefinition[] = [
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a workout with 1 second per rep.',
    icon: '🏃‍♂️',
    category: 'special',
    rarity: 'rare',
    
    checkUnlock: (workout) => workout.settings.timePerRep === 1,
    hasSessionProgress: () => true,
    getSessionProgress: () => '+ Speed workout completed'
  },
  
  {
    id: 'lightning_fast',
    title: 'Zen Master',
    description: 'Complete a workout with 10 seconds per rep.',
    icon: '🧘‍♂️',
    category: 'special',
    rarity: 'epic',
    
    checkUnlock: (workout) => workout.settings.timePerRep === 10,
    hasSessionProgress: () => true,
    getSessionProgress: () => '+ Zen workout completed'
  },
  
  {
    id: 'minimalist',
    title: 'Minimalist',
    description: 'Complete a workout with only 1 set.',
    icon: '1️⃣',
    category: 'special',
    rarity: 'common',
    
    checkUnlock: (workout) => workout.totalSets === 1,
    hasSessionProgress: () => true,
    getSessionProgress: () => '+ Minimal workout completed'
  },
  
  {
    id: 'maximalist',
    title: 'Maximalist',
    description: 'Complete a workout with 25+ sets.',
    icon: '🔥',
    category: 'special',
    rarity: 'epic',
    
    checkUnlock: (workout) => workout.totalSets >= 25,
    hasSessionProgress: () => true,
    getSessionProgress: () => '+ Maximum workout completed'
  },
  
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a workout before 7 AM.',
    icon: '🐦',
    category: 'special',
    rarity: 'rare',
    
    checkUnlock: (workout) => {
      const hour = new Date(workout.statistics.workoutStartTime || Date.now()).getHours();
      return hour < 7;
    },

    hasSessionProgress: () => true,
    getSessionProgress: () => '+ Early morning workout'
  },
  
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a workout after 10 PM.',
    icon: '🌙',
    category: 'special',
    rarity: 'rare',
    
    checkUnlock: (workout) => {
      const hour = new Date(workout.statistics.workoutStartTime || Date.now()).getHours();
      return hour >= 22;
    },

    hasSessionProgress: () => true,
    getSessionProgress: () => '+ Late night workout'
  },
  
  {
    id: 'rest_skipper',
    title: 'Impatient',
    description: 'Someone clearly doesn\'t believe in the power of recovery! 😤',
    icon: '⏭️',
    category: 'special',
    rarity: 'common',

    checkUnlock: () => false, // Only unlocked via rest skip attempts in processWorkoutCompletion
    hasSessionProgress: () => false, // No session progress shown
    getSessionProgress: () => '+ Rest skip detected'
  }
];