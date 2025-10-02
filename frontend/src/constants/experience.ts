// XP Constants
export const XP_SOURCES = {
  WORKOUT_COMPLETE: 150,
  PERFECT_WORKOUT: 50, // No pauses
  LONG_WORKOUT: 100, // 30+ minutes
  ACHIEVEMENT_UNLOCK: 250,
} as const;

// Level progression - exponential curve
export const calculateXPRequired = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Get total XP required to reach a specific level
export const getTotalXPForLevel = (level: number): number => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateXPRequired(i + 1);
  }
  return total;
};

// Level caps and milestones
export const LEVEL_CAP = 1000;
export const MILESTONE_LEVELS = [5, 10, 25, 50, 75, 100];

// Level titles
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Beginner',
  5: 'Trainee',
  10: 'Dedicated',
  15: 'Committed',
  20: 'Strong',
  25: 'Warrior',
  30: 'Champion',
  40: 'Master',
  50: 'Legend',
  75: 'Elite',
  100: 'Grandmaster'
};

export const getLevelTitle = (level: number): string => {
  const titles = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a); // Descending order
  
  for (const titleLevel of titles) {
    if (level >= titleLevel) {
      return LEVEL_TITLES[titleLevel];
    }
  }
  
  return LEVEL_TITLES[1];
};