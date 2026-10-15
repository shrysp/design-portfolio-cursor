'use client';

import { Fragment, useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Doto } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import { useDialKit } from 'dialkit';
import { PrefetchKind } from 'next/dist/client/components/router-reducer/router-reducer-types';
import { HOUSING_W, housingHeight, PIP, type MoodId } from '@shrysp/cameo';
import { Character, type CharacterHandle } from '@shrysp/cameo/react';
import { createField, OFF_SPLIT, type Field, type FieldUniforms, type Theme } from './field';
import LibraryDive, { type DiveHandle } from './LibraryDive';
import PosterDepth from './PosterDepth';
import { DoorBody, type Open } from './PosterConcepts';
import { sessionSeed, STREAM_CRUISE } from './library';
import { crtGlitch, crtRoll } from '../crt/CrtLayer';
import { LANDED, useEntrance } from './context';
import { markArrival, takeArrival } from '../crt/arrival';
import { CODE_REQUEST, TourHandout } from '@/app/projects/cameo/tour/TourHandout';
import InviteTicket, { type Invite } from './InviteTicket';
import { motion, slowed } from '../crt/motion';
import '@shrysp/cameo/styles.css';
import './entrance.css';
import './poster.css';

export const TOUR = '/projects/cameo/tour';

/**
 * A dot-matrix LCD, for the code and the line while the tour loads: letters
 * drawn from a grid of round dots, as a character display draws them. The
 * fourteen-segment face used before made letters out of bars, and K, M, N
 * and W came out as shapes rather than letters. ROND makes the dots round.
 */
const lcd = Doto({ subsets: ['latin'], axes: ['ROND'], variable: '--font-dot', display: 'block' });

/** Codes are 8 letters and digits (MIN_CODE_LENGTH in notion.ts), shown in two fours. */
export const CODE_LENGTH = 8;
/**
 * A code as the server reads it: letters and digits, upper case, and never
 * more than a code's length, typed or pasted. Dashes and spaces are only for
 * people, so a pasted "K7QM-2ABC" is still eight.
 */
export const normalCode = (raw: string) => raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
/** The time of day, for a greeting: as the tour's own start screen says it. */
const dayPart = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

/** A paste lights its characters one after another, this far apart. */
const PASTE_STAGGER_MS = 35;

/**
 * While the tour page is on its way: what the LCD under PIP says, and from how
 * long into the wait. Shown only once the wait is noticeable (WAIT_AFTER_MS);
 * a quick load never shows it.
 */
const WAIT_AFTER_MS = 1200;
const WAIT_LINES: [number, string][] = [
  [0, 'TUNING IN'],
  [5000, 'ALMOST THERE'],
  [12000, 'STILL LOADING'],
];
const WAIT_SAY: Record<string, string> = {
  'TUNING IN': 'Tuning in…',
  'ALMOST THERE': 'Almost there…',
  'STILL LOADING': 'Still loading…',
};

/**
 * The whole tour page — rendered, not just its loading shell — fetched while
 * the entrance plays, so it is ready when the dive hands over. Only once the
 * access cookie exists: before that the tour only redirects back here.
 */
const prefetchTour = (router: ReturnType<typeof useRouter>) => router.prefetch(TOUR, { kind: PrefetchKind.FULL });

/*
 * PIP wakes exactly where the tour's start screen will show it, so when the
 * route changes underneath, nothing moves. On that screen PIP is drawn at 152
 * with the bottom of its box at 39dvh, and scaled 1.4 from that bottom edge
 * (`.tour-dock--intro` in tour.css) — so its centre sits 0.7 of its height
 * above 39dvh. Measured on the tour at 720, 900 and 1080 tall. Drawn here at
 * the scaled size instead.
 */
const TOUR_SIZE = 152;
const SIZE = Math.round(TOUR_SIZE * 1.4);
const TOUR_H = (housingHeight(PIP.silhouette) * TOUR_SIZE) / HOUSING_W;
const H = (housingHeight(PIP.silhouette) * SIZE) / HOUSING_W;
const ABOVE = TOUR_H * 0.7;
export const pipCentre = (): [number, number] => [window.innerWidth / 2, window.innerHeight * 0.39 - ABOVE];

/**
 * Each look's opening, in ms from the press. Durations are how long a part
 * takes; the `At`s are when it starts. PIP's own fade-in runs 1.4s
 * (entrance.css), so it is still arriving when it wakes, and wakes a beat
 * before the code is asked for.
 */
