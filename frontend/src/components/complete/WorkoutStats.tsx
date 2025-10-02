import React from 'react';
import { Globe } from 'lucide-react';
import { WorkoutState } from '../../types';
import { formatDuration, getTotalWorkoutTime, formatWorkoutDateTime } from '../../utils/formatters';
import { LevelDisplay } from '../ui/LevelDisplay';
import { experienceProcessor } from '../../utils/experienceProcessor';

interface WorkoutStatsProps {
  workout: WorkoutState;
  storageRefreshKey?: number;
}

export const WorkoutStats: React.FC<WorkoutStatsProps> = React.memo(({ workout, storageRefreshKey }) => {
  // Memoize expensive date/time formatting
  const { date, time } = React.useMemo(() =>
    formatWorkoutDateTime(workout.statistics.workoutStartTime),
    [workout.statistics.workoutStartTime]
  );

  // Memoize total workout time calculation
  const totalWorkoutTime = React.useMemo(() =>
    getTotalWorkoutTime(workout.statistics),
    [workout.statistics]
  );

  // Refresh experience data immediately before getting level info
  const [levelInfo, setLevelInfo] = React.useState(() => {
    experienceProcessor.refreshFromStorage();
    return experienceProcessor.getCurrentLevelInfo();
  });

  // Update when storageRefreshKey changes or on mount
  React.useEffect(() => {
    experienceProcessor.refreshFromStorage();
    const updated = experienceProcessor.getCurrentLevelInfo();
    setLevelInfo(updated);
  }, [storageRefreshKey]);

  return (
    <>
    <div className="mb-4 font-sans">
      <div className="w-20 h-20 mx-auto mb-3 bg-green-500 rounded-full flex items-center justify-center">
        <span className="text-3xl">🎉</span>
      </div>
      <h1 className="text-3xl font-bold mb-2 font-sans tracking-tight">
        Workout Complete
      </h1>
      <p 
        className="text-white/80 italic font-sans px-4 text-lg mb-6"
      >
        "{workout.currentPostWorkoutQuote}"
      </p>
    </div>
    
    {/* Level Progress Display - Just above workout session box */}
    <div className="mb-2">
      <LevelDisplay levelInfo={levelInfo} variant="full" />
    </div>

    <div id="workout-statistics" className="mb-2 bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/80 font-sans w-full relative">
      <h2 className="text-xl font-bold mb-2 text-center text-black font-sans tracking-tight">Workout Session</h2>
      
      <div className="mb-3 text-sm text-black text-center font-sans">
        <div className="font-medium">{date}</div>
        <div>{time}</div>
      </div>
      
      <div className="space-y-4 text-sm">
        {/* Row 1: Sets and Reps */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 font-mono">{workout.totalSets}</div>
            <div className="text-sm text-black font-sans">{workout.totalSets === 1 ? 'Set' : 'Sets'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600 font-mono">{workout.settings.repsPerSet}</div>
            <div className="text-sm text-black font-sans">{workout.settings.repsPerSet === 1 ? 'Rep / Set' : 'Reps / Set'}</div>
          </div>
        </div>
        
        {/* Row 2: Times */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-amber-600 font-mono">{formatDuration(workout.statistics.totalTimeStretched)}</div>
            <div className="text-xs text-black font-sans">Time Stretched</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-rose-600 font-mono">{formatDuration(workout.statistics.totalTimeExercised)}</div>
            <div className="text-xs text-black font-sans">Time Exercised</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-sky-600 font-mono">{formatDuration(workout.statistics.totalTimeRested)}</div>
            <div className="text-xs text-black font-sans">Time Rested</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-slate-600 font-mono">{formatDuration(workout.statistics.totalTimePaused)}</div>
            <div className="text-xs text-black font-sans">Time Paused</div>
          </div>
        </div>
        
        {/* Row 3: Total Time */}
        <div className="text-center">
          <div className="text-xl font-bold text-gray-700 font-mono">{formatDuration(totalWorkoutTime)}</div>
          <div className="text-xs text-black font-sans">Total Time</div>
        </div>
      </div>
      
      {/* Watermark */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 opacity-30 pointer-events-none">
        <div className="flex items-center justify-center">
          <Globe className="w-3 h-3 text-gray-600" />
          <span className="text-black text-xs font-mono">tempo.ntanis.dev</span>
        </div>
      </div>
    </div>
    </>
  );
});