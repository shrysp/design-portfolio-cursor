// The truth the Q-score figure shows: one contact, scored against two goals.
// The numbers are the ones in the Quinn designs.

export interface Goal {
  key: "hiring" | "fundraising";
  label: string;
  score: number;
  /** What is true of the contact right now that drives this score, as flagged on their card. */
  signal: string;
  reason: string;
}

export const GOALS: [Goal, Goal] = [
  { key: "hiring", label: "Hiring", score: 92, signal: "HIRING ENGINEERS", reason: "his company is hiring engineers" },
  { key: "fundraising", label: "Fundraising", score: 35, signal: "JUST RAISED", reason: "they have just raised" },
];

export const SCALE = 100;

/** The figure in one sentence, for the caption bar. */
export const CAPTION = `The same contact scores ${GOALS[0].score} for ${GOALS[0].label.toLowerCase()}, because ${GOALS[0].reason}, and ${GOALS[1].score} for ${GOALS[1].label.toLowerCase()}, because ${GOALS[1].reason}.`;

/** The same, for a screen reader. */
export const SPOKEN = `One contact, two Q-scores: ${GOALS[0].score} out of ${SCALE} for ${GOALS[0].label}, ${GOALS[1].score} for ${GOALS[1].label}.`;
