// Central index for all achievements
import { AchievementDefinition, firstWorkoutAchievement } from './first-workout';
import { dailyStreakAchievements } from './daily-streaks';
import { weeklyStreakAchievements } from './weekly-streaks';
import { setsAchievements } from './sets-achievements';
import { repsAchievements } from './reps-achievements';
import { timeAchievements } from './time-achievements';
import { milestoneAchievements } from './milestone-achievements';
import { specialAchievements } from './special-achievements';
import { dedicationAchievements } from './dedication-achievements';

// Export all achievement definitions
export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  firstWorkoutAchievement,
  ...dailyStreakAchievements,
  ...weeklyStreakAchievements,
  ...setsAchievements,
  ...repsAchievements,
  ...timeAchievements,
  ...milestoneAchievements,
  ...specialAchievements,
  ...dedicationAchievements
];

// Export individual categories for organization
export {
  firstWorkoutAchievement,
  dailyStreakAchievements,
  weeklyStreakAchievements,
  setsAchievements,
  repsAchievements,
  timeAchievements,
  milestoneAchievements,
  specialAchievements,
  dedicationAchievements
};

export type { AchievementDefinition };

// Helper function to get achievement by ID
export const getAchievementDefinition = (id: string): AchievementDefinition | undefined => {
  return ALL_ACHIEVEMENTS.find(achievement => achievement.id === id);
};