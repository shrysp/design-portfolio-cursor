/**
 * A GPT-Live session over WebRTC.
 *
 * Framework-free and character-free on purpose, the same way dom-sources keeps
 * DOM handling out of the director: this knows about microphones and SDP, and
 * nothing about poses. The page maps its events onto the character.
 */

export type LiveEvent = { type: string; [key: string]: unknown };

export type LiveSessionOptions = {
  /** Every server event, verbatim. The event vocabulary is not fully
   *  documented, so the page logs these to learn what actually arrives. */
  onEvent: (event: LiveEvent) => void;
  /** The model's audio track, once negotiated. */
  onRemoteStream?: (stream: MediaStream) => void;
  /** The microphone, so the page can show that audio is actually being captured. */
  onLocalStream?: (stream: MediaStream) => void;
  onStateChange?: (state: LiveState) => void;
  /**
   * Where the SDP offer is exchanged. The route behind it owns the prompts and
   * the models: the browser sends an offer and nothing else, so a visitor
   * cannot point the session at instructions of their own.
   */
  endpoint: string;
  /** What the server allows this session: how long it may run. */
  onSession?: (info: { maxSeconds?: number; remaining?: number; spotlight?: string[]; last?: boolean }) => void;
  /** The code has no tour time left. Called instead of the connection failing loudly. */
  onSpent?: () => void;
  /**
   * What was said earlier in this visit, if the visitor is coming back from a
   * pause. Sent with the offer so the new session can carry on instead of
   * starting over; the server decides how much of it to use.
   */
  history?: () => { who: 'you' | 'pip'; text: string }[];
  /** Morning, afternoon or evening where the visitor is, for the hello: the server has no clock of theirs. */
  dayPart?: () => string;
  /**
   * Spoken once the session is ready, before anyone has said anything.
   *
   * Someone landing on a page has no way of knowing they can talk to it. The
   * character opening its mouth first is the only affordance a voice interface
   * has — silence is indistinguishable from a picture.
   */
  greeting?: string;
  /**
   * Which microphone to capture. Worth exposing: the browser's default input
   * is whatever the OS says, which on a machine with Teams or Zoom installed
   * is often a virtual device that is enabled, unmuted, and completely silent.
   */
  deviceId?: string;
  /**
   * A microphone the caller already holds, instead of opening one here. The
   * session sends `send`, reports `raw` as the local stream, and stops
   * neither when it ends: whoever supplied them decides when to let go.
   */
  microphone?: () => Promise<{ send: MediaStream; raw: MediaStream }>;
};

export type LiveState = 'idle' | 'connecting' | 'live' | 'closed' | 'error';

export type LiveSession = {
  connect: () => Promise<void>;
  disconnect: () => void;
  /** Send a client event up the data channel. */
  send: (event: Record<string, unknown>) => void;
  /**
   * Ask the model to say something out loud. Isolates the output path from the
   * input path: if this speaks, audio out works and the problem is upstream in
   * turn detection or capture.
   */
  speak: (content: string) => void;
  /**
   * Hand the model a fact to use in later replies without saying it now —
   * what the visitor is pointing at, say. `session.thinking.append`: the docs
   * are explicit that it never takes a turn on its own.
   */
  think: (content: string) => void;
  /**
   * Sends another microphone from now on, without a new session — a visitor
   * who started by typing and now wants to talk. Borrowed like `microphone`'s.
   */
  replaceMicrophone: (next: { send: MediaStream; raw: MediaStream }) => Promise<void>;
  get state(): LiveState;
};

/**
 * At most one session may be live at a time.
 *
 * Two open sessions share the microphone, transcribe it twice and reply over
 * each other — and the symptom is a garbled transcript rather than an error,
 * so it is worth making structurally impossible rather than merely avoided by
 * whoever calls connect.
 */
let current: LiveSession | null = null;

