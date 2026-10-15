'use client';

import { usePathname } from 'next/navigation';

/**
 * The review copy of the portfolio lives under /dive (app/dive): the same
 * pages, kept out of search, with a reviewer's widget. A link followed there
 * stays there, so its home is /dive and its case studies /dive/projects/….
 * Everywhere else the base is empty and every path is what it always was.
 *
 * Read from the address rather than a provider, because the dock and the
 * tour's toast sit in the root layout, above any page's own layout.
 */
export const REVIEW_BASE = '/dive';

const baseOf = (pathname: string) =>
  pathname === REVIEW_BASE || pathname.startsWith(`${REVIEW_BASE}/`) ? REVIEW_BASE : '';

export function useSitePath() {
  const pathname = usePathname() ?? '';
  const base = baseOf(pathname);
  return {
    base,
    /** A site path ("/", "/projects/quinn") as it should be linked from here. */
    to: (path: string) => (base ? (path === '/' ? base : base + path) : path),
    /** The current path without the review base: "/projects/quinn" on /dive/projects/quinn. */
    path: base ? pathname.slice(base.length) || '/' : pathname,
  };
}
