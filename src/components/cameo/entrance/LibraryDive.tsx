'use client';

import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { TOUR_IMAGES } from '@/data/tour-images';
import {
  driftSpots,
  FLOAT_MAX,
  streamSrc as src,
  STREAM_LOOP,
  PERSPECTIVE,
  restBox,
  STREAM_CAMERA,
  STREAM_DEPTH,
  streamPresence,
  streamStarts,
  streamZ,
} from './library';
import './dive.css';

/** How far out a cruising photo starts to brake, in px of depth. */
const BRAKE_FROM = 1600;
/** How long the ring takes to fly off and fade once the landing begins. */
const RING_OUT_MS = 900;

/**
 * The stream the entrance flies through, in two groups at the same perspective:
 *
 * - The ring: a tunnel of larger pictures all round PIP, out to the edges of
 *   the window, that rush past close — the sense of speed. They never land.
 * - The landing photos: every photo of the tour, each on its own line out of
 *   the vanishing point — the line that ends, on the screen, at that photo's
 *   resting place on the tour (library.ts), where the tour's own cards
 *   are waiting, already in place, for the takeover to fade from over them.
 *
 * Both loop past the camera to the back. The stream lives in the takeover,
 * which stays up across the route change (EntranceHost), so once the tour
 * page is in place underneath, these same photos land (`land`) — no other
 * set takes over from them, and nothing jumps.
 *
 * Driven by distance travelled (`set`); whoever owns it decides the speed.
 * DOM, not WebGL: real aspect ratios and the stage's own frame. Small copies
 * through the image optimiser, preloaded early.
 */

const RING_COUNT = 22;
const RING_WIDTH = 150;

