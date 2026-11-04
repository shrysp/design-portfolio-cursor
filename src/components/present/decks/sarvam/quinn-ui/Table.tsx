'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { type Person } from './data';
import { Avatar, C, ChannelIcon, Icon, Ring, UI, ease } from './kit';

/**
 * Quinn's relationships table, the screen everything else builds on. Each row leads with a person;
 * the columns after it are what Quinn knows about them. Rows that leave or arrive animate into
 * place, so a filter reads as the table narrowing rather than being replaced.
 */

export type ColumnKey = 'person' | 'star' | 'strength' | 'activity' | 'role' | 'last' | 'channels';

/** A column added by research, filled in cell by cell */
export type ExtraColumn = { key: string; label: string; width: number; cell: (p: Person) => ReactNode };

const WIDTH: Record<ColumnKey, number> = { person: 179.2, star: 38.4, strength: 96, activity: 192, role: 160, last: 160, channels: 128 };

const HEAD: Record<ColumnKey, { label: string; icon?: Parameters<typeof Icon>[0]['name']; trail?: 'sort' | 'filter' }> = {
  person: { label: 'Person', icon: 'person', trail: 'sort' },
  star: { label: '' },
  strength: { label: 'Strength', trail: 'sort' },
  activity: { label: 'Recent Activity', icon: 'bolt' },
  role: { label: 'Role', icon: 'briefcase', trail: 'filter' },
  last: { label: 'Last Interaction', icon: 'hourglass', trail: 'sort' },
  channels: { label: 'Channels', icon: 'globe', trail: 'filter' },
};

export const ROW_H = 51.2;
export const HEAD_H = 38.4;

const clamp = (lines: number): CSSProperties => ({ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: lines, overflow: 'hidden' });

const CHECK: CSSProperties = {
  width: 11.2,
  height: 11.2,
  flexShrink: 0,
  borderRadius: 3.2,
  backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
  boxShadow: 'rgba(0,0,0,0.07) 0px 1.6px 1.6px -0.8px, rgba(0,0,0,0.12) 0px 3.2px 3.2px -1.6px, #DCDFEA 0px 0px 0px 0.8px',
};

// A starred person's star: filled, in yellow. Unstarred, it is only an outline
const STARRED = '#FDB022';

function Cell({ col, p, index, starred, onStar }: { col: ColumnKey; p: Person; index: number; starred: boolean; onStar: () => void }) {
  switch (col) {
    case 'person':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9.6, padding: '0 12.8px', minWidth: 0 }}>
          <span style={CHECK} />
          <Avatar id={p.id} />
          <span style={{ fontSize: 11.2, lineHeight: '19.2px', color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
        </div>
      );
    case 'star':
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            aria-pressed={starred}
            aria-label={starred ? `Unstar ${p.name}` : `Star ${p.name}`}
            onClick={onStar}
            style={{ display: 'flex', padding: 3, border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <Icon name="star" size={12.8} weight={starred ? 'fill' : 'regular'} color={starred ? STARRED : C.ink2} />
          </button>
        </div>
      );
    case 'strength':
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Ring value={p.strength} delay={0.25 + index * 0.05} />
        </div>
      );
    case 'activity':
      return <div style={{ padding: '0 12.8px', fontSize: 9.6, lineHeight: '16.8px', color: C.ink, ...clamp(2) }}>{p.activity}</div>;
    case 'role':
      return (
        <div style={{ padding: '0 9.6px', display: 'flex', flexDirection: 'column', gap: 3.2, minWidth: 0 }}>
          <span style={{ fontSize: 9.6, lineHeight: '14.4px', fontWeight: 500, color: C.ink, ...clamp(1) }}>{p.company}</span>
          <span style={{ fontSize: 9.6, lineHeight: '14.4px', color: C.ink2, ...clamp(1) }}>{p.role}</span>
        </div>
      );
    case 'last':
      return (
        <div style={{ padding: '0 9.6px', display: 'flex', flexDirection: 'column', gap: 3.2, minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4.8, minWidth: 0 }}>
            <ChannelIcon via={p.last.via} size={12.8} />
            <span style={{ fontSize: 9.6, lineHeight: '14.4px', fontWeight: 500, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.last.subject}</span>
          </span>
          <span style={{ fontSize: 9.6, lineHeight: '14.4px', color: C.ink2 }}>{p.last.when}</span>
        </div>
      );
    case 'channels':
      return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 3.2 }}>
          {p.channels.map((c) => (
            <ChannelIcon key={c} via={c} />
          ))}
        </div>
      );
  }
}

