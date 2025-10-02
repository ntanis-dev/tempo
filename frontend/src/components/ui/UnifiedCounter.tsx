import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { COUNTER_STYLES } from '../../constants/styles';

interface UnifiedCounterProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  unit?: string;
  disabled?: boolean;
  minusDisabled?: boolean;
  plusDisabled?: boolean;
  className?: string;
  color?: 'orange' | 'red' | 'blue';
  retainMinusColorWhenDisabled?: boolean;
  retainPlusColorWhenDisabled?: boolean;
}

export const UnifiedCounter: React.FC<UnifiedCounterProps> = ({
  label,
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max = 50,
  unit = '',
  disabled = false,
  minusDisabled = false,
  plusDisabled = false,
  className = '',
  color,
  retainMinusColorWhenDisabled = false,
  retainPlusColorWhenDisabled = false
}) => {
  const isMinusDisabled = disabled || minusDisabled || value <= min;
  const isPlusDisabled = disabled || plusDisabled || value >= max;

  const getMinusColorClasses = () => {
    // If individually disabled (not parent disabled), always use gray disabled styles
    if (minusDisabled || value <= min) {
      return COUNTER_STYLES.button.disabled;
    }
    
    // If parent disabled but we want to retain colors
    if (disabled && retainMinusColorWhenDisabled) {
      if (color === 'orange') {
        return 'bg-orange-500/20 cursor-not-allowed opacity-70';
      }
      if (color === 'red') {
        return 'bg-red-500/20 cursor-not-allowed opacity-70';
      }
      if (color === 'blue') {
        return 'bg-blue-500/20 cursor-not-allowed opacity-70';
      }
    }
    
    // If parent disabled and we don't want to retain colors
    if (disabled) {
      return COUNTER_STYLES.button.disabled;
    }
    
    // Normal enabled state
    if (color === 'orange') {
      return 'bg-orange-500/20 hover:bg-orange-500/30 hover:scale-105 active:scale-95';
    }
    if (color === 'red') {
      return 'bg-red-500/20 hover:bg-red-500/30 hover:scale-105 active:scale-95';
    }
    if (color === 'blue') {
      return 'bg-blue-500/20 hover:bg-blue-500/30 hover:scale-105 active:scale-95';
    }
    
    return COUNTER_STYLES.button.enabled;
  };

  const getPlusColorClasses = () => {
    // If individually disabled (not parent disabled), always use gray disabled styles
    if (plusDisabled || value >= max) {
      return COUNTER_STYLES.button.disabled;
    }
    
    // If parent disabled but we want to retain colors
    if (disabled && retainPlusColorWhenDisabled) {
      if (color === 'orange') {
        return 'bg-orange-500/20 cursor-not-allowed opacity-70';
      }
      if (color === 'red') {
        return 'bg-red-500/20 cursor-not-allowed opacity-70';
      }
      if (color === 'blue') {
        return 'bg-blue-500/20 cursor-not-allowed opacity-70';
      }
    }
    
    // If parent disabled and we don't want to retain colors
    if (disabled) {
      return COUNTER_STYLES.button.disabled;
    }
    
    // Normal enabled state
    if (color === 'orange') {
      return 'bg-orange-500/20 hover:bg-orange-500/30 hover:scale-105 active:scale-95';
    }
    if (color === 'red') {
      return 'bg-red-500/20 hover:bg-red-500/30 hover:scale-105 active:scale-95';
    }
    if (color === 'blue') {
      return 'bg-blue-500/20 hover:bg-blue-500/30 hover:scale-105 active:scale-95';
    }
    
    return COUNTER_STYLES.button.enabled;
  };
  return (
    <div className={`${COUNTER_STYLES.container} ${disabled ? 'opacity-50' : ''} ${className}`}>
      <label className={COUNTER_STYLES.label}>{label}</label>
      <div className={COUNTER_STYLES.wrapper}>
        <button
          onClick={onDecrement}
          className={`${COUNTER_STYLES.button.base} ${
            getMinusColorClasses()
          }`}
          disabled={isMinusDisabled}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className={`${COUNTER_STYLES.value} ${className || ''}`}>
          {value}{unit}
        </span>
        <button
          onClick={onIncrement}
          className={`${COUNTER_STYLES.button.base} ${
            getPlusColorClasses()
          }`}
          disabled={isPlusDisabled}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};