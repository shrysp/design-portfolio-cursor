import type { Metadata } from 'next';

/**
 * A review-only copy of the portfolio for Dive Club, at /dive: the same pages
 * as the public site (each file under here only points at the real one),
 * with links that stay under /dive (lib/sitePath.ts). It is public but kept
 * out of search, the sitemap and the site's own navigation.
 *
 * Inflight's review widget loads here and nowhere else: data-path limits it
 * to /dive and its subpages. React puts an async script with a src into the
 * document's <head>, so it is in the HTML as served, not added after load.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script src="https://inflight.co/widget.js" data-org="aius9qpt" data-path="/dive" async></script>
      {children}
    </>
  );
}