export function createLiveSession(options: LiveSessionOptions): LiveSession {
  let pc: RTCPeerConnection | null = null;
  let channel: RTCDataChannel | null = null;
  let mic: MediaStream | null = null;
  /** False for a borrowed microphone (options.microphone), which is not ours to stop. */
  let ownsMic = true;
  let state: LiveState = 'idle';
  let greeted = false;
  /** The server's greeting wins: it arrives with the SDP answer, before session.started. */
  let greeting = options.greeting;
  let closing: number | null = null;

  const setState = (next: LiveState) => {
    state = next;
    options.onStateChange?.(next);
  };

  async function connect() {
    if (state === 'connecting' || state === 'live') return;
    if (current && current !== api) {
      options.onEvent({ type: 'client.session.replaced' });
      current.disconnect();
    }
    current = api;
    setState('connecting');

    try {
      /**
       * Held locally as well as on the closure, so every step after an await
       * can check it is still the current connection. Disconnecting — or a
       * StrictMode remount — tears down mid-handshake, and the old flow then
       * called setRemoteDescription on null.
       */
      const connection = new RTCPeerConnection();
      pc = connection;

      /**
       * "Connected but nothing happens" has several very different causes —
       * the data channel never opening, no remote track, the mic muted, ICE
       * failing — and they are indistinguishable without this. Each one is
       * reported as a client.* event so the panel shows exactly how far the
       * connection actually got.
       */
      connection.onconnectionstatechange = () =>
        options.onEvent({ type: `client.pc.${connection.connectionState}` });
      connection.oniceconnectionstatechange = () =>
        options.onEvent({ type: `client.ice.${connection.iceConnectionState}` });

      connection.ontrack = (e) => {
        options.onEvent({ type: 'client.track', kind: e.track.kind, id: e.track.id });
        options.onRemoteStream?.(e.streams[0]);
      };

      const borrowed = await options.microphone?.();
      const stream =
        borrowed?.send ??
        (await navigator.mediaDevices.getUserMedia({
          audio: options.deviceId ? { deviceId: { exact: options.deviceId } } : true,
        }));
      if (pc !== connection) {
        if (!borrowed) stream.getTracks().forEach((t) => t.stop());
        return;
      }
      ownsMic = !borrowed;
      mic = stream;
      options.onLocalStream?.(borrowed?.raw ?? mic);
      for (const track of mic.getAudioTracks()) {
        connection.addTrack(track, mic);
        options.onEvent({
          type: 'client.mic',
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
        });
      }

      // Must exist before the offer is generated, or it is not negotiated.
      channel = connection.createDataChannel('oai-events');
      channel.onopen = () => options.onEvent({ type: 'client.channel.open' });
      channel.onclose = () => options.onEvent({ type: 'client.channel.closed' });
      channel.onerror = (e) =>
        options.onEvent({ type: 'client.channel.error', message: String(e) });
      channel.onmessage = (e) => {
        let parsed: LiveEvent;
        try {
          parsed = JSON.parse(e.data);
        } catch {
          options.onEvent({ type: 'unparsed', raw: String(e.data) });
          return;
        }
        // Greet once the session is genuinely ready — sending before
        // session.started arrives is shouting into a socket nobody is reading.
        if (parsed.type === 'session.started' && greeting && !greeted) {
          greeted = true;
          queueMicrotask(() => api.speak(greeting!));
        }
        // The acknowledgement we were asked to wait for. It carries the final
        // usage, so tearing down before it arrives loses the only confirmation
        // of what the session actually cost.
        if (parsed.type === 'session.closed') {
          options.onEvent(parsed);
          finish();
          return;
        }
        options.onEvent(parsed);
      };

      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      await waitForIce(connection);
      if (pc !== connection) return;

      const res = await fetch(options.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdp: connection.localDescription?.sdp, history: options.history?.(), dayPart: options.dayPart?.() }),
      });

      const result = await res.json();
      if (!res.ok) {
        if (result.spent) options.onSpent?.();
        throw new Error(result.detail || result.error || `HTTP ${res.status}`);
      }
      // Torn down while the exchange was in flight: the answer is for a
      // connection that no longer exists.
      if (pc !== connection) return;
      if (typeof result.greeting === 'string') greeting = result.greeting;
      options.onSession?.({
        maxSeconds: result.maxSeconds,
        remaining: typeof result.remaining === 'number' ? result.remaining : undefined,
        spotlight: result.spotlight,
        last: result.last === true,
      });

      await connection.setRemoteDescription({ type: 'answer', sdp: result.transport.sdp });
      setState('live');
      options.onEvent({ type: 'client.connected', sessionId: result.session?.id });
    } catch (err) {
      options.onEvent({ type: 'client.error', message: String(err) });
      setState('error');
      teardown();
      throw err;
    }
  }

  /**
   * The offer is only complete once ICE has gathered. Resolves early if the
   * connection is already done, and gives up after a moment rather than hanging
   * — a trickle-less offer with most candidates still connects.
   */
  function waitForIce(connection: RTCPeerConnection) {
    if (connection.iceGatheringState === 'complete') return Promise.resolve();
    return new Promise<void>((resolve) => {
      const done = () => {
        connection.removeEventListener('icegatheringstatechange', check);
        clearTimeout(timer);
        resolve();
      };
      const check = () => {
        if (connection.iceGatheringState === 'complete') done();
      };
      const timer = setTimeout(done, 2000);
      connection.addEventListener('icegatheringstatechange', check);
    });
  }

  /**
   * Ends the session and only then drops the transport.
   *
   * Closing the peer connection does not end a GPT-Live session — the docs are
   * explicit that the transport dying looks like connection_lost and leaves
   * final usage unconfirmed. The close has to be requested, acknowledged, and
   * only then can the connection go. The timeout is a backstop: an
   * acknowledgement that never arrives must not leave a microphone open.
   */
  function finish() {
    if (closing !== null) {
      clearTimeout(closing);
      closing = null;
    }
    teardown();
    greeted = false;
    if (current === api) current = null;
    setState('closed');
  }

  function teardown() {
    channel?.close();
    if (ownsMic) mic?.getTracks().forEach((t) => t.stop());
    pc?.close();
    channel = null;
    mic = null;
    pc = null;
  }

  const api: LiveSession = {
    connect,
    disconnect() {
      if (closing !== null) return; // already saying goodbye
      if (channel?.readyState === 'open' && state === 'live') {
        api.send({ type: 'session.close' });
        // Stop capturing immediately — the session is over from the user's
        // point of view — but leave the channel open for the final event.
        if (ownsMic) mic?.getTracks().forEach((t) => t.stop());
        closing = window.setTimeout(() => {
          options.onEvent({ type: 'client.close.unacknowledged' });
          finish();
        }, 2000);
        return;
      }
      finish();
    },
    send(event) {
      if (channel?.readyState === 'open') channel.send(JSON.stringify(event));
      else options.onEvent({ type: 'client.send.dropped', message: 'channel not open' });
    },
    speak(content) {
      this.send({
        type: 'session.commentary.append',
        event_id: crypto.randomUUID(),
        delegation_id: null,
        content,
      });
    },
    think(content) {
      this.send({
        type: 'session.thinking.append',
        event_id: crypto.randomUUID(),
        delegation_id: null,
        content,
      });
    },
    async replaceMicrophone(next) {
      const track = next.send.getAudioTracks()[0];
      const sender = pc?.getSenders().find((s) => s.track?.kind === 'audio');
      if (!track || !sender) throw new Error('No microphone to replace.');
      await sender.replaceTrack(track);
      if (ownsMic) mic?.getTracks().forEach((t) => t.stop());
      ownsMic = false;
      mic = next.send;
      options.onLocalStream?.(next.raw);
      options.onEvent({ type: 'client.mic', label: track.label, enabled: track.enabled, muted: track.muted });
    },
    get state() {
      return state;
    },
  };

  return api;
}

