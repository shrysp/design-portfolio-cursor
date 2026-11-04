import type { Metadata } from 'next';
import NotesWindow from '@/components/present/NotesWindow';

/**
 * The presenter's notes for a deck, in a window of their own. It holds nothing itself: it follows
 * whichever deck at the same address is open in this browser.
 */
export const metadata: Metadata = { title: 'Notes' };

export default function NotesPage() {
  return <NotesWindow />;
}
