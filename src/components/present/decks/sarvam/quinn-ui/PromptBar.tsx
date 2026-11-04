'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BLUE_FILL, Icon, UI, ease } from './kit';

/**
 * Quinn's prompt bar, and the flow it narrates. Someone asks for something in plain words; the bar
 * says it is planning, shows what it is about to do with a five-second countdown to stop it, then
 * shows progress and time left while it works. Stop is one click away at every step.
 */

export type Phase = 'idle' | 'suggest' | 'planning' | 'confirm' | 'running' | 'done' | 'stopped';

/** What a request turns into: research that adds columns, or a change applied straight away */
export type Plan =
  | { kind: 'research'; columns: string[]; status: string }
  | { kind: 'apply'; apply: () => string }
  | { kind: 'unknown'; hint: string };

export const PLANNING_MS = 1400;
export const CONFIRM_MS = 5000;
const DONE_MS = 2200;

type Options = {
  resolve: (query: string) => Plan;
  /** How long the research runs in the demo, standing in for the real minutes */
  runMs?: number;
  /** Called the moment research starts and when it finishes, so the table can fill in */
  onRun?: (plan: Extract<Plan, { kind: 'research' }>) => void;
  onFinish?: (plan: Extract<Plan, { kind: 'research' }>) => void;
};

export function usePromptFlow({ resolve, runMs = 6000, onRun, onFinish }: Options) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [message, setMessage] = useState('');
  const [hovered, setHovered] = useState(-1);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);

  const callbacks = useRef({ onRun, onFinish, resolve });
  useEffect(() => {
    callbacks.current = { onRun, onFinish, resolve };
  });

  const enter = useCallback((next: Phase) => {
    setPhase(next);
    const t = performance.now();
    setStartedAt(t);
    setNow(t);
  }, []);

  // Each timed step hands over to the next one by itself
  useEffect(() => {
    if (phase === 'planning') {
      const id = setTimeout(() => {
        if (!plan || plan.kind === 'unknown') {
          setMessage(plan?.kind === 'unknown' ? plan.hint : '');
          enter('done');
        } else if (plan.kind === 'apply') {
          setMessage(plan.apply());
          enter('done');
        } else enter('confirm');
      }, PLANNING_MS);
      return () => clearTimeout(id);
    }
    if (phase === 'confirm') {
      const id = setTimeout(() => enter('running'), CONFIRM_MS);
      return () => clearTimeout(id);
    }
    if (phase === 'running' && plan?.kind === 'research') {
      callbacks.current.onRun?.(plan);
      const id = setTimeout(() => {
        callbacks.current.onFinish?.(plan);
        setMessage(`Added ${plan.columns.length} columns`);
        enter('done');
      }, runMs);
      return () => clearTimeout(id);
    }
    if (phase === 'done' || phase === 'stopped') {
      const id = setTimeout(() => {
        setDraft('');
        setQuery('');
        enter('idle');
      }, DONE_MS);
      return () => clearTimeout(id);
    }
  }, [phase, plan, runMs, enter]);

  // A clock for the countdown and the time left, only while something is counting
  useEffect(() => {
    if (phase !== 'confirm' && phase !== 'running') return;
    const id = setInterval(() => setNow(performance.now()), 200);
    return () => clearInterval(id);
  }, [phase]);

  const submit = useCallback(
    (text: string) => {
      const q = text.trim();
      if (!q) return;
      setQuery(q);
      setDraft('');
      setHovered(-1);
      setPlan(callbacks.current.resolve(q));
      enter('planning');
    },
    [enter],
  );

  const stop = useCallback(() => {
    setMessage('Stopped. Nothing was changed.');
    enter('stopped');
  }, [enter]);

  const reset = useCallback(() => {
    setDraft('');
    setQuery('');
    setHovered(-1);
    enter('idle');
  }, [enter]);

  /** Put the bar straight into one of its states, for the presenter to step through */
  const jump = useCallback(
    (next: Phase, q: string) => {
      setDraft('');
      setHovered(-1);
      if (next === 'idle' || next === 'suggest') {
        setQuery('');
        enter(next);
        return;
      }
      setQuery(q);
      setPlan(callbacks.current.resolve(q));
      enter(next);
    },
    [enter],
  );

  const elapsed = Math.max(0, now - startedAt);
  return {
    phase,
    query,
    draft,
    setDraft,
    plan,
    message,
    hovered,
    setHovered,
    elapsed,
    runMs,
    focus: () => phase === 'idle' && enter('suggest'),
    blur: () => phase === 'suggest' && enter('idle'),
    submit,
    stop,
    reset,
    jump,
    confirmNow: () => phase === 'confirm' && enter('running'),
  };
}

export type Flow = ReturnType<typeof usePromptFlow>;

const SURFACE: CSSProperties = {
  backgroundImage: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
};

