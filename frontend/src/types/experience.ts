export interface ExperienceData {
  totalXP: number;
  currentLevel: number;
  lastLevelUpTime?: number;
}

export interface LevelInfo {
  level: number;
  xpRequired: number;
  xpForThisLevel: number;
  progressPercent: number;
  xpToNext: number;
}

export interface XPGain {
  amount: number;
  source: string;
  levelUp?: boolean;
  newLevel?: number;
}