function HeadCell({ col }: { col: ColumnKey }) {
  const h = HEAD[col];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6.4, padding: '0 12.8px', color: C.blue, fontSize: 11.2, fontWeight: 500, minWidth: 0 }}>
      {col === 'person' && <span style={CHECK} />}
      {h.icon && <Icon name={h.icon} size={12.8} />}
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.label}</span>
      {h.trail && <Icon name={h.trail === 'sort' ? 'sort' : 'filter'} size={12.8} />}
    </div>
  );
}

export default function Table({
  rows,
  columns = ['person', 'star', 'strength', 'activity', 'role', 'last', 'channels'],
  extra = [],
  width,
  height,
  offsetX = 0,
  spotlight,
  onRowHover,
  hovered,
  footer,
}: {
  rows: Person[];
  columns?: ColumnKey[];
  extra?: ExtraColumn[];
  /** The visible width; wider tables are clipped and slide by offsetX */
  width: number;
  height?: number;
  offsetX?: number;
  /** Dim everything but this column, to point at it */
  spotlight?: ColumnKey | null;
  hovered?: string | null;
  onRowHover?: (id: string | null) => void;
  footer?: ReactNode;
}) {
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const star = (id: string) =>
    setStarred((now) => {
      const next = new Set(now);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const widths = [...columns.map((c) => WIDTH[c]), ...extra.map((e) => e.width)];
  const template = widths.map((w, i) => (i === widths.length - 1 ? `minmax(${w}px, 1fr)` : `${w}px`)).join(' ');
  const total = columns.reduce((s, c) => s + WIDTH[c], 0) + extra.reduce((s, e) => s + e.width, 0);
  const dim = (col: string) => (spotlight && spotlight !== col ? 0.28 : 1);

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden', borderRadius: 8, fontFamily: UI }}>
      <motion.div animate={{ x: -offsetX }} transition={{ duration: 0.8, ease }} style={{ width: Math.max(total, width) }}>
        <div style={{ display: 'grid', gridTemplateColumns: template, height: HEAD_H, position: 'relative', zIndex: 2 }}>
          {columns.map((c) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', background: C.blueWash, borderBottom: `0.8px solid ${C.blueLine}`, borderRight: `0.8px solid ${C.blueLine}`, opacity: dim(c), transition: 'opacity 240ms' }}>
              <HeadCell col={c} />
            </div>
          ))}
          <AnimatePresence initial={false}>
            {extra.map((e, i) => (
              <motion.div
                key={e.key}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.35, ease }}
                style={{ display: 'flex', alignItems: 'center', gap: 6.4, padding: '0 12.8px', background: '#EEF4FF', borderBottom: `0.8px solid ${C.blueLine}`, borderRight: `0.8px solid ${C.blueLine}`, color: C.blue, fontSize: 11.2, fontWeight: 500 }}
              >
                <Icon name="sparkleColumns" size={12.8} />
                {e.label}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((p, index) => (
            <motion.div
              key={p.id}
              data-live
              layout="position"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.18 } }}
              transition={{ duration: 0.4, ease }}
              onMouseEnter={() => onRowHover?.(p.id)}
              onMouseLeave={() => onRowHover?.(null)}
              style={{
                display: 'grid',
                gridTemplateColumns: template,
                height: ROW_H,
                alignItems: 'center',
                borderBottom: `0.8px solid ${C.blueLine}`,
                background: hovered === p.id ? '#F5F9FF' : '#FFFFFF',
                transition: 'background 140ms',
              }}
            >
              {columns.map((c) => (
                <div key={c} style={{ opacity: dim(c), transition: 'opacity 240ms', minWidth: 0 }}>
                  <Cell col={c} p={p} index={index} starred={starred.has(p.id)} onStar={() => star(p.id)} />
                </div>
              ))}
              {extra.map((e) => (
                <div key={e.key} style={{ padding: '0 12.8px', minWidth: 0 }}>
                  {e.cell(p)}
                </div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {footer}
    </div>
  );
}

/** The header above a table: its title, the Groups menu, and the toolbar */
export function TableHeader({ title, right, left, groups = 'Groups' }: { title: ReactNode; right?: ReactNode; left?: ReactNode; groups?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 25.6, fontFamily: UI }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9.6, height: 45 }}>
        <span style={{ fontSize: 22.4, lineHeight: '28.8px', letterSpacing: '0.02em', fontWeight: 700, color: C.ink }}>{title}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3.2, height: 25.6, padding: '0 9.6px', borderRadius: 6.4, background: '#fff', outline: `0.8px solid ${C.line}`, outlineOffset: -0.8, fontSize: 11.2, color: C.ink2 }}>
          {groups}
          <Icon name="chevron" size={11} />
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9.6 }}>{left}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9.6 }}>{right}</div>
      </div>
    </div>
  );
}
