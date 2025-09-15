import React from 'react';
import { MousePointer, Loader2 } from 'lucide-react';

interface UpdateBarProps {
  isVisible: boolean;
  onRefresh: () => void;
}

export const UpdateBar: React.FC<UpdateBarProps> = ({ 
  isVisible, 
  onRefresh 
}) => {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleClick = () => {
    if (isUpdating) return;
    setIsUpdating(true);
    onRefresh();
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 w-full z-50 bg-violet-500 transition-colors duration-200 shadow-lg ${
      isUpdating ? '' : 'hover:bg-violet-600'
    }`}>
      <button
        onClick={handleClick}
        disabled={isUpdating}
        className={`w-full py-4 px-4 text-white font-medium flex items-center justify-center space-x-2 transition-colors ${
          isUpdating ? 'cursor-not-allowed opacity-80' : ''
        }`}
      >
        {isUpdating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MousePointer className="w-4 h-4" />
        )}
        <span>{isUpdating ? 'Updating' : 'Update Available'}</span>
      </button>
    </div>
  );
};