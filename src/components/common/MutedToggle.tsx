import React, { useState, useEffect } from 'react';
import { Contrast } from 'lucide-react';
import { storageService } from '../../services/StorageService';

export const MutedToggle: React.FC = () => {
  const [isMuted, setIsMuted] = useState(storageService.isMutedMode());

  // Listen for storage changes
  useEffect(() => {
    // Check for storage changes periodically (for when storage is cleared)
    const handleStorageChange = () => {
      const currentMuted = storageService.isMutedMode();
      if (currentMuted !== isMuted) {
        setIsMuted(currentMuted);
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom refresh event
    const handleRefresh = () => {
      setIsMuted(storageService.isMutedMode());
    };
    window.addEventListener('storageRefresh', handleRefresh as any);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageRefresh', handleRefresh as any);
    };
  }, [isMuted]);

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
          ? 'bg-gray-500/20 border-gray-400/30 hover:bg-gray-500/30'
          : 'bg-white/10 border-white/20 hover:bg-white/20'
      }`}
    >
      <Contrast
        className={`w-4 h-4 transition-colors ${
          isMuted ? 'text-gray-400' : 'text-white/70'
        }`}
      />
      <span className={`text-xs font-medium transition-colors ${
        isMuted ? 'text-gray-400' : 'text-white/70'
      }`}>
        {isMuted ? 'Muted' : 'Vibrant'}
      </span>
    </button>
  );
};