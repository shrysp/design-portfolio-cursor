'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HOUSING_W, housingHeight, lookAt, PIP, type Reaction } from '@shrysp/cameo';
import { Character, type CharacterHandle } from '@shrysp/cameo/react';
import {
  type LiveEvent,
  type LiveSession,
  createLiveSession,
  interpret,
  listMicrophones,
} from '@/lib/tour/live-session';
import { idleSecondsLeft } from '@/lib/tour/idle';
import { type WakeMic, createWakeMic } from '@/lib/tour/wake-mic';
import { createTourClassifier } from '@/lib/tour/tour-model';
import { CHAPTERS, type ChapterId, TOUR_IMAGES, chapterOf } from '@/data/tour-images';
import { useDialKit } from 'dialkit';
import { PHOTO_POP } from '@/lib/tour/tour-sounds';
import { playRecipe } from '@shrysp/cameo/sound';
import '@shrysp/cameo/styles.css';
import './tour.css';

/**
 * Tells the server the session is over, so the time it did not use goes back
 * to the visitor's access code. A beacon, because the usual moment for this is
 * a tab closing. Safe to send twice: the server refunds once.
 */
const reportEnd = () => navigator.sendBeacon('/api/tour/session/end');

const IMAGE_BY_ID = new Map(TOUR_IMAGES.map((img) => [img.id, img]));

/** "rit-graduation-with-mascot" → "rit graduation with mascot" — the ids are the only short names. */
const photoName = (id: string) => id.replace(/-/g, ' ');

/**
 * Every photo in the library lives on stage for the whole visit, each at a
 * spot of its own — a scattered cloud in the two side bands, clear of the
 * centre, where the focus photo lands at its largest.
 *
 * Replaced a 5-seat ring that phase 1 filled by guessing from the question
 * alone. That guess ran before the answer existed, so it couldn't know what
 * PIP would actually bring up, and a broad question ("tell me about RIT")
 * qualified ~15 photos for 5 seats — decided by which slice's request came
 * back first, not by which photos fit best. With every photo already present,
 * there's nothing left to guess: a sentence that names one just spotlights it.
 *
 * A jittered grid rather than pure random, so 38 cards spread evenly instead
 * of clumping, while still not reading as a grid. Random on every page load,
 * twice over: which cell a photo gets is shuffled, and where it sits inside
 * that cell is jittered. Once placed, a photo keeps its spot for the rest of
 * the visit, so "goes back to its place" means somewhere that stays put.
 */
const CLOUD_X = { left: [3, 19] as const, right: [81, 97] as const };
const CLOUD_Y = [13, 84] as const;
const CLOUD_COLS = 2;

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cloudPositions(count: number): { left: string; top: string }[] {
  const perSide = Math.ceil(count / 2);
  const rows = Math.ceil(perSide / CLOUD_COLS);
  const cells = Array.from({ length: rows * CLOUD_COLS }, (_, c) => c);
  // One shuffled deck of cells per side. Photos still alternate sides by
  // entrance order, so the stagger fills left and right together.
  const deck = { left: shuffle(cells), right: shuffle(cells) };
  const out: { left: string; top: string }[] = [];
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? 'left' : 'right';
    const [xMin, xMax] = CLOUD_X[side];
    const cell = deck[side][Math.floor(i / 2)];
    const col = cell % CLOUD_COLS;
    const row = Math.floor(cell / CLOUD_COLS);
    const cellW = (xMax - xMin) / CLOUD_COLS;
    const cellH = (CLOUD_Y[1] - CLOUD_Y[0]) / rows;
    // Jitter within the middle 60% of the cell — neighbours can graze, not stack.
    const x = xMin + cellW * (col + 0.2 + Math.random() * 0.6);
    const y = CLOUD_Y[0] + cellH * (row + 0.2 + Math.random() * 0.6);
    out.push({ left: `${x.toFixed(1)}%`, top: `${y.toFixed(1)}%` });
  }
  return out;
}

/**
 * The other way to lay the library out: by chapter of his life instead of
 * scattered. The chapters themselves are provisional — they follow whatever
 * chapterOf() says — so nothing here knows their names.
 *
 * Each chapter is a cluster with a centre and a reach, as percentages of the
 * stage. Its photos are not all one size: one or two main pieces sit in the
 * middle and the rest get smaller as they go outward, so a cluster reads as
 * "this, and around it the rest of that time" rather than as a grid. Which
 * photos are the main ones is their order in TOUR_IMAGES — the first listed
 * for a chapter is its centre piece.
 */
const CHAPTER_CLUSTERS: Record<ChapterId, { cx: number; cy: number; rx: number; ry: number }> = {
  rit: { cx: 11.5, cy: 34, rx: 7.5, ry: 17 },
  config: { cx: 11.5, cy: 75, rx: 6.5, ry: 9.5 },
  rochester: { cx: 88.5, cy: 29, rx: 7.5, ry: 12 },
  'bay-area': { cx: 88.5, cy: 60, rx: 6.5, ry: 7 },
  elsewhere: { cx: 88.5, cy: 84, rx: 6.5, ry: 4 },
};

/**
 * A photo's size by its rank in the cluster, as a multiple of the resting
 * size: the centre piece, the two beside it, the next ring, and everything
 * after. A small chapter's centre piece is held back so it does not outweigh
 * a bigger chapter's.
 */
function rankSize(rank: number, count: number): number {
  if (rank === 0) return count >= 8 ? 1.55 : 1.3;
  if (rank <= 2) return 1.05;
  if (rank <= 5) return 0.8;
  return 0.6;
}

/** The golden angle: successive points on a spiral never line up into spokes. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

type ClusterSpot = { pos: { left: string; top: string }; size: number; rank: number };

function chapterSpots(ids: string[]): Map<string, ClusterSpot> {
  const out = new Map<string, ClusterSpot>();
  for (const { id: chapter } of CHAPTERS) {
    const mine = ids.filter((id) => chapterOf(id) === chapter);
    const { cx, cy, rx, ry } = CHAPTER_CLUSTERS[chapter];
    // Each visit turns the whole cluster a different way; the order outward stays.
    const turn = Math.random() * Math.PI * 2;
    mine.forEach((id, rank) => {
      const reach = mine.length > 1 ? Math.sqrt(rank / (mine.length - 1)) : 0;
      const angle = turn + rank * GOLDEN_ANGLE;
      out.set(id, {
        pos: {
          left: `${(cx + rx * reach * Math.cos(angle)).toFixed(1)}%`,
          top: `${(cy + ry * reach * Math.sin(angle)).toFixed(1)}%`,
        },
        size: rankSize(rank, mine.length),
        rank,
      });
    });
  }
  return out;
}

/**
 * A third way to lay the library out: honeycombs — one in each side band, or
 * with chapters on, one per chapter — each seen through a lens — the way a watch shows its apps. The photo under the lens
 * is the biggest and the ones around it fall away in size; with the cursor
 * elsewhere the lens rests on the middle of the band, and over a band it
 * follows the cursor.
 *
 * The lattice below is only where each photo sits before the lens. The lens
 * itself is in TourStage (see the honeycomb effect) and moves the photos as
 * well as sizing them, so a big one pushes its neighbours aside instead of
 * covering them.
 */
/** A resting photo's height in the honeycomb before the lens, in pixels — a little under FLOAT_MAX's 84. */
const HEX_CELL = 71;
/**
 * Padding between a honeycomb's outermost cells and the edge its lens works
 * against, in cells: room for the outer photos to sit in.
 */
const HEX_MARGIN = 0.6;

/**
 * One photo's cell. A honeycomb is built around a centre given as a
 * percentage of the stage, and the cell is so many pitches across and down
 * from it — in pitches rather than pixels so the Spacing dial can tighten or
 * loosen a honeycomb without rebuilding it. `cols` and `rows` are the whole
 * honeycomb's, for working out how far it reaches.
 */
type HexSpot = { region: string; cx: number; cy: number; ux: number; uy: number; cols: number; rows: number };

/** A honeycomb of `ids` around (cx, cy): rows of `cols` and one fewer, offset from each other. */
function honeycomb(region: string, ids: string[], cx: number, cy: number, out: Map<string, HexSpot>) {
  const cols = ids.length >= 4 ? 3 : 2;
  const cells: { ux: number; uy: number }[] = [];
  let rows = 0;
  for (; cells.length < ids.length; rows++) {
    const n = rows % 2 === 0 ? cols : cols - 1;
    for (let i = 0; i < n; i++) cells.push({ ux: i - (n - 1) / 2, uy: rows });
  }
  for (const c of cells) c.uy -= (rows - 1) / 2;
  // Nearest the middle first, so the photos listed first get the middle.
  cells.sort((a, b) => Math.hypot(a.ux, a.uy) - Math.hypot(b.ux, b.uy));
  ids.forEach((id, i) => out.set(id, { region, cx, cy, ...cells[i], cols, rows }));
}

/** The two layouts a honeycomb comes in: one per side band, or one per chapter. */
function hexSpots(ids: string[]): { bands: Map<string, HexSpot>; chapters: Map<string, HexSpot> } {
  const bands = new Map<string, HexSpot>();
  honeycomb('left', ids.filter((_, i) => i % 2 === 0), 12, 49.5, bands);
  honeycomb('right', ids.filter((_, i) => i % 2 === 1), 88, 49.5, bands);
  const chapters = new Map<string, HexSpot>();
  for (const { id } of CHAPTERS) {
    const { cx, cy } = CHAPTER_CLUSTERS[id];
    honeycomb(id, ids.filter((photo) => chapterOf(photo) === id), cx, cy, chapters);
  }
  return { bands, chapters };
}

/** Where a cell is on the stage, as the card's `left` and `top`. */
function hexSlot(spot: HexSpot, spacing: number) {
  const { ox, oy } = hexPx(spot, spacing);
  return { left: `calc(${spot.cx}% + ${ox.toFixed(1)}px)`, top: `calc(${spot.cy}% + ${oy.toFixed(1)}px)` };
}

