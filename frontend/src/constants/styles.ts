// Centralized style constants
export const MODAL_STYLES = {
  backdrop: 'fixed inset-0 bg-black/50 backdrop-blur-2xl flex items-center justify-center p-4 z-50 pointer-events-auto',
  container: 'max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl rounded-2xl bg-black/30 border border-white/10',
  header: 'bg-black/40 text-white p-6 flex items-center justify-between rounded-t-2xl border-b border-white/10',
  content: 'bg-black/20 overflow-y-auto max-h-[calc(85vh-140px)] workout-history-scrollable',
  closeButton: 'p-2 hover:bg-white/30 rounded-full transition-colors'
} as const;

export const BUTTON_STYLES = {
  base: 'font-bold rounded-xl transition-all transform shadow-lg flex items-center justify-center space-x-2 font-sans',
  variants: {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105',
    secondary: 'bg-white/20 hover:bg-white/30 text-white hover:scale-105',
    danger: 'bg-red-500 hover:bg-red-600 text-white hover:scale-105',
    ghost: 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
  },
  sizes: {
    sm: 'py-2 px-4 text-base',
    md: 'py-3 px-5 text-lg',
    lg: 'py-4 px-6 text-xl'
  },
  disabled: 'bg-gray-600 cursor-not-allowed opacity-70'
} as const;

export const COUNTER_STYLES = {
  container: 'font-sans',
  label: 'block text-sm font-medium mb-2 text-white/90 font-sans',
  wrapper: 'flex items-center justify-center space-x-3',
  value: 'text-2xl font-bold min-w-[60px] text-center font-mono',
  button: {
    base: 'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
    enabled: 'bg-white/20 hover:bg-white/30 hover:scale-105 active:scale-95',
    disabled: 'bg-white/10 cursor-not-allowed opacity-50'
  }
} as const;

export const FADE_CLASSES = {
  container: 'transition-opacity duration-700',
  visible: 'opacity-100',
  hidden: 'opacity-0'
} as const;