const shadow = (ring: string) =>
  `#FFFFFF 0px 4px 1px inset, rgba(25,60,184,0.07) 0px -4px 0px inset, ${ring}, rgba(25,60,184,0.07) 0px 4px 4px -2px, rgba(25,60,184,0.07) 0px 6px 6px -3px, rgba(25,60,184,0.07) 0px 12px 12px -6px`;

const CHIP: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 6px',
  borderRadius: 4,
  backgroundImage: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
  boxShadow: 'rgba(15,23,43,0.12) 0px 0px 0px 1px, rgba(15,23,43,0.07) 0px 2px 2px -1px, #E2E8F0 0px 1px 0px',
  fontSize: 14,
  lineHeight: '18px',
  color: '#314158',
};

const ROUND: CSSProperties = {
  borderRadius: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  border: 'none',
  padding: 0,
  cursor: 'pointer',
};

const SOFT_ROUND: CSSProperties = {
  ...ROUND,
  backgroundImage: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
  boxShadow: '#FFFFFF 0px 4px 1px inset, rgba(25,60,184,0.07) 0px -4px 0px inset, rgba(21,93,252,0.2) 0px 0px 0px 1px, #8EC5FF 0px 1px 0px, rgba(25,65,133,0.16) 0px 6px 6px -3px',
  color: '#155DFC',
};

function StatusChip({ icon }: { icon: 'blueprint' | 'brain' | 'check' }) {
  return (
    <span style={{ ...BLUE_FILL, display: 'inline-flex', padding: '3px 5px', borderRadius: 32, color: '#fff' }}>
      <Icon name={icon} size={12} />
    </span>
  );
}

