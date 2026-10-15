'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import localFont from 'next/font/local';
import { AnimatePresence, motion as fm, useReducedMotion } from 'framer-motion';
import { HOUSING_W, housingHeight, lookAt, PIP, type Reaction } from '@shrysp/cameo';
import { MOOD_REACTIONS } from '@/components/cameo/moods';
import { Character, type CharacterHandle } from '@shrysp/cameo/react';
import {
  type LiveEvent,
  type LiveSession,
  createLiveSession,
  interpret,
  listMicrophones,
} from '@/lib/tour/live-session';
import { idleSecondsLeft } from '@/lib/tour/idle';
import { type WakeMic, createSilentMic, createWakeMic } from '@/lib/tour/wake-mic';
import { NOTICES, type NoticeId, noticeClip, noticeFor } from '@/lib/tour/notices';
import { createTourClassifier } from '@/lib/tour/tour-model';
import { CHAPTERS, type ChapterId, TOUR_IMAGES, chapterOf } from '@/data/tour-images';
import { SUGGESTIONS } from '@/lib/tour/suggestions';
import { useDialKit } from 'dialkit';
import { PHOTO_POP } from '@/lib/tour/tour-sounds';
import { crtGlitch } from '@/components/cameo/crt/CrtLayer';
import { type Arrival, takeArrival } from '@/components/cameo/crt/arrival';
import { motion, slowed } from '@/components/cameo/crt/motion';
import { driftSpots, FLOAT_MAX, sessionSeed, STREAM_CRUISE } from '@/components/cameo/entrance/library';
import { LANDED } from '@/components/cameo/entrance/context';
import LibraryDive, { type DiveHandle } from '@/components/cameo/entrance/LibraryDive';
import { pipCentre } from '@/components/cameo/entrance/TourEntrance';
import { createField, type Field } from '@/components/cameo/entrance/field';
import { useLeaveTour } from '@/components/cameo/entrance/context';
import { playRecipe } from '@shrysp/cameo/sound';
import '@shrysp/cameo/styles.css';
import './tour.css';
import {
  HANDOUT_PROJECTS,
  type Handout,
  TourHandout,
} from './TourHandout';
import MicCheck, { useMicAccess } from './MicCheck';

/** Seven segments, for the time left: the same kind of LCD as PIP's face (see Countdown). */
const lcd = localFont({
  src: '../../../../../node_modules/dseg/fonts/DSEG7-Classic/DSEG7Classic-Bold.woff2',
  variable: '--font-lcd',
  display: 'block',
});

/**
 * Tells the server the session is over, so the time it did not use goes back
 * to the visitor's access code. A beacon, because the usual moment for this is
 * a tab closing. Safe to send twice: the server refunds once.
 */
/**
 * Tells the server a session is over. `answers` are the ids of what the
 * backend model wrote in it, so the server can charge them to the code;
 * `exchange` is what was said in it, for the visitor's page in Notion (the
 * server never hears the voice, so only the browser has it).
 */
const reportEnd = (answers: React.RefObject<string[]>, exchange: { who: 'you' | 'pip'; text: string }[]) => {
  const responses = answers.current.splice(0);
  // Read as a session's end by whichever arrives first, so it must not arrive
  // for one session after the next has begun: see endOnce.
  navigator.sendBeacon(
    '/api/tour/session/end',
    new Blob([JSON.stringify({ responses, exchange })], { type: 'application/json' }),
  );
};

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
/**
 * A resting photo's height in the honeycomb before the lens, in pixels — well
 * under FLOAT_MAX's 84, so the lower honeycombs stay clear of the bar and the
 * caption at the foot of the stage. The lens still brings one up to full size.
 */
const HEX_CELL = 60;
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

/*
 * A fourth way to lay the library out, and the one the entrance's dive lands
 * in: drift (entrance/library.ts, shared with the stream so both draw the
 * same photo in the same place).
 */
type DriftSpot = { pos: { left: string; top: string }; size: number; depth: number; tilt: number };

/**
 * The seed the library is laid out from: the session's (library.ts), which
 * the entrance's stream was drawn from too. Arriving by the dive confirms it.
 */
let cloudSeed: number | null = null;

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
/**
 * Where a photo in the centre sits, in screen pixels. The stylesheet places
 * it (--focus-cy, tour.css): in the middle of the room between the top bar and
 * PIP's column, which depends on the window and on PIP's size. An empty probe
 * is placed by the same rule, so this reads it rather than repeating the sum.
 * FOCUS_CENTER, as a fraction of the window, is only for before the stage is up.
 */
const FOCUS_CENTER = { x: 0.5, y: 0.38 };
function focusPoint(scope: ParentNode | null | undefined = typeof document !== 'undefined' ? document : null) {
  const r = scope?.querySelector('.tour-focus-probe')?.getBoundingClientRect();
  return r ? { x: r.left, y: r.top } : { x: window.innerWidth * FOCUS_CENTER.x, y: window.innerHeight * FOCUS_CENTER.y };
}

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
/** How long after PIP starts answering the end of the visitor's own transcript may still arrive. */
const TRANSCRIPT_TRAIL_MS = 2000;
const TAIL_GIVE_UP_MS = 4000;

/**
 * The least a photo holds the centre before another may take it. About one
 * spoken sentence (16 characters a second): long enough to be looked at, not
 * just seen. It was 1.8 s, so that three fitted inside one sentence, and the
 * centre read as a slideshow.
 */
const HOLD_MS = 4500;
/**
 * A photo already shown this visit, with no unseen photo of the same moment
 * to show instead, comes back only for a sentence this plainly about it.
 */
const REPEAT_P = 0.85;

/**
 * Seconds of quiet before the session closes. Longer than /live's 5s on
 * purpose: a visitor here is often still taking in an answer, and silence
 * while thinking of the next question is not the same signal as silence in a
 * chat. Counted from when PIP's voice actually stops (see the envelope in
 * onRemoteStream), not from when its words arrived as text, which is earlier.
 */
const IDLE_LIMIT = 15;
/**
 * The idle clock also waits while PIP is thinking up an answer, but only this
 * long: a backend that never answers must not keep a session open, and billed.
 */
const THINKING_HOLD_MS = 30_000;

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
  /** Where it has come to rest in the drift layout, and how far back. */
  drift: DriftSpot;
  chapter: ChapterId;
};

/**
 * The whole library, placed. Arrives on the visitor's first click or
 * keypress (see `arrived` in Tour): each card pops in at centre, one after
 * another in `order` — chapter by chapter — then travels to its spot (see
 * TourCard's entrance).
 *
 * Built on first call, which only ever happens in the browser, after that
 * first interaction: the spots are random, so a server render would never
 * match the client's.
 * Cached so a re-render doesn't reshuffle — but for its seed: the module
 * outlives a visit (leave the tour and come back, and it is still loaded), and
 * a layout cached from an earlier seed would put the cards somewhere other
 * than where the entrance's stream has just landed them.
 */
