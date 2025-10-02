import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface DeviceInfo {
  type: 'ios' | 'android' | 'desktop';
  browser: string;
  instructions: string[];
}

export const PWAInstallModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener('openPWAModal', handleOpenModal);
    return () => window.removeEventListener('openPWAModal', handleOpenModal);
  }, []);

  // Fade in animation
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsClosing(false);
    }
  }, [isOpen]);

  // Handle fade out transition
  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const handleBackdropClickWithFade = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    const detectDevice = (): DeviceInfo => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
      const isChrome = /chrome/.test(userAgent);
      const isFirefox = /firefox/.test(userAgent);
      const isEdge = /edge|edg/.test(userAgent);

      if (isIOS) {
        return {
          type: 'ios',
          browser: isSafari ? 'Safari' : 'Chrome',
          instructions: isSafari ? [
            'Tap the Share button.',
            'Tap "Add to Home Screen".',
            'Tap "Add".'
          ] : [
            'Tap the menu (⋮).',
            'Select "Add to Home Screen".',
            'Tap "Add".'
          ]
        };
      }

      if (isAndroid) {
        return {
          type: 'android',
          browser: isChrome ? 'Chrome' : isFirefox ? 'Firefox' : 'Browser',
          instructions: isChrome ? [
            'Tap the menu (⋮).',
            'Select "Add to Home Screen".',
            'Tap "Add".'
          ] : [
            'Look for the install prompt.',
            'Or tap the browser menu.',
            'Select "Install".'
          ]
        };
      }

      // Desktop
      let browser = 'Browser';
      let instructions = [
        'Look for the install icon in the address bar.',
        'Or check the browser menu.',
        'Click to install.'
      ];

      if (isChrome) {
        browser = 'Chrome';
        instructions = [
          'Look for the install icon (⬇️).',
          'Or click menu → "Install App".',
          'Click "Install".'
        ];
      } else if (isFirefox) {
        browser = 'Firefox';
        instructions = [
          'Firefox doesn\'t support PWAs.',
          'Bookmark this page for quick access.',
          'Use Chrome or Edge for full PWA support.'
        ];
      } else if (isEdge) {
        browser = 'Edge';
        instructions = [
          'Look for the install icon (⬇️).',
          'Or click menu → "Apps" → "Install".',
          'Click "Install".'
        ];
      }

      return {
        type: 'desktop',
        browser,
        instructions
      };
    };

    setDeviceInfo(detectDevice());
  }, []);

  const getDeviceIcon = () => {
    if (!deviceInfo) return '📱';
    switch (deviceInfo.type) {
      case 'ios': return '📱';
      case 'android': return '🤖';
      case 'desktop': return '💻';
      default: return '📱';
    }
  };

  const getDeviceName = () => {
    if (!deviceInfo) return 'Device';
    switch (deviceInfo.type) {
      case 'ios': return 'iPhone / iPad';
      case 'android': return 'Android';
      case 'desktop': return 'Desktop';
      default: return 'Device';
    }
  };

  if (!deviceInfo) return null;
  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 w-screen h-screen bg-black/50 backdrop-blur-2xl flex items-center justify-center p-4 z-50 pointer-events-auto transition-opacity duration-300 ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ margin: 0, padding: '1rem' }}
      onClick={handleBackdropClickWithFade}
    >
      <div className={`max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl rounded-2xl bg-black/30 border border-white/10 p-6 relative transition-all duration-300 transform ${
        isVisible && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 hover:bg-black/30 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        
      <div className="text-center mb-6">
        <Download className="w-12 h-12 mx-auto mb-3 text-orange-500" />
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Install <sup className="text-xs opacity-80">PWA</sup></h3>
        <p className="text-white/80 text-xs sm:text-sm">
          Add it to your home screen for quick access.
        </p>
        <p className="text-white/60 text-xs sm:text-xs mt-2 px-2">
          Visit from any device to see relevant install steps.
        </p>
      </div>

      <div className="mb-6">
        <div className="bg-black/30 border border-white/20 rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center space-x-2 text-white text-sm sm:text-base">
            <span className="text-lg">{getDeviceIcon()}</span>
            <span>On {getDeviceName()}:</span>
          </h4>
          <ol className="space-y-2 text-xs sm:text-sm text-white/90">
            {deviceInfo.instructions.map((instruction, index) => {
              // Skip numbering for "Or" entries
              const isOrEntry = instruction.toLowerCase().startsWith('or ');
              const stepNumber = isOrEntry ? '' : deviceInfo.instructions.slice(0, index + 1).filter(inst => !inst.toLowerCase().startsWith('or ')).length;
              
              return (
                <li key={index} className="flex items-start space-x-2 text-xs sm:text-sm">
                  <span className={`rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5 ${
                    isOrEntry 
                      ? 'bg-black/40 text-white' 
                      : 'bg-black/50 text-white'
                  }`}>
                    {isOrEntry ? '•' : stepNumber}
                  </span>
                  <span>{instruction}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {deviceInfo.type === 'desktop' && deviceInfo.browser === 'Firefox' && (
        <div className="bg-black/40 border border-orange-400/40 rounded-lg p-3 text-xs sm:text-sm text-white/90">
          <strong className="text-orange-300">Note:</strong> For the best experience, try using Chrome or Edge, which support full PWA installation.
        </div>
      )}
      </div>
    </div>
  );
};