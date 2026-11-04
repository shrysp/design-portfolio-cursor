'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  DEFAULT_CONFIG,
  HOUSING_W,
  JADE,
  NOVA,
  PIP,
  SILHOUETTES,
  TIDE,
  createEngine,
  definePreset,
  housingHeight,
  resolvePalette,
  type CharacterPreset,
  type EngineConfig,
} from '@shrysp/cameo';
import { Character, CharacterView, type CharacterHandle } from '@shrysp/cameo/react';
import '@shrysp/cameo/styles.css';
import { MOOD_REACTIONS, reactionTo, showMood, strengthOf } from '@/components/cameo/moods';
import { RECORDINGS } from '@/components/cameo/recordings';
import { useTheme } from '../../primitives';

/*
 * The live parts of the Cameo slides: the real package, driven by the same calls a product would make.
 * Everything here lives in the slide's 1920×1080 space, so sizes are slide pixels.
 */

export const FAMILY = { JADE, NOVA, PIP, TIDE };

/** The character a developer could define in one call, as on the code slide */
export const ROSE = definePreset({ palette: 'rose', silhouette: SILHOUETTES.crt, eyeBuild: 'vertical', polarity: 'lcd' });

export { Character, type CharacterHandle };

/** A pill button in the deck's type, lit when it is on */
export function Pill({ children, on, onClick, tone = 'light', style }: { children: ReactNode; on?: boolean; onClick?: () => void; tone?: 'light' | 'dark'; style?: CSSProperties }) {
  const t = useTheme();
  const dark = tone === 'dark';
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      style={{
        fontFamily: t.sans,
        fontSize: 22,
        fontWeight: 500,
        padding: '12px 24px',
        borderRadius: 999,
        cursor: 'pointer',
        border: `1.5px solid ${on ? t.accent : dark ? '#3A3F5C' : '#D6D6D6'}`,
        background: on ? t.accent : dark ? 'transparent' : '#FFFFFF',
        color: on ? '#FFFFFF' : dark ? t.inverse2 : t.ink2,
        transition: 'background 160ms ease-out, border-color 160ms ease-out, color 160ms ease-out',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** One line of code in mono, for showing what a click just ran */
export function Ran({ children, color }: { children: ReactNode; color?: string }) {
  const t = useTheme();
  return (
    <code aria-live="polite" style={{ fontFamily: t.mono, fontSize: 20, color: color ?? t.ink3, whiteSpace: 'nowrap' }}>
      {children}
    </code>
  );
}

/** Whether the viewer asked for less motion */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const on = () => setReduced(query.matches);
    query.addEventListener('change', on);
    return () => query.removeEventListener('change', on);
  }, []);
  return reduced;
}

/* ———————————————————————— Attention ———————————————————————— */

// Where attention changes what the face rests in: the director's own thresholds
export const BANDS = [
  { name: 'sleeping', label: 'Asleep', from: 0 },
  { name: 'drowsy', label: 'Drowsy', from: 0.09 },
  { name: 'idle', label: 'Idle', from: 0.3 },
  { name: 'listening', label: 'Attentive', from: 0.82 },
] as const;

export const bandOf = (attention: number) => [...BANDS].reverse().find((band) => attention >= band.from)!;

/** Reads the director a few times a second: its attention, and the pose that comes out */
export function useDirector(character: React.RefObject<CharacterHandle | null>, every = 100) {
  const [reading, setReading] = useState({ attention: 0.7, pose: 'idle', held: null as string | null });
  useEffect(() => {
    const timer = setInterval(() => {
      const handle = character.current;
      if (!handle) return;
      setReading({ attention: handle.director.arousal, pose: handle.engine.poseId, held: handle.director.held });
    }, every);
    return () => clearInterval(timer);
  }, [character, every]);
  return reading;
}

/* ———————————————————————— Voice ———————————————————————— */

// Loudness that fills a bar. Speech sits far below full scale.
const LOUD = 0.25;

type Mode = 'off' | 'mic' | number;

/**
 * Plays one of PIP's live recordings through the character, or follows the microphone, as the
 * case study's voice demo does. `onLevel` gets the loudness about sixty times a second.
 */