let cloud: Placed[] | null = null;
let cloudFor: number | null = null;
function getCloud(): Placed[] {
  const seed = (cloudSeed ??= sessionSeed());
  if (!cloud || cloudFor !== seed) {
    cloudFor = seed;
    const spots = cloudPositions(TOUR_IMAGES.length);
    const byChapter = chapterSpots(TOUR_IMAGES.map((img) => img.id));
    const hex = hexSpots(TOUR_IMAGES.map((img) => img.id));
    const drifts = driftSpots(seed);
    // One chapter at a time, in the order CHAPTERS lists them — top left, top
    // right, then down the two sides — and within a chapter its centre piece
    // first, so each cluster is seen to gather before the next one starts.
    const entrance = new Map(
      CHAPTERS.flatMap(({ id: chapter }) => TOUR_IMAGES.filter((img) => chapterOf(img.id) === chapter)).map(
        (img, i) => [img.id, i] as const,
      ),
    );
    cloud = TOUR_IMAGES.map((img, i) => ({
      id: img.id,
      path: img.path,
      width: img.width,
      height: img.height,
      order: entrance.get(img.id) ?? i,
      pos: spots[i],
      cluster: byChapter.get(img.id) ?? { pos: spots[i], size: 1, rank: i },
      chapter: chapterOf(img.id),
      hex: { band: hex.bands.get(img.id)!, chapter: hex.chapters.get(img.id)! },
      drift: (() => {
        const d = drifts.get(img.id)!;
        // Exact, not rounded: the stream brings its photo to rest at this very point.
        return { pos: { left: `${d.x}%`, top: `${d.y}%` }, size: d.size, depth: d.depth, tilt: d.tilt };
      })(),
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
  arrival = null,
  tilt = 0,
  depth = 0,
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
  /** How the visitor came in; 'dive' lands the photos out of the entrance's dive. */
  arrival?: Arrival | null;
  /** Drift layout: how askew it hangs, in degrees, and how far back it rests, 0 near to 1 far. */
  tilt?: number;
  depth?: number;
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

    if (!booted.current && arrival?.how === 'dive') {
      // Landed by the entrance's stream, which is still over the stage and
      // brings this photo to rest exactly here before it fades: the card waits
      // in its place, as it will be.
      booted.current = true;
      prevBox.current = next;
      el.style.opacity = '1';
      el.style.transform = '';
      return;
    }

    if (!booted.current) {
      booted.current = true;
      const stage = el.closest('.tour-stage');
      const fx = next.left + next.width / 2;
      const fy = next.top + next.height / 2;
      const centre = stage ? focusPoint(stage) : null;
      const cx = centre ? centre.x : fx;
      const cy = centre ? centre.y : fy;
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
  }, [place, slot?.left, slot?.top, order, size, square, arrival, photo.id, photo.path]);

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
        // In the centre, no taller than the room over PIP's column (--focus-h-max in tour.css).
        width:
          place === 'focus'
            ? `min(${max.vw}vw, ${w}px, calc(var(--focus-h-max, ${h}px) * ${ratio.toFixed(4)}))`
            : `min(${max.vw}vw, ${w}px)`,
        // --fz is the honeycomb's: under the lens the bigger photo is on top.
        zIndex: `var(--fz, ${z})`,
        // Askew and set back in the drift layout; `rotate` is its own property,
        // so neither the travel (`transform`) nor the drift (`translate`) touches it.
        ...(place === 'float' && tilt ? { rotate: `${tilt.toFixed(1)}deg` } : {}),
        ['--depth' as string]: place === 'float' ? depth.toFixed(2) : '0',
        // Each resting photo drifts on its own clock (tour.css, .tour-card--float).
        ['--drift-period' as string]: `${9 + (order % 5) * 1.3}s`,
        ['--drift-delay' as string]: `${-((order * 1.7) % 11)}s`,
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

/** How long PIP has to have stopped before a question picked on the way in is put to it. */
const ASK_AFTER_HELLO_MS = 1800;
/** How many are offered at once. */
const CHIPS_SHOWN = 3;
/** How long the conversation has to be silent before the chips come back. */
const CHIPS_AFTER_MS = 4000;

/**
 * When each of PIP's words goes into the caption. The transcript runs ahead of
 * the voice, but not by a fixed amount: the first words after a pause arrive
 * as they are said, and the text then pulls ahead to 0.8–1.3 s (measured over
 * three sessions, 14 Oct 2026). So the caption goes at speaking pace, 16
 * characters a second, from shortly after a word arrives, and never trails it
 * by more than a second. A word a little late reads as a caption; one early,
 * as a spoiler.
 */
const CAPTION_LAG_MS = 1000;
const CAPTION_MIN_MS = 200;
const SPOKEN_CHARS_PER_MS = 16 / 1000;

/** When the time left in the visit starts to show, counting down. */
const TIME_SHOWN_SECONDS = 120;
/** When PIP mentions, once, that time is nearly up. */
const TIME_WARN_SECONDS = 60;
/** When PIP says goodbye, in the last session the code has time for. */
const GOODBYE_SECONDS = 15;
/**
 * A session can run SESSION_CAP_SECONDS at most (access.ts); a visit with
 * time left goes on in a new one. The change is made in the first pause
 * this close to the cap, so it falls between sentences rather than in one.
 * The pause is read off the transcript, which is up to 1.3 s ahead of the
 * voice, hence the margin.
 */
const RENEW_EARLY_SECONDS = 40;
const RENEW_QUIET_MS = 2500;

/** How long a card takes to leave — the length of its exit in tour.css. */
const HANDOUT_OUT_MS = 200;

/** Arriving without the entrance: how long the stage's own stream builds up before it lands. */
const SELF_DIVE_CRUISE_MS = 900;

/** How the stage looks. The dials in development start from this; a visitor gets exactly this. */
const LOOK = { darkRoom: true, chapters: true, honeycomb: true, spacing: 0.7, lens: 0.7, photoGlow: 0.7, photoCrt: 0.7 };

/** Where the tour sends people when PIP has run out of time to talk. */
const EMAIL = 'shreyaspatil.design@gmail.com';

/** Whose turn it is, as the caption says it: the visitor's, PIP thinking, or PIP talking. */
type VoiceTurn = 'listening' | 'you' | 'thinking' | 'talking';
/**
 * A start that failed for a passing reason — the voice model or the store
 * hiccuping, the network dropping a request — is tried again quietly, after
 * each of these waits, before the visitor is told. Nothing is charged for a
 * start that fails: the session route refunds what it reserved.
 */
const START_RETRIES_MS = [700, 1600];
const PASSING_FAULT = /voice model|not available right now|HTTP (5\d\d|429)|failed to fetch|networkerror|load failed|timed? ?out/i;
/** PIP's voice counts as sounding above this level (0..1, the voice envelope's). */
const PIP_AUDIBLE_LEVEL = 0.04;
/** How long PIP's voice has to be silent before its turn is over: longer than a pause between words. */
const PIP_QUIET_MS = 450;
const MIC_ICON = 'M5.5 4a2.5 2.5 0 0 1 5 0v3.5a2.5 2.5 0 0 1-5 0zM3 7.5a5 5 0 0 0 10 0M8 12.5v2';
const KEYS_ICON = 'M2 4.5h12v7H2zM4.5 7h1M7.5 7h1M10.5 7h1M5 9.5h6';

const TURN_LABEL: Record<VoiceTurn, string> = {
  listening: 'Listening',
  you: 'Listening',
  thinking: 'PIP is thinking',
  talking: 'PIP is talking',
};

/** `visitor`: their first name, for the welcome; empty when the tour does not know it. */
/**
 * How the bar moves, everything in it on one clock, and PIP rising with it
 * (.tour-dock's bottom in tour.css uses the same): a quick ease-out for
 * what opens and closes, a touch quicker on the way out, and ease-in-out for
 * the one thing that travels across the bar, the mode's lit thumb.
 */
const BAR_EASE = [0.23, 1, 0.32, 1] as const;
const BAR_IN = 0.3;
const BAR_OUT = 0.24;
const THUMB = { duration: 0.24, ease: [0.645, 0.045, 0.355, 1] as const };

/** The start screen's talk/type swap: out of focus and back, quickly, so it reads as one change. */
const START_SWAP = {
  initial: { opacity: 0, filter: 'blur(8px)', y: 4 },
  animate: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.26, ease: [0.2, 0.8, 0.2, 1] } },
  exit: { opacity: 0, filter: 'blur(8px)', y: -4, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } },
} as const;
const SOUND_ON_ICON = 'M3 6h2l3-2.5v9L5 10H3zM10.5 6a3 3 0 0 1 0 4M12.5 4.5a5.5 5.5 0 0 1 0 7';
const SOUND_OFF_ICON = 'M3 6h2l3-2.5v9L5 10H3zM11 6.5l3 3M14 6.5l-3 3';

/**
 * The time left, on a seven-segment LCD like PIP's own face: the lit digits
 * over the faint unlit segments of every digit, as a real one shows them.
 */
function Countdown({ seconds }: { seconds: number }) {
  const text = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  return (
    <span
      className={`tour-pill-time ${seconds <= TIME_WARN_SECONDS ? 'tour-pill-time--low' : ''}`}
      role="timer"
      aria-label={`${Math.ceil(seconds / 60)} minutes of the tour left`}
    >
      <span className="tour-pill-time-ghost" aria-hidden>
        {text.replace(/\d/g, '8')}
      </span>
      <span className="tour-pill-time-lit" aria-hidden>
        {text}
      </span>
    </span>
  );
}

/**
 * The Talk switch's waveform, alive: whose turn it is, in the bar as well as
 * over the caption. PIP talking, the bars dance; you talking, they ripple;
 * listening, they breathe together; thinking, a light runs along them. At
 * rest while typing (the switch is off then). All in tour.css (.tour-voice).
 */
function VoiceBars({ turn, live }: { turn: VoiceTurn; live: boolean }) {
  return (
    <svg className="tour-voice" data-turn={live ? turn : undefined} width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      {[3, 5.5, 8, 10.5, 13].map((x, i) => (
        <rect key={x} x={x - 0.75} y={2} width={1.5} height={12} rx={0.75} style={{ '--i': i } as React.CSSProperties} />
      ))}
    </svg>
  );
}

/** Durations for the bar, divided by the motion dial, or nothing at all for reduced motion. */
function useBarTiming() {
  const reduce = useReducedMotion();
  const speed = Math.max(0.05, motion());
  const d = (s: number) => (reduce ? 0 : s / speed);
  return {
    enter: { duration: d(BAR_IN), ease: BAR_EASE },
    exit: { duration: d(BAR_OUT), ease: BAR_EASE },
    thumb: { ...THUMB, duration: d(THUMB.duration) },
  };
}

/**
 * One switch in the bar, coming and going without a jump: its width eases
 * open from nothing as it comes out of a blur, and back, so the rest of the
 * bar slides over rather than snapping. The box that moves has no padding
 * of its own, so it really reaches nothing (a padded box stops at its
 * padding, then vanishes in one frame); the padding inside it holds the
 * button's shadow, so clipping it never cuts the shadow off either.
 */
function Slot({ show, children }: { show: boolean; children: React.ReactNode }) {
  const t = useBarTiming();
  return (
    <AnimatePresence initial={false}>
      {show && (
        <fm.div
          className="tour-pill-slot"
          initial={{ width: 0, opacity: 0, filter: 'blur(6px)' }}
          animate={{ width: 'auto', opacity: 1, filter: 'blur(0px)', transition: t.enter }}
          exit={{ width: 0, opacity: 0, filter: 'blur(6px)', transition: t.exit }}
        >
          <div className="tour-pill-slot-in">{children}</div>
        </fm.div>
      )}
    </AnimatePresence>
  );
}

/**
 * The controls, always at the bottom of the stage, so nothing has to move
 * when a session starts or ends: the sound is here from the first screen,
 * the way back into a tour (Carry on) when one is closed, and the switches a
 * session needs — talk or type, mute, the time, End — grow into the row and
 * leave again.
 *
 * Everything else the bar can do, it does by growing upward, like Granola's:
 * the field for typing opens as a layer over the row, and the transcript as a
 * layer over that. The row itself never changes for them — mute stays where
 * it is while you type, only disabled — so the switches stay where your hand
 * left them. The bar widens to the caption's width for either, by a minimum
 * width eased in CSS (.tour-console--wide): it never has to measure itself,
 * so nothing is left to snap into place at the end.
 */
export function TourBar({
  session,
  canType,
  resume,
  turn,
  typing,
  typed,
  setTyped,
  onSubmit,
  onTalk,
  onType,
  muted,
  setMuted,
  silent,
  setSilent,
  lines,
  history,
  setHistory,
  timeLeft,
  onEnd,
}: {
  /**
   * Typing can begin here without a session: the start screen, where a typed
   * question is what starts one. Its field opens in this bar, as it does in a
   * session, with the switch back to talking beside it.
   */
  canType: boolean;
  /** A session is open (or typing to wake one): the session's switches are in the bar. */
  session: boolean;
  /** No session, but one to start or go back to: its button leads the row. */
  resume: { label: string; disabled: boolean; onClick: () => void } | null;
  /** Whose turn it is, for the Talk switch's waveform. */
  turn: VoiceTurn;
  typing: boolean;
  typed: string;
  setTyped: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTalk: () => void;
  onType: () => void;
  muted: boolean;
  setMuted: React.Dispatch<React.SetStateAction<boolean>>;
  /** PIP's voice off. */
  silent: boolean;
  setSilent: React.Dispatch<React.SetStateAction<boolean>>;
  /** The conversation so far, for the transcript. */
  lines: Line[];
  history: boolean;
  setHistory: React.Dispatch<React.SetStateAction<boolean>>;
  timeLeft: number | null;
  onEnd: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const t = useBarTiming();
  const open = typing && (session || canType);
  const reading = history && lines.length > 0;
  const wide = open || reading;

  /*
   * Shut, the bar is as wide as its row of switches, and follows the row as
   * switches come and go. Opening and shutting ease its minimum width between
   * that row's width and the caption's (.tour-console--wide) — from the row's
   * real width rather than from nothing, or the visible part of the ease is
   * spent in the first frame and the bar snaps shut. Written straight to the
   * element as the row resizes, so this never renders on its own account.
   */
  const consoleRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const wideRef = useRef(wide);
  wideRef.current = wide;
  useLayoutEffect(() => {
    const row = rowRef.current;
    const shell = consoleRef.current;
    if (!row || !shell) return;
    // The shell's 1px border either side of the row.
    const fit = () => {
      shell.style.minWidth = wideRef.current ? '' : `${row.offsetWidth + 2}px`;
    };
    fit();
    const watch = new ResizeObserver(fit);
    watch.observe(row);
    return () => watch.disconnect();
  }, []);
  // Only an open or a shut eases; the row's own changes are followed at once.
  // Set while rendering, so the easing is on in the same commit as the change.
  const [wasWide, setWasWide] = useState(wide);
  const [morph, setMorph] = useState(false);
  if (wasWide !== wide) {
    setWasWide(wide);
    setMorph(true);
  }
  useLayoutEffect(() => {
    const shell = consoleRef.current;
    const row = rowRef.current;
    if (shell && row) shell.style.minWidth = wide ? '' : `${row.offsetWidth + 2}px`;
  }, [wide]);
  useEffect(() => {
    if (!morph) return;
    const id = setTimeout(() => setMorph(false), (t.enter.duration || 0) * 1000 + 60);
    return () => clearTimeout(id);
  }, [morph, wide, t.enter.duration]);
  useEffect(() => {
    // Without preventScroll the browser scrolls the still-opening layer to the
    // caret, and the bar lurches as the layer finishes.
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);
  // The newest line in view, as it arrives and whenever the transcript opens.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, reading]);

  const layer = {
    initial: { height: 0, opacity: 0, filter: 'blur(8px)' },
    animate: { height: 'auto', opacity: 1, filter: 'blur(0px)', transition: t.enter },
    exit: { height: 0, opacity: 0, filter: 'blur(8px)', transition: t.exit },
  };

  return (
    // In front of the CRT glass: a thing you press, not something on the screen.
    <div
      ref={consoleRef}
      className={`tour-console ${wide ? 'tour-console--wide' : ''} ${morph ? 'tour-console--morph' : ''}`}
      data-crt-clear
      onKeyDown={(e) => e.stopPropagation()}
    >
      <AnimatePresence initial={false}>
        {reading && (
          <fm.div key="transcript" className="tour-console-layer" {...layer}>
            <div className="tour-console-layer-in">
              <div ref={logRef} className="tour-transcript" role="log" aria-label="Transcript">
                {lines.map((l, i) => (
                  <p key={i} className={`tour-transcript-line tour-transcript-line--${l.who}`}>
                    {l.text.trim()}
                  </p>
                ))}
              </div>
            </div>
          </fm.div>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {open && (
          <fm.form key="field" className="tour-console-layer" onSubmit={onSubmit} {...layer}>
            <div className="tour-console-layer-in">
            <div className="tour-pill-field-inner">
              <input
                ref={inputRef}
                className="tour-pill-input"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Escape') onTalk();
                }}
                placeholder="Ask PIP about Shreyas"
                aria-label="Ask PIP about Shreyas"
              />
              <button className="tour-pill-ask" disabled={!typed.trim()}>
                Ask
              </button>
            </div>
            </div>
          </fm.form>
        )}
      </AnimatePresence>
      <div ref={rowRef} className="tour-pill">
        <Slot show={!session && !!resume}>
          <button className="tour-btn tour-btn--primary tour-pill-go" onClick={resume?.onClick} disabled={resume?.disabled}>
            {resume?.label}
          </button>
        </Slot>
        {/* In a session; and on the start screen while typing, as the way back to talking. */}
        <Slot show={session || (canType && typing)}>
          <div className="tour-mode" role="radiogroup" aria-label="How you ask PIP">
            {/* A voice, not a microphone: the microphone is the mute button beside it. */}
            <button role="radio" aria-checked={!typing} aria-label="Talk" title="Talk" className="tour-mode-btn" onClick={onTalk}>
              {!typing && <fm.span layoutId="tour-mode-thumb" className="tour-mode-thumb" transition={t.thumb} />}
              <VoiceBars turn={turn} live={session && !typing} />
            </button>
            <button role="radio" aria-checked={typing} aria-label="Type" title="Type" className="tour-mode-btn" onClick={onType}>
              {typing && <fm.span layoutId="tour-mode-thumb" className="tour-mode-thumb" transition={t.thumb} />}
              <Icon d={KEYS_ICON} />
            </button>
          </div>
        </Slot>
        {/* Typing turns the microphone off already; the button stays put, disabled, so nothing beside it moves. */}
        <Slot show={session}>
          <button
            className="tour-pill-btn"
            aria-pressed={muted}
            aria-label={muted ? 'Unmute your microphone' : 'Mute your microphone'}
            title={typing ? 'The microphone is off while you type' : muted ? 'Unmute' : 'Mute'}
            disabled={typing}
            onClick={() => setMuted((m) => !m)}
          >
            <Icon d={muted || typing ? 'M10.5 7V4a2.5 2.5 0 0 0-5 0v.5M5.5 7.5a2.5 2.5 0 0 0 4.3 1.7M3 7.5a5 5 0 0 0 8.4 3.6M13 7.5c0 .7-.1 1.3-.4 1.9M8 12.5v2M2.5 2.5l11 11' : MIC_ICON} />
          </button>
        </Slot>
        <Slot show>
          <button
            className="tour-pill-btn"
            aria-pressed={silent}
            aria-label={silent ? 'Turn PIP\u2019s voice on' : 'Turn PIP\u2019s voice off'}
            title={silent ? 'Sound off' : 'Sound on'}
            onClick={() => setSilent((s) => !s)}
          >
            <Icon d={silent ? SOUND_OFF_ICON : SOUND_ON_ICON} />
          </button>
        </Slot>
        <Slot show={lines.length > 0}>
          <button
            className="tour-pill-btn"
            aria-pressed={reading}
            aria-expanded={reading}
            aria-label={reading ? 'Hide the transcript' : 'Show the transcript'}
            title="Transcript"
            onClick={() => setHistory((h) => !h)}
          >
            <Icon d="M3 4.5h10M3 8h10M3 11.5h6" />
          </button>
        </Slot>
        <Slot show={session && timeLeft !== null}>{timeLeft !== null && <Countdown seconds={timeLeft} />}</Slot>
        <Slot show={session}>
          <button className="tour-pill-end" onClick={onEnd}>
            End
          </button>
        </Slot>
      </div>
    </div>
  );
}

export default function TourStage({ visitor = '' }: { visitor?: string }) {
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
   * How much of PIP's latest turn has been heard by now: `lines[index]` up to
   * `length`. It trails the transcript; see CAPTION_LAG_MS.
   */
  const [heard, setHeard] = useState({ index: -1, length: 0 });
  /** The turn the transcript is on, kept in step with `lines` as words arrive. */
  const turn = useRef({ count: 0, who: null as Line['who'] | null, length: 0 });
  const heardTimers = useRef(new Set<number>());
  /** The backend's answers this session, by id, for the server to charge (see reportEnd). */
  const answerIds = useRef<string[]>([]);
  /**
   * Sessions whose end has been reported. The server keeps one open session
   * per code, so a second report — the close being confirmed after a new
   * session has already opened — would end the new one's reservation instead.
   */
  const reported = useRef(new WeakSet<LiveSession>());
  /** Where this session's lines begin in the visit's: earlier sessions have been reported already. */
  const exchangeFrom = useRef(0);
  const endOnce = useCallback((s: LiveSession | null) => {
    if (!s || reported.current.has(s)) return;
    reported.current.add(s);
    const said = linesRef.current.slice(exchangeFrom.current).map((l) => ({ who: l.who, text: l.text }));
    exchangeFrom.current = linesRef.current.length;
    reportEnd(answerIds, said);
  }, []);
  /** When the last of PIP's words is due in the caption, and how long it is. */
  const pace = useRef({ at: 0, length: 0 });
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
  // Read after mount, not during render: the server cannot see it, and a
  // first render that differed from the server's would not hydrate.
  const [arrival, setArrival] = useState<Arrival | null>(null);
  const [voiceTurn, setVoiceTurn] = useState<VoiceTurn>('listening');
  /** The visitor's microphone, switched off from the controls without ending anything. */
  const [muted, setMuted] = useState(false);
  /**
   * Talking or typing: one conversation either way, switched at any time.
   * Typing turns the microphone off, so PIP is not answering the room; a
   * visit begun by typing has no microphone at all until they talk.
   */
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const typing = mode === 'text';
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const micOff = muted || typing;
  const micOffRef = useRef(micOff);
  micOffRef.current = micOff;
  const localStream = useRef<MediaStream | null>(null);
  useEffect(() => {
    localStream.current?.getAudioTracks().forEach((t) => (t.enabled = !micOff));
  }, [micOff]);
  const [typed, setTyped] = useState('');
  const pendingTyped = useRef<string | null>(null);
  /**
   * Our own ask for the microphone, before the browser's: what it is for,
   * with typing as the way round it. 'start' starts the tour once allowed;
   * 'switch' brings the microphone into a tour begun by typing.
   */
  const [askMic, setAskMic] = useState<'start' | 'switch' | null>(null);
  const micAccess = useMicAccess();
  const micAccessRef = useRef(micAccess);
  micAccessRef.current = micAccess;
  /** Asked once already this visit, by us or by the browser. */
  const micAsked = useRef(false);
  /** Said under the type field when the microphone could not be brought in. */
  const [micNote, setMicNote] = useState<string | null>(null);
  /** Good morning / afternoon / evening, by the visitor's own clock — so only once mounted. */
  const [dayPart, setDayPart] = useState('');
  useEffect(() => {
    const h = new Date().getHours();
    setDayPart(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);
  /** The entrance's takeover is still over the stage, landing its stream on these cards. */
  const [landingOver, setLandingOver] = useState(false);
  /**
   * Came in some other way than the entrance's dive — Back and Forward, a
   * reload: the stage flies the same stream in itself, from PIP's vanishing
   * point, and lands it on the cards. Where that point is, while it runs.
   */
  const [selfDive, setSelfDive] = useState<[number, number] | null>(null);
  const selfDiveRef = useRef<DiveHandle>(null);
  const tookArrival = useRef(false);
  // Before paint, so the welcome never flashes up ahead of the photos landing.
  useLayoutEffect(() => {
    // Once: the arrival is read only once, and Strict Mode runs this twice.
    if (tookArrival.current) return;
    tookArrival.current = true;
    // The photos come on now, out of the depth, rather than waiting for the first click.
    const came = takeArrival();
    if (!came) {
      setArrived(true);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setRevealed(true);
        setSettled(true);
        return;
      }
      const seed = (cloudSeed ??= sessionSeed());
      setArrival({ how: 'dive', seed, travel: 0, velocity: 0, at: Date.now() });
      setLandingOver(true);
      setSelfDive(pipCentre());
      return;
    }
    // Lay the library out as the stream drew it, before the first card renders.
    cloudSeed = came.seed;
    setArrival(came);
    setArrived(true);
    setLandingOver(true);
  }, []);
  useEffect(() => {
    if (!selfDive) return;
    selfDiveRef.current?.preload();
    const start = performance.now();
    let last = start;
    let travel = 0;
    let landingAt = 0;
    let raf = 0;
    const step = (now: number) => {
      const dive = selfDiveRef.current;
      if (!dive) return;
      const dt = (Math.min(50, now - last) / 1000) * motion();
      last = now;
      const k = Math.min(1, (now - start) / slowed(SELF_DIVE_CRUISE_MS));
      if (k < 1) {
        // Building up to cruising speed, as the entrance's dive does, then landing from it.
        travel += STREAM_CRUISE * k * k * dt;
        dive.set(travel);
        dive.fade(Math.min(1, k / 0.15));
      } else {
        landingAt ||= now;
        const surge = 1 + 0.5 * Math.min(1, (now - landingAt) / slowed(250));
        if (dive.land(dt * surge, STREAM_CRUISE) <= 0) {
          setSelfDive(null);
          window.dispatchEvent(new Event(LANDED));
          return;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [selfDive]);
  // Until the takeover has landed and gone, the cards hold still where the
  // stream will bring each photo to rest (tour.css, data-landing).
  /**
   * Landed: the stage's own words and controls come in the way the rest of
   * the site does, out of a blur (tour.css, data-reveal). Stays on — taking
   * it off would play the arrival a second time.
   */
  const [revealed, setRevealed] = useState(false);
  /** The arrival has finished, so opening the microphone can't hitch it. */
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!revealed) return;
    const done = window.setTimeout(() => setSettled(true), slowed(900));
    return () => window.clearTimeout(done);
  }, [revealed]);
  useEffect(() => {
    if (!landingOver) return;
    const landed = () => {
      setLandingOver(false);
      setRevealed(true);
    };
    window.addEventListener(LANDED, landed);
    // In case the takeover never says so: the cards are not held for ever.
    const backstop = window.setTimeout(landed, 15_000);
    return () => {
      window.removeEventListener(LANDED, landed);
      window.clearTimeout(backstop);
    };
  }, [landingOver]);



  /*
   * The room behind everything: the entrance's tube, powered on — dark glass
   * with a living green phosphor and light pooled where the attention is
   * (under PIP, or behind the photo in the centre). The stage the dive
   * arrives in is the same room it was flying through.
   */
  const roomCanvas = useRef<HTMLCanvasElement>(null);
  const focusRef = useRef<string | null>(null);
  focusRef.current = focusId;
  useEffect(() => {
    const el = roomCanvas.current;
    if (!el) return;
    const at = (): [number, number] => {
      if (focusRef.current) {
        const centre = focusPoint();
        return [centre.x, centre.y];
      }
      const r = pipBody.current?.getBoundingClientRect();
      return r && r.width ? [r.left + r.width / 2, r.top + r.height / 2] : [window.innerWidth / 2, window.innerHeight * 0.3];
    };
    const room: Field | null = createField(el, 'screen', { off: 1, on: 1, wake: 1, focus: at() });
    if (!room) return;
    room.still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // The light follows the attention slowly, like a glow, not a spotlight.
    let raf = 0;
    const follow = () => {
      const [x, y] = at();
      const f = room.uniforms.focus;
      room.uniforms.focus = [f[0] + (x - f[0]) * 0.04, f[1] + (y - f[1]) * 0.04];
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);
    return () => {
      cancelAnimationFrame(raf);
      room.destroy();
    };
  }, []);
  // A photo coming forward is a change of channel on PIP's tube.
  useEffect(() => {
    if (focusId) crtGlitch(0.3, 150);
  }, [focusId]);
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
  const leave = useLeaveTour();
  const [silent, setSilent] = useState(false);
  const [spent, setSpent] = useState(0);
  const [liveSeconds, setLive_] = useState(0);
  const [lastClose, setLastClose] = useState<string | null>(null);
  /** Whether the whole conversation so far is open over the stage. */
  const [history, setHistory] = useState(false);
  /**
   * The code's time is used up: the visit is over rather than paused. Nothing
   * on the stage offers to start PIP again, because nothing would open.
   */
  const [over, setOver] = useState(false);
  const overRef = useRef(false);
  /** Why the tour could not start or carry on, shown and said (see notices.ts). */
  const [notice, setNotice] = useState<NoticeId | null>(null);
  /** The line PIP is saying from a recording, for the caption. */
  const [recorded, setRecorded] = useState<string | null>(null);
  const stopRecorded = useRef<(() => void) | null>(null);
  /** Seconds the code has beyond the session now running. */
  const beyond = useRef(Infinity);
  /** Seconds left in the whole visit, once few enough to show. */
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const warnedTime = useRef(false);
  /**
   * Carrying on in a new session at the cap. The stage goes on looking live
   * through the second or two that takes: nothing has paused, as far as the
   * visitor is concerned.
   */
  const [renewing, setRenewing] = useState(false);
  const saidGoodbye = useRef(false);
  /** Whether the session now running is the last this code has time for. */
  const lastSession = useRef(false);
  const [copied, setCopied] = useState(false);
  /** Nobody has said anything for a little while: the moment to offer something to ask. */
  const [quiet, setQuiet] = useState(false);
  /** Suggestions already taken, so the same three are not offered again. */
  const [asked, setAsked] = useState<string[]>([]);
  /** A suggestion picked before the tour was running: put to PIP once it has said hello. */
  const pendingAsk = useRef<string | null>(null);
  const askRef = useRef<(question: string) => void>(() => {});
  /** PIP has said something in this session — its hello, when the session is new. */
  const greeted = useRef(false);
  /** The builder's readouts and event log — see LAB_KEY. */
  const [lab, setLab] = useState(false);
  /**
   * Two directions for the stage, switchable while the tour runs so they can
   * be judged against the current look with real photos and a live PIP.
   */
  /** Settled: the look the "Tour look" panel was used to find, now fixed. */
  const look = LOOK;
  /** Settled on drift (the photos at rest in depth, where the dive lands) over the honeycombs; it was the Tour layout panel's. */
  const drift = true as boolean;
  const honey = look.honeycomb && !drift;

  /**
   * The card in the centre, if PIP has handed one over (see TourHandout).
   * PIP hands one over when a sentence of its answer calls for it (see
   * handOver, by classifySentence); the panel below can show any of them.
   */
  const [handout, setHandout] = useState<Handout | null>(null);
  const [handoutLeaving, setHandoutLeaving] = useState(false);
  const handoutTimer = useRef(0);
  const showHandout = useCallback((next: Handout) => {
    window.clearTimeout(handoutTimer.current);
    setHandoutLeaving(false);
    setHandout(next);
  }, []);
  const closeHandout = useCallback(() => {
    setHandoutLeaving(true);
    window.clearTimeout(handoutTimer.current);
    handoutTimer.current = window.setTimeout(() => {
      setHandout(null);
      setHandoutLeaving(false);
    }, HANDOUT_OUT_MS);
  }, []);
  const cards = useDialKit(
    'Tour cards',
    {
      project: { type: 'select', options: HANDOUT_PROJECTS, default: HANDOUT_PROJECTS[0] },
      showProject: { type: 'action', label: 'Show project card' },
      showContact: { type: 'action', label: 'Show contact card' },
      putAway: { type: 'action', label: 'Put the card away' },
      // How wide a card is, in pixels. It sits where a photo in the centre does (handout.css).
      width: [480, 360, 600, 10],
    },
    {
      onAction: (action) => {
        // The panel reports an action by its key, possibly with the panel's path in front.
        const name = action.split('.').pop();
        const now = cardsRef.current;
        if (name === 'showProject') showHandout({ kind: 'project', project: now.project });
        else if (name === 'showContact') showHandout({ kind: 'contact' });
        else if (name === 'putAway') closeHandout();
      },
    },
  );

  /**
   * Asks PIP one of the suggestions, as if it had been said aloud. Before the
   * tour is running that means starting it: PIP says hello first and the
   * question follows (see the idle clock, which is what notices the hello is over).
   */
  const ask = useCallback(
    (question: string) => {
      setAsked((a) => (a.includes(question) ? a : [...a, question]));
      setQuiet(false);
      const s = session.current;
      if (s?.state !== 'live') {
        pendingAsk.current = question;
        void connectRef.current();
        return;
      }
      // Shown and remembered as theirs: it is their question, however it was put.
      setLines((prev) => [...prev, { who: 'you', text: question }]);
      turn.current = { count: turn.current.count + 1, who: 'you', length: question.length };
      heardVisitor.current = true;
      lastQuestion.current = question;
      userUtterance.current = '';
      lastVoice.current = performance.now();
      // As for a spoken question: the last answer's photos, readings and card
      // are over (see the spoken question in handleEvent).
      tourModel.current.cancel();
      window.clearTimeout(spotlightTimer.current);
      pending.current = [];
      if (handoutRef.current && !handoutWriting.current) closeHandoutRef.current();
      answerStartedAt.current = 0;
      thinking.current ??= char.current?.hold('thinking', { key: 'tour' }) ?? null;
      // The voice model answers a note like this by itself, from nothing, so
      // the answer is written on the server from his story (see api/tour/ask)
      // and PIP is given it to say.
      void fetch('/api/tour/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: SUGGESTIONS.indexOf(question) }),
      })
        .then(async (res) => {
          const { answer } = await res.json();
          if (!res.ok || typeof answer !== 'string') throw new Error(`HTTP ${res.status}`);
          return answer;
        })
        .then(
          (answer) => {
            // Ended, or replaced by a new session, while the answer was being written.
            if (session.current !== s || s.state !== 'live') return;
            lastVoice.current = performance.now();
            s.speak(
              `The visitor picked a question on screen instead of saying it aloud: "${question}" ` +
                'The backend has answered it. Say this answer to them now, in your own voice. Keep every fact ' +
                `in it and add none of your own:\n\n${answer}`,
            );
          },
          () => {
            release(thinking);
            if (session.current !== s || s.state !== 'live') return;
            s.speak(
              'The visitor picked a question on screen, but it could not be looked up. Tell them so in one ' +
                'short sentence, and ask them to say it aloud instead. Do not answer it yourself.',
            );
          },
        );
    },
    [],
  );
  useEffect(() => {
    askRef.current = ask;
  }, [ask]);

  /**
   * A question typed rather than said. It goes into the conversation as the
   * visitor's own words — exactly what a spoken one becomes once transcribed —
   * and PIP answers it the same way, from his story, out loud. Before the tour
   * has started it starts it, and is put once PIP has said hello.
   */
  const askTyped = useCallback((question: string) => {
    const text = question.trim();
    if (!text) return;
    setQuiet(false);
    const s = session.current;
    if (s?.state !== 'live') {
      pendingTyped.current = text;
      void connectRef.current();
      return;
    }
    setLines((prev) => [...prev, { who: 'you', text }]);
    turn.current = { count: turn.current.count + 1, who: 'you', length: text.length };
    heardVisitor.current = true;
    lastQuestion.current = text;
    userUtterance.current = '';
    lastVoice.current = performance.now();
    tourModel.current.cancel();
    window.clearTimeout(spotlightTimer.current);
    pending.current = [];
    if (handoutRef.current && !handoutWriting.current) closeHandoutRef.current();
    answerStartedAt.current = 0;
    thinking.current ??= char.current?.hold('thinking', { key: 'tour' }) ?? null;
    setVoiceTurn('thinking');
    s.send({ type: 'conversation.item.create', item: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] } });
    s.send({ type: 'response.create' });
  }, []);
  const askTypedRef = useRef(askTyped);
  askTypedRef.current = askTyped;
  const submitTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typed.trim()) return;
    askTyped(typed);
    // The field stays: typing is the mode they are in, not a one-off.
    setTyped('');
  };
  const chips = SUGGESTIONS.filter((q) => !asked.includes(q)).slice(0, CHIPS_SHOWN);

  const cardsRef = useRef(cards);
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);
  const glow = useRef<HTMLCanvasElement>(null);
  const captionText = useRef<HTMLParagraphElement>(null);
  const pipBody = useRef<HTMLDivElement>(null);
  /** Where PIP was the last time it was at rest — the start of its next trip. */
  const pipBox = useRef<DOMRect | null>(null);
  const historyRef = useRef(false);
  const handoutRef = useRef(false);
  const closeHandoutRef = useRef<() => void>(() => {});
  /** A message is being written in the card (TourHandout's onWriting). */
  const handoutWriting = useRef(false);
  const onHandoutWriting = useCallback((writing: boolean) => {
    handoutWriting.current = writing;
  }, []);

  const audio = useRef<HTMLAudioElement>(null);
  const listening = useRef<(() => void) | null>(null);
  const thinking = useRef<(() => void) | null>(null);
  const speaking = useRef<(() => void) | null>(null);
  const detachHearing = useRef<(() => void) | null>(null);
  const detachVoice = useRef<(() => void) | null>(null);
  const micRaf = useRef(0);
  /**
   * Whether PIP can be heard right now, from its own audio rather than the
   * session's events: the model finishes a reply (response.done) seconds
   * before its voice finishes playing, and the turn read "listening" over it.
   */
  const [pipAudible, setPipAudible] = useState(false);
  const voiceRaf = useRef(0);
  const voiceEnvelope = useRef<{ stop: () => void } | null>(null);
  const tourModel = useRef(createTourClassifier());
  const userUtterance = useRef('');
  const modelUtterance = useRef('');
  const modelFlushTimer = useRef<number | undefined>(undefined);
  /** When PIP's last words arrived — how long a held tail has been waiting. */
  const lastModelDelta = useRef(0);
  /** The visitor's last full question, giving a lone answer-sentence its context. */
  const lastQuestion = useRef('');
  /**
   * When PIP began answering the visitor's latest question, or 0 before it
   * has. The visitor's words can still be arriving once it has: the end of
   * their transcript sometimes lands after the answer starts, and that is
   * the question the answer is for, not a new one.
   */
  const answerStartedAt = useRef(0);
  const lastVoice = useRef(0);
  const startedAt = useRef(0);
  /** How long the server allows this session to run — see api/tour/session. */
  const maxSeconds = useRef(Infinity);
  /** Photos picked for this visitor — brought to the centre as PIP says hello. */
  const welcomePhotos = useRef<string[]>([]);
  const connecting = useRef(false);
  const connectRef = useRef<(opts?: { byVoice?: boolean }) => Promise<void>>(async () => {});
  /** Retries of a failed start so far, the one waiting, and whether one is (it reads as still connecting). */
  const startTries = useRef(0);
  const retryTimer = useRef(0);
  const [retrying, setRetrying] = useState(false);
  const disconnectRef = useRef<(opts?: { keepMic?: boolean }) => void>(() => {});
  const stateRef = useRef(state);

  const release = (r: React.RefObject<(() => void) | null>) => {
    r.current?.();
    r.current = null;
  };

  /** Words keep joining the turn they belong to; a change of speaker starts the next one. */
  const appendLine = useCallback((who: Line['who'], delta: string) => {
    if (!delta) return;
    const t = turn.current;
    if (t.who !== who) turn.current = { count: t.count + 1, who, length: 0 };
    turn.current.length += delta.length;
    if (who === 'pip') {
      const at = { index: turn.current.count - 1, length: turn.current.length };
      const now = performance.now();
      const last = pace.current;
      const due = Math.min(
        now + CAPTION_LAG_MS,
        Math.max(now + CAPTION_MIN_MS, last.at + last.length / SPOKEN_CHARS_PER_MS),
      );
      pace.current = { at: due, length: delta.length };
      const id = window.setTimeout(() => {
        heardTimers.current.delete(id);
        setHeard(at);
      }, due - now);
      heardTimers.current.add(id);
    }
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
   * Which of a sentence's photos takes the centre, and when. Each travels
   * from its spot in the cloud to the centre and back; every photo is already
   * on stage, so this never adds or evicts one — it only moves the focus.
   *
   * One at a time, best first, and each holds for at least HOLD_MS. A photo
   * that arrives sooner waits, and only the newest sentence's photos wait: a
   * newer sentence replaces them, since they're about what PIP is saying now,
   * and the stage never falls behind playing a backlog. The last photo stays
   * until the next.
   *
   * A sentence that is still on the subject in the centre — the same photo,
   * or another of the same moment — leaves it there rather than swapping
   * aurora for aurora. And a photo already shown this visit gives way to an
   * unseen one of the same moment, so the second mention of the northern
   * lights shows another of that night.
   */
  const spotlightTimer = useRef<number | undefined>(undefined);
  /** Photos waiting for the centre, best first: only ever the newest sentence's. */
  const pending = useRef<string[]>([]);
  /** When the photo now in the centre got there. */
  const focusedAt = useRef(0);
  /** Every photo that has been in the centre this visit. */
  const shown = useRef(new Set<string>());

  const stopSpotlight = useCallback(() => {
    window.clearTimeout(spotlightTimer.current);
    pending.current = [];
  }, []);

  const pumpSpotlight = useCallback(function pump() {
    window.clearTimeout(spotlightTimer.current);
    const next = pending.current[0];
    if (!next || point.current) return;
    const wait = focusRef.current ? focusedAt.current + HOLD_MS - performance.now() : 0;
    if (wait > 0) {
      spotlightTimer.current = window.setTimeout(pump, wait);
      return;
    }
    pending.current.shift();
    shown.current.add(next);
    focusedAt.current = performance.now();
    setFocusId(next);
    setLog((l) => [`tour.spotlight ${next}${pending.current.length ? ` (then ${pending.current.join(', ')})` : ''}`, ...l].slice(0, 40));
    if (pending.current.length) spotlightTimer.current = window.setTimeout(pump, HOLD_MS);
  }, []);

  const emitImages = useCallback(
    (images: { id: string; p: number }[]) => {
      if (point.current) return;
      const moment = (id: string) => IMAGE_BY_ID.get(id)?.group ?? id;
      const fresh = (id: string, p: number) => {
        if (!shown.current.has(id)) return id;
        const group = IMAGE_BY_ID.get(id)?.group;
        const unseen = group && TOUR_IMAGES.find((img) => img.group === group && !shown.current.has(img.id));
        if (unseen) return unseen.id;
        return p >= REPEAT_P ? id : null;
      };
      const current = focusRef.current;
      const picks: string[] = [];
      for (const { id, p } of images) {
        if (!IMAGE_BY_ID.has(id)) continue;
        if (current && moment(id) === moment(current)) continue;
        const pick = fresh(id, p);
        if (pick && !picks.includes(pick)) picks.push(pick);
      }
      if (picks.length === 0) return;
      if (pending.current.length) setLog((l) => [`tour.spotlight skipped ${pending.current.join(', ')}`, ...l].slice(0, 40));
      pending.current = picks;
      pumpSpotlight();
    },
    [pumpSpotlight],
  );

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

      stopSpotlight();
      point.current = { id, answered: false };
      shown.current.add(id);
      setPointedId(id);
      setFocusId(id);
      setLog((l) => [`tour.point ${id}`, ...l].slice(0, 40));

      // Look where the photo is going, not where it was — PIP watches it land.
      const centre = focusPoint(stageRef.current);
      const look = {
        x: (centre.x / window.innerWidth) * 2 - 1,
        y: (centre.y / window.innerHeight) * 2 - 1,
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
    [releasePoint, sharePoint, stopSpotlight],
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
  /**
   * Hands over the card a sentence called for. Once per card per question:
   * an answer about a project names it sentence after sentence, and a card
   * the visitor has just put away must not come straight back. The card
   * takes the centre, so whichever photo was there steps back to the cloud.
   */
  const handed = useRef<{ question: string; cards: Set<string> }>({ question: '', cards: new Set() });
  const handOver = useCallback(
    (card: string, question: string) => {
      if (handed.current.question !== question) handed.current = { question, cards: new Set() };
      if (handed.current.cards.has(card)) return;
      handed.current.cards.add(card);
      if (card === 'contact') showHandout({ kind: 'contact' });
      else if (HANDOUT_PROJECTS.includes(card)) showHandout({ kind: 'project', project: card });
      else return;
      stopSpotlight();
      if (!point.current) setFocusId(null);
    },
    [showHandout, stopSpotlight],
  );

  /** The newest sentence whose photos have gone to the stage. */
  const photoSeq = useRef(0);
  const classifySentence = useCallback(
    (said: string) => {
      const text = said.trim();
      if (!text) return;
      const question = lastQuestion.current;
      void tourModel.current.classify(text, question).then((read) => {
        if (!read) return;
        // A reading that came back after a newer one's is too late for the
        // face and for a card, which are about what PIP is saying now. Its
        // photos still count unless a newer sentence has already asked for some.
        if (!read.stale) emitMood(read.mood, read.moodP);
        const card = read.stale ? null : read.card;
        const photosAreNewest = read.images.length > 0 && read.seq > photoSeq.current;
        // Not before the visitor has said something. The greeting lists what
        // PIP can talk about — "his background, how he works, the moments in
        // the photos" — and that sentence matched two or three photos at
        // random, which came to the centre before anyone had asked anything.
        // A card in the centre is what PIP is talking about, so photos wait for it to go.
        if (heardVisitor.current && card) handOver(card.id, question);
        else if (heardVisitor.current && !handoutRef.current && photosAreNewest) {
          photoSeq.current = read.seq;
          emitImages(read.images);
        }
        setLog((l) =>
          [
            `tour.answer${read.stale ? ' (late)' : ''} mood=${read.mood} images=${read.images.map((img) => `${img.id}(${img.p.toFixed(2)})`).join(',') || 'none'} card=${read.card ? `${read.card.id}(${read.card.p.toFixed(2)})` : 'none'} "${text.slice(0, 60)}"`,
            ...l,
          ].slice(0, 40),
        );
      });
    },
    [emitMood, emitImages, handOver],
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
    (event: LiveEvent, from?: LiveSession) => {
      const { type, ...rest } = event;
      // Deltas aren't logged — the transcript's own, or the backend draft's
      // wrapped in response.event. Dozens arrive per answer, and they pushed
      // every tour.answer line — the ones worth reading — out of the log.
      const inner = (event.event as { type?: unknown } | undefined)?.type;
      if (inner === 'response.completed') {
        const answer = (event.event as { response?: { id?: unknown } }).response?.id;
        if (typeof answer === 'string') answerIds.current.push(answer);
      }
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
      if (type === 'session.started') {
        wake.current?.pass();
        crtGlitch(0.55, 240);
      }
      // A beat after the greeting starts, so the photo arrives with the hello
      // rather than ahead of it.
      if (type === 'session.started' && welcomePhotos.current.length) {
        const ids = welcomePhotos.current;
        welcomePhotos.current = [];
        window.setTimeout(() => emitImages(ids.map((id) => ({ id, p: 1 }))), 1800);
      }

      // The line went down under a live session. Not 'disconnected', which
      // often recovers by itself; 'failed' does not.
      if (type === 'client.pc.failed' && stateRef.current === 'live') {
        disconnectRef.current();
        setNotice('lost');
        return;
      }

      /**
       * The visitor has asked something: what they said becomes the question
       * PIP's sentences are read against, and the last answer is over.
       *
       * A spoken question ends at its punctuation, but a transcript does not
       * always have any, so it also ends when PIP starts on the answer. Before
       * that, a question with no full stop never ended at all: the card the
       * last answer handed over stayed out, and so did the photos it kept
       * from the centre, and a card already handed over for that "question"
       * could not come back.
       */
      const finishQuestion = () => {
        const question = userUtterance.current.trim();
        if (!question) return;
        lastQuestion.current = question;
        userUtterance.current = '';
        setLog((l) => [`tour.question "${question.slice(0, 80)}"`, ...l].slice(0, 40));
        // The late end of the question this answer is already for.
        if (answerStartedAt.current) return;

        // PIP has already talked about the pointed photo; a new question
        // is the visitor moving on, so its answer may spotlight again.
        if (point.current?.answered) releasePoint();

        // Photos from the last answer stay on stage — only that answer's
        // in-flight sentence calls are dropped, since its sentences no
        // longer supersede each other on their own. Same for a tail still
        // held in the buffer: it belongs to an answer that's over.
        tourModel.current.cancel();
        stopSpotlight();
        // The card the last answer handed over goes too, so this answer's
        // photos can have the centre: photos wait while a card is out. Not
        // while they are writing to him in it — asking PIP something
        // mid-message must not lose the message.
        if (handoutRef.current && !handoutWriting.current) closeHandoutRef.current();
        window.clearTimeout(modelFlushTimer.current);
        modelUtterance.current = '';
      };

      const intent = interpret(event);
      if (!intent) return;

      switch (intent.kind) {
        case 'user-active': {
          release(thinking);
          appendLine('you', intent.delta);
          heardVisitor.current = true;
          pointAsked.current = true;
          // Words well into an answer are the visitor speaking again, not the
          // tail of the question it answers.
          if (answerStartedAt.current && performance.now() - answerStartedAt.current > TRANSCRIPT_TRAIL_MS) {
            answerStartedAt.current = 0;
          }
          userUtterance.current += intent.delta;
          lastVoice.current = performance.now();
          if (/[.!?]\s*$/.test(userUtterance.current) || userUtterance.current.length > 140) finishQuestion();
          break;
        }

        case 'model-active': {
          finishQuestion();
          if (!answerStartedAt.current) answerStartedAt.current = performance.now();
          release(thinking);
          release(listening);
          appendLine('pip', intent.delta);
          greeted.current = true;
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
            setVoiceTurn('you');
          } else {
            release(listening);
          }
          break;

        case 'thinking':
          if (intent.active) finishQuestion();
          if (intent.active && !speaking.current) {
            thinking.current ??= char.current!.hold('thinking', { key: 'tour' });
            setVoiceTurn('thinking');
          }
          break;

        case 'model-speaking':
          if (intent.active) {
            release(thinking);
            release(listening);
            speaking.current ??= char.current!.hold('speaking', { key: 'tour' });
            setVoiceTurn('talking');
          } else {
            release(speaking);
            setVoiceTurn('listening');
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
          setVoiceTurn('listening');
          // Shown because a per-minute bill you cannot see is one you only
          // discover on the dashboard.
          if (intent.seconds != null) {
            setSpent((s) => s + intent.seconds!);
            setLastClose(`${intent.seconds}s · ${intent.reason}`);
          } else {
            setLastClose(String(intent.reason));
          }
          setLive_(0);
          // Closed by the other end, not by disconnect(), which reports its own.
          if (from === session.current) endOnce(from ?? null);
          break;
      }
    },
    [appendLine, classifySentence, endOnce, emitImages, flushModelTail, releasePoint, sharePoint, stopSpotlight],
  );

  /**
   * `byVoice` is a wake from a doze by someone talking — only ever passed by
   * doze() below.
   */
  const connect = useCallback(async (opts?: { byVoice?: boolean }) => {
    const byVoice = opts?.byVoice === true;
    if (connecting.current || overRef.current) return;
    // Talking, with no microphone yet and the browser not having said yes:
    // ours first, so the browser's prompt never arrives unexplained.
    const needsMic = modeRef.current === 'voice' && (!wake.current || wake.current.silent);
    if (needsMic && !byVoice && !micAsked.current && micAccessRef.current !== 'granted') {
      setAskMic('start');
      return;
    }
    disconnectRef.current({ keepMic: true });
    connecting.current = true;
    window.clearTimeout(dozeTimer.current);
    wokenByVoice.current = byVoice;
    greeted.current = false;
    heardVisitor.current = false;
    setFault(null);
    setNotice(null);
    stopRecorded.current?.();
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
      onEvent: (event) => handleEvent(event, s),
      onStateChange: (next) => {
        // A session being replaced confirms its close after the new one is
        // live; its 'closed' is not the tour's. (Ended with nothing after it,
        // session.current is null and the close is the tour's own.)
        if (session.current && session.current !== s) return;
        setState(next);
        if (next === 'live' || next === 'error') setRenewing(false);
        if (next !== 'live') return;
        // The countdown and the idle clock start now, not at the click: the
        // wait for a connection is not the visitor's time (nor billed as it).
        startedAt.current = performance.now();
        lastVoice.current = startedAt.current;
        setDozing(false);
        release(drowsy);
      },
      microphone: async () => {
        // Typed until now, talking from here: the silent stand-in gives way to the real one.
        if (wake.current?.silent && modeRef.current === 'voice') {
          wake.current.close();
          wake.current = null;
        }
        if (!wake.current && modeRef.current === 'voice') micAsked.current = true;
        const mic =
          wake.current ??
          (modeRef.current === 'text' ? createSilentMic() : await createWakeMic(remembered || undefined));
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
      onSpent: () => {
        overRef.current = true;
        setOver(true);
      },
      history: () => linesRef.current,
      onSession: (info) => {
        maxSeconds.current = info.maxSeconds ?? Infinity;
        beyond.current = info.remaining ?? Infinity;
        lastSession.current = info.last === true;
        welcomePhotos.current = info.spotlight ?? [];
        // The cards have to be on stage before one can come forward.
        if (welcomePhotos.current.length) setArrived(true);
      },
      async onLocalStream(stream) {
        // Kept for the mute control; a session started while muted (or typing) starts that way.
        localStream.current = stream;
        stream.getAudioTracks().forEach((t) => (t.enabled = !micOffRef.current));
        // Again when the microphone is swapped mid-session: PIP's ears move to the new one.
        detachHearing.current?.();
        cancelAnimationFrame(micRaf.current);
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
        // Listened to for the turn: talking while the voice is sounding, and
        // for a breath after (PIP_QUIET_MS), so the gaps between words don't flicker it.
        cancelAnimationFrame(voiceRaf.current);
        voiceEnvelope.current?.stop();
        const { createVoiceEnvelope } = await import('@shrysp/cameo/sound');
        const env = createVoiceEnvelope(stream);
        voiceEnvelope.current = env;
        let heard = 0;
        let on = false;
        const watch = () => {
          const now = performance.now();
          if (env.level() > PIP_AUDIBLE_LEVEL) {
            heard = now;
            // Still talking, whatever the transcript says: its text runs ahead of the voice.
            lastVoice.current = now;
          }
          const next = now - heard < PIP_QUIET_MS;
          if (next !== on) {
            on = next;
            setPipAudible(next);
          }
          voiceRaf.current = requestAnimationFrame(watch);
        };
        voiceRaf.current = requestAnimationFrame(watch);
      },
    });
    session.current = s;
    try {
      await s.connect();
    } catch (err) {
      // Not left half-awake with a microphone open.
      if (session.current === s) disconnectRef.current();
      // Out of time is an ending, shown as one — not a fault to report.
      if (overRef.current) {
        setFault(null);
        return;
      }
      const message = String((err as { message?: unknown } | null)?.message ?? err);
      // The notice is the same for every fault; the reason is here, for whoever is looking.
      console.warn('[tour] The session did not start:', message);
      if (noticeFor(err) === 'unavailable' && PASSING_FAULT.test(message) && startTries.current < START_RETRIES_MS.length) {
        const delay = START_RETRIES_MS[startTries.current++];
        setRetrying(true);
        retryTimer.current = window.setTimeout(() => {
          setRetrying(false);
          void connectRef.current(opts);
        }, delay);
        return;
      }
      startTries.current = 0;
      setRetrying(false);
      setNotice(noticeFor(err));
      return;
    } finally {
      connecting.current = false;
    }
    startTries.current = 0;
    setMics(await listMicrophones());
  }, [handleEvent, micId]);

  /**
   * Ends the session. `keepMic` is for the two callers that are not ending
   * the visit — connect(), clearing the way for a new session, and doze().
   * Everything else, a click on End included, lets the microphone go.
   */
  const disconnect = useCallback((opts?: { keepMic?: boolean }) => {
    if (opts?.keepMic !== true) {
      // Ended by the visitor: a start waiting to be retried is not.
      window.clearTimeout(retryTimer.current);
      setRetrying(false);
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
    cancelAnimationFrame(voiceRaf.current);
    voiceEnvelope.current?.stop();
    voiceEnvelope.current = null;
    setPipAudible(false);
    detachHearing.current?.();
    detachHearing.current = null;
    detachVoice.current?.();
    detachVoice.current = null;
    release(listening);
    release(thinking);
    release(speaking);
    endOnce(session.current);
    session.current?.disconnect();
    session.current = null;
    // An answer arriving after the session ends would pull a face at nobody.
    tourModel.current.cancel();
    stopSpotlight();
    window.clearTimeout(modelFlushTimer.current);
    window.clearTimeout(pointOfferTimer.current);
  }, [endOnce, stopSpotlight]);

  /** Into a tour begun by typing, the real microphone, in place of the silence it was sending. */
  const bringMicIn = useCallback(async () => {
    const s = session.current;
    const old = wake.current;
    if (!s || !old?.silent) return;
    micAsked.current = true;
    try {
      const mic = await createWakeMic(micId || localStorage.getItem('tour.micId') || undefined);
      // Ended, or swapped already, while the browser was asking.
      if (session.current !== s || wake.current !== old) {
        mic.close();
        return;
      }
      await s.replaceMicrophone(mic);
      wake.current = mic;
      old.close();
      mic.pass(true);
    } catch (err) {
      setMode('text');
      setMicNote(
        noticeFor(err) === 'mic-missing'
          ? 'No microphone found. Keep typing, or connect one and try again.'
          : 'Your browser is blocking the microphone. Allow it from the address bar, or keep typing.',
      );
    }
  }, [micId]);

  const switchToText = useCallback(() => {
    setMicNote(null);
    setMode('text');
  }, []);
  const switchToVoice = useCallback(() => {
    setMicNote(null);
    setMode('voice');
    if (!wake.current?.silent || session.current?.state !== 'live') return;
    if (!micAsked.current && micAccessRef.current !== 'granted') setAskMic('switch');
    else void bringMicIn();
  }, [bringMicIn]);

  /** Our ask for the microphone, answered: on to the browser's own. */
  const allowMic = () => {
    const why = askMic;
    setAskMic(null);
    micAsked.current = true;
    if (why === 'switch') void bringMicIn();
    else void connect();
  };
  const allowMicRef = useRef(allowMic);
  allowMicRef.current = allowMic;
  // Allowed from the address bar while ours was up: carry on without another click.
  useEffect(() => {
    if (askMic && micAccess === 'granted') allowMicRef.current();
  }, [askMic, micAccess]);
  /** …or not: typing instead, and a question already chosen is put now. */
  const declineMic = () => {
    const why = askMic;
    setAskMic(null);
    setMode('text');
    modeRef.current = 'text';
    if (why === 'start' && (pendingAsk.current || pendingTyped.current)) void connect();
  };

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
    handoutRef.current = handout !== null;
    closeHandoutRef.current = closeHandout;
  }, [connect, disconnect, doze, state, history, lines, dozing, handout, closeHandout]);

  const silentRef = useRef(silent);
  useEffect(() => {
    silentRef.current = silent;
    if (audio.current) audio.current.muted = silent;
  }, [silent]);

  /**
   * Says a notice's line from its recording, PIP's mouth following the sound
   * and its face set to match. With the sound off the line is still captioned.
   */
  const sayNotice = useCallback(
    async (id: NoticeId) => {
      stopRecorded.current?.();
      const { line, face } = NOTICES[id];
      emitMood(face, null);
      setRecorded(line);
      if (silentRef.current || !char.current) return;
      const el = new Audio(noticeClip(id));
      let detach: (() => void) | null = null;
      const stop = () => {
        el.pause();
        detach?.();
        detach = null;
        if (stopRecorded.current === stop) stopRecorded.current = null;
      };
      stopRecorded.current = stop;
      el.addEventListener('ended', stop, { once: true });
      el.addEventListener('error', stop, { once: true });
      try {
        detach = await char.current.speakFrom(el, { hold: true });
        if (stopRecorded.current !== stop) return stop();
        await el.play();
      } catch {
        stop();
      }
    },
    [emitMood],
  );


  /**
   * A notice or the end of the visit takes the centre: a photo or card there
   * would hide the one thing that says what happened.
   */
  useEffect(() => {
    if (!notice) return;
    setFocusId(null);
    closeHandoutRef.current();
    void sayNotice(notice);
  }, [notice, sayNotice]);
  useEffect(() => {
    if (!over) return;
    setFocusId(null);
    closeHandoutRef.current();
    // Said live already, when there was time to; and nothing to thank anyone
    // for on a code that was spent before this visit began.
    if (!saidGoodbye.current && linesRef.current.length > 0) void sayNotice('over');
  }, [over, sayNotice]);

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
      if (stateRef.current === 'live') endOnce(session.current);
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, [endOnce]);

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
      } else if (e.key === 'Escape' && handoutRef.current) {
        closeHandoutRef.current();
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


  const live = state === 'live';

  useEffect(() => {
    // No setState here: the readout is only shown while live, so clearing it
    // on teardown would be a cascading render for something invisible.
    if (!live) return;
    /** When the current spell of thinking began, so it can only hold the idle clock so long. */
    let thinkingSince: number | null = null;
    const id = window.setInterval(() => {
      // Working on an answer is not quiet: the idle clock waits, as it does while PIP talks.
      if (thinking.current) {
        thinkingSince ??= performance.now();
        if (performance.now() - thinkingSince < THINKING_HOLD_MS) lastVoice.current = performance.now();
      } else thinkingSince = null;
      const left = Math.round(
        idleSecondsLeft({
          now: performance.now(),
          startedAt: startedAt.current,
          lastVoiceAt: lastVoice.current,
          limit: IDLE_LIMIT,
        }),
      );
      setIdleIn(left);
      // Silence is read off the transcript: the voice model sends no reliable
      // "finished speaking", but words stop arriving when it has.
      const silentFor = performance.now() - lastVoice.current;
      // A question picked before the tour started goes in once the hello is over.
      if (pendingAsk.current && greeted.current && silentFor > ASK_AFTER_HELLO_MS) {
        const question = pendingAsk.current;
        pendingAsk.current = null;
        askRef.current(question);
      }
      if (pendingTyped.current && greeted.current && silentFor > ASK_AFTER_HELLO_MS) {
        const question = pendingTyped.current;
        pendingTyped.current = null;
        askTypedRef.current(question);
      }
      setQuiet(silentFor > CHIPS_AFTER_MS && !thinking.current && !pendingAsk.current && !pendingTyped.current);
      // The server charged this session for maxSeconds and no more; staying
      // connected past it would be time nobody budgeted for.
      const ranFor = (performance.now() - startedAt.current) / 1000;
      const sessionLeft = maxSeconds.current - ranFor;
      const visitLeft = Math.max(0, beyond.current + sessionLeft);
      setTimeLeft(visitLeft <= TIME_SHOWN_SECONDS ? Math.ceil(visitLeft) : null);
      const s = session.current;
      // In a pause, once PIP has said hello: a note sent before the session is
      // ready is lost, and one sent mid-answer cuts across it.
      if (
        !warnedTime.current &&
        greeted.current &&
        silentFor > RENEW_QUIET_MS &&
        visitLeft <= TIME_WARN_SECONDS &&
        visitLeft > GOODBYE_SECONDS * 2
      ) {
        warnedTime.current = true;
        s?.speak(
          'Let the visitor know, in a few words of your own, that there is about a minute of the tour left, ' +
            'and that they can keep asking. Then carry on with whatever you were doing.',
        );
      }
      if (lastSession.current && !saidGoodbye.current && sessionLeft <= GOODBYE_SECONDS) {
        saidGoodbye.current = true;
        s?.speak(
          'The tour is out of time. In one or two short sentences, warmly say goodbye, thank them for ' +
            'coming, and say Shreyas would love to hear from them by email. Do not start anything new.',
        );
      }
      if (sessionLeft <= 0) {
        if (lastSession.current) {
          overRef.current = true;
          setOver(true);
          disconnectRef.current();
        } else {
          setRenewing(true);
          void connectRef.current();
        }
      } else if (
        !lastSession.current &&
        sessionLeft <= RENEW_EARLY_SECONDS &&
        ranFor > maxSeconds.current / 2 &&
        silentFor > RENEW_QUIET_MS
      ) {
        // The cap is close: carry on in a new session now, in this pause.
        setRenewing(true);
        void connectRef.current();
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
  }, [lines, heard]);

  useEffect(() => {
    const timers = heardTimers.current;
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

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
    if (!stage || !honey || !arrived) return;
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
  }, [honey, look.lens, look.spacing, look.chapters, arrived]);

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

  /**
   * PIP's words show as they are heard, not as they arrive; until the first of
   * them is, the question it is answering stays up.
   */
  const lastIndex = lines.length - 1;
  const answering = lines[lastIndex]?.who === 'pip' && heard.index !== lastIndex;
  const captionIndex = answering ? lastIndex - 1 : lastIndex;
  const lastLine = captionIndex >= captionFrom ? lines[captionIndex] : undefined;
  const caption = !lastLine
    ? ''
    : lastLine.who === 'pip'
      ? currentSentence(lastLine.text.slice(0, captionIndex === heard.index ? heard.length : undefined))
      : lastLine.text.trim();
  /** Coming back to a conversation rather than starting one. */
  const paused = lines.length > 0;
  /** Dozing, or paused mid-visit: the stage steps back until PIP is woken. */
  const asleep = !live && state !== 'connecting' && (dozing || paused);
  /**
   * Before the first hello PIP is part of the way in — up in the middle of
   * the stage, above the words — and goes down to its place in the dock as
   * the tour starts.
   */
  const realIntro = !paused && !live && !dozing && !focusId && !handout && state !== 'connecting';

  /** What the stage draws. */
  const v = {
    live: live || renewing,
    // A start being retried reads as one still connecting.
    state: renewing ? 'live' : retrying ? 'connecting' : state,
    dozing,
    paused,
    over,
    notice,
    timeLeft,
    quiet,
    lastLine,
    caption,
    recorded,
    asleep: asleep && !renewing,
    intro: realIntro,
  };
  const intro = v.intro;
  /** The welcome, or the resting card: up when nothing else is in the middle and no session is live. */
  /** Whose turn it reads as: while PIP can be heard, PIP is talking, whatever the session last said. */
  const shownTurn: VoiceTurn = pipAudible ? 'talking' : voiceTurn;
  const startCard =
    !v.over && !v.notice && !askMic && !focusId && !handout && !v.live && !v.dozing && (v.paused || v.state !== 'connecting');

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
  /** Which of a photo's two honeycomb cells is in use. */
  const hexOf = (p: Placed) => (chapters ? p.hex.chapter : p.hex.band);
  const focusChapter = focusId && (look.darkRoom || chapters) ? chapterOf(focusId) : null;

  return (
    <>
    <main
      ref={stageRef}
      data-crt-target
      data-landing={landingOver ? '' : undefined}
      data-self-dive={selfDive ? '' : undefined}
      data-live={v.live ? '' : undefined}
      // What the bar has opened over itself, so PIP rises with it (tour.css).
      data-field={(v.live || (v.dozing && typing)) && typing ? '' : undefined}
      data-transcript={history && lines.length > 0 ? '' : undefined}
      data-focus={focusId ? '' : undefined}
      data-reveal={revealed ? '' : undefined}
      className={`tour-stage ${lcd.variable} ${look.darkRoom ? 'tour-stage--dark' : ''} ${v.asleep ? 'tour-stage--asleep' : ''} ${
        honey ? 'tour-stage--hex' : ''
      } ${drift ? 'tour-stage--drift' : ''
      }`}
      style={{ '--tour-crt': look.photoCrt, '--pip-h': `${charHeight}px` } as React.CSSProperties}
    >
      {/* The room: the entrance's tube, powered on. Its scanlines are the CRT glass's now (CrtLayer). */}
      <canvas ref={roomCanvas} className="tour-room" aria-hidden />
      <canvas ref={glow} className="tour-glow" aria-hidden />
      {/* Where a photo in the centre sits; focusPoint() reads it. */}
      <div className="tour-focus-probe" aria-hidden />
      <div className="tour-vignette" aria-hidden />

      <div
        className="tour-chrome"
        // In development the DialKit button sits in this corner, on top of End.
        style={process.env.NODE_ENV !== 'production' ? { paddingRight: 72 } : undefined}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/projects/cameo#tour"
            className="tour-btn"
            data-crt-clear
            onClick={(e) => {
              // The tube switches off on the way out (TourExit); a new tab, or no host, goes the plain way.
              if (!leave || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              leave();
            }}
          >
            <Icon d="M10 3 5 8l5 5" />
            Case study
          </Link>
          {/* Not shown — the stage says what it is — but still the page's heading for a screen reader. */}
          <h1 className="sr-only">PIP &mdash; an interactive tour</h1>
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
              {v.live && idleIn !== null && (
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
          {/* The sound, the transcript, the time and End are all in the bar at the bottom (TourBar), in every state. */}
        </div>
      </div>

      <audio ref={audio} autoPlay className="hidden" />

      {lab && fault && (
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
                    : drift
                      ? p.drift.pos
                      : honey
                      ? hexSlot(hexOf(p), look.spacing)
                      : chapters
                        ? p.cluster.pos
                        : p.pos
                }
                size={drift ? p.drift.size : honey ? HEX_CELL / FLOAT_MAX.h : chapters ? p.cluster.size : 1}
                square={honey}
                tilt={drift ? p.drift.tilt : 0}
                depth={drift ? p.drift.depth : 0}
                tone={focusChapter ? (p.chapter === focusChapter ? 'kin' : 'dim') : undefined}
                order={p.order}
                // In a cluster the main pieces sit on top of the small ones around them.
                z={
                  isFocus
                    ? TOUR_IMAGES.length + 1
                    : drift
                      ? TOUR_IMAGES.length - Math.round(p.drift.depth * 30)
                      : TOUR_IMAGES.length - (chapters ? p.cluster.rank : p.order)
                }
                pointed={p.id === pointedId}
                arrival={arrival}
                onPoint={pointAt}
                onHover={glanceAt}
              />
            );
          })}
      </div>
      {selfDive && (
        <div className="tour-self-dive">
          <LibraryDive ref={selfDiveRef} focus={selfDive} seed={cloudSeed ?? sessionSeed()} />
        </div>
      )}

      {/*
       * The centre belongs to the photos. Until the tour starts it holds the
       * way in instead; once live it is left empty for whatever comes forward.
       */}
      {/*
       * The end of the visit. PIP cannot say goodbye — the time it would take
       * is the time that has run out — so the stage says it, and hands the
       * conversation to the person it was about.
       */}
      {v.over && !focusId && !handout && (
        <div className={`tour-start ${v.paused ? '' : 'tour-start--intro'}`}>
          <p className="tour-start-title">{v.paused ? 'That\u2019s the tour' : 'This tour has been taken'}</p>
          <p className="tour-start-body">
            {v.paused
              ? 'PIP has used all the time it was given for this visit. Shreyas would be glad to carry on the conversation himself.'
              : 'The time on this access code has been used. Shreyas would be glad to hear from you himself.'}
          </p>
          <div className="tour-end-actions">
            <a className="tour-btn tour-btn--primary tour-btn--large" data-crt-clear href={`mailto:${EMAIL}`}>
              Email Shreyas
            </a>
            <Link href="/#selected-work" className="tour-btn tour-btn--large" data-crt-clear>
              See his work
              <Icon d="M5 11 11 5M6 5h5v5" />
            </Link>
          </div>
          <button
            className="tour-end-address"
            onClick={() => {
              void navigator.clipboard?.writeText(EMAIL).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              });
            }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {copied ? 'Copied' : EMAIL}
          </button>
        </div>
      )}

      {v.notice && !v.over && !v.live && v.state !== 'connecting' && (
        <div className={`tour-start ${v.paused ? '' : 'tour-start--intro'}`} role="alert">
          <p className="tour-start-title">{NOTICES[v.notice].title}</p>
          <p className="tour-start-body">{NOTICES[v.notice].body}</p>
          <div className="tour-end-actions">
            {NOTICES[v.notice].actions.map((action, i) => {
              const cls = `tour-btn tour-btn--large ${i === 0 ? 'tour-btn--primary' : ''}`;
              return action === 'email' ? (
                <a key={action} className={cls} href={`mailto:${EMAIL}`}>
                  Email Shreyas
                </a>
              ) : (
                <button
                  key={action}
                  className={cls}
                  onClick={() => {
                    if (action !== 'type') return void connect();
                    setNotice(null);
                    switchToText();
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  {action === 'retry' ? 'Try again' : action === 'type' ? 'Type instead' : 'Carry on'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {startCard && v.paused && (
        <div className="tour-start">
          <p className="tour-start-title">PIP is resting</p>
          <p className="tour-start-body">The tour pauses when it goes quiet. PIP remembers what you were talking about.</p>
          <button className="tour-btn tour-btn--primary tour-btn--large" data-crt-clear onClick={() => void connect()} disabled={v.state === 'connecting'}>
            {v.state === 'connecting' ? 'Connecting…' : 'Carry on'}
          </button>
          <p className="tour-start-hint">
            or press <kbd>Space</kbd>
          </p>
        </div>
      )}
      {startCard && !v.paused && (
        <div className="tour-start tour-start--intro">
          <p className="tour-start-title">{visitor ? `${dayPart || 'Hello'}, ${visitor}` : 'Meet PIP'}</p>
          <p className="tour-start-body">
            PIP is Shreyas{'\u2019'}s guide. Ask about him out loud, and it answers with the photos around you.
          </p>
          <MicCheck ready={settled} />
          {/* Talk or type swaps through a blur, the one going before the other comes. */}
          <AnimatePresence mode="wait" initial={false}>
          {typing ? (
            // Typing happens in the bar at the foot (TourBar), as it does in a session.
            <fm.p key="type" className="tour-start-hint tour-start-typing" {...START_SWAP}>
              Type your question below, or point at a photo.
            </fm.p>
          ) : (
            <fm.div key="talk" className="tour-start-actions" {...START_SWAP}>
              <button className="tour-btn tour-btn--primary tour-btn--large" data-crt-clear onClick={() => void connect()} disabled={v.state === 'connecting'}>
                {v.state === 'connecting' ? 'Connecting…' : 'Start talking'}
              </button>
              <button className="tour-btn tour-btn--large" data-crt-clear onClick={switchToText} onKeyDown={(e) => e.stopPropagation()}>
                <Icon d={KEYS_ICON} />
                Type instead
              </button>
            </fm.div>
          )}
          </AnimatePresence>
        </div>
      )}

      {/*
       * Ours, before the browser's: a browser's own microphone prompt cannot
       * be restyled or replaced, only preceded — so it comes as the answer to
       * a question the visitor has already said yes to, and typing is offered
       * as the way round it. Blocked already, it says how to unblock instead.
       */}
      {askMic && (
        <div
          className={`tour-start tour-mic-ask ${askMic === 'start' ? 'tour-start--intro' : 'tour-mic-ask--live'}`}
          role="dialog"
          aria-modal="false"
          aria-labelledby="tour-mic-ask-title"
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Escape') declineMic();
          }}
        >
          <span className="tour-mic-ask-icon" aria-hidden>
            <Icon d={MIC_ICON} />
          </span>
          <p id="tour-mic-ask-title" className="tour-start-title">
            {micAccess === 'denied' ? 'Your microphone is blocked' : 'PIP needs to hear you'}
          </p>
          <p className="tour-start-body">
            {micAccess === 'denied'
              ? 'To talk to PIP, allow the microphone from the icon at the left of the address bar. Or ask by typing instead.'
              : 'Your browser will ask for the microphone next. It\u2019s only used while you talk to PIP, and you can mute it or switch to typing any time.'}
          </p>
          <div className="tour-start-actions">
            <button className="tour-btn tour-btn--primary tour-btn--large" data-crt-clear onClick={allowMic} autoFocus>
              {micAccess === 'denied' ? 'Try again' : 'Allow microphone'}
            </button>
            <button className="tour-btn tour-btn--large" data-crt-clear onClick={declineMic}>
              <Icon d={KEYS_ICON} />
              Type instead
            </button>
          </div>
        </div>
      )}

      {handout && (
        <TourHandout
          // A different card is a new arrival, not the old one changing its mind.
          key={handout.kind + ('project' in handout ? handout.project : '')}
          handout={handout}
          leaving={handoutLeaving}
          onClose={closeHandout}
          onWriting={onHandoutWriting}
          style={{ '--handout-w': `${cards.width}px` } as React.CSSProperties}
        />
      )}


      {/* Bottom dock — PIP left, what is being said right; contain avoids layout spill. */}
      <div className={`tour-dock ${intro ? 'tour-dock--intro' : ''}`}>
        {v.live && v.quiet && !handout && chips.length > 0 && (
          <div className="tour-chips tour-chips--dock">
            {chips.map((q) => (
              <button key={q} className="tour-chip" data-crt-clear onClick={() => ask(q)} onKeyDown={(e) => e.stopPropagation()}>
                {q}
              </button>
            ))}
          </div>
        )}
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
        >
          {v.live && v.caption && v.lastLine ? (
            <>
              <span className="tour-turn" data-turn={shownTurn}>
                <span className="tour-turn-bars" aria-hidden>
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
                {v.lastLine.who === 'you' && shownTurn !== 'talking'
                  ? 'You'
                  : typing && shownTurn === 'listening'
                    ? 'Your turn'
                    : TURN_LABEL[shownTurn]}
                {shownTurn === 'talking' && !typing && <span className="tour-turn-hint">{'\u00b7'} talk to interrupt</span>}
              </span>
              <p
                ref={captionText}
                className={`tour-caption-text ${v.lastLine.who === 'you' ? 'tour-caption-text--you' : ''}`}
              >
                {v.caption}
              </p>
            </>
          ) : !v.live && v.recorded && (v.notice || v.over) ? (
            <>
              <span className="tour-caption-who">PIP</span>
              <p className="tour-caption-text">{v.recorded}</p>
            </>
          ) : v.live ? (
            <p className="tour-caption-text tour-caption-text--you">
              {typing ? 'Type a question below, or point at a photo.' : 'Listening… ask anything, or point at a photo.'}
            </p>
          ) : v.dozing ? (
            <p className="tour-caption-text tour-caption-text--you">
              {v.state === 'connecting'
                ? 'Waking up…'
                : typing
                  ? 'PIP is dozing. Type a question to wake it.'
                  : 'PIP is dozing. Just start talking, or press Space.'}
            </p>
          ) : null}
        </div>
      </div>

      {/*
       * The controls, in one bar under PIP, there from the first screen to
       * the last so nothing in it has to move between states (see TourBar).
       */}
      <div className="tour-controls">
        {typing && micNote && <p className="tour-mic-note-live">{micNote}</p>}
        <TourBar
            session={v.live || (v.dozing && typing)}
            canType={startCard}
            turn={shownTurn}
            // With the start card closed (a photo open, a notice read) the way into the tour is here.
            resume={
              v.live || v.over || startCard
                ? null
                : {
                    label: v.state === 'connecting' ? 'Connecting…' : v.paused ? 'Carry on' : 'Start the tour',
                    disabled: v.state === 'connecting',
                    onClick: () => void connect(),
                  }
            }
            typing={typing}
            typed={typed}
            setTyped={setTyped}
            onSubmit={submitTyped}
            onTalk={switchToVoice}
            onType={switchToText}
            muted={muted}
            setMuted={setMuted}
            silent={silent}
            setSilent={setSilent}
            lines={lines}
            history={history}
            setHistory={setHistory}
            timeLeft={v.timeLeft}
            onEnd={() => disconnect()}
          />
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
    {/* PIP's tube over the stage is in the shared layout (EntranceHost), carried on from the entrance. */}
    </>
  );
}