/**
 * Maps server events onto what the character should do.
 *
 * Separated from the session so it stays a pure function and can be tested
 * without WebRTC — and so that when the real event names turn out to differ
 * from these guesses, there is exactly one place to correct.
 */
export type LiveIntent =
  | { kind: 'ready' }
  /** Carries the session's final, confirmed usage — the only billing truth. */
  | { kind: 'closed'; seconds?: number; reason?: string }
  | { kind: 'usage'; seconds: number }
  /** Transcript text arrived for a side — it is talking right now. */
  | { kind: 'user-active'; delta: string }
  | { kind: 'model-active'; delta: string }
  | { kind: 'user-speaking'; active: boolean }
  | { kind: 'model-speaking'; active: boolean }
  | { kind: 'thinking'; active: boolean }
  | { kind: 'error'; message: string }
  | null;

export function interpret(event: LiveEvent): LiveIntent {
  const t = event.type;

  /**
   * Responses delegation arrives wrapped: the docs are explicit that you
   * "dispatch on envelope.event.type" rather than treating every top-level
   * response.* value as an unwrapped event.
   *
   * The backend's text is a draft, not speech: the voice layer re-speaks it in
   * its own words, and that rendering arrives separately as output_transcript.
   * Counting both as the model talking interleaved two versions of every
   * answer into one transcript — and into the per-sentence classifier — so
   * the draft's text is dropped here and only its other signals pass through.
   */
  if (t === 'response.event' && typeof event.event === 'object' && event.event) {
    const inner = interpret(event.event as LiveEvent);
    return inner?.kind === 'model-active' ? null : inner;
  }

  if (t === 'session.started' || t === 'client.connected') return { kind: 'ready' };
  if (t === 'session.closed') {
    return {
      kind: 'closed',
      seconds: secondsIn(event),
      reason: String(event.reason ?? 'unknown'),
    };
  }
  // Usage also arrives periodically during a session, which is a live cost
  // readout rather than a post-mortem one.
  if (t === 'session.usage.updated') {
    const seconds = secondsIn(event);
    if (seconds != null) return { kind: 'usage', seconds };
  }
  if (t === 'error' || t === 'client.error')
    return { kind: 'error', message: String(event.message ?? JSON.stringify(event)) };

  const text = (event.delta ?? event.transcript ?? event.text ?? '') as string;

  /**
   * Transcript deltas double as the activity signal.
   *
   * GPT-Live's turn-detection event names are not documented anywhere public,
   * and guessing them is what made the first attempt inert. Deltas are
   * documented, and they carry the same information: transcript text arriving
   * for a side means that side is talking right now. The caller releases the
   * hold on a debounce, so no "stopped" event is required at all.
   */
  if (t === 'session.input_transcript.delta' || t.endsWith('input_transcript.delta'))
    return { kind: 'user-active', delta: text };
  if (t === 'session.output_transcript.delta' || t.endsWith('output_transcript.delta'))
    return { kind: 'model-active', delta: text };

  // Kept as a bonus path: if explicit turn events do exist, they are more
  // precise than the debounce and should win.
  if (t.endsWith('speech_started')) return { kind: 'user-speaking', active: true };
  if (t.endsWith('speech_stopped')) return { kind: 'user-speaking', active: false };

  /**
   * Delegation is the model saying, unprompted, that it has gone away to work.
   * Far better than inferring from words — and it fills the gap GPT-Live
   * creates by design, since it manages context silently rather than narrating
   * every step. Nothing else tells the user anything is happening.
   */
  if (t === 'session.delegation.created' || t === 'response.created')
    return { kind: 'thinking', active: true };
  if (t === 'session.delegation.completed' || t === 'session.delegation.failed')
    return { kind: 'thinking', active: false };
  if (t === 'response.completed' || t === 'response.done')
    return { kind: 'model-speaking', active: false };

  // Plain text output, when there is no audio to transcribe.
  if (t.endsWith('output_text.delta') && text) return { kind: 'model-active', delta: text };

  return null;
}

/** Input devices, for choosing a real microphone over a silent virtual one. */
export async function listMicrophones(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  const devices = await navigator.mediaDevices.enumerateDevices();
  // Labels are empty until microphone permission has been granted once.
  return devices.filter((d) => d.kind === 'audioinput');
}

/**
 * Billed seconds, wherever they happen to sit.
 *
 * The documented shape puts usage at the top level, but the events that
 * actually arrive carry a nested session object too. Checking both is cheaper
 * than being wrong about which, and usage silently reading as zero is exactly
 * the failure that goes unnoticed until the invoice.
 */
function secondsIn(event: LiveEvent): number | undefined {
  const top = event.usage as { seconds?: number } | undefined;
  const nested = (event.session as { usage?: { seconds?: number } } | undefined)?.usage;
  return top?.seconds ?? nested?.seconds;
}
