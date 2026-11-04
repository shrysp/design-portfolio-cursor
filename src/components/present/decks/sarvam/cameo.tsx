'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { PIP, customSilhouette, definePreset } from '@shrysp/cameo';
import ControlsFigure from '@/components/figures/controls/ControlsFigure';
import type { Action } from '@/components/figures/controls/model';
import TankFigure from '@/components/figures/tank/TankFigure';
import { IconMicrophone } from 'nucleo-micro-bold-essential';
import TapeFigure from '@/components/figures/tape/TapeFigure';
import DiscFigure from '@/components/figures/disc/DiscFigure';
import { ScreenSize, type DeckBranch, type DeckSlide } from '../../Deck';
import { Eyebrow, Img, Label, Notes, Pin, Slide, Spacer, Text, Title, useTheme } from '../../primitives';
import { ASSETS, GATEWAY } from './theme';
import { Character, FAMILY } from './cameo-live';

/*
 * Cameo as beats: five in order (hook, why, vocabulary, attention, voice), the tour to close, and
 * three branches opened from the voice or tour beat only if someone asks (craft, family and code,
 * what I'd change). Each beat makes one claim with one live piece, carries one line of notes,
 * and has a fallback on V wherever something is live.
 *
 * The live pieces are the case study's own figures, so the deck and the page never drift apart.
 */

const CAMEO = `${ASSETS}/cameo`;

/* ———————————————————————— Shared pieces ———————————————————————— */

/** What a decision replaced: a real first attempt, or, where there was none, the way most products do it */
type Before = { tried: string } | { obvious: string };

/**
 * The first half of a beat, with nothing live on it. The title is the tension, the question the
 * room should be holding; the line under it is the decision. Under a rule: what it replaced, and,
 * for voice, the measured numbers. Everything else is spoken.
 */
function Decision({ eyebrow, tension, decision, before, stats }: { eyebrow: string; tension: ReactNode; decision: ReactNode; before: Before; stats?: [string, string][] }) {
  const t = useTheme();
  return (
    <Slide gap={36}>
      <Eyebrow>01 — Cameo · {eyebrow}</Eyebrow>
      <Title size={72} width={1500} style={{ lineHeight: 1.08 }}>
        {tension}
      </Title>
      <div style={{ display: 'flex', gap: 28, width: 1400 }}>
        <span
          style={{
            width: 4,
            flexShrink: 0,
            borderRadius: 2,
            background: t.accent,
          }}
        />
        <Text size={34} color={t.ink}>
          {decision}
        </Text>
      </div>
      <Spacer />
      {stats && (
        <div style={{ display: 'flex', gap: 48, marginBottom: 12 }}>
          {stats.map(([value, label]) => (
            <div
              key={label}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: t.serif,
                  fontWeight: 580,
                  fontSize: 72,
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  color: t.accent,
                }}
              >
                {value}
              </span>
              <span style={{ fontSize: 22, color: t.ink2 }}>{label}</span>
            </div>
          ))}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 40,
          padding: '28px 0',
          borderTop: `1px solid ${t.ink}`,
          borderBottom: `1px solid ${t.line}`,
        }}
      >
        <span style={{ width: 280, flexShrink: 0 }}>
          <Label color={'tried' in before ? t.mark : undefined}>{'tried' in before ? 'What I tried first' : 'The obvious way'}</Label>
        </span>
        <Text size={28} style={{ flex: 1 }}>
          {'tried' in before ? before.tried : before.obvious}
        </Text>
      </div>
    </Slide>
  );
}

/** The second half of a beat: the live figure as large as it fits, under one line saying what to do */
function Demo({ eyebrow, prompt, aside, children }: { eyebrow: string; prompt: ReactNode; aside?: ReactNode; children: ReactNode }) {
  const t = useTheme();
  return (
    <Slide gap={20} padding="96px 128px 120px">
      <Eyebrow>
        01 — Cameo · {eyebrow} · <span style={{ color: t.accent }}>Try it</span>
      </Eyebrow>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 32,
        }}
      >
        <Title size={44}>{prompt}</Title>
        {aside && <div data-live>{aside}</div>}
      </div>
      {/* data-live: clicks inside the figure are for the figure, not for paging */}
      <div data-live style={{ flex: 1, minHeight: 0, marginTop: 8 }}>
        {children}
      </div>
    </Slide>
  );
}

