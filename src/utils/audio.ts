// Audio utility functions for workout timer sound effects
import { saveSoundEnabled, loadSoundEnabled } from './storage';
import { saveSoundVolume, loadSoundVolume } from './storage';
import { AUDIO, TIME } from '../constants';

class AudioManager {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 1.0;

  constructor() {
    // Initialize audio context on first user interaction
    this.initializeAudioContext();
    // Load saved sound preference
    this.isEnabled = loadSoundEnabled();
    this.volume = loadSoundVolume();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Audio not supported:', error);
      this.isEnabled = false;
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext || !this.isEnabled) return null;
    
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('Could not resume audio context:', error);
        return null;
      }
    }
    
    return this.audioContext;
  }

  private createBeep(frequency: number, duration: number, baseVolume: number = 0.3) {
    return new Promise<void>(async (resolve) => {
      const audioContext = await this.ensureAudioContext();
      if (!audioContext) {
        resolve();
        return;
      }

      // Apply global volume multiplier
      const adjustedVolume = baseVolume * this.volume;
      
      if (adjustedVolume === 0) {
        resolve();
        return;
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(adjustedVolume, audioContext.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration - 0.01);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);

      oscillator.onended = () => resolve();
    });
  }

  // Sound effects
  async playStartSound() {
    // Ascending beep sequence for workout start
    const [freq1, freq2] = AUDIO.FREQUENCIES.WORK_START;
    const freq3 = AUDIO.FREQUENCIES.WORKOUT_START[2];
    
    await this.createBeep(freq1, AUDIO.DURATIONS.MEDIUM, AUDIO.VOLUMES.HIGH);
    await new Promise(resolve => setTimeout(resolve, 30));
    await this.createBeep(freq2, AUDIO.DURATIONS.MEDIUM, AUDIO.VOLUMES.HIGH);
    await new Promise(resolve => setTimeout(resolve, 30));
    await this.createBeep(freq3, AUDIO.DURATIONS.LONG, AUDIO.VOLUMES.PEAK);
  }

  async playPhaseTransition() {
    // Double beep for phase changes
    await this.createBeep(800, 0.12, 0.5);
    await new Promise(resolve => setTimeout(resolve, 80));
    await this.createBeep(800, 0.12, 0.5);
  }

  async playCountdownTick() {
    // Short tick for countdown
    await this.createBeep(AUDIO.FREQUENCIES.COUNTDOWN_TICK, AUDIO.DURATIONS.SHORT, AUDIO.VOLUMES.MEDIUM);
  }

  async playCountdownFinal() {
    // Urgent beep for final countdown
    await this.createBeep(AUDIO.FREQUENCIES.COUNTDOWN_FINAL, AUDIO.DURATIONS.LONG, AUDIO.VOLUMES.PEAK);
  }

  async playPreparePhase() {
    // Smooth beep for prepare phase
    await this.createBeep(AUDIO.FREQUENCIES.PREPARE_PHASE, AUDIO.DURATIONS.LONG, AUDIO.VOLUMES.PEAK);
  }

  async playWorkoutComplete() {
    // Victory fanfare
    const notes = AUDIO.FREQUENCIES.WORKOUT_COMPLETE;
    for (let i = 0; i < notes.length; i++) {
      this.createBeep(notes[i], AUDIO.DURATIONS.VICTORY, 0.425);
      if (i < notes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 120));
      }
    }
  }

  async playAchievementUnlock() {
    // Happy achievement unlock sound - ascending melody
    const notes = AUDIO.FREQUENCIES.ACHIEVEMENT;
    for (let i = 0; i < notes.length; i++) {
      this.createBeep(notes[i], AUDIO.DURATIONS.EXTENDED, AUDIO.VOLUMES.MEDIUM);
      if (i < notes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  async playRepChange() {
    // Subtle beep for rep changes during work phase
    await this.createBeep(AUDIO.FREQUENCIES.REP_CHANGE, AUDIO.DURATIONS.MEDIUM, AUDIO.VOLUMES.MEDIUM);
  }

  async playRestStart() {
    // Gentle descending tone for rest
    const [freq1, freq2] = AUDIO.FREQUENCIES.REST_START;
    await this.createBeep(freq1, AUDIO.DURATIONS.LONG, AUDIO.VOLUMES.MEDIUM);
    await new Promise(resolve => setTimeout(resolve, 50));
    await this.createBeep(freq2, AUDIO.DURATIONS.EXTENDED, AUDIO.VOLUMES.MEDIUM);
  }

  async playWorkStart() {
    // Energetic ascending tone for work
    const [freq1, freq2] = AUDIO.FREQUENCIES.WORK_START;
    await this.createBeep(freq1, AUDIO.DURATIONS.MEDIUM, AUDIO.VOLUMES.HIGH);
    await new Promise(resolve => setTimeout(resolve, 50));
    await this.createBeep(freq2, AUDIO.DURATIONS.LONG, AUDIO.VOLUMES.HIGH);
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    saveSoundEnabled(enabled);
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    saveSoundVolume(this.volume);
  }

  getVolume(): number {
    return this.volume;
  }

  isAudioEnabled() {
    return this.isEnabled && this.audioContext !== null && this.volume > 0;
  }

  refreshFromStorage() {
    this.isEnabled = loadSoundEnabled();
    this.volume = loadSoundVolume();
  }
}

export const audioManager = new AudioManager();