// Centralized formatting utilities
import { WorkoutStatistics } from '../types';

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatTime = (seconds: number): string => {
  return seconds.toString();
};

export const formatRelativeDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const formatTimeOfDay = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatWorkoutDateTime = (timestamp: number | null) => {
  if (!timestamp) return { date: '', time: '' };
  
  const workoutDate = new Date(timestamp);
  const date = workoutDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const time = workoutDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  return { date, time };
};

export const calculateTotalWorkoutDuration = (
  totalSets: number,
  settings: {
    stretchTime: number;
    timePerRep: number;
    repsPerSet: number;
    restTime: number;
  }
): string => {
  const totalSeconds = settings.stretchTime + 
    (totalSets * settings.timePerRep * settings.repsPerSet) + 
    ((totalSets - 1) * settings.restTime);
  
  return formatDuration(totalSeconds);
};

export const getTotalWorkoutTime = (statistics: WorkoutStatistics): number => {
  // Always return the sum of tracked times
  return statistics.totalTimeExercised +
         statistics.totalTimePaused +
         statistics.totalTimeRested +
         statistics.totalTimeStretched;
};