/**
 * The case study's figures are drawn for a page about 720 wide. Here each is laid out at that
 * width and scaled to fill the space it has, so its text stays legible from the back of a room.
 * The case study's caption under it is left off: on a beat, the claim beside it says it.
 */
function Figure({ children, natural = 720 }: { children: ReactNode; natural?: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const measure = () => {
      const box = outer.current;
      const drawn = inner.current;
      if (!box || !drawn || !drawn.offsetHeight) return;
      setScale(Math.min(box.offsetWidth / natural, box.offsetHeight / drawn.offsetHeight));
    };
    const observer = new ResizeObserver(measure);
    if (outer.current) observer.observe(outer.current);
    if (inner.current) observer.observe(inner.current);
    measure();
    return () => observer.disconnect();
  }, [natural]);
  return (
    <div ref={outer} className="deck-figure" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <style>{'.deck-figure figcaption { display: none; } .deck-figure figure { margin: 0; }'}</style>
      <div
        ref={inner}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: natural,
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity: scale ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** The fallback for a live beat: a still of the same beat, taken from the deck itself */
function Still({ src, alt }: { src: string; alt: string }) {
  return (
    <Slide footer={false} padding="0">
      <Img
        src={src}
        alt={alt}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </Slide>
  );
}

/** An image that may not have been added yet: until it is, a labelled box says which file goes there */
function Pending({ src, label, style, fit = 'cover', ground = '#F3F3F3' }: { src: string; label: string; style?: CSSProperties; fit?: 'cover' | 'contain'; ground?: string }) {
  const t = useTheme();
  const [missing, setMissing] = useState(false);
  if (missing)
    return (
      <div
        style={{
          ...style,
          borderRadius: 24,
          border: '2px dashed #CCCCCC',
          background: '#F5F5F5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <Label>Image to add</Label>
        <span style={{ fontFamily: t.mono, fontSize: 18, color: t.ink3 }}>public{src}</span>
      </div>
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      draggable={false}
      onError={() => setMissing(true)}
      style={{
        ...style,
        objectFit: fit,
        borderRadius: 24,
        display: 'block',
        background: fit === 'contain' ? ground : undefined,
        boxShadow: ground === '#FFFFFF' ? 'inset 0 0 0 1px #E6E6E6' : undefined,
      }}
    />
  );
}

/** Runs `then` when a single letter key is pressed on this beat, unless someone is typing */
function useKey(letter: string, then: () => void) {
  const latest = useRef(then);
  useEffect(() => {
    latest.current = then;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as Element | null)?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key.toLowerCase() === letter) latest.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [letter]);
}

/* ———————————————————————— C1 · Hook ———————————————————————— */

function Hook() {
  const t = useTheme();
  return (
    <Slide footer={false} background="#F5F5F5" padding="0">
      <div
        data-live
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Character preset={PIP} size={620} />
      </div>
      <span
        style={{
          position: 'absolute',
          left: 128,
          bottom: 64,
          fontFamily: t.mono,
          fontSize: 18,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#999999',
        }}
      >
        Cameo
      </span>
    </Slide>
  );
}

function HookStill() {
  return (
    <Slide footer={false} background="#F5F5F5" padding="0">
      <Img
        src={`${ASSETS}/face-pip.png`}
        alt="PIP, the default Cameo character"
        style={{
          position: 'absolute',
          left: 560,
          top: 240,
          width: 800,
          height: 600,
        }}
      />
    </Slide>
  );
}

/* ———————————————————————— The thesis ———————————————————————— */

function Thesis() {
  const t = useTheme();
  return (
    <Slide gap={40}>
      <Eyebrow>01 — Cameo · Why</Eyebrow>
      <Spacer />
      <Title size={96} width={1560} style={{ lineHeight: 1.04 }}>
        Agents will walk us through their work out loud, not hand us a wall of text.
      </Title>
      <Text size={34} width={1300}>
        The way a good teammate shows a manager what they built: what they did, why, and how they decided.
      </Text>
      <div style={{ borderTop: `1px solid ${t.line}`, paddingTop: 28 }}>
        <Text size={24} width={1300}>
          Voice becomes as important as the text box. Even when you can&apos;t talk back, the agent can talk to you.
        </Text>
      </div>
    </Slide>
  );
}

/* ———————————————————————— Where it started ———————————————————————— */

const ORIGINS = [
  {
    src: `${CAMEO}/why-1-figma-sketch.webp`,
    label: 'The face, designed in Figma',
    fit: 'contain' as const,
    ground: '#F7F7F7',
  },
  {
    src: `${CAMEO}/why-2-grok-post.png`,
    label: "Benji Taylor's character for Grok: the push to build it",
    fit: 'contain' as const,
    ground: '#000000',
  },
  {
    src: `${CAMEO}/why-3-first-code.webp`,
    label: 'The first version in code',
    fit: 'contain' as const,
    ground: '#FFFFFF',
  },
];

// What "expressive" looked like before any of this was drawn: a few robots that say everything with their eyes
const REFERENCES = [
  { src: `${CAMEO}/ref-1.png`, label: 'EVE, shy' },
  { src: `${CAMEO}/ref-2.png`, label: 'EVE, determined' },
  { src: `${CAMEO}/ref-3.png`, label: 'EVE, curious' },
  { src: `${CAMEO}/ref-4.png`, label: 'M-O, annoyed' },
];

function Reference() {
  const t = useTheme();
  return (
    <Slide gap={36}>
      <Eyebrow>01 — Cameo · The reference</Eyebrow>
      <Title size={72} width={1500}>
        How can an agent be expressive, with only a screen to work with?
      </Title>
      <Text size={28} width={1300}>
        The best answer I found was in WALL-E: its robots carry a whole personality in a pair of eyes.
      </Text>
      <Spacer />
      <div style={{ display: 'flex', gap: 24 }}>
        {REFERENCES.map(({ src, label }) => (
          <figure
            key={src}
            style={{
              margin: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <Pending src={src} label={label} style={{ width: '100%', height: 340 }} />
            <figcaption style={{ fontSize: 22, color: t.ink2 }}>{label}</figcaption>
          </figure>
        ))}
      </div>
    </Slide>
  );
}

function Origin() {
  const t = useTheme();
  return (
    <Slide gap={36}>
      <Eyebrow>01 — Cameo · Where it started</Eyebrow>
      <Title size={72} width={1500}>
        From a design to code
      </Title>
      <Spacer />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
        {ORIGINS.map(({ src, label, fit, ground }, i) => (
          <div key={src} style={{ display: 'contents' }}>
            {i > 0 && (
              <span
                style={{
                  alignSelf: 'center',
                  marginTop: -48,
                  fontFamily: t.serif,
                  fontSize: 56,
                  color: t.mark,
                }}
              >
                →
              </span>
            )}
            <figure
              style={{
                margin: 0,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <Pending src={src} label={label} fit={fit} ground={ground} style={{ width: '100%', height: 420 }} />
              <figcaption style={{ fontSize: 24, color: t.ink2 }}>{label}</figcaption>
            </figure>
          </div>
        ))}
      </div>
    </Slide>
  );
}

/* ———————————————————————— How it came together ———————————————————————— */

const STOPS: [string, string, string][] = [
  ['The start', 'The goal', 'A voice agent that presents like a good teammate: expressive, not monotone.'],
  ['6 Sep', 'Into code', 'The first engine. Springs replaced plain easing: nothing had weight.'],
  ['12 Sep', 'A voice', 'gpt-live-1 connected; the face follows the real sound of the voice.'],
  ['16 Sep', 'The agent, done', "Jev reading each sentence's mood, the full range of expressions: the agent itself was finished."],
  ['30 Sep', 'Released', 'Two weeks making it customizable and working out how to ship it, then released as a package.'],
];

function Timeline() {
  const t = useTheme();
  return (
    <Slide gap={40}>
      <Eyebrow>01 — Cameo · How it came together</Eyebrow>
      <Title size={72}>From a question to a package</Title>
      <Spacer />
      <div style={{ position: 'relative', display: 'flex', gap: 40 }}>
        <span
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 60,
            height: 2,
            background: t.ink,
          }}
        />
        {STOPS.map(([date, head, body], i) => (
          <div
            key={head}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <span
              style={{
                height: 30,
                fontFamily: t.mono,
                fontSize: 20,
                color: t.ink3,
                letterSpacing: '0.04em',
              }}
            >
              {date}
            </span>
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                marginTop: 7,
                background: i === STOPS.length - 1 ? t.mark : t.accent,
                position: 'relative',
              }}
            />
            <span
              style={{
                fontFamily: t.serif,
                fontWeight: 580,
                fontSize: 36,
                letterSpacing: '-0.02em',
                marginTop: 12,
              }}
            >
              {head}
            </span>
            <Text size={24}>{body}</Text>
          </div>
        ))}
      </div>
    </Slide>
  );
}

/* ———————————————————————— C3 · Vocabulary ———————————————————————— */

function ExpressionDecision() {
  return (
    <Decision
      eyebrow="Expression"
      tension="Why does an agent reading its answer aloud still feel flat?"
      decision="Give it a face with a range of expressions, timed to what it says, the way a person presents."
      before={{
        tried: 'Three bouncing dots for thinking, rejected as lazy. Thinking became eyes that weigh one side against the other.',
      }}
    />
  );
}

// How loud the microphone must be, as a root-mean-square of its samples, to count as someone speaking
const SPEECH = 0.035;

/**
 * Listens to the microphone, once asked, and calls `onSpeech` many times a second while someone is
 * speaking. Only loudness is measured: nothing is recorded or sent. Stops when the slide is left.
 */
function useMic(onSpeech: () => void) {
  const [on, setOn] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const latest = useRef(onSpeech);
  useEffect(() => {
    latest.current = onSpeech;
  });

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    setOn(false);
    setSpeaking(false);
  };

  const start = async () => {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      setError('The microphone is blocked for this page.');
      return;
    }
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const samples = new Float32Array(analyser.fftSize);
    let frame = 0;
    let quietSince = 0;
    const listen = () => {
      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (const v of samples) sum += v * v;
      const loud = Math.sqrt(sum / samples.length) > SPEECH;
      const now = performance.now();
      if (loud) {
        quietSince = now;
        latest.current();
      }
      // A short pause between words is still speaking
      setSpeaking(now - quietSince < 400);
      frame = requestAnimationFrame(listen);
    };
    frame = requestAnimationFrame(listen);
    stopRef.current = () => {
      cancelAnimationFrame(frame);
      stream.getTracks().forEach((track) => track.stop());
      void ctx.close();
    };
    setOn(true);
  };

  useEffect(() => () => stopRef.current?.(), []);
  return { on, speaking, error, toggle: () => (on ? stop() : void start()) };
}

