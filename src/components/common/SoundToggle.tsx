import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { audioManager } from '../../utils/audio';
import { savePreviousVolume, loadPreviousVolume } from '../../utils/storage';

export const SoundToggle: React.FC = () => {
  const [volume, setVolume] = useState(audioManager.getVolume());
  const [previousVolume, setPreviousVolume] = useState(loadPreviousVolume());
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLButtonElement>(null);

  // Close slider when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleVolumeChange = (newVolume: number) => {
    // Store previous volume if we're not going to 0
    if (newVolume > 0 && volume !== newVolume) {
      const prevVol = volume > 0 ? volume : previousVolume;
      setPreviousVolume(prevVol);
      savePreviousVolume(prevVol);
    }
    
    setVolume(newVolume);
    audioManager.setVolume(newVolume);
    
    // Play test sound when adjusting volume (but not when muting)
    if (newVolume > 0) {
      audioManager.playCountdownTick();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  // Update state when storage is cleared
  React.useEffect(() => {
    const handleStorageChange = () => {
      const newVolume = audioManager.getVolume();
      const newPreviousVolume = loadPreviousVolume();
      setVolume(newVolume);
      setPreviousVolume(newPreviousVolume);
    };

    // Listen for storage events (when cleared from another component)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <button
      ref={containerRef}
      onClick={toggleExpanded}
      className={`flex items-center rounded-full backdrop-blur-sm border transition-all duration-300 ${
        volume > 0
          ? 'bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/40' 
          : 'bg-white/10 hover:bg-white/20 text-white/50 border-white/20 hover:border-white/30'
      } cursor-pointer`}
    >
      {/* Icon Section */}
      <div className="flex items-center space-x-2 px-3 py-2 flex-shrink-0">
          <VolumeIcon className="w-4 h-4" />
          <span className="text-xs font-medium">
            {volume === 0 ? 'Muted' : `${Math.round(volume * 100)}%`}
          </span>
      </div>

      {/* Volume Slider - Expanded */}
      <div className={`flex items-center transition-all duration-300 overflow-hidden ${
        isExpanded ? 'w-20 opacity-100' : 'w-0 opacity-0'
      }`}>
        <div className="flex justify-center px-3 w-full">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          className="w-16 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer slider mr-3 mx-2"
          style={{
            background: `linear-gradient(to right, #f97316 0%, #f97316 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
          }}
        />
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #f97316;
            cursor: grab;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .slider::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(1.1);
          }
          .slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #f97316;
            cursor: grab;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .slider::-moz-range-thumb:active {
            cursor: grabbing;
            transform: scale(1.1);
          }
        `}</style>
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #f97316;
            cursor: pointer;
          }
        `}</style>
        </div>
      </div>
    </button>
  );
};