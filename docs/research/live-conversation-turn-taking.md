# Turn-taking, interruptions and backchannels for PIP on gpt-live-1

Research note, 2026-10-23, branch `conversation-improvements`. Written to answer one question: how can PIP's spoken conversation feel more like people talking, with interruptions, "mm-hm"s, pauses and silence handled well?

How to read the labels:

- **[Live]** means the fact comes from OpenAI's GPT-Live docs or reference, so it applies to `gpt-live-1`.
- **[Realtime]** means the fact comes from gpt-realtime docs or SDK code. It is listed for contrast and **does not carry over** unless the Live docs say so.
- **[Unverified]** means I could not confirm it from a primary source.

All OpenAI docs were read on 2026-10-23 from the `.md` versions of the developers.openai.com pages. SDK code was read at openai-agents-js commit `be4f1f9`.

---

## 0. Summary

- **gpt-live-1 has no turn-detection settings.** The Live `SessionConfig` has no `turn_detection`, VAD threshold, silence or padding settings, and no `interrupt_response` or `create_response` flags. You stream audio continuously and "GPT-Live decides when to speak" ([Live migration](https://developers.openai.com/api/docs/guides/live-migration); [Live reference, session.start schema](https://developers.openai.com/api/reference/resources/live/primary-websocket#session.start)). The Live API also has no `response.cancel`, `conversation.item.truncate`, `output_audio_buffer.clear` or `input_audio_buffer.speech_started` event (none appear in the [Live event reference](https://developers.openai.com/api/reference/resources/live/primary-websocket)).
- **The main lever is the voice prompt.** OpenAI's Live prompting guide asks for three named sections: `Backchannel policy`, `Interruption policy` and `Delegation policy` ([Live prompting](https://developers.openai.com/api/docs/guides/live-prompting#recommended-prompt-structure)). PIP's voice prompt has none of them. It also has a rule ("Do not add, drop…") that works against yielding when interrupted.
- **The second lever is the page.** Today the client treats almost any transcript fragment from the visitor as the start of a new question. So a "Yeah." said over PIP's answer can drop the answer's pending photo readings and put away the card it handed over (§1.4).
- **New Live features worth using:**
  - `session.triggers` with Decisions on `session.input_transcript.delta`, which can classify what the visitor just said while they are still talking. OpenAI's own example drives a character's expression and gesture with it.
  - `delegation.acknowledgement_delay_ms`.
  - `client.data_channel.allowed_client_events`, which matters for security (§5, R10).

---

## 1. What the current implementation does

### 1.1 Session creation

- The route posts to `https://api.openai.com/v1/live/sessions` with `model: 'gpt-live-1'` (`src/app/api/tour/session/route.ts:33-34`, `:146-150`).
- The session body has three parts (`route.ts:117-142`):
  - `instructions`: the voice prompt, plus the visitor's name/note and earlier turns (`:122-124`).
  - `delegation: { type: 'responses', responses: { model, instructions } }` (`:125-139`).
  - Nothing else. There is no `audio`, `input`, `triggers`, `client` or `acknowledgement_delay_ms`.
- The comment at `route.ts:140-141` says: "GPT-Live rejects `session.audio.input`. Turn detection is native and not ours to configure." The Live reference agrees. Live's `audio` takes only `format` (WebSocket only) and `output.voice` ([reference](https://developers.openai.com/api/reference/resources/live/primary-websocket#session.start)).
- History from a paused visit goes in as text inside `instructions` (`route.ts:116`, `context.ts:394-404`). It does not use Live's `input` array of user and assistant messages.

### 1.2 Turn detection and "who is talking"

- Nothing is configured on the server, so turn-taking is entirely the model's job.
- On the client, `interpret()` treats transcript deltas as the activity signal:
  - `session.input_transcript.delta` becomes `user-active`.
  - `session.output_transcript.delta` becomes `model-active`.
  - See `src/lib/tour/live-session.ts:443-454`.
- A fallback maps any `*speech_started` / `*speech_stopped` event to `user-speaking` (`live-session.ts:456-459`). Those are Realtime event names, and Live never sends them, so the `user-speaking` branch in `TourStage.tsx:2361-2369` never fires.
- `session.delegation.completed` / `.failed` are also mapped (`live-session.ts:469-470`). The Live reference documents only `session.delegation.created` ([reference](https://developers.openai.com/api/reference/resources/live/primary-websocket#session.delegation.created)), so the "thinking" hold is actually released by transcript activity.
- Whether PIP is audible is measured from the remote audio track with an envelope follower:
  - Threshold `PIP_AUDIBLE_LEVEL = 0.04`, held for `PIP_QUIET_MS = 450` (`TourStage.tsx:902-904`, `:2560-2596`).
  - The envelope also refreshes `lastVoice`, which keeps the idle clock from running while PIP talks (`:2587`).
  - This follows the Live guidance to "drive the speaking indicator from your audio player", since Live has no end-of-speech event ([Live migration](https://developers.openai.com/api/docs/guides/live-migration)).
- PIP's "ears" react to the raw microphone locally through `char.listenTo(stream, { hold: 'auto', volume: 0.5 })` (`TourStage.tsx:2549`). This is independent of the model.

### 1.3 Interruption / barge-in

- **No client code handles interruptions.**
  - Nothing ducks or mutes PIP's audio when the visitor starts talking.
  - Nothing trims PIP's transcript to what was actually heard.
  - Nothing tells the model where it was cut off.
- The model stops by itself, if it decides to.
- PIP's caption is paced by an estimate of speaking rate (`appendLine`, `TourStage.tsx:1888-1913`). But the text of every `output_transcript.delta` is appended to `lines` immediately. `lines` becomes the history sent to the next session (`history: () => linesRef.current`, `:2533`) and is saved at the end of the visit.
- The code notes that PIP's "text runs ahead of the voice" (`TourStage.tsx:2586`). If that is true, words generated but cut off by an interruption are probably recorded as said, sent as history, and classified for photos and cards.
  - This is **[Unverified]**: I could not confirm whether Live's output transcript includes audio that was generated but never played. The Live docs say transcript timing "describe[s] context delivery, not speech or playback" and should be kept "separate from audio playback" ([Managing sessions](https://developers.openai.com/api/docs/guides/live-conversations)).

### 1.4 Overlap that is not an interruption (backchannels, laughter)

The `user-active` branch (`TourStage.tsx:2304-2318`) runs on every visitor transcript fragment:

1. It releases the thinking hold and appends the fragment as a `you` line. Because `appendLine` starts a new turn whenever the speaker changes (`:1890-1891`), an "mm-hm" over PIP splits PIP's caption in two.
2. If PIP's answer started more than `TRANSCRIPT_TRAIL_MS = 2000` ms ago, it treats the words as "the visitor speaking again" and clears `answerStartedAt` (`:2311-2313`).
3. If the fragment ends in `.`, `!` or `?`, it calls `finishQuestion()` (`:2316`). With `answerStartedAt` cleared, `finishQuestion` does all of this (`:2248-2275`):
   - makes "Yeah." the `lastQuestion`;
   - cancels PIP's in-flight sentence classifications (`tourModel.current.cancel()`);
   - stops the spotlight;
   - closes the handed-over card.

In short, a backchannel more than 2 s into an answer is handled as a new question. The model may keep talking, which is correct behaviour for a backchannel, but the stage has already moved on. PIP's next sentences are then read against "Yeah." as the question.

### 1.5 Silence, idle and proactive turns

- **Chips:** suggestion chips appear after `CHIPS_AFTER_MS = 4000` ms of quiet (`TourStage.tsx:848`, `:2976`).
- **Idle limit:** the session closes after `IDLE_LIMIT = 15` s of quiet, counted from PIP's audio stopping (`:389`, `src/lib/tour/idle.ts:7-15`, idle loop `TourStage.tsx:2945-3044`). Thinking holds the clock for up to `THINKING_HOLD_MS = 30_000` (`:394`).
- **Doze:** after closing, PIP dozes for `DOZE_MS = 2 min` with a local voice detector that can wake a new session (`:403`, `doze` at `:2762-2783`, `public/tour/wake-worklet.js`). Wakes nobody followed up are capped at `MAX_EMPTY_WAKES = 2` (`:408`).
- **Speaking first:** PIP speaks first only in four cases:
  - the greeting (`live-session.ts:203-208`);
  - an offer about a photo the visitor clicked and stayed silent on for `POINT_ASK_MS = 1500` (`TourStage.tsx:445`, `:2057-2091`);
  - the "about a minute left" note (`:3008-3015`);
  - the goodbye (`:3016-3022`).
- PIP never re-opens a conversation that has simply gone quiet. The visual chips are the only nudge.

### 1.6 How non-spoken input reaches the model

| Path | Client event | Code |
|---|---|---|
| Greeting | `session.commentary.append` (`speak`) after `session.started` | `live-session.ts:203-208`, `:329-336` |
| Typed question | `response.item.create` (user `input_text`) + `response.create` | `live-session.ts:345-355`, `TourStage.tsx:1737-1760` |
| Typed answer the voice dropped | `session.commentary.append` with "say this as written" after `TYPED_SAY_MS` | `TourStage.tsx:2979-2992` |
| Chip (suggestion) | Answer fetched from `/api/tour/ask`, then `session.commentary.append` | `TourStage.tsx:1666-1730` |
| Pointing at a photo | `session.thinking.append` (silent fact) | `TourStage.tsx:2008-2015` |

All of these match documented Live semantics ([Delegation](https://developers.openai.com/api/docs/guides/live-delegation); [reference](https://developers.openai.com/api/reference/resources/live/primary-websocket#session.commentary.append)). One side effect is easy to miss. The reference says that "any commentary or thinking appended to the session cancels all pending acknowledgements, including those for other delegations" ([reference, `acknowledgement_delay_ms`](https://developers.openai.com/api/reference/resources/live/primary-websocket#session.start)). A photo click (`think`) while a delegation is pending can therefore remove PIP's spoken acknowledgement.

### 1.7 The prompts (`src/lib/tour/server/context.ts`)

- The voice prompt is `PERSONALITY_PROMPT + VOICE_OPENER + VOICE_HANDOVER + VOICE_GUARDRAILS` (`:279`).
- There is **no backchannel policy and no interruption policy**, and the delegation section does not use the `<|SpawnThinking|>` wording the Live guide prescribes for `gpt-live-1` ([Live prompting](https://developers.openai.com/api/docs/guides/live-prompting#recommended-prompt-structure)).
- `VOICE_HANDOVER` says: "Say what the backend returns as it is written, sentence for sentence. Do not add, drop, merge or soften anything" (`:92-94`). Nothing says what to do with the rest of an answer after the visitor cuts in, so "do not drop" pushes toward finishing the answer.
- `VOICE_HANDOVER` already allows the voice to answer "asks you to repeat or stop" itself (`:97-98`).
- `VOICE_OPENER` (`:68-73`) has three quoted example lines ("Oh, that's a good one," …). That breaks the project rule against copying canned examples into prompts. The Live guide also advises: "describe the conversational behavior you want, and let GPT-Live choose the wording" ([Live prompting](https://developers.openai.com/api/docs/guides/live-prompting)).
- `BACKEND_SHAPE` caps answers at four sentences or about 70 words (`:129-140`). A 20-30 s monologue gives many chances for overlap.

### 1.8 Audio capture and echo

- The microphone is opened with `audio: true` or `{ deviceId }` only (`src/lib/tour/wake-mic.ts:68-70`, `live-session.ts:167-169`). Echo cancellation, noise suppression and gain control are left to browser defaults.
- MDN documents `echoCancellation` values `true`, `false`, `"all"` and `"remote-only"`. `"remote-only"` removes only audio that comes from an `RTCPeerConnection` ([MDN echoCancellation](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/echoCancellation)).
- PIP also plays local Web Audio cues during a live session:
  - `SESSION_LIVE` (`TourStage.tsx:3292`);
  - the `THINKING` tick after 700 ms of thinking (`:3297-3301`, `tour-sounds.ts:144`);
  - point reactions with `volume: 0.4` (`:434`).
- Those cues do not come from the peer connection. Whether the browser cancels them from the mic is **[Unverified]**.

---

## 2. What the API and model support

### 2.1 gpt-live-1 compared with gpt-realtime

| Concern | gpt-realtime **[Realtime]** | gpt-live-1 **[Live]** |
|---|---|---|
| Who decides the turn | VAD (`server_vad` / `semantic_vad`) or the client, via `input_audio_buffer.commit` + `response.create` ([VAD guide](https://developers.openai.com/api/docs/guides/realtime-vad)) | "Stream audio continuously. GPT-Live decides when to speak; remove manual audio commits and voice-turn triggers." ([Live migration](https://developers.openai.com/api/docs/guides/live-migration)) |
| Full duplex | Turn-based | "can listen and speak at the same time" ([gpt-live-1 model page](https://developers.openai.com/api/docs/models/gpt-live-1); [Getting started](https://developers.openai.com/api/docs/guides/live)) |
| Turn-detection knobs | `threshold` (default 0.5), `prefix_padding_ms` (300), `silence_duration_ms` (500), `idle_timeout_ms`, `eagerness` low/medium/high (max timeouts 8 s / 4 s / 2 s), `create_response`, `interrupt_response` ([Realtime client events reference](https://developers.openai.com/api/reference/resources/realtime/client-events)) | None. `SessionConfig` has `model, audio{format, output.voice}, client, delegation, input, instructions, store, triggers` ([Live reference](https://developers.openai.com/api/reference/resources/live/primary-websocket#session.start)) |
| Speech start/stop events | `input_audio_buffer.speech_started/stopped` | None. Only `session.input_transcript.delta` with `start_ms`/`end_ms`; "these events do not define complete turns" ([reference](https://developers.openai.com/api/reference/resources/live/primary-websocket#session.input_transcript.delta)) |
| On barge-in | VAD start cancels the response (`interrupt_response: true`); over WebRTC "the server will automatically truncate unplayed audio" ([Realtime conversations, "Interruption and Truncation"](https://developers.openai.com/api/docs/guides/realtime-conversations)) | The model yields, guided by the prompt's interruption policy ([Live prompting](https://developers.openai.com/api/docs/guides/live-prompting#interruptions)). Truncation of unheard output is undocumented. |
| Client-forced stop | `response.cancel`, `output_audio_buffer.clear` (WebRTC), `conversation.item.truncate { audio_end_ms }` (WebSocket) | None of these exist. For an app-driven stop, "temporarily mute or drop the output, discard locally queued audio, and send the corrective instruction" ([Server-side controls](https://developers.openai.com/api/docs/guides/voice-server-controls#control-playback-when-needed)). `session.instructions.append` "can interrupt speech in progress" ([Managing sessions](https://developers.openai.com/api/docs/guides/live-conversations)). |
| End of a spoken reply | `response.output_audio.done`, `response.done` | "No equivalent; track playback in your client" ([Live migration](https://developers.openai.com/api/docs/guides/live-migration)) |
| Idle re-prompt | `idle_timeout_ms` fires `input_audio_buffer.timeout_triggered` and the model "will effectively prompt the user to continue" (server_vad only) ([Realtime client events reference](https://developers.openai.com/api/reference/resources/realtime/client-events)) | No server idle behaviour. Use "an application-controlled inactivity timeout based on audio activity, assistant playback, and application interactions" ([Managing sessions, "Close idle sessions and resume"](https://developers.openai.com/api/docs/guides/live-conversations#close-idle-sessions-and-resume)) |
| Input noise reduction | `audio.input.noise_reduction` (near/far field) "can improve VAD and turn detection accuracy (reducing false positives)" ([Realtime client events reference](https://developers.openai.com/api/reference/resources/realtime/client-events)) | No equivalent field in the Live reference |

**How the Agents SDK handles interruption (Realtime only):**

- On WebSocket, `input_audio_buffer.speech_started` calls `interrupt()`. That sends `conversation.item.truncate` with `audio_end_ms = min(elapsed playback, audio length)` and skips truncation when the audio is estimated to have fully played ([`openaiRealtimeWebsocket.ts:484-488`, `:739-766`](https://github.com/openai/openai-agents-js/blob/be4f1f9aa4ad4f03cc5db5fdd57d0d0136923570/packages/agents-realtime/src/openaiRealtimeWebsocket.ts)).
- On WebRTC, `interrupt()` sends `response.cancel` and `output_audio_buffer.clear` ([`openaiRealtimeWebRtc.ts:803-817`](https://github.com/openai/openai-agents-js/blob/be4f1f9aa4ad4f03cc5db5fdd57d0d0136923570/packages/agents-realtime/src/openaiRealtimeWebRtc.ts)).
- The SDK's own GPT-Live example ([`examples/live/agent.ts:54-84`](https://github.com/openai/openai-agents-js/blob/be4f1f9aa4ad4f03cc5db5fdd57d0d0136923570/examples/live/agent.ts)) has no interruption code at all.

**About the announcement and engineering posts.** OpenAI's announcement and its engineering post on GPT-Live ([announcement](https://openai.com/index/introducing-gpt-live-1-in-the-api/), [engineering post](https://openai.com/index/continuous-voice-interaction-with-gpt-live/)) returned HTTP 403 or a JavaScript wall to my fetches. I only saw search-engine snippets of them. Those snippets claim GPT-Live "natively supports turn detection", removes "the turn detector from the audio path", and that one customer saw interruptions drop by almost 80%. **[Unverified]**: none of these claims is backed by the reference, which exposes no turn-detection controls.

### 2.2 Live session fields that matter for turn-taking

From the [Live reference](https://developers.openai.com/api/reference/resources/live/primary-websocket#session.start) and [Managing sessions](https://developers.openai.com/api/docs/guides/live-conversations):

- **`instructions`**:
  - Up to 16,384 tokens and immutable after startup.
  - Described as "Frontend instructions for voice, conversation, interruptions, and when to delegate."
- **`input`**:
  - Text history of developer, user and assistant messages with one text part each.
  - At most 128 messages and 8,192 tokens by default.
  - The recommended place for greeting instructions: "include greeting instructions in a `developer` message in `session.input`… After `session.started`, send the same instructions once through `session.commentary.append`" ([Managing sessions, "Greet before the caller speaks"](https://developers.openai.com/api/docs/guides/live-conversations#greet-before-the-caller-speaks)).
- **`delegation.acknowledgement_delay_ms`**:
  - "Milliseconds to wait before requesting an automatic spoken acknowledgement for a delegation. The model may still speak before this delay."
  - Defaults to 0 (request immediately) for Responses delegation.
  - Any appended commentary or thinking cancels pending acknowledgements.
  - Can be changed with `session.update`.
- **`triggers`**:
  - Up to one Decisions trigger per transcript event type (`session.input_transcript.delta` or `session.output_transcript.delta`).
  - Each trigger asks Predicate, Choice or Score questions about the transcript as it arrives.
  - Results arrive as `decision.event`.
  - "Triggers run independently of delegation", so they work with PIP's Responses delegation.
  - Changeable with `session.update`.
- **`client.data_channel.allowed_client_events` / `allowed_server_events`**:
  - Startup-only allowlists for "an untrusted frontend attached to a unified WebRTC session".
  - "Omission preserves the existing allow-all behavior."
- **`session.update`** may change only `delegation` settings and `triggers`. That includes `delegation.responses.instructions`, `model`, `reasoning`, `tools` and so on ([reference, session.update](https://developers.openai.com/api/reference/resources/live/primary-websocket#session.update)). Model, voice, frontend instructions and `input` are immutable.

### 2.3 Live events relevant to conversation flow

- **Server events:**
  - `session.input_transcript.delta` and `session.output_transcript.delta`, both with `start_ms`/`end_ms` on the session timeline.
  - `session.delegation.created` (`offset_ms`, `delegation.id`, `response_id`).
  - `response.event`, wrapping Responses events.
  - `decision.event`.
  - `session.commentary.appended`, `session.thinking.appended`, `session.instructions.appended`.
  - `session.input_audio.muted` / `unmuted`.
  - `session.usage.updated`, `session.closed`, `error`.
- **Client events:**
  - `session.instructions.append`, `session.thinking.append`, `session.commentary.append`, each limited to 500 tokens with `delegation_id: null` for Responses delegation.
  - `response.item.create`, `response.create`.
  - `session.input_audio.mute` / `unmute`.
  - `session.update`, `session.close`.
  - `session.output_audio.fixture.play`: sideband or primary WebSocket only. It plays a ≤30 s PCM clip, "model speech is interrupted and input is muted", and input during it "is dropped and not replayed".
  - All from the [Live reference](https://developers.openai.com/api/reference/resources/live/primary-websocket).
- Semantics that matter here:
  - "Live speech and delegated work continue independently. A completed backend response does not itself mean the user heard the answer."
  - "Interrupting the spoken conversation leaves backend work running."
  - The above are from [Delegation](https://developers.openai.com/api/docs/guides/live-delegation).
  - "GPT-Live is full duplex… Update their captions independently so both speakers' text can keep growing during overlapping speech." ([Managing sessions](https://developers.openai.com/api/docs/guides/live-conversations))
  - "Gaps between transcript events alone do not establish silence." ([Managing sessions](https://developers.openai.com/api/docs/guides/live-conversations#close-idle-sessions-and-resume))
  - "A corrective instruction cannot retract audio the caller has already heard." ([Live migration](https://developers.openai.com/api/docs/guides/live-migration))
  - Whether commentary waits for a pause or cuts in is **not documented**. Only `instructions.append` is documented as able to interrupt ([Delegation](https://developers.openai.com/api/docs/guides/live-delegation)).

### 2.4 Prompt-level controls OpenAI documents for Live

From [Prompting GPT-Live](https://developers.openai.com/api/docs/guides/live-prompting):

- **Required headings:** keep `Backchannel policy`, `Interruption policy` and `Delegation policy`.
  - The template's backchannel line: "Use moderate backchannels. Acknowledge naturally without competing with the main response."
  - "'Moderate' is a prompting instruction, not a numerical frequency setting."
- **Overlap rule:** "If you want backchannels, allow brief listening sounds during interruptions. A rule that forbids all overlapping speech can suppress them."
- **Interruptions:**
  - "When the user interrupts, the assistant should stop its answer and listen. A brief listening sound is different from taking over the user's turn."
  - "'Stop talking' asks the assistant to yield; 'Cancel my booking' asks the backend to take an action."
- **Delegation wording:** for `gpt-live-1`, use "Generate <|SpawnThinking|>" rather than "delegate to the backend".
  - Keep the labels `Backend tools`, `Generate <|SpawnThinking|> when`, `Do not generate <|SpawnThinking|> when`.
  - "Do not guess the result while waiting."
  - "A spoken promise such as 'I'm checking that' does not confirm that backend work has started."
- **Optional controls**, to add only when testing shows a need:
  - Silence and noise: "Keep listening while the user pauses to think. Do not treat a cough, music, or nearby conversation as a new request."
  - "Selected requests only."
  - Response length.
  - "Reusing earlier results."
- **Migration guidance:** move "how it acknowledges the user, pauses to listen, and responds to interruptions" into the Live prompt ([Live migration](https://developers.openai.com/api/docs/guides/live-migration)).

### 2.5 Measuring it

OpenAI's GPT-Live evaluation cookbook defines these metrics ([GPT-Live evaluation guide](https://developers.openai.com/cookbook/examples/audio/voice_agent_evaluation)):

- **Response latency:** "end of audible caller speech to the first qualifying assistant audio… including a spoken preamble".
- **Interruption rate:** the assistant cutting in on the caller.
- **Speaking duration.**
- **Silence during delegation.**
- **Conversation turns**, which "excludes backchannels".

Its multi-turn RUN harness tests that the assistant can "yield promptly" when "caller interrupts an unavailable-slot explanation". Academic benchmarks for the same behaviours:

- Full-Duplex-Bench covers pause handling, backchanneling, smooth turn-taking and interruption ([Lin et al., arXiv:2503.04721](https://arxiv.org/abs/2503.04721)).
- Its v1.5 separates four overlap scenarios: "user interruption, user backchannel, talking to others, and background speech". It finds systems split into "a responsive approach… and a floor-holding approach that preserves conversational flow by filtering overlapping events" ([arXiv:2507.23159](https://arxiv.org/abs/2507.23159)).

---

## 3. What the conversation research says

Only what the recommendations rely on.

- **Turns, and where they can change.**
  - Conversation is organised so that "overwhelmingly one party talks at a time". Speaker change happens at transition-relevance places at the end of turn-constructional units.
  - Overlap is common but brief, and the system has its own repair for it.
  - Source: Sacks, Schegloff & Jefferson 1974, *Language* 50(4) ([doi:10.2307/412243](https://doi.org/10.2307/412243)).
- **Timing.**
  - Across 10 languages there is "a general avoidance of overlapping talk and a minimization of silence between conversational turns". Language averages fall within 250 ms of the cross-language mean (Stivers et al. 2009, *PNAS* — [doi:10.1073/pnas.0903616106](https://doi.org/10.1073/pnas.0903616106)).
  - Gaps are "of the order of 200 ms" while production latencies are "over 600 ms". So listeners must project the end of a turn and plan the response while the other person is still talking (Levinson & Torreira 2015, *Frontiers in Psychology* — [doi:10.3389/fpsyg.2015.00731](https://doi.org/10.3389/fpsyg.2015.00731)).
  - Corpus measurements show plenty of real gaps and overlaps, which challenges claims of precision timing (Heldner & Edlund 2010, *J. Phonetics* — [doi:10.1016/j.wocn.2010.08.002](https://doi.org/10.1016/j.wocn.2010.08.002)).
  - Implication: a ~1-2 s pause after the visitor stops reads as slow. PIP's quick acknowledgement beat (`VOICE_OPENER`) is the right instinct.
- **Not all overlap competes for the turn.**
  - Schegloff's "overlap resolution device" explains how speakers handle simultaneous talk and when it is a problem (Schegloff 2000, *Language in Society* — [doi:10.1017/S0047404500001019](https://doi.org/10.1017/S0047404500001019)).
  - Overlaps that do not compete include continuers, terminal overlap near a turn's end, and choral talk such as shared laughter. These are part of the paper's account. **[Not re-read for this note beyond the abstract; cited from the paper's well-known taxonomy.]**
- **Continuers compared with assessments.** "Mm-hm" passes the floor back and shows the listener expects more. An assessment ("wow") reacts to content (Goodwin 1986, *Human Studies* — [doi:10.1007/BF00148127](https://doi.org/10.1007/BF00148127)). Gardner's book-length study of listener tokens is [*When Listeners Talk*, 2001](https://doi.org/10.1075/pbns.92).
- **"Yeah" compared with "mm-hm".** Jefferson treats "mm hm" as passive recipiency and "yeah" as more often showing readiness to take the floor (Jefferson 1984, *Papers in Linguistics* — [doi:10.1080/08351818409389201](https://doi.org/10.1080/08351818409389201)). **[Not re-read for this note; cited from its known finding.]** For PIP, a bare "yeah" mid-answer is weaker evidence of a takeover than a "yeah, but…".
- **Listener feedback improves the story.** Listeners act as "co-narrators", and narrators told stories worse when the listener was distracted (Bavelas, Coates & Johnson 2000, *JPSP* — [doi:10.1037/0022-3514.79.6.941](https://doi.org/10.1037/0022-3514.79.6.941)). This supports PIP visibly *listening*, through nods and expressions, while the visitor talks.
- **Where backchannels go.**
  - In English, a region of low pitch lasting at least 110 ms, after at least 700 ms of speech, predicts a listener backchannel (Ward & Tsukahara 2000, *J. Pragmatics* — [doi:10.1016/S0378-2166(99)00109-5](https://doi.org/10.1016/S0378-2166(99)00109-5); [author's abstract page](https://www.cs.utep.edu/nigel/abstracts/jprag00.html); parameters as reproduced in later work, **[parameters not re-read in the original]**).
  - Seven automatically computable turn-yielding cues were found, and "the greater the number of turn-yielding cues that are present, the greater the likelihood" of a turn-taking attempt. Backchannel-inviting phrases were analysed separately from smooth switches and holds (Gravano & Hirschberg 2011, *CSL* — [doi:10.1016/j.csl.2010.10.003](https://doi.org/10.1016/j.csl.2010.10.003)).
- **Telling a competitive overlap from a non-competitive one.**
  - Turn-competitive incomings are marked prosodically, typically raised pitch and loudness (French & Local 1983, *J. Pragmatics* — [doi:10.1016/0378-2166(83)90147-9](https://doi.org/10.1016/0378-2166(83)90147-9)). **[Not re-read for this note.]**
  - Competitive and non-competitive overlaps "can be initiated… at many different points in the current speaker's turn". So onset position alone does not tell them apart (Kurtić, Brown & Wells 2013, *Speech Communication* — [doi:10.1016/j.specom.2012.10.002](https://doi.org/10.1016/j.specom.2012.10.002), per the Semantic Scholar summary).
- **Hesitations.**
  - Speakers use "uh" to announce a minor delay and "um" a major one (Clark & Fox Tree 2002, *Cognition* — [doi:10.1016/S0010-0277(02)00017-3](https://doi.org/10.1016/S0010-0277(02)00017-3)). A visitor's trailing "um…" means they are holding the floor, not giving it up.
  - The same paper also supports PIP using a short filler *at the start* of a delay. That is what the acknowledgement beat does.
- **Repair.**
  - Speakers prefer to fix their own trouble (Schegloff, Jefferson & Sacks 1977, *Language* — [doi:10.2307/413107](https://doi.org/10.2307/413107)).
  - Other-initiated repair ("what?", "go back", "who?") targets a specific trouble source in the prior turn (Schegloff 1997, *Discourse Processes* — [doi:10.1080/01638539709545001](https://doi.org/10.1080/01638539709545001)).
  - For PIP, "wait, go back" is a request to redo the *last heard part*, not the whole answer.
- **Laughter.** Shared laughter often marks a topic coming to a close (Holt 2010, *J. Pragmatics* — [doi:10.1016/j.pragma.2010.01.011](https://doi.org/10.1016/j.pragma.2010.01.011)). So a laugh near the end of a PIP anecdote is a good moment to stop rather than add another sentence.
- **Machine turn-taking in general.** For a review of computational turn-taking cues, backchannel prediction and barge-in handling, see Skantze 2021, *CSL* ([doi:10.1016/j.csl.2020.101178](https://doi.org/10.1016/j.csl.2020.101178)). For continuous prediction of upcoming speech activity rather than silence thresholds, see Ekstedt & Skantze 2022, Voice Activity Projection, Interspeech ([doi:10.21437/Interspeech.2022-10955](https://doi.org/10.21437/Interspeech.2022-10955)). For a classic finite-state turn-taking model, see Raux & Eskenazi 2009 ([ACL N09-1071](https://aclanthology.org/N09-1071/)).

---

## 4. Cue → meaning → what PIP should do

"Owner" says what would produce the behaviour:

- **Model**: GPT-Live's own turn-taking, guided by the voice prompt.
- **Client**: TourStage and live-session logic.
- **Body**: the PIP character's poses and reactions.

| Cue (while…) | Likely meaning | Desired PIP behaviour | Owner |
|---|---|---|---|
| "mm-hm", "uh-huh", "right" while PIP talks | Continuer: go on (Goodwin 1986; Jefferson 1984) | Keep talking without restarting or acknowledging. Captions keep PIP's line intact. Photos, card and classifier untouched. Body: small nod. | Model (prompt: backchannel/interruption policy). Client: don't treat as a question (§1.4). |
| "wow", "oh nice", "no way" | Assessment: reacting to content (Goodwin 1986) | Keep going. A tiny beat of acknowledgement is fine at the next sentence boundary. Body: a matching expression. | Model, Body |
| Laughter over PIP | Appreciation, often a closing signal (Holt 2010; Schegloff 2000) | Let the laugh land: a short pause, and a smile in the body. Near the end of an anecdote, wrap up instead of adding more. | Model (prompt), Body |
| "yeah, but…", "wait", "hang on", "stop" | Competitive takeover (French & Local 1983) | Stop within a syllable or two and listen. Don't finish the sentence. Don't resume unprompted. | Model (interruption policy) |
| A new question over PIP | Full takeover; the old answer is over | Yield, answer the new question, drop the rest of the old answer. The client trims PIP's transcript to what was heard and cancels classifications for unsaid sentences. | Model + Client |
| "No, I meant X" / "not that one" | Correction of PIP's understanding (other-initiated repair) | Yield, briefly accept the correction without a long apology, and hand the corrected question to the backend. | Model (Delegation policy: "A correction changes the work already requested" is in the Live template) |
| "Wait, go back" / "what was that?" / "who?" | Repair aimed at the last heard bit (Schegloff 1997) | Repeat or clarify only the last point heard, briefly, then offer to carry on. Repeating needs no backend call, but anything *new* about him still goes to the backend. | Model (prompt), Client (accurate heard transcript for history) |
| Visitor trails off with "um…", "so…", mid-sentence | Holding the floor while planning (Clark & Fox Tree 2002) | Wait. No completion, no new topic. Body: attentive "listening" pose, no thinking tick. | Model (silence control); Client: the thinking tick should not fire during visitor hesitation |
| Visitor pauses about 1-3 s after a complete question | Turn yielded | Answer promptly with a short acknowledgement beat, then the delegated answer. | Model; config: `acknowledgement_delay_ms` |
| Silence after PIP asks a question | Visitor thinking | Wait. At around 4 s show chips (already done). Don't repeat the question quickly. | Client (current) |
| Silence after PIP finishes an answer (no question asked) | Lapse: nobody owns the next turn (SSJ 1974) | After a longer lull, one light, open invitation that names no particular story (project rule). Not on every lull. Never while a card is open or the visitor is typing. | Client trigger + Model wording (commentary) |
| Long silence while a card or photo is open | Reading or looking | Stay quiet. Don't count it as idle as quickly. | Client (idle clock) |
| Visitor talks to someone else in the room | Not addressed to PIP ("talking to others", Full-Duplex-Bench v1.5) | Keep listening and don't answer. If PIP was mid-answer, pause, then carry on or let it go. | Model (optional "Selected requests only"/noise controls) |
| Cough, TV, music, keyboard | Noise | Ignore it and don't stop talking. | Model (silence/noise control); Client (mic constraints) |
| Echo of PIP's own voice or chimes | False barge-in | Ignore it. Prevent with echo cancellation and quiet cues. | Client (mic constraints, cue levels) |
| Visitor types while PIP talks | New question by text | Let PIP finish the current sentence, then take it up. Today it is sent immediately via `response.item.create`. | Client |
| Visitor clicks a photo mid-answer | Pointing: "about this" | PIP looks (already done). Hold the spoken offer until PIP's turn ends. Don't cancel the pending acknowledgement (see §1.6). | Client |

---

## 5. Recommendations, ranked by impact vs effort

Each item gives the file, the config or event, and whether it needs a **prompt** change or **client** logic. All prompt wording below *describes behaviour* and gives no example lines, following the project rule and the Live guide. None of it adds work topics. Questions about his work still go to cards via the backend's existing rules.

### R1. Add the three Live policy sections to the voice prompt (high impact, low effort): **prompt**

`src/lib/tour/server/context.ts:68-112`, `:279`.

- Add `Backchannel policy:` in OpenAI's form ([Live prompting](https://developers.openai.com/api/docs/guides/live-prompting#backchannels)):
  - Moderate, brief listening sounds while the visitor talks.
  - Never compete with what they're saying.
  - Don't forbid all overlap, which suppresses backchannels.
- Add `Interruption policy:`. Its content should come from §4:
  - A brief listening sound or laugh from the visitor is not an interruption, so keep going.
  - When they start a real turn, stop at once and listen.
  - Once they have taken over, the rest of the previous answer is dropped, not resumed, unless they ask to continue.
  - A request to go back means a short recap of the last point heard, not the whole answer.
- Rewrite `VOICE_HANDOVER` (`:85-98`) into the template's `Delegation policy:` labels with `Generate <|SpawnThinking|> when` / `Do not generate <|SpawnThinking|> when`. Keep its existing rules. Add "a correction changes the question already handed over" from the template.
- Amend "Do not add, drop…" (`:92-94`). It should be about *fidelity of the words PIP says*, not about saying everything after an interruption.
- Remove the three quoted openers in `VOICE_OPENER` (`:68-70`). Describe the beat instead: short, warm, varied, never a stalling phrase. The `BACKEND_OPENER` quotes (`:114-116`) are the same pattern.
- Then add the guide's optional "Silence and background noise" control (pauses to think; coughs, music, other voices). PIP's case justifies it: a laptop in a room, with TV and chimes.
- **Why first:** these are the only knobs OpenAI documents for barge-in and backchannels on Live (§2.1). Today none of them are set.

### R2. Stop backchannels from resetting the stage (high impact, low-medium effort): **client**

`src/app/projects/cameo/tour/TourStage.tsx:2304-2318` (`user-active`), `:2248-2275` (`finishQuestion`), `:1888-1913` (`appendLine`).

- **Let the model's yield decide.** Treat visitor speech that arrives while `pipAudible` is true as *provisional*. Only call `finishQuestion()` once PIP's audio has actually stopped while or shortly after the visitor spoke. If PIP keeps talking through it, the model judged it a backchannel, and the client should agree.
  - This uses GPT-Live's own full-duplex judgement as the classifier instead of a second guesser.
  - The audible signal already exists (`:2560-2596`).
- **Don't punctuation-match short tokens.** Never punctuation-match very short fragments (one to three words) into a question while PIP is audible. Today a "Yeah." does it.
- **Captions.** Show overlapping visitor speech as an aside that does not split PIP's line. The Live docs say overlapping speech should update "captions independently" ([Managing sessions](https://developers.openai.com/api/docs/guides/live-conversations)). Keep PIP's turn one line in `lines` and the saved history.

### R3. Record only what the visitor heard (high impact for "go back" and photos, medium effort): **client**

`TourStage.tsx` (`appendLine`, `classifySentence`, `history` at `:2533`), `live-session.ts:451-454`.

- When R2 decides a takeover happened, cut PIP's current line to what was audible by then. There are two ways to measure that:
  - the caption pacing (`setHeard` / `pace` in `appendLine`), which already estimates the heard position;
  - better, the `start_ms`/`end_ms` that Live puts on each `output_transcript.delta` ([reference](https://developers.openai.com/api/reference/resources/live/primary-websocket#session.output_transcript.delta)), compared with when PIP's audio stopped.
- Drop the unsaid tail from `lines`, the saved conversation and the history sent to the next session. Cancel Jev classifications for sentences that started after the cut, so no photo or card appears for words never spoken.
- This is the client-side stand-in for Realtime's `conversation.item.truncate` (§2.1). That event does not exist on Live, and Live does not document mapping transcript ms to playback, so treat the cut as approximate.
- Pass the `interpret()` timestamps through. Today they are dropped: `LiveIntent` carries only `delta`.

### R4. Let PIP's body backchannel (high delight, medium effort): **client** (+ optional **config**)

PIP's body can show listening without competing for the floor. The research suggests this improves the visitor's own telling (Bavelas et al. 2000). It is also risk-free for turn-taking, because it makes no sound.

- **Cheap path:** extend the existing mic "ears" (`TourStage.tsx:2549`) with a simple Ward-Tsukahara-style rule. After at least 700 ms of visitor speech, a short drop in level or pitch gives a nod. Keep it occasional and silent.
- **Native path:**
  - Add a `session.triggers` entry on `session.input_transcript.delta` with Decisions *choice* questions: expression, intensity, gesture, plus a "kind of contribution" choice (continuer, assessment, laughter, takeover, correction, go-back, aside, noise).
  - Set it in `route.ts:117-142`. Handle `decision.event` in `interpret()` (`live-session.ts:397`) and map it to `char.emit` in `TourStage.handleEvent`.
  - OpenAI's own example uses exactly this to pick a character's expression and gesture while the person speaks ([Connect voice to Decisions, "React to transcripts"](https://developers.openai.com/api/docs/guides/decisions-voice)).
  - Caveats: "results can arrive out of order", so apply only the newest per direction.
  - The "kind" answer can also feed R2's decision.
  - Cost and latency for Decisions are **[Unverified]**. Not covered in the pages read.

### R5. Tune the acknowledgement beat (medium impact, low effort): **config** + small **client**

`route.ts:125-139`, `TourStage.tsx:2008-2015`.

- Set `delegation.acknowledgement_delay_ms`. Today it defaults to 0, meaning "request immediately" ([reference](https://developers.openai.com/api/reference/resources/live/primary-websocket#session.start)).
- A few hundred ms would let fast backend answers start without a filler, and only slower ones get the beat. That gives more varied pacing. Decisions sessions default to 400.
- Choose the value by listening. It can be changed live with `session.update`.
- Hold `sharePoint`'s `think()` while a delegation is pending. Appends cancel pending acknowledgements (§1.6).

### R6. A gentle proactive turn after a lull (medium impact, low-medium effort): **client** trigger + **prompt**-style commentary

`TourStage.tsx` idle loop `:2945-3044`.

- Live has no `idle_timeout_ms` (that is Realtime only, §2.1), so the trigger must be client-side. Add one spoken re-open per lull via `session.commentary.append`.
- **When to fire** (an assumption to tune by listening, not a researched number): something like 7-9 s after PIP's last turn ended *without* a question, after the chips have shown.
- **When not to fire:**
  - a card or photo is open;
  - the visitor is typing or writing in the card;
  - PIP's last turn ended with a question;
  - it has already fired since the visitor last spoke.
- **Content:** describe the behaviour. Invite them in a few words of PIP's own to ask about anything the tour covers, or to point at a photo, naming no particular story (respects TOUR_SCOPE and the no-steering rule, `context.ts:29-31`, `:110-111`).
- `IDLE_LIMIT` (15 s) may need to grow by the same amount. Otherwise the re-open eats the doze budget.

### R7. "Wait, go back" and "keep going" (medium impact, low effort once R3 lands): **prompt** + **client**

- **Prompt:**
  - Repeating or recapping what PIP has *already said* is the voice's job and needs no `<|SpawnThinking|>`. The template already lists "asks you to repeat a result already provided" under do-not-delegate ([Live prompting](https://developers.openai.com/api/docs/guides/live-prompting#delegation)).
  - Saying something new about him still needs the backend.
  - "Keep going" after a takeover means continue from where it was cut, briefly, not from the top.
- **Client:** R3 makes the history accurate, so "the last thing you said" refers to something the visitor actually heard. Whether the Live model knows where its own audio was cut off is **[Unverified]** (§6).

### R8. Echo and noise hygiene (medium impact, low effort): **client**

`src/lib/tour/wake-mic.ts:68-70`, `src/lib/tour/live-session.ts:167-169`.

- Request `echoCancellation: true`, `noiseSuppression: true` and `autoGainControl: true` explicitly, not left to defaults ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/echoCancellation)). Avoid `"remote-only"`, because PIP's local Web Audio cues (`SESSION_LIVE`, `THINKING`, point sounds; §1.8) do not come from the peer connection.
- Test whether those cues ever show up as `input_transcript` text or make PIP stop. If they do, lower the cue level or skip cues while PIP is audible.
- This plus R1's noise control is the Live equivalent of Realtime's `noise_reduction` and VAD `threshold`, which do not exist on Live.

### R9. Use `session.input` for the greeting and history (low-medium impact, low effort): **config**

`route.ts:116-124`, `:186`.

- OpenAI's recommended greeting is a `developer` message in `session.input` *and* a commentary after `session.started` ([Managing sessions](https://developers.openai.com/api/docs/guides/live-conversations#greet-before-the-caller-speaks)). Today only the commentary is used.
- Returning-visitor history could go in as real `user`/`assistant` messages in `input` rather than prose in `instructions`. That gives the model its own earlier turns in the form it expects (limit 128 messages, 8,192 tokens).

### R10. Lock down the data channel (high importance, low effort): **config** (not about liveliness, but found while reading)

`route.ts:117-142`.

- The route's header says a visitor "cannot point the session at instructions of their own" (`route.ts:8-12`). But with no `client.data_channel.allowed_client_events`, the browser data channel allows every client event ("Omission preserves the existing allow-all behavior", [reference](https://developers.openai.com/api/reference/resources/live/primary-websocket#session.start)).
- That includes `session.instructions.append` and `session.update`, which can replace `delegation.responses.instructions` and `model`.
- Set the allowlist to what the page actually sends: `session.commentary.append`, `session.thinking.append`, `response.item.create`, `response.create`, `session.close`.
- Optionally restrict `allowed_server_events` too. If R4's triggers are added, the docs say to allow `decision.event` *and* its source transcript event.

### R11. Measure before and after (enabling, medium effort): **client**

- Add lab-panel or bench metrics from the OpenAI cookbook ([evaluation guide](https://developers.openai.com/cookbook/examples/audio/voice_agent_evaluation)):
  - response latency (visitor audio end to PIP audio start);
  - yield latency (visitor speech onset to PIP audio stop);
  - silence during delegation;
  - how often PIP kept talking through a backchannel versus stopped.
- Both audio envelopes already exist (`TourStage.tsx:2551`, `:2578`).
- A scripted listening pass over the §4 cues would make R1/R2 tuning repeatable.

**Ranking at a glance** (impact ÷ effort): R1 > R2 > R10 > R3 > R5 > R8 > R4 > R6 > R7 > R9 > R11.

| | Prompt | Client | Config |
|---|---|---|---|
| R1 policies | ✓ | | |
| R2 backchannel ≠ question | | ✓ | |
| R3 heard-only transcript | | ✓ | |
| R4 body backchannels | | ✓ | optional `triggers` |
| R5 ack delay | | small | `acknowledgement_delay_ms` |
| R6 lull re-open | wording (via commentary) | ✓ | |
| R7 go back / keep going | ✓ | depends on R3 | |
| R8 echo/noise | noise line in R1 | ✓ | |
| R9 greeting/history in `input` | | | ✓ |
| R10 data-channel allowlist | | | ✓ |
| R11 metrics | | ✓ | |

---

## 6. Open questions and what I couldn't verify

1. **What is in the output transcript after an interruption?** Does `session.output_transcript.delta` include text for audio that was generated but never played? Realtime over WebRTC auto-truncates server-side; Live documents nothing on this. To test: interrupt PIP mid-sentence, compare the transcript with what was heard, and ask "what was the last thing you said?" in the same session. That answer also shows whether the model's own context is truncated.
2. **Does the voice resume?** After a takeover, does the voice layer try to resume a backend answer it had not finished saying? Backend work "continues independently" ([Delegation](https://developers.openai.com/api/docs/guides/live-delegation)), but whether the voice resumes is undocumented. R1's wording should be checked against this.
3. **Is there turn detection to configure?** The announcement and engineering posts could not be read (403 or JavaScript wall). Search snippets claim native turn detection, but no configuration field exists in the reference. If OpenAI adds a turn or eagerness control later, it will appear in [the Live reference](https://developers.openai.com/api/reference/resources/live/primary-websocket).
4. **When is commentary spoken?** Does `session.commentary.append` wait for a pause or cut in? Undocumented; only `instructions.append` "can interrupt speech in progress". This matters for R6 and for the typed-answer fallback (`TourStage.tsx:2979-2992`).
5. **What do Decisions triggers cost?** Their latency and pricing were not covered in the pages read. Check before R4's native path.
6. **Does browser echo cancellation remove PIP's local cues?** It is unclear whether AEC removes Web Audio output that does not come from the peer connection, in Chrome, Safari and Firefox. Test as part of the "other browsers" item already on the roadmap.
7. **Undocumented events in use.** `session.delegation.completed` / `.failed` and top-level `response.created` / `response.completed` are mapped in `interpret()` (`live-session.ts:467-472`) but are not Live events in the reference. Responses events arrive wrapped in `response.event`. They are harmless, but the `thinking` state relies on transcript activity rather than on them.
8. **Research citations not re-read.** Jefferson 1984, French & Local 1983, the Schegloff 2000 overlap taxonomy beyond its abstract, and the exact Ward-Tsukahara parameters are cited from their well-known findings and secondary reproductions. ScienceDirect blocked access to the full texts. The DOIs, titles, authors and years were all checked against Crossref.
