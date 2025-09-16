import { ExperienceData, LevelInfo, XPGain } from '../types/experience';
import { WorkoutState } from '../types';
import { calculateXPRequired, getTotalXPForLevel, XP_SOURCES, LEVEL_CAP } from '../constants/experience';
import { STORAGE_KEYS } from '../constants';

export class ExperienceProcessor {
  private data: ExperienceData = {
    totalXP: 0,
    currentLevel: 1
  };

  constructor() {
    this.loadExperienceData();
  }

  private loadExperienceData() {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPERIENCE);
    if (saved) {
      try {
        this.data = { ...this.data, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load experience data:', error);
      }
    }
  }

  private saveExperienceData() {
    localStorage.setItem(STORAGE_KEYS.EXPERIENCE, JSON.stringify(this.data));
  }

  private calculateLevel(totalXP: number): number {
    let level = 1;
    let xpRequired = 0;
    
    while (level < LEVEL_CAP) {
      const nextLevelXP = calculateXPRequired(level + 1);
      if (xpRequired + nextLevelXP > totalXP) {
        break;
      }
      xpRequired += nextLevelXP;
      level++;
    }
    
    return level;
  }

  getCurrentLevelInfo(): LevelInfo {
    const currentLevel = this.data.currentLevel;
    const totalXP = this.data.totalXP;
    
    // XP required for current level
    const currentLevelStartXP = getTotalXPForLevel(currentLevel);
    const nextLevelStartXP = getTotalXPForLevel(currentLevel + 1);
    
    const xpForThisLevel = totalXP - currentLevelStartXP;
    const xpRequired = nextLevelStartXP - currentLevelStartXP;
    const xpToNext = nextLevelStartXP - totalXP;
    const progressPercent = xpRequired > 0 ? (xpForThisLevel / xpRequired) * 100 : 100;

    return {
      level: currentLevel,
      xpRequired,
      xpForThisLevel,
      progressPercent: Math.max(0, Math.min(100, progressPercent)),
      xpToNext: Math.max(0, xpToNext)
    };
  }

  awardXP(amount: number, source: string): XPGain {
    const oldLevel = this.data.currentLevel;
    
    // Add XP
    this.data.totalXP += amount;
    
    // Recalculate level
    const newLevel = this.calculateLevel(this.data.totalXP);
    
    const levelUp = newLevel > oldLevel;
    if (levelUp) {
      this.data.currentLevel = newLevel;
      this.data.lastLevelUpTime = Date.now();
    }
    
    this.saveExperienceData();
    
    return {
      amount,
      source,
      levelUp,
      newLevel: levelUp ? newLevel : undefined
    };
  }

  processWorkoutCompletion(workout: WorkoutState): XPGain[] {
    const gains: XPGain[] = [];
    
    // Base XP for completing workout
    gains.push(this.awardXP(XP_SOURCES.WORKOUT_COMPLETE, 'Workout Complete'));
    
    // Bonus XP for perfect workout (no pauses)
    if (workout.statistics.totalTimePaused === 0) {
      gains.push(this.awardXP(XP_SOURCES.PERFECT_WORKOUT, 'Perfect Workout'));
    }
    
    // Calculate total workout time
    const totalTime = workout.statistics.totalTimeStretched + 
                     workout.statistics.totalTimeExercised + 
                     workout.statistics.totalTimeRested;
    
    // Bonus for long workouts (30+ minutes)
    if (totalTime >= 1800) {
      gains.push(this.awardXP(XP_SOURCES.LONG_WORKOUT, 'Long Workout'));
    }
    
    return gains;
  }

  processAchievementUnlock(): XPGain {
    return this.awardXP(XP_SOURCES.ACHIEVEMENT_UNLOCK, 'Achievement Unlocked');
  }

  getExperienceData(): ExperienceData {
    return { ...this.data };
  }

  resetExperience() {
    this.data = {
      totalXP: 0,
      currentLevel: 1
    };
    this.saveExperienceData();
  }

  refreshFromStorage() {
    this.loadExperienceData();
  }
}

export const experienceProcessor = new ExperienceProcessor();