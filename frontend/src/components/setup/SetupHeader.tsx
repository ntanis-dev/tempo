import React from 'react';
import { Timer } from 'lucide-react';

export const SetupHeader: React.FC = React.memo(() => {
  return (
    <div className="mb-4 font-sans">
      <Timer className="w-12 h-12 mx-auto mb-2 text-orange-400 hidden sm:block" />
      <h1 className="text-3xl font-black mb-1 font-sans tracking-widest uppercase">TEMPO</h1>
      <p className="text-gray-300 text-sm mb-2 font-handwritten font-medium">
        <span className="text-lg sm:text-xl md:text-2xl">Hold the pace. Break the limits.</span>
      </p>
    </div>
  );
});