import React, { useState } from 'react';
import { Contrast } from 'lucide-react';
import { storageService } from '../../services/StorageService';

export const MutedToggle: React.FC = () => {
  const [isMuted, setIsMuted] = useState(storageService.isMutedMode());

  const toggleMuted = () => {
    const newValue = !isMuted;
    setIsMuted(newValue);
    storageService.setMutedMode(newValue);
    // Dispatch event to update backgrounds
    window.dispatchEvent(new CustomEvent('mutedModeChanged', { detail: newValue }));
  };

  return (
    <button
      onClick={toggleMuted}
      className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full transition-all duration-200 backdrop-blur-sm border ${
        isMuted
          ? 'bg-purple-500/20 border-purple-400/30 hover:bg-purple-500/30'
          : 'bg-white/10 border-white/20 hover:bg-white/20'
      }`}
      title={isMuted ? 'Switch to vibrant colors' : 'Switch to muted colors'}
    >
      <Contrast
        className={`w-4 h-4 transition-colors ${
          isMuted ? 'text-purple-400' : 'text-white/70'
        }`}
      />
      <span className={`text-xs font-medium transition-colors ${
        isMuted ? 'text-purple-400' : 'text-white/70'
      }`}>
        {isMuted ? 'Muted' : 'Vibrant'}
      </span>
    </button>
  );
};