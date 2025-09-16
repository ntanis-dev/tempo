import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { getButtonClasses } from '../../utils/classNames';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

const ButtonComponent: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  children,
  icon: Icon,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={getButtonClasses(variant, size, disabled, className)}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
};

export const Button = React.memo(ButtonComponent);