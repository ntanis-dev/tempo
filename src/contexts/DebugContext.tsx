import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { STORAGE_KEYS } from '../constants';

interface DebugContextType {
  isDebugMode: boolean;
  setDebugMode: (enabled: boolean) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEBUG_MODE);
    return saved === 'true';
  });

  const setDebugMode = (enabled: boolean) => {
    setIsDebugMode(enabled);
    localStorage.setItem(STORAGE_KEYS.DEBUG_MODE, enabled.toString());
  };

  return (
    <DebugContext.Provider value={{ isDebugMode, setDebugMode }}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebugMode = (): [boolean, (enabled: boolean) => void] => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebugMode must be used within a DebugProvider');
  }
  return [context.isDebugMode, context.setDebugMode];
};