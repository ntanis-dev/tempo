import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '../ui/Button';

interface SetupActionsProps {
  onStartWorkout: () => void;
  isTransitioning: boolean;
}

export const SetupActions: React.FC<SetupActionsProps> = ({
  onStartWorkout,
  isTransitioning
}) => {
  return (
    <div className="flex justify-center">
      {/* Main Action */}
      <Button
        onClick={onStartWorkout}
        disabled={isTransitioning}
        variant="primary"
        size="sm"
        icon={Play}
        className="w-full sm:w-auto sm:px-12"
      >
        Start
      </Button>
    </div>
  );
};