'use client';

import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Doto } from 'next/font/google';
import { XLogo } from '@phosphor-icons/react';
import { IconArrowUp, IconFile } from 'nucleo-micro-bold-essential';
import { AnimatePresence, motion } from 'framer-motion';
import { IconLinkedin } from 'nucleo-social-media';
import { HOUSING_W, PIP, housingHeight } from '@shrysp/cameo';
import { Character } from '@shrysp/cameo/react';
import Glass from '@/components/Glass';
import EmailCopyButton from '@/components/EmailCopyButton';
import { useEntrance } from '@/components/cameo/entrance/context';
import '@shrysp/cameo/styles.css';
import '@/components/cameo/entrance/entrance.css';
import '@/components/cameo/entrance/toast.css';
import './dock-invite.css';

export const dots = Doto({ subsets: ['latin'], axes: ['ROND'], variable: '--font-dot', display: 'swap' });

/** The bench's slow-motion dial: every duration here is multiplied by it. */
export const Speed = createContext(1);
export const useSpeed = () => useContext(Speed);

/** A beat after the page, as the toast does, so it arrives rather than being part of the load. */
const SHOW_AFTER_MS = 1200;
/** How long the first-load invitation stays out before it tucks itself into the dock. */
const INTRO_HOLD_MS = 7000;
/** Hover intent: a pointer passing over the dock on its way somewhere shouldn't open it. */
const HOVER_IN_MS = 120;
/** Grace to cross the gap from the handle to the card without it closing. */
const HOVER_OUT_MS = 280;
/** Scrolling this far during the first-load invitation means they're reading: it tucks away. */
const SCROLL_TUCK_PX = 240;

/**
 * The invitation's states, shared by every variant: out on first load, tucked
 * into the dock by its chevron, the clock or a scroll, and out again while the
 * handle is hovered or focused (or tapped, where there is no hover).
 */
export function useInvite({ returning }: { returning: boolean }) {
  const k = useSpeed();
  const open = useEntrance();
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [intro, setIntro] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const hovering = useRef(false);
  const timer = useRef<number>(0);

  useEffect(() => {
    setReady(false);
    setExpanded(false);
    setIntro(false);
    const t = window.setTimeout(() => {
      setReady(true);
      if (!returning) {
        setExpanded(true);
        setIntro(true);
      }
    }, SHOW_AFTER_MS * k);
    return () => window.clearTimeout(t);
  }, [returning, k]);

  useEffect(() => {
    fetch('/api/tour/unlock', { cache: 'no-store' })
      .then((r) => (r.ok ? (r.json() as Promise<{ unlocked?: boolean }>) : null))
      .then((s) => setUnlocked(!!s?.unlocked))
      .catch(() => {});
  }, []);

  const tuck = useCallback(() => {
    window.clearTimeout(timer.current);
    setIntro(false);
    setExpanded(false);
  }, []);

  // The first-load invitation goes on its own: on the clock, unless it's being looked at, or on a scroll.
  useEffect(() => {
    if (!intro) return;
    const t = window.setTimeout(() => {
      setIntro(false);
      if (!hovering.current) tuck();
    }, INTRO_HOLD_MS * k);
    const onScroll = () => window.scrollY > SCROLL_TUCK_PX && tuck();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
    };
  }, [intro, k, tuck]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && tuck();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded, tuck]);

  const enter = () => {
    hovering.current = true;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setExpanded(true), HOVER_IN_MS);
  };
  const leave = () => {
    hovering.current = false;
    window.clearTimeout(timer.current);
    if (intro) return;
    timer.current = window.setTimeout(tuck, HOVER_OUT_MS * k);
  };

  /** Hover and focus for the wrapper around the handle and the card. Touch has no hover: it taps the handle. */
  const bind = {
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === 'mouse' && enter(),
    onPointerLeave: (e: React.PointerEvent) => e.pointerType === 'mouse' && leave(),
    onFocus: enter,
    onBlur: (e: React.FocusEvent) => !e.currentTarget.contains(e.relatedTarget) && leave(),
  };

  const toggle = () => {
    if (expanded) return tuck();
    window.clearTimeout(timer.current);
    setExpanded(true);
  };

  const start = (el: HTMLElement | null) => {
    const r = el?.getBoundingClientRect();
    open({
      origin: r ? [r.left + r.width / 2, r.top + r.height / 2] : [window.innerWidth / 2, window.innerHeight / 2],
      theme: 'screen',
      unlocked,
      back: 'Back',
      onClosed: () => el?.focus(),
    });
  };

  return { ready, expanded, intro, bind, tuck, toggle, start };
}

/** The dock as it is on the site (StickyFooter), with room at its start for the tour's handle. */
const glass = { blur: 2, saturate: 2, tint: 1, refraction: 26, bezel: 10 };

/** As the site's dock: "Top" once the page is half a screen down. */
function useShowTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const check = () => setShow(window.scrollY > window.innerHeight / 2);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);
  return show;
}

