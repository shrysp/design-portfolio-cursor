/**
 * SDP exchange for a tour session.
 *
 * The browser cannot talk to OpenAI directly — the API key must never reach
 * client code — so it POSTs its WebRTC offer here and this route swaps it for
 * an answer via POST /v1/live/sessions.
 *
 * It sends the offer and nothing else. The lab's version of this route took
 * its instructions from the request body, which let anyone who could reach it
 * run a session on prompts of their own; here the prompts and both model
 * names are fixed on the server, and a session only opens for an access code
 * with time left (see access.ts).
 */

import { after } from 'next/server';
import { MIN_SESSION_SECONDS, endSession, refreshVisitor, startSession } from '@/lib/tour/server/access';
import { accessFrom } from '@/lib/tour/server/auth';
import {
  backendInstructions,
  TOUR_VOICE_INSTRUCTIONS,
  type Turn,
  greetingFor,
  historyInstructions,
  visitorContext,
  visitorInstructions,
} from '@/lib/tour/server/context';
import { currentStory, refreshStory } from '@/lib/tour/server/story';
import { TOUR_IMAGES } from '@/data/tour-images';

const LIVE_SESSIONS = 'https://api.openai.com/v1/live/sessions';
const MODEL = 'gpt-live-1';
/** The reasoning model behind the voice. See the delegation note below. */
const BACKEND_MODEL = 'gpt-5.6-terra';

/** How much of an earlier conversation a returning session is given. */
const HISTORY_TURNS = 8;
const HISTORY_TURN_CHARS = 400;

/**
 * The browser's account of the conversation so far. It is the one thing this
 * route accepts besides the offer, so it is taken apart rather than trusted:
 * only the last few turns, only the two known speakers, each cut to length
 * and flattened to a single line.
 */
function readHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  const turns: Turn[] = [];
  for (const item of raw.slice(-HISTORY_TURNS)) {
    const { who, text } = (item ?? {}) as { who?: unknown; text?: unknown };
    if ((who !== 'you' && who !== 'pip') || typeof text !== 'string') continue;
    const line = text.replace(/\s+/g, ' ').trim().slice(0, HISTORY_TURN_CHARS);
    if (line) turns.push({ who, text: line });
  }
  return turns;
}

export async function POST(request: Request) {
  const id = await accessFrom(request);
  if (!id) return Response.json({ error: 'An access code is required.' }, { status: 401 });

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error('[tour/session] OPENAI_API_KEY is not set.');
    return Response.json({ error: 'The tour is not available right now.' }, { status: 503 });
  }

  const { sdp, history } = await request.json().catch(() => ({}));
  if (typeof sdp !== 'string' || !sdp || sdp.length > 20_000) {
    return Response.json({ error: 'Missing SDP offer.' }, { status: 400 });
  }

  // His story is the one thing PIP cannot do without, so it is looked for
  // before any of this code's time is reserved. It is normally already in
  // the store — the tour page reads it on the way in — and fetched here only
  // if it is not.
  let story: string | undefined;
  try {
    story = await currentStory();
    if (!story) {
      await refreshStory();
      story = await currentStory();
    }
  } catch (err) {
    console.error('[tour/session]', err);
  }
  if (!story) {
    console.error('[tour/session] There is no story to tell: check NOTION_STORY_PAGE and the page it names.');
    return Response.json({ error: 'The tour is not available right now.' }, { status: 503 });
  }

  let started;
  try {
    started = await startSession(id);
  } catch (err) {
    console.error('[tour/session]', err);
    return Response.json({ error: 'The tour is not available right now.' }, { status: 503 });
  }
  if (!started.ok) {
    return Response.json({ error: started.error, spent: started.status === 402 }, { status: started.status });
  }

  /**
   * Delegation is what actually produces the words — and leaving it out does
   * NOT mean "no delegation": an absent field defaults to CLIENT delegation,
   * where we would be expected to run a backend and hand results back. With
   * nothing doing that, GPT-Live opens a delegation, gets nothing, and stalls
   * in a loop of acknowledgment filler. Responses delegation points it at a
   * real backend that OpenAI runs for us. The backend carries the knowledge;
   * the voice layer carries only personality and pacing.
   */
  // Both layers get it: the voice so it does not say hello twice, the backend
  // so "tell me more about that" has something to refer to.
  const earlier = historyInstructions(readHistory(history));
  const session = {
    // No `type` field: that is a Realtime requirement, and GPT-Live rejects it.
    model: MODEL,
    // The voice layer learns who has come in; the backend, which only answers
    // questions about Shreyas, has no use for it.
    instructions: [TOUR_VOICE_INSTRUCTIONS, visitorInstructions(started.visitor), earlier]
      .filter(Boolean)
      .join('\n\n'),
    delegation: {
      type: 'responses',
      responses: {
        model: BACKEND_MODEL,
        instructions: [backendInstructions(story), visitorContext(started.visitor.context), earlier]
          .filter(Boolean)
          .join('\n\n'),
      },
    },
    // No `audio` block: GPT-Live rejects `session.audio.input`. Turn detection
    // is native and not ours to configure.
  };

  let res: Response;
  try {
    res = await fetch(LIVE_SESSIONS, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, transport: { type: 'webrtc', sdp } }),
    });
  } catch (err) {
    await endSession(id, true);
    console.error('[tour/session]', err);
    return Response.json({ error: 'Could not reach the voice model.' }, { status: 502 });
  }

  const body = await res.text();
  if (!res.ok) {
    // Nothing opened, so nothing was spent.
    await endSession(id, true);
    // The upstream complaint goes to the server log, not to the visitor.
    console.error(`[tour/session] OpenAI ${res.status}:`, body.slice(0, 1500));
    return Response.json({ error: `The voice model returned ${res.status}.` }, { status: 502 });
  }

  // Once the answer is on its way: check this person's Notion row, so an edit
  // or a switched-off code is in place for their next session without this
  // one having waited for it.
  after(() => refreshVisitor(id));

  return Response.json({
    ...JSON.parse(body),
    maxSeconds: started.maxSeconds,
    // Whether this is the last session the code has time for, so the tour can
    // say goodbye when it ends rather than offer a way on that will not open.
    last: started.remaining < MIN_SESSION_SECONDS,
    // Someone coming back from a pause has already been greeted, and pressed
    // the key because they have something to say: PIP wakes and listens.
    greeting: earlier ? '' : greetingFor(started.visitor),
    // Photos chosen for this visitor, shown as PIP says hello.
    spotlight: earlier
      ? []
      : started.visitor.photos.filter((id) => TOUR_IMAGES.some((img) => img.id === id)).slice(0, 3),
  });
}
