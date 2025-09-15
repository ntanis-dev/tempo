import { useState, useEffect } from 'react';
import { TIME } from '../constants';

// Reusable hook for fade-in animations
export const useFadeIn = (delay: number = TIME.FADE_DELAY) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isVisible;
};