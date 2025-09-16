import React, { useState, useEffect } from 'react';

export const PWAInstallButton: React.FC = () => {
  const [showButton, setShowButton] = useState(false);
  const [detectionComplete, setDetectionComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Enhanced PWA detection with multiple methods and caching
    const isPWAInstalled = () => {
      // Check if we've cached the result before
      const cachedResult = sessionStorage.getItem('tempo-pwa-detected');
      if (cachedResult !== null) {
        return cachedResult === 'true';
      }
      
      // Method 1: iOS PWA detection
      const isIOSPWA = (window.navigator as any).standalone === true;
      
      // Method 2: Check for standalone display mode (most reliable)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Method 3: Check for minimal-ui (some PWAs use this)
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      // Method 4: Check if launched from home screen (additional check)
      const isLaunchedFromHomeScreen = window.location.search.includes('homescreen') || 
                                      window.location.search.includes('standalone') ||
                                      document.referrer === '';
      
      // Method 5: Check window characteristics typical of installed PWAs
      const hasStandaloneFeatures = (
        // Installed PWAs often have specific window properties
        (window.outerWidth === window.innerWidth && window.outerHeight === window.innerHeight) ||
        // Or specific user agent characteristics
        /Mobile/.test(navigator.userAgent) && window.orientation !== undefined
      );
      
      const isPWA = isIOSPWA || isStandalone || isMinimalUI;
      
      // Cache the result to avoid re-detection
      sessionStorage.setItem('tempo-pwa-detected', isPWA.toString());
      
      // PWA Detection complete
      
      return isPWA;
    };

    // Multiple detection attempts with increasing delays
    const detectWithRetry = (attempt = 1, maxAttempts = 3) => {
      if (!isMounted) return;
      
      const delay = attempt * 100; // 100ms, 200ms, 300ms
      
      setTimeout(() => {
        if (!isMounted) return;
        
        const isPWA = isPWAInstalled();
        
        // If PWA detected, or we've reached max attempts, finish detection
        if (isPWA || attempt >= maxAttempts) {
          setShowButton(!isPWA);
          setDetectionComplete(true);
        } else {
          // Retry with next attempt
          detectWithRetry(attempt + 1, maxAttempts);
        }
      }, delay);
    };

    // Start detection process
    detectWithRetry();

    // Also listen for display-mode changes (edge case)
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const minimalUIQuery = window.matchMedia('(display-mode: minimal-ui)');
    
    const handleDisplayModeChange = () => {
      if (!isMounted) return;
      
      const isPWA = standaloneQuery.matches || minimalUIQuery.matches;
      if (isPWA) {
        // Cache the updated result
        sessionStorage.setItem('tempo-pwa-detected', 'true');
        setShowButton(false);
      }
    };

    // Add listeners for media query changes
    if (standaloneQuery.addEventListener) {
      standaloneQuery.addEventListener('change', handleDisplayModeChange);
      minimalUIQuery.addEventListener('change', handleDisplayModeChange);
    } else {
      // Fallback for older browsers
      standaloneQuery.addListener(handleDisplayModeChange);
      minimalUIQuery.addListener(handleDisplayModeChange);
    }

    return () => {
      isMounted = false;
      
      // Clean up listeners
      if (standaloneQuery.removeEventListener) {
        standaloneQuery.removeEventListener('change', handleDisplayModeChange);
        minimalUIQuery.removeEventListener('change', handleDisplayModeChange);
      } else {
        standaloneQuery.removeListener(handleDisplayModeChange);
        minimalUIQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  // Fade in effect when button should show
  useEffect(() => {
    if (showButton && detectionComplete) {
      // Small delay to ensure smooth fade in
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [showButton, detectionComplete]);

  // Don't render anything until detection is complete
  if (!detectionComplete) {
    return null;
  }

  // Hide button if PWA is detected
  if (!showButton) {
    return null;
  }

  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('openPWAModal'))}
      className={`inline-flex items-center space-x-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 hover:text-orange-200 px-2 py-1.5 rounded-lg transition-all duration-500 border border-orange-500/30 hover:border-orange-500/50 text-xs pointer-events-auto z-10 ${
        isVisible ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'
      }`}
    >
      <span className="text-sm">⬇️</span>
      <span className="font-medium">Install</span>
    </button>
  );
};