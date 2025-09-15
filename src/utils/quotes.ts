import { MOTIVATIONAL_QUOTES, CALMING_QUOTES, PRE_EXERCISE_QUOTES, POST_WORKOUT_QUOTES } from '../data/quotes';

export const getRandomQuote = (usedQuotes: number[]) => {
  const availableQuotes = MOTIVATIONAL_QUOTES.filter((_, index) => !usedQuotes.includes(index));
  if (availableQuotes.length === 0) {
    // Reset if all quotes have been used
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return { quote: MOTIVATIONAL_QUOTES[randomIndex], newUsedQuotes: [randomIndex] };
  }
  const randomAvailableIndex = Math.floor(Math.random() * availableQuotes.length);
  const quote = availableQuotes[randomAvailableIndex];
  const originalIndex = MOTIVATIONAL_QUOTES.indexOf(quote);
  return { quote, newUsedQuotes: [...usedQuotes, originalIndex] };
};

export const getRandomCalmingQuote = (usedCalmingQuotes: number[]) => {
  const availableQuotes = CALMING_QUOTES.filter((_, index) => !usedCalmingQuotes.includes(index));
  if (availableQuotes.length === 0) {
    // Reset if all quotes have been used
    const randomIndex = Math.floor(Math.random() * CALMING_QUOTES.length);
    return { quote: CALMING_QUOTES[randomIndex], newUsedQuotes: [randomIndex] };
  }
  const randomAvailableIndex = Math.floor(Math.random() * availableQuotes.length);
  const quote = availableQuotes[randomAvailableIndex];
  const originalIndex = CALMING_QUOTES.indexOf(quote);
  return { quote, newUsedQuotes: [...usedCalmingQuotes, originalIndex] };
};

export const getRandomPreExerciseQuote = (usedPreExerciseQuotes: number[]) => {
  const availableQuotes = PRE_EXERCISE_QUOTES.filter((_, index) => !usedPreExerciseQuotes.includes(index));
  if (availableQuotes.length === 0) {
    // Reset if all quotes have been used
    const randomIndex = Math.floor(Math.random() * PRE_EXERCISE_QUOTES.length);
    return { quote: PRE_EXERCISE_QUOTES[randomIndex], newUsedQuotes: [randomIndex] };
  }
  const randomAvailableIndex = Math.floor(Math.random() * availableQuotes.length);
  const quote = availableQuotes[randomAvailableIndex];
  const originalIndex = PRE_EXERCISE_QUOTES.indexOf(quote);
  return { quote, newUsedQuotes: [...usedPreExerciseQuotes, originalIndex] };
};

export const getRandomPostWorkoutQuote = (usedPostWorkoutQuotes: number[]) => {
  const availableQuotes = POST_WORKOUT_QUOTES.filter((_, index) => !usedPostWorkoutQuotes.includes(index));
  if (availableQuotes.length === 0) {
    // Reset if all quotes have been used
    const randomIndex = Math.floor(Math.random() * POST_WORKOUT_QUOTES.length);
    return { quote: POST_WORKOUT_QUOTES[randomIndex], newUsedQuotes: [randomIndex] };
  }
  const randomAvailableIndex = Math.floor(Math.random() * availableQuotes.length);
  const quote = availableQuotes[randomAvailableIndex];
  const originalIndex = POST_WORKOUT_QUOTES.indexOf(quote);
  return { quote, newUsedQuotes: [...usedPostWorkoutQuotes, originalIndex] };
};