// Where listening and idle sit among the figure's states
const LISTENING = 1;
const IDLE = 0;

function Vocabulary() {
  const drive = useRef<((action: Action) => void) | null>(null);
  const mic = useMic(() => {});
  useKey('m', mic.toggle);
  // Speaking holds the face in listening; a pause hands it back to idle
  const heard = useRef(false);
  useEffect(() => {
    if (mic.speaking === heard.current) return;
    heard.current = mic.speaking;
    drive.current?.({ kind: 'state', index: mic.speaking ? LISTENING : IDLE });
  }, [mic.speaking]);
  return (
    <Demo
      eyebrow="Expression"
      prompt="Hold a state, play a gesture, send an event. Or just talk."
      aside={
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {mic.error && <span style={{ fontSize: 20, color: '#A5460F' }}>{mic.error}</span>}
          <ScreenSize>
            <button type="button" onClick={mic.toggle} className={mic.on ? 'aqua aqua-blue h-8 pl-2 pr-3 gap-1.5 text-sm font-medium' : 'aqua h-8 pl-2 pr-3 gap-1.5 text-sm font-medium'}>
              <IconMicrophone size={16} />
              {mic.on ? (mic.speaking ? 'Listening…' : 'Mic on') : 'Talk to it'}
              <span style={{ width: 7, height: 7, borderRadius: 4, background: mic.speaking ? '#22C55E' : 'rgba(0,0,0,0.18)', transition: 'background 120ms' }} />
            </button>
          </ScreenSize>
        </div>
      }
    >
      <Figure>
        <ControlsFigure drive={drive} />
      </Figure>
    </Demo>
  );
}

