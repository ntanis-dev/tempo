import React, { useState, useEffect } from 'react';
import { Menu, History, Trophy, X, Heart, Database, Bug, Star, Sparkles, Download } from 'lucide-react';
import { useDebugMode } from '../../contexts/DebugContext';
import { whatsNewTracker } from '../../utils/whatsNewTracker';

interface SetupMenuProps {
  onShowHistory: () => void;
  onShowAchievements: () => void;
  onShowStorage: () => void;
  onShowLevels: () => void;
  onShowWhatsNew: () => void;
}

export const SetupMenu: React.FC<SetupMenuProps> = ({
  onShowHistory,
  onShowAchievements,
  onShowStorage,
  onShowLevels,
  onShowWhatsNew
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDebugMode, setDebugMode] = useDebugMode();
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(whatsNewTracker.hasUnreadUpdates());
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [detectionComplete, setDetectionComplete] = useState(false);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const menuContainer = target.closest('[data-menu-container]');
      if (!menuContainer && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleHistoryClick = () => {
    onShowHistory();
    setIsOpen(false);
  };

  const handleAchievementsClick = () => {
    onShowAchievements();
    setIsOpen(false);
  };

  const handleStorageClick = () => {
    onShowStorage();
    setIsOpen(false);
  };

  const handleLevelsClick = () => {
    onShowLevels();
    setIsOpen(false);
  };

  const handleWhatsNewClick = () => {
    onShowWhatsNew();
    setIsOpen(false);
  };

  const handleDebugToggle = () => {
    setDebugMode(!isDebugMode);
  };

  // Update unread status when component mounts (key prop change will remount component)
  React.useEffect(() => {
    setHasUnreadUpdates(whatsNewTracker.hasUnreadUpdates());
  }, []);

  // PWA detection logic (same as PWAInstallButton)
  useEffect(() => {
    let isMounted = true;

    const isPWAInstalled = () => {
      const cachedResult = sessionStorage.getItem('tempo-pwa-detected');
      if (cachedResult !== null) {
        return cachedResult === 'true';
      }

      const isIOSPWA = (window.navigator as { standalone?: boolean }).standalone === true;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;

      const isPWA = isIOSPWA || isStandalone || isMinimalUI;
      sessionStorage.setItem('tempo-pwa-detected', isPWA.toString());

      return isPWA;
    };

    const detectWithRetry = (attempt = 1, maxAttempts = 3) => {
      if (!isMounted) return;

      const delay = attempt * 100;

      setTimeout(() => {
        if (!isMounted) return;

        const isPWA = isPWAInstalled();

        if (isPWA || attempt >= maxAttempts) {
          setShowInstallButton(!isPWA);
          setDetectionComplete(true);
        } else {
          detectWithRetry(attempt + 1, maxAttempts);
        }
      }, delay);
    };

    detectWithRetry();

    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const minimalUIQuery = window.matchMedia('(display-mode: minimal-ui)');

    const handleDisplayModeChange = () => {
      if (!isMounted) return;

      const isPWA = standaloneQuery.matches || minimalUIQuery.matches;
      if (isPWA) {
        sessionStorage.setItem('tempo-pwa-detected', 'true');
        setShowInstallButton(false);
      }
    };

    if (standaloneQuery.addEventListener) {
      standaloneQuery.addEventListener('change', handleDisplayModeChange);
      minimalUIQuery.addEventListener('change', handleDisplayModeChange);
    } else {
      standaloneQuery.addListener(handleDisplayModeChange);
      minimalUIQuery.addListener(handleDisplayModeChange);
    }

    return () => {
      isMounted = false;

      if (standaloneQuery.removeEventListener) {
        standaloneQuery.removeEventListener('change', handleDisplayModeChange);
        minimalUIQuery.removeEventListener('change', handleDisplayModeChange);
      } else {
        standaloneQuery.removeListener(handleDisplayModeChange);
        minimalUIQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);


  return (
    <div className="relative" data-menu-container>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30 relative"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        <span className="text-sm font-medium">Menu</span>
        {hasUnreadUpdates && !isOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 z-20 bg-black/30 backdrop-blur-xl rounded-xl shadow-lg border border-white/10 min-w-[275px]">
            <div className="py-2">
              {/* Install PWA Button - Only shows when not in PWA mode */}
              {showInstallButton && detectionComplete && (
                <>
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('openPWAModal'));
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-orange-300 bg-orange-500/20 hover:bg-orange-500/30 transition-colors flex items-center space-x-2 border-b border-orange-500/20"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-semibold">Install</span>
                    <span className="ml-auto text-xs opacity-80">PWA</span>
                  </button>
                  <div className="py-1"></div>
                </>
              )}

              <button
                onClick={handleLevelsClick}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors flex items-center space-x-2"
              >
                <Star className="w-4 h-4" />
                <span>Experience</span>
              </button>
              
              <button
                onClick={handleAchievementsClick}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors flex items-center space-x-2"
              >
                <Trophy className="w-4 h-4" />
                <span>Achievements</span>
              </button>
              
              <button
                onClick={handleHistoryClick}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors flex items-center space-x-2"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
              
              <button
                onClick={handleStorageClick}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors flex items-center space-x-2"
              >
                <Database className="w-4 h-4" />
                <span>Storage</span>
              </button>
              
              <div className="border-t border-white/10 mt-2 pt-2">
                <button
                  onClick={handleWhatsNewClick}
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>What's New</span>
                  </div>
                  {hasUnreadUpdates && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
              </div>
              
              <div className="border-t border-white/10 mt-2 pt-2">
                <button
                  onClick={handleDebugToggle}
                  className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Bug className="w-4 h-4 text-orange-400" />
                    <span className="text-white text-sm">Debug Mode</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full transition-colors ${
                    isDebugMode ? 'bg-orange-500' : 'bg-white/20'
                  } relative`}>
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                      isDebugMode ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </div>
                </button>
              </div>
              
              <div className="border-t border-white/10 mt-2 pt-2 px-4 pb-2">
                <div className="text-white/60 text-xs flex items-center justify-center space-x-1">
                  <span>Made with</span>
                  <Heart className="w-3 h-3 text-red-400" />
                  <span>by</span>
                  <a 
                    href="https://github.com/ntanis-dev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white underline transition-colors"
                  >
                    ntanis-dev
                  </a>
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};