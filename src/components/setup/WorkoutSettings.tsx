import React from 'react';
import { TimerSettings, WorkoutState } from '../../types';
import { UnifiedCounter } from '../ui/UnifiedCounter';
import { calculateTotalWorkoutDuration } from '../../utils/formatters';
import { useDebugMode } from '../../contexts/DebugContext';
import { LIMITS, UI } from '../../constants';

interface WorkoutSettingsProps {
  workout: WorkoutState;
  settings: TimerSettings;
  totalSets: number;
  onAdjustSets: (delta: number) => void;
  onAdjustTime: (type: keyof TimerSettings, delta: number) => void;
}

export const WorkoutSettings: React.FC<WorkoutSettingsProps> = ({
  workout,
  settings,
  totalSets,
  onAdjustSets,
  onAdjustTime
}) => {
  const [showRestTooltip, setShowRestTooltip] = React.useState(false);
  const [isDebugMode] = useDebugMode();
  const previousDebugMode = React.useRef(isDebugMode);
  const isInitialMount = React.useRef(true);
  
  // Track debug mode changes and auto-set timers when enabling (not on initial load)
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousDebugMode.current = isDebugMode;
      return;
    }
    
    if (!previousDebugMode.current && isDebugMode) {
      // Debug mode was just enabled - set timers to 1s
      onAdjustTime('stretchTime', 1 - settings.stretchTime);
      onAdjustTime('restTime', 1 - settings.restTime);
    }
    
    previousDebugMode.current = isDebugMode;
  }, [isDebugMode, onAdjustTime, settings.stretchTime, settings.restTime]);
  
  // Auto-adjust values when debug mode is disabled and they're out of bounds
  React.useEffect(() => {
    if (!isDebugMode) {
      // When debug mode is disabled, ensure values meet minimum requirements
      const stretchMin = LIMITS.STRETCH_TIME.MIN;
      const restMin = LIMITS.REST_TIME.MIN;
      
      if (settings.stretchTime < stretchMin) {
        onAdjustTime('stretchTime', stretchMin - settings.stretchTime);
      }
      
      if (settings.restTime < restMin) {
        onAdjustTime('restTime', restMin - settings.restTime);
      }
    }
  }, [isDebugMode, settings.stretchTime, settings.restTime, onAdjustTime]);
  
  const getMinValue = (type: 'stretch' | 'rest') => {
    if (type === 'stretch') {
      return isDebugMode ? 1 : LIMITS.STRETCH_TIME.MIN;
    }
    return isDebugMode ? 1 : LIMITS.REST_TIME.MIN;
  };

  return (
    <div className="my-4 sm:my-8 md:my-12 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg relative max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-4 text-center text-white font-sans tracking-tight">Workout Settings</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <UnifiedCounter
          label="Sets"
          value={workout.totalSets}
          onIncrement={() => onAdjustSets(1)}
          onDecrement={() => onAdjustSets(-1)}
          min={LIMITS.SETS.MIN}
          max={LIMITS.SETS.MAX}
        />

        <UnifiedCounter
          label="Reps / Set"
          value={workout.settings.repsPerSet}
          onIncrement={() => onAdjustTime('repsPerSet', 1)}
          onDecrement={() => onAdjustTime('repsPerSet', -1)}
          min={LIMITS.REPS.MIN}
          max={LIMITS.REPS.MAX}
        />
      </div>
      
      {/* Time Settings - Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <UnifiedCounter
          label="Stretch Time"
          value={settings.stretchTime}
          onIncrement={() => onAdjustTime('stretchTime', settings.stretchTime < UI.TIME_INCREMENT_THRESHOLD ? 1 : 5)}
          onDecrement={() => onAdjustTime('stretchTime', settings.stretchTime <= UI.TIME_INCREMENT_THRESHOLD ? -1 : -5)}
          min={isDebugMode ? 1 : 15}
          max={LIMITS.STRETCH_TIME.MAX}
          unit="s"
          minusDisabled={settings.stretchTime <= (isDebugMode ? 1 : 15)}
          plusDisabled={settings.stretchTime >= LIMITS.STRETCH_TIME.MAX}
          color="orange"
        />

        <UnifiedCounter
          label="Time / Rep"
          value={settings.timePerRep}
          onIncrement={() => onAdjustTime('timePerRep', 1)}
          onDecrement={() => onAdjustTime('timePerRep', -1)}
          min={LIMITS.TIME_PER_REP.MIN}
          max={LIMITS.TIME_PER_REP.MAX}
          unit="s"
          minusDisabled={settings.timePerRep <= LIMITS.TIME_PER_REP.MIN}
          plusDisabled={settings.timePerRep >= LIMITS.TIME_PER_REP.MAX}
          color="red"
        />

        <div
          className="relative"
          onMouseEnter={() => totalSets === 1 && setShowRestTooltip(true)}
          onMouseLeave={() => setShowRestTooltip(false)}
        >
          <UnifiedCounter
            label="Rest Time / Set"
            value={settings.restTime}
            onIncrement={() => onAdjustTime('restTime', settings.restTime < UI.TIME_INCREMENT_THRESHOLD ? 1 : 5)}
            onDecrement={() => onAdjustTime('restTime', settings.restTime <= UI.TIME_INCREMENT_THRESHOLD ? -1 : -5)}
            min={isDebugMode ? 1 : 15}
            max={LIMITS.REST_TIME.MAX}
            unit="s"
            disabled={totalSets === 1}
            minusDisabled={settings.restTime <= (isDebugMode ? 1 : 15)}
            plusDisabled={settings.restTime >= LIMITS.REST_TIME.MAX}
            color="blue"
            retainMinusColorWhenDisabled={true}
            retainPlusColorWhenDisabled={true}
          />

        {totalSets === 1 && showRestTooltip && (
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10 z-20 pointer-events-none">
            <div className="bg-black/90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap relative">
              Single set workouts don't require rest periods.
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-black/90"></div>
            </div>
          </div>
        )}
        </div>
      </div>

      <div className="space-y-1 text-xs text-white/70 pt-2 border-t border-white/20">
        <div className="flex justify-between">
          <span>Total Workout Time</span>
          <span>{calculateTotalWorkoutDuration(totalSets, settings)}</span>
        </div>
      </div>
    </div>
  );
};