/* ———————————————————————— C4 · Attention ———————————————————————— */

function AttentionDecision() {
  return (
    <Decision
      eyebrow="Attention"
      tension="An agent can't afford to listen all the time. The face shows when it has stopped."
      decision="One number, attention, drains when nothing happens. In the tour, the face dozes as the paid session closes, and a voice wakes it."
      before={{
        tried: 'Idle dropped straight to sleep: a cliff. Now it passes through drowsy, with a yawn, so you see it coming.',
      }}
    />
  );
}

function Attention() {
  return (
    <Demo eyebrow="Attention" prompt="Click the events, then leave it alone.">
      {/* Empty and left alone, so the room fills it */}
      <Figure>
        <TankFigure start={0} tour={false} />
      </Figure>
    </Demo>
  );
}

/* ———————————————————————— C5 · Voice ———————————————————————— */

function VoiceDecision() {
  return (
    <Decision
      eyebrow="Voice"
      tension="How does the face know the mood before the sentence ends?"
      decision="gpt-live-1 streams the words ahead of the sound, and Jev, a small, fast classifier, reads the mood of each sentence."
      stats={[
        ['~1.0 s', 'the words arrive ahead of the sound'],
        ['~0.34 s', 'for Jev to read the mood'],
        ['0.69 s', 'median: the face changes before the sentence ends'],
      ]}
      before={{
        tried: "Mood guessed from the transcript's sentiment, a weak signal; and a fixed sine wave for speaking, before the real audio drove it.",
      }}
    />
  );
}

