'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Glass from '@/components/Glass';
import { EASE_OUT } from '@/lib/easing';
import { Dock, DockRow, InviteBody, PipHandle, SmallPip, TuckButton, dots, glass, useInvite, useSpeed } from './shared';

type Props = { returning: boolean; entrance?: IslandEntrance };

/** How Island's room comes in: grown up out of a blur, or the glass opening first and the room scaling in after (from its middle, or from PIP). */
export type IslandEntrance = 'grow' | 'scale' | 'pip';

/* ── 1. Rise ──────────────────────────────────────────────────────────────
   PIP gets a seat in the dock. The toast stands above the dock and, when it
   goes, shrinks into PIP's seat rather than fading where it was, so the
   eye is taken to where it lives now. */

const RISE_W = 380;

export function Rise({ returning }: Props) {
  const inv = useInvite({ returning });
  const k = useSpeed();
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const go = useRef<HTMLButtonElement>(null);
  const [originX, setOriginX] = useState(RISE_W / 2);

  // The card scales from PIP's seat, wherever the dock has put it.
  useLayoutEffect(() => {
    const w = wrap.current?.getBoundingClientRect();
    const h = handle.current?.getBoundingClientRect();
    if (w && h) setOriginX(h.left + h.width / 2 - (w.left + w.width / 2 - RISE_W / 2));
  }, [inv.ready, inv.expanded]);

  const away = reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: 16, filter: 'blur(6px)' };

  return (
    <div ref={wrap} className="relative">
      <AnimatePresence>
        {inv.expanded && (
          <motion.aside
            key="card"
            {...inv.bind}
            className={`di-smoke di-rise-card ${dots.variable}`}
            aria-label="Get to know me"
            style={{ transformOrigin: `${originX}px 100%` }}
            initial={away}
            // Nothing left on the card once it's in: a leftover filter keeps it on a layer of its own, rasterised apart from the page.
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
            exit={{ ...away, transition: { duration: 0.22 * k, ease: EASE_OUT } }}
            transition={{ duration: 0.38 * k, ease: EASE_OUT }}
          >
            <InviteBody goRef={go} onStart={() => inv.start(go.current)} onTuck={inv.tuck} />
          </motion.aside>
        )}
      </AnimatePresence>
      <Dock
        lead={
          <span {...inv.bind} className="inline-flex">
            <PipHandle ref={handle} expanded={inv.expanded} onClick={inv.toggle} />
          </span>
        }
      />
    </div>
  );
}

/* ── 2. Island ────────────────────────────────────────────────────────────
   The dock is the invitation. It grows upward the way the tour's own bar
   does for its transcript (TourBar): the room opens as a layer over the row
   of buttons, height from nothing and out of a blur, while the glass eases
   its minimum width from the row's real width to the room's. The room's
   contents are always their open width, centred, so nothing re-wraps — the
   glass uncovers them from the middle out. The row never moves for it, and
   as "Top" comes and goes the shut glass follows the row at once.

   Or, scaled: the room scales in as the glass opens, the two landing
   together — from its middle, or from PIP's seat. Going, the
   room goes first and the glass closes after it. */

const ISLAND_W = 372;
const ISLAND_IN = 0.3;
const ISLAND_OUT = 0.24;
/** Staged: how far into the glass opening the room starts scaling in. 0: together, the room scaling as the glass opens. */
const ROOM_AFTER = 0;
/** Staged: how long the room takes to go, before the glass closes. */
const ROOM_OUT = 0.14;

