import React, { useState } from 'react';
import { X, Trophy, Star } from 'lucide-react';
import { TIME } from '../../constants';
import { Achievement } from '../../types/achievements';
import { achievementProcessor } from '../../utils/achievementProcessor';
import { getSessionProgress, WorkoutData } from '../../utils/achievementFiltering';
import { getRarityColor, getRarityText, sortAchievementsByRarity, calculateProgressPercent } from '../../utils/achievementUI';
import { getAchievementDefinition } from '../../achievements';

interface AchievementProgressModalProps {
  isOpen: boolean;
  achievements: Achievement[];
  progressAchievements?: Achievement[];
  workoutData?: WorkoutData;
  onClose: () => void;
}

export const AchievementProgressModal: React.FC<AchievementProgressModalProps> = ({
  isOpen,
  achievements,
  progressAchievements = [],
  workoutData,
  onClose
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  // Only render if modal is open AND there are either unlocked achievements or progress updates on locked achievements
  if (!isOpen || (achievements.length === 0 && progressAchievements.length === 0)) return null;

  // Fade in animation
  React.useEffect(() => {
    if (isOpen && !isClosing) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, isClosing]);

  // Handle fade out transition
  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleBackdropClickWithFade = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Sort achievements by rarity
  const sortedAchievements = sortAchievementsByRarity(achievements);
  const sortedProgressAchievements = sortAchievementsByRarity(progressAchievements);

  return (
    <div 
      className={`fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 z-50 pointer-events-auto transition-opacity duration-300 ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClickWithFade}
    >
      <div className={`max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl rounded-2xl bg-black/40 border border-white/20 relative transition-all duration-300 transform ${
        isVisible && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>

        {/* Header */}
        <div className="text-center p-6 pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Achievements
          </h2>
          <p className="text-white/70 text-sm">
            Your last session's progress.
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 max-h-[50vh] overflow-y-auto space-y-5 workout-history-scrollable">
          
          {/* Unlocked Achievements */}
          {sortedAchievements.length > 0 && (
            <div>
              {progressAchievements.length > 0 && (
                <h3 className="text-white font-semibold text-sm mb-4 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-400" />
                  New Unlocks
                </h3>
              )}
              <div className="space-y-4">
                {sortedAchievements.map((achievement, index) => (
                <div
                  key={achievement.id}
                  className={`rounded-lg p-4 border-2 ${getRarityColor(achievement.rarity)} animate-in slide-in-from-bottom-4 duration-500`}
                  style={{ animationDelay: `${index * TIME.ACHIEVEMENT_UNLOCK_DELAY}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl flex-shrink-0 animate-bounce" style={{ animationDelay: `${index * (TIME.ACHIEVEMENT_UNLOCK_DELAY + 50)}ms` }}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-white text-sm leading-tight">
                          {achievement.title}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRarityColor(achievement.rarity)}`}>
                            {getRarityText(achievement.rarity)}
                          </span>
                        </div>
                      </div>
                      <p className="text-white/80 text-xs leading-snug">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Progress Updates */}
          {sortedProgressAchievements.length > 0 && (
            <div
            >
              {achievements.length > 0 ? (
                <h3 className="text-white font-semibold text-sm mb-4 mt-6 flex items-center border-t border-white/20 pt-4">
                  <Trophy className="w-4 h-4 mr-2 text-blue-400" />
                  Progress Updates
                </h3>
              ) : (
                <h3 className="text-white font-semibold text-sm mb-4 flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-blue-400" />
                  Progress Updates
                </h3>
              )}
              <div className="space-y-4">
                {sortedProgressAchievements.map((achievement, index) => {
                const progressPercent = calculateProgressPercent(achievement);
                
                // Calculate session progress percentage
                const getSessionProgressPercent = (achievement: Achievement): number => {
                  const achievementDef = getAchievementDefinition(achievement.id);
                  if (!achievementDef || !workoutData) return 0;
                  
                  let sessionValue = 0;
                  
                  // Extract session value based on achievement type
                  if (achievement.id.includes('streak_') && !achievement.id.includes('consistency')) {
                    // Daily streaks
                    sessionValue = workoutData.isNewDay ? 1 : 0;
                  } else if (achievement.id === 'consistency_king') {
                    // Weekly streak
                    sessionValue = (!workoutData.lastWorkoutDate || workoutData.isNewWeek) ? 1 : 0;
                  } else if (achievement.id.includes('total_') && achievement.id.includes('sets')) {
                    // Set achievements
                    sessionValue = workoutData.sets || 0;
                  } else if (achievement.id.includes('total_') && achievement.id.includes('reps')) {
                    // Rep achievements
                    sessionValue = workoutData.reps || 0;
                  } else if (achievement.id === 'total_50_hours') {
                    // Time achievement
                    sessionValue = workoutData.timeSeconds || 0;
                  } else {
                    // Default for other achievements
                    sessionValue = 1;
                  }
                  
                  return Math.min(100, (sessionValue / (achievement.maxProgress || 1)) * 100);
                };
                
                const sessionProgressPercent = getSessionProgressPercent(achievement);
                
                return (
                  <div
                    key={achievement.id}
                    className={`rounded-lg p-3 border-2 ${getRarityColor(achievement.rarity)} opacity-70 animate-in slide-in-from-bottom-2 duration-300`}
                    style={{ animationDelay: `${(sortedAchievements.length + index) * 100}ms` }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-xl flex-shrink-0 opacity-70">
                        {achievement.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-white/90 text-sm leading-tight">
                            {achievement.title}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRarityColor(achievement.rarity)}`}>
                            {getRarityText(achievement.rarity)}
                          </span>
                        </div>
                        <p className="text-white/60 text-xs leading-snug mb-2">
                          {achievement.description}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-green-400 font-medium">
                              {getSessionProgress(achievement, workoutData)}
                            </span>
                            <span className="text-xs text-white/60">
                              {Math.round(progressPercent)}%
                            </span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full bg-green-400 transition-all duration-500"
                              style={{ 
                                width: `${Math.max(1, Math.min(100, sessionProgressPercent))}%`,
                                animationDelay: `${(sortedAchievements.length + index) * 200}ms`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};