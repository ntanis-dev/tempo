import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
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

  // Listen for storage events to update debug mode when storage is cleared
  useEffect(() => {
    const handleStorageChange = (e: Event) => {
      // Check if it's a StorageEvent
      if (e instanceof StorageEvent) {
        // When storage is cleared (key is null), or debug mode key is changed
        if (e.key === null || e.key === 'tempo-debug-mode') {
          // Force set debug mode to false when storage is cleared
          if (e.key === null) {
            console.log('Storage cleared, setting debug mode to false');
            setIsDebugMode(false);
          } else {
            // Otherwise check the actual storage value
            const newDebugMode = storageService.isDebugMode();
            setIsDebugMode(newDebugMode);
          }
        }
      } else {
        // For any other storage event (like our custom one), check the storage
        const newDebugMode = storageService.isDebugMode();
        setIsDebugMode(newDebugMode);
      }
    };

    // Listen for both storage events and custom storage-cleared events
    window.addEventListener('storage', handleStorageChange);

    // Also check periodically when window gains focus (in case storage was cleared externally)
    const handleFocus = () => {
      const newDebugMode = storageService.isDebugMode();
      setIsDebugMode(newDebugMode);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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