export function DockRow({ lead }: { lead?: ReactNode }) {
  const showTop = useShowTop();
  return (
    // With PIP leading, a little more room at the left edge: its housing is flatter than the round buttons.
    <div className={`flex items-center p-1.5 ${lead ? 'pl-3' : ''}`}>
      {lead && (
        <>
          {lead}
          <div aria-hidden className="mx-2.5 h-5 w-px bg-stone-900/15 shadow-[1px_0_0_rgba(255,255,255,0.7)]" />
        </>
      )}
      <div className="flex items-center gap-1.5">
        <a href="https://x.com/ShreyasPatil_" target="_blank" rel="noopener noreferrer" aria-label="Follow on X" className="aqua aqua-round size-8">
          <XLogo size={16} weight="fill" />
        </a>
        <button type="button" aria-label="Copy email" className="aqua aqua-round size-8">
          <EmailCopyButton copied={false} />
        </button>
        <a href="https://www.linkedin.com/in/shreyastpatil/" target="_blank" rel="noopener noreferrer" aria-label="Connect on LinkedIn" className="aqua aqua-round size-8">
          <IconLinkedin size={16} />
        </a>
      </div>
      <div aria-hidden className="mx-2.5 h-5 w-px bg-stone-900/15 shadow-[1px_0_0_rgba(255,255,255,0.7)]" />
      <a href="/document/Shreyas-Patil-Resume-2025.pdf" target="_blank" rel="noopener noreferrer" className="aqua h-8 pl-2 pr-2.5 gap-1 text-sm font-medium">
        <IconFile size={16} />
        Resume
      </a>
      {/* As StickyFooter: the dock widens to let "Top" in, the wrapper clipping while it grows. */}
      <AnimatePresence initial={false}>
        {showTop && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden -my-1 py-1"
          >
            <button
              type="button"
              aria-label="Scroll to top"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="aqua ml-1.5 mr-px h-8 pl-2 pr-2.5 gap-1 text-sm font-medium"
            >
              <IconArrowUp size={16} />
              Top
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Dock({ lead, className, style }: { lead?: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <Glass {...glass} className={className} style={style}>
      <DockRow lead={lead} />
    </Glass>
  );
}

export { glass };

/** PIP's width for a height: the housing is 1.31 times as wide as it is tall. */
const PIP_RATIO = HOUSING_W / housingHeight(PIP.silhouette);

/** PIP small enough for the dock, its width from its height (dock-invite.css keeps it sharp). */
export function SmallPip({ height, state }: { height: number; state?: 'happy' | 'excited' | null }) {
  const width = Math.round(height * PIP_RATIO);
  return (
    <span className="di-pip" style={{ width, height }}>
      <Character preset={PIP} size={width} state={state ?? null} />
    </span>
  );
}

/**
 * PIP in the dock, as a button in its own right: no circle around it, its own
 * housing is the shape, a little under the height of the dock's buttons so it
 * has the same room around it they do.
 */
export const PipHandle = forwardRef<HTMLButtonElement, {
  expanded: boolean;
  onClick: () => void;
  label?: string;
}>(function PipHandle({ expanded, onClick, label = 'Get to know me' }, ref) {
  return (
    <button ref={ref} type="button" className="di-handle" aria-label={label} aria-expanded={expanded} onClick={onClick}>
      <span aria-hidden className="absolute -inset-2" />
      <SmallPip height={26} state={expanded ? 'happy' : null} />
    </button>
  );
});

/** Put it into the dock: a chevron pointing down at where it goes, not an ×. */
export function TuckButton({ onClick, className = 'tour-toast-close' }: { onClick: () => void; className?: string }) {
  return (
    <button type="button" className={className} onClick={onClick} aria-label="Tuck into the dock">
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M2 3.75l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** The toast's contents (TourToast), unchanged but for the chevron. */
export function InviteBody({ onStart, onTuck, goRef }: { onStart: () => void; onTuck: () => void; goRef: React.Ref<HTMLButtonElement> }) {
  const [eager, setEager] = useState(false);
  return (
    <div className="tour-toast-screen">
      <div className="tour-toast-pip" aria-hidden="true">
        <Character preset={PIP} size={52} state={eager ? 'excited' : null} />
      </div>
      <div className="tour-toast-body">
        <span className="tour-toast-tag">BY INVITATION</span>
        <p className="tour-toast-title">Get to know me</p>
        <p className="tour-toast-text">Ask PIP about me.</p>
      </div>
      <button
        ref={goRef}
        type="button"
        className="entrance-btn entrance-btn--primary tour-toast-go"
        onClick={onStart}
        onPointerEnter={() => setEager(true)}
        onPointerLeave={() => setEager(false)}
        onFocus={() => setEager(true)}
        onBlur={() => setEager(false)}
      >
        Say hello
      </button>
      <TuckButton onClick={onTuck} />
    </div>
  );
}
