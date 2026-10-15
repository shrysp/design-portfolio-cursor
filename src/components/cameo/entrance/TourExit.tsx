'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createField, STAGE_BG } from './field';
import { easeIn, easeOut, smoothstep, squeeze, tween, wait } from './TourEntrance';

/** Where the tour's Back goes: the case study, at its section about the tour. */
export const CASE_STUDY = '/projects/cameo';
const SECTION = 'tour';

/** How long the tour takes to squeeze to a dot, and the case study to open out of it. */
const OFF_MS = 650;
const ON_MS = 600;
/** The dot, held for a beat while the page changes underneath. */
const HOLD_MS = 120;

/**
 * Leaving the tour: the tube switches off, the way the takeover closes. The
 * tour squeezes to a line and a dot, the page changes behind the dark, and
 * the case study opens back out of the same dot.
 *
 * Rendered by EntranceHost, in the layout both pages share, so the dark and
 * the dot stay up across the route change. The shader draws the dark and the
 * burning line (field.ts, `off`); the pages themselves are squeezed on the
 * same curve (`squeeze`), so the two stay together.
 */
export default function TourExit({ onDone }: { onDone: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const alive = useRef(true);
  /** Set once the tour has gone to a dot and the case study has been asked for. */
  const arrived = useRef<(() => void) | null>(null);

  useEffect(() => {
    alive.current = true;
    const isAlive = () => alive.current;
    const el = canvas.current;
    const f = el ? createField(el, 'screen', { on: 0, off: 0, glow: 0 }) : null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const run = async () => {
      if (reduced || !f) {
        router.push(`${CASE_STUDY}#${SECTION}`);
        onDone();
        return;
      }
      const stage = document.querySelector<HTMLElement>('.tour-stage');
      // Dark behind everything for the whole way, in case the shader's first
      // frame is late: what the squeeze uncovers is the room, never the page.
      document.documentElement.style.background = STAGE_BG;
      // And its first frames drawn before anything moves.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const setOff = (k: number, page: HTMLElement | null) => {
        f.uniforms.off = k;
        f.uniforms.glow = smoothstep(0.35, 1, k);
        squeeze(page, k);
      };
      await tween(OFF_MS, easeIn, (k) => setOff(k, stage), isAlive);
      if (!alive.current) return;
      // The case study, behind the dark; it opens once it is there.
      await new Promise<void>((resolve) => {
        arrived.current = resolve;
        router.push(CASE_STUDY, { scroll: false });
      });
      if (!alive.current) return;
      // At the tour's section, before it opens: the dot opens on where they left from.
      document.getElementById(SECTION)?.scrollIntoView({ block: 'start', behavior: 'instant' });
      const page = document.querySelector<HTMLElement>('[data-case-study]');
      setOff(1, page);
      await wait(HOLD_MS);
      await tween(ON_MS, easeOut, (k) => setOff(1 - k, page), isAlive);
      squeeze(page, 0);
      if (alive.current) onDone();
    };
    void run();

    return () => {
      alive.current = false;
      document.documentElement.style.background = '';
      squeeze(document.querySelector<HTMLElement>('[data-case-study]'), 0);
      f?.destroy();
    };
    // Runs once per exit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The route has changed: let the case study open.
  useEffect(() => {
    if (pathname !== CASE_STUDY || !arrived.current) return;
    // A frame for the page to be in the document.
    requestAnimationFrame(() => arrived.current?.());
  }, [pathname]);

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh', zIndex: 10000, pointerEvents: 'none' }}
    />
  );
}
