'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react';
import { Avatar, BLUE_FILL, Icon, Marker, Replay, UI, ease } from './kit';
import { AppWindow, Stage } from './MasterTable';
import { useScript } from './hooks';

/**
 * Q15: Quinn's home screen, where playbooks surface as today's updates. Each update names the
 * playbook it came from, the person, their Q-Score toward that playbook's goal, and one suggested
 * action. Taking the action clears the update and the next one arrives.
 */

type Update = { id: string; playbook: string; when: string; person: string; avatar: string; score: number; company: string; role: string; why: string; action: string; done: string };

const UPDATES: Update[] = [
  { id: 'kent', playbook: 'Potential SPC Member', when: '5 days ago', person: 'Kent Williams', avatar: 'kent', score: 96, company: 'Stripe', role: 'Software Engineer', why: 'Recently left Stripe to build in consumer social. Has attended 2 SPC events and is a previous founder.', action: 'Send Email', done: 'Email drafted' },
  { id: 'sambhav', playbook: 'Portfolio Companies Hiring', when: '2 hours ago', person: 'Sambhav Anand', avatar: 'sambhav', score: 92, company: 'Fulcrum', role: 'Co-Founder', why: 'Fulcrum posted a Founding Forward Deployed Engineer role', action: 'Source Introductions', done: 'Intros requested' },
  { id: 'sarah', playbook: 'Event Registrants to Meet', when: '4 hours ago', person: 'Sarah Chen', avatar: 'sarah', score: 98, company: 'Stripe', role: 'Member of Technical Staff', why: 'Registered for an upcoming SPC event', action: 'Send Email', done: 'Email drafted' },
  { id: 'anish', playbook: 'Event Registrants to Meet', when: 'Just now', person: 'Anish Maddipoti', avatar: 'anish', score: 88, company: 'Nvidia', role: 'Product Manager', why: 'Registered for an upcoming SPC event and has work overlaps with 5 SPC members', action: 'Send Email', done: 'Email drafted' },
  { id: 'jonathan', playbook: 'Potential SPC Member', when: 'Just now', person: 'Jonathan Arena', avatar: 'jonathan', score: 90, company: 'New Generation', role: 'Co-founder', why: 'AI-focused founder who would benefit from SPC community, strong potential member candidate', action: 'Send Email', done: 'Email drafted' },
  { id: 'dylan', playbook: 'Potential SPC Member', when: 'Just now', person: 'Dylan Field', avatar: 'dylan', score: 85, company: 'Figma', role: 'Co-Founder & CEO', why: 'Met at Config 2025, expressed interest in enterprise design tools collaboration opportunities', action: 'Send Email', done: 'Email drafted' },
  { id: 'jordan', playbook: 'Portfolio Companies Hiring', when: 'Just now', person: 'Jordan Singer', avatar: 'jordan', score: 94, company: 'Mainframe', role: 'Co-founder & CEO', why: 'Raised $5.5M seed round for Mainframe (December 2024) and is building out the team', action: 'Recommend Candidates', done: 'Candidates sent' },
];

const STATS: [number, string, string][] = [
  [127, '', 'People engaged this month'],
  [8, '', 'High-value connections added'],
  [67, '%', 'Meaningful interactions'],
  [23, '', 'Cities in your network'],
];

function Count({ to, suffix }: { to: number; suffix: string }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) return;
    const c = animate(0, to, { duration: 1.1, delay: 0.3, ease, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [to, reduce]);
  return (
    <span style={{ fontFamily: '"SF Mono", ui-monospace, Menlo, monospace', fontWeight: 700, fontSize: 16.8, lineHeight: '22.4px', color: '#30374F', fontVariantNumeric: 'tabular-nums' }}>
      {n}
      {suffix}
    </span>
  );
}

