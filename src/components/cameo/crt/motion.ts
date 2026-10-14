'use client';

/**
 * One speed for the whole way in — the entrance, its shaders, the CRT glass,
 * the dive and the landing on the tour page. Durations are divided by it in
 * script, and CSS reads it as `--motion` (unset, so 1).
 *
 * It was a developer's dial for watching all of it in slow motion; that dial
 * is gone, and it is real time. Kept as a function so the timings still read
 * through one place, should a dial come back.
 */

const speed = 1;

/** The current speed, 0..1. */
export const motion = () => speed;

/** A duration in real time, at the current speed. */
export const slowed = (ms: number) => ms / speed;
