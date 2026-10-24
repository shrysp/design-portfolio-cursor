/** Set by the middleware on a page asked for with a hard refresh; read once, then cleared, by the dock's tour invitation. */
export const HARD_REFRESH_COOKIE = 'tour-fresh';

/**
 * Whether this load of the site should bring the tour's invitation out: a
 * visit arriving (a link, a typed address) or a hard refresh — not a normal
 * reload, and not back or forward. Clears the hard refresh's note as it reads it.
 */
export function freshLoad() {
  const hard = document.cookie.split('; ').includes(`${HARD_REFRESH_COOKIE}=1`);
  if (hard) document.cookie = `${HARD_REFRESH_COOKIE}=; max-age=0; path=/`;
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  return hard || !nav || nav.type === 'navigate' || nav.type === 'prerender';
}
