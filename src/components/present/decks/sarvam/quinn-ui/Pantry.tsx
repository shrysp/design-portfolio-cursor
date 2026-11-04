'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BLUE_FILL, Replay, UI, ease } from './kit';
import { useScript } from './hooks';

/**
 * Q09: the brainstorm, then the cut. Every idea arrives as an equal grey chip; then the focus
 * question is asked, the ones that answer it turn blue and the rest step back.
 */

const IDEAS: [string, boolean][] = [
  ['Strength Score', true],
  ['Profiles', false],
  ['Sets/Lists', true],
  ['Q-Score', true],
  ['Tinder Quinn', false],
  ['Pre-canned Searches', true],
  ['Dead to Me', false],
  ['Agentic Workflows', true],
  ['Playbooks', true],
  ['Collaborative', false],
  ['Shareable', true],
];

// The order ideas arrive in, so the brainstorm reads as scattered rather than a list
const ARRIVAL = [3, 7, 0, 9, 5, 1, 10, 4, 8, 2, 6];


export function Pantry() {
  const [cut, setCut] = useState(false);
  const [run, setRun] = useState(1);
  useScript([[2300, () => setCut(true)]], run);

  return (
    <div style={{ position: 'relative', width: 972, height: 828, flexShrink: 0, borderRadius: 28, background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div key={run} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48 }}>
        <div style={{ width: 900, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: 24 }}>
          {IDEAS.map(([name, kept], i) => {
            const blue = cut && kept;
            return (
              <motion.button
                key={name}
                type="button"
                onClick={() => setCut((c) => !c)}
                initial={{ opacity: 0, scale: 0.7, y: 12 }}
                animate={{ opacity: cut && !kept ? 0.45 : 1, scale: blue ? [1, 1.08, 1] : 1, y: 0 }}
                transition={{
                  opacity: { duration: 0.4, delay: cut ? 0 : 0.12 * ARRIVAL.indexOf(i) },
                  y: { duration: 0.5, ease, delay: 0.12 * ARRIVAL.indexOf(i) },
                  scale: blue ? { duration: 0.5, ease, delay: 0.06 * i } : { type: 'spring', stiffness: 380, damping: 22, delay: 0.12 * ARRIVAL.indexOf(i) },
                }}
                style={{
                  height: 72,
                  padding: blue ? '16px 32px' : '16px 28px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: UI,
                  fontSize: 30,
                  lineHeight: '40px',
                  letterSpacing: '-0.005em',
                  fontWeight: blue ? 500 : 400,
                  color: blue ? '#FAFAFA' : '#27272A',
                  textDecorationLine: cut && !kept ? 'line-through' : 'none',
                  textDecorationColor: 'rgba(39,39,42,0.35)',
                  transition: 'background-color 400ms, color 400ms, padding 300ms',
                  ...(blue
                    ? { ...BLUE_FILL, filter: 'drop-shadow(rgba(25,65,133,0.16) 0px 6px 3px) drop-shadow(#194185 0px 1px 0px)' }
                    : { backgroundColor: '#FFFFFF', backgroundImage: 'none', outline: '1px solid #E4E4E7', outlineOffset: -1, boxShadow: 'none', filter: 'none' }),
                }}
              >
                {name}
              </motion.button>
            );
          })}
        </div>
        <div style={{ height: 28 }}>
          <AnimatePresence mode="wait">
            {cut ? (
              <motion.div key="legend" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.4, duration: 0.4 }} style={{ display: 'flex', gap: 32, fontFamily: 'var(--font-figtree), sans-serif', fontSize: 22, color: '#3D3D3D' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 8, background: '#1570EF' }} /> Kept for the golden path
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 8, background: '#E4E4E7' }} /> Cut
                </span>
              </motion.div>
            ) : (
              <motion.div key="brainstorm" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1.4 } }} exit={{ opacity: 0, transition: { duration: 0.15 } }} style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 16, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999' }}>
                Everything we could build
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Replay
        onClick={() => {
          setCut(false);
          setRun((r) => r + 1);
        }}
      />
    </div>
  );
}
