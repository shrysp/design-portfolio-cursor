'use client';

import { createContext, useContext } from 'react';
import type { Theme } from './field';
import type { Invite } from './InviteTicket';

/** The tour's own page. Here rather than with the takeover, so pages can name it without loading that. */
export const TOUR = '/projects/cameo/tour';

/** How long the CRT glass takes to come up as the takeover opens (TourEntrance, SCREEN.off × 0.6). */
export const GLASS_APPEAR = 600;

/**
 * What opening the takeover takes: where it opens from, which look, whether a
 * code is still needed, and — for an invited guest — their ticket. `back`
 * names where its back button goes (the page under it): the case study,
 * unless said otherwise.
 */
export type Opening = {
  origin: [number, number];
  theme: Theme;
  unlocked: boolean;
  invite?: Invite;
  back?: string;
  onClosed?: () => void;
};

/** Announced once the takeover has landed its stream on the tour and is gone. */
export const LANDED = 'tour:landed';

/** Provided by EntranceHost, in the layout the case study and the tour share. */
export const EntranceContext = createContext<((opening: Opening) => void) | null>(null);

/** Opens the takeover. For the case study's card (TourEntrance) and the toast (TourToast). */
export function useEntrance() {
  const open = useContext(EntranceContext);
  if (!open) throw new Error('useEntrance needs an EntranceHost above it (the root layout).');
  return open;
}

/**
 * Leaves the tour for the case study with the tube switching off (TourExit,
 * in EntranceHost). Null where there is no host, and the link goes the plain way.
 */
export const LeaveContext = createContext<(() => void) | null>(null);

export function useLeaveTour() {
  return useContext(LeaveContext);
}
