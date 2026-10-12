import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BENCH_SUGGESTIONS } from '@/lib/tour/server/bench-suggestions';
import {
  FINDINGS,
  GUARDRAILS,
  HELD_UP,
  PRACTICES,
  PROMPTS,
  SOURCES,
  SUMMARY,
  TRADE_OFFS,
  VOICE_DRAFT,
  type Severity,
  type Status,
} from './review-data';

export const metadata = { title: 'Tour prompt review', robots: { index: false } };

const STATUS: Record<Status, { label: string; className: string }> = {
  met: { label: 'In place', className: 'bg-emerald-100 text-emerald-900' },
  partly: { label: 'Partly', className: 'bg-amber-100 text-amber-900' },
  missing: { label: 'Missing', className: 'bg-red-100 text-red-900' },
};
const SEVERITY: Record<Severity, string> = {
  high: 'bg-red-100 text-red-900',
  medium: 'bg-amber-100 text-amber-900',
  low: 'bg-stone-200 text-stone-700',
};
const FIXED = { yes: 'Fixed in testing', mostly: 'Mostly fixed', no: 'Not fixed by the prompt' };

const Tag = ({ className, children }: { className: string; children: React.ReactNode }) => (
  <span className={`inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium ${className}`}>{children}</span>
);

const Section = ({ id, title, lead, children }: { id: string; title: string; lead?: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-6">
    <h2 className="text-lg font-semibold">{title}</h2>
    {lead && <p className="mt-1 max-w-[70ch] text-sm text-stone-600">{lead}</p>}
    <div className="mt-4">{children}</div>
  </section>
);

const Tally = ({ label, n }: { label: string; n: { clean: number; minor: number; failed: number } }) => (
  <div className="rounded-xl border border-stone-200 bg-white p-4">
    <p className="text-sm text-stone-500">{label}</p>
    <p className="mt-1 text-sm tabular-nums">
      <span className="text-2xl font-semibold">{n.clean}</span> of {n.clean + n.minor + n.failed} clean ·{' '}
      {n.minor} minor · <span className={n.failed ? 'font-semibold text-red-700' : ''}>{n.failed} failed</span>
    </p>
  </div>
);

/** Development only, like the bench it belongs to. */
export default function TourReviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const cell = 'border-t border-stone-200 px-3 py-2 align-top';

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-12 p-6 pb-40 text-stone-800">
      <header>
        <p className="text-sm">
          <Link href="/dev/tour-bench" className="text-blue-700 underline">
            ← Back to the bench
          </Link>
        </p>
        <h1 className="mt-3 text-2xl font-semibold">PIP’s prompts, reviewed</h1>
        <p className="mt-2 max-w-[70ch] text-stone-700">{SUMMARY.headline}</p>
        <p className="mt-3 max-w-[70ch] rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
          Since this review, the grounding, guardrails and shape blocks have been moved into the tour’s prompt.
          The findings and verdicts below describe the prompt before that change.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Tally label="Before, 23 questions" n={SUMMARY.current} />
          <Tally label="Blocks tried in the bench" n={SUMMARY.suggested} />
          <Tally label="Live prompt now" n={SUMMARY.applied} />
        </div>
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-blue-700">
          {[
            ['findings', 'What went wrong'],
            ['held', 'What held up'],
            ['prompts', 'Each prompt'],
            ['practices', 'Against the guidance'],
            ['guardrails', 'Guardrails'],
            ['tradeoffs', 'Trade-offs'],
            ['drafts', 'Drafts to try'],
            ['sources', 'Sources'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="underline">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <Section
        id="findings"
        title="What went wrong"
        lead="Every one of these is something PIP said in the test run, in the backend’s written answer. Worst first."
      >
        <ol className="flex flex-col gap-3">
          {FINDINGS.map((f) => (
            <li key={f.title} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Tag className={SEVERITY[f.severity]}>{f.severity}</Tag>
                <h3 className="font-medium">{f.title}</h3>
              </div>
              <p className="mt-2 text-sm text-stone-500">Asked: {f.question}</p>
              <blockquote className="mt-1 border-l-2 border-stone-300 pl-3 text-sm italic">{f.said}</blockquote>
              <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm md:grid-cols-2">
                <div>
                  <dt className="font-medium">Why it matters</dt>
                  <dd className="text-stone-700">{f.why}</dd>
                </div>
                <div>
                  <dt className="font-medium">Where it comes from</dt>
                  <dd className="text-stone-700">{f.cause}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm">
                <Tag className={f.fixed === 'yes' ? STATUS.met.className : f.fixed === 'mostly' ? STATUS.partly.className : STATUS.missing.className}>
                  {FIXED[f.fixed]}
                </Tag>{' '}
                <span className="text-stone-700">{f.after}</span>
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="held" title="What held up" lead="Worth knowing before changing anything: these work, and a rewrite can break them.">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {HELD_UP.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </Section>

      <Section id="prompts" title="Each prompt, judged">
        <div className="grid gap-3 md:grid-cols-2">
          {PROMPTS.map((p) => (
            <article key={p.name} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">{p.name}</h3>
                <Tag className={STATUS[p.verdict].className}>
                  {p.verdict === 'met' ? 'Works' : p.verdict === 'partly' ? 'Needs work' : 'Largest gap'}
                </Tag>
              </div>
              <p className="text-xs text-stone-500">{p.where}</p>
              <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Does well</h4>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {p.good.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
              <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Gaps</h4>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {p.gaps.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="practices"
        title="Against the guidance"
        lead="What the published guidance for spoken, grounded assistants asks for, and whether the tour does it."
      >
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Practice</th>
                <th className="px-3 py-2 font-semibold">Here</th>
                <th className="px-3 py-2 font-semibold">Note</th>
                <th className="px-3 py-2 font-semibold">From</th>
              </tr>
            </thead>
            <tbody>
              {PRACTICES.map((p) => (
                <tr key={p.practice}>
                  <td className={`${cell} w-[34%]`}>{p.practice}</td>
                  <td className={cell}>
                    <Tag className={STATUS[p.status].className}>{STATUS[p.status].label}</Tag>
                  </td>
                  <td className={`${cell} text-stone-700`}>{p.note}</td>
                  <td className={cell}>
                    <a href={SOURCES[p.source].url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                      {SOURCES[p.source].label.split(' — ')[0]}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        id="guardrails"
        title="The guardrails this tour needs"
        lead="A rule in a prompt is a request; a limit in code is a fact. Anything that costs money or cannot be taken back belongs in code as well."
      >
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Rule</th>
                <th className="px-3 py-2 font-semibold">Lives in</th>
                <th className="px-3 py-2 font-semibold">Now</th>
                <th className="px-3 py-2 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {GUARDRAILS.map((g) => (
                <tr key={g.rule}>
                  <td className={`${cell} w-[36%]`}>{g.rule}</td>
                  <td className={cell}>{g.lives === 'both' ? 'prompt and code' : g.lives}</td>
                  <td className={cell}>
                    <Tag className={STATUS[g.have].className}>{STATUS[g.have].label}</Tag>
                  </td>
                  <td className={`${cell} text-stone-700`}>{g.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="tradeoffs" title="What the fixes cost">
        <dl className="grid gap-3 md:grid-cols-2">
          {TRADE_OFFS.map((t) => (
            <div key={t.title} className="rounded-xl border border-stone-200 bg-white p-4 text-sm">
              <dt className="font-medium">{t.title}</dt>
              <dd className="mt-1 text-stone-700">{t.text}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        id="drafts"
        title="Drafts to try"
        lead="The first three drafts are now in the tour. What is left is the voice prompt, a starting point only: the bench cannot test it, so it has to be heard."
      >
        <div className="flex flex-col gap-3">
          {[...BENCH_SUGGESTIONS, { name: 'Voice prompt (untested)', text: VOICE_DRAFT, replaces: undefined }].map((d) => (
            <details key={d.name} className="rounded-xl border border-stone-200 bg-white p-4">
              <summary className="cursor-pointer font-medium">
                {d.name}
                {d.replaces && <span className="ml-2 text-sm font-normal text-stone-500">replaces “{d.replaces}”</span>}
              </summary>
              <pre className="mt-3 whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-stone-800">{d.text}</pre>
            </details>
          ))}
        </div>
      </Section>

      <Section id="sources" title="Sources">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {Object.values(SOURCES).map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
