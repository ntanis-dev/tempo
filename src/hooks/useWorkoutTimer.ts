import { useState, useEffect, useRef, useCallback } from 'react';
import { WorkoutState, TimerSettings } from '../types';
import { 
  saveWorkoutState, 
  loadWorkoutState, 
  saveTotalSets, 
  loadTotalSets, 
  saveSettings, 
  loadSettings, 
  clearWorkoutState,
  saveWorkoutToHistory,
  loadWorkoutHistory,
  DEFAULT_SETTINGS,
  DEFAULT_STATISTICS
} from '../utils/storage';
import { validateSets, validateReps, validateTimePerRep, validateRestTime, validateStretchTime } from '../utils/validation';
import { getPhases } from '../utils/timer';
import { getRandomQuote, getRandomCalmingQuote, getRandomPreExerciseQuote, getRandomPostWorkoutQuote } from '../utils/quotes';
import { audioManager } from '../utils/audio';
import { useDebugMode } from '../contexts/DebugContext';

export const useWorkoutTimer = () => {
  const [isDebugMode] = useDebugMode();
  const [workout, setWorkout] = useState<WorkoutState>(() => {
    const savedState = loadWorkoutState();
    if (savedState && savedState.phase !== 'setup' && savedState.phase !== 'transition') {
      return { 
        ...savedState, 
        isPaused: savedState.phase === 'complete' ? false : (savedState.isPaused ?? true),
        settings: savedState.settings || loadSettings(),
        ...{
          usedQuotes: savedState.usedQuotes || [],
          currentQuote: savedState.currentQuote || '',
          usedCalmingQuotes: savedState.usedCalmingQuotes || [],
          currentCalmingQuote: savedState.currentCalmingQuote || '',
          usedPreExerciseQuotes: savedState.usedPreExerciseQuotes || [],
          currentPreExerciseQuote: savedState.currentPreExerciseQuote || '',
          usedPostWorkoutQuotes: savedState.usedPostWorkoutQuotes || [],
          currentPostWorkoutQuote: savedState.currentPostWorkoutQuote || ''
        },
        statistics: savedState.statistics || DEFAULT_STATISTICS
      };
    }
    return {
      phase: 'setup',
      currentSet: 0,
      totalSets: loadTotalSets(),
      timeRemaining: 0,
      isPaused: false,
      currentRep: 1,
      settings: loadSettings(),
      ...{
        usedQuotes: [],
        currentQuote: '',
        usedCalmingQuotes: [],
        currentCalmingQuote: '',
        usedPreExerciseQuotes: [],
        currentPreExerciseQuote: '',
        usedPostWorkoutQuotes: [],
        currentPostWorkoutQuote: ''
      },
      statistics: DEFAULT_STATISTICS
    };
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState(() => loadWorkoutHistory());

  const intervalRef = useRef<NodeJS.Timeout>();
  const pausedIntervalRef = useRef<NodeJS.Timeout>();

  // Save workout state whenever it changes
  useEffect(() => {
    saveWorkoutState(workout);
    if (workout.phase === 'setup') {
      saveTotalSets(workout.totalSets);
      saveSettings(workout.settings);
    }
  }, [workout]);

  // Save workout to history when completed
  useEffect(() => {
    if (workout.phase === 'complete' && workout.statistics.workoutStartTime) {
      saveWorkoutToHistory(workout);
      setWorkoutHistory(loadWorkoutHistory());
    }
  }, [workout.phase]);

  // Track paused time
  useEffect(() => {
    if (workout.isPaused && workout.phase !== 'setup' && workout.phase !== 'complete') {
      pausedIntervalRef.current = setInterval(() => {
        setWorkout(prev => ({
          ...prev,
          statistics: {
            ...prev.statistics,
            totalTimePaused: prev.statistics.totalTimePaused + 1
          }
        }));
      }, 1000);
    } else {
      if (pausedIntervalRef.current) {
        clearInterval(pausedIntervalRef.current);
      }
    }

    return () => {
      if (pausedIntervalRef.current) {
        clearInterval(pausedIntervalRef.current);
      }
    };
  }, [workout.isPaused, workout.phase]);

  // Main timer logic
  useEffect(() => {
    if (workout.phase === 'setup' || workout.phase === 'complete' || workout.phase === 'transition' || workout.isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Update last active time when resuming
    if (!workout.isPaused) {
      setWorkout(prev => ({
        ...prev,
        statistics: {
          ...prev.statistics,
          lastActiveTime: Date.now()
        }
      }));
    }

    intervalRef.current = setInterval(() => {
      setWorkout(prev => {
        const phases = getPhases(prev.settings);
        const now = Date.now();

        if (prev.timeRemaining > 1) {
          // Play countdown sounds at specific values (before decrementing)
          if ((prev.phase === 'countdown' || prev.phase === 'rest') && 
              (prev.timeRemaining === 6 || prev.timeRemaining === 5 || prev.timeRemaining === 4 || prev.timeRemaining === 3 || prev.timeRemaining === 2)) {
            audioManager.playCountdownTick();
          }

          // Play countdown sounds at what will be displayed (timeRemaining - 1)
          // Continue current phase
          if (prev.phase === 'work') {
            // Auto-increment reps every 3 seconds during work phase
            const repInterval = prev.settings.timePerRep;
            const totalWorkTime = prev.settings.timePerRep * prev.settings.repsPerSet;
            const elapsedTime = totalWorkTime - prev.timeRemaining + 1;
            const newRep = Math.min(Math.floor(elapsedTime / repInterval) + 1, prev.settings.repsPerSet);
            
            // Play sound when rep changes (skip rep 1 since transition phase already has sound)
            if (newRep > prev.currentRep) {
              audioManager.playRepChange();
            }
            
            return {
              ...prev,
              currentRep: newRep,
              timeRemaining: prev.timeRemaining - 1,
              statistics: {
                ...prev.statistics,
                totalTimeExercised: prev.statistics.totalTimeExercised + 1,
                lastActiveTime: now
              }
            };
          }
          
          // Track rest time
          if (prev.phase === 'rest') {
            return {
              ...prev,
              timeRemaining: prev.timeRemaining - 1,
              statistics: {
                ...prev.statistics,
                totalTimeRested: prev.statistics.totalTimeRested + 1,
                lastActiveTime: now
              }
            };
          }
          
          // Track stretch time
          if (prev.phase === 'countdown') {
            return {
              ...prev,
              timeRemaining: prev.timeRemaining - 1,
              statistics: {
                ...prev.statistics,
                totalTimeStretched: prev.statistics.totalTimeStretched + 1,
                lastActiveTime: now
              }
            };
          }
          
          return { 
            ...prev, 
            timeRemaining: prev.timeRemaining - 1,
            statistics: {
              ...prev.statistics,
              lastActiveTime: now
            }
          };
        }

        // Phase transition logic - handle the final second
        if (prev.phase === 'countdown') {
          audioManager.playWorkStart();
          const { quote, newUsedQuotes } = getRandomQuote(prev.usedQuotes);
          return {
            ...prev,
            phase: 'work',
            timeRemaining: prev.settings.timePerRep * prev.settings.repsPerSet,
            currentRep: 1,
            currentQuote: quote,
            usedQuotes: newUsedQuotes,
            statistics: {
              ...prev.statistics,
              totalTimeStretched: prev.statistics.totalTimeStretched + 1, // Count the final second
              lastActiveTime: now
            }
          };
        }

        if (prev.phase === 'work') {
          // Count the final second of work time
          const updatedExerciseTime = prev.statistics.totalTimeExercised + 1;
          const updatedRepsCompleted = prev.currentSet * prev.settings.repsPerSet;
          
          if (prev.currentSet >= prev.totalSets) {
            audioManager.playWorkoutComplete();
            const { quote, newUsedQuotes } = getRandomPostWorkoutQuote(prev.usedPostWorkoutQuotes);
            
            return {
              ...prev,
              phase: 'complete',
              timeRemaining: 0,
              currentPostWorkoutQuote: quote,
              usedPostWorkoutQuotes: newUsedQuotes,
              statistics: {
                ...prev.statistics,
                totalTimeExercised: updatedExerciseTime,
                totalRepsCompleted: updatedRepsCompleted,
                lastActiveTime: now
              }
            };
          }
          
          audioManager.playRestStart();
          const { quote, newUsedQuotes } = getRandomCalmingQuote(prev.usedCalmingQuotes);
          return {
            ...prev,
            phase: 'rest',
            timeRemaining: phases.rest.duration,
            currentRep: 1,
            currentCalmingQuote: quote,
            usedCalmingQuotes: newUsedQuotes,
            statistics: {
              ...prev.statistics,
              totalTimeExercised: updatedExerciseTime,
              totalRepsCompleted: updatedRepsCompleted,
              lastActiveTime: now
            }
          };
        }

        if (prev.phase === 'rest') {
          // Count the final second of rest time
          const updatedRestTime = prev.statistics.totalTimeRested + 1;
          
          if (prev.currentSet < prev.totalSets) {
            audioManager.playWorkStart();
            const { quote, newUsedQuotes } = getRandomQuote(prev.usedQuotes);
            return {
              ...prev,
              phase: 'work',
              currentSet: prev.currentSet + 1,
              timeRemaining: prev.settings.timePerRep * prev.settings.repsPerSet,
              currentRep: 1,
              currentQuote: quote,
              usedQuotes: newUsedQuotes,
              statistics: {
                ...prev.statistics,
                totalTimeRested: updatedRestTime,
                lastActiveTime: now
              }
            };
          } else {
            audioManager.playWorkoutComplete();
            const { quote, newUsedQuotes } = getRandomPostWorkoutQuote(prev.usedPostWorkoutQuotes);
            return { 
              ...prev, 
              phase: 'complete',
              currentPostWorkoutQuote: quote,
              usedPostWorkoutQuotes: newUsedQuotes,
              statistics: {
                ...prev.statistics,
                totalTimeRested: updatedRestTime,
                totalRepsCompleted: prev.totalSets * prev.settings.repsPerSet,
                lastActiveTime: now
              }
            };
          }
        }

        return prev;
      });
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [workout.phase, workout.isPaused]);

  const startWorkout = useCallback(() => {
    setIsTransitioning(true);
    
    // Play transition sound when moving from setup to prepare phase
    audioManager.playPhaseTransition();
    
    setTimeout(() => {
      const now = Date.now();
      setWorkout(prev => ({
        ...prev,
        phase: 'prepare',
        currentSet: 0,
        timeRemaining: 0,
        isPaused: false,
        currentRep: 1,
        statistics: {
          ...prev.statistics,
          workoutStartTime: now,
          lastActiveTime: now
        }
      }));
      setIsTransitioning(false);
    }, 700);
  }, []);

  const continueToStretch = useCallback(() => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      // Change phase after prepare screen fades out
      setWorkout(prev => ({
        ...prev,
        phase: 'countdown',
        currentSet: 1,
        timeRemaining: prev.settings.stretchTime,
        isPaused: false
      }));
      
      audioManager.playStartSound();
      const { quote, newUsedQuotes } = getRandomPreExerciseQuote(workout.usedPreExerciseQuotes);
      setWorkout(prev => ({
        ...prev,
        currentPreExerciseQuote: quote,
        usedPreExerciseQuotes: newUsedQuotes
      }));
      
      setIsTransitioning(false);
    }, 700);
  }, [workout.usedPreExerciseQuotes]);

  const togglePause = useCallback(() => {
    setWorkout(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const skipPhase = useCallback(() => {
    if (workout.phase === 'rest') return;
    
    setWorkout(prev => {
      if (prev.phase === 'countdown') {
        audioManager.playWorkStart();
        const { quote, newUsedQuotes } = getRandomQuote(prev.usedQuotes);
        return {
          ...prev,
          phase: 'work',
          timeRemaining: prev.settings.timePerRep * prev.settings.repsPerSet,
          currentRep: 1,
          currentQuote: quote,
          usedQuotes: newUsedQuotes
        };
      }
      
      if (prev.phase === 'work') {
        if (prev.currentSet >= prev.totalSets) {
          audioManager.playWorkoutComplete();
          const { quote, newUsedQuotes } = getRandomPostWorkoutQuote(prev.usedPostWorkoutQuotes);
          return { 
            ...prev, 
            phase: 'complete',
            currentPostWorkoutQuote: quote,
            usedPostWorkoutQuotes: newUsedQuotes,
            statistics: {
              ...prev.statistics,
              totalRepsCompleted: prev.totalSets * prev.settings.repsPerSet
            }
          };
        }
        
        audioManager.playRestStart();
        const { quote, newUsedQuotes } = getRandomCalmingQuote(prev.usedCalmingQuotes);
        return {
          ...prev,
          phase: 'rest',
          timeRemaining: prev.settings.restTime,
          currentRep: 1,
          currentCalmingQuote: quote,
          usedCalmingQuotes: newUsedQuotes
        };
      }
      
      return prev;
    });
  }, [workout.phase, workout.currentSet, workout.totalSets, workout.usedQuotes, workout.usedCalmingQuotes, workout.usedPostWorkoutQuotes]);

  const resetWorkout = useCallback(() => {
    // Clear any running intervals immediately
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (pausedIntervalRef.current) {
      clearInterval(pausedIntervalRef.current);
    }
    
    setIsResetting(true);
    
    setTimeout(() => {
      setWorkout(prev => ({
        ...prev,
        phase: 'setup',
        currentSet: 0,
        timeRemaining: 0,
        isPaused: false,
        currentRep: 1,
        usedQuotes: [],
        currentQuote: '',
        usedCalmingQuotes: [],
        currentCalmingQuote: '',
        usedPreExerciseQuotes: [],
        currentPreExerciseQuote: '',
        usedPostWorkoutQuotes: [],
        currentPostWorkoutQuote: '',
        statistics: DEFAULT_STATISTICS
      }));
      clearWorkoutState();
      setIsResetting(false);
    }, 700);
  }, []);

  const adjustSets = useCallback((delta: number) => {
    setWorkout(prev => ({
      ...prev,
      totalSets: validateSets(prev.totalSets + delta)
    }));
  }, []);

  const adjustTime = useCallback((type: keyof TimerSettings, delta: number) => {
    setWorkout(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [type]: (() => {
          const newValue = prev.settings[type] + delta;
          switch (type) {
            case 'repsPerSet':
              return validateReps(newValue);
            case 'timePerRep':
              return validateTimePerRep(newValue);
            case 'restTime':
              return validateRestTime(newValue, isDebugMode);
            case 'stretchTime':
              return validateStretchTime(newValue, isDebugMode);
            default:
              return newValue;
          }
        })()
      }
    }));
  }, [isDebugMode]);

  const refreshFromStorage = useCallback(() => {
    // Clear any running intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (pausedIntervalRef.current) {
      clearInterval(pausedIntervalRef.current);
    }
    
    // Load fresh data from storage
    const savedState = loadWorkoutState();
    const freshSettings = loadSettings();
    const freshTotalSets = loadTotalSets();
    const freshHistory = loadWorkoutHistory();
    
    if (savedState && savedState.phase !== 'setup' && savedState.phase !== 'transition') {
      setWorkout({ 
        ...savedState, 
        isPaused: savedState.phase === 'complete' ? false : true,
        settings: freshSettings,
        statistics: savedState.statistics || DEFAULT_STATISTICS
      });
    } else {
      setWorkout({
        phase: 'setup',
        currentSet: 0,
        totalSets: freshTotalSets,
        timeRemaining: 0,
        isPaused: false,
        currentRep: 1,
        settings: freshSettings,
        usedQuotes: [],
        currentQuote: '',
        usedCalmingQuotes: [],
        currentCalmingQuote: '',
        usedPreExerciseQuotes: [],
        currentPreExerciseQuote: '',
        usedPostWorkoutQuotes: [],
        currentPostWorkoutQuote: '',
        statistics: DEFAULT_STATISTICS
      });
    }
    
    setWorkoutHistory(freshHistory);
  }, [isDebugMode]);
  
  return {
    workout,
    isTransitioning,
    isResetting,
    workoutHistory,
    setWorkoutHistory,
    startWorkout,
    continueToStretch,
    togglePause,
    skipPhase,
    resetWorkout,
    adjustSets,
    adjustTime,
    refreshFromStorage
  };
};