/** A fixed shuffle for the ring, the same on both pages. */
function rand(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

type Layer = {
  /** The photo's id, for a landing photo: the card it lands on has the same. */
  id?: string;
  src: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  tilt: number;
  /** A ring photo flies past and never lands; a landing photo comes to rest at depth 0. */
  ring: boolean;
  /** Landing photos: how far back it rests on the stage (library.ts), for the dimming it settles into. */
  depth: number;
  /** Its frame's width, and its glow's: the tour card's (TourCard's casing), so the frame never changes. */
  frame: number;
};

/**
 * A card's frame on the stage is 4px, thinner for a photo much narrower than
 * its box (TourCard: CASING.float, CASING_MIN_SCALE). The same here, from the
 * start, so a photo's frame is the one it will have at rest.
 */
const frameFor = (w: number, h: number, boxW: number, boxH: number) => 4 * Math.max(0.55, Math.min(w / boxW, h / boxH));

export type DiveHandle = {
  /** Place every photo for this much travel, in px of depth since the dive began. */
  set: (travel: number) => void;
  /** The whole stream's opacity, for coming up out of the dark and for going. */
  fade: (opacity: number) => void;
  preload: () => void;
  /**
   * The landing: from where the stream last was, each landing photo brakes
   * evenly to a stop where its line meets the screen — its resting place on
   * the stage — while the ring flies on and fades. Call once a frame with the
   * frame's time in seconds (already scaled for Motion) and the stream's
   * speed when the landing began. Returns how far the furthest photo still
   * has to come, in px of depth (Infinity while the ring is still going), and
   * 0 once everything is at rest — so the takeover can dissolve as the last
   * of them arrive rather than after.
   */
  land: (dt: number, velocity: number) => number;
};

/** The ring's layers: the same on both pages, so the tour can carry it on. */
function ringLayers(): Layer[] {
  return Array.from({ length: RING_COUNT }, (_, i) => {
    const img = TOUR_IMAGES[Math.floor((i * TOUR_IMAGES.length) / RING_COUNT)];
    const a = rand(i + 1) * Math.PI * 2;
    const r = 300 + rand(i + 40) * 520;
    const w = RING_WIDTH * (0.85 + rand(i + 80) * 0.4);
    return {
      src: src(img.path),
      x: Math.cos(a) * r,
      y: Math.sin(a) * r * 0.62,
      // Between the landing photos' depths, so the two groups interleave.
      z: -((i + 0.5) / RING_COUNT) * STREAM_DEPTH - 300,
      w,
      h: (w * img.height) / img.width,
      tilt: (rand(i + 120) - 0.5) * 10,
      ring: true,
      depth: 0,
      frame: 4,
    };
  });
}

const LibraryDive = forwardRef<DiveHandle, { focus: [number, number]; seed: number }>(function LibraryDive(
  { focus, seed },
  ref,
) {
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);
  /** Where the stream was last placed, so the landing starts exactly there. */
  const lastTravel = useRef(0);
  /** Each layer's depth, speed and brake once the landing has begun. */
  const landing = useRef<{ z: number; v: number; brake: number; passing: boolean; done: boolean }[] | null>(null);
  const ringClock = useRef(0);

  const layers = useMemo<Layer[]>(() => {
    const ring = ringLayers();
    const spots = driftSpots(seed);
    const starts = streamStarts(seed);
    const W = window.innerWidth;
    const H = window.innerHeight;
    const landing = TOUR_IMAGES.map((img) => {
      const spot = spots.get(img.id)!;
      const { w, h } = restBox(img, spot.size, W);
      return {
        id: img.id,
        src: src(img.path),
        // From the vanishing point to where it rests: its line.
        x: (spot.x / 100) * W - focus[0],
        y: (spot.y / 100) * H - focus[1],
        z: starts.get(img.id)!,
        w,
        h,
        tilt: spot.tilt,
        ring: false,
        depth: spot.depth,
        frame: frameFor(w, h, FLOAT_MAX.w * spot.size, FLOAT_MAX.h * spot.size),
      };
    });
    return [...ring, ...landing];
  }, [seed, focus]);

  useImperativeHandle(
    ref,
    () => ({
      preload: () => {
        for (const l of layers) new Image().src = l.src;
      },
      fade: (o) => {
        if (!root.current) return;
        root.current.style.opacity = String(o);
        root.current.style.visibility = o > 0 ? 'visible' : 'hidden';
      },
      land: (dt, velocity) => {
        if (!landing.current) {
          landing.current = layers.map((l) => {
            const z = streamZ(l.z, lastTravel.current);
            return { z, v: velocity, brake: 0, passing: z > -60, done: false };
          });
          ringClock.current = 0;
        }
        ringClock.current += dt;
        const ringK = Math.min(1, (ringClock.current * 1000) / RING_OUT_MS);
        let furthest = 0;
        layers.forEach((l, i) => {
          const st = landing.current![i];
          const el = els.current[i];
          if (!el) return;
          if (l.ring) {
            // On past the camera, slowing a little, fading; never round again.
            st.z += st.v * (1 - ringK * 0.6) * dt;
            const { opacity, brightness } = streamPresence(Math.min(st.z, STREAM_CAMERA));
            el.style.opacity = String(st.z > STREAM_CAMERA ? 0 : opacity * (1 - ringK));
            el.style.transform = `translate3d(${l.x - l.w / 2}px, ${l.y - l.h / 2}px, ${st.z}px) rotate(${l.tilt}deg)`;
            el.style.filter = `brightness(${brightness})`;
            return;
          }
          if (!st.done) {
            const d = -st.z;
            // Within braking distance: brake evenly from here to the screen. One
            // already at or past the screen has gone by, and comes round again.
            if (!st.brake && d > 0 && d <= BRAKE_FROM && !(st.passing && st.z > -STREAM_CAMERA)) {
              st.brake = (st.v * st.v) / (2 * d);
            }
            if (st.brake) st.v = Math.max(0, st.v - st.brake * dt);
            st.z += st.v * dt;
            if (!st.brake && st.z > STREAM_CAMERA) st.z -= STREAM_LOOP;
            if (st.brake && (st.v <= 0 || st.z >= 0)) {
              st.z = 0;
              st.done = true;
            }
            furthest = Math.max(furthest, st.done ? 0 : st.brake ? -st.z : Infinity);
          }
          const { opacity, brightness } = streamPresence(st.z);
          // Coming to rest, it takes on the look of the tour's card waiting
          // there (tour.css, the dark room): the picture dimmed and greyed a
          // little, set back by its depth, in the stage's teal frame.
          const rest = st.brake ? Math.max(0, 1 - -st.z / BRAKE_FROM) : 0;
          el.style.opacity = String(st.done ? 1 : opacity);
          el.style.transform = `translate3d(${l.x - l.w / 2}px, ${l.y - l.h / 2}px, ${st.z}px) rotate(${l.tilt}deg)`;
          el.style.filter = `brightness(${brightness * (1 - l.depth * 0.45 * rest)}) blur(${(l.depth * 1.3 * rest).toFixed(2)}px)`;
          const img = el.firstElementChild as HTMLElement | null;
          if (img) img.style.filter = `brightness(${1 - 0.5 * rest}) saturate(${1 - 0.3 * rest})`;
        });
        return ringK < 1 ? Math.max(furthest, 1) : furthest;
      },
      set: (travel) => {
        lastTravel.current = travel;
        layers.forEach((l, i) => {
          const el = els.current[i];
          if (!el) return;
          const z = streamZ(l.z, travel);
          const { opacity, brightness } = streamPresence(z);
          el.style.opacity = String(opacity);
          el.style.transform = `translate3d(${l.x - l.w / 2}px, ${l.y - l.h / 2}px, ${z}px) rotate(${l.tilt}deg)`;
          el.style.filter = `brightness(${brightness})`;
        });
      },
    }),
    [layers],
  );


  return (
    <div
      ref={root}
      className="entrance-dive"
      aria-hidden="true"
      style={{
        perspective: `${PERSPECTIVE}px`,
        perspectiveOrigin: `${focus[0]}px ${focus[1]}px`,
        visibility: 'hidden',
        opacity: 0,
      }}
    >
      <div className="entrance-dive-origin" style={{ left: focus[0], top: focus[1] }}>
        {layers.map((l, i) => (
          <div
            key={i}
            ref={(el) => {
              els.current[i] = el;
            }}
            className="entrance-dive-photo"
            data-id={l.id}
            style={{
              width: l.w,
              height: l.h,
              opacity: 0,
              borderWidth: l.frame,
              boxShadow: `0 0 ${l.frame}px ${l.frame}px var(--dive-glow)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- moved per frame in 3D; next/image adds nothing here */}
            <img src={l.src} alt="" draggable={false} />
          </div>
        ))}
      </div>
    </div>
  );
});

export default LibraryDive;
