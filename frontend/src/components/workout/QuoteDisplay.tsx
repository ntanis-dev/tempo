import React from 'react';

interface QuoteDisplayProps {
  quote: string;
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = React.memo(({ quote }) => {
  if (!quote) return <div className="min-h-[3rem]" />;

  return (
    <div className="mb-10 min-h-[3rem] flex items-center justify-center px-4">
      <p
        className="italic font-medium text-center leading-relaxed font-sans text-lg"
      >
        "{quote}"
      </p>
    </div>
  );
});