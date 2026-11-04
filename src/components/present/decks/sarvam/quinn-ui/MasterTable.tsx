'use client';

import { useCallback, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PEOPLE, type Person } from './data';
import { C, Icon, Marker, QuinnLogo, Replay, ToolButton, UI, ease, Avatar } from './kit';
import PromptBar, { usePromptFlow, type Plan } from './PromptBar';
import Table, { TableHeader, type ColumnKey } from './Table';
import { typing, useScript } from './hooks';

/** The grey panel a screen sits in on a slide, as in the Paper file */
export function Stage({ width, height, children, style }: { width: number; height: number; children: ReactNode; style?: CSSProperties }) {
  return <div style={{ position: 'relative', width, height, flexShrink: 0, borderRadius: 28, background: '#F0F0F0', overflow: 'hidden', ...style }}>{children}</div>;
}

/** Quinn's window: white, softly lifted off the panel */
export function Window({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: 'absolute', borderRadius: 16, overflow: 'hidden', background: '#FFFFFF', boxShadow: 'rgba(30,32,51,0.12) 0px 20px 60px', fontFamily: UI, ...style }}>
      {children}
    </div>
  );
}

/*
 * Every Quinn screen on a slide is drawn the same way: a white window set INSET in from the panel's
 * edges, and the app inside it at ZOOM over the Paper file's sizes, so a table reads the same size on
 * every slide. The prompt bar sits outside the zoom, which keeps it at 0.8 of the table's scale, as
 * it is in the product.
 */
export const INSET = 28;
export const ZOOM = 1.25;
// The app's padding inside the window, in the app's own (unzoomed) pixels
const PAD = 20;

/** The width a table gets inside an AppWindow on a panel `panel` wide, starting `left` in */
export const tableWidth = (panel: number, left = INSET) => Math.floor((panel - left - INSET) / ZOOM - PAD * 2);

/** A Quinn window filling the panel bar its inset, with the app inside at the shared zoom */
export function AppWindow({ children, left = INSET, dim }: { children: ReactNode; left?: number; dim?: boolean }) {
  return (
    <Window style={{ left, top: INSET, right: INSET, bottom: INSET }}>
      <div style={{ zoom: ZOOM, padding: `16px ${PAD}px`, display: 'flex', flexDirection: 'column', gap: 20, opacity: dim ? 0.45 : 1 }}>{children}</div>
    </Window>
  );
}

/** Where the prompt bar sits: centred over the window, near its foot */
export function BarSlot({ children, left = INSET }: { children: ReactNode; left?: number }) {
  return <div style={{ position: 'absolute', left, right: INSET, bottom: INSET + 28, display: 'flex', justifyContent: 'center', zIndex: 5 }}>{children}</div>;
}

