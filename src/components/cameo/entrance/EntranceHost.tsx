'use client';

import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import CrtLayer from '../crt/CrtLayer';
import { EntranceContext, type Opening } from './context';
import { GLASS_APPEAR, TOUR, Takeover } from './TourEntrance';

/**
 * Lives in the layout the case study and the tour share, so what it renders
 * survives the route change between them:
 *
 * - the takeover, once the visitor presses Start — its stream keeps flying
 *   while the tour page loads underneath, then lands on it and fades away;
 * - the CRT glass, from the moment the takeover opens to the end of the tour.
 *
 * Nothing is handed from one page to another mid-motion, so nothing jumps.
 */

export default function EntranceHost({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [opened, setOpened] = useState<Opening | null>(null);
  const open = useCallback((opening: Opening) => setOpened((now) => now ?? opening), []);
  // The glass is up through the tour, and over the case study while the screen look's takeover is.
  const glass = pathname === TOUR || opened?.theme === 'screen';

  return (
    <EntranceContext.Provider value={open}>
      {children}
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
    </EntranceContext.Provider>
  );
}
