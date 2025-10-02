import { WorkoutState } from './index';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'consistency' | 'endurance' | 'milestone' | 'dedication' | 'special';
  isUnlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points?: number;
  hidden?: boolean;
  checkUnlock?: (workout: WorkoutState, data: AchievementData) => boolean;
  calculateProgress?: (data: AchievementData) => number;
  getSessionProgress?: (workoutData: WorkoutSessionData) => string;
  hasSessionProgress?: (workoutData: WorkoutSessionData) => boolean;
}

export interface AchievementCategory {
  id: string;
  name: string;
  color: string;
  achievements: Achievement[];
}

export interface AchievementData {
  totalWorkouts: number;
  totalReps: number;
  totalSets: number;
  totalTimeExercised: number;
  longestStreak: number;
  currentStreak: number;
  currentWeeklyStreak: number;
  longestWeeklyStreak: number;
  lastWorkoutDate: number | null;
  weeklyWorkoutDays: Set<string>;
  consecutiveDaysThisWeek: number;
  totalWeeksCompleted: number;
  restSkipAttempts: number;
  lastRestSkipReset: number | null;
}

export interface WorkoutSessionData {
  totalReps: number;
  totalSets: number;
  totalTimeExercised: number;
  restSkipAttempts?: number;
}

export interface AchievementUpdate {
  achievement: Achievement;
  wasJustUnlocked: boolean;
}

export interface AchievementModalData {
  unlockedAchievements: Achievement[];
  progressAchievements: Achievement[];
  workoutData: WorkoutSessionData;
}