export function Island({ returning, entrance = 'grow' }: Props) {
  const inv = useInvite({ returning });
  const k = useSpeed();
  const reduce = useReducedMotion();
  const shell = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const go = useRef<HTMLButtonElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const [originX, setOriginX] = useState(ISLAND_W / 2);
  const wide = inv.expanded;
  const wideRef = useRef(wide);
  wideRef.current = wide;

  // Shut, the glass is held to its row's width, followed as the row changes.
  useLayoutEffect(() => {
    const r = row.current;
    const s = shell.current;
    if (!r || !s) return;
    const fit = () => {
      s.style.minWidth = wideRef.current ? '' : `${r.offsetWidth}px`;
    };
    fit();
    const watch = new ResizeObserver(fit);
    watch.observe(r);
    return () => watch.disconnect();
  }, []);
  // Only opening and shutting ease; set while rendering, so the easing is on in the same commit as the change.
  const [wasWide, setWasWide] = useState(wide);
  const [morph, setMorph] = useState(false);
  if (wasWide !== wide) {
    setWasWide(wide);
    setMorph(true);
  }
  useLayoutEffect(() => {
    const s = shell.current;
    const r = row.current;
    if (s && r) s.style.minWidth = wide ? '' : `${r.offsetWidth}px`;
  }, [wide]);
  // Staged, shutting: the glass holds its width until the room has gone out of it.
  const hold = entrance !== 'grow' && !wide && !reduce ? ROOM_OUT * k : 0;
  useEffect(() => {
    if (!morph) return;
    const id = window.setTimeout(() => setMorph(false), (ISLAND_IN * k + hold) * 1000 + 60);
    return () => window.clearTimeout(id);
  }, [morph, wide, k, hold]);

  // For scaling from PIP: where PIP's seat is across the room, which is centred over the row.
  useLayoutEffect(() => {
    const h = handle.current?.getBoundingClientRect();
    const r = row.current?.getBoundingClientRect();
    if (wide && h && r) setOriginX(h.left + h.width / 2 - (r.left + r.width / 2 - (ISLAND_W - 12) / 2));
  }, [wide]);

  const d = (s: number) => (reduce ? 0 : s * k);
  const staged = entrance !== 'grow';
  const layer = staged
    ? {
        initial: 'shut',
        animate: 'open',
        exit: 'shut',
        variants: {
          open: { height: 'auto', transition: { duration: d(ISLAND_IN), ease: EASE_OUT, delayChildren: d(ROOM_AFTER) } },
          shut: { height: 0, transition: { duration: d(ISLAND_OUT), ease: EASE_OUT, when: 'afterChildren' } },
        },
      }
    : {
        initial: { height: 0, opacity: 0, filter: 'blur(8px)' },
        animate: { height: 'auto', opacity: 1, filter: 'blur(0px)', transition: { duration: d(ISLAND_IN), ease: EASE_OUT } },
        exit: { height: 0, opacity: 0, filter: 'blur(8px)', transition: { duration: d(ISLAND_OUT), ease: EASE_OUT } },
      };
  const room = staged
    ? {
        style: { transformOrigin: entrance === 'pip' ? `${originX}px 100%` : '50% 100%' },
        variants: {
          open: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: d(ISLAND_IN), ease: EASE_OUT } },
          shut: { opacity: 0, scale: entrance === 'pip' ? 0.6 : 0.92, filter: 'blur(4px)', transition: { duration: d(ROOM_OUT), ease: EASE_OUT } },
        },
      }
    : {};

  return (
    <Glass
      ref={shell}
      {...glass}
      className={`di-island ${wide ? 'di-island--wide' : ''} ${morph ? 'di-island--morph' : ''}`}
      style={{ '--island-hold': `${hold}s` } as React.CSSProperties}
    >
      <AnimatePresence initial={false}>
        {wide && (
          <motion.div key="room" {...inv.bind} className="di-island-layer" {...layer}>
            <div className="di-island-layer-in">
              <motion.div className={`di-island-screen ${dots.variable}`} {...room}>
                <InviteBody goRef={go} onStart={() => inv.start(go.current)} onTuck={inv.tuck} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={row} className="di-island-row">
        <DockRow
          lead={
            <span {...inv.bind} className="inline-flex">
              <PipHandle ref={handle} expanded={inv.expanded} onClick={inv.toggle} />
            </span>
          }
        />
      </div>
    </Glass>
  );
}

/* ── 3. Capsule ───────────────────────────────────────────────────────────
   A second, dark capsule beside the dock, the toast's smoked glass at the
   dock's exact height. It slides out from behind the dock wide open, then
   draws in to just PIP; hovering PIP draws the words and the button back
   out. The dock never moves: the capsule grows leftwards, away from it. */

export function Capsule({ returning }: Props) {
  const inv = useInvite({ returning });
  const k = useSpeed();
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const go = useRef<HTMLButtonElement>(null);
  const [eager, setEager] = useState(false);
  // Shut, it's a circle as tall as the dock.
  const [h, setH] = useState(44);
  useLayoutEffect(() => setH(wrap.current?.offsetHeight ?? 44), []);

  const ease = { duration: (inv.expanded ? 0.4 : 0.28) * k, ease: EASE_OUT };

  return (
    <div ref={wrap} className="relative">
      <Dock />
      <AnimatePresence>
        {inv.ready && (
          <motion.aside
            key="capsule"
            {...inv.bind}
            aria-label="Get to know me"
            className={`di-smoke di-capsule ${dots.variable}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0, width: inv.expanded ? 'auto' : h }}
            transition={ease}
          >
            <button type="button" className="di-capsule-pip" style={{ width: h }} onClick={inv.toggle} aria-expanded={inv.expanded} aria-label="Get to know me">
              <SmallPip height={h - 18} state={eager ? 'excited' : inv.expanded ? 'happy' : null} />
            </button>
            <motion.div
              className="di-capsule-rest"
              aria-hidden={!inv.expanded}
              inert={!inv.expanded}
              animate={inv.expanded ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(3px)' }}
              transition={{ duration: (inv.expanded ? 0.28 : 0.14) * k, delay: inv.expanded ? 0.08 * k : 0, ease: EASE_OUT }}
            >
              <span className="di-capsule-words">
                <span className="tour-toast-title">Get to know me</span>
                <span className="tour-toast-text">Ask PIP about me.</span>
              </span>
              <button
                ref={go}
                type="button"
                className="entrance-btn entrance-btn--primary di-capsule-go"
                onClick={() => inv.start(go.current)}
                onPointerEnter={() => setEager(true)}
                onPointerLeave={() => setEager(false)}
              >
                Say hello
              </button>
              <TuckButton onClick={inv.tuck} className="di-capsule-tuck" />
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

export const VARIANTS = [
  { id: 'rise', name: 'Rise', Component: Rise, idea: 'PIP gets a seat in the dock. The toast stands above it and shrinks into that seat when it goes, so the eye follows it home. Hover the seat to bring it back.' },
  { id: 'island', name: 'Island', Component: Island, idea: 'The dock grows the room upward the way the tour’s bar opens its transcript: height out of a blur, the glass easing wider from the middle out. Hover PIP’s seat to open it again.' },
  { id: 'capsule', name: 'Capsule', Component: Capsule, idea: 'A dark capsule beside the dock, at its exact height, slides out wide, then draws in to just PIP. Hover PIP to draw the words back out. The dock never moves.' },
] as const;
