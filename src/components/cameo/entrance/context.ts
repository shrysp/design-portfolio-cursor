'use client';

import { createContext, useContext } from 'react';
import type { Theme } from './field';
import type { Invite } from './InviteTicket';

/**
 * What opening the takeover takes: where it opens from, which look, whether a
 * code is still needed, and — for an invited guest — their ticket.
 */
export type Opening = { origin: [number, number]; theme: Theme; unlocked: boolean; invite?: Invite; onClosed?: () => void };

/** Announced once the takeover has landed its stream on the tour and is gone. */
export const LANDED = 'tour:landed';

/** Provided by EntranceHost, in the layout the case study and the tour share. */
export const EntranceContext = createContext<((opening: Opening) => void) | null>(null);

/** Opens the takeover. For the Start button on the case study (TourEntrance). */
export function useEntrance() {
  const open = useContext(EntranceContext);
  if (!open) throw new Error('useEntrance needs an EntranceHost above it (src/app/projects/cameo/layout.tsx).');
  return open;
}
