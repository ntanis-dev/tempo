import { Achievement } from '../types/achievements';
import { getAchievementDefinition } from '../achievements';

export interface WorkoutData {
  sets: number;
  reps: number;
  timeSeconds: number;
  isNewDay: boolean;
  isNewWeek: boolean;
  lastWorkoutDate?: string;
}

/**
 * Calculate session progress for an achievement
 */
export const getSessionProgress = (achievement: Achievement, workoutData?: WorkoutData): string => {
  const achievementDef = getAchievementDefinition(achievement.id);
  if (!achievementDef?.getSessionProgress || !workoutData) return '+ 0 progress';
  
  return achievementDef.getSessionProgress(workoutData);
};