/** Text that a light sweeps across while the work is underway */
function Working({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      style={{
        fontSize: 14,
        lineHeight: '16px',
        color: '#1D293D',
        backgroundImage: 'linear-gradient(90deg, #1D293D 0%, #1D293D 40%, #8EC5FF 50%, #1D293D 60%, #1D293D 100%)',
        backgroundSize: '250% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
      animate={reduce ? undefined : { backgroundPositionX: ['100%', '-50%'] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
    >
      {children}
    </motion.span>
  );
}

function Progress({ duration, from = 0 }: { duration: number; from?: number }) {
  return (
    <div style={{ height: 8, borderRadius: 12, background: '#E2E8F0', boxShadow: '#FFFFFF 0px 4px 1px inset, rgba(25,60,184,0.07) 0px -4px 0px inset', overflow: 'hidden' }}>
      <motion.div
        style={{ ...BLUE_FILL, height: 8, borderRadius: 32 }}
        initial={{ width: `${from * 100}%` }}
        animate={{ width: '100%' }}
        transition={{ duration: (duration / 1000) * (1 - from), ease: 'linear' }}
      />
    </div>
  );
}

function Section({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 6, ...style }}>{children}</div>;
}

const minutesLeft = (fraction: number) => {
  const left = Math.ceil((1 - fraction) * 3);
  return left >= 2 ? `${left} Minutes Remaining...` : left === 1 ? '1 Minute Remaining...' : 'Finishing up...';
};

export default function PromptBar({
  flow,
  width = 574,
  placeholder = 'Modify this table...',
  suggestions = ['Filter to Series B', 'Add funding data'],
  count = 47,
  emphasis,
}: {
  flow: Flow;
  width?: number;
  placeholder?: string;
  suggestions?: string[];
  /** How many rows the research covers, for the status line */
  count?: number;
  /** Draw the stronger focus ring even when idle, as the Paper states do for the step on show */
  emphasis?: boolean;
}) {
  const { phase, query, draft, plan, message, hovered, elapsed } = flow;
  const busy = phase === 'planning' || phase === 'confirm' || phase === 'running';
  const strong = emphasis || phase === 'confirm' || phase === 'suggest';
  const open = phase !== 'idle';
  const research = plan?.kind === 'research' ? plan : null;
  const seconds = Math.max(1, Math.ceil((CONFIRM_MS - elapsed) / 1000));
  const fraction = Math.min(1, elapsed / flow.runMs);

  let above: ReactNode = null;
  if (phase === 'suggest')
    above = (
      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }} onMouseLeave={() => flow.setHovered(-1)}>
        {suggestions.map((s, i) => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => flow.setHovered(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => flow.submit(s)}
            style={{
              textAlign: 'left',
              border: 'none',
              padding: '4px 8px',
              borderRadius: 4,
              fontFamily: UI,
              fontSize: 14,
              lineHeight: '20px',
              color: '#45556C',
              cursor: 'pointer',
              background: hovered === i ? '#FFFFFF' : 'transparent',
              boxShadow: hovered === i ? '#FFFFFF 0px 4px 1px inset, rgba(25,60,184,0.07) 0px -4px 0px inset, #F1F5F9 0px 0px 0px 1px' : 'none',
              transition: 'background 120ms, box-shadow 120ms',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    );
  else if (phase === 'planning')
    above = (
      <Section style={{ flexDirection: 'row', alignItems: 'center' }}>
        <StatusChip icon="blueprint" />
        <Working>Planning Next Steps...</Working>
      </Section>
    );
  else if (phase === 'confirm' && research)
    above = (
      <>
        <Section style={{ paddingTop: 8, paddingBottom: 16 }}>
          <span style={{ fontSize: 12, lineHeight: '16px', color: '#1D293D' }}>
            Starting Research in&nbsp;&nbsp;
            <motion.span key={seconds} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'inline-block', fontVariantNumeric: 'tabular-nums' }}>
              {seconds} {seconds === 1 ? 'Second' : 'Seconds'}
            </motion.span>
          </span>
          <Progress duration={CONFIRM_MS} />
        </Section>
        <Section>
          <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600, color: '#1D293D' }}>Adding following columns...</span>
        </Section>
        <Section style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 7 }}>
            {research.columns.map((c, i) => (
              <motion.span key={c} style={CHIP} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i, duration: 0.3, ease }}>
                {c}
              </motion.span>
            ))}
            <span style={{ ...CHIP, padding: 4 }}>
              <Icon name="plus" size={18} color="#000" />
            </span>
          </div>
          <button type="button" aria-label="Start now" onClick={flow.confirmNow} style={{ ...SOFT_ROUND, width: 42, height: 26, boxShadow: `${SOFT_ROUND.boxShadow}, #51A2FF 0px 0px 0px 2px` }}>
            <Icon name="check" size={16} color="#155DFC" />
          </button>
        </Section>
      </>
    );
  else if (phase === 'running' && research)
    above = (
      <>
        <Section style={{ gap: 8 }}>
          <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600, color: '#1D293D' }}>{minutesLeft(fraction)}</span>
          <Progress key="run" duration={flow.runMs} />
        </Section>
        <Section style={{ flexDirection: 'row', alignItems: 'center' }}>
          <StatusChip icon="brain" />
          <Working>{research.status.replace('{n}', String(count))}</Working>
        </Section>
      </>
    );
  else if ((phase === 'done' || phase === 'stopped') && message)
    above = (
      <Section style={{ flexDirection: 'row', alignItems: 'center' }}>
        {phase === 'done' && <StatusChip icon="check" />}
        <span style={{ fontSize: 14, lineHeight: '16px', color: phase === 'stopped' ? '#A5460F' : '#1D293D' }}>{message}</span>
      </Section>
    );

  return (
    <motion.div
      data-live
      layout
      transition={{ layout: { duration: 0.32, ease } }}
      style={{
        ...SURFACE,
        width,
        fontFamily: UI,
        borderRadius: above ? '12px 12px 28px 28px' : 28,
        boxShadow: shadow(strong ? 'rgba(21,93,252,0.7) 0px 0px 0px 4px' : 'rgba(21,93,252,0.2) 0px 0px 0px 2px'),
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {above && (
          <motion.div
            key={phase}
            layout="position"
            initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.28, ease }}
          >
            {above}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div layout="position" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px 10px 20px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', height: 36, minWidth: 0 }}>
          {busy ? (
            <span style={{ fontSize: 16, lineHeight: '26px', color: '#90A1B9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{query}</span>
          ) : (
            <input
              value={draft}
              onChange={(e) => {
                flow.setDraft(e.target.value);
                if (open && phase === 'suggest' && e.target.value) flow.setHovered(-1);
              }}
              onFocus={flow.focus}
              onBlur={flow.blur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') flow.submit(draft || (hovered >= 0 ? suggestions[hovered] : ''));
                if (e.key === 'Escape') (e.target as HTMLInputElement).blur();
              }}
              placeholder={phase === 'suggest' ? '' : placeholder}
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: UI, fontSize: 16, lineHeight: '26px', color: '#1D293D', caretColor: '#155DFC' }}
            />
          )}
        </div>
        <AnimatePresence initial={false}>
          {busy && (
            <motion.button
              key="stop"
              type="button"
              aria-label="Stop"
              onClick={flow.stop}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              whileTap={{ scale: 0.92 }}
              style={{ ...SOFT_ROUND, width: 34, height: 34 }}
            >
              <Icon name="stop" size={20} color="#155DFC" />
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button
          type="button"
          aria-label="Send"
          onClick={() => flow.submit(draft)}
          whileTap={{ scale: 0.92 }}
          style={{ ...ROUND, ...BLUE_FILL, width: 36, height: 36, color: '#fff', opacity: draft && !busy ? 1 : 0.3 }}
        >
          <Icon name="send" size={20} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
