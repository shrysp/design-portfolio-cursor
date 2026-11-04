'use client';

import type { CSSProperties, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AddressBook,
  ArrowClockwise,
  ArrowCounterClockwise,
  Bell,
  Blueprint,
  Brain,
  Briefcase,
  CaretDown,
  CaretRight,
  CaretUp,
  CaretUpDown,
  ChartDonut,
  ChartPieSlice,
  ChatCircleDots,
  Check,
  Columns,
  EnvelopeSimple,
  Funnel,
  Globe,
  Hourglass,
  House,
  Lightning,
  LinkedinLogo,
  MagnifyingGlass,
  MapPin,
  PaperPlaneRight,
  Plus,
  ShareNetwork,
  SidebarSimple,
  SlidersHorizontal,
  SortAscending,
  Sparkle,
  SquaresFour,
  Star,
  Stop,
  Table,
  TwitterLogo,
  UserCircle,
  WhatsappLogo,
  X,
  XLogo,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react';
import { AVATARS, strengthColor, type Channel } from './data';

/**
 * The pieces Quinn's screens share, in the Paper file's own values. Quinn was designed in SF Pro,
 * so the stack reaches for it first; elsewhere the system UI face stands in.
 */

export const UI = '"SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
export const MONO = '"SF Mono", ui-monospace, Menlo, monospace';

export const C = {
  ink: '#30374F',
  ink2: '#404968',
  muted: '#5A5A5A',
  title: '#1D293D',
  slate: '#314158',
  placeholder: '#90A1B9',
  blue: '#1570EF',
  blueLine: '#D1E9FF',
  blueWash: '#F5FAFF',
  line: '#EBEBEB',
  sidebarLine: '#DCDFEA',
};

/** Quinn's filled blue: the send button, primary actions and the kept chips */
export const BLUE_FILL: CSSProperties = {
  backgroundImage: 'linear-gradient(180deg, #2E90FA 0%, #1570EF 100%)',
  boxShadow:
    'rgba(255,255,255,0.12) 0px -1px 0px 1px inset, rgba(245,250,255,0.16) 0px 6px 6px inset, rgba(245,250,255,0.16) 0px -6px 6px inset, rgba(25,65,133,0.16) 0px 6px 6px -3px, #194185 0px 1px 0px',
  outline: '1px solid rgba(25,65,133,0.15)',
  outlineOffset: -1,
};

export const ease = [0.22, 1, 0.36, 1] as const;

export function Avatar({ id, size = 19.2, ring = C.blueLine }: { id: string; size?: number; ring?: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: size,
        border: `0.8px solid ${ring}`,
        backgroundColor: '#FFFFFF',
        backgroundImage: `url(${AVATARS}/${id}.webp)`,
        backgroundSize: 'cover',
        backgroundPosition: '50%',
      }}
    />
  );
}

/** The strength ring: a gauge that draws to its score when it appears */
export function Ring({ value, size = 19.2, color, delay = 0 }: { value: number; size?: number; color?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const stroke = size * 0.11;
  const r = (size - stroke) / 2;
  const tone = color ?? strengthColor(value);
  return (
    <span style={{ position: 'relative', width: size, height: size, flexShrink: 0, display: 'inline-flex' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: reduce ? value / 100 : 0 }}
          animate={{ pathLength: value / 100 }}
          transition={{ duration: 0.9, delay, ease }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: MONO,
          fontSize: size * 0.42,
          color: '#000',
        }}
      >
        {value}
      </span>
    </span>
  );
}

// The channel a conversation happened on, as its brand mark in its brand colour
const CHANNEL: Record<Channel, { Glyph: PhosphorIcon; color: string; label: string }> = {
  whatsapp: { Glyph: WhatsappLogo, color: '#25D366', label: 'WhatsApp' },
  gmail: { Glyph: EnvelopeSimple, color: '#EA4335', label: 'Email' },
  linkedin: { Glyph: LinkedinLogo, color: '#0A66C2', label: 'LinkedIn' },
  x: { Glyph: TwitterLogo, color: '#1DA1F2', label: 'X' },
};

