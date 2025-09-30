import React, { useState, useEffect } from 'react';
import { Shield, Database, UserCheck, Info } from 'lucide-react';
import { ModalHeader } from '../ui/ModalHeader';
import { MODAL_STYLES } from '../../constants/styles';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Fade in animation
  useEffect(() => {
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${MODAL_STYLES.backdrop} transition-opacity duration-300 ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div className={`max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl rounded-2xl bg-black/30 border border-white/10 transition-all duration-300 transform ${
        isVisible && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <ModalHeader
          icon={Shield}
          title="Privacy Information"
          subtitle="Your data, your control"
          onClose={handleClose}
        />

        {/* Content */}
        <div className={`${MODAL_STYLES.content} p-6`}>
          <div className="space-y-5">
            {/* Introduction */}
            <div className="text-white/80 text-sm leading-relaxed">
              Tempo respects your privacy. We collect minimal anonymous data to help improve the app experience.
            </div>

            {/* What We Track */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <Database className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm uppercase tracking-wider">What We Track</h3>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span><strong className="text-white/90">Anonymous ID:</strong> Randomly generated, stored locally</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span><strong className="text-white/90">Workout Data:</strong> Sets, reps, and time when completed</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span><strong className="text-white/90">Device Info:</strong> Browser type and general location (IP)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span><strong className="text-white/90">Activity:</strong> Active status while app is open</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* What We Don't Track */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <UserCheck className="w-4 h-4 text-green-400" />
                <h3 className="text-sm uppercase tracking-wider">We Never Collect</h3>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Personal information (name, email, phone)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Account or login credentials</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Cookies or third-party tracking</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Marketing data or advertisements</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Your Control */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-semibold mb-1">Full Control</p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    All workout data is stored locally on your device. You can export, import, or completely clear your data at any time through the Storage menu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};