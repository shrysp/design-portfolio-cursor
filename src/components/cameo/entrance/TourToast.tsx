'use client';

import { useEffect, useRef, useState } from 'react';
import { Doto } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { PIP } from '@shrysp/cameo';
import { Character } from '@shrysp/cameo/react';
import { TOUR, useEntrance } from './context';
import '@shrysp/cameo/styles.css';
import './entrance.css';
import './toast.css';

const dots = Doto({ subsets: ['latin'], axes: ['ROND'], variable: '--font-dot', display: 'swap' });

/** Put away in this browser: the × is for good. */
const DISMISSED = 'tour.toast';
/** A beat after the page, so it arrives rather than being part of the load. */
const SHOW_AFTER_MS = 1200;
/** Pages it never shows on: the tour itself, the invitation's own way in, the bench. */
const NOT_ON = [TOUR, '/projects/cameo/invite', '/dev'];
/** Phones: the tour is made for a laptop (LaptopOnly), so there is nothing here to open. */
const PHONE = /Mobi|iPhone|Android.+Mobile/i;

/**
 * The way into the tour from anywhere on the site: the case study's card
 * (TourEntrance, poster.css) made small — PIP in its dark room, the LCD tag,
 * one line and the green gel. It stays until it is put away, and opens the
 * takeover where it is, over whatever page this is (EntranceHost, in the root
 * layout): straight in with a code kept here, to the code screen without.
 *
 * On the case study it steps aside while the card is in view: there, the
 * card is the way in.
 */
export default function TourToast() {
  const pathname = usePathname();
  const open = useEntrance();
  const go = useRef<HTMLButtonElement>(null);
  const [eligible, setEligible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [cardInView, setCardInView] = useState(false);
  const [eager, setEager] = useState(false);

  useEffect(() => {
    let gone = false;
    try {
      gone = localStorage.getItem(DISMISSED) === 'dismissed';
    } catch {
      // No storage: it shows, and the × still puts it away for this visit.
    }
    if (gone || PHONE.test(navigator.userAgent)) return;
    const t = window.setTimeout(() => {
      setEligible(true);
      // The takeover's code, ready before anyone presses.
      void import('./TourEntrance');
    }, SHOW_AFTER_MS);
    return () => window.clearTimeout(t);
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

  const hidden = NOT_ON.some((p) => pathname.startsWith(p));
  const show = eligible && !dismissed && !hidden && !cardInView;

  const start = () => {
    const r = go.current?.getBoundingClientRect();
    open({
      origin: r ? [r.left + r.width / 2, r.top + r.height / 2] : [window.innerWidth / 2, window.innerHeight / 2],
      theme: 'screen',
      unlocked,
      back: pathname === '/' ? 'Home' : 'Back',
      onClosed: () => go.current?.focus(),
    });
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED, 'dismissed');
    } catch {}
  };

  if (!eligible || dismissed || hidden) return null;

  return (
    <aside
      className={`tour-toast ${dots.variable}`}
      data-show={show}
      aria-label="Get to know me"
      inert={!show}
      // In development the DialKit button sits in this corner (as on the tour's own chrome).
      style={process.env.NODE_ENV !== 'production' ? { right: 76 } : undefined}
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
          onClick={start}
          onPointerEnter={() => setEager(true)}
          onPointerLeave={() => setEager(false)}
          onFocus={() => setEager(true)}
          onBlur={() => setEager(false)}
        >
          Say hello
        </button>
        <button type="button" className="tour-toast-close" onClick={dismiss} aria-label="Dismiss">
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
