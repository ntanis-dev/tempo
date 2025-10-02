import React from 'react';
import { WorkoutState } from '../types';
import { getRandomQuote, getRandomCalmingQuote, getRandomPreExerciseQuote, getRandomPostWorkoutQuote } from '../utils/quotes';

export const useQuoteManager = (
  workout: WorkoutState,
  updateWorkout: (updater: (prev: WorkoutState) => WorkoutState) => void
) => {
  // Update quotes based on phase
  const updateQuoteForPhase = React.useCallback((phase: string) => {
    switch (phase) {
      case 'work':
        updateWorkout(prev => {
          const result = getRandomQuote(prev.usedQuotes);
          return {
            ...prev,
            currentQuote: result.quote,
            usedQuotes: result.newUsedQuotes
          };
        });
        break;

      case 'rest':
        updateWorkout(prev => {
          const result = getRandomCalmingQuote(prev.usedCalmingQuotes);
          return {
            ...prev,
            currentCalmingQuote: result.quote,
            usedCalmingQuotes: result.newUsedQuotes
          };
        });
        break;

      case 'prepare':
      case 'countdown':
        updateWorkout(prev => {
          const result = getRandomPreExerciseQuote(prev.usedPreExerciseQuotes);
          return {
            ...prev,
            currentPreExerciseQuote: result.quote,
            usedPreExerciseQuotes: result.newUsedQuotes
          };
        });
        break;

      case 'complete':
        updateWorkout(prev => {
          const result = getRandomPostWorkoutQuote(prev.usedPostWorkoutQuotes);
          return {
            ...prev,
            currentPostWorkoutQuote: result.quote,
            usedPostWorkoutQuotes: result.newUsedQuotes
          };
        });
        break;
    }
  }, [updateWorkout]);

  // Update quotes when phase changes
  React.useEffect(() => {
    updateQuoteForPhase(workout.phase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout.phase]); // Only depend on phase to avoid infinite loops

  const resetQuotes = React.useCallback(() => {
    updateWorkout(prev => ({
      ...prev,
      usedQuotes: [],
      currentQuote: '',
      usedCalmingQuotes: [],
      currentCalmingQuote: '',
      usedPreExerciseQuotes: [],
      currentPreExerciseQuote: '',
      usedPostWorkoutQuotes: [],
      currentPostWorkoutQuote: ''
    }));
  }, [updateWorkout]);

  return {
    updateQuoteForPhase,
    resetQuotes
  };
};