'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconArrowLeft, IconArrowRight, IconFullScreen, IconNote } from 'nucleo-micro-bold-essential';
import Glass from '../Glass';
import { SlideContext } from './primitives';
import { channelFor, type NotesState } from './notes-channel';
import { NotesView } from './NotesWindow';

/**
 * A slide deck on a fixed 1920×1080 canvas, scaled to fit the window.
 *
 * The deck owns nothing about how slides look; it only pages through them. Arrow keys, space,
 * Page Up/Down, Home and End move between slides, clicking the left or right third of the screen
 * does the same, and F toggles full screen. The address keeps the slide number (#7), so a link
 * can open on a single slide and a reload keeps your place.
 *
 * Three things a presenter has on top of that:
 * - N floats the presenter notes in a picture-in-picture window that stays on top of the deck,
 *   even in full screen, on a single screen. It is a window of its own, so sharing the deck's tab
 *   or window leaves it out of what the room sees. Keys pressed in it drive the deck. Where the
 *   browser has no picture-in-picture for pages, N opens the notes as a page in a popup instead.
 * - V swaps a live slide for its fallback (a video or an image) and back, for when a demo fails.
 * - B opens the branch slides a slide offers ("more ↗"), outside the main order. Esc or B again
 *   goes back to the slide you came from. In a branch, the arrows move between its siblings.
 *
 * Only the slide on screen is mounted, keyed by where it is, so every slide starts fresh on entry.
 */

// What counts as live content on a slide: clicks there don't page, and keys typed into fields don't either
const INTERACTIVE = 'button, a, input, textarea, select, label, iframe, video, [role="button"], [role="slider"], [data-live]';
const TYPING = 'input, textarea, select, [contenteditable="true"]';

export type DeckSlide = {
  /** Shown in the footer next to the slide number, e.g. "Cameo". */
  section: string;
  render: () => ReactNode;
  /** One line for the presenter, shown with N. */
  notes?: string;
  /** What V swaps the live slide for: a short video or an image. */
  fallback?: () => ReactNode;
  /** Branch slides this one offers, by id, opened with B. */
  more?: string[];
};

/** A slide outside the main order, reached from a slide that lists it in `more`. */
export type DeckBranch = DeckSlide & { label: string };

const W = 1920;
const H = 1080;

type Place = { index: number; branch: string | null };

function placeFromHash(total: number, branches: Record<string, DeckBranch>): Place {
  const [n, branch] = window.location.hash.slice(1).split('/');
  const parsed = Number.parseInt(n, 10);
  const index = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), total) - 1 : 0;
  return { index, branch: branch && branches[branch] ? branch : null };
}

// The dock's glass, as tuned for the portfolio
const DOCK_GLASS = { blur: 2, saturate: 2, tint: 1, refraction: 26, bezel: 10 };

// Chrome's picture-in-picture for whole documents; not in TypeScript's DOM types yet
type DocumentPip = { requestWindow: (options: { width: number; height: number }) => Promise<Window>; window: Window | null };
const documentPip = () => (typeof window !== 'undefined' ? (window as unknown as { documentPictureInPicture?: DocumentPip }).documentPictureInPicture : undefined);

/** Gives a new window the page's styles and the deck's fonts, so the notes look the same in it */
function dressWindow(target: Window) {
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const style = target.document.createElement('style');
      style.textContent = Array.from(sheet.cssRules, (rule) => rule.cssText).join('\n');
      target.document.head.appendChild(style);
    } catch {
      // A sheet from another origin can't be read; link to it instead
      if (sheet.href) {
        const link = target.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = sheet.href;
        target.document.head.appendChild(link);
      }
    }
  }
  // The fonts are variables set on the presentation's wrapper, not on the body
  const fonts = document.querySelector('[class*="variable"]')?.className ?? '';
  target.document.body.className = fonts;
  target.document.body.style.margin = '0';
  target.document.title = 'Notes';
}

const quiet = {
  fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
  fontSize: 16,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
} as const;