/** A cell's offset from its honeycomb's centre, and how far that honeycomb reaches, in pixels. */
function hexPx(spot: HexSpot, spacing: number) {
  const pitch = HEX_CELL * spacing;
  return {
    ox: spot.ux * pitch,
    oy: spot.uy * pitch,
    halfW: ((spot.cols - 1) / 2) * pitch + HEX_CELL * HEX_MARGIN,
    halfH: ((spot.rows - 1) / 2) * pitch + HEX_CELL * HEX_MARGIN,
  };
}

/**
 * Where the lens has put each resting photo, in screen pixels, as of the last
 * frame. TourCard reads this when a photo sets off for the centre: its own
 * last measurement is from before the lens moved it.
 */
type Box = { left: number; top: number; width: number; height: number };
const liveBoxes = new WeakMap<Element, Box>();

/** Gap between one card's entrance and the next — 38 of them is ~2.3s end to end. */
const STAGGER_MS = 60;
const POP_MS = 140;
const TRAVEL_MS = 640;
/** Scale the pop grows from, relative to the entrance pose. */
const POP_FROM = 0.4;
/**
 * Every card's HEIGHT at the entrance pose, whatever its shape — landscape,
 * portrait and square all pop in equally tall, so there's one constant size
 * across the whole run instead of each photo's own proportions deciding it.
 */
const ENTRANCE_HEIGHT = 360;
/** Centre of the middle space, as a fraction of the stage — matches `.tour-focus { left: 50%; top: 38% }`. */
const FOCUS_CENTER = { x: 0.5, y: 0.38 };

/**
 * The Figma frame's own boxes (723×542 focus, 209×156 satellite) — no longer
 * a fixed shape every photo gets cropped into, but the bounding box each
 * photo's own aspect ratio now fits inside, landscape/portrait/square alike.
 * `vw` keeps the same viewport-relative cap the old fixed-ratio CSS classes
 * had, so a photo doesn't just get to be arbitrarily large on a wide screen.
 *
 * FLOAT_MAX is well under the Figma satellite's 209×156: that size was for 5
 * cards, and the whole library at it doesn't fit in the side bands. Sized to
 * one cloud cell (see CLOUD_X), so neighbours graze rather than stack.
 */
const FOCUS_MAX = { w: 723, h: 542, vw: 56.5 };
const FLOAT_MAX = { w: 112, h: 84, vw: 7.8 };

/**
 * The teal "casing" (border + glow) at full size, for a photo that fills its
 * whole max box. `.tour-card--focus`/`--float` used to hardcode these as a
 * fixed border-width and box-shadow, which was fine when every card was the
 * same fixed shape — once each photo sizes itself to its own aspect ratio, a
 * narrow portrait card can be a fraction of its box's width, and the same
 * fixed-px border reads as disproportionately thick on it: correct in
 * absolute pixels, wrong relative to how much photo it's actually framing.
 * Scaled by CASING_MIN_SCALE at minimum so a very narrow photo still gets a
 * visible casing rather than a hairline.
 */
const CASING = {
  focus: { border: 7, glow: 7 },
  float: { border: 4, glow: 4 },
};
const CASING_MIN_SCALE = 0.55;

/**
 * How long PIP has to go quiet before an unpunctuated tail is classified on
 * its own. Was 600ms, which is shorter than the pauses PIP takes at commas
 * and before "and" — so it cut sentences in half ("…like Vincent" / "and
 * Jordan Singer."), and a half sentence rarely names enough to match a photo.
 */
const TAIL_FLUSH_MS = 1500;
/**
 * A tail shorter than this is a fragment ("And for ItinerAI,"), not a
 * sentence — it waits for more words instead of being classified alone,
 * unless PIP stays quiet for TAIL_GIVE_UP_MS, which means the answer ended
 * on it.
 */
const TAIL_MIN_WORDS = 4;
const TAIL_GIVE_UP_MS = 4000;

/**
 * How long each photo holds the centre when one sentence mentions several —
 * long enough to register, short enough that three fit inside the sentence
 * or two it takes PIP to move on.
 */
const SPOTLIGHT_HOLD_MS = 1800;

/**
 * Longer than /live's 5s on purpose. That limit is tuned for fast back-and-forth
 * turn-taking; a visitor here is often just listening quietly to a full answer,
 * and silence while listening is not the same signal as silence in a chat.
 */
const IDLE_LIMIT = 25;

/**
 * How long PIP dozes after the conversation goes quiet. The session is closed
 * by then, so this costs nothing — but the microphone is still open, and a
 * voice in the room opens a new session. Long enough to think of the next
 * question; short enough that a television cannot keep the tour awake all
 * evening. After it, waking takes a key or a click.
 */
const DOZE_MS = 2 * 60 * 1000;
/**
 * A wake that nobody followed with a question was a noise, not a visitor. Two
 * in a row and PIP stops listening for more.
 */
const MAX_EMPTY_WAKES = 2;

/** PIP's trip from the start card to the dock — see the travel effect in TourStage. */
const PIP_TRAVEL_MS = 1000;
/** How finely the curve is cut into straight steps. At this many they cannot be told from a curve. */
const PIP_TRAVEL_STEPS = 32;

/** How many times smaller than the photo its glow is drawn and blurred — see the glow effect in TourStage. */
const GLOW_SCALE = 12;
/** Matches the opacity transition on .tour-glow: the old glow is gone before the new one is drawn. */
const GLOW_SWAP_MS = 350;

/** How long the tab may be out of sight before the session is closed. */
const HIDDEN_GRACE_MS = 5000;

/** Shows and hides the readouts and event log. Does nothing in a production build. */
const LAB_KEY = '`';

/**
 * Mapped here, not derived from api/mood's map, because this is a different
 * character reacting to different material — its own answer, not a visitor's
 * voice. Kept small on purpose: a guide's face should read as attentive, not
 * as a puppet show.
 */
const MOOD_REACTIONS: Record<string, Reaction> = {
  'mood:excited': { pose: 'starstruck', duration: 1.6, arousal: 0.95, volume: 0 },
  'mood:curious': { pose: 'curious', duration: 1.8, arousal: 0.85, volume: 0 },
  'mood:concerned': { pose: 'suspicious', duration: 1.6, arousal: 0.75, volume: 0 },
  'mood:calm': { pose: 'idle', duration: 1.4, arousal: 0.5, volume: 0 },
};

/**
 * The visitor's hand, as PIP sees it. Hover is a glance and nothing else —
 * sweeping the cursor across 38 photos must not become 38 faces and sounds.
 * A click is the visitor pointing, which earns a real reaction. Neither needs
 * a live session: noticing what someone points at is PIP's body, not its mind.
 */
const POINT_REACTIONS: Record<string, Reaction> = {
  'photo:hover': { look: 1.2 },
  'photo:point': { pose: 'curious', duration: 1.6, arousal: 0.9, look: 2.4, volume: 0.4 },
};

const REACTIONS = { ...MOOD_REACTIONS, ...POINT_REACTIONS };

/**
 * How long PIP waits, after the visitor points, for them to ask something
 * themselves. Pointing and then saying "who's that?" is the natural gesture,
 * so PIP must not talk over it — but pointing in silence is also a question,
 * and a character that just stares back reads as broken.
 */
const POINT_ASK_MS = 1500;

/** A less certain read gets a smaller, shorter reaction. */
function byConfidence(base: Reaction, p: number): Reaction {
  const k = 0.45 + 0.55 * Math.max(0, Math.min(1, p));
  return { ...base, duration: (base.duration ?? 1.2) * k, arousal: (base.arousal ?? 0.8) * k };
}

