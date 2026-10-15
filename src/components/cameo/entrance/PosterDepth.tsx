'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { TOUR_IMAGES } from '@/data/tour-images';
import { seeded, streamSrc } from './library';

/**
 * The tour's photos in depth on the poster, in the dive's own perspective
 * (LibraryDive): each photo flies along a line out of a vanishing point at
 * PIP, comes past the viewer and loops to the back — the dive, small. Pressing
 * toward the button speeds it up to the dive's rush.
 *
 * Scaled to the poster, not the window, so the numbers here are its own.
 */
/** The perspective, in px: shorter than the dive's 900, since the poster is a third of a window. */
const PERSPECTIVE = 560;
/** How deep the stream is, and where the viewer is: past it, a photo loops to the back. */
const DEPTH = 2600;
const CAMERA = 300;
const LOOP = DEPTH + CAMERA;
/** Where PIP is on the poster, as a share of its width and height: the vanishing point. */
const VANISH = [0.5, 0.36] as const;

type Layer = { src: string; x: number; y: number; z: number; w: number; h: number; tilt: number };

/** A photo's depth after this much travel, looping past the viewer to the back. */
const zAt = (start: number, travel: number) => ((((start + travel + DEPTH) % LOOP) + LOOP) % LOOP) - DEPTH;

/** Out of the dark far away, gone just before the viewer; dimmer the further back. */
function presence(z: number) {
  const far = Math.min(1, Math.max(0, (z + DEPTH * 0.95) / (DEPTH * 0.45)));
  const near = 1 - Math.min(1, Math.max(0, (z - (CAMERA - 200)) / 180));
  return { opacity: far * near, brightness: 0.35 + 0.6 * far };
}

function layersFor(W: number): Layer[] {
  const random = seeded(0x7a11);
  const pics = TOUR_IMAGES.map((img) => ({ img, k: random() }))
    .sort((a, b) => a.k - b.k)
    .map(({ img }) => img);
  // Two fans, left and right of PIP, never straight up or down: a photo
  // coming past above or below would cross the words.
  const count = 22;
  return Array.from({ length: count }, (_, i) => {
    const img = pics[i % pics.length];
    const side = i % 2 ? 1 : -1;
    const a = (random() - 0.5) * 1.5;
    const r = W * (0.3 + random() * 0.18);
    const w = 70 + random() * 34;
    return {
      src: streamSrc(img.path),
      x: side * Math.cos(a) * r,
      y: Math.sin(a) * r * 0.7,
      z: -(i / count) * DEPTH - 200,
      w,
      h: (w * img.height) / img.width,
      tilt: (random() - 0.5) * 12,
    };
  });
}

export default function PosterDepth({
  speed,
  warp,
  rush,
  lit,
}: {
  /** Px of depth a second, at rest. */
  speed: number;
  /** And while the pointer is at the button. */
  warp: number;
  rush: boolean;
  /** The room woken: brighter photos (as in the Scatter look). */
  lit: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const [width, setWidth] = useState<number | null>(null);
  const layers = useMemo(() => (width ? layersFor(width) : []), [width]);

  // Read on every frame, so a change of speed doesn't restart the loop.
  const live = useRef({ speed, warp, rush, lit });
  live.current = { speed, warp, rush, lit };

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!layers.length) return;
    let travel = 900;
    let v = live.current.speed;
    let glow = 0;
    let last = performance.now();
    let frame = 0;
    let visible = true;

    const place = () => {
      layers.forEach((l, i) => {
        const el = els.current[i];
        if (!el) return;
        const z = zAt(l.z, travel);
        const { opacity, brightness } = presence(z);
        el.style.opacity = String(opacity);
        el.style.transform = `translate3d(${l.x - l.w / 2}px, ${l.y - l.h / 2}px, ${z}px) rotate(${l.tilt}deg)`;
        el.style.filter = `brightness(${brightness * (0.6 + 0.45 * glow)}) saturate(${0.7 + 0.3 * glow})`;
      });
    };

    // Still, for anyone who asks for less motion: one frame, a little way in.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      glow = live.current.lit ? 1 : 0;
      place();
      return;
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { speed, warp, rush, lit } = live.current;
      // Speeds up quickly and settles back slowly, as the dive does.
      v += ((rush ? warp : speed) - v) * Math.min(1, dt * (rush ? 2.5 : 1.2));
      glow += ((rush || lit ? 1 : 0) - glow) * Math.min(1, dt * 4);
      travel += v * dt;
      place();
      frame = requestAnimationFrame(tick);
    };
    // Only while it can be seen.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting === visible) return;
      visible = e.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    });
    if (root.current) io.observe(root.current);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [layers]);

  return (
    <div
      ref={root}
      className="tour-poster-depth"
      aria-hidden="true"
      style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: `${VANISH[0] * 100}% ${VANISH[1] * 100}%` }}
    >
      <div className="tour-poster-depth-origin" style={{ left: `${VANISH[0] * 100}%`, top: `${VANISH[1] * 100}%` }}>
        {layers.map((l, i) => (
          <div
            key={i}
            ref={(el) => {
              els.current[i] = el;
            }}
            className="tour-poster-depth-photo"
            style={{ width: l.w, height: l.h, opacity: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- moved per frame in 3D; next/image adds nothing here */}
            <img src={l.src} alt="" draggable={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