export function useVoice(character: React.RefObject<CharacterHandle | null>, onLevel?: (level: number) => void) {
  const context = useRef<AudioContext | null>(null);
  const clips = useRef(new Map<string, AudioBuffer>());
  const teardown = useRef<(() => void) | null>(null);
  const levelRef = useRef(onLevel);
  levelRef.current = onLevel;

  const [mode, setMode] = useState<Mode>('off');
  const [line, setLine] = useState<number | null>(null);
  const [read, setRead] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const lineRef = useRef<number | null>(null);
  lineRef.current = line;

  const stop = useCallback(() => {
    teardown.current?.();
    teardown.current = null;
    setMode('off');
    setLine(null);
    setRead(false);
  }, []);

  useEffect(
    () => () => {
      teardown.current?.();
      void context.current?.close();
    },
    [],
  );

  const follow = (ctx: AudioContext, node: AudioNode) => {
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    node.connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    let level = 0;
    let frame = 0;
    const draw = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) sum += ((sample - 128) / 128) ** 2;
      const raw = Math.min(1, Math.sqrt(sum / samples.length) / LOUD);
      level = raw > level ? raw : level + (raw - level) * 0.15;
      levelRef.current?.(level);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      node.disconnect(analyser);
      levelRef.current?.(0);
    };
  };

  const play = async (index: number) => {
    stop();
    setMicError(null);
    setMode(index);
    const recording = RECORDINGS[index];
    const ctx = (context.current ??= new AudioContext());
    await ctx.resume();
    let clip = clips.current.get(recording.src);
    if (!clip) {
      clip = await ctx.decodeAudioData(await (await fetch(recording.src)).arrayBuffer());
      clips.current.set(recording.src, clip);
    }
    const voice = ctx.createGain();
    const copy = ctx.createMediaStreamDestination();
    voice.connect(ctx.destination);
    voice.connect(copy);
    const stopMeter = follow(ctx, voice);
    const stopSpeaking = await character.current?.speakFrom(copy.stream, { hold: 'auto', volume: 0 });

    const source = ctx.createBufferSource();
    source.buffer = clip;
    source.connect(voice);
    source.start(ctx.currentTime + 0.1);
    // Each sentence comes up as it starts being heard; its reading arrives, and the face reacts,
    // when it did in the live session
    const timers = recording.sentences.flatMap((said, at) => [
      setTimeout(() => {
        setLine(at);
        setRead(false);
      }, 100 + Math.max(said.from, (recording.sentences[at - 1]?.readAt ?? -1) + 0.4) * 1000),
      setTimeout(() => {
        setRead((already) => already || lineRef.current === at);
        showMood(character.current, said.mood, said.moods[said.mood] ?? 1);
      }, 100 + said.readAt * 1000),
    ]);
    timers.push(setTimeout(stop, 100 + clip.duration * 1000 + 400));

    teardown.current = () => {
      timers.forEach(clearTimeout);
      try {
        source.stop();
      } catch {
        // Not started yet: nothing to stop
      }
      stopSpeaking?.();
      stopMeter();
      voice.disconnect();
    };
  };

  const mic = async () => {
    stop();
    setMicError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicError('The microphone is blocked for this page.');
      return;
    }
    setMode('mic');
    const ctx = (context.current ??= new AudioContext());
    await ctx.resume();
    const source = ctx.createMediaStreamSource(stream);
    const silent = ctx.createGain();
    silent.gain.value = 0;
    source.connect(silent);
    silent.connect(ctx.destination);
    const stopMeter = follow(ctx, source);
    const stopListening = await character.current?.listenTo(stream, { hold: 'auto', volume: 0 });
    teardown.current = () => {
      stopListening?.();
      stopMeter();
      source.disconnect();
      silent.disconnect();
      stream.getTracks().forEach((track) => track.stop());
    };
  };

  const recording = typeof mode === 'number' ? RECORDINGS[mode] : null;
  const said = recording && line != null ? recording.sentences[line] : null;
  return { mode, play, mic, stop, said, read: Boolean(said && read), micError };
}

export { MOOD_REACTIONS, RECORDINGS, reactionTo, showMood, strengthOf };

/* ———————————————————————— A face asked for any moment ———————————————————————— */

