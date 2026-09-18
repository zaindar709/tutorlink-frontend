import { useCallback, useEffect, useRef, useState } from 'react';
import PromoFilm from './PromoFilm';
import { promoAudio } from './audio/engine';
import { DURATION } from './timeline';
import './index.css';

function pickRecorderMime() {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  return candidates.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
}

function saveWebm(chunks: Blob[], type: string) {
  const blob = new Blob(chunks, { type: type || 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'TutorLink-Learn-with-Ease.webm';
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 8000);
}

export default function App() {
  const [t, setT] = useState(() => {
    const q = Number(new URLSearchParams(window.location.search).get('t') || 0);
    return Number.isFinite(q) ? Math.min(DURATION, Math.max(0, q)) : 0;
  });
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(
    () => new URLSearchParams(window.location.search).has('t')
  );
  const [muted, setMuted] = useState(false);
  const [hud, setHud] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recNote, setRecNote] = useState('');
  const raf = useRef(0);
  const origin = useRef(0);
  const offset = useRef(0);
  const recChunks = useRef<Blob[]>([]);
  const recRef = useRef<MediaRecorder | null>(null);
  const recTimer = useRef(0);

  const loop = useCallback((now: number) => {
    const elapsed = (now - origin.current) / 1000 + offset.current;
    if (elapsed >= DURATION) {
      setT(DURATION);
      setPlaying(false);
      promoAudio.pause();
      return;
    }
    setT(elapsed);
    promoAudio.tick(elapsed);
    raf.current = requestAnimationFrame(loop);
  }, []);

  const playFrom = async (at: number) => {
    await promoAudio.init();
    const startAt = at >= DURATION - 0.05 ? 0 : at;
    setT(startAt);
    origin.current = performance.now();
    promoAudio.started = false;
    await promoAudio.start();
    promoAudio.seek(startAt);
    offset.current = startAt;
    origin.current = performance.now();
    setReady(true);
    setPlaying(true);
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
  };

  const play = async () => {
    if (playing) return;
    if (promoAudio.started && t > 0.05 && t < DURATION - 0.05) {
      await promoAudio.init();
      if (promoAudio.ctx?.state === 'suspended') await promoAudio.ctx.resume();
      promoAudio.seek(t);
      promoAudio.resume();
      offset.current = t;
      origin.current = performance.now();
      setPlaying(true);
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(loop);
      return;
    }
    await playFrom(t >= DURATION - 0.05 ? 0 : t);
  };

  const pause = () => {
    setPlaying(false);
    offset.current = t;
    cancelAnimationFrame(raf.current);
    promoAudio.pause();
  };

  const restart = async () => {
    await playFrom(0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (playing) pause();
        else void play();
      }
      if (e.key === 'h') setHud(v => !v);
      if (e.key === 'm') {
        setMuted(v => {
          promoAudio.setMuted(!v);
          return !v;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => () => {
    cancelAnimationFrame(raf.current);
    window.clearTimeout(recTimer.current);
  }, []);

  const record = async () => {
    try {
      setRecNote('Allow this Chrome tab once. The full 86s film then saves automatically.');
      await promoAudio.init();
      if (muted) {
        promoAudio.setMuted(false);
        setMuted(false);
      }

      const display = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30,
          width: 1920,
          height: 1080,
          displaySurface: 'browser',
        } as MediaTrackConstraints,
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
        surfaceSwitching: 'exclude',
        monitorTypeSurfaces: 'exclude',
      } as DisplayMediaStreamOptions & {
        preferCurrentTab?: boolean;
        selfBrowserSurface?: string;
        surfaceSwitching?: string;
        monitorTypeSurfaces?: string;
      });

      const videoTrack = display.getVideoTracks()[0] as BrowserCaptureMediaStreamTrack;
      const stage = document.getElementById('promo-stage');
      try {
        if (stage && typeof CropTarget !== 'undefined' && typeof videoTrack.cropTo === 'function') {
          const target = await CropTarget.fromElement(stage);
          await videoTrack.cropTo(target);
        }
      } catch {
        /* full-tab capture still downloads the film */
      }

      const mixed = new MediaStream(videoTrack ? [videoTrack] : []);
      const audioTrack = promoAudio.getMixTrack();
      if (audioTrack) mixed.addTrack(audioTrack);

      recChunks.current = [];
      const mime = pickRecorderMime();
      const rec = new MediaRecorder(mixed, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
      recRef.current = rec;
      rec.ondataavailable = e => {
        if (e.data.size) recChunks.current.push(e.data);
      };
      rec.onstop = () => {
        saveWebm(recChunks.current, rec.mimeType || mime);
        setRecording(false);
        setHud(true);
        setRecNote('Saved TutorLink-Learn-with-Ease.webm');
        display.getTracks().forEach(tr => tr.stop());
      };
      videoTrack?.addEventListener('ended', () => {
        if (rec.state !== 'inactive') rec.stop();
      });

      rec.start(1000);
      setRecording(true);
      setHud(false);
      setRecNote('');
      await restart();
      recTimer.current = window.setTimeout(() => {
        if (rec.state !== 'inactive') rec.stop();
      }, (DURATION + 0.7) * 1000);
    } catch {
      setRecording(false);
      setHud(true);
      setRecNote('Download cancelled. Click again and share this tab.');
    }
  };

  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = String(Math.floor(t % 60)).padStart(2, '0');

  return (
    <div className="app-shell">
      <div className="stage-wrap">
        <PromoFilm t={t} />
        {!ready ? (
          <div className="start-gate">
            <div className="start-card">
              <img src="/images/TutorLinkLogo.png" alt="" />
              <h1>TutorLink</h1>
              <p>86s · 1920×1080 · educational soundtrack</p>
              <button className="play" type="button" onClick={() => void play()}>
                Play advertisement
              </button>
              <button className="play ghost" type="button" onClick={() => void record()} disabled={recording}>
                Download full video
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <div className={`hud${hud ? '' : ' hidden'}`}>
        <button type="button" onClick={() => (playing ? pause() : void play())}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" onClick={() => void restart()}>Restart</button>
        <button
          type="button"
          onClick={() => {
            setMuted(v => {
              promoAudio.setMuted(!v);
              return !v;
            });
          }}
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>
        <button type="button" onClick={() => void record()} disabled={recording}>
          {recording ? 'Saving 86s…' : 'Download full video'}
        </button>
        <div className="chip time">
          {mm}:{ss} / 01:26
        </div>
        {recNote ? <div className="chip">{recNote}</div> : null}
      </div>
    </div>
  );
}
