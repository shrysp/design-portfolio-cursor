/**
 * The tour's microphone, kept by the page rather than by a session.
 *
 * A session used to open the microphone and close it again. Now one outlives
 * the other: the tour closes its session when the conversation goes quiet (a
 * connected session is billed by the minute), keeps listening locally for a
 * while, and opens a new session when the visitor speaks. What they said
 * while it was opening is held and played into the new connection — see
 * public/tour/wake-worklet.js, which does the holding.
 *
 * Nothing leaves the browser while the tour is asleep: `send` carries silence
 * until a session is connected.
 */

export type WakeMic = {
  /** The microphone as it is — for PIP's ears, which react in real time. */
  raw: MediaStream;
  /** What the voice model is sent: silence while asleep, then everything held. */
  send: MediaStream;
  /**
   * Awake. Whatever was held since a voice woke the tour is played out first;
   * `drop` discards it instead — a wake by key or click, where nothing was said.
   */
  pass: (drop?: boolean) => void;
  /** Asleep: send silence, and call back once when someone starts talking. */
  listen: (onVoice: () => void) => void;
  /** Lets go of the microphone. */
  close: () => void;
};

const WORKLET = '/tour/wake-worklet.js';

export async function createWakeMic(deviceId?: string): Promise<WakeMic> {
  const raw = await navigator.mediaDevices.getUserMedia({
    audio: deviceId ? { deviceId: { exact: deviceId } } : true,
  });
  const context = new AudioContext();
  try {
    await context.audioWorklet.addModule(WORKLET);
  } catch (err) {
    raw.getTracks().forEach((t) => t.stop());
    void context.close();
    throw err;
  }
  const node = new AudioWorkletNode(context, 'tour-wake', {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    channelCount: 1,
    channelCountMode: 'explicit',
    outputChannelCount: [1],
  });
  const destination = context.createMediaStreamDestination();
  context.createMediaStreamSource(raw).connect(node).connect(destination);
  // Created from a click or keypress, so this is allowed to start.
  await context.resume();

  let onVoice: (() => void) | null = null;
  node.port.onmessage = (e) => {
    if (e.data !== 'voice') return;
    const heard = onVoice;
    onVoice = null;
    heard?.();
  };

  return {
    raw,
    send: destination.stream,
    pass(drop = false) {
      onVoice = null;
      node.port.postMessage({ mode: 'pass', drop });
    },
    listen(callback) {
      onVoice = callback;
      node.port.postMessage({ mode: 'ring' });
    },
    close() {
      onVoice = null;
      raw.getTracks().forEach((t) => t.stop());
      node.disconnect();
      void context.close();
    },
  };
}