/** A soft fade at the foot of the window, so rows run under the prompt bar instead of colliding with it */
export function FootFade({ left = INSET }: { left?: number }) {
  return <div style={{ position: 'absolute', left, right: INSET, bottom: INSET, height: 150, borderRadius: '0 0 16px 16px', background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #FFFFFF 70%)', pointerEvents: 'none', zIndex: 4 }} />;
}

const STOP = new Set(['who', 'do', 'i', 'know', 'at', 'in', 'the', 'my', 'me', 'show', 'with', 'a', 'an', 'and', 'of', 'to', 'people', 'find', 'all', 'from', 'that', 'are']);

/**
 * A plain-language question, answered against the table: a handful of words Quinn understands,
 * and anything else matched against what the table says about each person.
 */
export function ask(query: string, people: Person[] = PEOPLE): Person[] {
  const q = query.toLowerCase();
  let rows = people;
  const has = (...words: string[]) => words.some((w) => q.includes(w));
  if (has('founder')) rows = rows.filter((p) => p.kind === 'founder' || /founder/i.test(p.role));
  if (has('investor', 'partner', 'vc')) rows = rows.filter((p) => p.kind === 'investor');
  if (has('designer')) rows = rows.filter((p) => p.kind === 'designer');
  if (has('strong', 'close')) rows = rows.filter((p) => p.strength >= 75);
  if (has('weak', 'losing touch', 'lost touch')) rows = rows.filter((p) => p.strength < 50);
  if (has('san francisco', ' sf', 'sf ')) rows = rows.filter((p) => p.location === 'San Francisco');
  if (has('new york', 'nyc')) rows = rows.filter((p) => p.location === 'New York');
  if (has('this week', 'today', 'recent')) rows = rows.filter((p) => p.last.days <= 7);
  if (has('this month')) rows = rows.filter((p) => p.last.days <= 30);
  if (rows !== people) return rows;
  const words = q.split(/[^a-z0-9$]+/).filter((w) => w.length > 2 && !STOP.has(w));
  if (!words.length) return people;
  return people.filter((p) => {
    const text = `${p.name} ${p.company} ${p.role} ${p.activity} ${p.location}`.toLowerCase();
    return words.some((w) => text.includes(w));
  });
}

const QUESTION = 'Founders in San Francisco';

/** Q11: the master table, with rows to hover, rings that draw in, and a prompt bar that answers */
export function MasterTableScreen() {
  const [rows, setRows] = useState<Person[]>(PEOPLE);
  const [answer, setAnswer] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [spot, setSpot] = useState<number | null>(null);
  const [run, setRun] = useState(1);

  const resolve = useCallback((query: string): Plan => {
    const found = ask(query);
    return {
      kind: 'apply',
      apply: () => {
        setRows(found);
        setAnswer(query);
        return found.length ? `Showing ${found.length} of ${PEOPLE.length} people` : 'Nobody matches that yet';
      },
    };
  }, []);
  const flow = usePromptFlow({ resolve });

  useScript([[2400, () => flow.focus()], ...typing(QUESTION, 2900, flow.setDraft, 60), [2900 + QUESTION.length * 60 + 500, () => flow.submit(QUESTION)]], run);

  const clear = () => {
    setRows(PEOPLE);
    setAnswer(null);
  };
  const replay = () => {
    clear();
    flow.reset();
    setRun((r) => r + 1);
  };

  const spotlight = spot === 1 ? 'person' : spot === 2 ? 'strength' : spot === 3 ? 'activity' : null;
  const toggle = (n: number) => setSpot((s) => (s === n ? null : n));

  return (
    <Stage width={1072} height={828}>
      <AppWindow>
        <TableHeader
          title="Relationships"
          left={
            <>
              <ToolButton icon="sliders">Filters</ToolButton>
              <ToolButton icon="sortLines">Sort</ToolButton>
              <ToolButton icon="grid">Group by</ToolButton>
              <AnimatePresence>
                {answer && (
                  <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease }}>
                    <ToolButton icon="search" active onClick={clear}>
                      {answer}
                      <Icon name="close" size={10} color={C.ink2} />
                    </ToolButton>
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          }
        />
        <div style={{ opacity: spot === 4 ? 0.35 : 1, transition: 'opacity 240ms' }}>
          <Table rows={rows} columns={COLUMNS} width={tableWidth(1072)} spotlight={spotlight} hovered={hovered} onRowHover={setHovered} />
        </div>
      </AppWindow>
      <FootFade />
      <BarSlot>
        <PromptBar flow={flow} width={574} placeholder="Modify or search in this table..." suggestions={['Founders in San Francisco', 'Strong ties I spoke to this month', 'Designers in New York']} emphasis={spot === 4} />
      </BarSlot>
      <Marker n={1} x={MARKS[0][0]} y={MARKS[0][1]} active={spot === 1} onClick={() => toggle(1)} />
      <Marker n={2} x={MARKS[1][0]} y={MARKS[1][1]} active={spot === 2} onClick={() => toggle(2)} />
      <Marker n={3} x={MARKS[2][0]} y={MARKS[2][1]} active={spot === 3} onClick={() => toggle(3)} />
      <Marker n={4} x={MARKS[3][0]} y={MARKS[3][1]} active={spot === 4} onClick={() => toggle(4)} />
      <Replay onClick={replay} />
    </Stage>
  );
}

const NAV: { label: string; icon: Parameters<typeof Icon>[0]['name']; count?: string; active?: boolean; more?: boolean }[] = [
  { label: 'Home', icon: 'home' },
  { label: 'Updates', icon: 'bell' },
  { label: 'Relationships', icon: 'addressBook', count: '1058', active: true },
  { label: 'Analytics', icon: 'chart' },
];
const COLLECTIONS: typeof NAV = [
  { label: 'Searches', icon: 'search', more: true },
  { label: 'Groups', icon: 'table', more: true },
  { label: 'Playbooks', icon: 'addressBook', more: true },
];

function NavItem({ item }: { item: (typeof NAV)[number] }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9.6,
        padding: 6.4,
        borderRadius: 4.8,
        background: item.active ? '#FFFFFF' : 'transparent',
        outline: item.active ? '0.8px solid #E2E8F0' : 'none',
        outlineOffset: -0.8,
        color: item.active ? '#314158' : '#45556C',
      }}
    >
      <Icon name={item.icon} size={12.8} />
      <span style={{ flex: 1, fontSize: 8.96, lineHeight: '11.52px', fontWeight: 500 }}>{item.label}</span>
      {item.count && <span style={{ fontSize: 7.68, color: '#62748E' }}>{item.count}</span>}
      {item.more && <Icon name="chevronRight" size={12.8} color="#62748E" />}
    </div>
  );
}

