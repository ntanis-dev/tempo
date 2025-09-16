import { Achievement, AchievementData, WorkoutSessionData } from '../types/achievements';
import { WorkoutState } from '../types';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'consistency' | 'endurance' | 'milestone' | 'dedication' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  maxProgress?: number;
  
  // Logic functions
  checkUnlock: (workout: WorkoutState, data: AchievementData) => boolean;
  calculateProgress?: (data: AchievementData) => number;
  getSessionProgress?: (workoutData: WorkoutSessionData) => string;
  hasSessionProgress?: (workoutData: WorkoutSessionData) => boolean;
}

export const firstWorkoutAchievement: AchievementDefinition = {
  id: 'first_workout',
  title: 'First Steps',
  description: 'Complete your very first workout.',
  icon: '🚀',
  category: 'milestone',
  rarity: 'common',
  
  checkUnlock: (workout: WorkoutState, data: AchievementData) => {
    return true; // Always unlocks on first completed workout
  },
  
  hasSessionProgress: (workoutData: WorkoutSessionData) => true,
  getSessionProgress: (workoutData: WorkoutSessionData) => '+ First workout!'
};