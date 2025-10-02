import React from 'react';
import { Star } from 'lucide-react';
import { LevelInfo } from '../../types/experience';
import { getLevelTitle } from '../../constants/experience';

interface LevelDisplayProps {
  levelInfo: LevelInfo;
  variant?: 'compact' | 'full';
  showTitle?: boolean;
  onClick?: () => void;
}

export const LevelDisplay: React.FC<LevelDisplayProps> = React.memo(({
  levelInfo,
  variant = 'compact',
  showTitle = true,
  onClick
}) => {
  // Memoize title calculation
  const title = React.useMemo(() => getLevelTitle(levelInfo.level), [levelInfo.level]);

  if (variant === 'compact') {
    return (
      <div 
        className={`flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 ${
          onClick ? 'cursor-pointer hover:bg-white/20 transition-colors' : ''
        }`}
        onClick={onClick}
      >
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-white font-bold font-mono">{levelInfo.level}</span>
        </div>
        {showTitle && (
          <span className="text-white/80 text-sm font-medium hidden sm:inline">{title}</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white/10 backdrop-blur-md rounded-lg p-2.5 border border-white/20 ${
        onClick ? 'cursor-pointer hover:bg-white/20 transition-colors' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Star className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-white font-bold text-sm font-mono">Level {levelInfo.level}</div>
            {showTitle && <div className="text-white/70 text-xs">{title}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-white font-mono text-xs">
            {levelInfo.xpForThisLevel} / {levelInfo.xpRequired} XP
          </div>
        </div>
      </div>

      <div>
        <div className="w-full bg-white/20 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
        <div className="text-right text-xs text-white/60 mt-0.5">
          {Math.round(levelInfo.progressPercent)}%
        </div>
      </div>
    </div>
  );
});