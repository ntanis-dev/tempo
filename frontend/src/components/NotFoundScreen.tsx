import React from 'react';
import { Button } from './ui/Button';
import { Timer } from 'lucide-react';

export const NotFoundScreen: React.FC = () => {
  // Set document title and meta tags for 404
  React.useEffect(() => {
    document.title = 'Tempo - 404';

    // Add noindex meta tag
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);

    // Cleanup on unmount
    return () => {
      document.title = 'Tempo - Workout Timer';
      document.head.removeChild(metaRobots);
    };
  }, []);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-950 via-orange-950 to-red-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-orange-950 to-red-950 bg-200 animate-gradient-shift"></div>

      {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse"></div>
      </div>

      <div className="text-center max-w-5xl relative z-10 animate-fade-in">
        {/* Tempo branding outside box */}
        <div className="mb-6">
          <Timer className="w-16 h-16 mx-auto mb-4 text-orange-400" />
          <h1 className="text-3xl font-black font-sans tracking-widest uppercase text-white">TEMPO</h1>
        </div>

        {/* Single glassy box */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-6 border border-white/20 sm:min-w-[600px]">
          <h3 className="text-9xl font-bold text-white mb-8">404</h3>

          <p className="text-base md:text-lg text-white/90 mb-1">
            This page doesn't exist, but your gains still do.
          </p>

          <p className="text-base md:text-lg text-white/90 mb-8">
            Let's get you back on track.
          </p>

          {/* Button */}
          <Button
            onClick={handleGoHome}
            className="w-full max-w-xs mx-auto text-lg py-4"
          >
            Let's Go!
          </Button>
        </div>
      </div>
    </div>
  );
};
