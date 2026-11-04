'use client';

import { useEffect, useRef, useState } from 'react';
import { IconArrowLeft, IconArrowRight } from 'nucleo-micro-bold-essential';
import { channelFor, type NotesMessage, type NotesState } from './notes-channel';

// Keys that mean something on the deck; everything else stays with the notes
const FORWARDED = new Set(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ', 'Home', 'End', 'Escape', 'b', 'v', 's', 'l', 'n', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  return `${m}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * What the presenter sees: this slide's notes, what comes next, a clock, and arrows. Keys pressed
 * in the window it is drawn in (`keyTarget`) are handed to `send`, so the deck can be driven from it.
 * Drawn in a floating picture-in-picture window, or in a page of its own where that isn't available.
 */
export function NotesView({ state, send, keyTarget }: { state: NotesState | null; send: (key: string) => void; keyTarget: Window }) {
  const [started, setStarted] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const latest = useRef(send);
  useEffect(() => {
    latest.current = send;
  });

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (!FORWARDED.has(key)) return;
      e.preventDefault();
      latest.current(key);
    };
    keyTarget.addEventListener('keydown', onKey);
    return () => {
      clearInterval(tick);
      keyTarget.removeEventListener('keydown', onKey);
    };
  }, [keyTarget]);

  const hints = state ? ([state.fallback && ['V', 'fallback'], state.more && ['B', 'more'], state.branch && ['Esc', 'back']].filter(Boolean) as [string, string][]) : [];

  return (
    <main className="min-h-screen bg-stone-100 p-4 text-stone-900" style={{ fontFamily: 'var(--font-figtree), sans-serif' }}>
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Previous slide" onClick={() => send('ArrowLeft')} className="aqua aqua-round size-8">
              <IconArrowLeft size={16} />
            </button>
            <button type="button" aria-label="Next slide" onClick={() => send('ArrowRight')} className="aqua aqua-round size-8">
              <IconArrowRight size={16} />
            </button>
            <span className="ml-2 text-sm font-medium tabular-nums text-stone-700">
              {state ? (
                <>
                  {String(state.number).padStart(2, '0')} / {String(state.total).padStart(2, '0')}
                  <span className="text-stone-500"> · {state.branch ?? state.section ?? ''}</span>
                </>
              ) : (
                'Waiting for the deck…'
              )}
            </span>
          </div>
          <button type="button" onClick={() => setStarted(Date.now())} title="Restart the clock" className="aqua h-8 px-3 text-sm font-medium tabular-nums">
            {clock(Math.max(0, Math.floor((now - started) / 1000)))}
          </button>
        </header>

        <section className="glass-pane p-5">
          {state ? (
            <p className="m-0 text-[16px] leading-[1.5] text-pretty text-stone-900">{state.notes ?? <span className="text-stone-400">No notes for this slide.</span>}</p>
          ) : (
            <p className="m-0 text-[14px] leading-[1.5] text-stone-500">Open the deck in this browser and press N there. This window follows it.</p>
          )}
          {hints.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {hints.map(([key, label]) => (
                <span key={key} className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-sm text-stone-600 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
                  <kbd className="font-mono text-xs font-medium text-stone-500">{key}</kbd>
                  {label}
                </span>
              ))}
            </div>
          )}
        </section>

        {state?.next && (
          <section className="px-1">
            <p className="m-0 mb-1 font-mono text-xs uppercase tracking-[0.08em] text-stone-500">Next · {state.next.section || 'slide'}</p>
            <p className="m-0 line-clamp-2 text-[13px] leading-[1.5] text-stone-600">{state.next.notes ?? '—'}</p>
          </section>
        )}
      </div>
    </main>
  );
}

/** The notes as a page of their own, for browsers without picture-in-picture: follows the deck over a channel */
export default function NotesWindow() {
  const [state, setState] = useState<NotesState | null>(null);
  const channel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const c = new BroadcastChannel(channelFor(window.location.pathname));
    channel.current = c;
    c.onmessage = (e: MessageEvent<NotesState>) => {
      if (e.data?.type === 'state') setState(e.data);
    };
    c.postMessage({ type: 'hello' } satisfies NotesMessage);
    return () => c.close();
  }, []);

  const send = (key: string) => channel.current?.postMessage({ type: 'key', key } satisfies NotesMessage);
  return <NotesView state={state} send={send} keyTarget={typeof window === 'undefined' ? (undefined as unknown as Window) : window} />;
}
