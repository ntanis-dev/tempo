import { Achievement } from '../types/achievements';
import { WorkoutState } from '../types';
import { ALL_ACHIEVEMENTS } from '../achievements';
import { saveAchievements, loadAchievements } from './storage';
import { STORAGE_KEYS, UI } from '../constants';
import { storageService } from "../services/StorageService";

export interface AchievementUpdate {
  achievement: Achievement;
  wasJustUnlocked: boolean;
}

export interface AchievementModalData {
  unlockedAchievements: Achievement[];
  progressAchievements: Achievement[];
  workoutData: {
    sets: number;
    reps: number;
    timeSeconds: number;
    isNewDay: boolean;
    lastWorkoutDate?: string;
  };
}

interface AchievementData {
  lastWorkoutDate?: string; // ISO date string
  weeklyStreak: number;
  totalWorkoutDays: number;
  cumulativeSets: number;
  cumulativeReps: number;
  cumulativeTimeSeconds: number;
  consecutiveNoPauseWorkouts: number;
}

export class AchievementProcessor {
  private achievements: Achievement[] = [];
  private data: AchievementData = {
    weeklyStreak: 0,
    totalWorkoutDays: 0,
    cumulativeSets: 0,
    cumulativeReps: 0,
    cumulativeTimeSeconds: 0,
    consecutiveNoPauseWorkouts: 0
  };

  constructor() {
    this.loadAchievements();
    this.loadAchievementData();
  }

  private loadAchievements() {
    const saved = loadAchievements();
    this.achievements = ALL_ACHIEVEMENTS.map(achievementDef => {
      const savedAchievement = saved.find(s => s.id === achievementDef.id);
      const baseAchievement: Achievement = {
        id: achievementDef.id,
        title: achievementDef.title,
        description: achievementDef.description,
        icon: achievementDef.icon,
        category: achievementDef.category,
        rarity: achievementDef.rarity,
        isUnlocked: false,
        maxProgress: achievementDef.maxProgress,
        progress: achievementDef.maxProgress ? 0 : undefined
      };
      
      // Merge saved data but ALWAYS preserve maxProgress from definition
      if (savedAchievement) {
        const merged = {
          ...baseAchievement,
          ...savedAchievement,
          maxProgress: achievementDef.maxProgress, // Always use definition's maxProgress
          progress: savedAchievement.progress !== undefined ? savedAchievement.progress : (achievementDef.maxProgress ? 0 : undefined)
        };
        return merged;
      }
      
      return baseAchievement;
    });
  }

  private saveAchievements() {
    const achievementsToSave = this.achievements.map(achievement => ({
      id: achievement.id,
      isUnlocked: achievement.isUnlocked,
      unlockedAt: achievement.unlockedAt,
      progress: achievement.progress
    }));
    saveAchievements(achievementsToSave);
  }

  private loadAchievementData() {
    const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENT_DATA);
    if (saved) {
      try {
        this.data = { ...this.data, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load achievement data:', error);
      }
    }
  }

