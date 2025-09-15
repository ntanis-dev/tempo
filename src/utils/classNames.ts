// Utility for conditional class names
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Common class name patterns
export const getButtonClasses = (
  variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md',
  disabled: boolean = false,
  className: string = ''
): string => {
  const baseClasses = 'font-bold rounded-xl transition-all transform shadow-lg flex items-center justify-center space-x-2 font-sans';
  
  const variantClasses = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105',
    secondary: 'bg-white/20 hover:bg-white/30 text-white hover:scale-105',
    danger: 'bg-red-500 hover:bg-red-600 text-white hover:scale-105',
    ghost: 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
  };

  const sizeClasses = {
    sm: 'py-2 px-4 text-base',
    md: 'py-3 px-5 text-lg',
    lg: 'py-4 px-6 text-xl'
  };

  const disabledClasses = disabled ? 'bg-gray-600 cursor-not-allowed opacity-70' : '';

  return cn(
    baseClasses,
    disabled ? disabledClasses : variantClasses[variant],
    sizeClasses[size],
    className
  );
};

export const getFadeClasses = (isVisible: boolean, isResetting: boolean = false, isTransitioning: boolean = false): string => {
  return cn(
    'transition-opacity duration-700',
    isVisible && !isResetting && !isTransitioning ? 'opacity-100' : 'opacity-0'
  );
};