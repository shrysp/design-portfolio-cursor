'use client';

import { useId, type CSSProperties } from 'react';
import type { Theme } from '../../primitives';

/**
 * Sarvam's look, taken from sarvam.ai and its brand pages: a near-white page, indigo and orange
 * from their CSS, the navy of their dark sections, and the "gateway" arch filled with their
 * blue-to-peach spectrum. Headlines use Season Mix, their serif, where it is installed, and
 * Newsreader everywhere else; body text is Figtree, standing in for their Matter.
 */
export const sarvam: Theme = {
  bg: '#FCFCFC',
  panel: '#F0F0F0',
  ink: '#1F1F1F',
  ink2: '#3D3D3D',
  ink3: '#666666',
  line: '#E6E6E6',
  accent: '#4250D5',
  mark: '#E6651B',
  dark: 'linear-gradient(180deg, #1E2033 0%, #141526 100%)',
  inverse: '#FAF8F5',
  inverse2: '#D2DFF9',
  inverseLabel: '#A7C0F1',
  serif: "'Season Mix', var(--font-newsreader), Georgia, serif",
  sans: 'var(--font-figtree), system-ui, sans-serif',
  mono: 'var(--font-geist-mono), ui-monospace, monospace',
  author: 'Shreyas Patil',
};

export const ASSETS = '/present/sarvam';

/** The gateway: a domed cap, stepped shoulders and pointed sides, drawn in a 600×700 box. */
export const GATEWAY =
  'M260 40 A40 40 0 0 1 340 40 L340 60 L420 60 L420 100 C500 100 520 160 520 230 C520 300 560 340 600 350 C560 360 520 400 520 470 C520 540 500 600 420 600 L420 640 L340 640 L340 660 A40 40 0 0 1 260 660 L260 640 L180 640 L180 600 C100 600 80 540 80 470 C80 400 40 360 0 350 C40 340 80 300 80 230 C80 160 100 100 180 100 L180 60 L260 60 Z';

const SPECTRUM = {
  /** Indigo through lavender to peach, as inside the gateways on their brand page */
  deep: [
    ['0', '#3337CE'],
    ['0.5', '#6D6FD9'],
    ['0.8', '#D9B9CF'],
    ['1', '#F7C6A3'],
  ],
  soft: [
    ['0', '#3B3FD3'],
    ['0.55', '#8A87DB'],
    ['1', '#F4C2A6'],
  ],
  /** The light backdrop behind product screens on the openers */
  light: [
    ['0', '#5A5FD8'],
    ['0.55', '#B7B4E8'],
    ['1', '#F7C6A3'],
  ],
} as const;

export function Gateway({
  width,
  spectrum = 'deep',
  opacity = 1,
  style,
}: {
  width: number;
  spectrum?: keyof typeof SPECTRUM;
  opacity?: number;
  style?: CSSProperties;
}) {
  const id = useId();
  return (
    <svg
      aria-hidden
      width={width}
      height={(width * 7) / 6}
      viewBox="0 0 600 700"
      style={{ position: 'absolute', display: 'block', ...style }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {SPECTRUM[spectrum].map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
      </defs>
      <path d={GATEWAY} fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}

/** Nested gateways filling the slide, centred a little below the middle, as on the cover */
export function GatewayField() {
  const cx = 960;
  const cy = 560;
  const ring = (scale: number, spectrum: keyof typeof SPECTRUM, opacity: number) => (
    <Gateway width={600 * scale} spectrum={spectrum} opacity={opacity} style={{ left: cx - 300 * scale, top: cy - 350 * scale }} />
  );
  return (
    <>
      {ring(2.35, 'soft', 0.55)}
      {ring(1.75, 'deep', 0.8)}
      {ring(1.18, 'deep', 1)}
    </>
  );
}

export const FIELD_BACKGROUND = 'linear-gradient(180deg, #3438CF 0%, #5A5FD8 55%, #B9A6D6 85%, #F2C3A2 100%)';

/** The small gradient window that sits in the empty corner of a dark statement slide */
export function GatewayWindow() {
  return <Gateway width={300} style={{ left: 1492, top: 96 }} />;
}

export function Wordmark({ tone = 'dark', height = 20 }: { tone?: 'dark' | 'light'; height?: number }) {
  // The official wordmark from Sarvam's logo pack: black on light grounds, white on dark, never recoloured.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`${ASSETS}/sarvam-wordmark-${tone}.svg`} alt="Sarvam" style={{ height, width: 'auto', display: 'block' }} />;
}
