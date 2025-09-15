import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants';

export const useDebugMode = () => {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEBUG_MODE);
    return saved === 'true';
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        const newDebugMode = !isDebugMode;
        setIsDebugMode(newDebugMode);
        localStorage.setItem(STORAGE_KEYS.DEBUG_MODE, newDebugMode.toString());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDebugMode]);

  return isDebugMode;
};