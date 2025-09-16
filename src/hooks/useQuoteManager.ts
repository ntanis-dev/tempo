import { useCallback, useEffect } from 'react';
import { WorkoutState } from '../types';
import { getRandomQuote, getRandomCalmingQuote, getRandomPreExerciseQuote, getRandomPostWorkoutQuote } from '../utils/quotes';

export const useQuoteManager = (
  workout: WorkoutState,
  updateWorkout: (updater: (prev: WorkoutState) => WorkoutState) => void
) => {
  // Update quotes based on phase
  const updateQuoteForPhase = useCallback((phase: string) => {
    switch (phase) {
      case 'work':
        updateWorkout(prev => {
          const quote = getRandomQuote(prev.usedQuotes);
          return {
            ...prev,
            currentQuote: quote.text,
            usedQuotes: [...prev.usedQuotes, quote.id]
          };
        });
        break;

      case 'rest':
        updateWorkout(prev => {
          const quote = getRandomCalmingQuote(prev.usedCalmingQuotes);
          return {
            ...prev,
            currentCalmingQuote: quote.text,
            usedCalmingQuotes: [...prev.usedCalmingQuotes, quote.id]
          };
        });
        break;

      case 'prepare':
        updateWorkout(prev => {
          const quote = getRandomPreExerciseQuote(prev.usedPreExerciseQuotes);
          return {
            ...prev,
            currentPreExerciseQuote: quote.text,
            usedPreExerciseQuotes: [...prev.usedPreExerciseQuotes, quote.id]
          };
        });
        break;

      case 'complete':
        updateWorkout(prev => {
          const quote = getRandomPostWorkoutQuote(prev.usedPostWorkoutQuotes);
          return {
            ...prev,
            currentPostWorkoutQuote: quote.text,
            usedPostWorkoutQuotes: [...prev.usedPostWorkoutQuotes, quote.id]
          };
        });
        break;
    }
  }, [updateWorkout]);

  // Update quotes when phase changes
  useEffect(() => {
    updateQuoteForPhase(workout.phase);
  }, [workout.phase, updateQuoteForPhase]);

  const resetQuotes = useCallback(() => {
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