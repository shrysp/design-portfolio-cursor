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
 * everyone, each answer is written once per version of the prompt and kept —
 * a click costs a model call only the first time anyone makes it.
 *
 * A photo pointed at in silence is asked the same way, by its id. The voice
 * used to be told to "tell the story behind it" from the caption alone,
 * which is the one thing its instructions forbid: it knows no facts, so it
 * either read the caption out or made a story up.
 */

import { after } from 'next/server';
import { chargeApi } from '@/lib/tour/server/access';
import { accessFrom } from '@/lib/tour/server/auth';
import { backendMicros } from '@/lib/tour/server/costs';
import { TOUR_BACKEND_MODEL, backendInstructions, pointedQuestion } from '@/lib/tour/server/context';
import { getStore, toRecord } from '@/lib/tour/server/store';
import { currentStory, refreshStory } from '@/lib/tour/server/story';
import { SUGGESTIONS } from '@/lib/tour/suggestions';
import { TOUR_IMAGES } from '@/data/tour-images';

const RESPONSES = 'https://api.openai.com/v1/responses';

type OutputItem = { type?: string; content?: { type?: string; text?: string }[] };

/**
 * Of the whole prompt, not just the story: keyed to the story alone, a change
 * to the instructions never reached an answer already kept.
 */
async function versionOf(instructions: string, question: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${instructions}\n${question}`));
  return [...new Uint8Array(digest)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  const id = await accessFrom(request);
  if (!id) {
    return Response.json({ error: 'An access code is required.' }, { status: 401 });
  }

  const { index, photo } = await request.json().catch(() => ({}));
  const image = typeof photo === 'string' ? TOUR_IMAGES.find((img) => img.id === photo) : undefined;
  const question = image
    ? pointedQuestion(image.description)
    : Number.isInteger(index)
      ? SUGGESTIONS[index as number]?.q
      : undefined;
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
    const kept = image ? `tour:photo:${image.id}` : `tour:answer:${index}`;
    const instructions = backendInstructions(story);
    const version = await versionOf(instructions, question);
    const rec = toRecord(await store.cmd<string[]>('HGETALL', kept));
    if (rec.text && rec.version === version) return Response.json({ answer: rec.text });

    // The story alone, with nobody's visitor notes: this answer is shared.
    const res = await fetch(RESPONSES, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: TOUR_BACKEND_MODEL,
        instructions,
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
    // Written once and kept for everyone; whoever asked first pays for it.
    after(() => chargeApi(id, backendMicros(data.usage)));
    return Response.json({ answer });
  } catch (err) {
    console.error('[tour/ask]', err);
    return Response.json({ error: 'The tour is not available right now.' }, { status: 503 });
  }
}
