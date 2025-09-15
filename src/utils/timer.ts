import { TimerSettings } from '../types';

export const formatTime = (seconds: number) => {
  return seconds.toString();
};

export const getPhases = (settings: TimerSettings) => ({
  countdown: { duration: settings.stretchTime, label: 'Stretch' },
  work: { duration: settings.timePerRep * settings.repsPerSet, label: 'Exercise' },
  rest: { duration: settings.restTime, label: 'Rest' }
});