/**
 * Seconds of session left before it hangs itself up.
 *
 * Anchored to when the session started as well as to the last thing said, so
 * a session that nobody has spoken in yet still gets its full budget.
 */
export function idleSecondsLeft(opts: {
  now: number;
  startedAt: number;
  lastVoiceAt: number;
  limit: number;
}): number {
  const since = Math.max(opts.startedAt, opts.lastVoiceAt);
  return Math.max(0, opts.limit - (opts.now - since) / 1000);
}
