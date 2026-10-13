import type { Reaction } from '@shrysp/cameo';
import type { CharacterHandle } from '@shrysp/cameo/react';

// The moods a sentence is read for, in the order they are listed. What each
// one means to the reader is written in lib/tour/server/read-sentence.ts.
export const MOODS = ['excited', 'curious', 'surprised', 'error', 'frustrated', 'sad', 'calm', 'neutral'] as const;

export type Mood = (typeof MOODS)[number];

// What the face does about each, for the tour and the case study alike.
// Neutral has no entry, so a plain statement is left alone. Every reaction is
// silent and short: the face should read as attentive, not as a puppet show.
export const MOOD_REACTIONS: Record<string, Reaction> = {
  'mood:excited': { pose: 'starstruck', duration: 1.6, arousal: 0.95, volume: 0 },
  'mood:curious': { pose: 'curious', duration: 1.8, arousal: 0.85, volume: 0 },
  'mood:surprised': { pose: 'surprised', duration: 1.2, arousal: 1, volume: 0 },
  'mood:error': { pose: 'error', duration: 1.6, arousal: 0.9, volume: 0 },
  'mood:frustrated': { pose: 'angry', duration: 1.6, arousal: 0.9, volume: 0 },
  'mood:sad': { pose: 'sad', duration: 1.8, arousal: 0.6, volume: 0 },
  'mood:calm': { pose: 'idle', duration: 1.4, arousal: 0.5, volume: 0 },
};

/** How much of a reaction a reading earns: a little under half for a bare guess, all of it for a certain one. */
export const strengthOf = (p: number) => 0.45 + 0.55 * Math.max(0, Math.min(1, p));

/** The reaction a mood gets when it was read with confidence `p`, or nothing for a mood with none. */
export function reactionTo(mood: string, p: number): Reaction | null {
  const base = MOOD_REACTIONS[`mood:${mood}`];
  if (!base) return null;
  const strength = strengthOf(p);
  return { ...base, duration: (base.duration ?? 1.2) * strength, arousal: (base.arousal ?? 0.8) * strength };
}

/** Has the character react to a sentence's mood, as strongly as the reading was sure. */
export function showMood(character: CharacterHandle | null, mood: string, p: number) {
  const reaction = reactionTo(mood, p);
  if (!character || !reaction) return;
  character.director.on(`mood:${mood}`, reaction);
  character.emit({ type: `mood:${mood}` });
}
