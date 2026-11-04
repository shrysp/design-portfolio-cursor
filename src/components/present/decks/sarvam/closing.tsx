'use client';

import { Label, Slide, Text, Title, useTheme } from '../../primitives';
import { FIELD_BACKGROUND, GatewayField } from './theme';
import { PreparedFor } from './intro';

const REASONS: [string, string, string][] = [
  ['01 · Cameo', 'Voice that feels alive', 'A design layer on a speech pipeline, where text arriving before audio became design material.'],
  ['02 · Quinn', 'AI as a system', 'Frameworks that let an AI product grow more capable without getting harder to use.'],
  ['02 · Quinn', 'AI you can follow', 'The prompt bar shows what the AI is doing at every step, and lets people step in.'],
];

export function WhySarvam() {
  const t = useTheme();
  return (
    <Slide footer={false} background={FIELD_BACKGROUND} padding="0">
      <GatewayField />
      <div style={{ position: 'absolute', top: 150, left: 260, right: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, textAlign: 'center' }}>
        <div style={{ fontFamily: t.mono, fontSize: 20, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#E8EFFC' }}>Why Sarvam</div>
        <Title size={80} weight={420} color="#FFFFFF">
          Sarvam means all. Designing AI for everyone is an interaction problem.
        </Title>
      </div>
      <div style={{ position: 'absolute', left: 128, right: 128, bottom: 112, display: 'flex', gap: 24 }}>
        {REASONS.map(([label, head, body]) => (
          <div
            key={head}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 32, borderRadius: 24, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)' }}
          >
            <Label size={16} color={t.accent}>
              {label}
            </Label>
            <div style={{ fontFamily: t.serif, fontWeight: 580, fontSize: 36, letterSpacing: '-0.02em', color: t.ink }}>{head}</div>
            <Text size={22}>{body}</Text>
          </div>
        ))}
      </div>
    </Slide>
  );
}

export function ThankYou() {
  const t = useTheme();
  return (
    <Slide footer={false} background={FIELD_BACKGROUND} padding="0">
      <GatewayField />
      <div style={{ position: 'absolute', inset: '300px 360px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, textAlign: 'center' }}>
        <div style={{ fontFamily: t.mono, fontSize: 20, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#E8EFFC' }}>Shreyas Patil · Product Designer</div>
        <Title size={144} weight={420} color="#FFFFFF" style={{ lineHeight: 1 }}>
          Thank you
        </Title>
        <Text size={28} color="#FAF8F5">
          shreyaspatil.design@gmail.com
        </Text>
      </div>
      <PreparedFor date={false} />
    </Slide>
  );
}
