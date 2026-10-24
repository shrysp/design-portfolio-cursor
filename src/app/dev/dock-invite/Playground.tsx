'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { Speed } from './shared';
import { VARIANTS, type IslandEntrance } from './Variants';

type Id = (typeof VARIANTS)[number]['id'];
const label = 'font-mono text-[10px] uppercase tracking-[0.14em]';

/**
 * One variant at a time, where the dock really sits, over a page to scroll.
 * Replaying remounts it, so each run is a first load; "returning" starts it
 * tucked, as for someone who has seen it before.
 */
export default function Playground() {
  const [id, setId] = useState<Id>('rise');
  const [run, setRun] = useState(0);
  const [returning, setReturning] = useState(false);
  const [slow, setSlow] = useState(false);
  const [entrance, setEntrance] = useState<IslandEntrance>('scale');

  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    if (VARIANTS.some((v) => v.id === fromHash)) setId(fromHash as Id);
  }, []);

  const pick = (next: Id) => {
    setId(next);
    setRun((n) => n + 1);
    history.replaceState(null, '', `#${next}`);
  };

  const variant = VARIANTS.find((v) => v.id === id)!;
  const k = slow ? 4 : 1;
  const { Component } = variant;

  return (
    <Speed.Provider value={k}>
      <div style={{ '--k': k } as CSSProperties}>
        <header className="sticky top-0 z-40 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`${label} mr-2 text-stone-400`}>Dock invitation</span>
              {VARIANTS.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => pick(v.id)}
                  className={`aqua h-8 px-3 text-sm font-medium ${v.id === id ? 'aqua-blue' : 'aqua-to-blue [--aqua-ink:var(--color-stone-600)]'}`}
                >
                  {i + 1}. {v.name}
                </button>
              ))}
            </div>
            <p className="max-w-[64ch] text-sm text-stone-600">{variant.idea}</p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setRun((n) => n + 1)} className="aqua h-7 px-2.5 text-[13px] font-medium">
                Replay first load
              </button>
              <label className="flex items-center gap-1.5 text-[13px] text-stone-600">
                <input type="checkbox" checked={returning} onChange={(e) => (setReturning(e.target.checked), setRun((n) => n + 1))} />
                Returning visitor (starts tucked)
              </label>
              <label className="flex items-center gap-1.5 text-[13px] text-stone-600">
                <input type="checkbox" checked={slow} onChange={(e) => (setSlow(e.target.checked), setRun((n) => n + 1))} />
                Slow motion ×4
              </label>
              {id === 'island' && (
                <label className="flex items-center gap-1.5 text-[13px] text-stone-600">
                  Room comes in
                  <select
                    value={entrance}
                    onChange={(e) => (setEntrance(e.target.value as IslandEntrance), setRun((n) => n + 1))}
                    className="rounded-md border border-stone-300 bg-white px-1.5 py-0.5"
                  >
                    <option value="grow">Grows up with the glass</option>
                    <option value="scale">Scales in as the glass opens, from the middle</option>
                    <option value="pip">Scales in as the glass opens, from PIP</option>
                  </select>
                </label>
              )}
            </div>
          </div>
        </header>

        <Filler />

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
          <div className="pointer-events-auto">
            <Component key={`${id}-${run}`} returning={returning} entrance={entrance} />
          </div>
        </div>
      </div>
    </Speed.Provider>
  );
}

/** A stand-in for a page: something to read, and enough of it to scroll. */
function Filler() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-4 pb-48 pt-12">
      <div className="flex flex-col gap-3">
        <h1 className="text-header-1 mx-0 w-auto">A page under the dock</h1>
        <p className="max-w-[60ch] text-stone-600">
          The invitation comes out a beat after the page, stays a few seconds, and then tucks itself into the dock — or sooner, on
          the chevron, Escape, or a scroll. Hover where it went to bring it back; tap it on touch.
        </p>
      </div>
      {Array.from({ length: 6 }, (_, i) => (
        <section key={i} className="flex flex-col gap-3">
          <div className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-stone-200 to-stone-100" />
          <p className="max-w-[60ch] text-stone-500">
            Placeholder copy so there is something behind the glass. The dock&apos;s blur and the toast&apos;s smoked glass both need a page
            under them to read right, so this is long enough to scroll past a few images.
          </p>
        </section>
      ))}
    </main>
  );
}
