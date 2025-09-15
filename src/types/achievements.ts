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
}

export interface AchievementCategory {
  id: string;
  name: string;
  color: string;
  achievements: Achievement[];
}