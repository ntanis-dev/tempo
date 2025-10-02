export type Phase = 'setup' | 'transition' | 'prepare' | 'countdown' | 'work' | 'rest' | 'complete';

export interface TimerSettings {
  timePerRep: number;
  restTime: number;
  stretchTime: number;
  repsPerSet: number;
}

export interface WorkoutSettings extends TimerSettings {
  totalSets: number;
}

export interface WorkoutState {
  phase: Phase;
  currentSet: number;
  totalSets: number;
  timeRemaining: number;
  isPaused: boolean;
  currentRep: number;
  settings: TimerSettings;
  usedQuotes: number[];
  currentQuote: string;
  usedCalmingQuotes: number[];
  currentCalmingQuote: string;
  usedPreExerciseQuotes: number[];
  currentPreExerciseQuote: string;
  usedPostWorkoutQuotes: number[];
  currentPostWorkoutQuote: string;
  statistics: WorkoutStatistics;
}

export interface WorkoutStatistics {
  totalTimeExercised: number;
  totalTimePaused: number;
  totalTimeRested: number;
  totalTimeStretched: number;
  totalRepsCompleted: number;
  workoutStartTime: number | null;
  workoutEndTime: number | null;
  lastActiveTime: number;
  pauseStartTime: number | null;
}

export interface WorkoutHistoryEntry {
  id: string;
  uniqueId?: string; // Unique identifier for deduplication (added in v2.1+)
  serverSynced?: boolean; // Whether this workout has been successfully sent to server
  lastSyncAttempt?: number; // Timestamp of last sync attempt
  syncAttempts?: number; // Number of times we've tried to sync
  date: number;
  totalSets: number;
  repsPerSet: number;
  timePerRep: number;
  restTime: number;
  stretchTime: number;
  statistics: WorkoutStatistics;
  notes?: string; // Workout notes (for export/import)
}