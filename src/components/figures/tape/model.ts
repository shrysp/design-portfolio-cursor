// What the tape deck shows: how the tour's character reacts to a sentence
// before it has finished being spoken. Every time here was measured in one
// live session (14 October 2026), recording PIP's voice and noting when each
// piece of the transcript arrived and when each mood reading came back.

import { reactionTo, type Mood } from "@/components/cameo/moods";
import { CLIPS } from "./clips";

export { CLIPS };
export type Clip = (typeof CLIPS)[number];
export type Sentence = Clip["sentences"][number];

/** The moods a sentence is read for, in the order of the reader's lamps. */
export const LAMPS: Mood[] = ["excited", "curious", "surprised", "error", "frustrated", "sad", "calm", "neutral"];

/**
 * How far the written words run ahead of the voice, in seconds. Across the
 * session's fourteen sentences it was between 0.87 and 1.31, and 1.0 in the
 * middle: the gap between the deck's two heads.
 */
export const LEAD = 1;
/** Tape past the heads, in world units a second. */
export const SPEED = 56;
/** Seconds of blank tape before a recording and after it. */
export const LEAD_IN = 2.3;
export const RUN_OUT = 1.3;

/**
 * Where a recording has got to, as the three things that happen to each
 * sentence in turn: its words are written, its reading comes back (and the
 * face changes), and only then does the voice finish saying it.
 */
export interface Progress {
  /** The sentence being followed, or -1 before the first is written. */
  sentence: number;
  step: 0 | 1 | 2 | 3;
}

/** A sentence is followed from the moment its words are complete until the next one's are. */
export function progressOf(clip: Clip, t: number): Progress {
  let sentence = -1;
  clip.sentences.forEach((each, index) => {
    if (t >= each.written[1]) sentence = index;
  });
  if (sentence < 0) return { sentence, step: 0 };
  const { read, heard } = clip.sentences[sentence];
  return { sentence, step: t >= heard[1] ? 3 : t >= read ? 2 : 1 };
}

export const percent = (share: number) => `${Math.round(share * 100)}%`;

/** The three steps, named for the panel under the drawing. */
export const STEPS = ["Words written", "Read: the face changes", "Voice finishes"] as const;

/** What each step has to show for a sentence, once it has happened. */
export function valuesOf(sentence: Sentence): [string, string, string] {
  return [`at ${sentence.written[1].toFixed(1)} s`, `${sentence.mood} ${percent(sentence.p)}`, `${(sentence.heard[1] - sentence.read).toFixed(1)} s later`];
}

/** The pose a sentence's reading gives the face, and for how long, or nothing for a plain one. */
export function reactionOf(sentence: Sentence) {
  const reaction = reactionTo(sentence.mood, sentence.p);
  return reaction?.pose && reaction.pose !== "idle" ? { pose: reaction.pose, lasts: reaction.duration ?? 1.4 } : null;
}

/** How loud the voice is at a moment of a recording, 0 to 1. */
export function loudnessOf(clip: Clip, t: number) {
  if (t < 0 || t >= clip.length) return 0;
  return clip.peaks[Math.floor((t / clip.length) * clip.peaks.length)] ?? 0;
}

/** The figure in words, for a screen reader, as each step happens. */
export function spokenOf(clip: Clip, { sentence, step }: Progress) {
  const base = `A recording of PIP sounding ${clip.name}.`;
  if (sentence < 0) return base;
  const said = clip.sentences[sentence];
  if (step === 1) return `${base} The words of a sentence are written, before the voice has said them. It is being read for its mood.`;
  if (step === 2) return `${base} The reading is back: ${said.mood}, ${percent(said.p)}. The face changes while the sentence is still being spoken.`;
  return `${base} The voice finishes the sentence, ${(said.heard[1] - said.read).toFixed(1)} seconds after the face changed.`;
}

export const CAPTION =
  "The character knows the mood of a sentence before it has finished saying it, so its face changes mid-sentence, the way a person's does.";
