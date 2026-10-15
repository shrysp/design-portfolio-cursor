/**
 * Client wrapper for /api/tour.
 *
 * A new sentence does NOT abort the one before it.
 * Sentences land every second or so while PIP talks — faster than a Jev
 * round trip — so abort-on-next cancelled nearly every call, and the
 * sentence that actually named the photo ("tossed his cap with Ritchie the
 * Tiger") was usually the one cut off. Every sentence now gets its own call.
 *
 * What survives from the old shape is the ordering rule: a reply for an older
 * sentence that lands after a newer sentence's reply is marked `stale`, so the
 * face never steps backward to a mood PIP has already moved past. It is not
 * dropped: its photos may still be the latest anyone has asked for, and
 * dropping them lost the sentence that named a photo whenever the plain
 * sentence after it came back first. `seq` lets the stage tell.
 */

import type { TopicId } from '@/lib/tour/suggestions';

export type TourReading = {
  mood: string;
  moodP: number;
  /**
   * Every photo this sentence mentions, best first — empty is a real, common
   * answer (most sentences name nothing photographed), not a failure.
   */
  images: { id: string; p: number }[];
  /** The card this sentence calls for — a project's title, or `contact` — or null, the usual answer. */
  card: { id: string; p: number } | null;
  /** The part of his life it is about (suggestions.ts TOPICS), or null. Drives which chips are offered. */
  topic: TopicId | null;
  /** Which sentence this was, in the order PIP said them. */
  seq: number;
  /** A newer sentence's reading came back first. */
  stale: boolean;
};

export function createTourClassifier() {
  let seq = 0;
  /** The newest sentence whose reply has been handed out; older ones arriving later are stale. */
  let applied = 0;
  /** Sentences at or below this belong to a turn that's over. */
  let cancelled = 0;
  const inflight = new Set<AbortController>();

  return {
    /** `question` is the visitor's original ask, giving a lone sentence its context. */
    async classify(text: string, question: string): Promise<TourReading | null> {
      const mine = ++seq;
      const ctrl = new AbortController();
      inflight.add(ctrl);

      try {
        const res = await fetch('/api/tour', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, question }),
          signal: ctrl.signal,
        });
        if (!res.ok || mine <= cancelled) return null;
        const data = await res.json();
        if (mine <= cancelled) return null;
        const stale = mine < applied;
        if (!stale) applied = mine;
        return { ...data, seq: mine, stale } as TourReading;
      } catch {
        return null;
      } finally {
        inflight.delete(ctrl);
      }
    },

    /** Drops every call still in flight — for a turn that's over, not for the next sentence. */
    cancel() {
      cancelled = applied = ++seq;
      inflight.forEach((c) => c.abort());
      inflight.clear();
    },
  };
}

export type TourClassifier = ReturnType<typeof createTourClassifier>;
