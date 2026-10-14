'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_CONFIG, HOUSING_W, JADE, createEngine, housingHeight, resolvePalette, type EngineConfig } from '@shrysp/cameo';
import { CharacterView } from '@shrysp/cameo/react';
import '@shrysp/cameo/styles.css';
import { Row, lit, resting } from './DemoParts';

const PRESET = JADE;
const PALETTE = resolvePalette(PRESET);

const POSES = ['surprised', 'happy', 'sad', 'angry'] as const;

// How a change of expression is carried: each is a switch on the engine
const FEEL = [
  { key: 'eyeAnticipation', label: 'anticipation' },
  { key: 'eyesLead', label: 'eyes lead' },
  { key: 'blinkOnChange', label: 'blink' },
  { key: 'eyeSettle', label: 'settle' },
  { key: 'headArc', label: 'head arc' },
] as const;

type Feel = Record<(typeof FEEL)[number]['key'], boolean>;

// The engine's clock when the expression changes, and the stretch around it
// the demo covers, in seconds from that change
const CHANGE_AT = 2;
const FROM = -0.1;
const TO = 1;
// The moments drawn in the strip, in seconds from the change: close together
// at the start, where most of it happens
const MOMENTS = [0, 0.04, 0.08, 0.14, 0.24, 0.45, 0.9];
// Playback runs at a quarter speed, slow enough to see each part
const SLOWDOWN = 4;

function Face({ engine, config, at, size }: { engine: ReturnType<typeof createEngine>; config: EngineConfig; at: number; size: number }) {
  const scale = size / HOUSING_W;
  return (
    <div className="char-stage-frame" style={{ width: size, height: housingHeight(PRESET.silhouette) * scale }}>
      <CharacterView
        frame={engine.sample(CHANGE_AT + at, {}, config)}
        silhouette={PRESET.silhouette}
        palette={PALETTE}
        polarity={PRESET.polarity}
        scanlines
        scale={scale}
      />
    </div>
  );
}

/**
 * The engine as a function of time. One change of expression is set up once;
 * every face here, the large one and the strip beneath it, is the same engine
 * asked for a different moment. Nothing is recorded and nothing plays: the
 * slider only changes which moment is asked for.
 */
export default function TimeDemo() {
  const [pose, setPose] = useState<(typeof POSES)[number]>('surprised');
  const [feel, setFeel] = useState<Feel>({ eyeAnticipation: true, eyesLead: true, blinkOnChange: true, eyeSettle: true, headArc: true });
  const [at, setAt] = useState(0.08);
  const [playing, setPlaying] = useState(false);

  // Its own unprompted movement is switched off, so only the change shows
  const config = useMemo<EngineConfig>(() => ({ ...DEFAULT_CONFIG, blinking: false, saccades: false, idleMotion: false, ...feel }), [feel]);
  const engine = useMemo(() => {
    const made = createEngine('idle', PRESET.eyeBuild);
    made.setPose(pose, CHANGE_AT, config);
    return made;
  }, [pose, config]);

  const frame = useRef(0);
  useEffect(() => {
    if (!playing) return;
    const began = performance.now();
    const step = (now: number) => {
      const next = FROM + (now - began) / 1000 / SLOWDOWN;
      if (next >= TO) {
        setAt(TO);
        setPlaying(false);
        return;
      }
      setAt(next);
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [playing]);

  const strip = useMemo(
    () => MOMENTS.map((moment) => ({ moment, face: <Face engine={engine} config={config} at={moment} size={64} /> })),
    [engine, config],
  );
  // The strip's moment the slider is nearest to, if it is close
  const nearest = MOMENTS.reduce((best, moment) => (Math.abs(moment - at) < Math.abs(best - at) ? moment : best));

  return (
    <figure className="isolate relative w-full surface bg-stone-100 -space-y-2 my-3">
      <div className="isolate relative rounded-[calc(var(--surface-radius)-1px)] bg-white overflow-hidden outline outline-stone-200">
        <div className="flex h-60 items-center justify-center">
          <Face engine={engine} config={config} at={at} size={168} />
        </div>

        <div className="flex flex-col gap-3 px-4 pb-5">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setPlaying(!playing)} className={`${playing ? lit : resting} w-28`}>
              {playing ? 'Pause' : 'Play slowly'}
            </button>
            <input
              type="range"
              aria-label="Moment"
              min={FROM}
              max={TO}
              step={0.005}
              value={at}
              onChange={(event) => {
                setPlaying(false);
                setAt(Number(event.target.value));
              }}
              className="h-8 min-w-0 flex-1 cursor-pointer accent-blue-500"
            />
            <span className="w-20 shrink-0 text-right font-mono text-[13px] tabular-nums text-stone-500">
              {at < 0 ? '−' : '+'}
              {Math.abs(Math.round(at * 1000))} ms
            </span>
          </div>

          {/* The same engine, asked for seven moments at once */}
          <div className="flex items-end justify-between gap-1 overflow-x-auto pt-2">
            {strip.map(({ moment, face }) => (
              <button
                key={moment}
                type="button"
                aria-label={`${Math.round(moment * 1000)} milliseconds after the change`}
                onClick={() => {
                  setPlaying(false);
                  setAt(moment);
                }}
                className={`flex shrink-0 cursor-pointer flex-col items-center gap-2 rounded-lg px-1.5 py-2 transition-colors duration-150 ${moment === nearest && Math.abs(moment - at) < 0.02 ? 'bg-stone-100' : 'hover:bg-stone-50'}`}
              >
                {face}
                <span className="font-mono text-[11px] tabular-nums text-stone-400">{Math.round(moment * 1000)} ms</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4 pt-6">
        <Row name="Change to" note="From idle">
          {POSES.map((name) => (
            <button key={name} type="button" aria-pressed={pose === name} onClick={() => setPose(name)} className={pose === name ? lit : resting}>
              {name}
            </button>
          ))}
        </Row>
        <Row name="Carried by" note="Switch each off to compare">
          {FEEL.map(({ key, label }) => (
            <button key={key} type="button" aria-pressed={feel[key]} onClick={() => setFeel({ ...feel, [key]: !feel[key] })} className={feel[key] ? lit : resting}>
              {label}
            </button>
          ))}
        </Row>
      </div>
    </figure>
  );
}
