'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Doto } from 'next/font/google';
import { playRecipe } from '@shrysp/cameo/sound';
import { POWER_PRESS } from '@/lib/tour/tour-sounds';
import './entrance.css';

const lcd = Doto({ subsets: ['latin'], axes: ['ROND'], variable: '--font-dot', display: 'block' });

/** From the switch going down to the tube answering: long enough to see the light change. */
const LATCH_MS = 160;

/**
 * Where an invitation link opens: the dark screen, switched off, with its
 * power switch. The way in used to start on its own as the page loaded, and a
 * browser plays nothing before the visitor has clicked or pressed a key, so
 * the tube coming on, PIP waking and the ticket printing were all silent.
 * Switching it on is that first press. Any key does it too.
 *
 * A piece of the tour's own console (tour.css): smoked plastic, a graphite
 * gel switch set in a well, its symbol lit amber on standby, and the dot
 * matrix LCD beside it. Pressed, it goes down with a click (POWER_PRESS) on
 * the press itself rather than the release, the light turns PIP's green, and
 * a beat later the tube comes on.
 */
export default function PowerOn({ name, onOn }: { name?: string; onOn: () => void }) {
  const [down, setDown] = useState(false);
  const [lit, setLit] = useState(false);
  const done = useRef(false);

  const press = useCallback(() => {
    if (done.current) return;
    setDown(true);
    playRecipe(POWER_PRESS);
  }, []);
  const latch = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setDown(false);
    setLit(true);
    window.setTimeout(onOn, LATCH_MS);
  }, [onOn]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      e.preventDefault();
      press();
    };
    const onKeyUp = () => {
      if (!done.current) latch();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [press, latch]);

  const who = name ? `, ${name.charAt(0).toUpperCase()}${name.slice(1)}` : '';
  return (
    <div className={`power-on ${lcd.variable}`}>
      <div className="power-on-plate">
        <div className="power-on-well">
          <button
            type="button"
            className="power-on-switch"
            data-down={down || undefined}
            data-lit={lit || undefined}
            onPointerDown={press}
            onPointerLeave={() => setDown(false)}
            onClick={latch}
            aria-label={`Switch on${who}`}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
              <path d="M12 3.5v7.5" />
              <path d="M6.7 6.9a7.3 7.3 0 1 0 10.6 0" />
            </svg>
          </button>
        </div>
        <div className="power-on-lcd" data-lit={lit || undefined} aria-hidden>
          {lit ? 'ON' : 'STANDBY'}
        </div>
      </div>
      <p className="power-on-label">Switch on{who}</p>
    </div>
  );
}
