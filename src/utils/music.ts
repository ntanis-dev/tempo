import { Phase } from '../types';
import { storageService } from '../services/StorageService';

// BPM-based ambient configurations for different workout phases
// Based on research: optimal BPMs for different exercise intensities
const PHASE_AMBIENT = {
  setup: {
    name: 'Calm Ambient',
    bpm: 60,
    type: 'drone',
    description: 'Peaceful drone for menu navigation'
  },
  prepare: {
    name: 'Preparation',
    bpm: 90,
    type: 'breathing',
    description: 'Breathing rhythm for mental preparation'
  },
  countdown: {
    name: 'Warm-up',
    bpm: 120,
    type: 'pulse',
    description: 'Gentle pulse for stretching (120 BPM optimal for warm-up)'
  },
  work: {
    name: 'High Energy',
    bpm: 140,
    type: 'drive',
    description: 'Driving rhythm for exercise (140 BPM optimal for cardio)'
  },
  rest: {
    name: 'Recovery',
    bpm: 80,
    type: 'float',
    description: 'Floating ambience for recovery'
  },
  complete: {
    name: 'Cool-down',
    bpm: 70,
    type: 'resolve',
    description: 'Resolving tones for workout completion'
  }
};

class MusicManager {
  private audioContext: AudioContext | null = null;
  private musicVolume: number = 20; // Default to 20% for subtle background
  private currentPhase: Phase | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private reverb: ConvolverNode | null = null;
  private sources: any[] = [];
  private hasUserInteracted: boolean = false;
  private pulseInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAudioContext();
    this.musicVolume = storageService.getMusicVolume();
    this.setupUserInteractionTracking();
  }

  private setupUserInteractionTracking() {
    const handleInteraction = () => {
      this.hasUserInteracted = true;

      // If we have a pending phase to play, start it now
      if (this.currentPhase && !this.isPlaying && this.musicVolume > 0) {
        this.startMusic(this.currentPhase);
      }

      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });
  }

  // Public method to trigger interaction manually (for volume changes)
  public triggerUserInteraction() {
    const wasInteracted = this.hasUserInteracted;
    this.hasUserInteracted = true;

    // If we have a pending phase to play and volume > 0, start it now
    // Check even if already interacted, in case music wasn't started yet
    if (this.currentPhase && !this.isPlaying && this.musicVolume > 0) {
      // Force restart the music for the current phase
      this.isPlaying = false; // Reset playing state to allow restart
      this.startMusic(this.currentPhase);
    }
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create audio nodes
      this.gainNode = this.audioContext.createGain();
      this.compressor = this.audioContext.createDynamicsCompressor();

      // Set up gentle compression for smooth sound
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      // Create simple reverb using delay
      this.reverb = this.audioContext.createConvolver();
      this.createReverbImpulse();

      // Connect the audio graph
      this.gainNode.connect(this.compressor);
      this.compressor.connect(this.audioContext.destination);

    } catch (error) {
      console.error('Music audio context not supported:', error);
      this.musicVolume = 0;
    }
  }

  private createReverbImpulse() {
    if (!this.audioContext || !this.reverb) return;

    const length = this.audioContext.sampleRate * 2; // 2 second reverb
    const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    this.reverb.buffer = impulse;
  }

  private async ensureAudioContext() {
    if (!this.hasUserInteracted) return null;
    if (!this.audioContext || !this.gainNode || this.musicVolume === 0) return null;

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('Could not resume music audio context:', error);
        return null;
      }
    }

    return this.audioContext;
  }

  private stopCurrentMusic() {
    // Stop all sources
    this.sources.forEach(source => {
      try {
        if (source.stop) source.stop();
        if (source.disconnect) source.disconnect();
      } catch (e) {
        // Source might already be stopped
      }
    });
    this.sources = [];

    // Clear any intervals
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }
  }

  private async playPhaseMusic(phase: Phase) {
    const audioContext = await this.ensureAudioContext();
    if (!audioContext || !this.gainNode) return;

    const config = PHASE_AMBIENT[phase as keyof typeof PHASE_AMBIENT];
    if (!config) return;

    // Set overall volume (keep it subtle)
    const baseVolume = 0.15; // Max 15% volume for ambient background
    this.gainNode.gain.value = baseVolume * (this.musicVolume / 100);

    // Create phase-specific ambient sound
    switch (config.type) {
      case 'drone':
        this.createDrone(audioContext);
        break;
      case 'breathing':
        this.createBreathingAmbient(audioContext, config.bpm);
        break;
      case 'pulse':
        this.createPulseAmbient(audioContext, config.bpm);
        break;
      case 'drive':
        this.createDrivingAmbient(audioContext, config.bpm);
        break;
      case 'float':
        this.createFloatingAmbient(audioContext);
        break;
      case 'resolve':
        this.createResolvingAmbient(audioContext);
        break;
    }
  }

  // Calm drone for setup/menu
  private createDrone(audioContext: AudioContext) {
    const fundamental = 55; // Low A note

    // Create multiple harmonics for richness
    [1, 2, 3, 5].forEach((harmonic, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.value = fundamental * harmonic;

      // Decrease volume for higher harmonics
      gain.gain.value = 0.3 / (harmonic * 0.7);

      // Add slight detuning for warmth
      osc.detune.value = Math.random() * 4 - 2;

      osc.connect(gain);
      gain.connect(this.gainNode!);

      osc.start();
      this.sources.push(osc);
    });
  }

  // Breathing rhythm for preparation
  private createBreathingAmbient(audioContext: AudioContext, bpm: number) {
    const breathDuration = 60 / bpm * 4; // 4 beats per breath cycle

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 110; // Low A2

    osc.connect(gain);
    gain.connect(this.gainNode!);

    // Create breathing pattern
    const breathe = () => {
      const now = audioContext.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + breathDuration / 2); // Inhale
      gain.gain.exponentialRampToValueAtTime(0.001, now + breathDuration); // Exhale
    };

    breathe();
    this.pulseInterval = setInterval(() => {
      if (this.isPlaying) breathe();
    }, breathDuration * 1000);

    osc.start();
    this.sources.push(osc);
  }

  // Gentle pulse for warm-up/countdown
  private createPulseAmbient(audioContext: AudioContext, bpm: number) {
    const beatDuration = 60 / bpm;

    // Create filtered noise for texture
    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 10;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.05;

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.gainNode!);

    // Add subtle bass pulse
    const bass = audioContext.createOscillator();
    const bassGain = audioContext.createGain();

    bass.type = 'sine';
    bass.frequency.value = 55; // Low A

    bass.connect(bassGain);
    bassGain.connect(this.gainNode!);

    // Create pulse pattern
    const pulse = () => {
      const now = audioContext.currentTime;
      bassGain.gain.cancelScheduledValues(now);
      bassGain.gain.setValueAtTime(0, now);
      bassGain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + beatDuration);

      // Modulate filter for movement
      filter.frequency.cancelScheduledValues(now);
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + beatDuration / 2);
      filter.frequency.exponentialRampToValueAtTime(200, now + beatDuration);
    };

    pulse();
    this.pulseInterval = setInterval(() => {
      if (this.isPlaying) pulse();
    }, beatDuration * 1000);

    noise.start();
    bass.start();
    this.sources.push(noise, bass);
  }

  // Driving ambient for work phase
  private createDrivingAmbient(audioContext: AudioContext, bpm: number) {
    const beatDuration = 60 / bpm;

    // Create rhythmic white noise
    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 2;

    const noiseGain = audioContext.createGain();

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.gainNode!);

    // Create driving rhythm
    const drive = () => {
      const now = audioContext.currentTime;
      noiseGain.gain.cancelScheduledValues(now);
      noiseGain.gain.setValueAtTime(0.1, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + beatDuration / 4);

      // Quick filter sweep for energy
      filter.frequency.cancelScheduledValues(now);
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(2000, now + beatDuration / 8);
      filter.frequency.exponentialRampToValueAtTime(500, now + beatDuration / 4);
    };

    drive();
    this.pulseInterval = setInterval(() => {
      if (this.isPlaying) drive();
    }, beatDuration * 500); // Twice per beat for energy

    noise.start();
    this.sources.push(noise);
  }

  // Floating ambient for rest
  private createFloatingAmbient(audioContext: AudioContext) {
    // Create pad-like sound with slow modulation
    const frequencies = [110, 165, 220]; // A2, E3, A3 - Perfect fifth

    frequencies.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      // Slow LFO for gentle modulation
      lfo.type = 'sine';
      lfo.frequency.value = 0.1 + index * 0.03;
      lfoGain.gain.value = 2;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.value = 0.1;

      osc.connect(gain);
      gain.connect(this.gainNode!);

      osc.start();
      lfo.start();
      this.sources.push(osc, lfo);
    });
  }

  // Resolving ambient for completion
  private createResolvingAmbient(audioContext: AudioContext) {
    // Create a major chord that slowly fades
    const frequencies = [261.63, 329.63, 392.00]; // C4, E4, G4 - C Major

    frequencies.forEach(freq => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      // Slow fade in and sustain
      const now = audioContext.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 2);
      gain.gain.linearRampToValueAtTime(0.1, now + 10);

      osc.connect(gain);
      gain.connect(this.gainNode!);

      osc.start();
      this.sources.push(osc);
    });
  }

  async startMusic(phase: Phase) {
    // Don't play music for transition phase
    if (phase === 'transition') {
      this.stopMusic();
      return;
    }

    // Store the phase to play
    this.currentPhase = phase;

    // If already playing this exact phase, don't restart
    if (this.isPlaying && this.currentPhase === phase) return;

    // Stop current music if playing something else
    if (this.isPlaying) {
      this.stopCurrentMusic();
    }

    // If user hasn't interacted yet, wait for interaction
    if (!this.hasUserInteracted || this.musicVolume === 0) {
      this.isPlaying = false;
      return; // Will start when user interacts or volume > 0
    }

    // Mark as playing before async operation
    this.isPlaying = true;

    // Start the new phase music
    await this.playPhaseMusic(phase);
  }

  stopMusic() {
    this.isPlaying = false;
    this.currentPhase = null;
    this.stopCurrentMusic();
  }

  setMusicVolume(volume: number) {
    const previousVolume = this.musicVolume;
    this.musicVolume = Math.max(0, Math.min(100, volume));
    storageService.setMusicVolume(this.musicVolume);

    // Update gain node if it exists
    if (this.gainNode) {
      const baseVolume = 0.15; // Keep ambient subtle
      this.gainNode.gain.value = baseVolume * (this.musicVolume / 100);
    }

    // If volume went from 0 to > 0, or we're not playing but should be
    if ((previousVolume === 0 && this.musicVolume > 0) ||
        (this.musicVolume > 0 && this.currentPhase && !this.isPlaying)) {
      // Changing volume counts as user interaction and will start music if needed
      this.triggerUserInteraction();
    }

    // If volume goes to 0, stop the music
    if (this.musicVolume === 0 && this.isPlaying) {
      this.stopCurrentMusic();
      this.isPlaying = false;
      // Keep currentPhase so it can resume when volume goes back up
    }
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  isMusicEnabled(): boolean {
    return this.audioContext !== null && this.musicVolume > 0;
  }

  refreshFromStorage() {
    this.musicVolume = storageService.getMusicVolume();
  }
}

export const musicManager = new MusicManager();