const AURORA = {
  spread: 1800, // the light opens out from the button: barely at first, then all at once
  fillAt: 900,
  fill: 2000, // the aurora comes up to full
  gatherAt: 1500,
  gather: 1500, // the light pools where PIP will appear
  pipAt: 2500, // PIP materialises, asleep
  wakeAt: 4000, // and wakes, curious
  askAt: 5300, // the code
};
const SCREEN = {
  off: 1000, // the page squeezes to a line, then a dot
  on: 800, // dark for a breath, then the tube opens from a line
  onAt: 1250,
  gatherAt: 2050,
  gather: 1400, // the phosphor warms where PIP will appear
  pipAt: 2350,
  wakeAt: 3850,
  askAt: 5100,
  dive: 1100, // on the way in: building up to the stream's cruising speed
  pushAt: 1100, // at cruise; the stream carries on through the route change
  surge: 250, // once the tour is underneath, the landing quickens to 1.5× over this
  out: 500, // the takeover's fade, where there is no stream to land (aurora, reduced motion)
};
/**
 * How close, in px of depth, the last photo is to its place when the
 * takeover starts to dissolve: the reveal of the tour happens as the photos
 * arrive, not as a second step after they have. Close, since the landing
 * eases out: further back, a photo still a little short of its place showed
 * as a double over the tour's own card for it, waiting there.
 */
const DISSOLVE_FROM = 30;
/** How long the CRT glass takes to come up over the case study (EntranceHost mounts it). */
export const GLASS_APPEAR = SCREEN.off * 0.6;
/**
 * How much the landing quickens once the tour is underneath. 1: the photos
 * slow out of the stream's own speed (LibraryDive's landing), and a surge on
 * top of that read as a second, different animation after a long wait.
 */
const LAND_SURGE = 1;
/** The glitch on the way in, in ms: a wrong code's (submit), seen on its own before the dive. */
const ENTER_GLITCH = 360;
const REDUCED = 250;
/** How often the arrival is written again while the stream waits for the tour, in ms. */
const ARRIVAL_EVERY = 1000;

