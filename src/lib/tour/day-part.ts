/**
 * Morning, afternoon or evening by the visitor's own clock.
 *
 * Only ever worked out in the browser. Rendered on the server, it was the
 * server's clock (UTC on Vercel), so someone in Pune at 8 pm could be told
 * "Good afternoon". The server never guesses: the spoken hello is told which
 * part of the day it is by the browser (api/tour/session), and says nothing
 * about the time if it is not told.
 *
 * No React here: the session route imports DAY_PARTS, and server code may
 * not load a hook. The screens' hook is in use-greeting.ts.
 */

export const DAY_PARTS = ['morning', 'afternoon', 'evening'] as const;
export type DayPart = (typeof DAY_PARTS)[number];

export function dayPartNow(): DayPart {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
}
