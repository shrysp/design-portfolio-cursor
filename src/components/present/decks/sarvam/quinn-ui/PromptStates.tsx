'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { PEOPLE } from './data';
import { Replay, ToolButton, ease } from './kit';
import PromptBar, { usePromptFlow, type Phase, type Plan } from './PromptBar';
import Table, { TableHeader } from './Table';
import { AppWindow, BarSlot, Stage, tableWidth } from './MasterTable';

// The state rail takes the panel's left edge; the window starts after it
const RAIL = 196;

const QUERY = 'Add funding data';
const FOUNDERS = PEOPLE.filter((p) => ['sambhav', 'adam', 'jonathan', 'dylan', 'julie'].includes(p.id));

const STEPS: { phase: Phase; label: string }[] = [
  { phase: 'idle', label: '01 IDLE' },
  { phase: 'suggest', label: '02 SUGGEST' },
  { phase: 'planning', label: '03 PLANNING' },
  { phase: 'confirm', label: '04 CONFIRM' },
  { phase: 'running', label: '05 RUNNING' },
];

const stepOf = (phase: Phase) => (phase === 'done' ? 4 : STEPS.findIndex((s) => s.phase === phase));

export type NotesProps = { active: number; jump: (step: number) => void };

/**
 * Q12: one prompt bar walking through every state it has. It plays on its own, in a loop; the
 * presenter can jump to any state from the rail or the notes, approve early with the check, or
 * press stop, which really stops it and leaves it waiting.
 */
export function PromptStates({ notes }: { notes: (props: NotesProps) => ReactNode }) {
  const resolve = useCallback(
    (q: string): Plan =>
      /fund|raise|round/i.test(q)
        ? { kind: 'research', columns: ['Latest Funding', 'Amount', 'Date'], status: 'Researching funding data for {n} companies...' }
        : { kind: 'apply', apply: () => 'Filtered to 3 companies at Series B' },
    [],
  );
  const flow = usePromptFlow({ resolve, runMs: 6000 });
  const [auto, setAuto] = useState(true);
  const { phase, jump, submit, setHovered, draft } = flow;

  // The loop: wait, open the suggestions, move across them, pick one; the bar does the rest
  useEffect(() => {
    if (!auto) return;
    if (phase === 'idle') {
      const id = setTimeout(() => jump('suggest', ''), 1600);
      return () => clearTimeout(id);
    }
    if (phase === 'suggest') {
      const ids = [setTimeout(() => setHovered(0), 500), setTimeout(() => setHovered(1), 1200), setTimeout(() => submit(QUERY), 2000)];
      return () => ids.forEach(clearTimeout);
    }
  }, [auto, phase, jump, submit, setHovered]);

  useEffect(() => {
    if (phase === 'stopped' || draft) setAuto(false);
  }, [phase, draft]);

  const go = (i: number) => {
    setAuto(true);
    jump(STEPS[i].phase, QUERY);
  };
  const active = stepOf(phase);

  return (
    <>
      {notes({ active, jump: go })}
      <Stage width={1072} height={828}>
        <div data-live style={{ position: 'absolute', left: 36, top: 0, bottom: 0, width: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
          {STEPS.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => go(i)}
              style={{
                position: 'relative',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                padding: '12px 0 12px 22px',
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 15,
                letterSpacing: '0.1em',
                color: active === i ? '#4250D5' : '#666666',
                cursor: 'pointer',
                transition: 'color 200ms',
              }}
            >
              {active === i && (
                <motion.span layoutId="prompt-step" transition={{ duration: 0.35, ease }} style={{ position: 'absolute', left: 0, top: 13, bottom: 13, width: 4, borderRadius: 2, background: '#4250D5' }} />
              )}
              {s.label}
            </button>
          ))}
          <span style={{ marginTop: 18, paddingLeft: 22, fontFamily: 'var(--font-geist-mono), monospace', fontSize: 12, letterSpacing: '0.08em', color: phase === 'stopped' ? '#A5460F' : '#999999' }}>
            {phase === 'stopped' || !auto ? 'PAUSED' : 'PLAYING'}
          </span>
        </div>
        <AppWindow left={RAIL} dim>
          <TableHeader
            title="Founders in SF"
            left={
              <>
                <ToolButton icon="sliders">Filters</ToolButton>
                <ToolButton icon="sortLines">Sort</ToolButton>
                <ToolButton icon="grid">Group by</ToolButton>
              </>
            }
          />
          <Table rows={FOUNDERS} width={tableWidth(1072, RAIL)} columns={['person', 'strength', 'activity', 'role']} />
        </AppWindow>
        <BarSlot left={RAIL}>
          <PromptBar flow={flow} width={574} count={FOUNDERS.length} />
        </BarSlot>
        <Replay
          onClick={() => {
            setAuto(true);
            flow.reset();
          }}
        />
      </Stage>
    </>
  );
}
