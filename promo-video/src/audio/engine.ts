import { SFX_CUES, clamp } from '../timeline';

type Kind = 'tap' | 'whoosh' | 'success' | 'notify' | 'click';

export class PromoAudio {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  musicGain: GainNode | null = null;
  sfxGain: GainNode | null = null;
  song: HTMLAudioElement | null = null;
  started = false;
  private source: MediaElementAudioSourceNode | null = null;
  private mixDest: MediaStreamAudioDestinationNode | null = null;
  private fired = new Set<number>();

  async init() {
    if (this.ctx) return;
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 1;
    this.master.connect(ctx.destination);

    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0.5;
    this.musicGain.connect(this.master);

    this.sfxGain = ctx.createGain();
    this.sfxGain.gain.value = 0.16;
    this.sfxGain.connect(this.master);

    this.song = new Audio('/audio/education.mp3?v=3');
    this.song.preload = 'auto';
    this.song.loop = true;
    this.song.crossOrigin = 'anonymous';
    this.source = ctx.createMediaElementSource(this.song);
    this.source.connect(this.musicGain);

    try {
      await this.song.play();
      this.song.pause();
      this.song.currentTime = 0;
    } catch {
      /* wait for user gesture */
    }
  }

  getMixTrack(): MediaStreamTrack | null {
    if (!this.ctx || !this.master) return null;
    if (!this.mixDest) {
      this.mixDest = this.ctx.createMediaStreamDestination();
      this.master.connect(this.mixDest);
    }
    return this.mixDest.stream.getAudioTracks()[0] ?? null;
  }

  async start() {
    await this.init();
    if (!this.ctx || !this.song) return;
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.song.currentTime = 0;
    await this.song.play().catch(() => undefined);
    this.started = true;
    this.fired.clear();
  }

  seek(t: number) {
    if (!this.song) return;
    try {
      const dur = this.song.duration;
      this.song.currentTime = Number.isFinite(dur) && dur > 0 ? t % dur : Math.max(0, t);
    } catch {
      /* ignore */
    }
  }

  pause() {
    this.song?.pause();
    if (this.ctx?.state === 'running') void this.ctx.suspend();
  }

  resume() {
    if (this.ctx?.state === 'suspended') void this.ctx.resume();
    void this.song?.play().catch(() => undefined);
  }

  setMuted(muted: boolean) {
    if (this.master) this.master.gain.value = muted ? 0 : 1;
    if (this.song) this.song.muted = muted;
  }

  tick(t: number) {
    if (!this.started || !this.ctx || !this.musicGain) return;
    const intensity =
      t < 6 ? 0.42 :
      t < 72 ? 0.58 :
      t < 78 ? 0.7 :
      lerp(0.62, 0.38, clamp((t - 78) / 8));
    this.musicGain.gain.setTargetAtTime(intensity, this.ctx.currentTime, 0.2);
    for (const cue of SFX_CUES) {
      if (t >= cue.t && t < cue.t + 0.12 && !this.fired.has(cue.t)) {
        this.fired.add(cue.t);
        this.playSfx(cue.kind);
      }
    }
  }

  private playSfx(kind: Kind) {
    const ctx = this.ctx!;
    const dest = this.sfxGain!;
    const now = ctx.currentTime;
    if (kind === 'tap' || kind === 'click') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(kind === 'tap' ? 720 : 1100, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);
      g.gain.setValueAtTime(0.12, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(g); g.connect(dest);
      osc.start(now); osc.stop(now + 0.09);
    } else if (kind === 'whoosh') {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.32, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = ctx.createBufferSource();
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();
      src.buffer = buffer;
      f.type = 'bandpass';
      f.frequency.setValueAtTime(280, now);
      f.frequency.exponentialRampToValueAtTime(1600, now + 0.26);
      g.gain.setValueAtTime(0.1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      src.connect(f); f.connect(g); g.connect(dest);
      src.start(now);
    } else if (kind === 'success') {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t0 = now + i * 0.06;
        g.gain.setValueAtTime(0.08, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.2);
        osc.connect(g); g.connect(dest);
        osc.start(t0); osc.stop(t0 + 0.22);
      });
    } else if (kind === 'notify') {
      [784, 988].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = freq;
        const t0 = now + i * 0.1;
        g.gain.setValueAtTime(0.07, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.14);
        osc.connect(g); g.connect(dest);
        osc.start(t0); osc.stop(t0 + 0.16);
      });
    }
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const promoAudio = new PromoAudio();
