// Storage keys
export const STORAGE_KEYS = {
  WORKOUT: 'tempo-workout',
  SETS: 'tempo-sets',
  SETTINGS: 'tempo-settings',
  HISTORY: 'tempo-history',
  SOUND: 'tempo-sound-enabled',
  SOUND_VOLUME: 'tempo-sound-volume',
  PREVIOUS_VOLUME: 'tempo-previous-volume',
  ACHIEVEMENTS: 'tempo-achievements',
  ACHIEVEMENT_DATA: 'tempo-achievement-data',
  PENDING_ACHIEVEMENTS: 'tempo-pending-achievements',
  DEBUG_MODE: 'tempo-debug-mode',
  REST_SKIP_ATTEMPTS: 'tempo-rest-skip-attempts',
  EXPERIENCE: 'tempo-experience',
  WHATS_NEW_VERSION_KEY: 'tempo-whats-new-version',
} as const;

// Default values
export const DEFAULTS = {
  SETTINGS: {
    timePerRep: 3,
    restTime: 30,
    stretchTime: 30,
    repsPerSet: 10
  },
  STATISTICS: {
    totalTimeExercised: 0,
    totalTimePaused: 0,
    totalTimeRested: 0,
    totalTimeStretched: 0,
    totalRepsCompleted: 0,
    workoutStartTime: null,
    lastActiveTime: Date.now()
  },
  TOTAL_SETS: 10,
  SOUND_ENABLED: true,
  SOUND_VOLUME: 1.0,
  HISTORY_LIMIT: 14
} as const;

// Time constants
export const TIME = {
  COUNTDOWN_THRESHOLD: 4,
  FINAL_COUNTDOWN: 2,
  PREPARE_THRESHOLD: 5,
  TRANSITION_DELAY: 700,
  FADE_DELAY: 50,
  COMPLETION_DELAY: 1000,
  RESET_DELAY: 700,
  NOTIFICATION_DURATION: 4000,
  SHAKE_DURATION: 600,
  ACHIEVEMENT_UNLOCK_DELAY: 150,
  APP_REFRESH_DELAY: 100
} as const;

// Audio frequencies
export const AUDIO = {
  FREQUENCIES: {
    COUNTDOWN_TICK: 600,
    COUNTDOWN_FINAL: 1000,
    PREPARE_PHASE: 750,
    WORK_START: [440, 554], // A4, C#5
    REST_START: [523, 440], // C5, A4
    WORKOUT_START: [440, 554, 659], // A4, C#5, E5
    WORKOUT_COMPLETE: [523, 659, 784, 1047], // C5, E5, G5, C6
    ACHIEVEMENT: [440, 554, 659, 880], // A4, C#5, E5, A5
    REP_CHANGE: 600 // D5 - more audible tone for rep changes
  },
  DURATIONS: {
    SHORT: 0.08,
    MEDIUM: 0.12,
    LONG: 0.15,
    EXTENDED: 0.2,
    VICTORY: 0.25
  },
  VOLUMES: {
    LOW: 0.3,
    MEDIUM: 0.4,
    HIGH: 0.5,
    PEAK: 0.6
  }
} as const;

// Validation limits
export const LIMITS = {
  SETS: { MIN: 1, MAX: 50 },
  REPS: { MIN: 1, MAX: 50 },
  TIME_PER_REP: { MIN: 1, MAX: 10 },
  REST_TIME: { MIN: 15, MAX: 90 },
  STRETCH_TIME: { MIN: 15, MAX: 90 }
} as const;

// UI constants
export const UI = {
  TIME_INCREMENT_THRESHOLD: 10,
  STREAK_RESET_DAYS: 14
} as const;