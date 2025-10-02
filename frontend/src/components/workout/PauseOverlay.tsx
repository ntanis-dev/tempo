import React from 'react';

interface PauseOverlayProps {
  isVisible: boolean;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/85 flex items-center justify-center z-50" style={{ margin: 0, padding: 0 }}>
      <div className="text-center font-sans">
        <div className="text-7xl font-bold animate-pulse mb-4 text-white font-sans tracking-tight">
          PAUSED
        </div>
        <div className="text-lg sm:text-2xl text-white/80 font-sans">
          Click anywhere to resume.
        </div>
      </div>
    </div>
  );
};