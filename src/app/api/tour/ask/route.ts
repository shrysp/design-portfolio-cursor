/**
 * Answers one of the suggested questions (lib/tour/suggestions.ts) from
 * Shreyas's story, for a visitor who clicked it instead of saying it.
 *
 * A spoken question reaches the backend because the voice model hands it
 * over. A clicked one cannot go that way: the only thing the page can send
 * the voice model is a note, and it answers a note by itself, from nothing —
 * the first test of that had PIP say he was "building ItinerAI for fun".
 * So the answer is written here, by the same model with the same
 * instructions as a spoken one, and PIP is given it to say.
 *
 * It takes a place in the list, never a question: nothing a browser sends
 * becomes part of a prompt. And since the list is short and the same for
 * everyone, each answer is written once per version of the story and kept —
 * a click costs a model call only the first time anyone makes it.
 */

import { accessFrom } from '@/lib/tour/server/auth';
import { TOUR_BACKEND_MODEL, backendInstructions } from '@/lib/tour/server/context';
import { getStore, toRecord } from '@/lib/tour/server/store';
import { currentStory, refreshStory } from '@/lib/tour/server/story';
import { SUGGESTIONS } from '@/lib/tour/suggestions';

const RESPONSES = 'https://api.openai.com/v1/responses';

type OutputItem = { type?: string; content?: { type?: string; text?: string }[] };

async function versionOf(story: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(story));
  return [...new Uint8Array(digest)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  if (!(await accessFrom(request))) {
    return Response.json({ error: 'An access code is required.' }, { status: 401 });
  }

  const { index } = await request.json().catch(() => ({}));
  const question = Number.isInteger(index) ? SUGGESTIONS[index as number] : undefined;
  if (!question) return Response.json({ error: 'No such question.' }, { status: 400 });

  const key = process.env.OPENAI_API_KEY;
  try {
    let story = await currentStory();
    if (!story) {
      await refreshStory();
      story = await currentStory();
    }
    if (!key || !story) throw new Error(key ? 'There is no story to answer from.' : 'OPENAI_API_KEY is not set.');

    const store = getStore();
    const kept = `tour:answer:${index}`;
    const version = await versionOf(story);
    const rec = toRecord(await store.cmd<string[]>('HGETALL', kept));
    if (rec.text && rec.version === version) return Response.json({ answer: rec.text });

    // The story alone, with nobody's visitor notes: this answer is shared.
    const res = await fetch(RESPONSES, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: TOUR_BACKEND_MODEL,
        instructions: backendInstructions(story),
        input: question,
        store: false,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${JSON.stringify(data).slice(0, 400)}`);
    const answer = ((data.output ?? []) as OutputItem[])
      .filter((item) => item.type === 'message')
      .flatMap((item) => item.content ?? [])
      .map((part) => part.text ?? '')
      .join('')
      .trim();
    if (!answer) throw new Error('The model returned no answer.');

    await store.cmd('HSET', kept, 'text', answer, 'version', version);
    return Response.json({ answer });
  } catch (err) {
    console.error('[tour/ask]', err);
    return Response.json({ error: 'The tour is not available right now.' }, { status: 503 });
  }
}
