import React, { useState, useRef } from 'react';
import { Music, Music2, Music3 } from 'lucide-react';
import { musicManager } from '../../utils/music';

export const MusicToggle: React.FC = () => {
  const [musicVolume, setMusicVolume] = useState(musicManager.getMusicVolume());
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
    setMusicVolume(newVolume);
    musicManager.setMusicVolume(newVolume);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getMusicIcon = () => {
    if (musicVolume === 0) return Music3;
    if (musicVolume < 50) return Music2;
    return Music;
  };

  const MusicIcon = getMusicIcon();

  // Update state when storage is cleared
  React.useEffect(() => {
    const handleStorageChange = () => {
      const newVolume = musicManager.getMusicVolume();
      setMusicVolume(newVolume);
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
        musicVolume > 0
          ? 'bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/40'
          : 'bg-white/10 hover:bg-white/20 text-white/50 border-white/20 hover:border-white/30'
      } cursor-pointer`}
    >
      {/* Icon Section */}
      <div className="flex items-center space-x-1.5 px-2.5 py-1.5 flex-shrink-0">
          <MusicIcon className="w-4 h-4" />
          <span className="text-xs font-medium">
            {musicVolume === 0 ? 'Off' : `${Math.round(musicVolume)}%`}
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
          max="100"
          step="5"
          value={musicVolume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          className="w-16 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer volume-slider mr-3 mx-2"
          style={{
            background: `linear-gradient(to right, #f97316 0%, #f97316 ${musicVolume}%, rgba(255,255,255,0.2) ${musicVolume}%, rgba(255,255,255,0.2) 100%)`
          }}
        />
        </div>
      </div>
    </button>
  );
};