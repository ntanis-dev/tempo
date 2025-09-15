import { Achievement } from '../types/achievements';
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
  checkUnlock: (workout: WorkoutState, data: any) => boolean;
  calculateProgress?: (data: any) => number;
  getSessionProgress?: (workoutData: any) => string;
  hasSessionProgress?: (workoutData: any) => boolean;
}

export const firstWorkoutAchievement: AchievementDefinition = {
  id: 'first_workout',
  title: 'First Steps',
  description: 'Complete your very first workout.',
  icon: '🚀',
  category: 'milestone',
  rarity: 'common',
  
  checkUnlock: (workout: WorkoutState, data: any) => {
    return true; // Always unlocks on first completed workout
  },
  
  hasSessionProgress: (workoutData: any) => true,
  getSessionProgress: (workoutData: any) => '+ First workout!'
};