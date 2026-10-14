/**
 * The tour's microphone, on its way to the voice model.
 *
 * A connected session is billed by the minute, so the tour closes it when the
 * conversation goes quiet and opens a new one when the visitor speaks again.
 * Opening one takes a second or two, and the words that woke it would be gone
 * by then. This sits between the microphone and the connection and holds on
 * to them:
 *
 *   pass  — live. Audio goes straight through.
 *   ring  — asleep. Sends silence, remembers the last two seconds, and listens
 *           for a voice. Hearing one moves to `hold` and says so.
 *   hold  — waking. Still sends silence (nothing is connected yet) and keeps
 *           everything from two seconds before the voice onwards.
 *
 * Going back to `pass` with audio still held plays it out first, so the model
 * hears the question from its first word. That leaves the output running a
 * couple of seconds behind the room; it catches up by skipping the silences —
 * all but a short gap of each, so the words do not run together — and is back
 * to real time by the end of the sentence.
 *
 * A worklet file rather than a module import: it runs on the audio thread.
 */

/**
 * Long enough to reach back past the start of a question: a voice at arm's
 * length takes up to 1.6 s to be sure of, in a room with a fan or a TV on.
 */
const RING_SECONDS = 2;
/** Longest a wake may take before the oldest held audio starts to go. */
const HOLD_SECONDS = 12;
/** How much speech, net of gaps, counts as someone talking. */
const VOICE_MS = 220;
/** Ignore the first moment of sleep: the session it follows is still winding down. */
const ARM_MS = 600;
/** How far behind real time is close enough to stop skipping. */
const TARGET_MS = 50;
/** How much of each silence is kept while catching up. */
const KEEP_QUIET_MS = 180;

class TourWake extends AudioWorkletProcessor {
  constructor() {
    super();
    this.mode = 'pass';
    /** Blocks waiting to be sent, oldest first: { data, quiet }. */
    this.queue = [];
    /** A running estimate of the room with nobody talking. */
    this.floor = 0.004;
    this.speechMs = 0;
    this.armMs = 0;
    this.quietRunMs = 0;
    this.port.onmessage = (e) => {
      const next = e.data && e.data.mode;
      if (next === 'ring') {
        this.queue = [];
        this.speechMs = 0;
        this.armMs = ARM_MS;
        this.mode = 'ring';
      } else if (next === 'pass') {
        // `drop` is a wake by key or click: nothing was said, so nothing is owed.
        if (e.data.drop) this.queue = [];
        this.quietRunMs = 0;
        this.mode = 'pass';
      }
    };
  }

  process(inputs, outputs) {
    const input = inputs[0] && inputs[0][0];
    const out = outputs[0] && outputs[0][0];
    const blockMs = ((input ? input.length : 128) / sampleRate) * 1000;

    if (input) {
      let sum = 0;
      for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
      const rms = Math.sqrt(sum / input.length);
      // Falls to a quieter room quickly, rises to a louder one slowly — slowly
      // enough that a long sentence is not mistaken for the room.
      this.floor = rms < this.floor ? this.floor * 0.9 + rms * 0.1 : this.floor * 0.9999 + rms * 0.0001;
      const loud = rms > Math.max(0.015, this.floor * 3.5);
      const quiet = rms < Math.min(0.02, Math.max(0.006, this.floor * 1.8));
      this.queue.push({ data: input.slice(), quiet });

      if (this.mode === 'ring') {
        if (this.armMs > 0) this.armMs -= blockMs;
        else {
          this.speechMs = loud ? this.speechMs + blockMs : Math.max(0, this.speechMs - blockMs * 0.5);
          if (this.speechMs >= VOICE_MS) {
            this.mode = 'hold';
            this.port.postMessage('voice');
          }
        }
      }
      const keep = ((this.mode === 'ring' ? RING_SECONDS : HOLD_SECONDS) * 1000) / blockMs;
      if (this.mode !== 'pass') while (this.queue.length > keep) this.queue.shift();
    }

    // Asleep or waking: the output stays silent.
    if (this.mode !== 'pass' || !out) return true;

    const target = TARGET_MS / blockMs;
    while (this.queue.length > target && this.queue[0].quiet && this.quietRunMs >= KEEP_QUIET_MS) {
      this.queue.shift();
    }
    const head = this.queue.shift();
    if (head) {
      out.set(head.data.subarray(0, out.length));
      this.quietRunMs = head.quiet ? this.quietRunMs + blockMs : 0;
    }
    return true;
  }
}

registerProcessor('tour-wake', TourWake);