export function ChannelIcon({ via, size = 16 }: { via: Channel; size?: number }) {
  const { Glyph, color, label } = CHANNEL[via];
  return <Glyph size={size} weight="fill" color={color} aria-label={label} />;
}

/** Every icon in Quinn's screens is from Phosphor, in its filled weight, as in the product */
const ICONS = {
  person: UserCircle,
  sort: CaretUpDown,
  bolt: Lightning,
  briefcase: Briefcase,
  hourglass: Hourglass,
  globe: Globe,
  filter: Funnel,
  sliders: SlidersHorizontal,
  sortLines: SortAscending,
  grid: SquaresFour,
  columns: Columns,
  chevron: CaretDown,
  chevronUp: CaretUp,
  chevronRight: CaretRight,
  star: Star,
  table: Table,
  refresh: ArrowClockwise,
  share: ShareNetwork,
  sparkleColumns: Sparkle,
  home: House,
  bell: Bell,
  chart: ChartPieSlice,
  search: MagnifyingGlass,
  addressBook: AddressBook,
  sidebar: SidebarSimple,
  check: Check,
  plus: Plus,
  stop: Stop,
  send: PaperPlaneRight,
  blueprint: Blueprint,
  brain: Brain,
  replay: ArrowCounterClockwise,
  location: MapPin,
  strength: ChartDonut,
  messages: ChatCircleDots,
  x: XLogo,
  close: X,
} satisfies Record<string, PhosphorIcon>;

type IconName = keyof typeof ICONS;

// A check is always the bold tick on its own: Phosphor's filled check is a solid tile with the tick cut out
const WEIGHT: Partial<Record<IconName, 'bold'>> = { check: 'bold' };

export function Icon({ name, size = 12.8, color = 'currentColor', weight }: { name: IconName; size?: number; color?: string; weight?: 'fill' | 'regular' | 'bold' }) {
  const Glyph = ICONS[name];
  return <Glyph size={size} weight={weight ?? WEIGHT[name] ?? 'fill'} color={color} aria-hidden style={{ flexShrink: 0 }} />;
}

/** The table toolbar's small white buttons: Filters, Sort, Group by, Edit Columns */
export function ToolButton({ icon, children, active, badge, onClick, style }: { icon?: IconName; children: ReactNode; active?: boolean; badge?: number; onClick?: () => void; style?: CSSProperties }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 25.6,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4.8,
        padding: '0 9.6px',
        borderRadius: 6.4,
        border: 'none',
        background: active ? C.blueWash : '#FFFFFF',
        outline: `0.8px solid ${active ? '#84CAFF' : C.line}`,
        outlineOffset: -0.8,
        boxShadow: '0 1.6px 3.2px -1.6px rgba(0,0,0,0.12)',
        fontFamily: UI,
        fontSize: 11.2,
        fontWeight: 500,
        color: active ? C.blue : C.ink,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={12.8} />}
      {children}
      {badge !== undefined && (
        <motion.span
          key={badge}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ minWidth: 14, height: 14, padding: '0 3px', borderRadius: 4, background: '#D1E9FF', color: C.blue, fontSize: 9.6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {badge}
        </motion.span>
      )}
    </button>
  );
}

