import React from 'react';

interface PhaseDisplayProps {
  currentPhase: { label: string } | null;
  subtitle: string;
}

export const PhaseDisplay: React.FC<PhaseDisplayProps> = ({
  currentPhase,
  subtitle
}) => {
  return (
    <div className="mb-10">
      {/* Phase Label */}
      <h1 className="text-6xl font-bold mb-6 flex items-center justify-center font-sans tracking-tight">
        {currentPhase?.label}
      </h1>

      {/* Subtitle */}
      <div className="text-2xl font-semibold text-white/80 flex items-center justify-center px-2 font-sans">
        <span>{subtitle}</span>
      </div>
    </div>
  );
};