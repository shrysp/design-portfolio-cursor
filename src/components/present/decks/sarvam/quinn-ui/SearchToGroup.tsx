'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PEOPLE, type Person } from './data';
import { BLUE_FILL, C, ChannelIcon, Icon, Marker, Replay, ToolButton, UI, ease } from './kit';
import Table, { TableHeader } from './Table';
import { AppWindow, FootFade, Stage, tableWidth } from './MasterTable';
import { useScript } from './hooks';

/**
 * Q13: the filter menu and the table it narrows, side by side. Ticking a filter really narrows
 * the rows; the Filters badge counts what is ticked; and once there is a result worth keeping,
 * Save as a Group turns it into a group with its own name.
 */

type Option = { id: string; label: string; test: (p: Person) => boolean; icon?: ReactNode; children?: Option[] };
type Category = { id: string; label: string; icon: Parameters<typeof Icon>[0]['name']; options: Option[] };

const CATEGORIES: Category[] = [
  {
    id: 'strength',
    label: 'Strength',
    icon: 'strength',
    options: [
      { id: 'strong', label: 'Strong (75+)', test: (p) => p.strength >= 75 },
      { id: 'medium', label: 'Medium (50–74)', test: (p) => p.strength >= 50 && p.strength < 75 },
      { id: 'weak', label: 'Weak (under 50)', test: (p) => p.strength < 50 },
    ],
  },
  {
    id: 'role',
    label: 'Role',
    icon: 'briefcase',
    options: [
      { id: 'founders', label: 'Founders', test: (p) => p.kind === 'founder' },
      { id: 'investors', label: 'Investors', test: (p) => p.kind === 'investor' },
      { id: 'designers', label: 'Designers', test: (p) => p.kind === 'designer' },
    ],
  },
  {
    id: 'channels',
    label: 'Channels',
    icon: 'globe',
    options: [
      {
        id: 'linkedin',
        label: 'LinkedIn',
        test: (p) => p.channels.includes('linkedin'),
        children: [
          { id: 'connections', label: 'Connections', test: (p) => p.linkedin === 'connection' },
          { id: 'followers', label: 'Followers', test: (p) => p.linkedin === 'follower' },
        ],
      },
      { id: 'x', label: 'X', test: (p) => p.channels.includes('x') },
      { id: 'email', label: 'Email', test: (p) => p.channels.includes('gmail') },
      { id: 'messages', label: 'Messages', test: (p) => p.channels.includes('whatsapp') },
    ],
  },
  {
    id: 'last',
    label: 'Last Interaction',
    icon: 'hourglass',
    options: [
      { id: 'week', label: 'This week', test: (p) => p.last.days <= 7 },
      { id: 'month', label: 'This month', test: (p) => p.last.days <= 30 },
      { id: 'earlier', label: 'Earlier', test: (p) => p.last.days > 30 },
    ],
  },
  {
    id: 'location',
    label: 'Location',
    icon: 'location',
    options: [
      { id: 'sf', label: 'San Francisco', test: (p) => p.location === 'San Francisco' },
      { id: 'ny', label: 'New York', test: (p) => p.location === 'New York' },
      { id: 'berlin', label: 'Berlin', test: (p) => p.location === 'Berlin' },
    ],
  },
];

/** The leaves a person can be tested against, keyed by id, with the category each belongs to */
const LEAVES = new Map<string, { option: Option; category: string }>();
for (const c of CATEGORIES)
  for (const o of c.options) {
    if (o.children) for (const child of o.children) LEAVES.set(child.id, { option: child, category: c.id });
    else LEAVES.set(o.id, { option: o, category: c.id });
  }

/** Ticks in one category widen the result; ticks across categories narrow it */
function apply(checked: Set<string>) {
  const groups = new Map<string, Option[]>();
  for (const id of checked) {
    const leaf = LEAVES.get(id);
    if (leaf) groups.set(leaf.category, [...(groups.get(leaf.category) ?? []), leaf.option]);
  }
  return PEOPLE.filter((p) => [...groups.values()].every((opts) => opts.some((o) => o.test(p))));
}

/**
 * A checkbox: the same box ticked or not, with the same soft shadow and 1px edge. Ticked, it fills
 * blue, its edge turns blue, and a white bold tick sits inside, clipped to the box.
 */
