import React from 'react';
import { WorkoutState } from '../types';
import { TIME } from '../constants';
import { getPhases } from '../utils/timer';
import { SoundToggle } from './common/SoundToggle';
import { MusicToggle } from './common/MusicToggle';
import { MutedToggle } from './common/MutedToggle';
import { ProgressBar } from './ui/ProgressBar';
import { WorkoutProgress } from './workout/WorkoutHeader';
import { PhaseDisplay } from './workout/PhaseDisplay';
import { WorkoutTimer } from './workout/WorkoutTimer';
import { QuoteDisplay } from './workout/QuoteDisplay';
import { WorkoutControls } from './workout/WorkoutControls';
import { useFadeIn } from '../hooks/useFadeIn';
import { getFadeClasses } from '../utils/classNames';

interface WorkoutScreenProps {
  workout: WorkoutState;
  onTogglePause: () => void;
  onResetWorkout: () => void;
  onSkip: () => void;
  isResetting: boolean;
  onShowRestSkipError: () => void;
}

export const WorkoutScreen: React.FC<WorkoutScreenProps> = ({
  workout,
  onTogglePause,
  onResetWorkout,
  onSkip,
  isResetting,
  onShowRestSkipError
}) => {
  const isVisible = useFadeIn();
  const [hideUI, setHideUI] = React.useState(false);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Auto-hide UI after 3 seconds of no mouse movement
  React.useEffect(() => {
    const handleMouseMove = () => {
      setHideUI(false);
      
      // Clear existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      // Set new timeout to hide UI after 3 seconds
      hideTimeoutRef.current = setTimeout(() => {
        setHideUI(true);
      }, 3000);
    };

    // Add mouse move listener
    window.addEventListener('mousemove', handleMouseMove);
    
    // Start the initial timer
    handleMouseMove();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const getCurrentPhase = () => {
    if (workout.phase === 'setup' || workout.phase === 'complete') return null;
    const phases = getPhases(workout.settings, false); // Don't pass debug mode here as it's just for display
    return phases[workout.phase as keyof typeof phases];
  };

  const getProgressPercentage = () => {
    if (workout.phase === 'setup' || workout.phase === 'complete') return 0;
    const currentPhase = getCurrentPhase();
    if (!currentPhase) return 0;
    return ((currentPhase.duration - workout.timeRemaining) / currentPhase.duration) * 100;
  };

  // const getOverallProgress = () => {
  //   if (workout.phase === 'setup' || workout.phase === 'prepare') return 0;
  //   if (workout.phase === 'complete') return 100;
  //
  //   // Count completed sets (a set is complete when rest finishes)
  //   const completedSets = workout.currentSet - 1;
  //
  //   return (completedSets / workout.totalSets) * 100;
  // };

  const getSubtitle = () => {
    switch (workout.phase) {
      case 'countdown':
        return workout.timeRemaining <= TIME.PREPARE_THRESHOLD ? 'Prepare to exercise!' : 'Stretch and warm up your muscles!';
      case 'work':
        return `Rep ${workout.currentRep} of ${workout.settings.repsPerSet}`;
      case 'rest':
        return workout.timeRemaining <= TIME.PREPARE_THRESHOLD ? 'Prepare to exercise!' : 'Stay hydrated!';
      default:
        return '';
    }
  }
  const currentPhase = getCurrentPhase();
  // const overallProgress = calculateWorkoutProgress(workout);

  return (
    <div className={`min-height h-screen flex flex-col items-center justify-center p-4 text-white w-full ${getFadeClasses(isVisible, isResetting)} ${hideUI ? 'cursor-none' : ''}`}>
      {/* Sound, Music and Muted Toggles */}
      <div className={`fixed top-4 right-4 z-10 flex items-center space-x-2 transition-opacity duration-300 ${hideUI ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <MutedToggle />
        <MusicToggle />
        <SoundToggle />
      </div>

      <div className="scalable text-center relative font-sans w-full max-w-none">
        <WorkoutProgress
          workout={workout}
        />

        <PhaseDisplay
          currentPhase={currentPhase}
          subtitle={getSubtitle()}
        />

        {/* Timer */}
        <WorkoutTimer timeRemaining={workout.timeRemaining} phase={workout.phase} />

        {/* Motivational Quote */}
        <QuoteDisplay
          quote={
            workout.phase === 'work' ? workout.currentQuote :
            workout.phase === 'rest' ? workout.currentCalmingQuote :
            (workout.phase === 'countdown' || workout.phase === 'prepare') ? workout.currentPreExerciseQuote :
            ''
          }
        />

        {/* Phase Progress */}
        <div className="mb-12 mt-6">
          <ProgressBar
            progress={getProgressPercentage()}
            height="lg"
          />
        </div>

        {/* Control Buttons */}
        <div className={`transition-opacity duration-300 ${hideUI ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <WorkoutControls
            onTogglePause={onTogglePause}
            onResetWorkout={onResetWorkout}
            onSkip={onSkip}
            canSkip={workout.phase !== 'rest'}
            onShowRestSkipError={onShowRestSkipError}
          />
        </div>
      </div>
    </div>
  );
};