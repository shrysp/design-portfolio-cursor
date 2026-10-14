'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The start screen's proof that the microphone works, before anything is
 * spent: which one it is, a live level, and "I can hear you" once it does.
 *
 * Only opens the microphone if the browser has already been given it — a
 * prompt on arrival, before the visitor has chosen to talk, is not asked for.
 * Otherwise it says the microphone is asked for on Start, or that it is
 * blocked. Closed again when the start screen goes, so the session can take it.
 *
 * Opening it is held until `ready`: starting a microphone and an audio context
 * costs the main thread a few frames, which the landing photos would show.
 * The level is written straight onto the bars, not through React state, so a
 * live microphone re-renders nothing.
 */
export type MicAccess = 'checking' | 'granted' | 'prompt' | 'denied';

/**
 * Whether the browser lets the tour have the microphone, kept up to date: it
 * changes when the visitor answers the browser's prompt, or allows it from
 * the address bar after blocking it. 'prompt' where the browser cannot say
 * (no Permissions API for the microphone in older Safari).
 */
export function useMicAccess(): MicAccess {
  const [access, setAccess] = useState<MicAccess>('checking');
  useEffect(() => {
    let alive = true;
    let status: PermissionStatus | null = null;
    const read = () => {
      if (alive && status) setAccess(status.state as MicAccess);
    };
    if (!navigator.permissions) {
      setAccess('prompt');
      return;
    }
    navigator.permissions.query({ name: 'microphone' as PermissionName }).then(
      (s) => {
        status = s;
        read();
        s.addEventListener('change', read);
      },
      () => alive && setAccess('prompt'),
    );
    return () => {
      alive = false;
      status?.removeEventListener('change', read);
    };
  }, []);
  return access;
}

const BARS = [0.35, 0.65, 1, 0.8, 0.5];

const shortLabel = (label: string) =>
  // "Default - MacBook Pro Microphone (Built-in)" → "MacBook Pro Microphone"
  label.replace(/^Default\s*-\s*/i, '').replace(/\s*\(.*\)\s*$/, '');

export default function MicCheck({ ready = true }: { ready?: boolean }) {
  const permission = useMicAccess();
  const [failed, setFailed] = useState(false);
  const access: MicAccess = failed ? 'denied' : permission;
  const [label, setLabel] = useState('');
  const [heard, setHeard] = useState(false);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  // Which microphone: cheap, and settled while the card is still hidden, so
  // nothing about it changes once it is on screen.
  useEffect(() => {
    if (access !== 'granted') return;
    let alive = true;
    void navigator.mediaDevices.enumerateDevices().then((devices) => {
      const inputs = devices.filter((d) => d.kind === 'audioinput');
      const pick = inputs.find((d) => d.deviceId === 'default') ?? inputs[0];
      if (alive && pick?.label) setLabel(shortLabel(pick.label));
    });
    return () => {
      alive = false;
    };
  }, [access]);

  useEffect(() => {
    if (!ready || access !== 'granted') return;
    let alive = true;
    let stop = () => {};
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!alive) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const track = stream.getAudioTracks()[0];
        if (track?.label) setLabel(shortLabel(track.label));
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const data = new Float32Array(analyser.fftSize);
        let raf = 0;
        let smooth = 0;
        let wasHeard = false;
        const tick = () => {
          analyser.getFloatTimeDomainData(data);
          let sum = 0;
          for (const v of data) sum += v * v;
          const rms = Math.sqrt(sum / data.length);
          smooth = Math.max(rms * 6, smooth * 0.85);
          const l = Math.min(1, smooth);
          bars.current.forEach((el, i) => {
            if (el) el.style.transform = `scaleY(${(3 + 11 * Math.min(1, l * BARS[i] * 1.6)) / 14})`;
          });
          if (!wasHeard && l > 0.12) {
            wasHeard = true;
            setHeard(true);
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        stop = () => {
          cancelAnimationFrame(raf);
          stream.getTracks().forEach((t) => t.stop());
          void ctx.close();
        };
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
      stop();
    };
  }, [ready, access]);

  const live = access === 'granted';
  const note =
    access === 'denied'
      ? 'Blocked in your browser'
      : access === 'granted'
        ? heard
          ? 'I can hear you'
          : 'Say something'
        : 'Asked for when you start';

  return (
    <div className="tour-mic" data-crt-clear data-access={access} aria-live="polite">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="tour-mic-icon">
        <rect x="5.5" y="1.5" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span className="tour-mic-name">{live && label ? label : 'Your microphone'}</span>
      {live && (
        <span className="tour-mic-level" aria-hidden>
          {BARS.map((_, i) => (
            <span
              key={i}
              ref={(el) => {
                bars.current[i] = el;
              }}
            />
          ))}
        </span>
      )}
      <span className="tour-mic-note">{note}</span>
    </div>
  );
}
