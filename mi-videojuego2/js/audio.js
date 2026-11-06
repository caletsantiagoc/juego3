/**
 * CodeBot Procedural Web Audio Engine
 * Generates futuristic SFX and ambient background tones via Web Audio API.
 * Zero external audio files required!
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgOsc1 = null;
    this.bgOsc2 = null;
    this.bgGain = null;
    this.musicPlaying = false;

    // Load saved preferences
    const savedMuted = localStorage.getItem('codebot_muted');
    if (savedMuted !== null) {
      this.muted = savedMuted === 'true';
    }
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('codebot_muted', this.muted);
    if (this.muted && this.musicPlaying) {
      this.stopAmbientMusic();
    } else if (!this.muted && !this.musicPlaying) {
      this.startAmbientMusic();
    }
    return this.muted;
  }

  // --- Sound Effects ---

  // Tactile button click
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Robot step forward sound
  playMove() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Robot turning direction
  playTurn() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.linearRampToValueAtTime(520, now + 0.07);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Collecting energy crystal
  playCollect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + index * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.16, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.15);
    });
  }

  // Laser zap / barrier sound
  playLaser() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Execution Error / Collision sound
  playError() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Victory fanfare arpeggio
  playWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // C Major Arpeggio Fanfare
    const notes = [
      { f: 523.25, d: 0.1 },  // C5
      { f: 659.25, d: 0.1 },  // E5
      { f: 783.99, d: 0.1 },  // G5
      { f: 1046.50, d: 0.2 }, // C6
      { f: 1318.51, d: 0.4 }  // E6
    ];

    let offset = 0;
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + offset;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + n.d);

      offset += n.d * 0.8;
    });
  }

  // Step-by-step debugger tick
  playStep() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Background Synth Atmosphere (Subtle cyberpunk chord pad)
  startAmbientMusic() {
    if (this.muted || this.musicPlaying) return;
    this.init();
    if (!this.ctx) return;

    try {
      this.bgGain = this.ctx.createGain();
      this.bgGain.gain.setValueAtTime(0.025, this.ctx.currentTime);

      this.bgOsc1 = this.ctx.createOscillator();
      this.bgOsc1.type = 'sine';
      this.bgOsc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

      this.bgOsc2 = this.ctx.createOscillator();
      this.bgOsc2.type = 'triangle';
      this.bgOsc2.frequency.setValueAtTime(164.81, this.ctx.currentTime); // E3

      this.bgOsc1.connect(this.bgGain);
      this.bgOsc2.connect(this.bgGain);
      this.bgGain.connect(this.ctx.destination);

      this.bgOsc1.start();
      this.bgOsc2.start();
      this.musicPlaying = true;
    } catch (e) {
      console.warn("Ambient music init skipped until user interaction", e);
    }
  }

  stopAmbientMusic() {
    if (!this.musicPlaying) return;
    try {
      if (this.bgOsc1) { this.bgOsc1.stop(); this.bgOsc1.disconnect(); }
      if (this.bgOsc2) { this.bgOsc2.stop(); this.bgOsc2.disconnect(); }
      this.musicPlaying = false;
    } catch (e) {}
  }
}

// Global sound instance
const soundEngine = new SoundEngine();
