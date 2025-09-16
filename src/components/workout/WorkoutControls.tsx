import React from 'react';
import { Pause, RotateCcw, SkipForward } from 'lucide-react';
import { TIME } from '../../constants';

interface WorkoutControlsProps {
  onTogglePause: () => void;
  onResetWorkout: () => void;
  onSkip: () => void;
  canSkip: boolean;
  onShowRestSkipError: () => void;
}

export const WorkoutControls: React.FC<WorkoutControlsProps> = ({
  onTogglePause,
  onResetWorkout,
  onSkip,
  canSkip,
  onShowRestSkipError
}) => {
  const [isShaking, setIsShaking] = React.useState(false);

  const handleClick = () => {
    if (canSkip) {
      onSkip();
    } else {
      onShowRestSkipError();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), TIME.SHAKE_DURATION);
    }
  };

  return (
    <div className="flex justify-center space-x-3">
      <button
        onClick={handleClick}
        className={`bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 min-w-[70px] justify-center font-sans ${
          !canSkip ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isShaking ? 'animate-pulse' : ''
        }`}
        style={{
          animation: isShaking ? 'shake 0.6s ease-in-out' : undefined
        }}
      >
        <SkipForward className="w-4 h-4" />
        <span>Done</span>
      </button>
      
      <button
        onClick={onTogglePause}
        className="bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 font-sans"
      >
        <Pause className="w-4 h-4" />
        <span>Pause</span>
      </button>
      
      <button
        onClick={onResetWorkout}
        className="bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 min-w-[70px] justify-center font-sans"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reset</span>
      </button>
    </div>
  );
};