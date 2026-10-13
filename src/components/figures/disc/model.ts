// What the program disc shows: the engine is a function of time. One change of
// expression is cut into the disc as two tracks, the eyes' height and the
// shell's rise, and turning the disc to any angle gives that moment's face.
// The tracks are the engine's own numbers, sampled when the disc is cut.

import { DEFAULT_CONFIG, PIP, createEngine, type EngineConfig } from "@shrysp/cameo";

/** The expressions the face can change to, from rest. */
export const POSES = ["surprised", "happy", "sad", "angry"] as const;

/** How a change is carried: each is a switch on the engine. */
export const FEEL = [
  { key: "eyeAnticipation", name: "anticipation" },
  { key: "eyesLead", name: "eyes lead" },
  { key: "blinkOnChange", name: "blink" },
  { key: "eyeSettle", name: "settle" },
  { key: "headArc", name: "head arc" },
] as const;
export type Feel = Record<(typeof FEEL)[number]["key"], boolean>;
export const ALL_ON: Feel = { eyeAnticipation: true, eyesLead: true, blinkOnChange: true, eyeSettle: true, headArc: true };

/** The stretch of time on the disc, in seconds from the change. */
export const FROM = -0.1;
export const TO = 1;
/** The engine's clock when the change happens. */
const CHANGE_AT = 2;
/** How finely the tracks are cut. */
export const CUTS = 220;
const EACH = (TO - FROM) / (CUTS - 1);

/** Its own unprompted movement is switched off, so only the change is on the disc. */
export const configOf = (feel: Feel): EngineConfig => ({ ...DEFAULT_CONFIG, blinking: false, saccades: false, idleMotion: false, lookStrength: 0, ...feel });

/** A disc: the engine set up for one change, and its two tracks. */
export function cut(pose: string, feel: Feel) {
  const config = configOf(feel);
  const engine = createEngine("idle", PIP.eyeBuild);
  engine.setPose(pose, CHANGE_AT, config);
  const frameAt = (t: number) => engine.sample(CHANGE_AT + t, {}, config);
  // The eyes' height as a share of where it rests, and how far the shell has risen, in the character's own units
  const eyes = new Float32Array(CUTS);
  const shell = new Float32Array(CUTS);
  for (let index = 0; index < CUTS; index++) {
    const frame = frameAt(FROM + index * EACH);
    eyes[index] = frame.left.scaleY - 1;
    shell[index] = -frame.housing.y;
  }
  return { frameAt, eyes, shell };
}
export type Disc = ReturnType<typeof cut>;

/** A track's value at a moment, between its cuts. */
export function read(track: Float32Array, t: number) {
  const place = Math.min(Math.max((t - FROM) / EACH, 0), CUTS - 1);
  const index = Math.min(Math.floor(place), CUTS - 2);
  return track[index] + (track[index + 1] - track[index]) * (place - index);
}

export const timeOf = (index: number) => FROM + index * EACH;

/** The figure in words, for a screen reader. */
export function spokenOf(pose: string, t: number) {
  const ms = Math.round(Math.abs(t) * 1000);
  if (t < 0) return `The disc stands ${ms} milliseconds before the face changes to ${pose}.`;
  return `The disc stands ${ms} milliseconds into the change to ${pose}. Turn it to any moment and the face is the one for that moment.`;
}

export const CAPTION =
  "A movement is not played forward frame by frame. Every moment of it exists at once, so the face can be worked out for any point in time.";
