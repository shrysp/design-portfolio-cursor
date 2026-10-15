'use client';

import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import CrtLayer from '../crt/CrtLayer';
import { EntranceContext, LeaveContext, type Opening } from './context';
import { GLASS_APPEAR, TOUR, Takeover } from './TourEntrance';
import TourExit from './TourExit';

/**
 * Lives in the layout the case study and the tour share, so what it renders
 * survives the route change between them:
 *
 * - the takeover, once the visitor presses Start — its stream keeps flying
 *   while the tour page loads underneath, then lands on it and fades away;
 * - the CRT glass, from the moment the takeover opens to the end of the tour;
 * - the way out of the tour (TourExit): the tube switching off over the tour
 *   and opening again on the case study.
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

  return (
    <EntranceContext.Provider value={open}>
      <LeaveContext.Provider value={leave}>{children}</LeaveContext.Provider>
      {opened &&
        createPortal(
          <Takeover
            unlocked={opened.unlocked}
            origin={opened.origin}
            theme={opened.theme}
            invite={opened.invite}
            onClosed={() => {
              setOpened(null);
              opened.onClosed?.();
            }}
          />,
          document.body,
        )}
      {/* Comes up with the takeover over the case study; already up when the tour is opened directly. */}
      {glass && <CrtLayer appear={opened ? GLASS_APPEAR : 0} />}
      {leaving && createPortal(<TourExit onDone={() => setLeaving(false)} />, document.body)}
    </EntranceContext.Provider>
  );
}
