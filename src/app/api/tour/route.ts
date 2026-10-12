/**
 * Reads one sentence of PIP's own answer: its mood, and which real photos it
 * mentions. The reading itself is in lib/tour/server/read-sentence.ts.
 */

import { accessFrom } from '@/lib/tour/server/auth';
import { readSentence } from '@/lib/tour/server/read-sentence';

/** A spoken sentence is short. Anything longer is not one, and is not paid for. */
const MAX_TEXT = 600;

export async function POST(request: Request) {
  if (!(await accessFrom(request))) {
    return Response.json({ error: 'An access code is required.' }, { status: 401 });
  }

  const key = process.env.TYPESAFE_API_KEY;
  if (!key) {
    console.error('[tour] TYPESAFE_API_KEY is not set.');
    return Response.json({ error: 'The tour is not available right now.' }, { status: 503 });
  }

  const { text, question } = await request.json().catch(() => ({}));
  if (typeof text !== 'string' || !text.trim() || text.length > MAX_TEXT) {
    return Response.json({ error: 'Missing text.' }, { status: 400 });
  }
  if (question != null && (typeof question !== 'string' || question.length > MAX_TEXT)) {
    return Response.json({ error: 'Bad question.' }, { status: 400 });
  }

  try {
    return Response.json(await readSentence(key, text, question ?? undefined));
  } catch (err) {
    console.error('[tour]', err);
    return Response.json({ error: 'Could not read that sentence.' }, { status: 502 });
  }
}
