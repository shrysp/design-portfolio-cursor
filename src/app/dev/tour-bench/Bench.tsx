'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useDialKit } from 'dialkit';

/**
 * A place to see what each part of PIP's prompt does to its answers.
 *
 * The prompt's blocks are on the left, each editable and each with a switch,
 * so "what happens without this paragraph" is one click. The settings that are
 * numbers or choices are in the DialKit panel. Running asks every question on
 * the right and shows the answer with what it cost and which photos its
 * sentences would have brought up. The right-hand padding leaves room for the
 * DialKit panel, which would otherwise sit on the answers. Keep a run as the baseline and the next
 * one is shown against it.
 *
 * Nothing here changes the tour. When a version is better, copy the block
 * into src/lib/tour/server/context.ts.
 */

type Block = { text: string; on: boolean };
type Sentence = { text: string; mood?: string; images?: { id: string; p: number }[]; error?: string };
type Result = {
  answer?: string;
  ms?: number;
  truncated?: boolean;
  usage?: { input: number; cached: number; output: number; reasoning: number };
  sentences?: Sentence[];
  error?: string;
};
type Run = Record<string, Result>;
type Suggestion = { name: string; replaces?: string; text: string };

/** About how fast PIP talks, for turning words into seconds of voice. */
const WORDS_PER_SECOND = 2.6;
const VOICE_DOLLARS_PER_MINUTE = 0.05;

const words = (s = '') => s.trim().split(/\s+/).filter(Boolean).length;