/** One turn of the conversation: what the visitor was heard to say, or what PIP said. */
/** A 16px line icon for the stage's buttons — drawn in the text's own colour. */
function Icon({ d }: { d: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

type Line = { who: 'you' | 'pip'; text: string };

/**
 * The sentence PIP is on, out of everything it has said this turn — what the
 * caption shows. A sentence that has just ended stays up until the next one
 * has a first word.
 */
function currentSentence(text: string): string {
  const parts = text.match(/[^.!?]+(?:[.!?]+["')\]]*|$)/g) ?? [];
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i].trim();
    if (part) return part;
  }
  return text.trim();
}
type Photo = { id: string; path: string; width: number; height: number };
/**
 * `order` is the photo's place in the entrance stagger; `pos` is its home in
 * the cloud. Both are assigned once, at page load, and never change — the
 * focus photo keeps its `pos` while it's centred, so returning is a trip back
 * to the same spot rather than to wherever there happens to be room.
 */
type Placed = Photo & {
  order: number;
  pos: { left: string; top: string };
  /** Its home, size and rank when the library is laid out by chapter. */
  cluster: ClusterSpot;
  /** Its cell in a side band's honeycomb and in its chapter's, before the lens. */
  hex: { band: HexSpot; chapter: HexSpot };
  chapter: ChapterId;
};

/**
 * The whole library, placed. Arrives on the visitor's first click or
 * keypress (see `arrived` in Tour): each card pops in at centre, one after
 * another in `order`, then travels to its spot (see TourCard's entrance).
 *
 * Built on first call, which only ever happens in the browser, after that
 * first interaction: the spots are random, so a server render would never
 * match the client's.
 * Cached for the rest of the page's life, so a re-render doesn't reshuffle.
 */
let cloud: Placed[] | null = null;
function getCloud(): Placed[] {
  if (!cloud) {
    const spots = cloudPositions(TOUR_IMAGES.length);
    const byChapter = chapterSpots(TOUR_IMAGES.map((img) => img.id));
    const hex = hexSpots(TOUR_IMAGES.map((img) => img.id));
    cloud = TOUR_IMAGES.map((img, i) => ({
      id: img.id,
      path: img.path,
      width: img.width,
      height: img.height,
      order: i,
      pos: spots[i],
      cluster: byChapter.get(img.id) ?? { pos: spots[i], size: 1, rank: i },
      chapter: chapterOf(img.id),
      hex: { band: hex.bands.get(img.id)!, chapter: hex.chapters.get(img.id)! },
    }));
  }
  return cloud;
}

/** A slight overshoot past full size — reads as a pop, not a fade. */
const POP_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const TRAVEL_EASE = 'cubic-bezier(0.77, 0, 0.175, 1)';

/**
 * A photo is one element for its whole life on stage, so changing place
 * (satellite ↔ focus) is a move, not a remount.
 *
 * First time it appears: nothing, tiny, at centre — invisible for exactly as
 * long as its stagger wait says, which is what actually makes a set of
 * these read as arriving in waves rather than all snapping in at once and
 * only starting to move at staggered times. Then it pops (scales up, upright,
 * no offset) to its entrance pose, centred exactly on the middle space, and
 * from there travels — scale and translation together — straight to its
 * slot. After that first arrival, only the travel, on every place change.
 */
function TourCard({
  photo,
  place,
  slot,
  order,
  z,
  pointed,
  tone,
  size = 1,
  square = false,
  onPoint,
  onHover,
}: {
  photo: Photo;
  place: 'focus' | 'float';
  slot?: { left: string; top: string };
  /** Place in the entrance stagger — its wait is `order × STAGGER_MS`. */
  order: number;
  /** Stacking order within the card layer — higher sits on top. */
  z: number;
  /** The visitor is pointing at this one — clicking again lets it go. */
  pointed: boolean;
  /**
   * How a resting photo stands to the one in the centre: `kin` is from the
   * same chapter and stays lit, `dim` is not and steps back.
   */
  tone?: 'kin' | 'dim';
  /** How big a resting photo is, as a multiple of FLOAT_MAX. The centre is always FOCUS_MAX. */
  size?: number;
  /** Fit the resting photo in a square box rather than FLOAT_MAX's landscape one. */
  square?: boolean;
  onPoint: (id: string) => void;
  onHover: (el: Element) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const booted = useRef(false);
  const prevBox = useRef<DOMRect | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.style.transition = 'none';
    el.style.transform = 'none';
    const next = el.getBoundingClientRect();
    // The honeycomb sizes a resting photo with the `scale` property, and a
    // transform is applied inside that scale: a move of 100px on screen has to
    // be written as 100 / scale.
    const lens = parseFloat(getComputedStyle(el).scale) || 1;

    if (reduced) {
      booted.current = true;
      prevBox.current = next;
      el.style.opacity = '1';
      el.style.transform = '';
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    const play = (from: string, to: string, ms: number, ease: string) => {
      el.style.transition = 'none';
      el.style.transform = from;
      requestAnimationFrame(() => {
        if (cancelled) return;
        el.style.transition = `transform ${ms}ms ${ease}`;
        el.style.transform = to;
      });
    };

    if (!booted.current) {
      booted.current = true;
      const stage = el.closest('.tour-stage')?.getBoundingClientRect();
      const fx = next.left + next.width / 2;
      const fy = next.top + next.height / 2;
      const cx = stage ? stage.left + stage.width * FOCUS_CENTER.x : fx;
      const cy = stage ? stage.top + stage.height * FOCUS_CENTER.y : fy;
      const dx = (cx - fx) / lens;
      const dy = (cy - fy) / lens;
      const s = next.height > 0 ? ENTRANCE_HEIGHT / next.height : 1;
      // Upright and centred throughout: no rotation, no sideways kick.
      const staged = `translate(${dx}px, ${dy}px) scale(${s})`;
      // Same spot as `staged`, just smaller — a pop needs a "before" to grow
      // out of, not just a jump-cut.
      const tiny = `translate(${dx}px, ${dy}px) scale(${s * POP_FROM})`;

      // Invisible and tiny immediately, so the stagger wait below is a real
      // wait — the card hasn't arrived yet — not a wait before it starts
      // moving from something already on screen.
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = tiny;
      let landed = false;
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          // The pop: tiny and invisible to full presence at centre.
          requestAnimationFrame(() => {
            if (cancelled) return;
            // Silent until the visitor has clicked or pressed a key — the
            // browser blocks audio before that, and playRecipe no-ops.
            playRecipe(PHOTO_POP);
            el.style.transition = `transform ${POP_MS}ms ${POP_EASE}, opacity ${POP_MS}ms ease-out`;
            el.style.opacity = '1';
            el.style.transform = staged;
          });
          timers.push(
            window.setTimeout(() => {
              if (cancelled) return;
              landed = true;
              play(staged, '', TRAVEL_MS, TRAVEL_EASE);
            }, POP_MS),
          );
        }, order * STAGGER_MS),
      );
      prevBox.current = next;
      return () => {
        cancelled = true;
        if (!landed) booted.current = false;
        timers.forEach((t) => window.clearTimeout(t));
      };
    }

    // In the honeycomb a resting photo keeps moving after it was last
    // measured here — the lens follows the cursor — so where it really is
    // comes from the lens (see liveBoxes), not from the last measurement.
    const prev = liveBoxes.get(el) ?? prevBox.current;
    liveBoxes.delete(el);
    prevBox.current = next;
    if (!prev) return;
    const dx = (prev.left + prev.width / 2 - (next.left + next.width / 2)) / lens;
    const dy = (prev.top + prev.height / 2 - (next.top + next.height / 2)) / lens;
    const s = next.width > 0 ? prev.width / next.width : 1;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(s - 1) < 0.02) return;
    play(`translate(${dx}px, ${dy}px) scale(${s})`, '', TRAVEL_MS, TRAVEL_EASE);
    return () => {
      cancelled = true;
    };
  }, [place, slot?.left, slot?.top, order, size, square]);

  // Fit each photo's own shape inside the same max box the fixed-ratio class
  // used to force everything into — landscape, portrait, and square all keep
  // their real proportions instead of getting cropped to one shape.
  const max =
    place === 'focus'
      ? FOCUS_MAX
      : // A honeycomb cell is as wide as it is tall, so a landscape photo may
        // not be wider there than a portrait one is tall.
        {
          w: (square ? FLOAT_MAX.h : FLOAT_MAX.w) * size,
          h: FLOAT_MAX.h * size,
          vw: FLOAT_MAX.vw * (square ? FLOAT_MAX.h / FLOAT_MAX.w : 1) * size,
        };
  const ratio = photo.width > 0 && photo.height > 0 ? photo.width / photo.height : max.w / max.h;
  const fitWidth = Math.min(max.w, max.h * ratio);
  const fitHeight = fitWidth / ratio;
  // How much smaller than its box this photo is, in whichever dimension is
  // actually constraining it — 1 for a photo that already fills the box
  // (most landscapes), well under 1 for a narrow portrait.
  const casingScale = Math.max(
    CASING_MIN_SCALE,
    Math.min(fitWidth / max.w, fitHeight / max.h),
  );
  const casing = place === 'focus' ? CASING.focus : CASING.float;
  const borderPx = casing.border * casingScale;
  const glowPx = casing.glow * casingScale;

  // Rounded once, here — next/image requires integer width/height props, and
  // the border/shadow math above already finished using the exact values.
  const w = Math.max(1, Math.round(fitWidth));
  const h = Math.max(1, Math.round(fitHeight));

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      data-id={photo.id}
      aria-label={pointed ? `Stop pointing at ${photoName(photo.id)}` : `Point at ${photoName(photo.id)}`}
      aria-pressed={pointed}
      onClick={() => onPoint(photo.id)}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        // Space on the window starts and ends the tour — pressing it on a
        // photo means the photo.
        e.stopPropagation();
        onPoint(photo.id);
      }}
      onPointerEnter={(e) => onHover(e.currentTarget)}
      className={`tour-card ${place === 'focus' ? 'tour-card--focus' : 'tour-card--float'} ${
        place === 'float' && tone ? `tour-card--${tone}` : ''
      }`}
      style={{
        ...(place === 'float' && slot ? { left: slot.left, top: slot.top } : {}),
        width: `min(${max.vw}vw, ${w}px)`,
        // --fz is the honeycomb's: under the lens the bigger photo is on top.
        zIndex: `var(--fz, ${z})`,
        borderWidth: `${borderPx.toFixed(2)}px`,
        boxShadow: `0 0 ${glowPx.toFixed(2)}px ${glowPx.toFixed(2)}px var(--tour-teal-glow)`,
      }}
    >
      {/*
       * Explicit width/height rather than `fill` + CSS aspect-ratio — the
       * standard responsive-image technique (intrinsic size as attributes,
       * `w-full h-auto` lets the box shrink) instead of one that depends on
       * how a browser reconciles `aspect-ratio` against a `min()`-derived
       * width. A card whose casing visibly didn't match its photo pointed
       * here; this removes that combination rather than chasing which half
       * of it was responsible.
       */}
      <Image
        src={photo.path}
        alt=""
        width={w}
        height={h}
        // A thumbnail still enters ENTRANCE_HEIGHT tall — up to ~640px wide
        // for the widest photo — so it loads at that size rather than its
        // resting one, or it's blurry mid-pop.
        sizes={place === 'focus' ? `${max.vw}vw` : '640px'}
        className="block h-auto w-full object-contain"
      />
      {place === 'focus' && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(168deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 26%, transparent 46%)',
          }}
        />
      )}
    </div>
  );
}

