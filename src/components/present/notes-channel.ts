/**
 * How a deck and its notes window talk: over a BroadcastChannel named for the deck's address,
 * so two decks open at once never cross. Only same-origin windows in the same browser hear it.
 */

export const channelFor = (deckPath: string) => `present-notes:${deckPath.replace(/\/notes\/?$/, '')}`;

/** Where the deck is, sent whenever it moves and whenever a notes window says hello */
export type NotesState = {
  type: 'state';
  number: number;
  total: number;
  section: string;
  /** The branch slide on screen, by its label, or null in the main order */
  branch: string | null;
  notes: string | null;
  /** Whether V has a fallback to show here */
  fallback: boolean;
  /** Whether B opens branches here */
  more: boolean;
  next: { section: string; notes: string | null } | null;
};

/** What the notes window sends: a hello when it opens, and the keys pressed in it */
export type NotesMessage = { type: 'hello' } | { type: 'key'; key: string };
