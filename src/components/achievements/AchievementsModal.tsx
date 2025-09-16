import React, { useState } from 'react';
import { Trophy, CheckCircle, Star, RotateCcw } from 'lucide-react';
import { Achievement } from '../../types/achievements';
import { achievementProcessor } from '../../utils/achievementProcessor';
import { Modal } from '../ui/Modal';
import { ModalHeader } from '../ui/ModalHeader';
import { MODAL_STYLES } from '../../constants/styles';
import { useDebugMode } from '../../contexts/DebugContext';
import { getRarityColor, getRarityText, getRarityBadgeClasses, sortAchievementsByRarity, getAchievementDisplay, calculateProgressPercent } from '../../utils/achievementUI';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSuccess: (title: string, message?: string) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, onShowSuccess }) => {
  const [isDebugMode] = useDebugMode();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  // const handleBackdropClick = useModalBackdrop(onClose);

  // Load achievements whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setAchievements(achievementProcessor.getAchievements());
    }
  }, [isOpen]);

  // Fade in animation
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsClosing(false);
    }
  }, [isOpen]);

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
  if (!isOpen) return null;

  const handleResetAchievements = () => {
    achievementProcessor.resetAchievements();
    setAchievements(achievementProcessor.getAchievements());
    setShowResetConfirm(false);
    onShowSuccess('Achievements Reset', 'All achievements have been reset.');
  };

  // Sort achievements by rarity 
  const sortedAchievements = sortAchievementsByRarity(achievements);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const hasAnyProgress = achievements.some(a => a.isUnlocked || (a.progress && a.progress > 0));

  return (
    <div 
      className={`${MODAL_STYLES.backdrop} transition-opacity duration-300 ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClickWithFade}
    >
      <div className={`max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl rounded-2xl bg-black/30 border border-white/10 transition-all duration-300 transform ${
        isVisible && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <ModalHeader
          icon={Trophy}
          title="Achievements"
          subtitle={`${unlockedCount} / ${totalCount} (${Math.round((unlockedCount / totalCount) * 100)}%)`}
          onClose={handleClose}
          actions={
            hasAnyProgress && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-2 hover:bg-red-500/30 rounded-full transition-colors text-red-300 hover:text-red-200"
                title="Reset Achievements"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )
          }
        />

        {/* Achievements Grid */}
        <div className={`${MODAL_STYLES.content} p-4`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedAchievements.map((achievement) => {
              const display = getAchievementDisplay(achievement, isDebugMode);
              const progressPercent = calculateProgressPercent(achievement);
              
              return (
                <div
                key={achievement.id}
               className={`relative rounded-lg p-3 border-2 transition-all min-h-[140px] flex flex-col ${
                  achievement.isUnlocked 
                    ? getRarityColor(achievement.rarity) + ' opacity-100' 
                    : 'border-gray-700/30 bg-gray-700/10 opacity-60'
                }`}
              >
                {/* Rarity Badge */}
                <div className="absolute top-2 right-2">
                  <span className={getRarityBadgeClasses(achievement.rarity)}>
                    {getRarityText(achievement.rarity)}
                  </span>
                </div>

                {/* Achievement Content */}
               <div className="flex items-start space-x-3 pr-16 flex-1">
                  <div className="text-2xl flex-shrink-0">
                    {display.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-bold text-sm leading-tight ${achievement.isUnlocked ? 'text-white' : 'text-white/60'}`}>
                        {display.title}
                      </h3>
                      {achievement.isUnlocked && (
                        <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className={`text-xs leading-snug mb-2 ${achievement.isUnlocked ? 'text-white/80' : 'text-white/50'} ${
                      display.description === "???" ? 'italic font-medium' : ''
                    }`}>
                      {display.description}
                    </p>
                  </div>
                </div>

               {/* Bottom section for unlock date and progress */}
               <div className="mt-auto">
                 {/* Unlock Date */}
                 {achievement.isUnlocked && achievement.unlockedAt && (
                   <div className="mt-2 pl-11 text-xs text-white/50 flex items-center space-x-1">
                     <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                     <span>{new Date(achievement.unlockedAt).toLocaleDateString()}, {new Date(achievement.unlockedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                   </div>
                 )}

                 {/* Progress Bar - Full Width */}
                 {achievement.maxProgress && (
                   <div className="mt-3 pl-11">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-xs text-white/60">
                         {achievement.id === 'total_50_hours' 
                           ? `${Math.floor((achievement.progress || 0) / 3600)}h / ${Math.floor((achievement.maxProgress || 0) / 3600)}h`
                           : `${achievement.progress || 0} / ${achievement.maxProgress}`
                         }
                       </span>
                       <span className="text-xs text-white/60">
                         {Math.round(((achievement.progress || 0) / achievement.maxProgress) * 100)}%
                       </span>
                     </div>
                     <div className="w-full bg-white/20 rounded-full h-1.5">
                       <div 
                         className={`h-1.5 rounded-full transition-all ${
                           achievement.isUnlocked ? 'bg-green-400' : 'bg-white/40'
                         }`}
                         style={{ 
                            width: `${Math.min(100, progressPercent)}%` 
                         }}
                       />
                     </div>
                   </div>
                 )}
               </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)}>
            <div className="text-center">
              <RotateCcw className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-bold text-white mb-2">Reset Achievements</h3>
              <p className="text-sm sm:text-base text-white/80 mb-6">
                This will reset all your achievements.
                <br/>This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleResetAchievements}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-base font-medium transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-base font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};