function Box({ on, partial }: { on: boolean; partial?: boolean }) {
  const lit = on || partial;
  return (
    <span
      style={{
        width: 16,
        height: 16,
        flexShrink: 0,
        borderRadius: 4,
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: lit ? C.blue : '#FFFFFF',
        boxShadow: `rgba(0,0,0,0.07) 0px 1.6px 1.6px -0.8px, ${lit ? C.blue : '#D0D5DD'} 0px 0px 0px 1px`,
        transition: 'background 140ms, box-shadow 140ms',
      }}
    >
      {on ? <Icon name="check" size={11} color="#FFFFFF" /> : partial ? <span style={{ width: 8, height: 2, background: '#FFFFFF', borderRadius: 1 }} /> : null}
    </span>
  );
}

function Row({ label, on, partial, onClick, indent, open, onToggleOpen, icon }: { label: string; on: boolean; partial?: boolean; onClick: () => void; indent?: boolean; open?: boolean; onToggleOpen?: () => void; icon?: ReactNode }) {
  return (
    <div
      data-live
      role="button"
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 12, height: 32, padding: indent ? '0 12px 0 32px' : '0 12px', borderRadius: 6, background: indent ? 'transparent' : '#F9FAFB', cursor: 'pointer', fontSize: 14, color: indent ? '#475467' : '#344054' }}
    >
      <Box on={on} partial={partial} />
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {onToggleOpen && (
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleOpen();
          }}
          style={{ color: '#475467', display: 'flex' }}
        >
          <Icon name={open ? 'chevronUp' : 'chevron'} size={16} />
        </span>
      )}
    </div>
  );
}

const OPTION_ICON: Record<string, ReactNode> = {
  linkedin: <ChannelIcon via="linkedin" />,
  x: <Icon name="x" size={16} />,
  email: <ChannelIcon via="gmail" />,
  messages: <Icon name="messages" size={16} color="#34C759" />,
};

const nameFor = (checked: Set<string>) => {
  const labels = [...LEAVES.keys()].filter((id) => checked.has(id)).map((id) => LEAVES.get(id)!.option.label.replace(/ \(.*\)$/, ''));
  if (!labels.length) return 'Everyone';
  return labels.slice(0, 2).join(' · ') + (labels.length > 2 ? ` +${labels.length - 2}` : '');
};

// Where the Save as a Group marker sits, beside the button
const SAVE_MARK: [number, number] = [581, 138];

