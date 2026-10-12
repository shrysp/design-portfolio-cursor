/**
 * The tuning bench's server half: one question, answered by the tour's
 * backend model in text, with whatever prompt the bench sends.
 *
 * Development only, and that is the whole of its protection — this route
 * takes instructions from the browser, which is exactly what the tour's own
 * routes refuse to do. In a production build it does not exist.
 *
 * Text only, so it costs backend tokens and no voice minutes. What it cannot
 * show is the voice layer: live, GPT-Live decides whether to hand a question
 * to this backend at all, and re-speaks what comes back in its own words.
 */

import { notFound } from 'next/navigation';
import { TOUR_BACKEND_BLOCKS } from '@/lib/tour/server/context';
import { BENCH_QUESTIONS } from '@/lib/tour/server/bench-questions';
import { BENCH_SUGGESTIONS } from '@/lib/tour/server/bench-suggestions';
import { readSentence, type SentenceReading } from '@/lib/tour/server/read-sentence';

const RESPONSES = 'https://api.openai.com/v1/responses';
const live = process.env.NODE_ENV !== 'production';

/** What the tour is running right now, as the bench's starting point. */
export async function GET() {
  if (!live) notFound();
  return Response.json({ blocks: TOUR_BACKEND_BLOCKS, questions: BENCH_QUESTIONS, suggestions: BENCH_SUGGESTIONS });
}

type OutputItem = { type?: string; content?: { type?: string; text?: string }[] };

export async function POST(request: Request) {
  if (!live) notFound();
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: 'OPENAI_API_KEY is not set in .env.local.' }, { status: 500 });

  const { instructions, question, model, effort, maxOutputTokens, photos, threshold, maxPhotos } =
    await request.json();

  const body: Record<string, unknown> = { model, instructions, input: question, store: false };
  if (effort && effort !== 'default') body.reasoning = { effort };
  if (maxOutputTokens > 0) body.max_output_tokens = maxOutputTokens;

  const started = performance.now();
  const res = await fetch(RESPONSES, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const ms = Math.round(performance.now() - started);
  const data = await res.json();
  if (!res.ok) {
    return Response.json({ error: data?.error?.message ?? `OpenAI returned ${res.status}` }, { status: 502 });
  }

  const answer = ((data.output ?? []) as OutputItem[])
    .filter((item) => item.type === 'message')
    .flatMap((item) => item.content ?? [])
    .map((part) => part.text ?? '')
    .join('')
    .trim();

  // The same split the tour page makes, so the photos here are the photos there.
  const sentences = answer.match(/[^.!?]*[.!?]+\s*|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
  let readings: (SentenceReading | { error: string })[] = [];
  const typesafe = process.env.TYPESAFE_API_KEY;
  if (photos && typesafe) {
    readings = await Promise.all(
      sentences.map((s) =>
        readSentence(typesafe, s, question, { threshold, maxPhotos }).catch((err) => ({ error: String(err) })),
      ),
    );
  }

  return Response.json({
    answer,
    ms,
    truncated: data.status === 'incomplete',
    usage: {
      input: data.usage?.input_tokens ?? 0,
      cached: data.usage?.input_tokens_details?.cached_tokens ?? 0,
      output: data.usage?.output_tokens ?? 0,
      reasoning: data.usage?.output_tokens_details?.reasoning_tokens ?? 0,
    },
    sentences: sentences.map((text, i) => ({ text, ...(readings[i] ?? {}) })),
  });
}
