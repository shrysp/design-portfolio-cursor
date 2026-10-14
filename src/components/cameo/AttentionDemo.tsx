'use client';

import { useEffect, useRef, useState } from 'react';
import { NOVA, bindTargets, watchCopy, watchFocusHold, watchPointerProximity, watchTyping } from '@shrysp/cameo';
import { Character, type CharacterHandle, type Temperament } from '@shrysp/cameo/react';
import '@shrysp/cameo/styles.css';
import { Input } from '@/components/ui/input';
import { Row, resting } from './DemoParts';

// Attention halves every 8 seconds here, about three times faster than the
// package's own 25, so a visitor can watch it doze without waiting a minute
const TEMPERAMENT: Temperament = { attentionSpan: 8 };

// Where attention changes what the face rests in: the director's own thresholds
const BANDS = [
  { name: 'sleeping', label: 'asleep', from: 0 },
  { name: 'drowsy', label: 'drowsy', from: 0.09 },
  { name: 'idle', label: 'idle', from: 0.3 },
  { name: 'listening', label: 'attentive', from: 0.82 },
] as const;

const bandOf = (attention: number) => [...BANDS].reverse().find((band) => attention >= band.from)!;

// What each sense reports, in the package's words and in plain ones
const NOTICED: Record<string, string> = {
  focus: 'a field took focus',
  'user:typing': 'someone is typing',
  'user:submit': 'something was submitted',
  copy: 'something was copied',
  pose: 'the cursor is on a marked element',
  'pointer:rush': 'the cursor rushed its face',
};

const INSTALL = 'npm install @shrysp/cameo';

/**
 * The character with its workings showing. Nothing here tells the face what to
 * do: the field, the button and the marked word are ordinary page elements,
 * and the three readouts follow what the package's senses report, how awake
 * its director is, and the pose that comes out.
 */
export default function AttentionDemo() {
  const character = useRef<CharacterHandle>(null);
  const face = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  // The senses listen inside this figure only, so the rest of the page stays out of it
  const [root, setRoot] = useState<HTMLElement | null>(null);

  const [noticed, setNoticed] = useState<{ type: string; at: number } | null>(null);
  const [band, setBand] = useState<string>('idle');
  const [held, setHeld] = useState<string | null>(null);
  const [pose, setPose] = useState('idle');

  // A second set of the package's own watchers, reporting to the readout. The
  // character has its own; these only show what it is being told.
  useEffect(() => {
    if (!root) return;
    const note = (type: string) => setNoticed({ type, at: performance.now() });
    const cleanups = [
      watchCopy((event) => note(event.type)),
      watchTyping(root, (event) => note(event.type)),
      bindTargets(root, (event) => note(event.type)),
      watchFocusHold(root, () => note('focus'), () => {}),
      watchPointerProximity(() => face.current, (event) => note(event.type), () => {}),
    ];
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [root]);

  // What was noticed fades once it is old news
  useEffect(() => {
    if (!noticed) return;
    const timer = setTimeout(() => setNoticed(null), 2400);
    return () => clearTimeout(timer);
  }, [noticed]);

  // Reads the director and the engine a few times a second
  useEffect(() => {
    const timer = setInterval(() => {
      const handle = character.current;
      if (!handle) return;
      const attention = handle.director.arousal;
      if (fill.current) fill.current.style.scale = `${attention.toFixed(3)} 1`;
      setBand(bandOf(attention).name);
      setHeld(handle.director.held);
      setPose(handle.engine.poseId);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const copy = async () => {
    await navigator.clipboard?.writeText(INSTALL).catch(() => {});
    // Writing to the clipboard from a script raises no copy event, so say so
    document.dispatchEvent(new Event('copy'));
  };

  // Why the face is in the pose it is in
  const why = held ? 'held for as long as that lasts' : pose !== band ? 'a reaction, then back' : 'where its attention leaves it';

  return (
    <figure ref={setRoot} className="isolate relative w-full surface bg-stone-100 -space-y-2 my-3">
      <div className="isolate relative rounded-[calc(var(--surface-radius)-1px)] bg-white overflow-hidden outline outline-stone-200">
        <div className="flex h-64 items-center justify-center">
          <div ref={face}>
            <Character ref={character} preset={NOVA} size={168} sensesRoot={root} temperament={TEMPERAMENT} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4 pt-6">
        <Row name="Try" note="Ordinary page elements">
          <Input placeholder="Type here" aria-label="Type here" autoComplete="off" className="h-8 w-36 bg-white text-sm" />
          <button type="button" onClick={copy} className={resting}>
            Copy the install line
          </button>
          <span data-char-pose="curious" className="cursor-default rounded-full px-3 py-1 text-sm text-stone-600 shadow-[inset_0_0_0_1px_var(--color-stone-300)]">
            Hover me
          </span>
        </Row>

        <Row name="Noticed" note="What its senses report">
          <p aria-live="polite" className="flex min-h-8 flex-wrap items-center gap-x-2 text-sm">
            {noticed ? (
              <>
                <span className="text-stone-700">{NOTICED[noticed.type] ?? noticed.type}</span>
                {noticed.type !== 'focus' && <code className="font-mono text-[13px] text-stone-400">{noticed.type}</code>}
              </>
            ) : (
              <span className="text-stone-400">Nothing just now. Leave it alone and it dozes off.</span>
            )}
          </p>
        </Row>

        <Row name="Attention" note="Events raise it, time lowers it">
          <div className="flex w-full flex-col gap-1.5">
            <span className="relative block h-1.5 w-full rounded-full bg-stone-200">
              <span ref={fill} className="block h-full w-full origin-left rounded-full bg-blue-500 transition-[scale] duration-150 ease-linear" style={{ scale: '0.7 1' }} />
              {BANDS.slice(1).map(({ from }) => (
                <span key={from} aria-hidden className="absolute -top-1 h-3.5 w-px bg-stone-400" style={{ left: `${from * 100}%` }} />
              ))}
            </span>
            <span className="grid text-[11px] leading-tight" style={{ gridTemplateColumns: '9fr 21fr 52fr 18fr' }}>
              {BANDS.map(({ name, label }) => (
                <span key={name} className={name === band ? 'font-semibold text-stone-800' : 'text-stone-400'}>
                  {label}
                </span>
              ))}
            </span>
          </div>
        </Row>

        <Row name="Face" note="What comes out">
          <p className="flex min-h-8 flex-wrap items-center gap-x-2 text-sm">
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[13px] font-medium text-blue-600 shadow-[inset_0_0_0_1px_var(--color-blue-200)]">
              {pose}
            </span>
            <span className="text-stone-500">{why}</span>
          </p>
        </Row>
      </div>
    </figure>
  );
}
