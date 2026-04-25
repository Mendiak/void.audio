export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  trackTitle: string;
  artist: string;
}

export class AudioEngine {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private buffer: AudioBuffer | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;
  private oscillator: OscillatorNode | null = null;

  constructor() {
    // Context is created on first interaction to comply with browser policies
  }

  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256;
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.context.destination);
    }
  }

  async loadTrack(url: string) {
    try {
      this.initContext();
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      this.buffer = await this.context!.decodeAudioData(arrayBuffer);
      this.stop();
      this.pauseTime = 0;
    } catch (error) {
      console.error('Failed to load track:', error);
      throw error;
    }
  }

  playTone() {
    this.initContext();
    this.stop();
    
    this.oscillator = this.context!.createOscillator();
    this.oscillator.type = 'sawtooth';
    this.oscillator.frequency.setValueAtTime(440, this.context!.currentTime);
    
    // Frequency sweep for visual effect
    this.oscillator.frequency.exponentialRampToValueAtTime(880, this.context!.currentTime + 2);
    this.oscillator.frequency.exponentialRampToValueAtTime(220, this.context!.currentTime + 4);
    
    this.oscillator.connect(this.gainNode!);
    this.oscillator.start();
    this.isPlaying = true;
    
    this.oscillator.onended = () => {
      this.isPlaying = false;
    };
  }

  play() {
    if (!this.buffer || !this.context || this.isPlaying) return;

    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gainNode!);
    
    this.source.start(0, this.pauseTime);
    this.startTime = this.context.currentTime - this.pauseTime;
    this.isPlaying = true;

    this.source.onended = () => {
      if (this.context && this.context.currentTime - this.startTime >= this.buffer!.duration) {
        this.isPlaying = false;
        this.pauseTime = 0;
      }
    };
  }

  pause() {
    if (!this.isPlaying || !this.source || !this.context) return;
    this.source.stop();
    this.pauseTime = this.context.currentTime - this.startTime;
    this.isPlaying = false;
  }

  stop() {
    if (this.source) {
      this.source.stop();
      this.source = null;
    }
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }
    this.isPlaying = false;
    this.pauseTime = 0;
  }

  setVolume(value: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  getTimeDomainData() {
    if (!this.analyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  getPlaybackState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.isPlaying ? this.context!.currentTime - this.startTime : this.pauseTime,
      duration: this.buffer ? this.buffer.duration : 0,
    };
  }
}

export const engine = typeof window !== 'undefined' ? new AudioEngine() : null;