type Step = 'opening' | 'code' | 'checking' | 'entering' | 'closing';

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** Slow to start, then pulled open: the opening gathers before it gives. */
export const easeIn = (t: number) => t * t * t * t;
export const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function tween(ms: number, ease: (t: number) => number, fn: (k: number) => void, alive: () => boolean) {
  return new Promise<void>((resolve) => {
    if (ms <= 0) {
      fn(1);
      resolve();
      return;
    }
    // Read once per tween: the Motion dial slows what starts after it moves.
    const span = slowed(ms);
    const start = performance.now();
    const step = (now: number) => {
      if (!alive()) return resolve();
      const k = Math.min(1, (now - start) / span);
      fn(ease(k));
      if (k < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}
export const wait = (ms: number) => new Promise((r) => setTimeout(r, slowed(ms)));

/**
 * The case study itself, squeezed as the tube switches off — the same curve
 * the shader draws its line with, so the page and the glow stay together.
 */
function squeezePage(off: number) {
  squeeze(document.querySelector<HTMLElement>('[data-case-study]'), off);
}

/** Any page on the glass, squeezed to a line and a dot about the middle of the window (also the tour, leaving: TourExit). */
export function squeeze(el: HTMLElement | null, off: number) {
  if (!el) return;
  if (off <= 0) {
    el.style.transform = el.style.transformOrigin = el.style.filter = '';
    return;
  }
  const v = smoothstep(0, OFF_SPLIT, off);
  const h = smoothstep(OFF_SPLIT, 1, off);
  // About the middle of the window: for a page that scrolls, wherever it has been scrolled to.
  const fixed = getComputedStyle(el).position === 'fixed';
  el.style.transformOrigin = `50% ${fixed ? window.innerHeight / 2 : window.scrollY + window.innerHeight / 2 - el.offsetTop}px`;
  el.style.transform = `scale(${Math.max(0.002, 1 - h)}, ${Math.max(0.002, 1 - v)})`;
  el.style.filter = `brightness(${1 + v * 1.4})`;
}

/**
 * The way into the tour. On the page it is a small piece of the tour itself
 * (poster.css): PIP in its dark room with the photos round it, and one button.
 * Pressing it lets the tour take over the window, and the access code is
 * asked for inside, once PIP is awake. The code is checked on the server,
 * which answers with a cookie this script cannot read; nothing here decides
 * who gets in.
 */
export default function TourEntrance({ unlocked: realUnlocked, phone: realPhone }: { unlocked: boolean; phone: boolean }) {
  const router = useRouter();
  const trigger = useRef<HTMLButtonElement>(null);
  const openTakeover = useEntrance();
  /** PIP perks up as the pointer comes to the button. */
  const [eager, setEager] = useState(false);
  // For trying the card in development; the panel is dev-only.
  const dial = useDialKit('Tour card', {
    // Two ideas of what the way in is: a preview of the dive, or the code itself.
    concept: { type: 'select', options: ['Tunnel', 'Door'], default: 'Tunnel' },
    tunnel: {
      // Px of depth a second at rest, and with the pointer at the button.
      speed: [0, 0, 600, 10],
      warp: [900, 200, 4200, 100],
      lit: { type: 'select', options: ['On hover', 'Always', 'Never'], default: 'On hover' },
      photos: true,
    },
    height: [340, 260, 520, 10],
    visitor: { type: 'select', options: ['As it is', 'New', 'Has a code', 'On a phone'], default: 'Has a code' },
    mood: { type: 'select', options: ['As it is', 'idle', 'excited', 'happy', 'curious', 'sleeping', 'thinking', 'love', 'starstruck', 'sad'], default: 'As it is' },
  });
  // The live site always shows the visitor's own state, whatever the panel's default.
  const visitor = process.env.NODE_ENV === 'production' ? 'As it is' : dial.visitor;
  /** Let go of the code here: over the panel's "Has a code" too, until the panel is changed. */
  const [released, setReleased] = useState<string | null>(null);
  const unlocked = released === visitor ? false : visitor === 'As it is' ? realUnlocked : visitor === 'Has a code';
  const phone = visitor === 'As it is' ? realPhone : visitor === 'On a phone';
  const held = dial.mood === 'As it is' ? null : (dial.mood as MoodId);
  const { concept, tunnel } = dial;

  /** Settled on the screen look (the tube) over the aurora; it was the Tour entrance panel's. */
  const look = useRef<Theme>('screen');

  const openAt: Open = (origin, justUnlocked) => {
    const inside = unlocked || !!justUnlocked;
    openTakeover({ origin, theme: look.current, unlocked: inside, onClosed: () => trigger.current?.focus() });
    if (inside) prefetchTour(router);
  };

  const open = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    openAt([r.left + r.width / 2, r.top + r.height / 2]);
  };

  /**
   * Coming in with another code: the takeover, on its code screen, whatever
   * this browser holds. The code kept here stays until a new one is accepted,
   * so backing out of it changes nothing.
   */
  const askCode = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    openTakeover({ origin: [r.left + r.width / 2, r.top + r.height / 2], theme: look.current, unlocked: false });
  };

  // A browser stays unlocked for a week, so there has to be a way back to the
  // code — for a shared computer, or to come in as someone else.
  const lock = async () => {
    setReleased(visitor);
    await fetch('/api/tour/unlock', { method: 'DELETE' }).catch(() => {});
    router.refresh();
  };

  const wake = {
    onPointerEnter: () => setEager(true),
    onPointerLeave: () => setEager(false),
    onFocus: () => setEager(true),
    onBlur: () => setEager(false),
  };

  const body = phone ? (
    // No way in on a phone: the tour needs room around PIP for the photos (see LaptopOnly).
    <>
      <span className="tour-poster-tag">BY INVITATION</span>
      <div className="tour-poster-pip" aria-hidden="true">
        <Character preset={PIP} size={88} state={held} />
      </div>
      <p className="tour-poster-title">Try it yourself</p>
      <p className="tour-poster-text">Ask PIP about my work, out loud. Open this page on a laptop to start it.</p>
    </>
  ) : concept === 'Door' ? (
    <DoorBody unlocked={unlocked} open={openAt} lock={lock} mood={held} length={CODE_LENGTH} normal={normalCode} />
  ) : (
    <>
      <div className="tour-poster-pip" aria-hidden="true">
        <Character preset={PIP} size={88} state={held ?? (eager ? 'excited' : null)} />
      </div>
      <p className="tour-poster-title">Try it yourself</p>
      <p className="tour-poster-text">Ask PIP about my work.</p>
      <div className="tour-poster-actions">
        {/* With a code kept here this goes straight in; without one, to the code screen. */}
        <button ref={trigger} type="button" onClick={open} className="entrance-btn entrance-btn--primary tour-poster-go" {...wake}>
          Start the tour
        </button>
        {unlocked && (
          <button type="button" onClick={askCode} className="tour-poster-link">
            Use a different code
          </button>
        )}
      </div>
    </>
  );

  return (
    <div
      className={`tour-poster ${lcd.variable}`}
      data-concept={phone ? undefined : concept}
      data-lit={tunnel.lit === 'On hover' ? undefined : tunnel.lit === 'Always'}
    >
      <div className="tour-poster-screen" style={{ minHeight: dial.height }}>
        {concept === 'Tunnel' && tunnel.photos && (
          <PosterDepth speed={tunnel.speed} warp={tunnel.warp} rush={eager && tunnel.lit !== 'Never'} lit={tunnel.lit === 'Always'} />
        )}
        {/* In the corner, out of the column: the card says who it is for once. */}
        {concept === 'Tunnel' && !phone && <span className="tour-poster-tag tour-poster-tag--corner">BY INVITATION</span>}
        <div className="tour-poster-body">{body}</div>
      </div>
    </div>
  );
}

/**
 * The takeover itself. Rendered by EntranceHost, in the layout the case study
 * and the tour share, so it stays up across the route change: the stream the
 * visitor flies through is still the same stream when the tour page arrives
 * underneath, and it lands there before the takeover fades away.
 */
export function Takeover({
  unlocked,
  origin,
  theme,
  invite,
  onClosed,
}: {
  unlocked: boolean;
  origin: [number, number];
  theme: Theme;
  /**
   * Someone invited: PIP prints them a ticket instead of asking for a code,
   * and tearing its stub is the way in. `preview` (the dev page) prints it
   * again instead of going in.
   */
  invite?: Invite & { preview?: boolean };
  onClosed: () => void;
}) {
  const router = useRouter();
  const canvas = useRef<HTMLCanvasElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const char = useRef<CharacterHandle>(null);
  const dive = useRef<DiveHandle>(null);
  /** The stream's state while it runs. */
  const stream = useRef({ travel: 0, velocity: 0 });
  /**
   * Which run of the dive's frame loop is current. Bumped when the way in
   * fails or the takeover closes, so a loop still going stops drawing: left
   * running, it faded the photos back in over the code screen, and they hung
   * there in front of the tube as it switched off.
   */
  const diveRun = useRef(0);
  /** Set once the tour page is in place underneath: when the landing began, and how fast the stream was going. */
  const landing = useRef<{ started: number; velocity: number } | null>(null);
  const pathname = usePathname();
  const field = useRef<Field | null>(null);
  const alive = useRef(true);
  const run = useRef(0);
  // State for the character's senses, which need a re-render; a ref for the sequences, which do not wait for one.
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const rootEl = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState<Step>('opening');
  const [awake, setAwake] = useState(false);
  const [mood, setMood] = useState<MoodId | null>('sleeping');
  const [flat, setFlat] = useState(false);
  const [code, setCode] = useState('');
  /** Where a paste began, so its characters light one after another; null for one typed at a time. */
  const [burstFrom, setBurstFrom] = useState<number | null>(null);
  const [typingIn, setTypingIn] = useState(false);
  /** No code: writing to Shreyas on the contact card instead, in the code card's place. */
  const [writing, setWriting] = useState(false);
  /** Each printing of an invitation's ticket; the preview prints it again on a tear. */
  const [ticketRun, setTicketRun] = useState(0);
  /** How tall the invited guest's greeting is, so their ticket prints just under it. */
  const [greetH, setGreetH] = useState(0);
  const greetObserver = useRef<ResizeObserver | null>(null);
  const greetRef = useCallback((el: HTMLDivElement | null) => {
    greetObserver.current?.disconnect();
    if (!el) return;
    const watch = new ResizeObserver(() => setGreetH(el.offsetHeight));
    watch.observe(el);
    greetObserver.current = watch;
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  /** When the wait for the tour page became worth saying something about, and the clock that moves its line on. */
  const [waitingSince, setWaitingSince] = useState<number | null>(null);
  const [waitClock, setWaitClock] = useState(0);
  const waitTimer = useRef(0);
  const stopWaiting = useCallback(() => {
    window.clearTimeout(waitTimer.current);
    setWaitingSince(null);
  }, []);
  useEffect(() => {
    if (waitingSince === null) return;
    const id = window.setInterval(() => setWaitClock(performance.now()), 500);
    return () => window.clearInterval(id);
  }, [waitingSince]);
  const waitLine =
    waitingSince === null
      ? null
      : ([...WAIT_LINES].reverse().find(([at]) => waitClock - waitingSince >= at) ?? WAIT_LINES[0])[1];
  const [focus] = useState(pipCentre);
  // The library's layout for this visit: the stream draws it, and the tour lands on it.
  const [seed] = useState(sessionSeed);
  const isAlive = useCallback(() => alive.current, []);
  const screen = theme === 'screen';

  const uniform = useCallback(
    (key: keyof FieldUniforms) => (k: number) => {
      if (field.current) (field.current.uniforms[key] as number) = k;
    },
    [],
  );
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** aurora: the opening's edge, and the blur behind the light — the same circle the shader draws. */
  const setOpening = useCallback(
    (k: number) => {
      if (field.current) field.current.uniforms.reveal = k;
      // Just inside the shader's edge, which wobbles up to 45px either way.
      const r = Math.max(0, k * Math.hypot(window.innerWidth, window.innerHeight) * 1.05 - 48);
      if (veil.current) veil.current.style.clipPath = `circle(${r}px at ${origin[0]}px ${origin[1]}px)`;
    },
    [origin],
  );

  /** screen: the tube switching off, page and glow together. */
  const setOff = useCallback((k: number) => {
    if (field.current) {
      field.current.uniforms.off = k;
      field.current.uniforms.glow = smoothstep(0.35, 1, k);
    }
    squeezePage(k);
  }, []);

  const [pending, startNavigation] = useTransition();
  const navigating = useRef(false);
  const wasPending = useRef(false);
  const failEntry = useCallback((why: 'expired' | 'unreachable') => {
    stopWaiting();
    navigating.current = false;
    wasPending.current = false;
    if (field.current) field.current.uniforms.bloom = 0;
    diveRun.current++;
    stream.current = { travel: 0, velocity: 0 };
    landing.current = null;
    dive.current?.fade(0);
    crtRoll(0, 300);
    setMood(null);
    setError(
      why === 'expired'
        ? 'Your access on this browser has run out. Enter your code again.'
        : 'The tour didn’t open. Check your connection, then try again.',
    );
    setStep('code');
    // The card behind still thinks there is a code; let it see there isn't.
    if (why === 'expired') router.refresh();
  }, [router, stopWaiting]);

  /**
   * The way in did not land: the tour sent the visitor back, or never
   * answered. From here those look alike, and are not. A browser whose
   * cookie still opens the tour was turned away by a stale copy of the
   * page in the router's cache, or was waiting on a slow first build of it,
   * so it goes in by an ordinary full load instead, which neither can stop.
   * A cookie that no longer opens it means the code is asked for again.
   */
  const recoverEntry = useCallback(
    async (what: 'bounced' | 'timed out') => {
      if (!navigating.current) return;
      navigating.current = false;
      console.warn(`[tour] The way in ${what}; checking access.`);
      const status = await fetch('/api/tour/unlock', { cache: 'no-store' })
        .then((r) => (r.ok ? (r.json() as Promise<{ unlocked?: boolean }>) : null))
        .catch(() => null);
      if (!alive.current) return;
      if (status?.unlocked) {
        // A full load ends the takeover: the tour flies its own stream in, not waiting for this one.
        takeArrival();
        window.location.assign(TOUR);
        return;
      }
      failEntry(status ? 'expired' : 'unreachable');
    },
    [failEntry],
  );

  /** Every photo at rest over its card: fade the takeover from over the tour, and go. */
  const finish = useCallback(async () => {
    await tween(
      SCREEN.out,
      easeInOut,
      (k) => rootEl.current && (rootEl.current.style.opacity = String(1 - k)),
      isAlive,
    );
    if (alive.current) {
      window.dispatchEvent(new Event(LANDED));
      onClosed();
    }
  }, [isAlive, onClosed]);

  const enter = useCallback(async () => {
    /** When the arrival was last written for the tour; 0 until the first, at pushAt. */
    let marked = 0;
    setStep('entering');
    setError(null);
    setMood('happy');
    // Going in is a change of channel: the same burst of interference as a
    // wrong code (submit) — the room's flicker and torn lines and the glass's
    // glitch, at the same strength and length — seen on its own before the
    // dive starts. crtGlitch does nothing for reduced motion.
    const calm = reduced() || !field.current;
    if (!calm) {
      if (field.current) field.current.uniforms.error = 1;
      crtGlitch(1, ENTER_GLITCH);
      await wait(ENTER_GLITCH);
      if (!alive.current) return;
    }
    if (screen && !calm) {
      // Through the library: the stream builds up to cruising speed and keeps
      // going — through the route change, for as long as the tour page takes
      // to arrive underneath — and then these same photos land, each in its
      // place on the tour, before the takeover fades. The room stays lit: the
      // tour is the same room.
      const start = performance.now();
      let last = start;
      const run = ++diveRun.current;
      const step = (now: number) => {
        if (!alive.current || diveRun.current !== run) return;
        const dt = (Math.min(50, now - last) / 1000) * motion();
        last = now;
        const land = landing.current;
        if (land) {
          // Quickening over its first moments, smoothly, so the furthest is in place in about a second.
          const surge = 1 + (LAND_SURGE - 1) * Math.min(1, (now - land.started) / slowed(SCREEN.surge));
          const left = dive.current?.land(dt * surge, land.velocity) ?? 0;
          // The takeover dissolves as the last photos close on their cards beneath it.
          if (rootEl.current) rootEl.current.style.opacity = String(Math.min(1, left / DISSOLVE_FROM));
          if (left <= 0) {
            // The tour's cards are free to start floating (TourStage).
            window.dispatchEvent(new Event(LANDED));
            onClosed();
            return;
          }
        } else {
          const k = Math.min(1, (now - start) / slowed(SCREEN.dive));
          stream.current.velocity = STREAM_CRUISE * k * k;
          stream.current.travel += stream.current.velocity * dt;
          dive.current?.set(stream.current.travel);
          dive.current?.fade(Math.min(1, k / 0.15));
          // Kept fresh for as long as the tour takes to come: read stale
          // (arrival.ts), the tour took itself for a direct visit and flew a
          // second stream of its own under this one, from the start.
          if (marked && now - marked > ARRIVAL_EVERY) {
            marked = now;
            markArrival({ how: 'dive', seed, ...stream.current });
          }
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      crtRoll(1, SCREEN.dive * 0.6);
    } else {
      // The tour page reads Notion before it renders; the pulse covers that wait.
      void tween(calm ? REDUCED : 1100, easeInOut, uniform('bloom'), isAlive);
    }
    await wait(calm ? REDUCED : screen ? SCREEN.pushAt : 850);
    if (!alive.current) return;
    // The tour lays its photos out from the same seed, so its cards wait
    // exactly where the stream will land them.
    if (screen && !calm) {
      markArrival({ how: 'dive', seed, ...stream.current });
      marked = performance.now();
    }
    // In a transition, so it can be watched: pending while the tour page
    // loads, however long that takes (a first compile, the Notion reads). If
    // it finishes and this is still here, the tour sent the visitor back.
    // The tour is one fixed screen: nothing to scroll to.
    navigating.current = true;
    startNavigation(() => router.push(TOUR, { scroll: false }));
    // Say something only if the page is slow to come.
    window.clearTimeout(waitTimer.current);
    waitTimer.current = window.setTimeout(() => {
      if (!alive.current || !navigating.current) return;
      const at = performance.now();
      setWaitingSince(at);
      setWaitClock(at);
    }, slowed(WAIT_AFTER_MS));
    // A backstop for a request that never answers at all.
    await wait(30_000);
    if (alive.current && navigating.current) void recoverEntry('timed out');
  }, [isAlive, onClosed, recoverEntry, router, screen, seed, startNavigation, uniform]);

  // The tour page is in place underneath: land the stream on it (or, with
  // no stream, simply fade away), and let the lines slow to a stop.
  useEffect(() => {
    if (step !== 'entering' || pathname !== TOUR || !navigating.current) return;
    navigating.current = false;
    stopWaiting();
    crtRoll(0, 1400);
    if (screen && !reduced() && field.current) {
      landing.current = { started: performance.now(), velocity: Math.max(1500, stream.current.velocity) };
      // Settling with the photos: by the time the takeover is gone, PIP's face
      // is the tour's own, so nothing changes when they swap.
      setMood(null);
    } else void finish();
  }, [pathname, step, screen, finish, stopWaiting]);

  // The navigation ended and the tour did not take over: come back to the
  // code rather than leave the visitor in the dark.
  useEffect(() => {
    if (pending) wasPending.current = true;
    else if (wasPending.current && navigating.current && alive.current && pathname !== TOUR) void recoverEntry('bounced');
  }, [pending, recoverEntry, pathname]);

  // Open: the room is built before anyone is in it, and only then PIP.
  useEffect(() => {
    alive.current = true;
    // Strict Mode mounts twice; only the latest opening may carry on.
    const id = ++run.current;
    const live = () => alive.current && run.current === id;
    const calm = reduced();
    const f = canvas.current ? createField(canvas.current, theme, { origin, focus }) : null;
    field.current = f;
    if (!f) setFlat(true);

    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const wakeUp = async (pipAt: number, wakeAt: number, askAt: number) => {
      await wait(pipAt);
      if (!live()) return;
      setAwake(true);
      await wait(wakeAt - pipAt);
      if (!live()) return;
      // Clearing 'sleeping' only lets PIP drift awake; a held 'curious' wakes
      // it on the beat — eyes open, looking at whoever woke it — until the ask.
      if (!calm) char.current?.setPose('stretch');
      setMood('curious');
      await wait(askAt - wakeAt);
      if (!live()) return;
      setMood((m) => (m === 'curious' ? null : m));
      // An invitation is expected: PIP is glad to see them as it prints their ticket.
      if (invite) setMood('happy');
      if (unlocked && !invite) void enter();
      else setStep('code');
    };

    if (calm || !f) {
      // No travel: the room as it will be, faded in whole.
      if (f) {
        f.still = true;
        Object.assign(f.uniforms, { reveal: 1, build: 1, wake: 1, off: 1, on: 1 });
      }
      if (rootEl.current) rootEl.current.style.opacity = '0';
      void tween(REDUCED, easeOut, (k) => rootEl.current && (rootEl.current.style.opacity = String(k)), live);
      void wakeUp(0, 150, REDUCED);
    } else if (theme === 'screen') {
      void (async () => {
        // The page under it squeezes to a line and goes out. With no page under
        // it (an invitation's own page, which is already dark) there is nothing
        // to switch off, and that line would only flash on an empty screen:
        // it starts off.
        const page = document.querySelector('[data-case-study]');
        await tween(page ? SCREEN.off : 0, easeIn, setOff, live);
        if (!live()) return;
        await wait(SCREEN.onAt - SCREEN.off);
        if (!live()) return;
        // The tube covers the page from here; put the page back behind it.
        squeezePage(0);
        await tween(SCREEN.on, easeIn, uniform('on'), live);
        if (!live()) return;
        f.uniforms.flash = 1;
        crtGlitch(0.7, 260);
        await wait(SCREEN.gatherAt - SCREEN.onAt - SCREEN.on);
        void tween(SCREEN.gather, easeInOut, uniform('wake'), live);
      })();
      void wakeUp(SCREEN.pipAt, SCREEN.wakeAt, SCREEN.askAt);
    } else {
      void tween(AURORA.spread, easeIn, setOpening, live);
      void wait(AURORA.fillAt).then(() => {
        if (live()) void tween(AURORA.fill, easeInOut, uniform('build'), live);
      });
      void wait(AURORA.gatherAt).then(() => {
        if (live()) void tween(AURORA.gather, easeInOut, uniform('wake'), live);
      });
      void wakeUp(AURORA.pipAt, AURORA.wakeAt, AURORA.askAt);
    }

    const onResize = () => {
      if (field.current) field.current.uniforms.focus = pipCentre();
    };
    window.addEventListener('resize', onResize);
    return () => {
      alive.current = false;
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = overflow;
      squeezePage(0);
      f?.destroy();
      field.current = null;
    };
    // Runs once per opening; the origin and look are fixed for its life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // `shake` remounts the field to replay its shake, so focus goes back to the new one.
  useEffect(() => {
    if (step === 'code' && !writing) {
      input.current?.focus({ preventScroll: true });
      dive.current?.preload();
    }
  }, [step, shake, writing]);

  const close = useCallback(async () => {
    if (step === 'entering' || step === 'closing') return;
    setStep('closing');
    setAwake(false);
    diveRun.current++;
    dive.current?.fade(0);
    const f = field.current;
    if (reduced() || !f) {
      await tween(REDUCED, easeOut, (k) => rootEl.current && (rootEl.current.style.opacity = String(1 - k)), isAlive);
    } else if (screen) {
      // The tube switches off to a dot, and the page comes back out of it.
      await tween(450, easeIn, (k) => {
        f.uniforms.on = 1 - k;
        f.uniforms.wake = Math.min(f.uniforms.wake, 1 - k);
      }, isAlive);
      f.uniforms.on = 0;
      setOff(1);
      await wait(120);
      await tween(600, easeOut, (k) => setOff(1 - k), isAlive);
    } else {
      // Out the way Shopify's portal closes: quick at first, settling (easeOutQuad).
      await tween(650, easeOut, (k) => {
        setOpening(1 - k);
        f.uniforms.wake = Math.min(f.uniforms.wake, 1 - k);
        f.uniforms.build = Math.min(f.uniforms.build, 1 - k);
      }, isAlive);
    }
    if (alive.current) onClosed();
  }, [isAlive, onClosed, screen, setOff, setOpening, step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  const onCode = (raw: string) => {
    const next = normalCode(raw);
    setBurstFrom(next.length > code.length + 1 ? code.length : null);
    setCode(next);
    // Typing again is a fresh attempt: the last one's verdict goes.
    if (error) setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 'code' || code.length < CODE_LENGTH) return;
    setStep('checking');
    setError(null);
    setMood('thinking');
    try {
      const res = await fetch('/api/tour/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!alive.current) return;
      if (res.ok) {
        prefetchTour(router);
        void enter();
        return;
      }
      setError((await res.json().catch(() => null))?.error ?? 'Something went wrong. Try again.');
    } catch {
      if (!alive.current) return;
      setError('Something went wrong. Try again.');
    }
    if (field.current) field.current.uniforms.error = 1;
    crtGlitch(1, 360);
    setShake((s) => s + 1);
    setMood(null);
    char.current?.setPose('sad');
    setStep('code');
  };

  const asking = step === 'code' || step === 'checking';

  return (
    <div
      data-crt-target
      ref={(el) => {
        rootEl.current = el;
        setRoot(el);
      }}
      className={`entrance ${lcd.variable} ${flat ? 'entrance--flat' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="The tour"
      data-step={step}
      data-look={theme}
      onPointerMove={(e) => {
        if (field.current) field.current.uniforms.pointer = [e.clientX, e.clientY];
      }}
    >
      {!screen && <div ref={veil} className="entrance-veil" style={{ clipPath: `circle(0px at ${origin[0]}px ${origin[1]}px)` }} />}
      <canvas ref={canvas} className="entrance-field" aria-hidden="true" />
      {screen && <LibraryDive ref={dive} focus={focus} seed={seed} />}

      <button type="button" className="entrance-btn entrance-back" data-show={asking} onClick={() => void close()} data-crt-clear>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Case study
      </button>

      <div
        className="entrance-pip"
        data-awake={awake}
        style={{ width: SIZE, height: H, top: `calc(39dvh - ${ABOVE + H / 2}px)` }}
        aria-hidden="true"
      >
        <Character ref={char} preset={PIP} size={SIZE} state={mood} sound senses sensesRoot={root} />
      </div>

      {invite && (
        // Someone expected: greeted by name, told in a line what this is — under PIP, where
        // the code card has its title and its line, and in the same type. Their ticket prints under it.
        <div ref={greetRef} className="entrance-invite-head" data-show={step === 'code'}>
          <p className="entrance-title">
            {dayPart()}, {invite.name.charAt(0).toUpperCase() + invite.name.slice(1)}
          </p>
          <p className="entrance-body">
            <span className="entrance-invite-long">
              This is PIP, Shreyas{'\u2019'}s guide to himself. Ask it anything out loud, and it answers with photos from his
              life. You{'\u2019'}ll need your microphone.
            </span>
            {/* On a short screen there is room for one line over PIP. */}
            <span className="entrance-invite-short" aria-hidden="true">
              PIP is Shreyas{'\u2019'}s guide. Talk to it out loud.
            </span>
          </p>
        </div>
      )}
      {invite && (
        <InviteTicket
          key={ticketRun}
          invite={invite}
          show={step === 'code'}
          top={`calc(43dvh + ${greetH + 14}px)`}
          onTear={() => (invite.preview ? setTicketRun((n) => n + 1) : void enter())}
        />
      )}

      <div className="entrance-card" data-show={asking && !writing && !invite}>
        <p className="entrance-title">Enter your access code</p>
        <p className="entrance-body">The tour is open by invitation, and your code came with it. Once you’re in, PIP will ask for your microphone.</p>
        <form className="entrance-form" onSubmit={submit} autoComplete="off">
          {/*
           * An LCD, the same as PIP's face and the tour's countdown: a cell for
           * each character, its unlit segments showing faintly, lit as it is
           * typed. A real input lies over it, unseen, so typing, pasting, a
           * phone's keyboard and a screen reader all work as they would.
           */}
          <div
            key={shake}
            className={`entrance-lcd ${shake ? 'entrance-lcd--shake' : ''}`}
            data-state={error ? 'error' : step === 'checking' ? 'checking' : step === 'entering' ? 'open' : undefined}
            data-crt-clear
          >
            {Array.from({ length: CODE_LENGTH / 4 }, (_, g) => (
              <Fragment key={g}>
                {g > 0 && (
                  <span className="entrance-lcd-dash" aria-hidden="true">
                    -
                  </span>
                )}
                {[0, 1, 2, 3].map((j) => {
                  const i = g * 4 + j;
                  const ch = code[i];
                  return (
                    <span
                      key={i}
                      className="entrance-lcd-cell"
                      data-caret={typingIn && step === 'code' && i === code.length ? '' : undefined}
                      style={
                        {
                          '--i': i,
                          '--burst': ch && burstFrom !== null && i >= burstFrom ? `${(i - burstFrom) * PASTE_STAGGER_MS}ms` : '0ms',
                        } as React.CSSProperties
                      }
                      aria-hidden="true"
                    >
                      <span className="entrance-lcd-ghost" />
                      {ch && (
                        <span key={ch} className="entrance-lcd-lit">
                          {ch}
                        </span>
                      )}
                    </span>
                  );
                })}
              </Fragment>
            ))}
            <label htmlFor="entrance-code" className="sr-only">
              Access code
            </label>
            <input
              ref={input}
              id="entrance-code"
              className="entrance-lcd-input"
              value={code}
              onChange={(e) => onCode(e.target.value)}
              onFocus={() => setTypingIn(true)}
              onBlur={() => setTypingIn(false)}
              // Always typed at the end: the cells show no caret but the next one.
              onSelect={(e) => {
                const el = e.currentTarget;
                if (el.selectionStart !== el.value.length) el.setSelectionRange(el.value.length, el.value.length);
              }}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={30}
              aria-invalid={!!error}
              aria-describedby={error ? 'entrance-error' : undefined}
              disabled={step === 'checking'}
            />
          </div>
          <button type="submit" className="entrance-btn entrance-btn--primary" disabled={step !== 'code' || code.length < CODE_LENGTH} data-crt-clear>
            {step === 'checking' ? 'Checking…' : 'Enter'}
          </button>
        </form>
        <p id="entrance-error" className="entrance-error" role="alert">
          {error}
        </p>
        <p className="entrance-help">
          No code?{' '}
          <button type="button" onClick={() => setWriting(true)}>
            Write to Shreyas
          </button>
        </p>
      </div>
      {/* Said before anyone says anything: the conversation is kept (saveExchange, on the server). */}
      <p className="entrance-notice" data-show={asking}>
        Your conversation with PIP is saved, so Shreyas can see what people ask and make the tour better.
      </p>
      {asking && writing && (
        <TourHandout
          handout={{ kind: 'contact' }}
          writing
          draft={CODE_REQUEST}
          where="entrance"
          leaving={false}
          onClose={() => setWriting(false)}
          className="tour-handout--entrance"
        />
      )}

      {/*
       * The wait for the tour page, when it is long enough to notice: a line
       * on the same LCD as the code, where the code was, typing itself out.
       */}
      <div className="entrance-wait" data-show={waitLine !== null} role="status" aria-live="polite">
        {waitLine && (
          <span key={waitLine} className="entrance-wait-lcd">
            <span className="sr-only">{WAIT_SAY[waitLine]}</span>
            {[...waitLine].map((c, i) => (
              <span key={i} className="entrance-wait-ch" style={{ '--i': i } as React.CSSProperties} aria-hidden="true">
                <span className="entrance-lcd-ghost" />
                <span className="entrance-wait-lit">{c === ' ' ? '\u00a0' : c}</span>
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
