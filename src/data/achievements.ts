import { Achievement } from '../types/achievements';

export const ACHIEVEMENTS: Achievement[] = [
  // Consistency Achievements
  {
    id: 'first_workout',
    title: 'First Steps',
    description: 'Complete your very first workout.',
    icon: '🚀',
    category: 'milestone',
    isUnlocked: false,
    rarity: 'common'
  },
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Complete workouts on 3 different days.',
    icon: '🌱',
    category: 'consistency',
    isUnlocked: false,
    progress: 0,
    maxProgress: 3,
    rarity: 'common'
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Complete workouts on 7 different days.',
    icon: '🔥',
    category: 'consistency',
    isUnlocked: false,
    progress: 0,
    maxProgress: 7,
    rarity: 'rare'
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Complete workouts on 30 different days.',
    icon: '💎',
    category: 'consistency',
    isUnlocked: false,
    progress: 0,
    maxProgress: 30,
    rarity: 'epic'
  },
  {
    id: 'streak_100',
    title: 'Century Champion',
    description: 'Complete workouts on 100 different days.',
    icon: '👑',
    category: 'consistency',
    isUnlocked: false,
    progress: 0,
    maxProgress: 100,
    rarity: 'legendary'
  },

  // Endurance Achievements
  {
    id: 'total_10_sets',
    title: 'Set Starter',
    description: 'Complete 10 total sets across all workouts.',
    icon: '🎯',
    category: 'endurance',
    isUnlocked: false,
    progress: 0,
    maxProgress: 10,
    rarity: 'common'
  },
  {
    id: 'total_100_sets',
    title: 'Set Crusher',
    description: 'Complete 100 total sets across all workouts.',
    icon: '💪',
    category: 'endurance',
    isUnlocked: false,
    progress: 0,
    maxProgress: 100,
    rarity: 'rare'
  },
  {
    id: 'total_500_sets',
    title: 'Set Destroyer',
    description: 'Complete 500 total sets across all workouts.',
    icon: '🔨',
    category: 'endurance',
    isUnlocked: false,
    progress: 0,
    maxProgress: 500,
    rarity: 'epic'
  },
  {
    id: 'total_1000_reps',
    title: 'Rep Machine',
    description: 'Complete 1,000 total reps across all workouts.',
    icon: '⚡',
    category: 'endurance',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1000,
    rarity: 'rare'
  },
  {
    id: 'total_5000_reps',
    title: 'Rep Legend',
    description: 'Complete 5,000 total reps across all workouts.',
    icon: '⭐',
    category: 'endurance',
    isUnlocked: false,
    progress: 0,
    maxProgress: 5000,
    rarity: 'epic'
  },

  // Milestone Achievements
  {
    id: 'single_20_sets',
    title: 'Endurance Beast',
    description: 'Complete 20 sets in a single workout.',
    icon: '🐂',
    category: 'milestone',
    isUnlocked: false,
    rarity: 'rare'
  },
  {
    id: 'workout_30_min',
    title: 'Time Warrior',
    description: 'Complete a workout lasting 30+ minutes.',
    icon: '⏳',
    category: 'milestone',
    isUnlocked: false,
    rarity: 'rare'
  },
  {
    id: 'workout_60_min',
    title: 'Marathon Master',
    description: 'Complete a workout lasting 60+ minutes.',
    icon: '🏆',
    category: 'milestone',
    isUnlocked: false,
    rarity: 'epic'
  },

  // Dedication Achievements
  {
    id: 'no_pause_workout',
    title: 'Unstoppable',
    description: 'Complete a workout without pausing.',
    icon: '🌪️',
    category: 'dedication',
    isUnlocked: false,
    rarity: 'rare'
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a workout before 7 AM.',
    icon: '🐦',
    category: 'special',
    isUnlocked: false,
    rarity: 'rare'
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a workout after 10 PM.',
    icon: '🌙',
    category: 'special',
    isUnlocked: false,
    rarity: 'rare'
  },

  // Special Achievements
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a workout with 1 second per rep.',
    icon: '🏃‍♂️',
    category: 'special',
    isUnlocked: false,
    rarity: 'rare'
  },
  {
    id: 'minimalist',
    title: 'Minimalist',
    description: 'Complete a workout with only 1 set.',
    icon: '1️⃣',
    category: 'special',
    isUnlocked: false,
    rarity: 'common'
  },
  {
    id: 'maximalist',
    title: 'Maximalist',
    description: 'Complete a workout with 50 sets.',
    icon: '💯',
    category: 'special',
    isUnlocked: false,
    rarity: 'legendary'
  },
  {
    id: 'total_10000_reps',
    title: 'Rep God',
    description: 'Complete 10,000 total reps across all workouts.',
    icon: '🔥',
    category: 'endurance',
    isUnlocked: false,
    progress: 0,
    maxProgress: 10000,
    rarity: 'legendary'
  },
  {
    id: 'total_1000_sets',
    title: 'Set Master',
    description: 'Complete 1,000 total sets across all workouts.',
    icon: '⚔️',
    category: 'endurance',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1000,
    rarity: 'legendary'
  },
  {
    id: 'streak_365',
    title: 'Year Warrior',
    description: 'Complete workouts on 365 different days.',
    icon: '🏅',
    category: 'consistency',
    isUnlocked: false,
    progress: 0,
    maxProgress: 365,
    rarity: 'legendary'
  },
  {
    id: 'single_100_sets',
    title: 'Endurance God',
    description: 'Complete 100 sets in a single workout.',
    icon: '🦾',
    category: 'milestone',
    isUnlocked: false,
    rarity: 'legendary'
  },
  {
    id: 'workout_120_min',
    title: 'Iron Will',
    description: 'Complete a workout lasting 120+ minutes.',
    icon: '🛡️',
    category: 'milestone',
    isUnlocked: false,
    rarity: 'legendary'
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete 10 workouts without pausing.',
    icon: '💎',
    category: 'dedication',
    isUnlocked: false,
    progress: 0,
    maxProgress: 10,
    rarity: 'epic'
  },
  {
    id: 'lightning_fast',
    title: 'Zen Master',
    description: 'Complete a workout with 10 seconds per rep.',
    icon: '🧘‍♂️',
    category: 'special',
    isUnlocked: false,
    rarity: 'epic'
  },
  {
    id: 'marathon_runner',
    title: 'Marathon Runner',
    description: 'Complete a workout lasting 180+ minutes.',
    icon: '🏃‍♀️',
    category: 'milestone',
    isUnlocked: false,
    rarity: 'legendary'
  },
  {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Complete workouts for 14 consecutive days.',
    icon: '👑',
    category: 'consistency',
    isUnlocked: false,
    progress: 0,
    maxProgress: 14,
    rarity: 'epic'
  },
  {
    id: 'total_50_hours',
    title: 'Time Master',
    description: 'Accumulate 50 hours of total workout time.',
    icon: '⏰',
    category: 'endurance',
    isUnlocked: false,
    progress: 0,
    maxProgress: 180000,
    rarity: 'epic'
  },
  {
    id: 'super_maximalist',
    title: 'Super Maximalist',
    description: 'Complete a workout with 100 sets.',
    icon: '🚀',
    category: 'special',
    isUnlocked: false,
    rarity: 'legendary'
  }
];