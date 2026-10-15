'use client';

import { Fragment, useRef, useState } from 'react';
import { PIP, type MoodId } from '@shrysp/cameo';
import { Character } from '@shrysp/cameo/react';
import { CODE_REQUEST, TourHandout } from '@/app/projects/cameo/tour/TourHandout';

/**
 * Another idea of what the way into the tour is, beside the Tunnel's preview
 * of the dive (TourEntrance). The Door is the invitation itself: the code goes
 * in here, on the card, and PIP wakes a little more with every character; the
 * right one opens the dive. The takeover then skips its own code screen.
 */

/** Opens the takeover from a point on the screen; `unlocked` when the code has just been accepted here. */
export type Open = (origin: [number, number], unlocked?: boolean) => void;

type BodyProps = {
  unlocked: boolean;
  open: Open;
  lock: () => void;
  /** A mood held from the Tour card dial, over the concept's own. */
  mood: MoodId | null;
};

const centre = (el: Element): [number, number] => {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
};

const Pip = ({ state }: { state: MoodId | null }) => (
  <div className="tour-poster-pip" aria-hidden="true">
    <Character preset={PIP} size={88} state={state} />
  </div>
);

const Different = ({ lock }: { lock: () => void }) => (
  <button type="button" onClick={lock} className="tour-poster-link">
    Use a different code
  </button>
);

/* ------------------------------------------------------------------ Door */

export function DoorBody({
  unlocked,
  open,
  lock,
  mood,
  length,
  normal,
}: BodyProps & { length: number; normal: (raw: string) => string }) {
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle' | 'checking' | 'error' | 'open'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [focused, setFocused] = useState(false);
  /** No code: writing to Shreyas, on the tour's contact card, in the card's place. */
  const [writing, setWriting] = useState(false);
  const lcd = useRef<HTMLDivElement>(null);

  // PIP comes round as the code goes in: asleep, stirring, looking, then glad.
  const own: MoodId | null = unlocked
    ? 'happy'
    : state === 'checking'
      ? 'thinking'
      : state === 'open'
        ? 'happy'
        : state === 'error'
          ? 'sad'
          : code.length === 0
            ? focused
              ? 'drowsy'
              : 'sleeping'
            : code.length < length / 2
              ? 'drowsy'
              : 'curious';

  const check = async (full: string) => {
    setState('checking');
    setError(null);
    try {
      const res = await fetch('/api/tour/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: full }),
      });
      if (res.ok) {
        setState('open');
        // The cells light left to right first (entrance.css), then the dive.
        setTimeout(() => lcd.current && open(centre(lcd.current), true), 520);
        return;
      }
      setError((await res.json().catch(() => null))?.error ?? 'Something went wrong. Try again.');
    } catch {
      setError('Something went wrong. Try again.');
    }
    setState('error');
    setShake((s) => s + 1);
  };

  const onCode = (raw: string) => {
    if (state === 'checking' || state === 'open') return;
    const next = normal(raw);
    setCode(next);
    if (state === 'error') {
      setState('idle');
      setError(null);
    }
    if (next.length === length) void check(next);
  };

  // One layout for both visitors, slot for slot — title, line, display,
  // button, small print — so switching between them moves nothing. A code
  // kept in this browser shows in the display, lit, as dots.
  const title = unlocked
    ? 'Welcome back'
    : state === 'open'
      ? 'Awake'
      : state === 'checking'
        ? 'Checking…'
        : code.length
          ? 'Waking up…'
          : 'PIP is asleep';
  const cells = unlocked ? '•'.repeat(length) : code;

  if (writing && !unlocked) {
    // The same card and request the takeover offers ("Write to Shreyas"); Cancel comes back here.
    return (
      <TourHandout
        handout={{ kind: 'contact' }}
        writing
        draft={CODE_REQUEST}
        where="entrance"
        leaving={false}
        onClose={() => setWriting(false)}
        className="tour-handout--poster"
      />
    );
  }

  return (
    <>
      <Pip state={mood ?? own} />
      <p className="tour-poster-title">{title}</p>
      {/* The line under the title, or what went wrong in its place. */}
      <p id="poster-code-error" className={`tour-poster-text ${error ? 'tour-poster-text--error' : ''}`} role={error ? 'alert' : undefined}>
        {error ?? (unlocked ? 'Your code is saved in this browser.' : 'Type your access code to wake it.')}
      </p>
      {/* The takeover's own LCD (entrance.css): a real input over the cells, unseen. */}
      <div
        key={shake}
        ref={lcd}
        className={`entrance-lcd tour-poster-lcd ${shake ? 'entrance-lcd--shake' : ''}`}
        data-state={unlocked ? 'open' : state === 'idle' ? undefined : state}
      >
        {Array.from({ length }, (_, i) => {
          const ch = cells[i];
          return (
            <Fragment key={i}>
              {i === length / 2 && (
                <span className="entrance-lcd-dash" aria-hidden="true">
                  -
                </span>
              )}
              <span
                className="entrance-lcd-cell"
                data-caret={!unlocked && focused && state === 'idle' && i === code.length ? '' : undefined}
                style={{ '--i': i } as React.CSSProperties}
                aria-hidden="true"
              >
                <span className="entrance-lcd-ghost" />
                {ch && (
                  <span key={ch} className="entrance-lcd-lit">
                    {ch}
                  </span>
                )}
              </span>
            </Fragment>
          );
        })}
        {!unlocked && (
          <>
            <label htmlFor="poster-code" className="sr-only">
              Access code
            </label>
            <input
              id="poster-code"
              className="entrance-lcd-input"
              value={code}
              onChange={(e) => onCode(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onSelect={(e) => {
                const el = e.currentTarget;
                if (el.selectionStart !== el.value.length) el.setSelectionRange(el.value.length, el.value.length);
              }}
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={30}
              aria-invalid={!!error}
              aria-describedby={error ? 'poster-code-error' : undefined}
              disabled={state === 'checking' || state === 'open'}
            />
          </>
        )}
      </div>
      <div className="tour-poster-actions">
        {unlocked ? (
          <button
            type="button"
            className="entrance-btn entrance-btn--primary tour-poster-go"
            onClick={(e) => open(centre(e.currentTarget))}
          >
            Continue the tour
          </button>
        ) : (
          // Also checks by itself at the last character; this is for anyone who looks for a button.
          <button
            type="button"
            className="entrance-btn entrance-btn--primary tour-poster-go"
            disabled={code.length < length || state !== 'idle'}
            onClick={() => void check(code)}
          >
            Start the tour
          </button>
        )}
        <p className="tour-poster-small">
          {unlocked ? (
            <Different lock={lock} />
          ) : (
            <>
              No code?{' '}
              <button type="button" className="tour-poster-link" onClick={() => setWriting(true)}>
                Ask Shreyas for one
              </button>
            </>
          )}
        </p>
      </div>
    </>
  );
}
