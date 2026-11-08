/**
 * High-Fidelity Web Audio Sound Synthesizer
 * Zero-dependency, zero-latency tactile audio feedback.
 * All sound frequencies, envelopes, harmonics, and filters are mathematically synthesized
 * using acoustic physics modeling (subtle attack curves, warm lowpass filtering, and harmonic overtones).
 */

const STORAGE_KEY_MUTED = "campus_radar_sound_muted";

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    try {
      this.muted = localStorage.getItem(STORAGE_KEY_MUTED) === "true";
    } catch {
      this.muted = false;
    }
  }

  private initContext(): AudioContext | null {
    if (this.muted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem(STORAGE_KEY_MUTED, String(muted));
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    if (!this.muted) {
      this.playTap();
    }
    return this.muted;
  }

  /**
   * Ultra-crisp tactile haptic micro-click (like macOS trackpad / mechanical switch)
   * Transient pop (1200Hz, 3ms) + warm body resonance (240Hz, 24ms).
   */
  public playTap(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Click transient (high-frequency pop)
      const oscClick = ctx.createOscillator();
      const gainClick = ctx.createGain();
      oscClick.type = "sine";
      oscClick.frequency.setValueAtTime(1400, now);
      oscClick.frequency.exponentialRampToValueAtTime(320, now + 0.015);

      gainClick.gain.setValueAtTime(0.001, now);
      gainClick.gain.linearRampToValueAtTime(0.045, now + 0.002);
      gainClick.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

      oscClick.connect(gainClick);
      gainClick.connect(ctx.destination);
      oscClick.start(now);
      oscClick.stop(now + 0.025);

      // Body thump (warm tactile anchor)
      const oscBody = ctx.createOscillator();
      const gainBody = ctx.createGain();
      oscBody.type = "triangle";
      oscBody.frequency.setValueAtTime(260, now);
      oscBody.frequency.exponentialRampToValueAtTime(80, now + 0.035);

      gainBody.gain.setValueAtTime(0.001, now);
      gainBody.gain.linearRampToValueAtTime(0.03, now + 0.003);
      gainBody.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

      oscBody.connect(gainBody);
      gainBody.connect(ctx.destination);
      oscBody.start(now);
      oscBody.stop(now + 0.04);
    } catch {
      // ignore
    }
  }

  /**
   * Satisfying magnetic toggle / bookmark snap
   */
  public playBookmark(saved = true): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2800, now);

      osc.type = "sine";
      const startFreq = saved ? 480 : 640;
      const endFreq = saved ? 880 : 360;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.07);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // ignore
    }
  }

  /**
   * Resonant radar sonar scan ping (warm acoustic pulse with gentle overtone)
   */
  public playRadarPing(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Dual harmonic oscillators for warm acoustic sonar
      const freqs = [880, 1320];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2200, now);

        osc.type = idx === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + 0.15);

        const initialVol = idx === 0 ? 0.06 : 0.025;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(initialVol, now + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.34);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Subtle two-note sparkle chime for fit & match moments (D5 -> A5 with soft bell envelope)
   */
  public playSparkle(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [587.33, 880]; // D5, A5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const startTime = now + idx * 0.065;

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3200, startTime);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.05, startTime + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.24);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Premium harmonic success chime (warm F-Major triad with rich acoustic decay)
   */
  public playSuccess(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Lush warm chord: F5 (698.46), A5 (880.00), C6 (1046.50), F6 (1396.91)
      const chord = [698.46, 880.0, 1046.5, 1396.91];
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const start = now + i * 0.038;

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3000, start);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.045, start + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.36);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.38);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Wispr Voice Recording Start Chime
   * Warm, welcoming two-tone ascending bell (F5 698Hz -> C6 1046Hz)
   */
  public playVoiceStart(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 698.46, delay: 0, duration: 0.16 },
        { freq: 1046.5, delay: 0.07, duration: 0.22 }
      ];

      notes.forEach(({ freq, delay, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const startTime = now + delay;

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3400, startTime);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.055, startTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.02);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Wispr Voice Recording Stop Chime
   * Smooth, gentle descending resolution (C6 1046Hz -> F5 698Hz)
   */
  public playVoiceStop(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 1046.5, delay: 0, duration: 0.14 },
        { freq: 783.99, delay: 0.065, duration: 0.2 }
      ];

      notes.forEach(({ freq, delay, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const startTime = now + delay;

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3000, startTime);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.045, startTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.02);
      });
    } catch {
      // ignore
    }
  }
}

export const sounds = new SoundManager();
