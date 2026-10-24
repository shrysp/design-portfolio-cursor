'use client';

import { forwardRef, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Doto } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PIP } from '@shrysp/cameo';
import { Character } from '@shrysp/cameo/react';
import { projectsData } from '@/data/projectsData';
import { EASE_OUT } from '@/lib/easing';
import { freshLoad } from '@/lib/tour/hardRefresh';
import { TakeoverUpContext, TOUR, useEntrance } from './context';
import '@shrysp/cameo/styles.css';
import './entrance.css';
import './toast.css';

const dots = Doto({ subsets: ['latin'], axes: ['ROND'], variable: '--font-dot', display: 'swap' });

/** A beat after the page, so PIP arrives rather than being part of the load. */
const SHOW_AFTER_MS = 1200;
/** PIP takes its seat first, then the card rises out of it. */
const RISE_AFTER_MS = 350;
/** How long the first invitation stays out before it tucks itself into the dock. */
const INTRO_HOLD_MS = 7000;
/** Scrolling this far while it's first out means they're reading: it tucks away. */
const SCROLL_TUCK_PX = 240;
/** Hover intent: a pointer passing over the dock on its way somewhere shouldn't open it. */
const HOVER_IN_MS = 120;
/** Grace to cross from PIP to the card without it closing. */
const HOVER_OUT_MS = 280;
/**
 * Pages it never shows on: the tour itself, the invitation's own way in, the
 * bench, and the review copy at /dive, where Inflight's reviewer panel is.
 */
const NOT_ON = [TOUR, '/projects/cameo/invite', '/dev', '/dive'];
/** Phones: the tour is made for a laptop (LaptopOnly), so there is nothing here to open. */
const PHONE = /Mobi|iPhone|Android.+Mobile/i;
/** The card's width; it stands centred over the dock. */
export const CARD_W = 380;

/** What the tour's Back will say for this page. */
function pageName(path: string) {
  if (path === '/') return 'Home';
  if (path === '/projects/cameo') return 'Case study';
  const slug = path.match(/^\/projects\/([^/]+)/)?.[1];
  const project = slug && projectsData.find((p) => p.title.toLowerCase() === slug);
  return project ? project.title : 'Back';
}

/**
 * The way into the tour from anywhere on the site, as part of the dock
 * (StickyFooter): PIP takes a seat at its start, and on a first visit the
 * case study's card, made small, rises out of that seat when the site is
 * arrived at or hard-refreshed (freshLoad). It tucks back into
 * PIP after a while, on a scroll, on its chevron or Escape — so putting it
 * away leaves it somewhere to be found — and comes back out while PIP is
 * hovered or focused (tapped, without a hover). "Say hello" opens the
 * takeover over this page; the tour's Back comes back here (wayBack).
 *
 * On the case study it doesn't come out while the card is in view: there,
 * the card is the way in.
 */
export function useDockInvite() {
  const pathname = usePathname();
  const open = useEntrance();
  const takeoverUp = useContext(TakeoverUpContext);
  const [eligible, setEligible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [intro, setIntro] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [cardInView, setCardInView] = useState(false);
  const hovering = useRef(false);
  const timer = useRef(0);
  const cardInViewRef = useRef(false);
  cardInViewRef.current = cardInView;
  const expandedRef = useRef(false);
  expandedRef.current = expanded;

  const hidden = NOT_ON.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (PHONE.test(navigator.userAgent)) return;
    // Out when the site is arrived at, or hard-refreshed; not on a normal reload or back and forward.
    // The dock stays across moves between the site's pages, so those never bring it out again.
    const comesOut = freshLoad();
    const ts = [
      window.setTimeout(() => {
        setEligible(true);
        // The takeover's code, ready before anyone presses.
        void import('./TourEntrance');
      }, SHOW_AFTER_MS),
      window.setTimeout(() => {
        if (!comesOut || cardInViewRef.current) return;
        setExpanded(true);
        setIntro(true);
      }, SHOW_AFTER_MS + RISE_AFTER_MS),
    ];
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, []);

  // Whether a code is kept here, again on every page: one may have just been entered.
  useEffect(() => {
    if (!eligible) return;
    let live = true;
    fetch('/api/tour/unlock', { cache: 'no-store' })
      .then((r) => (r.ok ? (r.json() as Promise<{ unlocked?: boolean }>) : null))
      .then((s) => live && setUnlocked(!!s?.unlocked))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [eligible, pathname]);

  useEffect(() => {
    setCardInView(false);
    const card = document.querySelector('.tour-poster');
    if (!card) return;
    const io = new IntersectionObserver(([e]) => setCardInView(e.isIntersecting));
    io.observe(card);
    return () => io.disconnect();
  }, [pathname]);

  const tuck = useCallback(() => {
    window.clearTimeout(timer.current);
    setIntro(false);
    setExpanded(false);
  }, []);

  // The first invitation goes on its own: on the clock unless it's being looked at, on a scroll, or when the case study's card comes into view.
  useEffect(() => {
    if (!intro) return;
    const t = window.setTimeout(() => {
      setIntro(false);
      if (!hovering.current) tuck();
    }, INTRO_HOLD_MS);
    const onScroll = () => window.scrollY > SCROLL_TUCK_PX && tuck();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
    };
  }, [intro, tuck]);
  useEffect(() => {
    if (cardInView && expandedRef.current && !hovering.current) tuck();
  }, [cardInView, tuck]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && tuck();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded, tuck]);

  // A new page: it doesn't follow the visitor there open.
  const firstPath = useRef(pathname);
  useEffect(() => {
    if (pathname !== firstPath.current && expandedRef.current) tuck();
  }, [pathname, tuck]);

  const enter = () => {
    hovering.current = true;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setExpanded(true), HOVER_IN_MS);
  };
  const leave = () => {
    hovering.current = false;
    window.clearTimeout(timer.current);
    if (intro) return;
    timer.current = window.setTimeout(tuck, HOVER_OUT_MS);
  };

  /** Hover and focus, for PIP's seat and the card. Touch has no hover: it taps PIP. */
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
      back: pageName(pathname),
      onClosed: () => el?.focus(),
    });
    // Put away under the takeover, so it isn't standing open when they come back.
    tuck();
  };

  return { shown: eligible && !hidden, expanded: expanded && eligible && !hidden, intro, takeoverUp, bind, tuck, toggle, start };
}

