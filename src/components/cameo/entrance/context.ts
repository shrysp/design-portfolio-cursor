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

/**
 * Whether the takeover (or the way out) is over the page. PIP in the dock
 * stops drawing under it: every frame it drew restarted the move into the tour.
 */
export const TakeoverUpContext = createContext(false);

/** Announced once the takeover has landed its stream on the tour and is gone. */
export const LANDED = 'tour:landed';

/** Provided by EntranceHost, in the layout the case study and the tour share. */
export const EntranceContext = createContext<((opening: Opening) => void) | null>(null);

/**
 * Where the tour's Back goes: the page the visitor came into it from, where
 * they were on it, and what to call it ("Home", "Quinn"). Kept for the visit
 * (sessionStorage), so a reload of the tour still knows. None for a visit
 * that began on the tour itself or from an invitation: Back goes to the case
 * study, as it always did.
 */
export type WayBack = { path: string; label: string; scroll: number };
const WAY_BACK = 'tour.from';

export function rememberWayBack(way: WayBack | null) {
  try {
    if (way) sessionStorage.setItem(WAY_BACK, JSON.stringify(way));
    else sessionStorage.removeItem(WAY_BACK);
  } catch {
    // No storage: Back goes to the case study.
  }
}

export function wayBack(): WayBack | null {
  try {
    const way = JSON.parse(sessionStorage.getItem(WAY_BACK) ?? 'null') as WayBack | null;
    return way && typeof way.path === 'string' && way.path.startsWith('/') ? way : null;
  } catch {
    return null;
  }
}

/** Opens the takeover. For the case study's card (TourEntrance) and PIP in the dock (DockInvite). */
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
