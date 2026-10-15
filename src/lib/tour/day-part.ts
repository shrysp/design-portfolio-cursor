/**
 * Morning, afternoon or evening by the visitor's own clock.
 *
 * Only ever worked out in the browser. Rendered on the server, it was the
 * server's clock (UTC on Vercel), so someone in Pune at 8 pm could be told
 * "Good afternoon". The server never guesses: the spoken hello is told which
 * part of the day it is by the browser (api/tour/session), and says nothing
 * about the time if it is not told.
 */

import { useEffect, useState } from 'react';

export const DAY_PARTS = ['morning', 'afternoon', 'evening'] as const;
export type DayPart = (typeof DAY_PARTS)[number];

export function dayPartNow(): DayPart {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
}

/** "Good evening", once mounted; "Hello" before, and on the server. */
export function useGreeting(): string {
  const [part, setPart] = useState<DayPart | null>(null);
  useEffect(() => setPart(dayPartNow()), []);
  return part ? `Good ${part}` : 'Hello';
}