function Score({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const size = 16.8;
  const r = 7.35;
  return (
    <span style={{ position: 'relative', width: size, height: size, display: 'inline-flex' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E4EBF5" strokeWidth={2.1} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1671EF" strokeWidth={2.1} strokeLinecap="round" initial={{ pathLength: reduce ? value / 100 : 0 }} animate={{ pathLength: value / 100 }} transition={{ duration: 0.9, delay: 0.4, ease }} />
      </svg>
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"SF Mono", ui-monospace, monospace', fontSize: 7, color: '#000' }}>{value}</span>
    </span>
  );
}

function Item({ u, fresh, pressed, onAct }: { u: Update; fresh: boolean; pressed: boolean; onAct: () => void }) {
  return (
    <motion.div
      layout
      initial={fresh ? { opacity: 0, y: 14, backgroundColor: 'rgba(209,233,255,0.6)' } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(209,233,255,0)' }}
      exit={{ opacity: 0, height: 0, paddingBottom: 0, transition: { duration: 0.35, ease } }}
      transition={{ duration: 0.45, ease, backgroundColor: { duration: 1.6 } }}
      style={{ display: 'flex', flexDirection: 'column', gap: 8.4, paddingBottom: 11.2, borderBottom: '0.7px solid #EBEBEB', overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8.4 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5.6, padding: 2.8, borderRadius: 2.8, outline: '0.7px solid #EBEBEB', outlineOffset: -0.7, color: '#404968' }}>
          <Icon name="addressBook" size={11.2} />
          <span style={{ fontSize: 9.8, lineHeight: '12.6px', fontWeight: 500, minWidth: 120 }}>{u.playbook}</span>
        </span>
        <span style={{ fontSize: 9.8, color: '#5A5A5A' }}>{u.when}</span>
        {fresh && <span style={{ fontSize: 8.4, fontWeight: 600, color: '#1570EF', background: '#EFF8FF', padding: '1px 6px', borderRadius: 8 }}>New</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', height: 44.8 }}>
        <div style={{ width: 168, display: 'flex', alignItems: 'center', gap: 8.4, padding: '0 8.4px', borderRight: '0.7px solid #EBEBEB', height: '100%' }}>
          <Avatar id={u.avatar} size={33.6} ring="#EBEBEB" />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2.8 }}>
            <span style={{ fontSize: 9.8, lineHeight: '12.6px', fontWeight: 500, color: '#000', whiteSpace: 'nowrap' }}>{u.person}</span>
            <Score value={u.score} />
          </span>
        </div>
        <div style={{ width: 112, padding: 8.4, display: 'flex', flexDirection: 'column', gap: 2.8, borderRight: '0.7px solid #EBEBEB', height: '100%', justifyContent: 'center' }}>
          <span style={{ fontSize: 9.8, lineHeight: '12.6px', fontWeight: 500, color: '#30374F' }}>{u.company}</span>
          <span style={{ fontSize: 8.4, lineHeight: '11.2px', color: '#404968', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.role}</span>
        </div>
        <div style={{ width: 336, padding: 8.4, borderRight: '0.7px solid #EBEBEB', height: '100%', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 7.7, lineHeight: '11px', color: '#5A5A5A', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>{u.why}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', padding: '0 11.2px' }}>
          <motion.button
            type="button"
            onClick={onAct}
            animate={{ scale: pressed ? 0.94 : 1 }}
            whileTap={{ scale: 0.94 }}
            style={{
              ...(pressed ? { backgroundColor: '#ECFDF3' } : BLUE_FILL),
              border: 'none',
              outline: pressed ? '0.7px solid #ABEFC6' : BLUE_FILL.outline,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4.2px 11.2px',
              borderRadius: 22.4,
              fontFamily: UI,
              fontSize: 11.2,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: '16.8px',
              color: pressed ? '#067647' : '#FFFFFF',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {pressed && <Icon name="check" size={11} />}
            {pressed ? u.done : u.action}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Where the markers sit, on the panel: a playbook's name, a Q-Score, a suggested action
const MARKS: [number, number][] = [
  [63, 338],
  [158, 402],
  [778, 388],
];

export function Playbooks() {
  const [shown, setShown] = useState<string[]>(UPDATES.slice(0, 3).map((u) => u.id));
  const next = useRef(3);
  const [pressed, setPressed] = useState<string | null>(null);
  const [handled, setHandled] = useState(0);
  const [spot, setSpot] = useState<number | null>(null);
  const [run, setRun] = useState(1);

  const act = (id: string) => {
    if (pressed) return;
    setPressed(id);
    setTimeout(() => {
      const incoming = UPDATES[next.current]?.id;
      next.current += 1;
      setShown((s) => [...s.filter((x) => x !== id), ...(incoming ? [incoming] : [])]);
      setHandled((h) => h + 1);
      setPressed(null);
    }, 1100);
  };

  useScript([[3400, () => act(shown[0])]], run);

  const replay = () => {
    setShown(UPDATES.slice(0, 3).map((u) => u.id));
    next.current = 3;
    setPressed(null);
    setHandled(0);
    setRun((r) => r + 1);
  };

  return (
    <Stage width={1072} height={828}>
      <AppWindow>
        <div key={run} style={{ display: 'flex', flexDirection: 'column', gap: 22.4 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 9.8, lineHeight: '14px', color: '#5D6B98' }}>Wednesday, June 4, 2025</span>
          <span style={{ fontSize: 19.6, lineHeight: '25.2px', fontWeight: 500, color: '#30374F', letterSpacing: '-0.01em' }}>
            <span style={{ color: '#4E5BA6' }}>Good Morning,</span> Alex
          </span>
        </div>
        <div style={{ borderRadius: 11.2, background: '#F5FAFF', outline: '0.7px solid #D1E9FF', outlineOffset: -0.7 }}>
          <div style={{ padding: '8.4px 16.8px', fontSize: 11.2, lineHeight: '19.6px', fontWeight: 600, color: '#2E90FA' }}>Your network is 23% more diverse than similar executives, with strong clustering in fintech and AI</div>
          <div style={{ display: 'flex', borderRadius: 11.2, background: '#FFFFFF', outline: '0.7px solid #D1E9FF', outlineOffset: -0.7, overflow: 'hidden', boxShadow: 'rgba(24,73,169,0.12) 0px 0.7px 0px, rgba(24,73,169,0.12) 0px 5.6px 5.6px -2.8px' }}>
            {STATS.map(([n, suffix, label]) => (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.8, padding: '11px 5.6px', outline: '0.7px solid #D1E9FF', outlineOffset: -0.7 }}>
                <Count to={n} suffix={suffix} />
                <span style={{ fontSize: 11.2, lineHeight: '19.6px', color: '#30374F' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11.2 }}>
          <span style={{ fontSize: 14, lineHeight: '19.6px', fontWeight: 600, color: '#404968' }}>Today’s Updates</span>
          <div style={{ height: 348.6, borderRadius: 11.2, outline: '0.7px solid #DCDFEA', outlineOffset: -0.7, padding: '16.8px 17px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11.2, overflow: 'hidden' }}>
            <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 11.2 }}>
              <AnimatePresence initial={false} mode="popLayout">
                {shown.map((id) => {
                  const u = UPDATES.find((x) => x.id === id)!;
                  return <Item key={id} u={u} fresh={UPDATES.indexOf(u) >= 3} pressed={pressed === id} onAct={() => act(id)} />;
                })}
              </AnimatePresence>
            </div>
            <motion.span layout style={{ marginTop: 'auto', padding: '4.2px 8.4px', borderRadius: 22.4, background: 'linear-gradient(180deg, #FCFCFD 0%, #F9F9FB 100%)', outline: '0.7px solid rgba(25,65,133,0.15)', fontSize: 11.2, fontWeight: 500, color: '#30374F', boxShadow: '#DCDFEA 0px 0.7px 0px' }}>
              View All {15 - handled} Updates
            </motion.span>
          </div>
        </div>
        </div>
      </AppWindow>
      <Marker n={1} x={MARKS[0][0]} y={MARKS[0][1]} active={spot === 1} onClick={() => setSpot((s) => (s === 1 ? null : 1))} />
      <Marker n={2} x={MARKS[1][0]} y={MARKS[1][1]} active={spot === 2} onClick={() => setSpot((s) => (s === 2 ? null : 2))} />
      <Marker n={3} x={MARKS[2][0]} y={MARKS[2][1]} active={spot === 3} onClick={() => setSpot((s) => (s === 3 ? null : 3))} />
      <Replay onClick={replay} />
    </Stage>
  );
}
