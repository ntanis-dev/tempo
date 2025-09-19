import React, { useMemo } from 'react';
import { SoundToggle } from './common/SoundToggle';
import { MutedToggle } from './common/MutedToggle';
import { useFadeIn } from '../hooks/useFadeIn';
import { useDebugMode } from '../contexts/DebugContext';
import { getFadeClasses } from '../utils/classNames';
import { audioManager } from '../utils/audio';
import { RotateCcw, Zap, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

interface PrepareScreenProps {
  onContinue: () => void;
  onResetWorkout: () => void;
  isResetting: boolean;
  isTransitioning: boolean;
}

const preWorkoutTips = [
  { icon: "💧", text: "Have a bottle of water nearby and stay hydrated." },
  { icon: "❤️", text: "Track your heart rate using a watch or fitness device if available." },  
  { icon: "🛑", text: "Stop if you feel dizzy, chest pain, or discomfort." },
  { icon: "👕", text: "Ensure you're wearing comfortable workout clothes." },
  { icon: "🏠", text: "Clear some space around you for safe movement." }
];

export const PrepareScreen: React.FC<PrepareScreenProps> = ({
  onContinue,
  onResetWorkout,
  isResetting,
  isTransitioning,
}) => {
  const isVisible = useFadeIn();
  const [isDebugMode] = useDebugMode();
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const countdownRef = React.useRef<NodeJS.Timeout>();

  // Memoize spinner component to prevent re-rendering issues
  const SpinnerIcon = useMemo(() =>
    (props: React.ComponentProps<'svg'>) =>
      <Loader2 {...props} className={`${props.className || ''} animate-spin`} />
  , []);

  // Handle countdown timer
  React.useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      onContinue();
      return;
    }

    // Play countdown sounds
    if (countdown === 1) {
      // Final countdown sound
      audioManager.playCountdownFinal();
    } else if (countdown > 1) {
      // Regular countdown tick
      audioManager.playCountdownTick();
    }

    countdownRef.current = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown, onContinue]);

  // Cancel countdown on page refresh or navigation
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
      setCountdown(null);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && countdown !== null) {
        if (countdownRef.current) {
          clearTimeout(countdownRef.current);
        }
        setCountdown(null);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown]);

  const handleReadyClick = () => {
    if (countdown === null) {
      setCountdown(isDebugMode ? 1 : 5);
    }
  };

  const handleStartOver = () => {
    // Clear countdown when starting over
    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
    }
    onResetWorkout();
  };

  return (
    <div className={`min-height h-screen flex items-center justify-center p-4 ${getFadeClasses(isVisible, isResetting, isTransitioning)}`}>
      {/* Sound and Muted Toggles */}
      <div className="fixed top-4 right-4 z-10 flex items-center space-x-2">
        <MutedToggle />
        <SoundToggle />
      </div>
      
      <div className="scalable max-w-2xl w-full text-center text-white mt-4 sm:mt-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4 font-sans tracking-tight">
            Preparation
          </h1>
        </div>
        
        {/* Tips List */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 sm:p-8 mb-4 sm:mb-8 border border-white/10 text-left">
          <div className="space-y-3 sm:space-y-4">
            {preWorkoutTips.map((tip, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-teal-700/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{tip.icon}</span>
                </div>
                <p className="text-white/90 text-sm sm:text-base leading-relaxed flex-1">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleReadyClick}
            variant={countdown !== null ? "secondary" : "primary"}
            size="sm"
            icon={
             isTransitioning || (countdown !== null && countdown > 0) ?
               SpinnerIcon :
             Zap
            }
            disabled={(countdown !== null && countdown > 0) || isTransitioning}
            className="w-full sm:w-auto sm:min-w-[200px] bg-teal-700 hover:bg-teal-800 text-white"
          >
            {isTransitioning ? "Starting" : (countdown !== null && countdown > 0 ? <span style={{ minWidth: '1ch', display: 'inline-block' }}>{countdown}</span> : "I'm Ready")}
          </Button>
          
          <Button
            onClick={handleStartOver}
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            className="w-full sm:w-auto sm:min-w-[150px]"
          >
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
};