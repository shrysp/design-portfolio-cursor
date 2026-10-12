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
 * sentence that lands after a newer sentence's reply is dropped, so the
 * display never steps backward to something PIP has already moved past.
 */

export type TourReading = {
  mood: string;
  moodP: number;
  /**
   * Every photo this sentence mentions, best first — empty is a real, common
   * answer (most sentences name nothing photographed), not a failure.
   */
  images: { id: string; p: number }[];
};

export function createTourClassifier() {
  let seq = 0;
  /** The newest sentence whose reply has been handed out; older ones arriving later are stale. */
  let applied = 0;
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
        if (!res.ok || mine < applied) return null;
        const data = await res.json();
        if (mine < applied) return null;
        applied = mine;
        return data as TourReading;
      } catch {
        return null;
      } finally {
        inflight.delete(ctrl);
      }
    },

    /** Drops every call still in flight — for a turn that's over, not for the next sentence. */
    cancel() {
      applied = ++seq;
      inflight.forEach((c) => c.abort());
      inflight.clear();
    },
  };
}

export type TourClassifier = ReturnType<typeof createTourClassifier>;