// The master table's columns: who, how strong, what they did lately, and where they are
const COLUMNS: ColumnKey[] = ['person', 'star', 'strength', 'activity', 'role'];
// Where the markers sit, on the panel: the person column, a strength ring, recent activity, the prompt bar
const MARKS: [number, number][] = [
  [19, 202],
  [291, 202],
  [411, 202],
  [215, 727],
];

const PLACEHOLDERS = ['Who do I know at Series A startups?', 'Founders I haven’t spoken to in a month', 'Designers in New York'];

/** Q01: the whole product in a browser, the table filling in and the prompt bar suggesting what to ask */
export function OpenerScreen() {
  const [placeholder, setPlaceholder] = useState('');
  const steps: [number, () => void][] = [];
  let at = 1800;
  for (const text of PLACEHOLDERS) {
    steps.push(...typing(text, at, setPlaceholder, 45));
    at += text.length * 45 + 2200;
    steps.push([at, () => setPlaceholder('')]);
    at += 400;
  }
  useScript(steps, 1);
  const flow = usePromptFlow({ resolve: () => ({ kind: 'unknown', hint: '' }) });

  return (
    <div style={{ position: 'relative', width: 1210, height: 824, borderRadius: 6.4, overflow: 'hidden', background: '#FFFFFF', fontFamily: UI, boxShadow: 'rgba(0,0,0,0.01) 0px 162px 65px, rgba(0,0,0,0.03) 0px 91px 54px, rgba(0,0,0,0.06) 0px 41px 41px, rgba(0,0,0,0.06) 0px 10px 22px' }}>
      <div style={{ height: 38, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', background: '#F7F7F7', borderBottom: '1px solid #E8E8E8' }}>
        <span style={{ display: 'flex', gap: 6.5 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <span key={c} style={{ width: 10, height: 10, borderRadius: 5, background: c }} />
          ))}
        </span>
        <span style={{ color: '#9A9A9A', display: 'flex', gap: 10, marginLeft: 18 }}>
          <Icon name="sidebar" size={15} />
          <Icon name="chevron" size={15} />
        </span>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <span style={{ width: 466, height: 22, borderRadius: 6, background: '#EDEDED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, color: '#555' }}>quinn.app</span>
        </div>
      </div>
      <div style={{ display: 'flex', height: 786 }}>
        <div style={{ width: 193, flexShrink: 0, background: '#FCFCFD', borderRight: `0.8px solid ${C.sidebarLine}`, padding: '0 12.8px', display: 'flex', flexDirection: 'column', gap: 12.8 }}>
          <div style={{ height: 51.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `0.8px solid ${C.sidebarLine}`, padding: '0 6.4px' }}>
            <QuinnLogo />
            <Icon name="sidebar" size={14} color="#314158" />
          </div>
          <div style={{ height: 22, borderRadius: 6, border: '1px solid #84CAFF', boxShadow: '0 0 0 2px #EFF8FF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px', fontSize: 7.7, color: '#90A1B9' }}>
            New Search
            <span style={{ color: '#84CAFF' }}>⌘ K</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6.4 }}>
            <span style={{ fontSize: 8.32, color: '#7D89B0', fontWeight: 500, padding: '0 6.4px' }}>Main</span>
            {NAV.map((n) => (
              <NavItem key={n.label} item={n} />
            ))}
            <span style={{ fontSize: 8.32, color: '#7D89B0', fontWeight: 500, padding: '6.4px 6.4px 0' }}>Collections</span>
            {COLLECTIONS.map((n) => (
              <NavItem key={n.label} item={n} />
            ))}
          </div>
          <div style={{ marginTop: 'auto', height: 51.2, display: 'flex', alignItems: 'center', gap: 8, borderTop: `0.8px solid ${C.sidebarLine}`, padding: '0 6.4px' }}>
            <Avatar id="alex" size={22} ring="#EBEBEB" />
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 7.7, fontWeight: 600, color: '#1D293D' }}>Alex</span>
              <span style={{ fontSize: 6.4, color: '#62748E' }}>Personal workspace</span>
            </span>
            <Icon name="chevron" size={12} color="#314158" />
          </div>
        </div>
        <div style={{ position: 'relative', flex: 1, padding: '19.2px 32px', display: 'flex', flexDirection: 'column', gap: 25.6 }}>
          <TableHeader
            title="Relationships"
            left={
              <>
                <ToolButton icon="sliders">Filters</ToolButton>
                <ToolButton icon="sortLines">Sort</ToolButton>
                <ToolButton icon="grid">Group by</ToolButton>
              </>
            }
          />
          <Table rows={PEOPLE} width={953} height={600} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 170, background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #FFFFFF 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: 32 + 953 / 2, bottom: 30, transform: 'translateX(-50%)' }}>
            <div style={{ zoom: 0.8 }}>
              <PromptBar flow={flow} width={574} placeholder={placeholder || 'Ask about your network...'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
