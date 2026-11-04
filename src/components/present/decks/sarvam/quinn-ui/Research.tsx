'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { PEOPLE, type Person } from './data';
import { C, Icon, Marker, Replay, ToolButton, UI, ease } from './kit';
import PromptBar, { usePromptFlow, type Plan } from './PromptBar';
import Table, { TableHeader, type ColumnKey, type ExtraColumn } from './Table';
import { AppWindow, BarSlot, Stage, tableWidth } from './MasterTable';
import { typing, useScript } from './hooks';

/**
 * Q14: a saved group that keeps researching itself. Asking for funding data shows the plan, counts
 * down five seconds, then adds three columns and fills them person by person, and the group says
 * it was updated just now.
 */

const GROUP = PEOPLE.filter((p) => ['sambhav', 'adam', 'jonathan', 'dylan', 'julie'].includes(p.id));
const QUERY = 'Add funding data';
const RUN_MS = 6000;

const BASE: ColumnKey[] = ['person', 'star', 'strength', 'activity', 'role'];
const WITH_FUNDING: ColumnKey[] = ['person', 'strength', 'role'];

function Pending() {
  const reduce = useReducedMotion();
  return (
    <motion.span
      style={{ display: 'block', height: 9, width: '70%', borderRadius: 4, background: 'linear-gradient(90deg, #EEF2F6 0%, #DCE6F5 50%, #EEF2F6 100%)', backgroundSize: '200% 100%' }}
      animate={reduce ? undefined : { backgroundPositionX: ['100%', '-100%'] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
    />
  );
}

function Filled({ children, muted }: { children: string; muted?: boolean }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 4, backgroundColor: 'rgba(209,233,255,0.9)' }}
      animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(209,233,255,0)' }}
      transition={{ duration: 0.5, ease, backgroundColor: { duration: 1.2 } }}
      style={{ display: 'inline-block', padding: '1px 3px', marginLeft: -3, borderRadius: 3, fontSize: 9.6, lineHeight: '14.4px', fontWeight: muted ? 400 : 500, color: muted ? '#98A2B3' : C.ink, whiteSpace: 'nowrap' }}
    >
      {children}
    </motion.span>
  );
}

export function Research() {
  const [state, setState] = useState<'before' | 'running' | 'after'>('before');
  const [filled, setFilled] = useState(0);
  const [only, setOnly] = useState<string | null>(null);
  const [run, setRun] = useState(1);
  const [spot, setSpot] = useState<number | null>(null);

  const resolve = useCallback(
    (q: string): Plan => {
      if (/fund|raise|round/i.test(q)) return { kind: 'research', columns: ['Latest Funding', 'Amount', 'Date'], status: 'Researching funding data for {n} companies...' };
      const stage = /seed/i.test(q) ? 'Seed' : /ipo|public/i.test(q) ? 'IPO' : null;
      if (stage)
        return state === 'after'
          ? { kind: 'apply', apply: () => (setOnly(stage), `Showing ${GROUP.filter((p) => p.funding?.round === stage).length} at ${stage}`) }
          : { kind: 'unknown', hint: 'Add funding data first, then filter by stage' };
      return { kind: 'unknown', hint: 'Try “Add funding data”' };
    },
    [state],
  );
  const flow = usePromptFlow({
    resolve,
    runMs: RUN_MS,
    onRun: () => {
      setState('running');
      setFilled(0);
    },
    onFinish: () => setState('after'),
  });

  // Fill the new cells one at a time across the run, row by row
  const cells = GROUP.length * 3;
  useEffect(() => {
    if (state !== 'running') return;
    const id = setInterval(() => setFilled((f) => Math.min(cells, f + 1)), (RUN_MS * 0.85) / cells);
    return () => clearInterval(id);
  }, [state, cells]);

  useScript([[1400, () => flow.focus()], ...typing(QUERY, 1900, flow.setDraft, 70), [1900 + QUERY.length * 70 + 450, () => flow.submit(QUERY)]], run);

  const replay = () => {
    flow.reset();
    setState('before');
    setFilled(0);
    setOnly(null);
    setRun((r) => r + 1);
  };

  const shown = (row: number, col: number) => state === 'after' || row * 3 + col < filled;
  const extra: ExtraColumn[] = useMemo(() => {
    if (state === 'before') return [];
    const at = (p: Person) => GROUP.findIndex((g) => g.id === p.id);
    const value = (p: Person, col: number, text: (f: NonNullable<Person['funding']>) => string) =>
      !shown(at(p), col) ? <Pending /> : p.funding ? <Filled>{text(p.funding)}</Filled> : <Filled muted>{col === 0 ? 'Not public' : '—'}</Filled>;
    return [
      { key: 'round', label: 'Latest Funding', width: 140, cell: (p) => value(p, 0, (f) => f.round) },
      { key: 'amount', label: 'Amount', width: 96, cell: (p) => value(p, 1, (f) => f.amount) },
      { key: 'date', label: 'Date', width: 96, cell: (p) => value(p, 2, (f) => f.date) },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, filled]);

  const rows = only ? GROUP.filter((p) => p.funding?.round === only) : GROUP;
  const updated = state === 'running' ? 'Researching…' : state === 'after' ? 'Updated just now' : 'Updated 10m ago';

  return (
    <Stage width={1072} height={828}>
      <AppWindow>
          <TableHeader
            title="Founders in SF"
            left={
              <>
                <ToolButton icon="sliders">Filters</ToolButton>
                <ToolButton icon="sortLines">Sort</ToolButton>
                <ToolButton icon="grid">Group by</ToolButton>
                {only && (
                  <ToolButton icon="search" active onClick={() => setOnly(null)}>
                    {only} <Icon name="close" size={10} color={C.ink2} />
                  </ToolButton>
                )}
              </>
            }
            right={
              <>
                <motion.span
                  key={updated}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4.8, fontSize: 11.2, color: state === 'after' ? '#079455' : '#98A2B3', fontFamily: UI }}
                >
                  <motion.span animate={state === 'running' ? { rotate: 360 } : { rotate: 0 }} transition={state === 'running' ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }} style={{ display: 'inline-flex' }}>
                    <Icon name="refresh" size={12} />
                  </motion.span>
                  {updated}
                </motion.span>
                <ToolButton icon="columns">Edit Columns</ToolButton>
              </>
            }
          />
          <Table rows={rows} columns={state === 'before' ? BASE : WITH_FUNDING} extra={extra} width={tableWidth(1072)} />
      </AppWindow>
      <BarSlot>
        <PromptBar flow={flow} width={574} count={GROUP.length} placeholder="Ask this group anything..." suggestions={['Add funding data', 'Filter to Seed stage']} emphasis={spot === 2} />
      </BarSlot>
      <Marker n={1} x={705} y={138} active={spot === 1} onClick={() => setSpot((s) => (s === 1 ? null : 1))} />
      <Marker n={2} x={215} y={727} active={spot === 2} onClick={() => setSpot((s) => (s === 2 ? null : 2))} />
      <Replay onClick={replay} />
    </Stage>
  );
}
