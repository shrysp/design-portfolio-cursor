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

/*
 * The rest of the palette, picked on the sound board (/dev/tour-sounds). One
 * family with the bloop: sines and lowpassed noise, rounded onsets, nothing
 * bright. Levelled on three steps, by peak after the limiter: the big one-off
 * moments (tube, dive, ticket) about -12 dB, confirmations about -14, and the
 * tick that can recur about -20, under the bloop's -10.
 */

/** The tube switching off: the picture snaps to a line (the snap), the line dies to a dot (the fall). */
export const TUBE_OFF: Recipe = {
  masterGain: 0.134,
  layers: [
    { kind: 'noise', filterType: 'lowpass', filterFrequency: 2400, attack: 0.002, decay: 0.07, peak: 0.25 },
    { kind: 'tone', waveform: 'sine', frequency: 190, glideTo: 55, glideTime: 0.55, attack: 0.005, decay: 0.6, peak: 0.7, filter: { type: 'lowpass', frequency: 800 } },
  ],
};

/** The tube coming on: a low thunk as it catches, then the hum of it warming. */
export const TUBE_ON: Recipe = {
  masterGain: 0.142,
  layers: [
    { kind: 'tone', waveform: 'sine', frequency: 72, attack: 0.006, decay: 0.35, peak: 0.9 },
    { kind: 'tone', waveform: 'triangle', frequency: 110, attack: 0.25, hold: 0.25, decay: 0.6, peak: 0.22, offset: 0.05, filter: { type: 'lowpass', frequency: 420 } },
  ],
};

/**
 * Both, sped up, for the quick ways out (TourExit, and closing the
 * takeover): the animations there are a third the length of the way in.
 */
export const QUICK_OFF = 0.45;
export const QUICK_ON = 0.6;

/** The code is right: a digital watch's two-note confirm, done before the dive starts. */
export const CODE_OK: Recipe = {
  masterGain: 0.058,
  layers: [
    { kind: 'tone', waveform: 'sine', frequency: 1320, attack: 0.003, decay: 0.07, peak: 0.6 },
    { kind: 'tone', waveform: 'sine', frequency: 1760, attack: 0.003, decay: 0.14, peak: 0.6, offset: 0.08 },
  ],
};

/** The code is wrong: low and grainy, the length of the glitch. Never a buzzer. */
export const CODE_WRONG: Recipe = {
  masterGain: 0.054,
  artifact: { kind: 'crush', levels: 6 },
  layers: [
    { kind: 'tone', waveform: 'square', frequency: 140, attack: 0.004, hold: 0.22, decay: 0.12, peak: 0.4, filter: { type: 'lowpass', frequency: 900 } },
  ],
};

/** An invitation's ticket feeding out of the printer, as long as it prints (PRINT_MS, InviteTicket). */
export const TICKET_FEED: Recipe = {
  masterGain: 0.131,
  artifact: { kind: 'ring', rate: 38, depth: 0.6 },
  layers: [
    { kind: 'noise', filterType: 'bandpass', filterFrequency: 3200, filterQ: 1.5, attack: 0.05, hold: 1.45, decay: 0.15, peak: 0.25 },
    { kind: 'tone', waveform: 'sine', frequency: 95, attack: 0.05, hold: 1.45, decay: 0.15, peak: 0.12 },
  ],
};

/** Its stub torn off. */
export const TICKET_TEAR: Recipe = {
  masterGain: 0.103,
  artifact: { kind: 'ring', rate: 70, depth: 0.9 },
  layers: [
    { kind: 'noise', filterType: 'bandpass', filterFrequency: 2500, filterQ: 1, attack: 0.01, hold: 0.1, decay: 0.12, peak: 0.6 },
  ],
};

/**
 * The dive through the photos: air building with the stream to its cruising
 * speed (SCREEN.dive), then thinning out under the landing rather than stopping.
 */
export const DIVE: Recipe = {
  masterGain: 0.118,
  layers: [
    { kind: 'noise', filterType: 'lowpass', filterFrequency: 1200, attack: 1.0, hold: 0.5, decay: 1.2, peak: 0.3 },
    { kind: 'tone', waveform: 'sine', frequency: 55, contour: [[0, 55], [1.1, 110], [2.6, 90]], attack: 1.0, hold: 0.5, decay: 1.1, peak: 0.25 },
  ],
};

/** The session is live: you can talk now. Once per start, not when a session is renewed underneath. */
export const SESSION_LIVE: Recipe = {
  masterGain: 0.058,
  shimmer: { delay: 0.12, feedback: 0.3, wet: 0.3, lowpass: 1800 },
  layers: [
    { kind: 'tone', waveform: 'sine', frequency: 660, attack: 0.006, decay: 0.18, peak: 0.6 },
    { kind: 'tone', waveform: 'sine', frequency: 990, attack: 0.006, decay: 0.3, peak: 0.6, offset: 0.09 },
  ],
};

/**
 * PIP is taking a while to answer. Neutral, not one of PIP's own vocal cues:
 * next to its real voice, a synthesised one sounds like a second character.
 */
export const THINKING: Recipe = {
  masterGain: 0.148,
  jitter: 60,
  layers: [
    { kind: 'tone', waveform: 'sine', frequency: 520, attack: 0.004, decay: 0.09, peak: 0.5, filter: { type: 'lowpass', frequency: 1200 } },
  ],
};
/** How long PIP may think before the tick: a quick answer gets none. */
export const THINKING_AFTER_MS = 700;

/**
 * An invitation's power button (PowerOn) going down: the click of the switch,
 * the knock of it bottoming out, and the latch catching a beat after. Dry and
 * short, about -14 dB, so the tube's thunk that answers it 250ms later is the
 * bigger sound of the two.
 */
export const POWER_PRESS: Recipe = {
  masterGain: 0.28,
  jitter: 40,
  layers: [
    { kind: 'noise', filterType: 'bandpass', filterFrequency: 1800, filterQ: 1, attack: 0.001, decay: 0.025, peak: 0.6 },
    { kind: 'tone', waveform: 'sine', frequency: 140, attack: 0.002, decay: 0.06, peak: 0.6 },
    { kind: 'noise', filterType: 'bandpass', filterFrequency: 3200, filterQ: 1.2, attack: 0.001, decay: 0.015, peak: 0.3, offset: 0.06 },
  ],
};
