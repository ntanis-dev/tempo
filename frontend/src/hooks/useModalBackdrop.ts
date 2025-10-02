// Reusable hook for modal backdrop click handling
export const useModalBackdrop = (onClose: () => void) => {
  return (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
};