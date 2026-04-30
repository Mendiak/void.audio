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
  private analyserL: AnalyserNode | null = null;
  private analyserR: AnalyserNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private eqNodes: BiquadFilterNode[] = [];
  private buffer: AudioBuffer | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;

  private hapticGain: GainNode | null = null;
  private isMuted: boolean = false;

  private FREQUENCIES = [60, 150, 400, 1000, 2400, 6000, 15000];

  constructor() {
    // Context is created on first interaction to comply with browser policies
  }

  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256;

      // Stereo separation for VU meter
      this.analyserL = this.context.createAnalyser();
      this.analyserR = this.context.createAnalyser();
      this.analyserL.fftSize = 32;
      this.analyserR.fftSize = 32;

      const splitter = this.context.createChannelSplitter(2);
      
      this.gainNode = this.context.createGain();
      this.hapticGain = this.context.createGain();
      this.hapticGain.gain.value = 0.15; // Subtle default volume

      // EQ Setup
      this.eqNodes = this.FREQUENCIES.map((freq, i) => {
        const filter = this.context!.createBiquadFilter();
        if (i === 0) {
          filter.type = 'lowshelf';
        } else if (i === this.FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      // Connect EQ chain: Source -> EQ0 -> EQ1 -> ... -> EQN -> Gain
      this.eqNodes.reduce((prev, curr) => {
        prev.connect(curr);
        return curr;
      }).connect(this.gainNode);
      
      this.gainNode.connect(this.analyser);
      this.gainNode.connect(splitter);
      
      splitter.connect(this.analyserL, 0);
      splitter.connect(this.analyserR, 1);
      
      this.analyser.connect(this.context.destination);
      this.hapticGain.connect(this.context.destination);
    }
  }

  /**
   * Synthesizes a metallic click sound for buttons
   */
  playClick(type: 'plastic' | 'metal' | 'light' = 'metal') {
    if (!this.context) this.initContext();
    const ctx = this.context!;
    const hGain = this.hapticGain!;

    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    
    // Different characteristics for different materials
    if (type === 'metal') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
    } else if (type === 'plastic') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.03);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.01);
    }

    env.gain.setValueAtTime(0, ctx.currentTime);
    env.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.002);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(env);
    env.connect(hGain);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);

    // Add a tiny bit of noise for texture
    const bufferSize = ctx.sampleRate * 0.02;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    const noiseFilter = ctx.createBiquadFilter();
    const noiseEnv = ctx.createGain();

    noise.buffer = buffer;
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 2000;

    noiseEnv.gain.setValueAtTime(0.2, ctx.currentTime);
    noiseEnv.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseEnv);
    noiseEnv.connect(hGain);
    noise.start(ctx.currentTime);
  }

  /**
   * Synthesizes a heavy relay 'clack' sound for power/main controls
   */
  playRelay(on: boolean = true) {
    if (!this.context) this.initContext();
    const ctx = this.context!;
    const hGain = this.hapticGain!;

    // A relay clack is often two distinct pulses
    const playPulse = (delay: number, freq: number, vol: number, decay: number) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(freq / 2, ctx.currentTime + delay + decay);

      env.gain.setValueAtTime(0, ctx.currentTime + delay);
      env.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.002);
      env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + decay);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1500;

      osc.connect(filter);
      filter.connect(env);
      env.connect(hGain);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + decay + 0.01);
    };

    if (on) {
      playPulse(0, 150, 1, 0.08);
      playPulse(0.015, 100, 0.8, 0.1);
    } else {
      playPulse(0, 120, 1, 0.1);
      playPulse(0.01, 80, 0.5, 0.05);
    }
  }

  setEQ(index: number, gain: number) {
    if (!this.context) this.initContext();
    const node = this.eqNodes[index];
    if (node) {
      node.gain.setTargetAtTime(gain, this.context!.currentTime, 0.01);
    }
  }

  getStereoLevels() {
    if (!this.analyserL || !this.analyserR) return { l: 0, r: 0 };
    
    const dataL = new Uint8Array(this.analyserL.frequencyBinCount);
    const dataR = new Uint8Array(this.analyserR.frequencyBinCount);
    
    this.analyserL.getByteTimeDomainData(dataL);
    this.analyserR.getByteTimeDomainData(dataR);
    
    const getPeak = (data: Uint8Array) => {
      let max = 0;
      for (let i = 0; i < data.length; i++) {
        const val = Math.abs(data[i] - 128);
        if (val > max) max = val;
      }
      return max / 128;
    };
    
    return {
      l: getPeak(dataL),
      r: getPeak(dataR)
    };
  }


  async loadLocalFile(file: File) {
    this.initContext();
    const arrayBuffer = await file.arrayBuffer();
    this.buffer = await this.context!.decodeAudioData(arrayBuffer);
    this.stop();
    this.pauseTime = 0;
  }


  play() {
    if (!this.buffer || !this.context || this.isPlaying) return;

    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.eqNodes[0]!);
    
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

  seek(time: number) {
    if (!this.buffer || !this.context) return;
    
    const wasPlaying = this.isPlaying;
    if (this.source) {
      try {
        this.source.stop();
      } catch (e) {}
      this.source = null;
    }
    
    this.pauseTime = Math.max(0, Math.min(time, this.buffer.duration));
    this.isPlaying = false;
    
    if (wasPlaying) {
      this.play();
    }
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch (e) {}
      this.source = null;
    }
    this.isPlaying = false;
    this.pauseTime = 0;
  }

  setVolume(value: number) {
    if (this.gainNode && isFinite(value)) {
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

  getSystemMetrics() {
    if (!this.context) return { latency: 0, sampleRate: 0 };
    const ctx = this.context as any;
    // Some browsers use baseLatency, some outputLatency, some both
    const latency = (ctx.baseLatency || 0) + (ctx.outputLatency || 0);
    return {
      latency: latency,
      sampleRate: this.context.sampleRate
    };
  }
}

export const engine = typeof window !== 'undefined' ? new AudioEngine() : null;
