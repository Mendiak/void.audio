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
  private eqLow: BiquadFilterNode | null = null;
  private eqMid: BiquadFilterNode | null = null;
  private eqHigh: BiquadFilterNode | null = null;
  private buffer: AudioBuffer | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;

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

      // EQ Setup
      this.eqLow = this.context.createBiquadFilter();
      this.eqLow.type = 'lowshelf';
      this.eqLow.frequency.value = 320;
      this.eqLow.gain.value = 0;

      this.eqMid = this.context.createBiquadFilter();
      this.eqMid.type = 'peaking';
      this.eqMid.frequency.value = 1000;
      this.eqMid.Q.value = 0.5;
      this.eqMid.gain.value = 0;

      this.eqHigh = this.context.createBiquadFilter();
      this.eqHigh.type = 'highshelf';
      this.eqHigh.frequency.value = 3200;
      this.eqHigh.gain.value = 0;
      
      // Connect source chain: Source -> EQ (Low -> Mid -> High) -> Gain -> Analyser -> Splitter/Output
      this.eqLow.connect(this.eqMid);
      this.eqMid.connect(this.eqHigh);
      this.eqHigh.connect(this.gainNode);
      
      this.gainNode.connect(this.analyser);
      this.gainNode.connect(splitter);
      
      splitter.connect(this.analyserL, 0);
      splitter.connect(this.analyserR, 1);
      
      this.analyser.connect(this.context.destination);
    }
  }

  setEQ(band: 'low' | 'mid' | 'high', gain: number) {
    if (!this.context) this.initContext();
    const node = band === 'low' ? this.eqLow : band === 'mid' ? this.eqMid : this.eqHigh;
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
    this.source.connect(this.eqLow!);
    
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
