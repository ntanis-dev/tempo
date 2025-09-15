import React, { useState } from 'react';
import { Star, RefreshCw, Zap, Trophy, Target, BookOpen, Heart, Play } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ModalHeader } from '../ui/ModalHeader';
import { LevelDisplay } from '../ui/LevelDisplay';
import { experienceProcessor } from '../../utils/experienceProcessor';
import { XP_SOURCES, getLevelTitle } from '../../constants/experience';
import { useModalBackdrop } from '../../hooks/useModalBackdrop';
import { MODAL_STYLES } from '../../constants/styles';

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSuccess: (title: string, message?: string) => void;
}

export const ExperienceModal: React.FC<ExperienceModalProps> = ({ isOpen, onClose, onShowSuccess }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [levelInfo, setLevelInfo] = useState(experienceProcessor.getCurrentLevelInfo());
  const [experienceData, setExperienceData] = useState(experienceProcessor.getExperienceData());
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Update data when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLevelInfo(experienceProcessor.getCurrentLevelInfo());
      setExperienceData(experienceProcessor.getExperienceData());
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

  const handleResetExperience = () => {
    experienceProcessor.resetExperience();
    setLevelInfo(experienceProcessor.getCurrentLevelInfo());
    setExperienceData(experienceProcessor.getExperienceData());
    setShowResetConfirm(false);
    onShowSuccess('Experience Reset', 'Your experience and level have been reset.');
  };

  const currentTitle = getLevelTitle(levelInfo.level);

  return (
    <div 
      className={`${MODAL_STYLES.backdrop} transition-opacity duration-300 ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClickWithFade}
    >
      <div className={`max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl rounded-2xl bg-black/30 border border-white/10 transition-all duration-300 transform ${
        isVisible && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      } flex flex-col`}>
        {/* Header */}
        <ModalHeader
          icon={Star}
          title="Experience"
          onClose={handleClose}
          actions={
            experienceData.totalXP > 0 && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-2 hover:bg-red-500/30 rounded-full transition-colors text-red-300 hover:text-red-200"
                title="Reset Experience"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )
          }
        />

        {/* Content */}
        <div className={`${MODAL_STYLES.content} p-6 flex-1`}>
          {/* Current Level Display */}
          <div className="mb-6">
            <LevelDisplay levelInfo={levelInfo} variant="full" />
          </div>

          {/* How It Works Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Why?
              </h3>
              <div className="bg-white/10 rounded-lg p-4 text-sm text-white/90 leading-relaxed">
                <p>
                  Each level requires more XP than the last, creating a progressive challenge system.<br/>
                  Higher levels showcase your commitment to maintaining an active lifestyle.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                How?
              </h3>
              <div className="space-y-3">
                <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-4 h-4 text-rose-400" />
                    <span className="text-white/90 text-sm">Unlock an achievement.</span>
                  </div>
                  <span className="text-rose-400 font-bold text-sm">+ {XP_SOURCES.ACHIEVEMENT_UNLOCK} XP</span>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-4 h-4 text-emerald-400" />
                    <span className="text-white/90 text-sm">Complete any workout.</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">+ {XP_SOURCES.WORKOUT_COMPLETE} XP</span>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-4 h-4 text-violet-400" />
                    <span className="text-white/90 text-sm">Complete a 30+ minutes workout.</span>
                  </div>
                  <span className="text-violet-400 font-bold text-sm">+ {XP_SOURCES.LONG_WORKOUT} XP</span>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Play className="w-4 h-4 text-cyan-400" />
                    <span className="text-white/90 text-sm">Complete a workout without pausing.</span>
                  </div>
                  <span className="text-cyan-400 font-bold text-sm">+ {XP_SOURCES.PERFECT_WORKOUT} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)}>
            <div className="text-center">
              <RefreshCw className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-bold text-white mb-2">Reset Experience</h3>
              <p className="text-sm sm:text-base text-white/80 mb-6">
                This will reset your experience back to zero.
                <br/>This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleResetExperience}
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