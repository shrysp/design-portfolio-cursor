'use client';

import { Columns, Eyebrow, Slide, Spacer, Text, Title, useTheme } from '../../primitives';
import { FIELD_BACKGROUND, GatewayField, Wordmark } from './theme';

export function Cover() {
  const t = useTheme();
  return (
    <Slide footer={false} background={FIELD_BACKGROUND} padding="0">
      <GatewayField />
      <div
        style={{
          position: 'absolute',
          inset: '300px 360px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: t.mono, fontSize: 20, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#E8EFFC' }}>
          Portfolio presentation · Product design
        </div>
        <Title size={144} weight={420} color="#FFFFFF" style={{ lineHeight: 1 }}>
          Shreyas Patil
        </Title>
        <Text size={28} color="#FAF8F5">
          Product Designer · Interaction, systems and AI products
        </Text>
      </div>
      <PreparedFor />
    </Slide>
  );
}

export function PreparedFor({ date = true }: { date?: boolean }) {
  const t = useTheme();
  const label = { fontFamily: t.mono, fontSize: 18, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#3D2A20' };
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 64, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
      <span style={label}>Prepared for</span>
      <Wordmark tone="dark" height={20} />
      {date && <span style={label}>· Nov 2026</span>}
    </div>
  );
}

export function About() {
  const t = useTheme();
  return (
    <Slide gap={48}>
      <Eyebrow>About me</Eyebrow>
      <Title size={88} width={1380} style={{ lineHeight: 1.09 }}>
        I think about interaction, systems, and the details people feel <span style={{ color: t.accent }}>before they notice.</span>
      </Title>
      <Spacer />
      <div style={{ borderTop: `1px solid ${t.line}`, paddingTop: 40 }}>
        <Columns
          items={[
            { label: 'Background', body: 'Studied engineering and machine learning, then moved toward how things feel.' },
            { label: 'Training', body: 'MS in Human–Computer Interaction at RIT.' },
            { label: 'Now', body: 'Back home in Pune after a few years in the US. I design and build in code.' },
          ]}
        />
      </div>
    </Slide>
  );
}

const WORK = [
  ['01', 'Cameo', 'An expressive face for voice AI, on npm', 'Interaction · Motion'],
  ['02', 'Quinn', 'AI-native relationship intelligence for executives', 'Product · Systems'],
] as const;

export function SelectedWork() {
  const t = useTheme();
  return (
    <Slide gap={48}>
      <Eyebrow>Selected work</Eyebrow>
      <Title width={1300}>Two projects, one question: how should AI feel to use?</Title>
      <Spacer />
      <div>
        {WORK.map(([n, name, line, tags], i) => (
          <div
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 40,
              padding: '40px 0',
              borderTop: `1px solid ${i === 0 ? t.ink : t.line}`,
              borderBottom: i === WORK.length - 1 ? `1px solid ${t.line}` : undefined,
            }}
          >
            <span style={{ width: 80, flexShrink: 0, fontFamily: t.mono, fontSize: 22, color: t.accent }}>{n}</span>
            <span style={{ width: 440, flexShrink: 0, fontFamily: t.serif, fontWeight: 580, fontSize: 72, letterSpacing: '-0.03em' }}>{name}</span>
            <span style={{ flex: 1, fontSize: 30, color: t.ink2 }}>{line}</span>
            <span style={{ width: 320, flexShrink: 0, textAlign: 'right', fontFamily: t.mono, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.ink3 }}>
              {tags}
            </span>
          </div>
        ))}
      </div>
    </Slide>
  );
}
