import type { Metadata } from 'next';
import { Figtree, Geist_Mono, Newsreader } from 'next/font/google';

/**
 * Presentation decks, one per company, each at an unguessable address. They are not linked from
 * the site and are kept out of search; whoever has the link can page through the deck.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const figtree = Figtree({ variable: '--font-figtree', subsets: ['latin'], display: 'swap' });
const newsreader = Newsreader({ variable: '--font-newsreader', subsets: ['latin'], display: 'swap', axes: ['opsz'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' });

export default function PresentLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${figtree.variable} ${newsreader.variable} ${geistMono.variable}`}>{children}</div>;
}