export function SearchToGroup({ captions }: { captions: [ReactNode, ReactNode] }) {
  const [category, setCategory] = useState('channels');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(true);
  const [saved, setSaved] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);
  const [spot, setSpot] = useState<number | null>(null);
  const [run, setRun] = useState(1);

  const rows = useMemo(() => apply(checked), [checked]);
  const current = CATEGORIES.find((c) => c.id === category)!;

  const set = (ids: string[], on: boolean) => {
    setSaved(null);
    setChecked((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };
  const toggle = (id: string) => set([id], !checked.has(id));

  const save = () => {
    if (!checked.size) return;
    setNudge(false);
    setSaved(nameFor(checked));
  };

  useScript(
    [
      [1100, () => set(['connections'], true)],
      [2200, () => setCategory('strength')],
      [2900, () => set(['strong'], true)],
      [4000, () => setNudge(true)],
      [5200, () => save()],
    ],
    run,
  );

  const replay = () => {
    setChecked(new Set());
    setSaved(null);
    setNudge(false);
    setCategory('channels');
    setOpen(true);
    setRun((r) => r + 1);
  };

  return (
    <div style={{ display: 'flex', gap: 32, flex: 1 }}>
      <div style={{ width: 660, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Stage width={660} height={602}>
          <div style={{ position: 'absolute', left: 40, top: 52 }}>
            <div style={{ display: 'flex', gap: 12, fontFamily: UI, zoom: 1.25 }}>
              <ToolButton icon="sliders" active badge={checked.size || undefined}>
                Filters
              </ToolButton>
              <ToolButton icon="sortLines">Sort</ToolButton>
              <ToolButton icon="grid">Group by</ToolButton>
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 40,
              top: 98,
              width: 580,
              height: 450,
              display: 'flex',
              borderRadius: 8,
              background: '#FFFFFF',
              boxShadow: 'rgba(16,24,40,0.08) 0px 12px 16px -4px, rgba(16,24,40,0.03) 0px 4px 6px -2px, #EAECF0 0px 0px 0px 1px',
              fontFamily: UI,
              overflow: 'hidden',
            }}
          >
            <div style={{ width: 290, padding: 12, borderRight: '1px solid #EAECF0', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {CATEGORIES.map((c) => {
                const count = [...checked].filter((id) => LEAVES.get(id)?.category === c.id).length;
                return (
                  <div
                    key={c.id}
                    data-live
                    role="button"
                    onClick={() => setCategory(c.id)}
                    style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, height: 32, padding: '0 10px', borderRadius: 6, cursor: 'pointer', fontSize: 14, color: '#344054' }}
                  >
                    {category === c.id && <motion.span layoutId="filter-cat" transition={{ duration: 0.3, ease }} style={{ position: 'absolute', inset: 0, borderRadius: 6, background: '#F2F4F7', outline: '1px solid #EAECF0' }} />}
                    <span style={{ position: 'relative', display: 'flex', color: '#475467' }}>
                      <Icon name={c.icon} size={15} />
                    </span>
                    <span style={{ position: 'relative', flex: 1 }}>{c.label}</span>
                    {count > 0 && <span style={{ position: 'relative', fontSize: 11, color: C.blue }}>{count}</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={category} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {current.options.map((o) => {
                    if (!o.children)
                      return <Row key={o.id} label={o.label} on={checked.has(o.id)} onClick={() => toggle(o.id)} icon={OPTION_ICON[o.id]} />;
                    const kids = o.children.map((k) => k.id);
                    const all = kids.every((k) => checked.has(k));
                    const some = kids.some((k) => checked.has(k));
                    return (
                      <div key={o.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, background: '#F9FAFB', borderRadius: 6 }}>
                        <Row label={o.label} on={all} partial={!all && some} onClick={() => set(kids, !all)} icon={OPTION_ICON[o.id]} open={open} onToggleOpen={() => setOpen((v) => !v)} />
                        {open && o.children.map((k) => <Row key={k.id} indent label={k.label} on={checked.has(k.id)} onClick={() => toggle(k.id)} />)}
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <Marker n={1} x={16} y={50} active={spot === 1} onClick={() => setSpot((s) => (s === 1 ? null : 1))} />
        </Stage>
        {captions[0]}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Stage width={972} height={602}>
          <AppWindow>
            <TableHeader
              title={
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={saved ?? 'all'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease }} style={{ display: 'inline-block' }}>
                    {saved ?? 'Relationships'}
                  </motion.span>
                </AnimatePresence>
              }
              groups={saved ? 'Groups · 1' : 'Groups'}
              left={
                <>
                  <ToolButton icon="sliders" active={checked.size > 0} badge={checked.size || undefined}>
                    Filters
                  </ToolButton>
                  <ToolButton icon="sortLines">Sort</ToolButton>
                  <ToolButton icon="grid">Group by</ToolButton>
                  {checked.size > 0 && <ToolButton onClick={replay}>Reset</ToolButton>}
                </>
              }
              right={
                <>
                  <AnimatePresence>
                    {checked.size > 0 && (
                      <motion.button
                        type="button"
                        onClick={save}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: nudge ? [1, 1.06, 1] : 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.35, ease }}
                        style={{ ...BLUE_FILL, height: 25.6, display: 'inline-flex', alignItems: 'center', gap: 4.8, padding: '0 11px', borderRadius: 13, border: 'none', color: '#fff', fontFamily: UI, fontSize: 11.2, fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Icon name={saved ? 'check' : 'table'} size={12} />
                        {saved ? 'Saved to Groups' : 'Save as a Group'}
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <ToolButton icon="columns">Edit Columns</ToolButton>
                </>
              }
            />
            <div style={{ position: 'relative' }}>
              <Table rows={rows} columns={['person', 'star', 'strength', 'activity', 'role']} width={tableWidth(972)} height={300} />
              {!rows.length && <div style={{ position: 'absolute', top: 90, width: '100%', textAlign: 'center', fontSize: 12, color: C.ink2 }}>Nobody matches every filter. Untick one to widen it.</div>}
            </div>
          </AppWindow>
          <FootFade />
          {checked.size > 0 && <Marker n={2} x={SAVE_MARK[0]} y={SAVE_MARK[1]} active={spot === 2} onClick={() => setSpot((s) => (s === 2 ? null : 2))} />}
          <Replay onClick={replay} />
        </Stage>
        {captions[1]}
      </div>
    </div>
  );
}
