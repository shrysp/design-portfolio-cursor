'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import CrtLayer from '../crt/CrtLayer';
import { EntranceContext, GLASS_APPEAR, LeaveContext, TOUR, type Opening } from './context';
import TourToast from './TourToast';

type Parts = { Takeover: typeof import('./TourEntrance').Takeover; TourExit: typeof import('./TourExit').default };
/**
 * The takeover and the way out, loaded when first wanted: every page has a
 * host, few open it (the toast and the card fetch them ahead). By hand rather
 * than next/dynamic, whose lazy wrapper was seen to stay suspended in
 * development after the module had arrived, with the glass up and no takeover.
 */
let parts: Parts | null = null;
const loadParts = () =>
  Promise.all([import('./TourEntrance'), import('./TourExit')]).then(([e, x]) => (parts = { Takeover: e.Takeover, TourExit: x.default }));

/**
 * Lives in the root layout, so what it renders survives every route change —
 * above all the one into the tour, from wherever the visitor started:
 *
 * - the takeover, once the visitor presses Start (the case study's card, or
 *   the toast on any page) — its stream keeps flying while the tour page
 *   loads underneath, then lands on it and fades away;
 * - the CRT glass, from the moment the takeover opens to the end of the tour;
 * - the way out of the tour (TourExit): the tube switching off over the tour
 *   and opening again on the case study;
 * - the toast (TourToast) that offers the tour from any page.
 *
 * The page itself is wrapped once here (data-crt-page), so whichever page is
 * under the glass is the one squeezed to a line as the tube switches off.
 *
 * Nothing is handed from one page to another mid-motion, so nothing jumps.
 */

export default function EntranceHost({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [opened, setOpened] = useState<Opening | null>(null);
  const open = useCallback((opening: Opening) => setOpened((now) => now ?? opening), []);
  const [leaving, setLeaving] = useState(false);
  const leave = useCallback(() => setLeaving(true), []);
  // The glass is up through the tour, over the case study while the screen look's takeover is, and on the way out.
  const glass = pathname === TOUR || opened?.theme === 'screen' || leaving;
  const [loaded, setLoaded] = useState<Parts | null>(parts);

  /**
   * The page under the takeover, put to sleep while the visitor dives into
   * the tour: not drawn at all, so nothing on it goes on rendering every
   * frame — each of those renders started the move into the tour over, and on
   * a fast screen it never finished. Woken again in an update of its own once
   * the tour's address is in, so the tour draws without being interrupted;
   * or, if the way in fails, back where the visitor was on the page.
   */
  const [asleep, setAsleep] = useState(false);
  const scrolledTo = useRef(0);
  const pageAsleep = useCallback((sleep: boolean) => {
    if (sleep) scrolledTo.current = window.scrollY;
    setAsleep(sleep);
  }, []);
  useEffect(() => {
    if (asleep && pathname === TOUR) setAsleep(false);
  }, [asleep, pathname]);
  const wasAsleep = useRef(false);
  useLayoutEffect(() => {
    if (wasAsleep.current && !asleep && pathname !== TOUR) window.scrollTo(0, scrolledTo.current);
    wasAsleep.current = asleep;
  }, [asleep, pathname]);
  useEffect(() => {
    if ((opened || leaving) && !loaded) void loadParts().then(setLoaded);
  }, [opened, leaving, loaded]);
  const { Takeover, TourExit } = loaded ?? {};

  return (
    <EntranceContext.Provider value={open}>
      <LeaveContext.Provider value={leave}>
        <div data-crt-page>{asleep ? null : children}</div>
      </LeaveContext.Provider>
      {/* Not while the takeover is up: under it, its PIP would go on drawing every frame for nothing. */}
      {!opened && !leaving && <TourToast />}
      {opened &&
        Takeover &&
        createPortal(
          <Takeover
            unlocked={opened.unlocked}
            origin={opened.origin}
            theme={opened.theme}
            invite={opened.invite}
            back={opened.back}
            onPageAsleep={pageAsleep}
            onClosed={() => {
              setOpened(null);
              opened.onClosed?.();
            }}
          />,
          document.body,
        )}
      {/* Comes up with the takeover over the page; already up when the tour is opened directly. */}
      {glass && <CrtLayer appear={opened ? GLASS_APPEAR : 0} />}
      {leaving && TourExit && createPortal(<TourExit onDone={() => setLeaving(false)} />, document.body)}
    </EntranceContext.Provider>
  );
}
