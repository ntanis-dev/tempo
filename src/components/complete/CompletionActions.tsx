import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface CompletionActionsProps {
  onResetWorkout: () => void;
}

export const CompletionActions: React.FC<CompletionActionsProps> = ({
  onResetWorkout
}) => {
  return (
    <div className="flex justify-center items-center">
      <Button
        onClick={onResetWorkout}
        variant="primary"
        size="sm"
        icon={RotateCcw}
        className="w-full sm:w-auto sm:min-w-[180px]"
      >
        Start Over
      </Button>
    </div>
  );
};