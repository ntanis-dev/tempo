import React, { useState } from 'react';
import { Sparkles, X, Plus, Settings, Palette } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ModalHeader } from '../ui/ModalHeader';
import { MODAL_STYLES } from '../../constants/styles';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: () => void;
}

interface UpdateEntry {
  version: string;
  date: string;
  title: string;
  changes: {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    text: string;
  }[];
}

const update: UpdateEntry = {
  version: '1.6.0',
  date: 'January 18, 2025',
  title: 'Major UI Polish & Feature Updates',
  changes: [
    {
      icon: Plus,
      color: 'text-green-400',
      text: 'Enhanced sound controls with volume slider.'
    },
    {
      icon: Plus,
      color: 'text-green-400',
      text: 'PWA install button with smooth animation.'
    },
    {
      icon: Plus,
      color: 'text-green-400',
      text: 'Click-outside-to-close functionality added to modals.'
    },
    {
      icon: Palette,
      color: 'text-purple-400',
      text: 'Redesigned What\'s New modal with cleaner layout and footer organization.'
    },
    {
      icon: Settings,
      color: 'text-orange-400',
      text: 'Update bar icon consistency - moved icons left to match app patterns.'
    },
    {
      icon: Settings,
      color: 'text-orange-400',
      text: 'Enhanced experience display timing and improved level progression feedback.'
    },
    {
      icon: Settings,
      color: 'text-orange-400',
      text: 'Storage management improvements with better import/export flow and data validation.'
    },
    {
      icon: Settings,
      color: 'text-orange-400',
      text: 'Fixed workout history to show start time instead of finish time.'
    }
  ]
};

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  isOpen,
  onClose,
  onMarkAsRead
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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
    onMarkAsRead(); // Mark as read when closing
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
          icon={Sparkles}
          title="What's New"
          onClose={handleClose}
        />

        {/* Content */}
        <div className={`${MODAL_STYLES.content} p-6 flex-1`}>
          <div className="space-y-6">
            <div>
              <div className="space-y-3">
                {update.changes.map((change, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <change.icon className={`w-4 h-4 ${change.color} flex-shrink-0 mt-0.5`} />
                    <span className="text-white/90 text-sm leading-relaxed">
                      {change.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/20 text-center">
            <p className="text-white/60 text-xs mb-1">
              {update.date}
            </p>
            <p className="text-white/60 text-xs">
              v{update.version}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};