/** Quinn's wordmark, from the corrected logo in the Paper file */
export function QuinnLogo({ height = 21.6 }: { height?: number }) {
  return (
    <svg width={(height * 58.45) / 21.6} height={height} viewBox="0 0 58.45 21.6" aria-label="Quinn">
      <g fill="#102A56">
        <path transform="translate(47.187 5.004)" d="M0.000 11.374C0.000 11.374 0.000 0.223 0.000 0.223C0.000 0.223 3.702 0.223 3.702 0.223C3.702 0.223 3.702 1.673 3.702 1.673C4.014 1.346 4.349 1.063 4.706 0.825C5.063 0.572 5.457 0.372 5.888 0.223C6.319 0.074 6.795 0.000 7.315 0.000C8.163 0.000 8.876 0.171 9.456 0.513C10.051 0.855 10.497 1.308 10.795 1.873C11.107 2.438 11.263 3.070 11.263 3.769C11.263 3.769 11.263 11.374 11.263 11.374C11.263 11.374 7.561 11.374 7.561 11.374C7.561 11.374 7.561 4.973 7.561 4.973C7.561 4.572 7.501 4.237 7.382 3.970C7.263 3.702 7.085 3.501 6.847 3.368C6.624 3.234 6.334 3.167 5.977 3.167C5.516 3.167 5.070 3.308 4.639 3.591C4.223 3.873 3.910 4.200 3.702 4.572C3.702 4.572 3.702 11.374 3.702 11.374C3.702 11.374 0.000 11.374 0.000 11.374Z" />
        <path transform="translate(34.843 5.004)" d="M0.000 11.374C0.000 11.374 0.000 0.223 0.000 0.223C0.000 0.223 3.702 0.223 3.702 0.223C3.702 0.223 3.702 1.673 3.702 1.673C4.014 1.346 4.349 1.063 4.706 0.825C5.063 0.572 5.457 0.372 5.888 0.223C6.319 0.074 6.795 0.000 7.315 0.000C8.163 0.000 8.876 0.171 9.456 0.513C10.051 0.855 10.497 1.308 10.795 1.873C11.107 2.438 11.263 3.070 11.263 3.769C11.263 3.769 11.263 11.374 11.263 11.374C11.263 11.374 7.561 11.374 7.561 11.374C7.561 11.374 7.561 4.973 7.561 4.973C7.561 4.572 7.501 4.237 7.382 3.970C7.263 3.702 7.085 3.501 6.847 3.368C6.624 3.234 6.334 3.167 5.977 3.167C5.516 3.167 5.070 3.308 4.639 3.591C4.223 3.873 3.910 4.200 3.702 4.572C3.702 4.572 3.702 11.374 3.702 11.374C3.702 11.374 0.000 11.374 0.000 11.374Z" />
        <path transform="translate(29.661 0)" d="M0.201 16.236C0.201 16.236 0.201 5.085 0.201 5.085C0.201 5.085 3.903 5.085 3.903 5.085C3.903 5.085 3.903 16.236 3.903 16.236C3.903 16.236 0.201 16.236 0.201 16.236ZM2.052 4.104C1.502 4.104 1.018 3.903 0.602 3.501C0.201 3.085 0.000 2.602 0.000 2.052C0.000 1.487 0.201 1.004 0.602 0.602C1.018 0.201 1.502 0.000 2.052 0.000C2.617 0.000 3.100 0.201 3.502 0.602C3.903 1.004 4.104 1.487 4.104 2.052C4.104 2.602 3.903 3.085 3.502 3.501C3.100 3.903 2.617 4.104 2.052 4.104Z" />
        <path transform="translate(17.318 5.227)" d="M4.037 11.374C2.773 11.374 1.784 10.988 1.071 10.215C0.357 9.441 0.000 8.430 0.000 7.181C0.000 7.181 0.000 0.000 0.000 0.000C0.000 0.000 3.702 0.000 3.702 0.000C3.702 0.000 3.702 6.401 3.702 6.401C3.702 6.787 3.769 7.122 3.903 7.404C4.037 7.672 4.230 7.873 4.483 8.007C4.750 8.140 5.055 8.207 5.397 8.207C5.873 8.207 6.304 8.081 6.691 7.828C7.077 7.561 7.367 7.219 7.561 6.802C7.561 6.802 7.561 0.000 7.561 0.000C7.561 0.000 11.263 0.000 11.263 0.000C11.263 0.000 11.263 11.151 11.263 11.151C11.263 11.151 7.561 11.151 7.561 11.151C7.561 11.151 7.561 9.791 7.561 9.791C7.263 10.118 6.944 10.400 6.602 10.638C6.260 10.876 5.880 11.055 5.464 11.174C5.048 11.307 4.572 11.374 4.037 11.374Z" />
        <path transform="translate(0 1.394)" d="M12.021 20.206C11.189 20.102 10.393 19.849 9.635 19.448C8.876 19.046 8.230 18.541 7.694 17.931C7.174 17.322 6.839 16.660 6.691 15.946C5.709 15.798 4.810 15.508 3.992 15.077C3.174 14.630 2.468 14.065 1.873 13.382C1.279 12.698 0.818 11.902 0.491 10.995C0.164 10.088 0.000 9.099 0.000 8.029C0.000 6.825 0.201 5.732 0.602 4.750C1.004 3.769 1.569 2.929 2.297 2.230C3.026 1.517 3.881 0.966 4.862 0.580C5.858 0.193 6.944 0.000 8.118 0.000C9.293 0.000 10.371 0.193 11.352 0.580C12.348 0.966 13.211 1.517 13.939 2.230C14.668 2.929 15.233 3.769 15.634 4.750C16.036 5.732 16.236 6.825 16.236 8.029C16.236 9.010 16.095 9.925 15.813 10.772C15.545 11.620 15.151 12.378 14.631 13.047C14.125 13.716 13.515 14.281 12.802 14.742C12.103 15.203 11.322 15.545 10.460 15.768C10.460 15.768 10.460 16.058 10.460 16.058C10.653 16.281 10.876 16.474 11.129 16.638C11.382 16.816 11.672 16.957 11.999 17.061C12.326 17.180 12.705 17.270 13.136 17.329C13.136 17.329 13.136 17.664 13.136 17.664C13.136 17.664 12.021 20.206 12.021 20.206ZM8.118 12.489C8.936 12.489 9.650 12.304 10.259 11.932C10.869 11.545 11.337 11.017 11.664 10.348C12.006 9.679 12.177 8.906 12.177 8.029C12.177 7.152 12.006 6.379 11.664 5.709C11.337 5.040 10.869 4.520 10.259 4.148C9.650 3.762 8.936 3.568 8.118 3.568C7.300 3.568 6.587 3.762 5.977 4.148C5.368 4.520 4.892 5.040 4.550 5.709C4.223 6.379 4.059 7.152 4.059 8.029C4.059 8.906 4.223 9.679 4.550 10.348C4.892 11.017 5.368 11.545 5.977 11.932C6.587 12.304 7.300 12.489 8.118 12.489Z" />
      </g>
    </svg>
  );
}

