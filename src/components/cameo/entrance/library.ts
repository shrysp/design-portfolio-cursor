import { CHAPTERS, TOUR_IMAGES, chapterOf, type ChapterId } from '@/data/tour-images';

/**
 * The library of photos as the entrance's stream and the tour's stage both
 * see it — one set of photos, one layout, one perspective — so the stream the
 * visitor flies through is the stage they land on: every photo flies along
 * its own line out of the vanishing point, loops past the camera, and on its
 * last pass slows to a stop where that line meets the screen, which is where
 * the tour's card for it is waiting.
 *
 * The layout is random, but from a seed: the entrance picks it before the
 * dive and hands it to the tour page, so both draw the same photo at the
 * same place. A visit that arrives any other way gets a fresh seed.
 */

/** A small fast seeded generator (mulberry32). */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const newSeed = () => Math.floor(Math.random() * 4294967296);

/**
 * The layout for this visit: one per browser session, so a visitor who
 * leaves the tour and comes back finds the library where it was — and the
 * entrance's stream and the tour's stage are always drawn from the same one.
 * A new session gets a new scatter.
 */
export function sessionSeed(): number {
  try {
    const saved = Number(sessionStorage.getItem('tour.seed'));
    if (Number.isInteger(saved) && saved > 0) return saved;
    const seed = newSeed() || 1;
    sessionStorage.setItem('tour.seed', String(seed));
    return seed;
  } catch {
    return newSeed();
  }
}

/**
 * The small copy of a photo the stream draws, through the image optimiser.
 */
export const streamSrc = (path: string) => `/_next/image?url=${encodeURIComponent(path)}&w=384&q=60`;

/**
 * A resting photo's box on the stage, before its own size multiplier, in px
 * (and vw, for narrow windows). 15% under what it was (112 × 84, 7.8vw), so
 * the photos low on the stage stay clear of PIP's column and the bar.
 */
export const FLOAT_MAX = { w: 95, h: 71, vw: 6.6 };

/**
 * The drift layout: one loose group per chapter, each a scatter across a wide
 * patch of its side of the stage, at different depths — as if the photos the
 * dive flew through had come to rest in the air. A near photo is bigger,
 * sharper and on top; a far one smaller, dimmer and softer, and each hangs a
 * little askew. A chapter's centre piece (first listed) is always among the near.
 *
 * Spread by best-candidate sampling — of several random points, the one
 * furthest from those already placed — so a scatter never clumps or lines up.
 */
export const DRIFT_REGIONS: Record<ChapterId, { cx: number; cy: number; rx: number; ry: number }> = {
  rit: { cx: 15, cy: 32, rx: 10, ry: 16 },
  config: { cx: 15, cy: 75, rx: 9, ry: 10 },
  rochester: { cx: 83, cy: 28, rx: 9.5, ry: 13 },
  'bay-area': { cx: 83, cy: 59, rx: 8.5, ry: 10 },
  elsewhere: { cx: 83, cy: 85, rx: 8, ry: 6.5 },
};

/** Where a photo rests: its centre as percentages of the stage, its size, how far back and how askew. */
export type DriftSpot = { x: number; y: number; size: number; depth: number; tilt: number };

export function driftSpots(seed: number): Map<string, DriftSpot> {
  const random = seeded(seed);
  const out = new Map<string, DriftSpot>();
  for (const { id: chapter } of CHAPTERS) {
    const { cx, cy, rx, ry } = DRIFT_REGIONS[chapter];
    const placed: { x: number; y: number }[] = [];
    TOUR_IMAGES.filter((img) => chapterOf(img.id) === chapter).forEach((img, rank) => {
      let best = { x: cx, y: cy };
      let bestGap = -1;
      for (let tries = 0; tries < 24; tries++) {
        // Uniform inside the ellipse; the stage is about 1.6 times as wide as it is tall.
        const a = random() * Math.PI * 2;
        const d = Math.sqrt(random());
        const c = { x: cx + Math.cos(a) * rx * d, y: cy + Math.sin(a) * ry * d };
        const gap = placed.length ? Math.min(...placed.map((q) => Math.hypot((q.x - c.x) * 1.6, q.y - c.y))) : Infinity;
        if (gap > bestGap) {
          best = c;
          bestGap = gap;
        }
      }
      placed.push(best);
      const depth = rank === 0 ? 0.05 : 0.15 + random() * 0.85;
      out.set(img.id, { x: best.x, y: best.y, size: 1.3 - depth * 0.7, depth, tilt: (random() - 0.5) * 9 });
    });
  }
  return out;
}

/** A resting photo's width and height on the stage, as TourCard fits it: its own shape inside its box. */
export function restBox(img: { width: number; height: number }, size: number, viewportW: number) {
  const box = { w: FLOAT_MAX.w * size, h: FLOAT_MAX.h * size };
  const ratio = img.width > 0 && img.height > 0 ? img.width / img.height : box.w / box.h;
  const w = Math.min(box.w, box.h * ratio, (FLOAT_MAX.vw * size * viewportW) / 100);
  return { w, h: w / ratio };
}

/*
 * The stream's perspective. A photo at depth z (0 is the screen, negative is
 * away from the viewer) is drawn at PERSPECTIVE / (PERSPECTIVE - z) of its
 * size, that far along its line from the vanishing point.
 */
export const PERSPECTIVE = 900;
/** How deep the stream is, front to back, in px of depth. */
export const STREAM_DEPTH = 5200;
/** Where the camera is: a photo past it has gone by, and loops to the back. */
export const STREAM_CAMERA = 760;
export const STREAM_LOOP = STREAM_DEPTH + STREAM_CAMERA;
/** The stream's speed, in px of depth per second at full motion. The entrance builds up to it; the tour slows from it. */
export const STREAM_CRUISE = 4200;

/** Where each photo starts in the stream, spread evenly through its depth in a seeded order. */
export function streamStarts(seed: number): Map<string, number> {
  const random = seeded(seed ^ 0x5bd1e995);
  const order = TOUR_IMAGES.map((img) => ({ id: img.id, k: random() })).sort((a, b) => a.k - b.k);
  return new Map(order.map(({ id }, i) => [id, -(i / order.length) * STREAM_DEPTH - 300]));
}

/** A photo's depth after the stream has travelled this far, looping past the camera to the back. */
export function streamZ(start: number, travel: number) {
  return ((((start + travel + STREAM_DEPTH) % STREAM_LOOP) + STREAM_LOOP) % STREAM_LOOP) - STREAM_DEPTH;
}

/** How bright and present a photo is at depth z: out of the dark far away, gone just before the lens. */
export function streamPresence(z: number) {
  const near = 1 - Math.min(1, Math.max(0, (z - (STREAM_CAMERA - 420)) / 380));
  const far = Math.min(1, Math.max(0, (z + STREAM_DEPTH * 0.92) / (STREAM_DEPTH * 0.4)));
  return { opacity: far * near, brightness: 0.45 + 0.55 * far };
}
