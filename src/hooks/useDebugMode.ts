import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

export const useDebugMode = () => {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    return storageService.isDebugMode();
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        const newDebugMode = !isDebugMode;
        setIsDebugMode(newDebugMode);
        storageService.setDebugMode(newDebugMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDebugMode]);

  return isDebugMode;
};