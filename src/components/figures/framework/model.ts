// What the Search, Groups, Playbooks figure shows. The counts are the
// figure's own: a deck of twelve contact cards, four of which match the query.

export const DECK = 12;
/** Which cards in the deck match the query, counted from the back. */
export const MATCHES = [2, 5, 7, 10];
/** The group holds the matches, plus one more that turns up by itself later. */
export const GROUP = MATCHES.length + 1;

export const QUERY = "RAISED SERIES A";
/** The playbook's goal: the action it takes for everyone in the group. */
export const GOAL = "ASK FOR INTRO";

/** 0 is the bench at rest; 1, 2 and 3 are the three layers. */
export type Stage = 0 | 1 | 2 | 3;

export const STAGES = ["Search", "Groups", "Playbooks"] as const;

/** Where the parts have got to, as far as the words need to know. */
export interface Progress {
  stage: Stage;
  matched: boolean;
  saved: boolean;
  grown: boolean;
  /** How many emails have gone out. */
  sent: number;
}

/** What the tag over the station in play says, read from where the parts are. */
export function statusOf({ stage, matched, saved, grown, sent }: Progress) {
  if (stage === 1) return matched ? `${MATCHES.length} of ${DECK} contacts match` : `Searching ${DECK} contacts`;
  if (stage === 2) {
    if (grown) return `Auto-updated to ${GROUP} contacts`;
    return saved ? `${MATCHES.length} contacts saved as a group` : `Moving ${MATCHES.length} contacts into the group`;
  }
  if (stage === 3) return sent < GROUP ? `${sent} of ${GROUP} intro request emails sent` : `${GROUP} intro request emails sent`;
  return "";
}

/** The same, for a screen reader. */
export function spokenOf(stage: Stage) {
  if (stage === 1) return `Search: ${MATCHES.length} of ${DECK} contact cards rise out of the deck, and fall back when the search ends.`;
  if (stage === 2) return `Groups: the ${MATCHES.length} matching cards are lifted out of the deck and carried into the group's box, which then updates itself with a fifth.`;
  if (stage === 3) return `Playbooks: the goal is to ask for an intro, and an intro request email goes out to each of the group's ${GROUP} contacts.`;
  return `A bench with a deck of ${DECK} contact cards.`;
}
