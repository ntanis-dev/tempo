import React from 'react';
import { X, DivideIcon as LucideIcon } from 'lucide-react';
import { MODAL_STYLES } from '../../constants/styles';

interface ModalHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onClose: () => void;
  actions?: React.ReactNode;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  onClose,
  actions
}) => {
  return (
    <div className={MODAL_STYLES.header}>
      <div className="flex items-center space-x-3">
        <Icon className="w-6 h-6" />
        <div>
          <h2 className="text-sm sm:text-lg font-bold">{title}</h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-white/70 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {actions}
        <button
          onClick={onClose}
          className={MODAL_STYLES.closeButton}
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};