export default function Deck({ slides, branches = {}, letterbox = '#101114' }: { slides: DeckSlide[]; branches?: Record<string, DeckBranch>; letterbox?: string }) {
  const total = slides.length;
  const [place, setPlace] = useState<Place>({ index: 0, branch: null });
  const [scale, setScale] = useState(0);
  const [chrome, setChrome] = useState(true);
  const [menu, setMenu] = useState(false);
  const [fallback, setFallback] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { index, branch } = place;
  const origin = slides[index];
  const slide: DeckSlide = branch ? branches[branch] : origin;
  // The branches on offer: the ones this slide lists, or, inside a branch, its siblings
  const offered = (origin.more ?? []).filter((id) => branches[id]);

  // Open on the place the address names, and follow it if someone edits the hash.
  useEffect(() => {
    setPlace(placeFromHash(total, branches));
    const onHash = () => setPlace(placeFromHash(total, branches));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [total, branches]);

  useEffect(() => {
    const target = `#${index + 1}${branch ? `/${branch}` : ''}`;
    if (window.location.hash !== target) history.replaceState(null, '', target);
  }, [index, branch]);

  // A new slide always opens live, with the menu closed
  useEffect(() => {
    setFallback(false);
    setMenu(false);
  }, [index, branch]);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const go = useCallback(
    (delta: number) =>
      setPlace((p) => {
        if (!p.branch) return { index: Math.min(Math.max(p.index + delta, 0), total - 1), branch: null };
        // In a branch, the arrows walk its siblings and stop at either end
        const siblings = (slides[p.index].more ?? []).filter((id) => branches[id]);
        const at = siblings.indexOf(p.branch);
        const next = siblings[Math.min(Math.max(at + delta, 0), siblings.length - 1)];
        return { ...p, branch: next ?? p.branch };
      }),
    [total, slides, branches],
  );

  // The notes window: opened by N, told where the deck is whenever that changes, and its keys replayed here
  const channel = useRef<BroadcastChannel | null>(null);
  const [pip, setPip] = useState<Window | null>(null);
  const openNotes = useCallback(async () => {
    const api = documentPip();
    if (!api) {
      window.open(`${window.location.pathname}/notes`, 'deck-notes', 'popup,width=760,height=560');
      return;
    }
    // N again puts the notes away
    if (api.window) {
      api.window.close();
      return;
    }
    try {
      const notes = await api.requestWindow({ width: 520, height: 340 });
      dressWindow(notes);
      notes.addEventListener('pagehide', () => setPip(null));
      setPip(notes);
    } catch {
      window.open(`${window.location.pathname}/notes`, 'deck-notes', 'popup,width=760,height=560');
    }
  }, []);
  // A key pressed in the floating notes does here what it would have done on the deck
  const sendKey = useCallback((key: string) => window.dispatchEvent(new KeyboardEvent('keydown', { key })), []);
  const stateRef = useRef<NotesState | null>(null);
  stateRef.current = {
    type: 'state',
    number: index + 1,
    total,
    section: branch ? `${origin.section} · more` : slide.section,
    branch: branch ? branches[branch].label : null,
    notes: slide.notes ?? null,
    fallback: Boolean(slide.fallback),
    more: !branch && (origin.more ?? []).some((id) => branches[id]),
    next: branch ? null : slides[index + 1] ? { section: slides[index + 1].section, notes: slides[index + 1].notes ?? null } : null,
  };
  useEffect(() => {
    const c = new BroadcastChannel(channelFor(window.location.pathname));
    channel.current = c;
    c.onmessage = (e: MessageEvent) => {
      if (e.data?.type === 'hello' && stateRef.current) c.postMessage(stateRef.current);
      // A key pressed in the notes window does here what it would have done on the deck
      if (e.data?.type === 'key') window.dispatchEvent(new KeyboardEvent('keydown', { key: e.data.key }));
    };
    return () => c.close();
  }, []);
  useEffect(() => {
    if (stateRef.current) channel.current?.postMessage(stateRef.current);
  }, [index, branch, fallback]);

  const openBranch = useCallback((id: string) => setPlace((p) => ({ ...p, branch: id })), []);
  const back = useCallback(() => setPlace((p) => ({ ...p, branch: null })), []);

  // The controls show while the pointer moves and fade out when it rests, so they stay out of a talk.
  const wake = useCallback(() => {
    setChrome(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setChrome(false), 1800);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Typing into a field on a slide stays in the field
      if ((e.target as Element | null)?.closest?.(TYPING)) return;
      // Option+R (Alt+R) starts over from the first slide: two keys, so it never fires from a stray R.
      // The code, not the key, because Option turns R into ® on a Mac
      if (e.altKey && !e.metaKey && !e.ctrlKey && e.code === 'KeyR') {
        e.preventDefault();
        setPlace({ index: 0, branch: null });
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      // The branch menu takes number keys while it is open
      if (menu) {
        const pick = Number.parseInt(key, 10);
        if (pick >= 1 && pick <= offered.length) {
          e.preventDefault();
          openBranch(offered[pick - 1]);
          return;
        }
        if (key === 'Escape' || key === 'b') {
          e.preventDefault();
          setMenu(false);
          return;
        }
      }

      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(key)) {
        e.preventDefault();
        go(1);
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(key)) {
        e.preventDefault();
        go(-1);
      } else if (key === 'Home') setPlace({ index: 0, branch: null });
      else if (key === 'End') setPlace({ index: total - 1, branch: null });
      else if (key === 'f') {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen();
      } else if (key === 'n') void openNotes();
      else if (key === 'v') {
        if (slide.fallback) setFallback((on) => !on);
      } else if (key === 'b') {
        if (branch) back();
        else if (offered.length) setMenu(true);
      } else if (key === 'Escape' && branch) back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, total, menu, offered, openBranch, back, branch, slide, openNotes]);

  useEffect(() => {
    wake();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [wake]);

  return (
    // Click the left third to go back, anywhere else to go forward. Slides with their own controls stop the click.
    <div
      onPointerMove={wake}
      onClick={(e) => {
        // A click on something live inside a slide is for that, not for paging
        if ((e.target as Element).closest(INTERACTIVE)) return;
        if (menu) {
          setMenu(false);
          return;
        }
        go(e.clientX < window.innerWidth / 3 ? -1 : 1);
      }}
      style={{ position: 'fixed', inset: 0, background: letterbox, overflow: 'hidden', cursor: chrome ? 'default' : 'none' }}
    >
      {scale > 0 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: W,
            height: H,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: 'center',
            overflow: 'hidden',
            // For controls drawn at screen size inside the slide: see ScreenSize
            ['--deck-scale' as string]: scale,
          }}
        >
          <SlideContext.Provider value={{ number: index + 1, total, section: branch ? `${origin.section} · more` : slide.section }}>
            <div key={`${index}/${branch ?? ''}/${fallback ? 'v' : ''}`} className="present-slide-in" style={{ position: 'absolute', inset: 0 }}>
              {fallback && slide.fallback ? slide.fallback() : slide.render()}
            </div>
          </SlideContext.Provider>

          {/* Quiet marks in the top-right corner: the way into a branch, the way back out, and whether this is the fallback */}
          <div data-deck-chrome style={{ position: 'absolute', top: 48, right: 128, zIndex: 6, display: 'flex', gap: 12, alignItems: 'center' }}>
            {fallback && <span style={{ ...quiet, fontSize: 14, color: '#9A9A9A', marginRight: 8 }}>Fallback · V</span>}
            {/* Branches open with B alone; only the way back out is shown */}
            {branch && (
              <ScreenSize>
                <button type="button" onClick={back} className="aqua h-8 pl-2 pr-1.5 gap-1.5 text-sm font-medium">
                  <IconArrowLeft size={16} />
                  Back
                  <Kbd small>Esc</Kbd>
                </button>
              </ScreenSize>
            )}
          </div>

          {menu && (
            <Glass
              {...DOCK_GLASS}
              refraction={0}
              role="menu"
              aria-label="More"
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'absolute', top: 108, right: 128, zIndex: 7, width: 440, padding: 8, borderRadius: 24, display: 'flex', flexDirection: 'column' }}
            >
              {offered.map((id, i) => (
                <button
                  key={id}
                  type="button"
                  role="menuitem"
                  onClick={() => openBranch(id)}
                  className="deck-menu-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '14px 16px',
                    borderRadius: 16,
                    border: 0,
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-figtree), sans-serif',
                    fontSize: 22,
                    fontWeight: 500,
                    color: '#1C1917',
                  }}
                >
                  <Kbd>{String(i + 1)}</Kbd>
                  {branches[id].label}
                </button>
              ))}
            </Glass>
          )}
        </div>
      )}

      <Glass
        {...DOCK_GLASS}
        role="navigation"
        aria-label="Slides"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 p-1.5"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 16,
          x: '-50%',
          zIndex: 2,
          opacity: chrome ? 1 : 0,
          transition: 'opacity 300ms ease',
          pointerEvents: chrome ? 'auto' : 'none',
        }}
      >
        <button type="button" aria-label="Previous slide" onClick={() => go(-1)} disabled={!branch && index === 0} className="aqua aqua-round size-8 disabled:opacity-40">
          <IconArrowLeft size={16} />
        </button>
        <span className="px-2 text-sm font-medium tabular-nums text-stone-700">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          {branch ? <span className="text-stone-500"> · {branches[branch].label}</span> : null}
        </span>
        <button type="button" aria-label="Next slide" onClick={() => go(1)} disabled={!branch && index === total - 1} className="aqua aqua-round size-8 disabled:opacity-40">
          <IconArrowRight size={16} />
        </button>
        {/* A groove in the glass */}
        <div aria-hidden className="mx-1 h-5 w-px bg-stone-900/15 shadow-[1px_0_0_rgba(255,255,255,0.7)]" />
        <button type="button" onClick={() => void openNotes()} className="aqua h-8 pl-2 pr-2.5 gap-1 text-sm font-medium">
          <IconNote size={16} />
          Notes
        </button>
        <button
          type="button"
          aria-label="Full screen"
          onClick={() => (document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen())}
          className="aqua aqua-round size-8"
        >
          <IconFullScreen size={16} />
        </button>
      </Glass>

      {pip && createPortal(<NotesView state={stateRef.current} send={sendKey} keyTarget={pip} />, pip.document.body)}

      <style>{`
        .deck-menu-item:hover { background: rgba(28,25,23,0.06) !important; }
        .present-slide-in { animation: present-in 260ms cubic-bezier(0.2, 0, 0, 1); }
        @keyframes present-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes present-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .present-slide-in { animation: none; } }
        .present-range { appearance: none; height: 40px; background: transparent; cursor: pointer; }
        .present-range::-webkit-slider-runnable-track { height: 8px; border-radius: 4px; background: linear-gradient(90deg, var(--accent) var(--fill), var(--track) var(--fill)); }
        .present-range::-moz-range-track { height: 8px; border-radius: 4px; background: linear-gradient(90deg, var(--accent) var(--fill), var(--track) var(--fill)); }
        .present-range::-webkit-slider-thumb { appearance: none; width: 28px; height: 28px; margin-top: -10px; border-radius: 50%; background: #fff; border: 3px solid var(--accent); box-shadow: 0 2px 6px rgba(0,0,0,0.18); }
        .present-range::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 3px solid var(--accent); }
      `}</style>
    </div>
  );
}

/**
 * Draws a control at the size the screen shows it, not the slide's 1920-wide size scaled down:
 * the gel buttons are tuned in screen pixels, and scaled they lose their crisp edge and their gloss
 * no longer fits. So a control on a slide matches the ones in the bar exactly, on any screen.
 */
export function ScreenSize({ children }: { children: ReactNode }) {
  return <span style={{ display: 'inline-flex', zoom: 'calc(1 / var(--deck-scale, 1))' }}>{children}</span>;
}

/** A key, as the quiet hint beside a control */
function Kbd({ children, small }: { children: ReactNode; small?: boolean }) {
  return (
    <kbd
      style={{
        minWidth: small ? 20 : 26,
        height: small ? 20 : 26,
        padding: small ? '0 5px' : '0 7px',
        borderRadius: small ? 999 : 7,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
        fontSize: small ? 11 : 14,
        fontWeight: 500,
        color: '#57534D',
        background: 'rgba(255,255,255,0.7)',
        boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)',
      }}
    >
      {children}
    </kbd>
  );
}
