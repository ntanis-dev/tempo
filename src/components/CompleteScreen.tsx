import React from 'react';
import { WorkoutState } from '../types';
import { SoundToggle } from './common/SoundToggle';
import { MusicToggle } from './common/MusicToggle';
import { MutedToggle } from './common/MutedToggle';
import { FireworksAnimation } from './complete/FireworksAnimation';
import { WorkoutStats } from './complete/WorkoutStats';
import { CompletionActions } from './complete/CompletionActions';
import { useFadeIn } from '../hooks/useFadeIn';
import { getFadeClasses } from '../utils/classNames';

interface CompleteScreenProps {
  workout: WorkoutState;
  onResetWorkout: () => void;
  isResetting?: boolean;
}

export const CompleteScreen: React.FC<CompleteScreenProps> = ({
  workout,
  onResetWorkout,
  isResetting = false
}) => {
  const isVisible = useFadeIn();


  return (
    <div className={`min-height h-screen flex items-center justify-center p-4 w-full ${getFadeClasses(isVisible, isResetting)}`}>
      {/* Sound, Music and Muted Toggles */}
      <div className="fixed top-4 right-4 z-10">
        <div className="flex items-center space-x-2">
          <MutedToggle />
          <MusicToggle />
          <SoundToggle />
        </div>
      </div>
      
      <FireworksAnimation />

      <div className="scalable rounded-3xl p-4 text-center text-white font-sans w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
        <div className="rounded-3xl p-4 text-center text-white font-sans w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-4xl mx-auto">

          <WorkoutStats workout={workout} />
          
          <div className="mb-8 sm:mb-12" />

            <CompletionActions
              onResetWorkout={onResetWorkout}
            />
        </div>
      </div>
    </div>
  );
};