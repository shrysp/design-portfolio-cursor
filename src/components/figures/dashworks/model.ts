// What the Dashworks figure shows: how one question becomes an answer. The
// steps are Dashworks' own; the question and the counts are the figure's.

/** The apps the question is searched across. */
export const SOURCES = ["NOTION", "SLACK", "LINEAR", "GMAIL", "GITHUB"];
/** How many of the documents that come back are ranked as sources of truth. */
export const TRUSTED = 2;

export const QUESTION = "WHERE IS THE Q3 ROADMAP?";

/** 0 is the bench at rest; then ask, search, rank, answer. */
export type Stage = 0 | 1 | 2 | 3 | 4;
export const LAST: Stage = 4;

/** Where the parts have got to, as far as the words need to know. */
export interface Progress {
  stage: Stage;
  /** How many documents have come back from the sources. */
  back: number;
  ranked: boolean;
  answered: boolean;
}

/** What the tag over the part in play says, read from where the parts are. */
export function statusOf({ stage, back, ranked, answered }: Progress) {
  if (stage === 1) return "Reading the question";
  if (stage === 2) {
    if (back === 0) return `Searching ${SOURCES.length} apps in real time`;
    return back < SOURCES.length ? `${back} of ${SOURCES.length} documents back` : `${SOURCES.length} documents retrieved`;
  }
  if (stage === 3) return ranked ? `${TRUSTED} ranked as sources of truth` : "Ranking the documents";
  if (stage === 4) return answered ? `Answer written, with ${TRUSTED} references` : "Writing the answer";
  return "";
}

/** The same, for a screen reader. */
export function spokenOf(stage: Stage) {
  if (stage === 1) return "Step 1: a question card drops in and is read for its intent.";
  if (stage === 2) return `Step 2: the question is searched across ${SOURCES.length} connected apps in real time, and a document comes back from each.`;
  if (stage === 3) return `Step 3: the documents are ranked, and ${TRUSTED} stand out as sources of truth.`;
  if (stage === 4) return `Step 4: an answer is written, with ${TRUSTED} references.`;
  return "A bench with a row of five app sources.";
}

/** The figure in one sentence, for the caption bar. */
export const CAPTION =
  "How Dashworks answers a question: it reads the question, searches the connected apps in real time, ranks what comes back, and writes an answer with references.";
