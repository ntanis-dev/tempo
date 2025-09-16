import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { storageService } from '../services/storageService';

interface DebugContextType {
  isDebugMode: boolean;
  setDebugMode: (enabled: boolean) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    return storageService.isDebugMode();
  });

  const setDebugMode = (enabled: boolean) => {
    setIsDebugMode(enabled);
    storageService.setDebugMode(enabled);
  };

  return (
    <DebugContext.Provider value={{ isDebugMode, setDebugMode }}>
      {children}
    </DebugContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDebugMode = (): [boolean, (enabled: boolean) => void] => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebugMode must be used within a DebugProvider');
  }
  return [context.isDebugMode, context.setDebugMode];
};