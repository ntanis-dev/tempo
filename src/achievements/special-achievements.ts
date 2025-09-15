import { AchievementDefinition } from './first-workout';

export const specialAchievements: AchievementDefinition[] = [
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a workout with 1 second per rep.',
    icon: '🏃‍♂️',
    category: 'special',
    rarity: 'rare',
    
    checkUnlock: (workout, data) => workout.settings.timePerRep === 1,
    hasSessionProgress: (workoutData) => true,
    getSessionProgress: (workoutData) => '+ Speed workout completed'
  },
  
  {
    id: 'lightning_fast',
    title: 'Zen Master',
    description: 'Complete a workout with 10 seconds per rep.',
    icon: '🧘‍♂️',
    category: 'special',
    rarity: 'epic',
    
    checkUnlock: (workout, data) => workout.settings.timePerRep === 10,
    hasSessionProgress: (workoutData) => true,
    getSessionProgress: (workoutData) => '+ Zen workout completed'
  },
  
  {
    id: 'minimalist',
    title: 'Minimalist',
    description: 'Complete a workout with only 1 set.',
    icon: '1️⃣',
    category: 'special',
    rarity: 'common',
    
    checkUnlock: (workout, data) => workout.totalSets === 1,
    hasSessionProgress: (workoutData) => true,
    getSessionProgress: (workoutData) => '+ Minimal workout completed'
  },
  
  {
    id: 'maximalist',
    title: 'Maximalist',
    description: 'Complete a workout with 25+ sets.',
    icon: '🔥',
    category: 'special',
    rarity: 'epic',
    
    checkUnlock: (workout, data) => workout.totalSets >= 25,
    hasSessionProgress: (workoutData) => true,
    getSessionProgress: (workoutData) => '+ Maximum workout completed'
  },
  
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a workout before 7 AM.',
    icon: '🐦',
    category: 'special',
    rarity: 'rare',
    
    checkUnlock: (workout, data) => {
      const hour = new Date(workout.statistics.workoutStartTime || Date.now()).getHours();
      return hour < 7;
    },
    
    hasSessionProgress: (workoutData) => true,
    getSessionProgress: (workoutData) => '+ Early morning workout'
  },
  
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a workout after 10 PM.',
    icon: '🌙',
    category: 'special',
    rarity: 'rare',
    
    checkUnlock: (workout, data) => {
      const hour = new Date(workout.statistics.workoutStartTime || Date.now()).getHours();
      return hour >= 22;
    },
    
    hasSessionProgress: (workoutData) => true,
    getSessionProgress: (workoutData) => '+ Late night workout'
  },
  
  {
    id: 'rest_skipper',
    title: 'Impatient',
    description: 'Someone clearly doesn\'t believe in the power of recovery! 😤',
    icon: '⏭️',
    category: 'special',
    rarity: 'common',
    
    checkUnlock: (workout, data) => true, // Unlocked by rest skip attempts
    hasSessionProgress: (workoutData) => true,
    getSessionProgress: (workoutData) => '+ Rest skip detected'
  }
];