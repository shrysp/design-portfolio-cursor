'use client';

import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';

/**
 * The pieces every slide is built from, on the deck's 1920×1080 canvas. Sizes are canvas pixels,
 * the same numbers as the Paper file, so a slide can be checked against its design one to one.
 * A deck's look (its colours and type) comes from its theme; these only lay things out.
 */

export const SlideContext = createContext({ number: 1, total: 1, section: '' });

export type Theme = {
  bg: string;
  panel: string;
  ink: string;
  ink2: string;
  ink3: string;
  line: string;
  accent: string;
  mark: string;
  /** Background of the dark statement slides */
  dark: string;
  inverse: string;
  inverse2: string;
  inverseLabel: string;
  serif: string;
  sans: string;
  mono: string;
  /** Name in the footer of every slide */
  author: string;
};

export const ThemeContext = createContext<Theme | null>(null);

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('A slide needs a ThemeContext');
  return theme;
}

const PAD = '112px 128px 140px';

export function Slide({
  children,
  dark,
  row,
  gap = 40,
  background,
  padding = PAD,
  footer = true,
  style,
}: {
  children: ReactNode;
  dark?: boolean;
  row?: boolean;
  gap?: number;
  background?: string;
  padding?: string;
  footer?: boolean;
  style?: CSSProperties;
}) {
  const t = useTheme();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: row ? 'row' : 'column',
        gap,
        padding,
        background: background ?? (dark ? t.dark : t.bg),
        color: dark ? t.inverse : t.ink,
        fontFamily: t.sans,
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
      {footer && <Footer dark={dark} />}
    </div>
  );
}

export function Footer({ dark }: { dark?: boolean }) {
  const t = useTheme();
  const { number, section } = useContext(SlideContext);
  return (
    <div
      style={{
        position: 'absolute',
        left: 128,
        right: 128,
        bottom: 56,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: t.mono,
        fontSize: 18,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: dark ? t.inverse : '#999999',
        zIndex: 5,
      }}
    >
      <span>{t.author}</span>
      <span>
        {section ? `${section} · ` : ''}
        {String(number).padStart(2, '0')}
      </span>
    </div>
  );
}

export function Eyebrow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ width: 12, height: 12, borderRadius: 6, flexShrink: 0, background: dark ? '#F9BB9E' : t.mark }} />
      <span
        style={{
          fontFamily: t.mono,
          fontSize: 20,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: dark ? t.inverseLabel : t.ink3,
        }}
      >
        {children}
      </span>
    </div>
  );
}

export function Title({
  children,
  size = 72,
  width,
  color,
  weight = 580,
  style,
}: {
  children: ReactNode;
  size?: number;
  width?: number;
  color?: string;
  weight?: number;
  style?: CSSProperties;
}) {
  const t = useTheme();
  return (
    <h2
      style={{
        margin: 0,
        fontFamily: t.serif,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.1,
        letterSpacing: '-0.03em',
        color: color ?? 'inherit',
        maxWidth: width,
        textWrap: 'balance',
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

export function Text({
  children,
  size = 28,
  width,
  color,
  style,
}: {
  children: ReactNode;
  size?: number;
  width?: number;
  color?: string;
  style?: CSSProperties;
}) {
  const t = useTheme();
  return (
    <p style={{ margin: 0, fontSize: size, lineHeight: 1.45, color: color ?? t.ink2, maxWidth: width, textWrap: 'pretty', ...style }}>
      {children}
    </p>
  );
}

export function Label({ children, color, size = 18, style }: { children: ReactNode; color?: string; size?: number; style?: CSSProperties }) {
  const t = useTheme();
  return (
    <div style={{ fontFamily: t.mono, fontSize: size, letterSpacing: '0.12em', textTransform: 'uppercase', color: color ?? t.ink3, ...style }}>
      {children}
    </div>
  );
}

export function Spacer() {
  return <div style={{ flex: 1 }} />;
}

/** The text column beside a product panel */
export function Column({ children, width = 520, gap = 32 }: { children: ReactNode; width?: number; gap?: number }) {
  return <div style={{ width, flexShrink: 0, display: 'flex', flexDirection: 'column', gap }}>{children}</div>;
}

/** The rounded grey stage that product UI and figures sit on */
export function Panel({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, minWidth: 0, borderRadius: 28, background: t.panel, position: 'relative', overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

export function Img({ src, alt, style, fit = 'contain' }: { src: string; alt: string; style?: CSSProperties; fit?: 'contain' | 'cover' }) {
  // Plain img: slides are fixed-size art, and the deck scales the whole canvas.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} draggable={false} style={{ display: 'block', objectFit: fit, ...style }} />;
}

/** A numbered marker on the product UI, matching a numbered note in the text column */
export function Pin({ n, x, y }: { n: number; x: number; y: number }) {
  const t = useTheme();
  return (
    <span
      style={{
        position: 'absolute',
        left: x,
        top: y,
        zIndex: 3,
        width: 30,
        height: 30,
        borderRadius: 15,
        background: t.mark,
        border: '3px solid #FFFFFF',
        boxShadow: '0 4px 12px rgba(230,101,27,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: t.mono,
        fontSize: 14,
        color: '#FFFFFF',
      }}
    >
      {n}
    </span>
  );
}

/** A ruled list of short notes; numbered ones match the pins on the panel beside them */
export function Notes({ items, numbered = true, size = 22 }: { items: [string, string][]; numbered?: boolean; size?: number }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map(([head, body], i) => (
        <div
          key={head}
          style={{
            display: 'flex',
            gap: 18,
            padding: '16px 0',
            borderTop: `1px solid ${i === 0 ? t.ink : t.line}`,
            borderBottom: i === items.length - 1 ? `1px solid ${t.line}` : undefined,
          }}
        >
          {numbered && (
            <span
              style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                borderRadius: 14,
                background: t.mark,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: t.mono,
                fontSize: 15,
              }}
            >
              {i + 1}
            </span>
          )}
          <p style={{ margin: 0, fontSize: size, lineHeight: 1.45, color: t.ink2 }}>
            <strong style={{ fontWeight: 600, color: t.ink }}>{head}</strong> {body}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Three or four ideas side by side, each under a rule */
export function Columns({
  items,
  dark,
  titleSize = 44,
}: {
  items: { label?: string; title?: string; body: string }[];
  dark?: boolean;
  titleSize?: number;
}) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', gap: 48 }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            paddingTop: 28,
            borderTop: `1px solid ${dark ? '#6A88E2' : t.ink}`,
          }}
        >
          {it.label && <Label color={dark ? '#F9BB9E' : t.accent}>{it.label}</Label>}
          {it.title && (
            <div style={{ fontFamily: t.serif, fontWeight: 580, fontSize: titleSize, lineHeight: 1.12, letterSpacing: '-0.02em', color: dark ? t.inverse : t.ink }}>
              {it.title}
            </div>
          )}
          <p style={{ margin: 0, fontSize: 24, lineHeight: 1.5, color: dark ? t.inverse2 : t.ink2 }}>{it.body}</p>
        </div>
      ))}
    </div>
  );
}