function Voice() {
  const box = useRef<HTMLDivElement>(null);
  // S turns the tape's sound on or off, the same as its speaker button: the only way sound starts here
  useKey('s', () => box.current?.querySelector<HTMLButtonElement>('button[aria-label="Play with sound"], button[aria-label="Turn the sound off"]')?.click());
  return (
    <Demo eyebrow="Voice" prompt="Watch the face change before the sentence ends.">
      <div ref={box} style={{ height: '100%' }}>
        <Figure>
          <TapeFigure />
        </Figure>
      </div>
    </Demo>
  );
}

/* ———————————————————————— C8 · In use ———————————————————————— */

const TOUR_VIDEO = '/videos/Portfolio-Tour-Demo.mp4';
const TOUR_POSTER = '/videos/posters/Portfolio-Tour-Demo.jpg';
// The recording's own shape, so neither the still nor the live tour is stretched or cropped
const TOUR_RATIO = '1712 / 1080';

function InUse() {
  const t = useTheme();
  // The tour is loaded only when asked for (L, or the button): it can speak and ask for the microphone
  const [live, setLive] = useState(false);
  useKey('l', () => setLive(true));
  return (
    <Slide gap={28}>
      <Eyebrow>01 — Cameo · In use</Eyebrow>
      <Title size={52}>The first proof: PIP tells visitors about me, out loud.</Title>
      {/* The tour at the shape it was recorded in, 1712 × 1080, as large as the slide allows */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          data-live
          style={{
            height: '100%',
            aspectRatio: TOUR_RATIO,
            maxWidth: '100%',
            position: 'relative',
            borderRadius: 24,
            overflow: 'hidden',
            background: '#0F1013',
          }}
        >
          {live ? (
            <iframe
              src="/projects/cameo/tour"
              title="PIP's tour, live"
              allow="microphone; autoplay"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
            />
          ) : (
            <>
              <Img
                src={`${ASSETS}/tour-stage.jpg`}
                alt="PIP's tour: a photo at the centre of the stage, PIP below it"
                fit="contain"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0.55,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={() => setLive(true)}
                  style={{
                    padding: '18px 32px',
                    borderRadius: 999,
                    border: 0,
                    cursor: 'pointer',
                    background: '#FAF8F5',
                    color: '#1F1F1F',
                    fontFamily: t.sans,
                    fontSize: 26,
                    fontWeight: 600,
                  }}
                >
                  Open the live tour{' '}
                  <span
                    style={{
                      fontFamily: t.mono,
                      fontSize: 18,
                      color: t.ink3,
                      marginLeft: 8,
                    }}
                  >
                    L
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Slide>
  );
}

function InUseVideo() {
  // V is the keypress that asks for it, so it may play with sound
  return (
    <Slide footer={false} padding="0" background="#0F1013">
      <video
        src={TOUR_VIDEO}
        poster={TOUR_POSTER}
        autoPlay
        controls
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </Slide>
  );
}

/* ———————————————————————— The payoff ———————————————————————— */

function Payoff() {
  return (
    <Slide row gap={72}>
      <div
        style={{
          width: 620,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 36,
        }}
      >
        <Eyebrow>01 — Cameo · The tour</Eyebrow>
        <Title size={64}>Every decision shows up in one conversation</Title>
        <Spacer />
        <Notes
          size={24}
          items={[
            ['Talk or type.', 'Typing raises its attention, and it holds thinking while the answer is written: attention, then a state.'],
            ['It answers out loud.', 'The face follows the words ahead of the sound, with the mood of each sentence.'],
            ['Moments come forward.', 'The same mood reading picks which real photo moves to the centre.'],
            ['Point to ask.', 'Its eyes follow the cursor to a photo, and it tells the story behind it.'],
          ]}
        />
        <Text size={26} color="#1F1F1F">
          Next: the same face on agents that walk you through what they built for you.
        </Text>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <div style={{ position: 'relative' }}>
          <Img src={`${ASSETS}/tour-start.jpg`} alt="The tour's start screen: start talking or type instead" fit="cover" style={{ width: 972, height: 380, borderRadius: 24 }} />
          <Pin n={1} x={320} y={72} />
        </div>
        <div style={{ position: 'relative' }}>
          <Img src={`${ASSETS}/tour-photo.jpg`} alt="The tour stage with a photo at the centre and PIP below it" fit="cover" style={{ width: 972, height: 380, borderRadius: 24 }} />
          <Pin n={2} x={532} y={314} />
          <Pin n={3} x={572} y={10} />
          <Pin n={4} x={268} y={142} />
        </div>
      </div>
    </Slide>
  );
}

/* ———————————————————————— B1 · Craft ———————————————————————— */

function CraftDecision() {
  return (
    <Decision
      eyebrow="Craft"
      tension="Why does animated expression usually feel mechanical?"
      decision="Five details from Disney's twelve principles carry every change: anticipation, eyes leading, a blink, a settle and a curved head path."
      before={{
        tried: 'Plain easing between expressions. Nothing had weight, so springs replaced it; the first anticipation kick vanished in 3 ms.',
      }}
    />
  );
}

function Craft() {
  return (
    <Demo eyebrow="Craft" prompt="Turn a detail off, then play the change again.">
      <Figure>
        <DiscFigure />
      </Figure>
    </Demo>
  );
}

/* ———————————————————————— B2 · Family and code ———————————————————————— */

// Sarvam's gateway outline, the one this deck is drawn around, made into a head
// The outline reader takes lines and curves but not arcs, so the two round caps are redrawn as curves
const GATEWAY_CURVES = GATEWAY.replace('A40 40 0 0 1 340 40', 'C260 18 278 0 300 0 C322 0 340 18 340 40').replace('A40 40 0 0 1 260 660', 'C340 682 322 700 300 700 C278 700 260 682 260 660');
const GATEWAY_HEAD = definePreset({ silhouette: customSilhouette(GATEWAY_CURVES), palette: 'violet' }, PIP);

const k = (v: string) => <span style={{ color: '#F9BB9E' }}>{v}</span>;
const s = (v: string) => <span style={{ color: '#A7C0F1' }}>{v}</span>;
const dim = (v: string) => <span style={{ color: '#7C82A8' }}>{v}</span>;

function Family() {
  const t = useTheme();
  const name = (label: string) => <Label style={{ textAlign: 'center' }}>{label}</Label>;
  return (
    <Slide gap={32}>
      <Eyebrow>01 — Cameo · Family and code</Eyebrow>
      <Title size={56}>Four characters, and room for yours.</Title>
      <Text size={26}>The product says what&apos;s happening; the face decides how to show it.</Text>
      <div
        data-live
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        {Object.values(FAMILY).map((preset) => (
          <div
            key={preset.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Character preset={preset} size={230} />
            {name(preset.label)}
          </div>
        ))}
        <span
          style={{
            width: 1,
            alignSelf: 'stretch',
            background: t.line,
            margin: '24px 8px',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Character preset={GATEWAY_HEAD} size={230} />
          {name('A logo as a head')}
        </div>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '28px 36px',
          borderRadius: 24,
          background: '#1E2033',
          color: '#FAF8F5',
          fontFamily: t.mono,
          fontSize: 24,
          lineHeight: 1.6,
        }}
      >
        {dim('$ ')}npm install @shrysp/cameo{'\n'}&lt;{k('Character')} preset=
        {'{PIP}'} state={s('"thinking"')} /&gt;{'  '}
        {dim("// state: 'idle' | 'listening' | 'thinking' | 'speaking' | …")}
      </pre>
    </Slide>
  );
}

function FamilyStill() {
  return (
    <Slide gap={32}>
      <Eyebrow>01 — Cameo · Family and code</Eyebrow>
      <Title size={56}>Four characters, and room for yours.</Title>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {['jade', 'nova', 'pip', 'tide'].map((id) => (
          <Img key={id} src={`${ASSETS}/face-${id}.png`} alt={id} style={{ width: 360, height: 280 }} />
        ))}
      </div>
    </Slide>
  );
}

/* ———————————————————————— B3 · What I'd change ———————————————————————— */

const CHANGES = [
  ['Red-on-red errors', 'An error turns the face red, so a red character shows one less clearly. For now the palette simply leaves red out.'],
  ['Short sentences react late', 'The face changes early on 20 of 21 sentences. The one miss was a very short line, over before its mood came back.'],
];

function Change() {
  const t = useTheme();
  return (
    <Slide gap={40}>
      <Eyebrow>01 — Cameo · What I&apos;d change</Eyebrow>
      <Title size={72}>What I&apos;d change</Title>
      <Spacer />
      <div>
        {CHANGES.map(([head, body], i) => (
          <div
            key={head}
            style={{
              display: 'flex',
              gap: 40,
              padding: '32px 0',
              borderTop: `1px solid ${i === 0 ? t.ink : t.line}`,
              borderBottom: i === CHANGES.length - 1 ? `1px solid ${t.line}` : undefined,
            }}
          >
            <span
              style={{
                width: 520,
                flexShrink: 0,
                fontFamily: t.serif,
                fontWeight: 580,
                fontSize: 44,
                letterSpacing: '-0.02em',
              }}
            >
              {head}
            </span>
            <Text size={28} style={{ flex: 1 }}>
              {body}
            </Text>
          </div>
        ))}
      </div>
    </Slide>
  );
}

/* ———————————————————————— The beats ———————————————————————— */

const MORE = ['craft-why', 'craft', 'family', 'change'];
function still(name: string, alt: string) {
  const StillOf = () => <Still src={`${CAMEO}/fallback-${name}.png`} alt={alt} />;
  return StillOf;
}

/**
 * The Cameo beats in order: the hook, the thesis, where it started and how it came together; then a
 * decision and its demo for expression, attention and voice; then the tour and what it proves.
 * Decision slides carry a spoken script; the demos keep the brief's notes word for word.
 */
export const CAMEO_SLIDES: DeckSlide[] = [
  {
    section: 'Cameo',
    render: () => <Hook />,
    fallback: () => <HookStill />,
    notes: 'This is Cameo. Watch it for a second.',
  },
  {
    section: 'Cameo',
    render: () => <Thesis />,
    notes:
      "Agents already do our work in the tools we use, then explain it in a wall of text. Think of it as manager and IC: you hand over a goal, they use their judgment, then they walk you through what they built and why. As text that's a long article; told, it's a walkthrough. So I think voice becomes as important as the text box — even in public, when you can't talk back, the agent can talk to you. And what makes a good IC's walkthrough work is delivery: nobody wants a monotone presentation.",
  },
  {
    section: 'Cameo',
    render: () => <Reference />,
    notes:
      'An agent lives in a window: no body, no hands, maybe a small corner of the screen. So the question was how it can be expressive with only that. The best answer I found was in WALL-E — EVE and M-O carry a whole personality in a pair of eyes: shy, determined, curious, annoyed, with nothing but the eyes changing. That was the visual reference.',
  },
  {
    section: 'Cameo',
    render: () => <Origin />,
    notes: "The face sat in Figma for a while. Benji Taylor's character for Grok, made entirely in code, was the push to build it — and this is the first version that ran.",
  },
  {
    section: 'Cameo',
    render: () => <Timeline />,
    notes:
      "About ten days from first code to a finished agent. The engine first, where springs replaced plain easing because nothing had weight. Then a real voice, and by the 16th Jev was reading each sentence's mood and every expression was in. The two weeks after that went into making it customizable — any outline as a head, your own palette — and working out the best way to serve it as a package. It was released on the 30th.",
  },
  {
    section: 'Cameo',
    render: () => <ExpressionDecision />,
    notes:
      "When a person presents, their face carries half of it: thinking, listening, reacting. An agent that only reads its answer aloud is the monotone presenter. So the face needs a range of expressions, timed to what's happening. Even thinking: the obvious thing was three bouncing dots, which I threw out as lazy. Thinking became eyes that weigh one option against the other, so it reads as still working however long it takes.",
  },
  {
    section: 'Cameo',
    render: () => <Vocabulary />,
    fallback: still('controls', 'The vocabulary figure: states, gestures and events driving the face, recorded on a paper strip'),
    notes:
      'States persist (thinking, speaking). Gestures play once (nod, wink). Events are brief reactions (success, error) then it returns to its state. Emotions are reactions, not states — a face that stays delighted means nothing. Hand them the keys here. Then press M and talk: the face holds listening while you speak, and goes back to idle when you stop.',
  },
  {
    section: 'Cameo',
    render: () => <AttentionDecision />,
    notes:
      "Listening costs money: the voice model bills by the minute. So the tour closes the session after 15 seconds of quiet — counted from when PIP stops speaking, and paused while it's thinking. The face is how you see that: attention drains, it gets drowsy, it dozes as the session closes, and a voice in the room wakes it. Early on, idle dropped straight to sleep — a cliff. The drowsy band with a yawn means you see it coming.",
  },
  {
    section: 'Cameo',
    render: () => <Attention />,
    fallback: still('tank', 'The attention tank, with the character resting in the band the level is in'),
    notes:
      "Nearby activity raises attention; time lowers it. It rises instantly and drains slowly, so it seems eager. Each event fills only to its own mark, so a hundred clicks can't out-rank one. Let them spam clicks.",
  },
  {
    section: 'Cameo',
    render: () => <VoiceDecision />,
    notes:
      "If the face waits for the audio, it's always late. But a streaming voice model hands you the words about a second before the sound. Each sentence goes to Jev, a small classifier that reads its mood in about a third of a second — cheap enough to run on every sentence. So the face changes, at the median, 0.69 seconds before the sentence ends. I first tried guessing mood from the transcript's sentiment; it was too weak a signal. Bridge: Bulbul and Saaras would sit exactly where gpt-live-1 and Jev sit.",
  },
  {
    section: 'Cameo',
    render: () => <Voice />,
    fallback: still('tape', 'The tape deck: a sentence is written, its mood is read, and the face changes before the voice finishes'),
    more: MORE,
    notes:
      'Each sentence goes to a fast classifier for mood; the face changes while the sentence is still being spoken. Eyes track loudness, head dips on stressed words. Reactions are short and silent on purpose — attentive, not theatrical. THIS is the Sarvam beat: ask how Bulbul streams and whether prosody is exposed.',
  },
  {
    section: 'Cameo',
    render: () => <InUse />,
    fallback: () => <InUseVideo />,
    more: MORE,
    notes:
      "Same library doing a real job: a spoken tour about me. Bridge: a voice agent has exactly three visible states — listening, thinking, speaking — and that's the problem I've been solving. The engine computes the face for any instant and costs nothing off-screen, so it runs on cheap phones and at the edge.",
  },
  {
    section: 'Cameo',
    render: () => <Payoff />,
    more: MORE,
    notes:
      'The tour is the first proof I could build, not the destination: PIP tells visitors about me — who I am, and this attempt at building something with it. Point at each pin and name the decision it came from — nothing here was built just for the tour. Where it goes: agents that walk you through what they built for you.',
  },
];

/** B1–B3: opened with B from the voice beat or the tour, never in the main order */
export const CAMEO_BRANCHES: Record<string, DeckBranch> = {
  'craft-why': {
    label: 'Craft · the decision',
    section: 'Cameo',
    render: () => <CraftDecision />,
    notes:
      "Most character animation slides from one expression to the next, and it feels mechanical. I started with plain easing too: nothing had weight, so springs replaced it. Then I went through Disney's twelve principles against a head and two eyes. Five made it in: anticipation, eyes leading the body, a blink on a big change, a settle, and a head that moves in an arc. Some didn't — stretching the eyes on a fast glance just read as flicker.",
  },
  craft: {
    label: 'Craft · try it',
    section: 'Cameo',
    render: () => <Craft />,
    fallback: still('disc', 'The motion disc: one change of expression with its five details'),
    notes: "Five details carry every change. Turn one off and feel what's missing.",
  },
  family: {
    label: 'Family + DX',
    section: 'Cameo',
    render: () => <Family />,
    fallback: () => <FamilyStill />,
    notes:
      "Any closed outline is a head, so a client's logo can be the face. A full character is one line and state names autocomplete. Colour carries meaning: errors go red, so a red character hides errors — that's a known trade-off. Docs ship a plain-text version for coding agents.",
  },
  change: {
    label: "What I'd change",
    section: 'Cameo',
    render: () => <Change />,
    notes: "Keep this to 30 seconds. It's here so I can answer 'what would you do differently' with specifics.",
  },
};