export default function Bench() {
  const [blocks, setBlocks] = useState<Record<string, Block>>({});
  const original = useRef<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [questions, setQuestions] = useState('');
  const [run, setRun] = useState<Run>({});
  const [baseline, setBaseline] = useState<Run | null>(null);
  const [running, setRunning] = useState(false);
  const stop = useRef(false);

  const dial = useDialKit('Tour bench', {
    backend: {
      model: 'gpt-5.6-terra',
      effort: { type: 'select', options: ['default', 'minimal', 'low', 'medium', 'high'], default: 'default' },
      maxOutputTokens: [0, 0, 2000, 50],
    },
    photos: {
      match: true,
      threshold: [0.5, 0, 1, 0.05],
      maxPerSentence: [3, 1, 6, 1],
    },
    // Dollars per million tokens, from the model's pricing page — left at 0 the cost column stays empty.
    price: {
      _collapsed: true,
      inputPerM: [0, 0, 30, 0.05],
      outputPerM: [0, 0, 120, 0.05],
    },
  });

  useEffect(() => {
    void fetch('/api/dev/tour-bench')
      .then((r) => r.json())
      .then((d: { blocks: Record<string, string>; questions: string[]; suggestions: Suggestion[] }) => {
        setSuggestions(d.suggestions);
        original.current = d.blocks;
        setBlocks(Object.fromEntries(Object.entries(d.blocks).map(([k, text]) => [k, { text, on: true }])));
        setQuestions(d.questions.join('\n'));
      });
  }, []);

  const instructions = useMemo(
    () =>
      Object.values(blocks)
        .filter((b) => b.on && b.text.trim())
        .map((b) => b.text.trim())
        .join('\n\n'),
    [blocks],
  );
  const list = useMemo(() => questions.split('\n').map((q) => q.trim()).filter(Boolean), [questions]);

  const ask = async (question: string): Promise<Result> => {
    try {
      const res = await fetch('/api/dev/tour-bench', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructions,
          question,
          model: dial.backend.model,
          effort: dial.backend.effort,
          maxOutputTokens: dial.backend.maxOutputTokens,
          photos: dial.photos.match,
          threshold: dial.photos.threshold,
          maxPhotos: dial.photos.maxPerSentence,
        }),
      });
      return await res.json();
    } catch (err) {
      return { error: String(err) };
    }
  };

  const runAll = async (only?: string) => {
    setRunning(true);
    stop.current = false;
    const todo = only ? [only] : list;
    if (!only) setRun({});
    // Three at a time: quick enough, and gentle on the rate limit.
    let next = 0;
    await Promise.all(
      Array.from({ length: 3 }, async () => {
        while (next < todo.length && !stop.current) {
          const q = todo[next++];
          const result = await ask(q);
          setRun((r) => ({ ...r, [q]: result }));
        }
      }),
    );
    setRunning(false);
  };

  const cost = (r: Result) => {
    if (!r.usage || (!dial.price.inputPerM && !dial.price.outputPerM)) return null;
    return (r.usage.input * dial.price.inputPerM + r.usage.output * dial.price.outputPerM) / 1e6;
  };

  const done = Object.values(run).filter((r) => r.answer != null);
  const avg = (f: (r: Result) => number) => (done.length ? done.reduce((s, r) => s + f(r), 0) / done.length : 0);

  const field = 'w-full rounded-lg border border-stone-300 bg-white p-2 font-mono text-[12px] leading-relaxed';
  const btn = 'rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-100 disabled:opacity-40';

  return (
    <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-8 p-6 pb-40 text-stone-800 lg:pr-[310px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section className="flex flex-col gap-4">
        <header>
          <h1 className="text-xl font-semibold">Tour bench</h1>
          <p className="mt-1 text-sm text-stone-500">
            The backend prompt, block by block. This tests the written answer; the live voice re-speaks it in
            its own words. Prompt is {words(instructions)} words.{' '}
            <Link href="/dev/tour-bench/review" className="text-blue-700 underline">
              Read the review of these prompts
            </Link>
          </p>
        </header>
        {Object.entries(blocks).map(([name, block]) => {
          const edited = block.text !== original.current[name];
          return (
            <div key={name} className={block.on ? '' : 'opacity-50'}>
              <div className="mb-1 flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2 font-medium">
                  <input
                    type="checkbox"
                    checked={block.on}
                    onChange={(e) => setBlocks((b) => ({ ...b, [name]: { ...block, on: e.target.checked } }))}
                  />
                  {name}
                </label>
                <span className="text-stone-400">{words(block.text)} words</span>
                {edited && (
                  <button
                    className="text-blue-700 underline"
                    onClick={() => setBlocks((b) => ({ ...b, [name]: { ...block, text: original.current[name] ?? '' } }))}
                  >
                    edited — reset
                  </button>
                )}
              </div>
              <textarea
                aria-label={`${name} block`}
                className={field}
                rows={Math.min(16, Math.max(3, Math.ceil(block.text.length / 90)))}
                value={block.text}
                onChange={(e) => setBlocks((b) => ({ ...b, [name]: { ...block, text: e.target.value } }))}
              />
            </div>
          );
        })}
        <button
          className={`${btn} self-start`}
          onClick={() => {
            const name = window.prompt('Name the new block (for example: guardrails)')?.trim();
            if (name && !blocks[name]) setBlocks((b) => ({ ...b, [name]: { text: '', on: true } }));
          }}
        >
          Add a block
        </button>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-stone-500">Try a suggested block:</span>
            {suggestions.map((sug) => {
              const target = sug.replaces ?? sug.name;
              const applied = blocks[target]?.text === sug.text;
              return (
                <button
                  key={sug.name}
                  className={btn}
                  disabled={applied}
                  // A replacement keeps its place in the order; an addition goes last.
                  onClick={() => setBlocks((b) => ({ ...b, [target]: { text: sug.text, on: true } }))}
                >
                  {applied ? `${sug.name} — in` : sug.replaces ? `Replace ${sug.replaces}` : `Add ${sug.name}`}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <label htmlFor="bench-questions" className="mb-1 block text-sm font-medium">
            Questions, one per line
          </label>
          <textarea
            id="bench-questions"
            className={field}
            rows={8}
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className={btn} disabled={running || !instructions} onClick={() => void runAll()}>
            {running ? `Running… ${Object.keys(run).length} of ${list.length}` : `Run all ${list.length}`}
          </button>
          {running && (
            <button className={btn} onClick={() => (stop.current = true)}>
              Stop
            </button>
          )}
          <button className={btn} disabled={running || !done.length} onClick={() => setBaseline(run)}>
            Keep this run as the baseline
          </button>
          {baseline && (
            <button className={btn} onClick={() => setBaseline(null)}>
              Clear the baseline
            </button>
          )}
          <button className={btn} disabled={!instructions} onClick={() => void navigator.clipboard.writeText(instructions)}>
            Copy the prompt
          </button>
        </div>
        {done.length > 0 && (
          <p className="text-sm tabular-nums text-stone-600">
            Average over {done.length}: {avg((r) => words(r.answer)).toFixed(0)} words ·{' '}
            {(avg((r) => words(r.answer)) / WORDS_PER_SECOND).toFixed(0)}s spoken ·{' '}
            {(avg((r) => r.ms ?? 0) / 1000).toFixed(1)}s to answer · {avg((r) => r.usage?.input ?? 0).toFixed(0)} in /{' '}
            {avg((r) => r.usage?.output ?? 0).toFixed(0)} out tokens
          </p>
        )}

        <ol className="flex flex-col gap-3">
          {list.map((q) => {
            const r = run[q];
            const was = baseline?.[q];
            const spoken = words(r?.answer) / WORDS_PER_SECOND;
            const c = r ? cost(r) : null;
            return (
              <li key={q} className="rounded-xl border border-stone-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{q}</p>
                  <button className="shrink-0 text-xs text-blue-700 underline" disabled={running} onClick={() => void runAll(q)}>
                    run
                  </button>
                </div>
                {r?.error && <p className="mt-2 text-sm text-red-700">{r.error}</p>}
                {r?.answer != null && (
                  <>
                    <div className={`mt-2 grid gap-3 ${was?.answer != null ? 'md:grid-cols-2' : ''}`}>
                      <div className="text-sm leading-relaxed">
                        {(r.sentences ?? []).map((s, i) => (
                          <span key={i}>
                            {s.text}{' '}
                            {s.images?.map((img) => (
                              <span key={img.id} className="mr-1 rounded bg-teal-100 px-1 font-mono text-[11px] text-teal-900">
                                {img.id} {img.p.toFixed(2)}
                              </span>
                            ))}
                            {s.error && <span className="mr-1 rounded bg-red-100 px-1 text-[11px] text-red-800">photo read failed</span>}
                          </span>
                        ))}
                        {!r.answer && <span className="text-stone-400">(empty answer)</span>}
                      </div>
                      {was?.answer != null && (
                        <div className="border-l border-stone-200 pl-3 text-sm leading-relaxed text-stone-500">
                          <span className="mr-1 text-[11px] uppercase tracking-wider">baseline</span>
                          {was.answer}
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs tabular-nums text-stone-500">
                      {words(r.answer)} words · ~{spoken.toFixed(0)}s spoken (~$
                      {((spoken / 60) * VOICE_DOLLARS_PER_MINUTE).toFixed(3)} of voice) · {((r.ms ?? 0) / 1000).toFixed(1)}s to
                      answer · {r.usage?.input} in ({r.usage?.cached} cached) / {r.usage?.output} out ({r.usage?.reasoning}{' '}
                      reasoning) tokens
                      {c != null && ` · $${c.toFixed(5)} backend`}
                      {r.truncated && ' · cut off by the token cap'}
                      {was?.answer != null && ` · baseline ${words(was.answer)} words, ${((was.ms ?? 0) / 1000).toFixed(1)}s`}
                    </p>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
