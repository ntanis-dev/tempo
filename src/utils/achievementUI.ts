// Single source of truth for achievement UI logic
import { Achievement } from '../types/achievements';

// Rarity utilities
export const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common': return 'border-gray-300/50 bg-gray-300/10 text-gray-300';
    case 'rare': return 'border-blue-300/50 bg-blue-300/10 text-blue-300';
    case 'epic': return 'border-purple-300/50 bg-purple-300/10 text-purple-300';
    case 'legendary': return 'border-yellow-300/50 bg-yellow-300/10 text-yellow-300';
    default: return 'border-gray-300/50 bg-gray-300/10 text-gray-300';
  }
};

export const getRarityText = (rarity: Achievement['rarity']) => {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
};

export const getRarityBadgeClasses = (rarity: Achievement['rarity']) => {
  const baseClasses = 'text-xs px-2 py-0.5 rounded-full font-medium';
  switch (rarity) {
    case 'common': return `${baseClasses} bg-gray-500/20 text-gray-300`;
    case 'rare': return `${baseClasses} bg-blue-500/20 text-blue-300`;
    case 'epic': return `${baseClasses} bg-purple-500/20 text-purple-300`;
    case 'legendary': return `${baseClasses} bg-yellow-500/20 text-yellow-300`;
    default: return `${baseClasses} bg-gray-500/20 text-gray-300`;
  }
};

// Achievement sorting
export const sortAchievementsByRarity = (achievements: Achievement[]): Achievement[] => {
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  return [...achievements].sort((a, b) => {
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });
};

// Achievement display logic
export const getAchievementDisplay = (
  achievement: Achievement, 
  isDebugMode: boolean = false
) => {
  const shouldShow = achievement.isUnlocked || achievement.maxProgress || isDebugMode;
  
  return {
    title: shouldShow ? achievement.title : "???",
    description: shouldShow ? achievement.description : "???", 
    icon: shouldShow ? achievement.icon : "❓"
  };
};

// Progress calculation
export const calculateProgressPercent = (achievement: Achievement): number => {
  if (!achievement.maxProgress) return 0;
  return ((achievement.progress || 0) / achievement.maxProgress) * 100;
};