  private saveAchievementData() {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENT_DATA, JSON.stringify(this.data));
  }

  private updateAchievement(id: string, updates: Partial<Achievement>): boolean {
    const achievement = this.achievements.find(a => a.id === id);
    if (!achievement) return false;

    const wasUnlocked = achievement.isUnlocked;
    Object.assign(achievement, updates);

    // Check if achievement should be unlocked
    if (!wasUnlocked && achievement.maxProgress && achievement.progress && achievement.progress >= achievement.maxProgress) {
      achievement.isUnlocked = true;
      achievement.unlockedAt = Date.now();
      return true;
    }

    return false;
  }

  private incrementRestSkipAttempts() {
    storageService.incrementRestSkipAttempts();
  }

  private getRestSkipAttempts(): number {
    return storageService.getRestSkipAttempts();
  }

  private clearRestSkipAttempts() {
    storageService.clearRestSkipAttempts();
  }

  private updateWeeklyStreak(workoutDate: Date) {
    const today = workoutDate.toISOString().split('T')[0];
    
    if (!this.data.lastWorkoutDate) {
      // First workout ever
      this.data.weeklyStreak = 1;
      this.data.lastWorkoutDate = today;
      return;
    }

    const lastWorkout = new Date(this.data.lastWorkoutDate);
    const daysSinceLastWorkout = Math.floor((workoutDate.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
    
    // Same day - no change
    if (daysSinceLastWorkout === 0) {
      return;
    }

    // Update last workout date
    this.data.lastWorkoutDate = today;

    // If more than 14 days (2 weeks), reset streak
    if (daysSinceLastWorkout > UI.STREAK_RESET_DAYS) {
      this.data.weeklyStreak = 1;
      return;
    }

    // Check if we're in a new week
    const lastWeekStart = this.getWeekStart(lastWorkout);
    const currentWeekStart = this.getWeekStart(workoutDate);
    
    if (currentWeekStart.getTime() !== lastWeekStart.getTime()) {
      // Different week - check if consecutive
      const weeksDiff = Math.floor((currentWeekStart.getTime() - lastWeekStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
      
      if (weeksDiff === 1) {
        // Consecutive week - increment
        this.data.weeklyStreak++;
      } else {
        // Gap in weeks - reset
        this.data.weeklyStreak = 1;
      }
    }
    // Same week - no change to streak count
  }

  private getWeekStart(date: Date): Date {
    // Get start of week (Monday)
    const result = new Date(date);
    const dayOfWeek = result.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust so Monday is start of week
    
    result.setDate(result.getDate() + diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  getLastWorkoutDate(): string | undefined {
    return this.data.lastWorkoutDate;
  }

  processWorkoutCompletion(workout: WorkoutState): { updates: AchievementUpdate[], modalData: AchievementModalData | null } {
    const updates: AchievementUpdate[] = [];
    const now = Date.now();
    const workoutDate = new Date(workout.statistics.workoutStartTime || now);
    const today = workoutDate.toISOString().split('T')[0];

    // Create workout data for modal
    const workoutData = {
      sets: workout.totalSets,
      reps: workout.totalSets * workout.settings.repsPerSet,
      timeSeconds: workout.statistics.totalTimeStretched + 
                  workout.statistics.totalTimeExercised + 
                  workout.statistics.totalTimeRested,
      isNewDay: this.data.lastWorkoutDate !== today,
      lastWorkoutDate: this.data.lastWorkoutDate
    };

    // FIRST: Find achievements that SHOULD show progress based on workout data (BEFORE processing)
    const achievementsWithSessionProgress = this.achievements.filter(achievement => {
      // Skip already unlocked
      if (achievement.isUnlocked) return false;
      
      // Must have progress tracking
      if (!achievement.maxProgress) return false;
      
      // Check if this achievement has session progress
      const achievementDef = ALL_ACHIEVEMENTS.find(def => def.id === achievement.id);
      if (!achievementDef?.hasSessionProgress) return false;
      
      return achievementDef.hasSessionProgress(workoutData);
    });
    // Process any pending rest skip attempts
    const restSkipAttempts = this.getRestSkipAttempts();
    if (restSkipAttempts > 0) {
      const achievement = this.achievements.find(a => a.id === 'rest_skipper');
      if (achievement && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = now;
        updates.push({ achievement: { ...achievement }, wasJustUnlocked: true });
      }
      this.clearRestSkipAttempts();
    }

    // Check if this is a new day (only increment total days for new days)
    const isNewDay = this.data.lastWorkoutDate !== today;
    if (isNewDay) {
      this.data.totalWorkoutDays++;
    }

    // Update weekly streak
    this.updateWeeklyStreak(workoutDate);

    // Update cumulative data
    const currentWorkoutSets = workout.totalSets;
    const currentWorkoutReps = workout.totalSets * workout.settings.repsPerSet;
    const totalWorkoutTimeSeconds = workout.statistics.totalTimeStretched + 
                                   workout.statistics.totalTimeExercised + 
                                   workout.statistics.totalTimeRested;

    this.data.cumulativeSets += currentWorkoutSets;
    this.data.cumulativeReps += currentWorkoutReps;
    this.data.cumulativeTimeSeconds += totalWorkoutTimeSeconds;

    // Process all achievements using their individual logic
    this.achievements.forEach(achievement => {
      if (achievement.isUnlocked) return; // Skip already unlocked
      
      const achievementDef = ALL_ACHIEVEMENTS.find(def => def.id === achievement.id);
      const hasSessionProgress = achievementDef?.hasSessionProgress && 
                                achievementDef.hasSessionProgress(workoutData);
      
      // Check if this achievement should unlock
      if (achievementDef && achievementDef.checkUnlock(workout, this.data)) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = now;
        updates.push({ achievement: { ...achievement }, wasJustUnlocked: true });
        return;
      }
      
      // If this achievement had session progress but didn't unlock, add to progressed list
      if (hasSessionProgress && achievement.maxProgress) {
        // progressedAchievements.push({ ...achievement });
      }
      // Update progress if applicable
      if (achievementDef && achievementDef.calculateProgress && achievementDef.maxProgress) {
        const newProgress = achievementDef.calculateProgress(this.data);
        achievement.progress = newProgress;
        
        // Check if unlocked due to progress
        if (newProgress >= achievementDef.maxProgress) {
          achievement.isUnlocked = true;
          achievement.unlockedAt = now;
          updates.push({ achievement: { ...achievement }, wasJustUnlocked: true });
        }
      }
    });

    // Special handling for perfectionist (consecutive tracking)
    if (workout.statistics.totalTimePaused === 0) {
      this.data.consecutiveNoPauseWorkouts++;
    } else {
      // Reset perfectionist progress if workout had pauses
      this.data.consecutiveNoPauseWorkouts = 0;
      const achievement = this.achievements.find(a => a.id === 'perfectionist');
      if (achievement && !achievement.isUnlocked) {
        achievement.progress = 0;
      }
    }

    // Save all data
    this.saveAchievements();
    this.saveAchievementData();
    
    // AFTER processing: Find progress achievements (had session progress but didn't unlock)
    const unlockedAchievements = updates
      .filter(({ wasJustUnlocked }) => wasJustUnlocked)
      .map(({ achievement }) => achievement);
    
    const unlockedIds = new Set(unlockedAchievements.map(a => a.id));
    const progressAchievements = achievementsWithSessionProgress
      .filter(achievement => {
        // Skip unlocked achievements
        if (unlockedIds.has(achievement.id)) return false;
        
        // Special handling for perfectionist - only show progress if no pauses
        if (achievement.id === 'perfectionist') {
          return workout.statistics.totalTimePaused === 0;
        }
        
        return true;
      })
      .map(achievement => ({ ...achievement })); // Create copies with current progress


    const modalData: AchievementModalData | null = 
      (unlockedAchievements.length > 0 || progressAchievements.length > 0) 
        ? { unlockedAchievements, progressAchievements, workoutData }
        : null;
    
    return { updates, modalData };
  }

  processRestSkipAttempt(): AchievementUpdate[] {
    // Track rest skip attempt for later processing
    this.incrementRestSkipAttempts();
    return []; // Don't return any updates immediately
  }

  getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  resetAchievements() {
    this.achievements = ALL_ACHIEVEMENTS.map(achievementDef => ({ 
      id: achievementDef.id,
      title: achievementDef.title,
      description: achievementDef.description,
      icon: achievementDef.icon,
      category: achievementDef.category,
      rarity: achievementDef.rarity,
      maxProgress: achievementDef.maxProgress,
      isUnlocked: false, 
      unlockedAt: undefined, 
      progress: achievementDef.maxProgress ? 0 : undefined 
    }));
    
    this.data = {
      weeklyStreak: 0,
      totalWorkoutDays: 0,
      cumulativeSets: 0,
      cumulativeReps: 0,
      cumulativeTimeSeconds: 0,
      consecutiveNoPauseWorkouts: 0
    };
    
    this.saveAchievements();
    this.saveAchievementData();
    storageService.clearRestSkipAttempts();
  }

  refreshFromStorage() {
    this.loadAchievements();
    this.loadAchievementData();
  }
}

export const achievementProcessor = new AchievementProcessor();