/** The engine, set up once for one change of expression, drawn at whichever moment is asked for */
export function SampledFace({
  preset = PIP,
  engine,
  config,
  at,
  size,
}: {
  preset?: CharacterPreset;
  engine: ReturnType<typeof createEngine>;
  config: EngineConfig;
  at: number;
  size: number;
}) {
  const palette = useMemo(() => resolvePalette(preset), [preset]);
  const scale = size / HOUSING_W;
  return (
    <div className="char-stage-frame" style={{ width: size, height: housingHeight(preset.silhouette) * scale }}>
      <CharacterView frame={engine.sample(at, {}, config)} silhouette={preset.silhouette} palette={palette} polarity={preset.polarity} scanlines scale={scale} />
    </div>
  );
}

// How a change of expression is carried: each is a switch on the engine
export const FEEL = [
  { key: 'eyeAnticipation', name: 'Anticipation', body: 'The eyes squint for a moment before they open wide.' },
  { key: 'eyesLead', name: 'Eyes lead', body: 'The eyes move first and the body follows.' },
  { key: 'blinkOnChange', name: 'Blink', body: 'A quick blink as the change begins.' },
  { key: 'eyeSettle', name: 'Settle', body: 'The eyes go slightly too far, then come back.' },
  { key: 'headArc', name: 'Head arc', body: 'The head travels in a curve, not a straight line.' },
] as const;

export type Feel = Record<(typeof FEEL)[number]['key'], boolean>;
export const ALL_FEEL: Feel = { eyeAnticipation: true, eyesLead: true, blinkOnChange: true, eyeSettle: true, headArc: true };

// The engine's clock at the change, so there is a little rest to show before it
export const CHANGE_AT = 2;

/** One change of expression, from idle to `pose`, carried by whichever details are on */
export function useChange(pose: string, feel: Feel, preset: CharacterPreset = PIP) {
  // Its own unprompted movement is off, so only the change shows
  const config = useMemo<EngineConfig>(() => ({ ...DEFAULT_CONFIG, blinking: false, saccades: false, idleMotion: false, ...feel }), [feel]);
  const engine = useMemo(() => {
    const made = createEngine('idle', preset.eyeBuild);
    made.setPose(pose, CHANGE_AT, config);
    return made;
  }, [pose, config, preset]);
  return { engine, config };
}

/**
 * A clock for scrubbing: plays from `from` to `to` at `slowdown`× slower than real time, forwards
 * or backwards, and stops at the end. Setting `at` by hand pauses it.
 */
export function useScrub({ from, to, slowdown, autoplay = true, onEnd }: { from: number; to: number; slowdown: number; autoplay?: boolean; onEnd?: () => void }) {
  const [at, setAtState] = useState(from);
  const [direction, setDirection] = useState<1 | -1 | 0>(autoplay ? 1 : 0);
  const atRef = useRef(at);
  atRef.current = at;
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  useEffect(() => {
    if (!direction) return;
    let last = performance.now();
    let frame = 0;
    const step = (now: number) => {
      // A frame's time can fall just before the moment playing began, so never step backwards
      const next = atRef.current + (direction * Math.max(0, now - last)) / 1000 / slowdown;
      last = Math.max(last, now);
      if ((direction === 1 && next >= to) || (direction === -1 && next <= from)) {
        setAtState(direction === 1 ? to : from);
        setDirection(0);
        endRef.current?.();
        return;
      }
      setAtState(next);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [direction, from, to, slowdown]);

  return {
    at,
    direction,
    setAt: (value: number) => {
      setDirection(0);
      setAtState(value);
    },
    play: (dir: 1 | -1 = 1) => {
      if (dir === 1 && atRef.current >= to) setAtState(from);
      if (dir === -1 && atRef.current <= from) setAtState(to);
      setDirection(dir);
    },
    pause: () => setDirection(0),
  };
}

/** A range input drawn in the deck's style */
export function Scrubber({ value, min, max, onChange, dark, label }: { value: number; min: number; max: number; onChange: (value: number) => void; dark?: boolean; label: string }) {
  const t = useTheme();
  const share = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={0.001}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="present-range"
      style={
        {
          flex: 1,
          '--fill': `${share}%`,
          '--track': dark ? '#3A3F5C' : '#E6E6E6',
          '--accent': dark ? '#A7C0F1' : t.accent,
        } as CSSProperties
      }
    />
  );
}
