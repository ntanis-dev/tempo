import React from 'react';

const fireworkEmojis = ['💪', '🏆', '🔥', '⚡', '🎯', '⭐', '🚀', '🌟'];

const fireworkAnimations = [
  'firework1 3s ease-out 0s infinite',
  'firework2 3.5s ease-out 0.5s infinite',
  'firework3 4s ease-out 1s infinite',
  'firework4 3.2s ease-out 1.5s infinite',
  'firework5 3.8s ease-out 2s infinite',
  'firework6 3.3s ease-out 2.5s infinite',
  'firework7 4.2s ease-out 3s infinite',
  'firework8 3.6s ease-out 3.5s infinite'
];

const fireworkPositions = [
  'top-6 left-6',
  'top-24 right-20',
  'top-20 left-1/4',
  'top-12 right-1/3',
  'top-24 right-6',
  'top-4 left-1/2',
  'top-16 left-12',
  'top-8 right-1/4'
];

const fireworkSizes = [
  'text-3xl',
  'text-2xl',
  'text-3xl',
  'text-2xl',
  'text-2xl',
  'text-xl',
  'text-2xl',
  'text-xl',
  'text-3xl'
];

export const FireworksAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {fireworkEmojis.map((emoji, index) => (
        <div
          key={index}
          className={`absolute ${fireworkPositions[index]} ${fireworkSizes[index]}`}
          style={{ animation: fireworkAnimations[index] }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};