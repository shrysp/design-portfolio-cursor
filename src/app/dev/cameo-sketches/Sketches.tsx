'use client';

import { useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { DEFAULT_CONFIG, HOUSING_W, JADE, NOVA, PIP, createEngine, housingHeight, resolvePalette, type CharacterPreset, type EngineConfig, type Frame } from '@shrysp/cameo';
import { CharacterView } from '@shrysp/cameo/react';
import '@shrysp/cameo/styles.css';
import ControlsFigure from '@/components/figures/controls/ControlsFigure';
import DiscFigure from '@/components/figures/disc/DiscFigure';
import TankFigure from '@/components/figures/tank/TankFigure';
import TapeFigure from '@/components/figures/tape/TapeFigure';

/* Still layouts, drawn from real things: every face is the package's engine
   asked for one moment, the curves are its own numbers, and the voice figure
   uses the timings and waveform of the "angry" recording. Nothing moves yet. */

const STILL: EngineConfig = { ...DEFAULT_CONFIG, blinking: false, saccades: false, idleMotion: false };
const INK = 'rgb(31 29 25 / 0.86)';
const MUTED = 'rgb(31 29 25 / 0.5)';
const HAIR = 'rgb(40 34 20 / 0.22)';
const BLUE = 'var(--color-blue-500)';
const RED = 'var(--color-red-500)';
const label = 'font-mono text-[10px] uppercase tracking-[0.14em]';

/** The frame for a pose once it has settled, or part-way through a gesture. */
function frameOf(pose: string, preset: CharacterPreset, { after = 30, voice = 0, config = STILL }: { after?: number; voice?: number; config?: EngineConfig } = {}): Frame {
  const engine = createEngine('idle', preset.eyeBuild);
  engine.setPose(pose, 2, config);
  return engine.sample(2 + after, { voice }, config);
}

function Face({ frame, preset = JADE, size, style }: { frame: Frame; preset?: CharacterPreset; size: number; style?: CSSProperties }) {
  const scale = size / HOUSING_W;
  return (
    <div className="char-stage-frame" style={{ width: size, height: housingHeight(preset.silhouette) * scale, ...style }}>
      <CharacterView frame={frame} silhouette={preset.silhouette} palette={resolvePalette(preset)} polarity={preset.polarity} scanlines scale={scale} />
    </div>
  );
}

/** A face placed by its centre on a figure's own coordinates. */
function At({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <div className="absolute" style={{ left: x, top: y, translate: '-50% -50%' }}>
      {children}
    </div>
  );
}

function Sheet({ n, title, idea, children }: { n: number; title: string; idea: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <span className={`${label} text-stone-400`}>Fig. {n}</span>
        <h2 className="text-header-2 mx-0 w-auto">{title}</h2>
      </div>
      <p className="text-sm text-stone-500 max-w-[60ch]">{idea}</p>
      <div className="surface bg-white overflow-x-auto p-6">{children}</div>
    </section>
  );
}

const W = 624;

/* ── 1. The expression sheet ─────────────────────────────────────────────── */

const MOODS = ['idle', 'listening', 'thinking', 'speaking', 'focused', 'error', 'drowsy', 'sleeping', 'happy', 'excited', 'love', 'starstruck', 'curious', 'surprised', 'suspicious', 'sad', 'angry', 'dizzy'];

function Vocabulary() {
  // The three kinds of direction, as shapes over time
  const x0 = 96;
  const row = (y: number) => ({ base: y + 34, top: y + 8 });
  const state = row(0);
  const gesture = row(64);
  const event = row(128);
  return (
    <div style={{ width: W }} className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <div className="flex w-52 shrink-0 flex-col items-center gap-2">
          <Face frame={frameOf('thinking', JADE)} size={176} />
          <span className={`${label} text-stone-500`}>thinking</span>
        </div>
        <div className="grid flex-1 grid-cols-6 gap-x-2 gap-y-3">
          {MOODS.map((mood) => (
            <div key={mood} className={`flex flex-col items-center gap-1 rounded-lg py-1 ${mood === 'thinking' ? 'bg-stone-100' : ''}`}>
              <Face frame={frameOf(mood, JADE)} size={50} />
              <span className="text-[10px] text-stone-500">{mood}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative" style={{ width: W, height: 190 }}>
        <svg width={W} height={190} className="absolute inset-0" fill="none">
          {[state, gesture, event].map((r, i) => (
            <line key={i} x1={x0} x2={W} y1={r.base} y2={r.base} stroke={HAIR} strokeDasharray="2 4" />
          ))}
          {/* A state: up, held, down only when something changes it */}
          <path d={`M${x0} ${state.base} H170 C182 ${state.base} 182 ${state.top} 194 ${state.top} H520 C532 ${state.top} 532 ${state.base} 544 ${state.base} H${W}`} stroke={INK} strokeWidth={1.5} />
          {/* A gesture: one arc, over by itself */}
          <path d={`M${x0} ${gesture.base} H300 C312 ${gesture.base} 314 ${gesture.top} 326 ${gesture.top} H352 C364 ${gesture.top} 366 ${gesture.base} 378 ${gesture.base} H${W}`} stroke={INK} strokeWidth={1.5} />
          {/* An event: a bump on top of whatever is held, then back to it */}
          <path d={`M${x0} ${event.base} H170 C182 ${event.base} 182 ${event.top + 14} 194 ${event.top + 14} H${W}`} stroke={MUTED} strokeWidth={1.5} strokeDasharray="4 3" />
          <path d={`M300 ${event.top + 14} C312 ${event.top + 14} 314 ${event.top - 6} 326 ${event.top - 6} H400 C412 ${event.top - 6} 414 ${event.top + 14} 426 ${event.top + 14}`} stroke={BLUE} strokeWidth={1.5} />
          <line x1={x0} x2={W} y1={182} y2={182} stroke={HAIR} />
        </svg>
        {[
          ['State', 'held until it changes', state],
          ['Gesture', 'plays once', gesture],
          ['Event', 'a reaction, then back', event],
        ].map(([name, note, r]) => (
          <div key={name as string} className="absolute left-0" style={{ top: (r as typeof state).top - 2 }}>
            <p className={`${label} text-stone-700`}>{name as string}</p>
            <p className="text-[10px] text-stone-400">{note as string}</p>
          </div>
        ))}
        <At x={356} y={state.top - 1}><Face frame={frameOf('thinking', JADE)} size={34} /></At>
        <At x={339} y={gesture.top - 1}><Face frame={frameOf('wink', JADE, { after: 0.3 })} size={34} /></At>
        <At x={236} y={event.top + 13}><Face frame={frameOf('thinking', JADE)} size={34} /></At>
        <At x={363} y={event.top - 7}><Face frame={frameOf('happy', JADE)} size={34} /></At>
        <At x={520} y={event.top + 13}><Face frame={frameOf('thinking', JADE)} size={34} /></At>
        <span className={`${label} absolute text-stone-400`} style={{ right: 0, top: 172 }}>time →</span>
      </div>
    </div>
  );
}

/* ── 2. Attention ────────────────────────────────────────────────────────── */

const HALF_LIFE = 25;
const BANDS = [
  { name: 'attentive', from: 0.82 },
  { name: 'idle', from: 0.3 },
  { name: 'drowsy', from: 0.09 },
  { name: 'asleep', from: 0 },
];

function Attention() {
  const H = 320;
  const plot = { left: 8, right: 540, top: 34, bottom: 262 };
  const SPAN = 150; // seconds
  const x = (t: number) => plot.left + (t / SPAN) * (plot.right - plot.left);
  const y = (a: number) => plot.bottom - a * (plot.bottom - plot.top);
  // Something happens at 0 and again at 96 seconds; in between, attention halves every 25
  const events = [
    { at: 0, to: 0.9, name: 'someone types' },
    { at: 96, to: 1, name: 'the cursor rushes its face' },
  ];
  const level = (t: number) => {
    const last = [...events].reverse().find((event) => event.at <= t)!;
    return last.to * 2 ** (-(t - last.at) / HALF_LIFE);
  };
  const curve = (from: number, to: number) => {
    let d = '';
    for (let t = from; t <= to; t += 0.5) d += `${d ? 'L' : 'M'}${x(t).toFixed(1)} ${y(level(t)).toFixed(1)}`;
    return d;
  };
  const faces: [number, string][] = [
    [4, 'listening'],
    [30, 'idle'],
    [62, 'drowsy'],
    [90, 'sleeping'],
    [97, 'surprised'],
    [128, 'idle'],
  ];
  return (
    <div className="relative" style={{ width: W, height: H }}>
      <svg width={W} height={H} className="absolute inset-0" fill="none">
        {BANDS.map((band, i) => {
          const top = y(i === 0 ? 1 : BANDS[i - 1].from);
          return (
            <g key={band.name}>
              <rect x={plot.left} y={top} width={plot.right - plot.left} height={y(band.from) - top} fill={i % 2 ? 'rgb(31 29 25 / 0.035)' : 'none'} />
              {i > 0 && <line x1={plot.left} x2={plot.right + 8} y1={top} y2={top} stroke={HAIR} strokeDasharray="2 4" />}
            </g>
          );
        })}
        <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={INK} />
        {/* Waking is a straight line up */}
        <line x1={x(96)} x2={x(96)} y1={y(level(95.99))} y2={y(1)} stroke={BLUE} strokeWidth={1.5} />
        <path d={curve(0, 95.5)} stroke={INK} strokeWidth={1.5} />
        <path d={curve(96, SPAN)} stroke={INK} strokeWidth={1.5} />
        {events.map((event) => (
          <g key={event.at}>
            <circle cx={x(event.at)} cy={y(event.to)} r={3.5} fill={BLUE} />
            <line x1={x(event.at)} x2={x(event.at)} y1={y(event.to) - 8} y2={14} stroke={BLUE} strokeDasharray="2 3" />
          </g>
        ))}
        {/* One half-life, measured off */}
        <g stroke={MUTED}>
          <line x1={x(0)} x2={x(25)} y1={plot.bottom + 16} y2={plot.bottom + 16} />
          <line x1={x(0)} x2={x(0)} y1={plot.bottom + 11} y2={plot.bottom + 21} />
          <line x1={x(25)} x2={x(25)} y1={plot.bottom + 11} y2={plot.bottom + 21} />
          <line x1={x(25)} x2={x(25)} y1={y(0.45)} y2={plot.bottom} strokeDasharray="2 3" stroke={HAIR} />
        </g>
        {[0, 30, 60, 90, 120, 150].map((t) => (
          <line key={t} x1={x(t)} x2={x(t)} y1={plot.bottom} y2={plot.bottom + 4} stroke={INK} />
        ))}
      </svg>
      {BANDS.map((band, i) => (
        <span key={band.name} className={`${label} absolute text-stone-500`} style={{ left: plot.right + 14, top: (y(i === 0 ? 1 : BANDS[i - 1].from) + y(band.from)) / 2 - 7 }}>
          {band.name}
        </span>
      ))}
      {events.map((event) => (
        <span key={event.at} className={`${label} absolute whitespace-nowrap text-blue-600`} style={event.at ? { right: W - x(event.at) + 8, top: 4 } : { left: x(event.at) + 8, top: 4 }}>
          {event.name}
        </span>
      ))}
      <span className="absolute text-[10px] text-stone-500" style={{ left: x(0), top: plot.bottom + 24 }}>halves every 25 s</span>
      <span className="absolute text-[10px] text-blue-600" style={{ left: x(96) + 8, top: y(0.45) }}>waking is instant</span>
      <span className="absolute text-[10px] text-stone-500" style={{ left: x(40), top: y(0.52) }}>falling asleep is slow</span>
      <span className={`${label} absolute text-stone-400`} style={{ left: x(120) - 12, top: plot.bottom + 8 }}>2 min</span>
      {faces.map(([t, pose]) => (
        <At key={t} x={x(t) + (pose === 'surprised' ? 30 : 0)} y={y(level(t)) - (pose === 'surprised' ? 2 : 24)}>
          <Face frame={frameOf(pose, NOVA)} preset={NOVA} size={44} />
        </At>
      ))}
    </div>
  );
}

/* ── 3. The score ────────────────────────────────────────────────────────── */

const CLIP = 8.36;
// prettier-ignore
const PEAKS = [0,0,0,0,0.06,0.2,0.25,0.27,0.24,0.19,0.21,0.27,0.48,0.55,0.39,0.12,0.06,0.02,0.01,0.01,0.07,0.37,0.59,0.34,0.05,0.17,0.37,0.32,0.16,0.02,0.1,0.43,0.43,0.31,0.32,0.33,0.66,0.63,0.68,0.81,0.51,0.02,0.04,0.61,0.61,0.28,0.16,0.05,0.1,0.33,0.47,0.46,0.21,0.08,0.04,0.02,0.01,0,0,0,0,0,0,0,0,0,0,0,0.12,0.74,0.62,0.06,0.04,0.33,0.36,0.15,0.02,0.28,0.68,0.64,0.04,0.01,0.01,0.05,0.75,0.73,0.63,0.57,0.4,0.17,0.11,0.05,0.17,0.35,0.45,0.4,0.34,0.32,0.25,0.16,0.25,0.39,0.49,0.49,0.19,0.03,0.02,0.15,0.06,0.39,0.91,1,0.83,0.38,0.14,0.11,0.03,0.03,0.39,0.13,0.58,0.5,0.47,0.48,0.48,0.51,0.46,0.11,0.01,0.01,0.23,0.21,0.11,0.03,0.34,0.21,0.25,0.24,0.25,0.24,0.24,0.2,0.07,0.01,0.01,0.01,0,0,0,0.25,0.24,0.24,0.26,0.29,0.47,0.46,0.06,0.01,0.25,0.24,0.17,0.01,0.17,0.25,0.26,0.23,0.11,0,0,0,0,0,0,0,0,0.01,0.01,0.01,0.01,0,0,0,0.01,0.01,0.02,0.02,0.02,0.02,0.6,0.66,0.7,0.57,0.52,0.7,0.66,0.38,0.36,0.33,0.3,0.25,0.03,0.03,0.36,0.42,0.49,0.55,0.52,0.57,0.56,0.29,0.04,0.01,0.1,0.29,0.31,0.04,0.03,0.6,0.48,0.03,0.01,0.01,0.08,0.4,0.31,0.02,0.02,0.1,0.13,0.12,0.09,0.1,0.32,0.37,0.41,0.29,0.13,0,0.26,0.36,0.36,0.31,0.22,0.33,0.48,0.52,0.22,0.11,0.12,0.04,0.02,0.01,0,0,0,0,0,0,0,0];
// When each piece of the transcript arrived, in seconds into the clip
// prettier-ignore
const WORDS: [number, string][] = [[-0.07,'No,'],[0.09,'that'],[0.29,'is'],[0.5,'not'],[0.84,'okay.'],[1.5,'This'],[1.64,'is'],[1.84,'the'],[2.1,'third'],[2.22,'time'],[2.4,'it'],[2.63,'has'],[2.82,'crashed'],[3.08,'today,'],[3.41,'and'],[3.64,'I am'],[3.77,'fed'],[4.21,'up with'],[4.37,'it.'],[4.97,'Somebody'],[5.55,'needs'],[5.97,'to'],[6.23,'fix'],[6.35,'this right'],[6.79,'now.']];
// Each sentence: written (transcript) from–to, heard from–to, its reading back, and what was read
const SENTENCES = [
  { written: [-0.07, 0.84], heard: [0.15, 1.75], read: 1.2, mood: 'neutral 59%', reacts: 0 },
  { written: [1.5, 4.37], heard: [2.15, 5.4], read: 4.68, mood: 'frustrated 100%', reacts: 1.6 },
  { written: [4.97, 6.79], heard: [5.9, 8.0], read: 7.11, mood: 'frustrated 100%', reacts: 1.6 },
];

function Score() {
  const H = 348;
  const left = 82;
  const x = (t: number) => left + ((t + 0.1) / (CLIP + 0.1)) * (W - left - 4);
  const rows = { words: 20, band: [44, 84] as const, voice: 112, jev: 170, face: 232, span: 276, axis: 304 };
  const reacting = (t: number) => SENTENCES.some((s) => s.reacts && t >= s.read && t <= s.read + s.reacts);
  const strip = [0.55, 1.45, 2.5, 3.4, 4.25, 5.15, 5.95, 6.7, 7.75];
  return (
    <div style={{ width: W }} className="flex flex-col gap-5">
      <div className="flex items-center gap-5">
        <Face frame={frameOf('angry', PIP)} preset={PIP} size={132} />
        <div>
          <p className="text-important mx-0 w-auto text-pretty italic text-stone-800!">&ldquo;This is the third time it has crashed today, and I am fed up with it.&rdquo;</p>
          <p className="mt-2 text-sm text-stone-500">
            Read as <span className="font-medium text-red-600">frustrated, 100%</span>, 0.7 s before the sentence had finished being heard.
          </p>
        </div>
      </div>

      <div className="relative" style={{ width: W, height: H }}>
        <svg width={W} height={H} className="absolute inset-0" fill="none">
          {/* The same sentence twice: where it was written and where it was heard */}
          {SENTENCES.map((s, i) => (
            <path
              key={i}
              d={`M${x(s.written[0])} ${rows.band[0]} L${x(s.written[1])} ${rows.band[0]} L${x(s.heard[1])} ${rows.band[1]} L${x(s.heard[0])} ${rows.band[1]} Z`}
              fill={s.reacts ? 'rgb(239 68 68 / 0.08)' : 'rgb(31 29 25 / 0.045)'}
              stroke={s.reacts ? 'rgb(239 68 68 / 0.35)' : HAIR}
            />
          ))}
          {/* The voice */}
          {PEAKS.map((peak, i) => {
            const t = (i / PEAKS.length) * CLIP;
            const h = Math.max(1, peak * 24);
            return <line key={i} x1={x(t)} x2={x(t)} y1={rows.voice - h} y2={rows.voice + h} stroke={reacting(t) ? RED : INK} strokeWidth={1.4} strokeLinecap="round" opacity={reacting(t) ? 0.85 : 0.6} />;
          })}
          {/* Sentence complete → reading back → face */}
          {SENTENCES.map((s, i) => (
            <g key={i} stroke={s.reacts ? RED : MUTED}>
              <path d={`M${x(s.written[1])} ${rows.band[0]} V${rows.band[0] - 8}`} />
              <path d={`M${x(s.read)} ${rows.jev - 9} V${rows.band[0] - 14} H${x(s.written[1])} V${rows.band[0] - 8}`} strokeDasharray="2 3" />
              <circle cx={x(s.read)} cy={rows.jev} r={4} fill={s.reacts ? RED : 'white'} />
              <line x1={x(s.read)} x2={x(s.read)} y1={rows.jev + 6} y2={rows.span} strokeDasharray="2 3" />
              {s.reacts > 0 && <line x1={x(s.read)} x2={x(Math.min(CLIP, s.read + s.reacts))} y1={rows.span} y2={rows.span} strokeWidth={4} strokeLinecap="round" />}
              {/* Where the sentence stops being heard */}
              <line x1={x(s.heard[1])} x2={x(s.heard[1])} y1={rows.band[1]} y2={rows.voice + 30} stroke={INK} strokeDasharray="1 3" />
            </g>
          ))}
          <line x1={left} x2={W} y1={rows.axis} y2={rows.axis} stroke={INK} />
          {Array.from({ length: 9 }, (_, s) => (
            <line key={s} x1={x(s)} x2={x(s)} y1={rows.axis} y2={rows.axis + 4} stroke={INK} />
          ))}
        </svg>

        {WORDS.map(([at, word], i) => (
          <span key={i} className="absolute whitespace-nowrap text-[9.5px] leading-none text-stone-600" style={{ left: x(at), top: rows.words - 11 + (i % 3) * 11 }}>
            {word}
          </span>
        ))}
        {[
          ['Written', 'the transcript', rows.words - 2],
          ['Heard', 'the voice', rows.voice - 12],
          ['Read', 'Jev answers', rows.jev - 12],
          ['Face', 'what it does', rows.face - 12],
        ].map(([name, note, top]) => (
          <div key={name as string} className="absolute left-0" style={{ top: top as number }}>
            <p className={`${label} text-stone-700`}>{name as string}</p>
            <p className="text-[10px] text-stone-400">{note as string}</p>
          </div>
        ))}
        {SENTENCES.map((s, i) => (
          <span key={i} className={`absolute whitespace-nowrap rounded-full px-1.5 py-px text-[10px] font-medium ${s.reacts ? 'bg-red-50 text-red-600 shadow-[inset_0_0_0_1px_var(--color-red-200)]' : 'bg-stone-100 text-stone-500'}`} style={{ left: x(s.read) + 9, top: rows.jev - 8 }}>
            {s.mood}
          </span>
        ))}
        {strip.map((t) => (
          <At key={t} x={x(t)} y={rows.face}>
            <Face frame={frameOf(reacting(t) ? 'angry' : 'speaking', PIP, { voice: 0.5 })} preset={PIP} size={50} />
          </At>
        ))}
        {Array.from({ length: 9 }, (_, s) => (
          <span key={s} className="absolute font-mono text-[10px] text-stone-400" style={{ left: x(s) - 3, top: rows.axis + 8 }}>
            {s}s
          </span>
        ))}
        <span className="absolute text-[10px] text-stone-500" style={{ left: x(1.85), top: rows.band[0] + 13 }}>the words run about a second ahead of the voice</span>
      </div>
    </div>
  );
}

/* ── 4. The timing sheet ─────────────────────────────────────────────────── */

function Timing() {
  const H = 340;
  const left = 82;
  const FROM = -0.05;
  const TO = 0.6;
  const x = (t: number) => left + ((t - FROM) / (TO - FROM)) * (W - left - 8);
  const carried: EngineConfig = STILL;
  const plain: EngineConfig = { ...STILL, eyesLead: false, eyeAnticipation: false, blinkOnChange: false, eyeSettle: false, headArc: false };
  const run = (config: EngineConfig) => {
    const engine = createEngine('idle', JADE.eyeBuild);
    engine.setPose('surprised', 2, config);
    return (t: number) => engine.sample(2 + t, {}, config);
  };
  const on = run(carried);
  const off = run(plain);
  const times: number[] = [];
  for (let t = FROM; t <= TO; t += 0.004) times.push(t);
  // Eye height as a share of where it rests; the shell's rise in its own units
  const eyes = { mid: 150, per: 110 };
  const head = { base: 272, per: 4.4 };
  const path = (value: (t: number) => number) => times.map((t, i) => `${i ? 'L' : 'M'}${x(t).toFixed(1)} ${value(t).toFixed(1)}`).join('');
  const eyeY = (sample: typeof on) => (t: number) => eyes.mid - (sample(t).left.scaleY - 1) * eyes.per;
  const headY = (sample: typeof on) => (t: number) => head.base + sample(t).housing.y * head.per;
  const dip = times.reduce((best, t) => (on(t).left.scaleY < on(best).left.scaleY ? t : best));
  const peak = times.reduce((best, t) => (on(t).left.scaleY > on(best).left.scaleY ? t : best));
  const lifts = times.find((t) => t > 0 && Math.abs(on(t).housing.y) > 0.05) ?? 0.07;
  const strip = [-0.03, 0.05, 0.11, 0.17, 0.25, 0.35, 0.46, 0.57];
  return (
    <div className="relative" style={{ width: W, height: H }}>
      <svg width={W} height={H} className="absolute inset-0" fill="none">
        <line x1={x(0)} x2={x(0)} y1={8} y2={H - 26} stroke={BLUE} strokeDasharray="2 3" />
        <line x1={left} x2={W} y1={eyes.mid} y2={eyes.mid} stroke={HAIR} strokeDasharray="2 4" />
        <line x1={left} x2={W} y1={head.base} y2={head.base} stroke={HAIR} strokeDasharray="2 4" />
        {/* Without any of it: the change as a straight move */}
        <path d={path(eyeY(off))} stroke={MUTED} strokeDasharray="4 3" />
        <path d={path(headY(off))} stroke={MUTED} strokeDasharray="4 3" />
        <path d={path(eyeY(on))} stroke={INK} strokeWidth={1.6} />
        <path d={path(headY(on))} stroke={INK} strokeWidth={1.6} />
        {/* What each part of the curve is */}
        <circle cx={x(dip)} cy={eyeY(on)(dip)} r={3.5} fill={BLUE} />
        <circle cx={x(peak)} cy={eyeY(on)(peak)} r={3.5} fill={BLUE} />
        <circle cx={x(lifts)} cy={headY(on)(lifts)} r={3.5} fill={BLUE} />
        <g stroke={MUTED}>
          <line x1={x(0)} x2={x(lifts)} y1={head.base + 14} y2={head.base + 14} />
          <line x1={x(0)} x2={x(0)} y1={head.base + 9} y2={head.base + 19} />
          <line x1={x(lifts)} x2={x(lifts)} y1={head.base + 9} y2={head.base + 19} />
        </g>
        <line x1={left} x2={W} y1={H - 24} y2={H - 24} stroke={INK} />
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((t) => (
          <line key={t} x1={x(t)} x2={x(t)} y1={H - 24} y2={H - 20} stroke={INK} />
        ))}
      </svg>
      {strip.map((t) => (
        <At key={t} x={x(t)} y={52}>
          <Face frame={on(t)} size={46} />
        </At>
      ))}
      {[
        ['Eyes', 'how tall they are', eyes.mid - 12],
        ['Shell', 'how far it has risen', head.base - 30],
      ].map(([name, note, top]) => (
        <div key={name as string} className="absolute left-0" style={{ top: top as number }}>
          <p className={`${label} text-stone-700`}>{name as string}</p>
          <p className="text-[10px] text-stone-400">{note as string}</p>
        </div>
      ))}
      <span className={`${label} absolute text-blue-600`} style={{ left: x(0) + 5, top: 96 }}>the change</span>
      <span className="absolute text-[10px] text-blue-600" style={{ left: x(dip) - 20, top: eyeY(on)(dip) + 10 }}>anticipation: a squint first</span>
      <span className="absolute text-[10px] text-blue-600" style={{ left: x(peak) + 4, top: eyeY(on)(peak) - 18 }}>settle: a little past, then back</span>
      <span className="absolute text-[10px] text-blue-600" style={{ left: x(lifts) + 10, top: headY(on)(lifts) - 26 }}>the shell follows the eyes</span>
      <span className="absolute text-[10px] text-stone-500" style={{ left: x(lifts) + 8, top: head.base + 8 }}>{Math.round(lifts * 1000)} ms behind</span>
      <span className="absolute text-[10px] text-stone-400" style={{ right: 0, top: eyes.mid + 12 }}>dashed: with all of it switched off</span>
      {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((t) => (
        <span key={t} className="absolute whitespace-nowrap font-mono text-[10px] text-stone-400" style={{ left: x(t) - (t > 0.55 ? 34 : 8), top: H - 16 }}>
          {Math.round(t * 1000)} ms
        </span>
      ))}
    </div>
  );
}

const subscribe = () => () => {};

export default function Sketches() {
  // Drawn in the browser only: the engine's numbers differ in their last digit on the server
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return (
    <main className="mx-auto flex w-full max-w-(--column) flex-col gap-14 px-4 py-16 md:px-0">
      <header className="flex flex-col gap-2">
        <h1 className="text-header mx-0 w-auto text-gradient-primary">Cameo figures: still sketches</h1>
        <p className="text-body mx-0">Four layouts to judge the direction. Nothing moves or responds yet; each note says what would.</p>
      </header>
      {mounted && (
        <>
          <section id="disc" className="flex flex-col gap-3">
            <h2 className="text-header-2 mx-0 w-auto">The program disc</h2>
            <DiscFigure />
          </section>
          <section id="tank" className="flex flex-col gap-3">
            <h2 className="text-header-2 mx-0 w-auto">The header tank</h2>
            <TankFigure />
          </section>
          <section id="controls" className="flex flex-col gap-3">
            <h2 className="text-header-2 mx-0 w-auto">The control box</h2>
            <ControlsFigure />
          </section>
          <section id="tape" className="flex flex-col gap-3">
            <h2 className="text-header-2 mx-0 w-auto">The tape deck</h2>
            <TapeFigure />
          </section>
          <Sheet n={1} title="A vocabulary for presence" idea="Every face on one sheet, and the three ways to direct it drawn as shapes over time. Live: pick any face and a playhead runs along its track.">
            <Vocabulary />
          </Sheet>
          <Sheet n={2} title="What it notices" idea="Attention as a curve: slow down, straight up. Live: the curve draws itself in real time, and typing, copying or rushing the face lifts it where you are.">
            <Attention />
          </Sheet>
          <Sheet n={3} title="It reacts to what is being said" idea="A score of one real recording. Live: the audio plays, a playhead sweeps, and the large face is the one at the playhead.">
            <Score />
          </Sheet>
          <Sheet n={4} title="How it moves" idea="One change of expression as an animator's timing sheet, with the engine's own curves. Live: drag across to scrub, and switch each part off to watch its curve flatten.">
            <Timing />
          </Sheet>
        </>
      )}
    </main>
  );
}
