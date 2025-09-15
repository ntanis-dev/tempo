import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  labelClassName?: string;
  showPercentage?: boolean;
  customRightText?: string;
  height?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  labelClassName = '',
  showPercentage = false,
  customRightText,
  height = 'md',
  color = 'bg-white'
}) => {
  const heightClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  };

  return (
    <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto font-sans">
      {(label || showPercentage || customRightText) && (
        <div className="flex justify-between items-center mb-2 text-lg font-sans">
          {label && <span className={`font-medium font-sans ${labelClassName}`}>{label}</span>}
          {showPercentage && <span className="font-medium font-mono min-w-[60px] text-right">{Math.round(progress)}%</span>}
          {customRightText && (
            <span className="font-medium text-base whitespace-nowrap font-mono text-right">
              {customRightText.includes('•') ? (
                <>
                  {customRightText.split(' • ')[0]} • <span className="min-w-[30px] inline-block text-right">{customRightText.split(' • ')[1]}</span>
                </>
              ) : (
                customRightText
              )}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-white/20 rounded-full ${heightClasses[height]}`}>
        <div 
          className={`${color} rounded-full ${heightClasses[height]} transition-all duration-300`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
};