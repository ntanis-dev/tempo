import React from 'react';
import { WorkoutState, TimerSettings } from '../types';
import { SoundToggle } from './common/SoundToggle';
import { SetupHeader } from './setup/SetupHeader';
import { WorkoutSettings } from './setup/WorkoutSettings';
import { SetupActions } from './setup/SetupActions';
import { PWAInstallButton } from './setup/PWAInstallButton';
import { SetupMenu } from './setup/SetupMenu';
import { LevelDisplay } from './ui/LevelDisplay';
import { experienceProcessor } from '../utils/experienceProcessor';
import { useFadeIn } from '../hooks/useFadeIn';
import { getFadeClasses } from '../utils/classNames';

interface SetupScreenProps {
  workout: WorkoutState;
  onAdjustSets: (delta: number) => void;
  onAdjustTime: (type: keyof TimerSettings, delta: number) => void;
  onStartWorkout: () => void;
  onShowHistory: () => void;
  onShowAchievements: () => void;
  onShowStorage: () => void;
  onShowLevels: () => void;
  onShowWhatsNew: () => void;
  isTransitioning: boolean;
  isResetting: boolean;
  waitingForAchievements: boolean;
  menuKey: number;
  storageRefreshKey: number;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  workout,
  onAdjustSets,
  onAdjustTime,
  onStartWorkout,
  onShowHistory,
  onShowAchievements,
  onShowStorage,
  onShowLevels,
  onShowWhatsNew,
  isTransitioning,
  isResetting,
  waitingForAchievements,
  menuKey,
  storageRefreshKey
}) => {
  const isVisible = useFadeIn(waitingForAchievements ? 0 : 50); // No delay if waiting for achievements
  const [levelInfo, setLevelInfo] = React.useState(experienceProcessor.getCurrentLevelInfo());

  // Update level info when component mounts or when potentially returning from a workout
  React.useEffect(() => {
    setLevelInfo(experienceProcessor.getCurrentLevelInfo());
  }, []);
  
  // Update level info when storage is refreshed
  React.useEffect(() => {
    setLevelInfo(experienceProcessor.getCurrentLevelInfo());
  }, [storageRefreshKey]);

  return (
    <div className={`min-height h-screen flex items-center justify-center p-4 ${getFadeClasses(isVisible && !waitingForAchievements, isResetting, isTransitioning)}`}>
      {/* Sound Toggle */}
      <div className="fixed top-4 right-4 z-10">
        <SoundToggle />
      </div>
      
      {/* Level Display - Centered */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
        <LevelDisplay levelInfo={levelInfo} variant="compact" onClick={onShowLevels} />
      </div>
      
      {/* Menu */}
      <div className="fixed top-4 left-4 z-10">
        <SetupMenu 
          onShowHistory={onShowHistory} 
          onShowAchievements={onShowAchievements} 
          onShowStorage={onShowStorage} 
          onShowLevels={onShowLevels}
          onShowWhatsNew={onShowWhatsNew}
          key={menuKey}
        />
      </div>
      
      {/* PWA Install Button - Bottom Center */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <PWAInstallButton />
      </div>
      
      
      <div className="scalable bg-transparent rounded-3xl p-4 max-w-4xl w-full text-center text-white">
        <div className="font-sans">
          <SetupHeader />
        </div>
        
        <div className="font-sans">
          <WorkoutSettings
            workout={workout}
            settings={workout.settings}
            totalSets={workout.totalSets}
            onAdjustSets={onAdjustSets}
            onAdjustTime={onAdjustTime}
          />
        </div>

        <div className="font-sans">
          <SetupActions
            onStartWorkout={onStartWorkout}
            isTransitioning={isTransitioning}
          />
        </div>
      </div>
    </div>
  );
};