/** PIP in its seat: a little under the dock's 32px buttons, and 1.31 times as wide as tall, as its housing is. */
const SEAT_H = 26;
const SEAT_W = 34;

/**
 * PIP in the dock, as a button in its own right: no frame around it, its own
 * housing is the shape, a little under the height of the dock's buttons. Not
 * drawn while the takeover is up (TakeoverUpContext); its place is kept.
 */
export const PipSeat = forwardRef<HTMLButtonElement, { expanded: boolean; drawn: boolean; onClick: () => void }>(function PipSeat(
  { expanded, drawn, onClick },
  ref,
) {
  return (
    <button ref={ref} type="button" className="tour-seat" aria-label="Get to know me" aria-expanded={expanded} onClick={onClick}>
      {/* A 44px tap area around it */}
      <span aria-hidden className="absolute -inset-2" />
      <span className="tour-seat-pip" style={{ width: SEAT_W, height: SEAT_H }}>
        {drawn && <Character preset={PIP} size={SEAT_W} state={expanded ? 'happy' : null} />}
      </span>
    </button>
  );
});

/**
 * The card: the case study's card made small — PIP in its dark room, the LCD
 * tag, one line and the green gel. It stands over the dock and, going, shrinks
 * back into PIP's seat (originX: the seat's centre across the card), so the
 * eye follows it to where it lives.
 */
export function InviteCard({
  show,
  originX,
  raise,
  intro,
  bind,
  onStart,
  onTuck,
}: {
  show: boolean;
  originX: number;
  /** Extra height to stand clear of the project switcher over the dock. */
  raise: number;
  /** The first-load invitation, which takes its time; any other opening answers quickly. */
  intro: boolean;
  bind: ReturnType<typeof useDockInvite>['bind'];
  onStart: (el: HTMLElement | null) => void;
  onTuck: () => void;
}) {
  const reduce = useReducedMotion();
  const go = useRef<HTMLButtonElement>(null);
  const [eager, setEager] = useState(false);
  const away = reduce
    ? { opacity: 0 }
    : { opacity: 0, transform: 'translateY(16px) scale(0.5)', filter: 'blur(4px)' };

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          key="tour-invite"
          {...bind}
          className={`tour-invite ${dots.variable}`}
          aria-label="Get to know me"
          style={{ transformOrigin: `${originX}px 100%`, bottom: `calc(100% + 12px + ${raise}px)` }}
          initial={away}
          // No filter left on the card once it's in: a leftover one keeps it on a layer of its own, and PIP soft.
          // The transform stays the identity rather than going to `none`: from `none`, Framer Motion starts the
          // exit at scale 0, and the card flicks to nothing and springs back up to half size as it fades.
          animate={{
            opacity: 1,
            transform: 'translateY(0px) scale(1)',
            filter: 'blur(0px)',
            transitionEnd: { filter: 'none' },
          }}
          exit={{ ...away, transition: { duration: 0.22, ease: EASE_OUT } }}
          transition={{ duration: intro ? 0.38 : 0.24, ease: EASE_OUT }}
        >
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
              ref={go}
              type="button"
              className="entrance-btn entrance-btn--primary tour-toast-go"
              onClick={() => onStart(go.current)}
              onPointerEnter={() => setEager(true)}
              onPointerLeave={() => setEager(false)}
              onFocus={() => setEager(true)}
              onBlur={() => setEager(false)}
            >
              Say hello
            </button>
            {/* Into the dock: a chevron pointing at where it goes, not an ×. */}
            <button type="button" className="tour-toast-close" onClick={onTuck} aria-label="Tuck into the dock">
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path d="M2 3.75l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
