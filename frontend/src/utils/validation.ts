import { LIMITS } from '../constants';

export const validateSets = (value: number): number => {
  return Math.max(LIMITS.SETS.MIN, Math.min(LIMITS.SETS.MAX, value));
};

export const validateReps = (value: number): number => {
  return Math.max(LIMITS.REPS.MIN, Math.min(LIMITS.REPS.MAX, value));
};

export const validateTimePerRep = (value: number): number => {
  return Math.max(LIMITS.TIME_PER_REP.MIN, Math.min(LIMITS.TIME_PER_REP.MAX, value));
};

export const validateRestTime = (value: number, isDebugMode: boolean = false): number => {
  const min = isDebugMode ? 1 : LIMITS.REST_TIME.MIN;
  return Math.max(min, Math.min(LIMITS.REST_TIME.MAX, value));
};

export const validateStretchTime = (value: number, isDebugMode: boolean = false): number => {
  const min = isDebugMode ? 1 : LIMITS.STRETCH_TIME.MIN;
  return Math.max(min, Math.min(LIMITS.STRETCH_TIME.MAX, value));
};

export const getLimits = (type: string) => {
  switch (type) {
    case 'sets':
      return LIMITS.SETS;
    case 'reps':
      return LIMITS.REPS;
    case 'timePerRep':
      return LIMITS.TIME_PER_REP;
    case 'restTime':
      return LIMITS.REST_TIME;
    case 'stretchTime':
      return LIMITS.STRETCH_TIME;
    default:
      return { MIN: 1, MAX: 50 };
  }
};