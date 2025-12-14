
class AudioController {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    // We init context lazily due to browser autoplay policies
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.isMuted ? 0 : 0.3; // Default volume
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.3;
    }
  }

  playBet() {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  playCashOut() {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    
    // First note
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(this.masterGain!);
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, t); // C5
    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc1.start(t);
    osc1.stop(t + 0.5);

    // Second note (Harmonic)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(this.masterGain!);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, t + 0.1); // C6
    gain2.gain.setValueAtTime(0.3, t + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
    osc2.start(t + 0.1);
    osc2.stop(t + 0.6);
  }

  playWhistle() {
    if (!this.ctx || this.isMuted) return;
    this.init();
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    // Whistle sound structure
    osc.connect(gain);
    gain.connect(this.masterGain!);

    // LFO for the "pea" rattle effect in the whistle
    lfo.frequency.value = 50; // fast vibration
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfoGain.gain.value = 0.3; // depth of tremolo

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2500, t);
    osc.frequency.linearRampToValueAtTime(2200, t + 0.1);
    osc.frequency.linearRampToValueAtTime(1800, t + 0.3);

    // Envelope
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.05);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);

    osc.start(t);
    lfo.start(t);
    
    osc.stop(t + 0.4);
    lfo.stop(t + 0.4);
  }

  playVuvuzela() {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Vuvuzela is roughly a B-flat (approx 233Hz) saw/square mix
    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(233, t);
    // Slight pitch bend to simulate blowing
    osc.frequency.linearRampToValueAtTime(230, t + 1.5);

    // Fade in and out
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.2);
    gain.gain.linearRampToValueAtTime(0.2, t + 1.0);
    gain.gain.linearRampToValueAtTime(0, t + 1.5);

    osc.start(t);
    osc.stop(t + 1.5);
  }

  startEngine() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || this.engineOsc) return;

    const t = this.ctx.currentTime;
    
    this.engineOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();

    this.engineOsc.connect(this.engineGain);
    this.engineGain.connect(this.masterGain!);

    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(100, t);
    // Ramp up frequency over time to simulate speed
    this.engineOsc.frequency.linearRampToValueAtTime(600, t + 10);

    this.engineGain.gain.setValueAtTime(0, t);
    this.engineGain.gain.linearRampToValueAtTime(0.1, t + 0.5);

    this.engineOsc.start(t);
  }

  updateEnginePitch(multiplier: number) {
    if (this.engineOsc && this.ctx) {
        // Map multiplier roughly to pitch
        const baseFreq = 100;
        const targetFreq = Math.min(baseFreq + (multiplier * 50), 800);
        this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    }
  }

  stopEngine() {
    if (this.engineOsc && this.ctx && this.engineGain) {
      const t = this.ctx.currentTime;
      this.engineGain.gain.setValueAtTime(this.engineGain.gain.value, t);
      this.engineGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      this.engineOsc.stop(t + 0.1);
      this.engineOsc = null;
      this.engineGain = null;
    }
  }

  playSplat() {
    if (!this.ctx || this.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    
    // 1. Low frequency thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.connect(oscGain);
    oscGain.connect(this.masterGain!);

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);

    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.start(t);
    osc.stop(t + 0.3);

    // 2. Noise burst (Splat)
    const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    
    // Filter to make it sound squishy
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, t);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain!);

    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    noise.start(t);
  }
}

export const audioService = new AudioController();