/**
 * A numbered marker that lines up with the notes beside the screen. Clicking it lights up the
 * part of the screen its note is about.
 */
export function Marker({ n, x, y, active, onClick }: { n: number; x: number; y: number; active?: boolean; onClick?: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`Marker ${n}`}
      animate={{ scale: active ? 1.15 : 1 }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        zIndex: 50,
        width: 30,
        height: 30,
        padding: 0,
        borderRadius: 15,
        background: '#E6651B',
        border: '3px solid #FFFFFF',
        boxShadow: active ? '0 0 0 6px rgba(230,101,27,0.25), 0 4px 12px rgba(230,101,27,0.35)' : '0 4px 12px rgba(230,101,27,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: 14,
        color: '#FFFFFF',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {n}
    </motion.button>
  );
}

/** A quiet control in a panel's corner that plays a screen's demo again */
export function Replay({ onClick, label = 'Replay', style }: { onClick: () => void; label?: string; style?: CSSProperties }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'absolute',
        right: 48,
        top: 44,
        zIndex: 40,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        padding: '0 16px',
        borderRadius: 18,
        border: '1px solid #E0E0E0',
        background: 'rgba(255,255,255,0.9)',
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: 14,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#3D3D3D',
        cursor: 'pointer',
        ...style,
      }}
    >
      <Icon name="replay" size={14} />
      {label}
    </button>
  );
}
