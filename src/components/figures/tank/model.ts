// What the header tank shows: the character's attention. It is one number;
// everything that happens around the character raises it and time lowers it,
// and the band it is in decides the face the character rests in. The levels,
// the bands and the half-life are the package's own.

/** Seconds for attention to halve, as the package ships. */
export const HALF_LIFE = 25;
/** How many times faster than that the tank runs, so a visitor can watch it empty. */
export const RATE = 3;
/** Where the package's director starts a character. */
export const START = 0.7;

/** The bands, lowest first: the pose the character rests in, what the scale calls it, and the level it starts at. */
export const BANDS = [
  { pose: "sleeping", name: "asleep", from: 0 },
  { pose: "drowsy", name: "drowsy", from: 0.09 },
  { pose: "idle", name: "idle", from: 0.3 },
  { pose: "listening", name: "attentive", from: 0.82 },
] as const;

export const bandOf = (level: number) => BANDS.reduce((found, band, index) => (level >= band.from ? index : found), 0);

/**
 * What can happen around the character. Each fills the tank to its own mark
 * and no further: it sets a floor under attention and never adds to it. Some
 * also get a reaction from the face. Leaving the tab is the one that lowers it.
 */
export const EVENTS = [
  { name: "click", to: 0.65, pose: "", lasts: 0 },
  { name: "copy", to: 0.85, pose: "wink", lasts: 0.7 },
  { name: "hover", to: 0.85, pose: "curious", lasts: 1.4 },
  { name: "typing", to: 0.9, pose: "", lasts: 0 },
  { name: "rush", to: 1, pose: "surprised", lasts: 0.9 },
] as const;
/** What attention drops to when the tab is hidden. */
export const DUMPED = 0.08;
/** The place of "leave the tab" among the things a visitor can do, after the events. */
export const LEAVE = EVENTS.length;

/** Attention after `dt` seconds of nothing happening. */
export const drain = (level: number, dt: number) => level * 2 ** (-(dt * RATE) / HALF_LIFE);

/** Left alone, the tank is topped up whenever it falls below a level: the level, then which event. */
export const TOUR: [number, number][] = [
  [0.46, 2],
  [0.2, 0],
  [0.05, 4],
  [0.24, 3],
  [0.05, 1],
  [0.4, LEAVE],
  [0.05, 0],
];

export const percent = (level: number) => `${Math.round(level * 100)}%`;

/** The figure in words, for a screen reader. */
export function spokenOf(level: number, event: number) {
  const band = BANDS[bandOf(level)];
  const base = `Attention is at ${percent(level)}: the character is ${band.name}.`;
  if (event === LEAVE) return `The tab was left: attention drops to ${percent(DUMPED)} at once. ${base}`;
  if (event >= 0) return `A ${EVENTS[event].name} fills the tank to ${percent(EVENTS[event].to)}. ${base}`;
  return base;
}

export const CAPTION =
  "Attention jumps the moment something happens and fades slowly when nothing does, so the character wakes at once but takes its time falling asleep. Shown at three times real speed.";