export default function TourStage() {
  const char = useRef<CharacterHandle>(null);
  const session = useRef<LiveSession | null>(null);

  const [state, setState] = useState('idle');
  const [log, setLog] = useState<string[]>([]);
  const [fault, setFault] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [micId, setMicId] = useState('');
  const [mood, setMood] = useState('neutral');
  const [moodP, setMoodP] = useState<number | null>(null);
  /**
   * The whole visit, across sessions. A session ends whenever the visitor
   * pauses or goes quiet, and the next one is told what is in here so it can
   * carry on (see historyInstructions in context.ts).
   */
  const [lines, setLines] = useState<Line[]>([]);
  const linesRef = useRef<Line[]>([]);
  /** How many turns there were when this session began: the caption only shows newer ones. */
  const [captionFrom, setCaptionFrom] = useState(0);
  /**
   * Dozing: the session is closed, the microphone is still open, and a voice
   * will open a new one (see wake-mic.ts). Stays true through that wake, until
   * the new session is live.
   */
  const [dozing, setDozing] = useState(false);
  const dozingRef = useRef(false);
  const wake = useRef<WakeMic | null>(null);
  const dozeTimer = useRef<number | undefined>(undefined);
  /** When the doze that is running, or the next one, has to end. */
  const dozeUntil = useRef(0);
  const emptyWakes = useRef(0);
  /** Whether this session was opened by a voice, and whether anyone then said anything. */
  const wokenByVoice = useRef(false);
  const heardVisitor = useRef(false);
  const drowsy = useRef<(() => void) | null>(null);
  const dozeRef = useRef<() => void>(() => {});
  const [idleIn, setIdleIn] = useState<number | null>(null);
  /**
   * Every photo stays on stage for the whole visit, across questions — a
   * spotlight only changes which one is centred.
   */
  /**
   * Whether the photos have been called in. Waits for the visitor's first
   * click or keypress rather than page load, because each card pops in with
   * a sound and browsers block audio until an interaction — a page-load
   * entrance would always play silent.
   */
  const [arrived, setArrived] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  /**
   * The photo the visitor is pointing at, if any. While it's set, it owns the
   * centre: PIP's own sentence-matched spotlights are held back, or the answer
   * to "who's that?" would carry the photo away mid-question. `answered`
   * flips once PIP has spoken since the point, and the visitor's next finished
   * question after that lets go — they've moved on.
   */
  const [pointedId, setPointedId] = useState<string | null>(null);
  const point = useRef<{ id: string; answered: boolean } | null>(null);
  /** Whether the visitor has started talking since they pointed. */
  const pointAsked = useRef(false);
  const pointOfferTimer = useRef<number | undefined>(undefined);
  const stageRef = useRef<HTMLElement>(null);
  const [silent, setSilent] = useState(false);
  const [spent, setSpent] = useState(0);
  const [liveSeconds, setLive_] = useState(0);
  const [lastClose, setLastClose] = useState<string | null>(null);
  /** Whether the whole conversation so far is open over the stage. */
  const [history, setHistory] = useState(false);
  /** The builder's readouts and event log — see LAB_KEY. */
  const [lab, setLab] = useState(false);
  /**
   * Two directions for the stage, switchable while the tour runs so they can
   * be judged against the current look with real photos and a live PIP.
   */
  const look = useDialKit('Tour look', {
    darkRoom: true,
    chapters: true,
    // The watch-style grid, biggest under the cursor: one honeycomb per side band, or per chapter with chapters on.
    honeycomb: true,
    // How far apart a honeycomb's cells are, in photo heights. Under 1 the photos start to touch.
    spacing: [0.7, 0.7, 1.4, 0.02],
    // How strong the honeycomb's lens is: 0 is a plain grid, 1 makes the middle photo twice its size.
    lens: [0.7, 0, 2, 0.1],
    // How strongly the photo in the centre glows with its own colours, under its teal halo.
    photoGlow: [0.7, 0, 1, 0.05],
    // How much of a tube each photo is shown on: scanlines, phosphor, dark corners.
    photoCrt: [0.7, 0, 1, 0.05],
  });
  const glow = useRef<HTMLCanvasElement>(null);
  const captionText = useRef<HTMLParagraphElement>(null);
  const pipBody = useRef<HTMLDivElement>(null);
  /** Where PIP was the last time it was at rest — the start of its next trip. */
  const pipBox = useRef<DOMRect | null>(null);
  const historyRef = useRef(false);

  const audio = useRef<HTMLAudioElement>(null);
  const listening = useRef<(() => void) | null>(null);
  const thinking = useRef<(() => void) | null>(null);
  const speaking = useRef<(() => void) | null>(null);
  const detachHearing = useRef<(() => void) | null>(null);
  const detachVoice = useRef<(() => void) | null>(null);
  const micRaf = useRef(0);
  const tourModel = useRef(createTourClassifier());
  const userUtterance = useRef('');
  const modelUtterance = useRef('');
  const modelFlushTimer = useRef<number | undefined>(undefined);
  /** When PIP's last words arrived — how long a held tail has been waiting. */
  const lastModelDelta = useRef(0);
  /** The visitor's last full question, giving a lone answer-sentence its context. */
  const lastQuestion = useRef('');
  const lastVoice = useRef(0);
  const startedAt = useRef(0);
  /** How long the server allows this session to run — see api/tour/session. */
  const maxSeconds = useRef(Infinity);
  /** Photos picked for this visitor — brought to the centre as PIP says hello. */
  const welcomePhotos = useRef<string[]>([]);
  const displayScroll = useRef<HTMLDivElement>(null);
  const connecting = useRef(false);
  const connectRef = useRef<(opts?: { byVoice?: boolean }) => Promise<void>>(async () => {});
  const disconnectRef = useRef<(opts?: { keepMic?: boolean }) => void>(() => {});
  const stateRef = useRef(state);

  const release = (r: React.RefObject<(() => void) | null>) => {
    r.current?.();
    r.current = null;
  };

  /** Words keep joining the turn they belong to; a change of speaker starts the next one. */
  const appendLine = useCallback((who: Line['who'], delta: string) => {
    if (!delta) return;
    setLines((prev) => {
      const last = prev[prev.length - 1];
      if (last?.who === who) return [...prev.slice(0, -1), { who, text: last.text + delta }];
      return [...prev, { who, text: delta }];
    });
  }, []);

  const emitMood = useCallback((next: string, p: number | null) => {
    setMood(next);
    setMoodP(p);
    const base = MOOD_REACTIONS[`mood:${next}`];
    if (!base) return;
    char.current?.director.on(`mood:${next}`, p == null ? base : byConfidence(base, p));
    char.current?.emit({ type: `mood:${next}` });
  }, []);

  /**
   * Spotlights a sentence's photos in turn: each travels from its spot in the
   * cloud to the centre, holds for SPOTLIGHT_HOLD_MS, then hands the centre
   * to the next — the one before travelling back to its own spot. The last
   * stays until the next match. Every photo is already on stage, so this
   * never adds or evicts one — it only moves the focus.
   *
   * A newer sentence's photos replace whatever of an older one's run hasn't
   * played yet: they're about what PIP is saying now.
   */
  const spotlightTimer = useRef<number | undefined>(undefined);
  const emitImages = useCallback((ids: string[]) => {
    const queue = ids.filter((id) => IMAGE_BY_ID.has(id));
    if (queue.length === 0 || point.current) return;
    window.clearTimeout(spotlightTimer.current);
    const step = (i: number) => {
      setFocusId(queue[i]);
      if (i + 1 < queue.length) {
        spotlightTimer.current = window.setTimeout(() => step(i + 1), SPOTLIGHT_HOLD_MS);
      }
    };
    step(0);
  }, []);

  const releasePoint = useCallback(() => {
    point.current = null;
    setPointedId(null);
    window.clearTimeout(pointOfferTimer.current);
  }, []);

  /**
   * Tells PIP what "this" means. A fact, not a prompt: thinking.append never
   * makes the model talk, so the visitor still gets to ask first.
   */
  const sharePoint = useCallback((id: string) => {
    const img = IMAGE_BY_ID.get(id);
    if (!img || session.current?.state !== 'live') return;
    session.current.think(
      `The visitor is pointing at a photo on screen: ${img.description}. ` +
        `When they say "this", "that", "here" or "who's that", this photo is what they mean.`,
    );
  }, []);

  /**
   * Pointing: clicking a photo brings it to the centre and holds it there,
   * PIP turns to look, and a live PIP is told what the visitor means by
   * "this". Clicking the pointed photo again lets it go back to the cloud.
   *
   * Pointing in silence is a question too. If the visitor hasn't started
   * talking by POINT_ASK_MS, PIP brings it up itself — through the same
   * commentary path the greeting uses.
   */
  const pointAt = useCallback(
    (id: string) => {
      if (point.current?.id === id) {
        releasePoint();
        setFocusId(null);
        setLog((l) => [`tour.point released ${id}`, ...l].slice(0, 40));
        return;
      }
      const img = IMAGE_BY_ID.get(id);
      if (!img) return;

      window.clearTimeout(spotlightTimer.current);
      point.current = { id, answered: false };
      setPointedId(id);
      setFocusId(id);
      setLog((l) => [`tour.point ${id}`, ...l].slice(0, 40));

      // Look where the photo is going, not where it was — PIP watches it land.
      const stage = stageRef.current?.getBoundingClientRect();
      const look = stage && {
        x: ((stage.left + stage.width * FOCUS_CENTER.x) / window.innerWidth) * 2 - 1,
        y: ((stage.top + stage.height * FOCUS_CENTER.y) / window.innerHeight) * 2 - 1,
      };
      char.current?.emit({ type: 'photo:point', look: look || undefined });

      if (session.current?.state !== 'live') return;
      sharePoint(id);
      pointAsked.current = false;
      window.clearTimeout(pointOfferTimer.current);
      pointOfferTimer.current = window.setTimeout(() => {
        if (pointAsked.current || point.current?.id !== id) return;
        setLog((l) => [`tour.point offer ${id}`, ...l].slice(0, 40));
        session.current?.speak(
          `The visitor just pointed at a photo without saying anything: ${img.description}. ` +
            'Tell them the story behind it in a sentence or two, then invite them to ask more.',
        );
      }, POINT_ASK_MS);
    },
    [releasePoint, sharePoint],
  );

  const glanceAt = useCallback((el: Element) => {
    char.current?.emit({ type: 'photo:hover', look: lookAt(el) });
  }, []);

  /**
   * One Jev call per sentence PIP actually finished saying.
   *
   * Split out from the event switch below because a sentence can surface two
   * ways: cleanly, when a delta ends in punctuation, or by timeout, when
   * GPT-Live goes quiet mid-buffer without ever sending one — a real gap,
   * since output deltas are not guaranteed to land as tidy per-sentence
   * chunks with trailing punctuation the way a written reply would.
   */
  const classifySentence = useCallback(
    (said: string) => {
      const text = said.trim();
      if (!text) return;
      void tourModel.current.classify(text, lastQuestion.current).then((read) => {
        if (!read) return;
        emitMood(read.mood, read.moodP);
        // Not before the visitor has said something. The greeting lists what
        // PIP can talk about — "his background, how he works, the moments in
        // the photos" — and that sentence matched two or three photos at
        // random, which came to the centre before anyone had asked anything.
        if (heardVisitor.current) emitImages(read.images.map((img) => img.id));
        setLog((l) =>
          [
            `tour.answer mood=${read.mood} images=${read.images.map((img) => `${img.id}(${img.p.toFixed(2)})`).join(',') || 'none'} "${text.slice(0, 60)}"`,
            ...l,
          ].slice(0, 40),
        );
      });
    },
    [emitMood, emitImages],
  );

  /**
   * The safety net for whatever's left in the buffer with no terminal
   * punctuation — filler, an abbreviation, or a reply GPT-Live never
   * punctuates the tail of. Without it a short reply's tail is never
   * classified at all. Runs once PIP has been quiet for TAIL_FLUSH_MS; a
   * tail too short to be a sentence holds on (see TAIL_MIN_WORDS).
   */
  const flushModelTail = useCallback(() => {
    const said = modelUtterance.current.trim();
    if (!said) return;
    const quietFor = performance.now() - lastModelDelta.current;
    if (said.split(/\s+/).length < TAIL_MIN_WORDS && quietFor < TAIL_GIVE_UP_MS) {
      modelFlushTimer.current = window.setTimeout(flushModelTail, TAIL_GIVE_UP_MS - quietFor);
      return;
    }
    modelUtterance.current = '';
    classifySentence(said);
  }, [classifySentence]);

  const handleEvent = useCallback(
    (event: LiveEvent) => {
      const { type, ...rest } = event;
      // Deltas aren't logged — the transcript's own, or the backend draft's
      // wrapped in response.event. Dozens arrive per answer, and they pushed
      // every tour.answer line — the ones worth reading — out of the log.
      const inner = (event.event as { type?: unknown } | undefined)?.type;
      const routine = type.endsWith('.delta') || (typeof inner === 'string' && inner.endsWith('.delta'));
      if (!routine) {
        const extra = Object.keys(rest).length ? ` ${JSON.stringify(rest).slice(0, 300)}` : '';
        setLog((l) => [type + extra, ...l].slice(0, 40));
      }

      // A photo pointed at before the tour started still counts — PIP just
      // couldn't be told until now. Only session.started: `ready` also fires
      // on client.connected, before the data channel is open.
      if (type === 'session.started' && point.current) sharePoint(point.current.id);
      // The connection can be heard now: what the visitor said while it was
      // opening goes first.
      if (type === 'session.started') wake.current?.pass();
      // A beat after the greeting starts, so the photo arrives with the hello
      // rather than ahead of it.
      if (type === 'session.started' && welcomePhotos.current.length) {
        const ids = welcomePhotos.current;
        welcomePhotos.current = [];
        window.setTimeout(() => emitImages(ids), 1800);
      }

      const intent = interpret(event);
      if (!intent) return;

      switch (intent.kind) {
        case 'user-active': {
          release(thinking);
          appendLine('you', intent.delta);
          heardVisitor.current = true;
          pointAsked.current = true;
          userUtterance.current += intent.delta;
          lastVoice.current = performance.now();
          if (/[.!?]\s*$/.test(userUtterance.current) || userUtterance.current.length > 140) {
            const question = userUtterance.current.trim();
            lastQuestion.current = question;
            userUtterance.current = '';

            setLog((l) => [`tour.question "${question.slice(0, 80)}"`, ...l].slice(0, 40));

            // PIP has already talked about the pointed photo; a new question
            // is the visitor moving on, so its answer may spotlight again.
            if (point.current?.answered) releasePoint();

            // Photos from the last answer stay on stage — only that answer's
            // in-flight sentence calls are dropped, since its sentences no
            // longer supersede each other on their own. Same for a tail still
            // held in the buffer: it belongs to an answer that's over.
            tourModel.current.cancel();
    window.clearTimeout(spotlightTimer.current);
            window.clearTimeout(modelFlushTimer.current);
            modelUtterance.current = '';
          }
          break;
        }

        case 'model-active': {
          release(thinking);
          release(listening);
          appendLine('pip', intent.delta);
          lastVoice.current = performance.now();
          if (point.current) point.current.answered = true;

          modelUtterance.current += intent.delta;

          /**
           * Pull out every complete sentence in the buffer right away — a
           * single delta can carry more than one when GPT-Live sends output
           * in coarser chunks than one-word-at-a-time, and treating the whole
           * multi-sentence buffer as "one sentence" was diluting relevance:
           * a sentence about the RIT graduation loses its match once it's
           * glued to the next sentence about something else entirely.
           */
          const sentenceEnd = /[^.!?]*[.!?]+\s*/g;
          let cursor = 0;
          for (const m of modelUtterance.current.matchAll(sentenceEnd)) {
            classifySentence(m[0]);
            cursor = (m.index ?? 0) + m[0].length;
          }
          modelUtterance.current = modelUtterance.current.slice(cursor);

          lastModelDelta.current = performance.now();
          window.clearTimeout(modelFlushTimer.current);
          if (modelUtterance.current.trim()) {
            modelFlushTimer.current = window.setTimeout(flushModelTail, TAIL_FLUSH_MS);
          }
          break;
        }

        case 'user-speaking':
          if (intent.active) {
            release(thinking);
            listening.current ??= char.current!.hold('listening', { key: 'tour' });
          } else {
            release(listening);
          }
          break;

        case 'thinking':
          if (intent.active && !speaking.current) {
            thinking.current ??= char.current!.hold('thinking', { key: 'tour' });
          }
          break;

        case 'model-speaking':
          if (intent.active) {
            release(thinking);
            release(listening);
            speaking.current ??= char.current!.hold('speaking', { key: 'tour' });
          } else {
            release(speaking);
          }
          break;

        case 'error':
          setFault(intent.message);
          char.current?.emit({ type: 'action:error' });
          break;

        case 'usage':
          // Live, not cumulative: the session reports its own running total.
          setLive_(intent.seconds);
          break;

        case 'closed':
          release(listening);
          release(thinking);
          release(speaking);
          // Shown because a per-minute bill you cannot see is one you only
          // discover on the dashboard.
          if (intent.seconds != null) {
            setSpent((s) => s + intent.seconds!);
            setLastClose(`${intent.seconds}s · ${intent.reason}`);
          } else {
            setLastClose(String(intent.reason));
          }
          setLive_(0);
          reportEnd();
          break;
      }
    },
    [appendLine, classifySentence, emitImages, flushModelTail, releasePoint, sharePoint],
  );

  /**
   * `byVoice` is a wake from a doze by someone talking — only ever passed by
   * doze() below.
   */
  const connect = useCallback(async (opts?: { byVoice?: boolean }) => {
    const byVoice = opts?.byVoice === true;
    if (connecting.current) return;
    disconnectRef.current({ keepMic: true });
    connecting.current = true;
    window.clearTimeout(dozeTimer.current);
    wokenByVoice.current = byVoice;
    heardVisitor.current = false;
    setFault(null);
    startedAt.current = performance.now();
    lastVoice.current = startedAt.current;
    setCaptionFrom(linesRef.current.length);
    // A photo the visitor is already pointing at stays — it's shared with PIP
    // once the session starts (see handleEvent).
    if (!point.current) setFocusId(null);
    userUtterance.current = '';
    modelUtterance.current = '';
    lastQuestion.current = '';
    window.clearTimeout(modelFlushTimer.current);
    const remembered = micId || localStorage.getItem('tour.micId') || '';
    if (remembered !== micId) setMicId(remembered);

    const s = createLiveSession({
      onEvent: handleEvent,
      onStateChange: (next) => {
        setState(next);
        if (next !== 'live') return;
        setDozing(false);
        release(drowsy);
      },
      microphone: async () => {
        const mic = wake.current ?? (await createWakeMic(remembered || undefined));
        // Ended while the browser was still asking for the microphone.
        if (session.current !== s) {
          if (!wake.current) mic.close();
          throw new Error('The tour was ended before it started.');
        }
        wake.current = mic;
        // Woken by a key or a click: nothing was said, so nothing is held.
        if (!byVoice) mic.pass(true);
        return mic;
      },
      endpoint: '/api/tour/session',
      history: () => linesRef.current,
      onSession: (info) => {
        maxSeconds.current = info.maxSeconds ?? Infinity;
        welcomePhotos.current = info.spotlight ?? [];
        // The cards have to be on stage before one can come forward.
        if (welcomePhotos.current.length) setArrived(true);
      },
      async onLocalStream(stream) {
        detachHearing.current = await char.current!.listenTo(stream, { hold: 'auto', volume: 0.5 });
        const { createVoiceEnvelope } = await import('@shrysp/cameo/sound');
        const env = createVoiceEnvelope(stream);
        const tick = () => {
          setMicLevel(Math.round(env.level() * 20) / 20);
          micRaf.current = requestAnimationFrame(tick);
        };
        micRaf.current = requestAnimationFrame(tick);
      },
      async onRemoteStream(stream) {
        // Playback and mouth-animation analysis tap the same stream
        // independently — muting the element is all silent mode needs.
        if (audio.current) {
          audio.current.srcObject = stream;
          try {
            await audio.current.play();
            handleEvent({ type: 'client.audio.playing' });
          } catch (err) {
            handleEvent({ type: 'client.audio.blocked', message: String(err) });
          }
        }
        detachVoice.current = await char.current!.speakFrom(stream, { hold: 'auto', volume: 0 });
      },
    });
    session.current = s;
    try {
      await s.connect();
    } catch (err) {
      // Not left half-awake with a microphone open.
      if (session.current === s) disconnectRef.current();
      throw err;
    } finally {
      connecting.current = false;
    }
    setMics(await listMicrophones());
  }, [handleEvent, micId]);

  /**
   * Ends the session. `keepMic` is for the two callers that are not ending
   * the visit — connect(), clearing the way for a new session, and doze().
   * Everything else, a click on End included, lets the microphone go.
   */
  const disconnect = useCallback((opts?: { keepMic?: boolean }) => {
    if (opts?.keepMic !== true) {
      window.clearTimeout(dozeTimer.current);
      wake.current?.close();
      wake.current = null;
      emptyWakes.current = 0;
      setDozing(false);
      release(drowsy);
    }
    connecting.current = false;
    cancelAnimationFrame(micRaf.current);
    setMicLevel(0);
    detachHearing.current?.();
    detachHearing.current = null;
    detachVoice.current?.();
    detachVoice.current = null;
    release(listening);
    release(thinking);
    release(speaking);
    if (session.current) reportEnd();
    session.current?.disconnect();
    session.current = null;
    // An answer arriving after the session ends would pull a face at nobody.
    tourModel.current.cancel();
    window.clearTimeout(spotlightTimer.current);
    window.clearTimeout(modelFlushTimer.current);
    window.clearTimeout(pointOfferTimer.current);
  }, []);

  /**
   * The conversation went quiet. The session closes either way; what is
   * decided here is whether PIP keeps an ear open.
   */
  const doze = useCallback(() => {
    // Already asleep: the idle clock ticks on until the old session has said goodbye.
    if (!session.current) return;
    const empty = wokenByVoice.current && !heardVisitor.current;
    emptyWakes.current = empty ? emptyWakes.current + 1 : 0;
    // A wake nobody followed up does not buy more time.
    if (!empty) dozeUntil.current = performance.now() + DOZE_MS;
    const left = dozeUntil.current - performance.now();
    if (!wake.current || emptyWakes.current >= MAX_EMPTY_WAKES || left <= 0) {
      disconnectRef.current();
      return;
    }
    disconnectRef.current({ keepMic: true });
    setDozing(true);
    drowsy.current ??= char.current?.hold('drowsy', { key: 'tour-doze' }) ?? null;
    setLog((l) => [`tour.doze ${Math.round(left / 1000)}s`, ...l].slice(0, 40));
    wake.current.listen(() => {
      setLog((l) => ['tour.wake voice', ...l].slice(0, 40));
      void connectRef.current({ byVoice: true });
    });
    dozeTimer.current = window.setTimeout(() => disconnectRef.current(), left);
  }, []);

  useEffect(() => {
    if (arrived) return;
    let timer: number | undefined;
    // If that first click or keypress is the one that starts the tour, PIP is
    // on its way down through the middle of the stage — exactly where the
    // photos pop in. They wait until it has landed. Checked a tick later, so
    // whichever handler started the tour has run by then; `click` rather than
    // `pointerdown`, which fires before the button has been let go.
    const arrive = () => {
      timer = window.setTimeout(() => {
        timer = window.setTimeout(() => setArrived(true), connecting.current ? PIP_TRAVEL_MS : 0);
      }, 0);
    };
    window.addEventListener('click', arrive, { once: true });
    window.addEventListener('keydown', arrive, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('click', arrive);
      window.removeEventListener('keydown', arrive);
    };
  }, [arrived]);

  useEffect(() => {
    connectRef.current = connect;
    disconnectRef.current = disconnect;
    stateRef.current = state;
    historyRef.current = history;
    linesRef.current = lines;
    dozingRef.current = dozing;
    dozeRef.current = doze;
  }, [connect, disconnect, doze, state, history, lines, dozing]);

  useEffect(() => {
    if (audio.current) audio.current.muted = silent;
  }, [silent]);

  /**
   * A tab left in the background is the likeliest way for a session to be
   * forgotten while it is still being paid for. A few seconds' grace, so a
   * glance at another window does not cut PIP off mid-sentence.
   */
  useEffect(() => {
    let timer: number | undefined;
    const onVisibility = () => {
      window.clearTimeout(timer);
      if (!document.hidden) return;
      timer = window.setTimeout(() => {
        // Dozing too: a tab nobody is looking at should not be listening.
        if (document.hidden && (stateRef.current === 'live' || dozingRef.current)) disconnectRef.current();
      }, HIDDEN_GRACE_MS);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // A tab closed mid-session never reaches disconnect().
  useEffect(() => {
    const onHide = () => {
      if (stateRef.current === 'live') reportEnd();
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, []);

  /**
   * Space opens the session, Escape ends it.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el instanceof HTMLElement && el.matches('input, textarea, select, [contenteditable]')) {
        return;
      }
      if (e.key === LAB_KEY && process.env.NODE_ENV !== 'production') {
        setLab((on) => !on);
      } else if (e.code === 'Space') {
        e.preventDefault(); // or the page scrolls out from under them
        if (stateRef.current === 'live') disconnectRef.current();
        else void connectRef.current();
      } else if (e.key === 'Escape' && historyRef.current) {
        // The open transcript is the nearer thing to close.
        setHistory(false);
      } else if (e.key === 'Escape' && (stateRef.current === 'live' || dozingRef.current)) {
        disconnectRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => disconnect, [disconnect]);

  useEffect(() => {
    const el = displayScroll.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, history]);

  const live = state === 'live';

  useEffect(() => {
    // No setState here: the readout is only shown while live, so clearing it
    // on teardown would be a cascading render for something invisible.
    if (!live) return;
    const id = window.setInterval(() => {
      const left = Math.round(
        idleSecondsLeft({
          now: performance.now(),
          startedAt: startedAt.current,
          lastVoiceAt: lastVoice.current,
          limit: IDLE_LIMIT,
        }),
      );
      setIdleIn(left);
      // The server charged this session for maxSeconds and no more; staying
      // connected past it would be time nobody budgeted for.
      const ranFor = (performance.now() - startedAt.current) / 1000;
      if (ranFor >= maxSeconds.current) {
        setFault('This session reached its time limit. Start the tour again to keep going.');
        disconnectRef.current();
      } else if (left <= 0) dozeRef.current();
    }, 500);
    return () => window.clearInterval(id);
  }, [live]);


  /**
   * The caption fills from the top, so a growing sentence adds lines below
   * and nothing above them moves. Only a sentence longer than the box has
   * room for scrolls, and then by exactly the line it has outgrown.
   */
  useLayoutEffect(() => {
    const el = captionText.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  /**
   * The honeycomb's lens.
   *
   * Each honeycomb — a side band's, or a chapter's — has a point its lens
   * sits on: the cursor while it is over that honeycomb, its middle
   * otherwise, eased from one to the other.
   * Every resting photo is then moved and sized by how far its cell is from
   * that point — a fisheye worked out across and down separately, each
   * against the distance to the honeycomb's own edge on that side. That keeps
   * every photo inside its honeycomb however far the lens is pushed into a corner,
   * and it moves neighbours apart by as much as the middle one grows, so they
   * do not overlap.
   *
   * Written straight to each card as three custom properties (see
   * .tour-stage--hex in tour.css), once a frame and only when they change:
   * this follows the cursor, and 38 photos re-rendering through React on every
   * mouse move would not keep up.
   */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !look.honeycomb || !arrived) return;
    const strength = look.lens;
    const spacing = look.spacing;
    const spots = new Map(getCloud().map((p) => [p.id, look.chapters ? p.hex.chapter : p.hex.band]));
    /** Where each honeycomb's lens is now, by region. */
    const point = new Map<string, { x: number; y: number }>();
    let pointer: { x: number; y: number } | null = null;
    let raf = 0;

    const onMove = (e: PointerEvent) => (pointer = { x: e.clientX, y: e.clientY });
    const onLeave = () => (pointer = null);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);

    /** One axis of the lens: where a cell `d` from the point ends up, and how big it is there. */
    const bend = (d: number, reach: number) => {
      const r = Math.max(1, reach);
      const n = Math.min(1, Math.abs(d) / r);
      const k = strength * n + 1;
      return { at: (Math.sign(d) * r * (strength + 1) * n) / k, size: (strength + 1) / (k * k) };
    };

    const frame = () => {
      const box = stage.getBoundingClientRect();
      // Each honeycomb's edges, and its lens eased one step toward the cursor or back to the middle.
      const regions = new Map<string, { left: number; right: number; top: number; bottom: number; at: { x: number; y: number } }>();
      for (const spot of spots.values()) {
        if (regions.has(spot.region)) continue;
        const { halfW, halfH } = hexPx(spot, spacing);
        const cx = box.left + (box.width * spot.cx) / 100;
        const cy = box.top + (box.height * spot.cy) / 100;
        const edge = { left: cx - halfW, right: cx + halfW, top: cy - halfH, bottom: cy + halfH };
        const inside =
          pointer &&
          pointer.x > edge.left - 24 &&
          pointer.x < edge.right + 24 &&
          pointer.y > edge.top - 24 &&
          pointer.y < edge.bottom + 24;
        const target = inside
          ? {
              x: Math.min(edge.right, Math.max(edge.left, pointer!.x)),
              y: Math.min(edge.bottom, Math.max(edge.top, pointer!.y)),
            }
          : { x: cx, y: cy };
        const was = point.get(spot.region) ?? target;
        const at = { x: was.x + (target.x - was.x) * 0.16, y: was.y + (target.y - was.y) * 0.16 };
        point.set(spot.region, at);
        regions.set(spot.region, { ...edge, at });
      }

      // Read every size first, then write: no layout in between.
      const cards = [...stage.querySelectorAll<HTMLElement>('.tour-card--float')].map((el) => ({
        el,
        spot: spots.get(el.dataset.id ?? ''),
        w: el.offsetWidth,
        h: el.offsetHeight,
      }));
      for (const { el, spot, w, h } of cards) {
        if (!spot) continue;
        const region = regions.get(spot.region)!;
        const { ox, oy } = hexPx(spot, spacing);
        const x = box.left + (box.width * spot.cx) / 100 + ox;
        const y = box.top + (box.height * spot.cy) / 100 + oy;
        const dx = x - region.at.x;
        const dy = y - region.at.y;
        const across = bend(dx, dx > 0 ? region.right - region.at.x : region.at.x - region.left);
        const down = bend(dy, dy > 0 ? region.bottom - region.at.y : region.at.y - region.top);
        const size = Math.min(across.size, down.size);
        const cx = region.at.x + across.at;
        const cy = region.at.y + down.at;
        const next = `${(cx - x).toFixed(1)}px ${(cy - y).toFixed(1)}px ${size.toFixed(3)}`;
        if (el.dataset.lens !== next) {
          el.dataset.lens = next;
          el.style.setProperty('--fx', `${(cx - x).toFixed(1)}px`);
          el.style.setProperty('--fy', `${(cy - y).toFixed(1)}px`);
          el.style.setProperty('--fs', size.toFixed(3));
          // Tightly packed, a big photo's corners can reach its neighbours: it goes on top.
          el.style.setProperty('--fz', String(Math.round(size * 100)));
        }
        liveBoxes.set(el, { left: cx - (w * size) / 2, top: cy - (h * size) / 2, width: w * size, height: h * size });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      for (const el of stage.querySelectorAll<HTMLElement>('.tour-card')) {
        delete el.dataset.lens;
        for (const name of ['--fx', '--fy', '--fs', '--fz']) el.style.removeProperty(name);
        liveBoxes.delete(el);
      }
    };
  }, [look.honeycomb, look.lens, look.spacing, look.chapters, arrived]);

  /**
   * The glow behind the photo in the centre is the photo itself: a copy of
   * it, blurred until only its colours are left, so a sunset glows pink at
   * the top and dark along the horizon rather than one flat colour all round.
   *
   * Blurring a stage-sized layer is the expensive way to get that, and the
   * sharpness of the copy is the one thing nobody will ever see. So the copy
   * is drawn GLOW_SCALE times smaller than the photo — a few dozen pixels
   * across — blurred at that size, and scaled up by the compositor (see
   * .tour-glow). The blur then covers about a hundredth of the pixels, once
   * per photo, and nothing is repainted while it fades.
   */
  useEffect(() => {
    const el = glow.current;
    if (!el) return;
    el.style.opacity = '0';
    if (!focusId || look.photoGlow <= 0) return;
    let img: HTMLImageElement | null = null;
    const paint = () => {
      const card = img?.closest<HTMLElement>('.tour-card');
      if (!img || !card) return;
      try {
        el.width = Math.max(1, Math.round(card.offsetWidth / GLOW_SCALE));
        el.height = Math.max(1, Math.round(card.offsetHeight / GLOW_SCALE));
        el.getContext('2d')?.drawImage(img, 0, 0, el.width, el.height);
        el.style.width = `${el.width}px`;
        el.style.height = `${el.height}px`;
        el.style.opacity = String(look.photoGlow);
      } catch {
        // No glow is a fine way to fail.
      }
    };
    // After the last photo's glow has faded (the opacity transition on
    // .tour-glow), so one never turns into the other in plain sight.
    const swap = window.setTimeout(() => {
      img = stageRef.current?.querySelector<HTMLImageElement>('.tour-card--focus img') ?? null;
      if (!img) return;
      if (img.complete && img.naturalWidth > 0) paint();
      else img.addEventListener('load', paint, { once: true });
    }, GLOW_SWAP_MS);
    return () => {
      window.clearTimeout(swap);
      img?.removeEventListener('load', paint);
    };
  }, [focusId, look.photoGlow]);

  /**
   * Larger than the Figma dock's 108: PIP is what this page is showing, and
   * the caption beside it is now a line of text rather than a display to match.
   */
  const charSize = 152;
  const nativeH = housingHeight(PIP.silhouette);
  const scale = charSize / HOUSING_W;
  const charHeight = nativeH * scale;
  // The published character draws itself inside its own box at any size, so
  // it needs no pulling back into the slot (the local copy hung down-and-right
  // of it, and this page used to compensate).
  const btn = 'tour-btn';

  const lastLine = lines[lines.length - 1];
  const caption =
    lastLine && lines.length > captionFrom
      ? lastLine.who === 'pip'
        ? currentSentence(lastLine.text)
        : lastLine.text.trim()
      : '';
  /** Coming back to a conversation rather than starting one. */
  const paused = lines.length > 0;
  /** Dozing, or paused mid-visit: the stage steps back until PIP is woken. */
  const asleep = !live && state !== 'connecting' && (dozing || paused);
  /**
   * Before the first hello PIP is part of the way in — up in the middle of
   * the stage, above the words — and goes down to its place in the dock as
   * the tour starts.
   */
  const intro = !paused && !live && !dozing && !focusId && state !== 'connecting';

  /**
   * PIP's trip from the start card down to the dock, when `intro` ends.
   *
   * One animation of one transform: a curve from where PIP was to where it
   * now belongs, travelled at a single eased speed. The curve is a quadratic
   * Bézier that leaves down and across at about 45° and comes in almost
   * straight down, so PIP swings out of the middle and settles into the dock.
   * It is handed to the browser as a run of short straight steps, which the
   * compositor plays without the page's help — the tour is busiest at exactly
   * this moment (microphone, connection, the photos' entrance next).
   *
   * Measured rather than computed: wherever the stylesheet put PIP before and
   * after is the trip, at any window size.
   */
  useLayoutEffect(() => {
    const el = pipBody.current;
    if (!el) return;
    el.getAnimations().forEach((a) => a.cancel());
    const next = el.getBoundingClientRect();
    const prev = pipBox.current;
    pipBox.current = next;
    // Only the way down is animated; a tour that fails to start just puts PIP back.
    if (!prev || intro || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dx = prev.left + prev.width / 2 - (next.left + next.width / 2);
    const dy = prev.bottom - next.bottom;
    const grow = next.width > 0 ? prev.width / next.width : 1;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    // From (dx, dy) to (0, 0), pulled toward a point most of the way across and half the way down.
    const cx = dx * 0.2;
    const cy = dy * 0.55;
    const frames = Array.from({ length: PIP_TRAVEL_STEPS + 1 }, (_, i) => {
      const t = i / PIP_TRAVEL_STEPS;
      const x = (1 - t) * (1 - t) * dx + 2 * (1 - t) * t * cx;
      const y = (1 - t) * (1 - t) * dy + 2 * (1 - t) * t * cy;
      const scale = grow + (1 - grow) * t;
      return { transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(4)})` };
    });
    // PIP's face is ruled with scanlines a pixel or two thick. Carried across
    // the screen and shrunk at the same time, lines that fine land between
    // pixels on almost every frame and shimmer. They are faded out for the
    // trip and come back when PIP has landed (see .tour-pip-body--moving).
    el.classList.add('tour-pip-body--moving');
    const trip = el.animate(frames, { duration: PIP_TRAVEL_MS, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
    const landed = () => el.classList.remove('tour-pip-body--moving');
    trip.addEventListener('finish', landed);
    trip.addEventListener('cancel', landed);
  }, [intro]);

  // Where PIP rests changes with the window; a trip must start from where it is now.
  useEffect(() => {
    const onResize = () => {
      const el = pipBody.current;
      if (el && el.getAnimations().length === 0) pipBox.current = el.getBoundingClientRect();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  /** With either look on, the photos from the focus photo's chapter stay lit and the rest step back. */
  const chapters = look.chapters;
  /** A chapter's name sits just above its photos, wherever the layout in use has put them. */
  const chapterLabelAt = (id: ChapterId) => {
    const { cx, cy, rx, ry } = CHAPTER_CLUSTERS[id];
    const spot = look.honeycomb && getCloud().find((p) => p.chapter === id)?.hex.chapter;
    if (spot) {
      const { halfW, halfH } = hexPx(spot, look.spacing);
      return { left: `calc(${cx}% - ${halfW.toFixed(0)}px)`, top: `calc(${cy}% - ${(halfH + 26).toFixed(0)}px)` };
    }
    // Clear of the cluster's top edge, which for a small one is its centre piece.
    return { left: `${cx - rx - 2}%`, top: `${cy - Math.max(ry + 3, 7.5) - 3}%` };
  };
  /** Which of a photo's two honeycomb cells is in use. */
  const hexOf = (p: Placed) => (chapters ? p.hex.chapter : p.hex.band);
  const focusChapter = focusId && (look.darkRoom || chapters) ? chapterOf(focusId) : null;

  return (
    <main
      ref={stageRef}
      className={`tour-stage ${look.darkRoom ? 'tour-stage--dark' : ''} ${asleep ? 'tour-stage--asleep' : ''} ${
        look.honeycomb ? 'tour-stage--hex' : ''
      }`}
      style={{ '--tour-crt': look.photoCrt } as React.CSSProperties}
    >
      <canvas ref={glow} className="tour-glow" aria-hidden />
      <div className="tour-scan" aria-hidden />
      <div className="tour-vignette" aria-hidden />

      <div
        className="tour-chrome"
        // In development the DialKit button sits in this corner, on top of End.
        style={process.env.NODE_ENV !== 'production' ? { paddingRight: 72 } : undefined}
      >
        <div className="flex items-center gap-3">
          <Link href="/projects/cameo" className="tour-btn">
            <Icon d="M10 3 5 8l5 5" />
            Back
          </Link>
          {/* PIP sends questions about projects here — see the grounding block in context.ts. */}
          <Link href="/#selected-work" className="tour-btn">
            His projects
            <Icon d="M5 11 11 5M6 5h5v5" />
          </Link>
          <h1 className="text-[13px] uppercase tracking-[0.2em] text-[var(--muted-ink)]">
            PIP &mdash; an interactive tour
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/*
           * A visitor gets the way in or out and the sound. The readouts a
           * builder wants — state, mood, the idle clock, what it has cost, the
           * microphone — are behind LAB_KEY, in a development build only.
           */}
          {lab && (
            <>
              <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted-ink)]">{state}</span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-sky-600/70">
                {mood}
                {moodP != null && (
                  <span className="ml-1 tabular-nums lowercase tracking-normal opacity-60">
                    {moodP.toFixed(2)}
                  </span>
                )}
              </span>
              {live && idleIn !== null && (
                <span
                  className={`text-[11px] tabular-nums ${idleIn <= 4 ? 'text-amber-600/80' : 'text-[var(--muted-ink)]'}`}
                >
                  quiet {idleIn}s
                </span>
              )}
              {(spent > 0 || liveSeconds > 0) && (
                <span className="text-[11px] tabular-nums text-[var(--muted-ink)]" title={lastClose ?? ''}>
                  {spent + liveSeconds}s billed · ~$
                  {(((spent + liveSeconds) / 60) * 0.05).toFixed(3)}
                </span>
              )}
              <select
                value={micId}
                onChange={(e) => {
                  setMicId(e.target.value);
                  localStorage.setItem('tour.micId', e.target.value);
                }}
                className="max-w-[200px] rounded-lg border border-[var(--hairline)] bg-[var(--control)] px-2 py-2 text-[11px] text-[var(--control-ink)]"
              >
                <option value="">Default microphone</option>
                {mics.map((m) => (
                  <option key={m.deviceId} value={m.deviceId}>
                    {m.label || m.deviceId.slice(0, 12)}
                  </option>
                ))}
              </select>
              <span className="flex items-center gap-2 text-[11px] text-[var(--muted-ink)]">
                mic
                <span className="block h-[5px] w-[60px] overflow-hidden rounded-full bg-[var(--control)]">
                  <span
                    className="block h-full bg-sky-500/70 transition-[width]"
                    style={{ width: `${micLevel * 100}%` }}
                  />
                </span>
              </span>
            </>
          )}
          {/* Up here with the other controls, where it does not push the caption around. */}
          {lines.length > 0 && (
            <button
              className={btn}
              aria-expanded={history}
              aria-pressed={history}
              onClick={() => setHistory((h) => !h)}
              // Space on the window starts and ends the tour.
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Icon d="M3 4.5h10M3 8h10M3 11.5h6" />
              Transcript
            </button>
          )}
          <button className={btn} onClick={() => setSilent((s) => !s)} aria-pressed={silent}>
            <Icon d={silent ? 'M3 6h2l3-2.5v9L5 10H3zM11 6.5l3 3M14 6.5l-3 3' : 'M3 6h2l3-2.5v9L5 10H3zM10.5 6a3 3 0 0 1 0 4M12.5 4.5a5.5 5.5 0 0 1 0 7'} />
            {silent ? 'Sound off' : 'Sound on'}
          </button>
          {live ? (
            <button className={btn} onClick={() => disconnect()}>
              End
            </button>
          ) : (
            <button
              className={`${btn} tour-btn--primary`}
              onClick={() => void connect()}
              disabled={state === 'connecting'}
            >
              {state === 'connecting' ? 'Connecting…' : lines.length > 0 ? 'Carry on' : 'Start the tour'}
            </button>
          )}
        </div>
      </div>

      <audio ref={audio} autoPlay className="hidden" />

      {fault && (
        <p className="absolute left-1/2 top-20 z-50 max-w-lg -translate-x-1/2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-[12px] text-red-700">
          {fault}
        </p>
      )}

      {/*
       * Each photo is one card, for its whole life on stage — one `.map()`,
       * not a satellite loop plus a separate focus slot. Two render sites for
       * the same photo is two different positions in React's tree, and a
       * card moving between two tree positions is a remount, not a move: it
       * loses the very state the FLIP animation depends on and re-enters
       * from nothing instead of travelling from where it actually was. New
       * ones pop in, then travel to their spot; a later promotion or
       * demotion reuses that same card and only travels.
       */}
      {/*
       * Earliest photo on top: as they pop in over one another, each new
       * arrival slides in underneath the ones before it. Wrapped in its own
       * stacking context so 38 per-card z-indexes stay inside the card layer
       * instead of competing with the vignette, dock and chrome above it.
       */}
      <div className="tour-cards">
        {arrived &&
          getCloud().map((p) => {
            const isFocus = p.id === focusId;
            return (
              <TourCard
                key={p.id}
                photo={p}
                place={isFocus ? 'focus' : 'float'}
                slot={
                  isFocus
                    ? undefined
                    : look.honeycomb
                      ? hexSlot(hexOf(p), look.spacing)
                      : chapters
                        ? p.cluster.pos
                        : p.pos
                }
                size={look.honeycomb ? HEX_CELL / FLOAT_MAX.h : chapters ? p.cluster.size : 1}
                square={look.honeycomb}
                tone={focusChapter ? (p.chapter === focusChapter ? 'kin' : 'dim') : undefined}
                order={p.order}
                // In a cluster the main pieces sit on top of the small ones around them.
                z={
                  isFocus
                    ? TOUR_IMAGES.length + 1
                    : TOUR_IMAGES.length - (chapters ? p.cluster.rank : p.order)
                }
                pointed={p.id === pointedId}
                onPoint={pointAt}
                onHover={glanceAt}
              />
            );
          })}
      </div>

      {chapters &&
        arrived &&
        CHAPTERS.map(({ id, label }) => (
          <p
            key={id}
            className={`tour-chapter ${focusChapter === id ? 'tour-chapter--on' : ''}`}
            style={chapterLabelAt(id)}
          >
            {label}
          </p>
        ))}

      {/*
       * The centre belongs to the photos. Until the tour starts it holds the
       * way in instead; once live it is left empty for whatever comes forward.
       */}
      {!focusId && !live && !dozing && (paused || state !== 'connecting') && (
        <div className={`tour-start ${paused ? '' : 'tour-start--intro'}`}>
          <p className="tour-start-title">{paused ? 'PIP is resting' : 'Meet PIP'}</p>
          <p className="tour-start-body">
            {paused
              ? 'The tour pauses when it goes quiet. PIP remembers what you were talking about.'
              : 'This is a voice conversation. PIP talks about Shreyas and you ask whatever you like. It needs your microphone, and pauses by itself when it goes quiet.'}
          </p>
          <button className="tour-btn tour-btn--primary tour-btn--large" onClick={() => void connect()} disabled={state === 'connecting'}>
            {state === 'connecting' ? 'Connecting…' : paused ? 'Carry on' : 'Start the tour'}
          </button>
          <p className="tour-start-hint">
            or press <kbd>Space</kbd>
          </p>
        </div>
      )}

      {history && (
        <div className="tour-history">
          <div className="tour-history-head">
            <span>Transcript</span>
            <button className="tour-btn" onClick={() => setHistory(false)} onKeyDown={(e) => e.stopPropagation()}>
              Close
            </button>
          </div>
          <div ref={displayScroll} className="tour-history-lines">
            {lines.map((l, i) => (
              <p key={i} className={l.who === 'you' ? 'tour-history-you' : undefined}>
                <span className="tour-caption-who">{l.who === 'you' ? 'You' : 'PIP'}</span>
                {l.text.trim()}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Bottom dock — PIP left, what is being said right; contain avoids layout spill. */}
      <div className={`tour-dock ${intro ? 'tour-dock--intro' : ''}`}>
        <div
          className="tour-pip relative shrink-0"
          style={{ width: charSize, height: charHeight, contain: 'layout size' }}
        >
          <div ref={pipBody} className="tour-pip-body">
            <Character ref={char} preset={PIP} size={charSize} sound reactions={REACTIONS} />
          </div>
        </div>

        {/*
         * Captions, not a transcript: only the sentence PIP is on, or the
         * question as it was heard — which is also how a visitor learns the
         * microphone is working. Not a live region: PIP is already saying it.
         */}
        <div
          // Closed until there is something to say, so PIP waits in the middle
          // of the stage and steps aside as the conversation starts.
          // Closed only while PIP is up in the start card. Anything that brings
          // it down — starting, or a photo pointed at first — brings it to the
          // same place, so it never has to shuffle sideways afterwards.
          className={`tour-caption ${intro ? 'tour-caption--closed' : ''}`}
          style={{ minHeight: charHeight }}
        >
          {live && caption && lastLine ? (
            <>
              <span className="tour-caption-who">{lastLine.who === 'you' ? 'You' : 'PIP'}</span>
              <p
                ref={captionText}
                className={`tour-caption-text ${lastLine.who === 'you' ? 'tour-caption-text--you' : ''}`}
              >
                {caption}
              </p>
            </>
          ) : live ? (
            <p className="tour-caption-text tour-caption-text--you">
              Listening… ask anything, or point at a photo.
            </p>
          ) : dozing ? (
            <p className="tour-caption-text tour-caption-text--you">
              {state === 'connecting' ? 'Waking up…' : 'PIP is dozing. Just start talking, or press Space.'}
            </p>
          ) : state === 'connecting' ? (
            <p className="tour-caption-text tour-caption-text--you">Connecting…</p>
          ) : (
            !paused && (
              <p className="tour-caption-text tour-caption-text--you">
                Press Space to start the tour and ask about this photo.
              </p>
            )
          )}
        </div>
      </div>

      {lab && log.length > 0 && (
        <div className="tour-events">
          <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[var(--muted-ink)]">Events</p>
          {log.map((l, i) => (
            <p key={i} className="font-mono text-[10px] leading-relaxed text-[var(--muted-ink)]">
              {l}
            </p>
          ))}
        </div>
      )}
    </main>
  );
}
