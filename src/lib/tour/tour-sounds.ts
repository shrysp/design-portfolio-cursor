/**
 * The tour's own UI sounds, as recipes for the character's synth — no audio
 * files, and they go through the same limited output stage as PIP's voice, so
 * a burst of them can't clip on top of it.
 */

import type { Recipe } from '@shrysp/cameo/sound';

/**
 * A photo arriving: a soft bubble "bloop".
 *
 * Built the way a real bubble sounds — one pure sine whose pitch sweeps
 * upward fast as it forms — with everything hard taken out: no noise click
 * on top, a few milliseconds of attack so the onset is rounded rather than
 * struck, and a lowpass shaving off the upper edge of the sweep. Rising
 * because it's something appearing; a fall reads as landing or closing.
 *
 * Quiet on purpose: the entrance fires 38 of these 60ms apart, so each has
 * to be a bubble in a stream, not an event. `jitter` detunes every fire so
 * the run doesn't sound like one sample on repeat.
 */
export const PHOTO_POP: Recipe = {
  masterGain: 0.22,
  jitter: 150,
  layers: [
    {
      kind: 'tone',
      waveform: 'sine',
      frequency: 240,
      glideTo: 520,
      glideTime: 0.045,
      attack: 0.008,
      decay: 0.11,
      peak: 0.9,
      filter: { type: 'lowpass', frequency: 1100, q: 0.7 },
    },
  ],
};
