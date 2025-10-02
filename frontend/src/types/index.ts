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
  date: number;
  totalSets: number;
  repsPerSet: number;
  timePerRep: number;
  restTime: number;
  stretchTime: number;
  statistics: WorkoutStatistics;
}