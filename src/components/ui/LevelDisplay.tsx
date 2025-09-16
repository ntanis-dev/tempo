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

export const LevelDisplay: React.FC<LevelDisplayProps> = ({ 
  levelInfo, 
  variant = 'compact',
  showTitle = true,
  onClick
}) => {
  const title = getLevelTitle(levelInfo.level);

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
      className={`bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 ${
        onClick ? 'cursor-pointer hover:bg-white/20 transition-colors' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <div className="text-white font-bold text-lg font-mono">Level {levelInfo.level}</div>
            {showTitle && <div className="text-white/70 text-sm text-left">{title}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/80 text-sm">XP</div>
          <div className="text-white font-mono text-xs sm:text-sm lg:text-lg">
            {levelInfo.xpForThisLevel} / {levelInfo.xpRequired}
          </div>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span></span>
          <span>{Math.round(levelInfo.progressPercent)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};