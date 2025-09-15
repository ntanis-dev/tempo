import React from 'react';
import { WorkoutState } from '../types';
import { SoundToggle } from './common/SoundToggle';
import { FireworksAnimation } from './complete/FireworksAnimation';
import { WorkoutStats } from './complete/WorkoutStats';
import { CompletionActions } from './complete/CompletionActions';
import { LevelDisplay } from './ui/LevelDisplay';
import { experienceProcessor } from '../utils/experienceProcessor';
import { useFadeIn } from '../hooks/useFadeIn';
import { getFadeClasses } from '../utils/classNames';

interface CompleteScreenProps {
  workout: WorkoutState;
  onResetWorkout: () => void;
  isResetting?: boolean;
  onShowSuccess: (title: string, message?: string) => void;
  onShowError: (title: string, message?: string) => void;
  storageRefreshKey?: number;
}

export const CompleteScreen: React.FC<CompleteScreenProps> = ({
  workout,
  onResetWorkout,
  isResetting = false,
  onShowSuccess,
  onShowError,
  storageRefreshKey = 0
}) => {
  const isVisible = useFadeIn();
  const [levelInfo, setLevelInfo] = React.useState(experienceProcessor.getCurrentLevelInfo());

  // Update level info when component mounts or when storage is refreshed
  React.useEffect(() => {
    setLevelInfo(experienceProcessor.getCurrentLevelInfo());
  }, [storageRefreshKey]);

  return (
    <div className={`min-height h-screen flex items-center justify-center p-4 w-full ${getFadeClasses(isVisible, isResetting)}`}>
      {/* Sound Toggle */}
      <div className="fixed top-4 right-4 z-10">
        <div className="flex flex-col space-y-2">
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