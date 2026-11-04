'use client';

import type { ReactNode } from 'react';
import { Column, Columns, Eyebrow, Img, Label, Notes, Panel, Slide, Spacer, Text, Title, useTheme } from '../../primitives';
import { GatewayWindow } from './theme';
import { MasterTableScreen, OpenerScreen } from './quinn-ui/MasterTable';
import { PromptStates } from './quinn-ui/PromptStates';
import { SearchToGroup } from './quinn-ui/SearchToGroup';
import { Research } from './quinn-ui/Research';
import { Playbooks } from './quinn-ui/Playbooks';
import { Pantry } from './quinn-ui/Pantry';

const IMG = '/images/projects/Quinn';

export function QuinnOpener() {
  const t = useTheme();
  return (
    <Slide footer={false} padding="0">
      <div style={{ position: 'absolute', left: 870, top: 150 }}>
        <OpenerScreen />
      </div>
      <div style={{ position: 'absolute', left: 128, top: 112, bottom: 96, width: 640, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Eyebrow>Project 02</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <Title size={160} style={{ lineHeight: 0.94, letterSpacing: '-0.04em' }}>
            Quinn
          </Title>
          <Text size={30}>AI-native relationship intelligence for how executives manage and maintain their professional networks.</Text>
          <div style={{ display: 'flex', gap: 48, borderTop: `1px solid ${t.line}`, paddingTop: 24 }}>
            {[
              ['Role', 'Product Designer'],
              ['Timeline', 'May – Jul 2025'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Label>{k}</Label>
                <span style={{ fontSize: 26, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  );
}

export function QuinnOverview() {
  return (
    <Slide>
      <Eyebrow>02 — Quinn · Overview</Eyebrow>
      <Title width={1500}>Bridging the gap between a CRM and real relationship intelligence</Title>
      <Spacer />
      <Columns
        items={[
          { label: 'The brief', body: 'I worked with a founder, previously a chief of staff, to turn his idea for relationship management into a comprehensive product vision.' },
          { label: 'My role', body: 'Translate stakeholder pain into scalable product architecture, design a progressive complexity framework, and test positioning through design decisions.' },
          { label: 'The output', body: "In three months, a product vision for the next 10–12: the system's foundations, its long-term evolution and growth direction." },
        ]}
      />
    </Slide>
  );
}

export function QuinnProblem() {
  const t = useTheme();
  return (
    <Slide dark>
      <GatewayWindow />
      <Eyebrow dark>02 — Quinn · When networks become liabilities</Eyebrow>
      <Spacer />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 80 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Title size={240} color="#F9BB9E" style={{ lineHeight: 0.92, letterSpacing: '-0.05em' }}>
            30M
          </Title>
          <Label size={20} color={t.inverseLabel}>
            Followers across platforms
          </Label>
        </div>
        <Title size={56} style={{ flex: 1, paddingBottom: 8, letterSpacing: '-0.02em' }}>
          An enormous business asset that was essentially unusable, because it lived in fragmented silos.
        </Title>
      </div>
      <Text color={t.inverse2} width={1300} style={{ paddingTop: 24 }}>
        The founder came from a chief of staff role where he saw this first-hand: his CEO&apos;s relationships were spread across every platform, and none of it could be queried.
      </Text>
    </Slide>
  );
}

const PROBLEMS: [string, string][] = [
  ['Scattered', 'Relationships across LinkedIn, email, X and Instagram with no connection.'],
  ['Missed moments', 'Job changes, funding announcements and acquisitions went by unnoticed.'],
  ['No querying', 'No way to ask strategic questions of the network.'],
  ['Manual upkeep', "Maintenance that executives couldn't scale."],
];

export function QuinnCoreProblems() {
  const t = useTheme();
  return (
    <Slide>
      <Eyebrow>02 — Quinn · The core problems</Eyebrow>
      <Title width={1500}>
        Nobody could ask: <span style={{ color: t.accent }}>“Who do I know at Series A startups?”</span>
      </Title>
      <Spacer />
      <div style={{ display: 'flex', gap: 32 }}>
        {PROBLEMS.map(([head, body], i) => (
          <div key={head} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: 32, borderRadius: 24, background: '#F5F5F5' }}>
            <span style={{ fontFamily: t.mono, fontSize: 20, color: t.accent }}>{String(i + 1).padStart(2, '0')}</span>
            <div style={{ fontFamily: t.serif, fontWeight: 580, fontSize: 36, letterSpacing: '-0.02em' }}>{head}</div>
            <Text size={24}>{body}</Text>
          </div>
        ))}
      </div>
    </Slide>
  );
}

function ImageSlide({ eyebrow, title, children, image }: { eyebrow: string; title: string; children: ReactNode; image: ReactNode }) {
  return (
    <Slide row gap={72}>
      <Column width={620} gap={36}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title size={64}>{title}</Title>
        {children}
      </Column>
      <Panel style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{image}</Panel>
    </Slide>
  );
}

export function QuinnSpreadsheet() {
  const t = useTheme();
  return (
    <ImageSlide
      eyebrow="02 — Quinn · Research"
      title="An investor kept a spreadsheet of designers"
      image={<Img src={`${IMG}/Email.png`} alt="An email from an investor about relying on static spreadsheets" style={{ width: 972, height: 729 }} />}
    >
      <Text size={26}>SF-based designers, with availability, company and seniority, updated by hand every few months. Always out of date, always missing connections.</Text>
      <Spacer />
      <div style={{ borderLeft: `3px solid ${t.mark}`, paddingLeft: 24, fontFamily: t.serif, fontStyle: 'italic', fontSize: 32, lineHeight: 1.3, color: t.ink }}>
        In relationship-driven business, your network is a competitive advantage, but only if you can systematically leverage it.
      </div>
    </ImageSlide>
  );
}

export function QuinnInsight() {
  return (
    <ImageSlide
      eyebrow="02 — Quinn · The insight"
      title="Queryable relationship graphs, not static contact databases"
      image={<Img src={`${IMG}/Relationship-Graph.png`} alt="Early relationship graph capabilities" style={{ width: 972, height: 729 }} />}
    >
      <Text size={26}>The design question became: how do you let executives ask strategic questions of their network and get intelligent answers?</Text>
      <Spacer />
      <Label>Early relationship graph capabilities →</Label>
    </ImageSlide>
  );
}

export function QuinnFirstDirection() {
  const t = useTheme();
  return (
    <ImageSlide
      eyebrow="02 — Quinn · First direction"
      title="A chief of staff for everyone"
      image={
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
          <Img src={`${IMG}/Contextual-Cards.png`} alt="Early mobile mockups of a personal chief-of-staff app" fit="cover" style={{ width: 760, height: 1758, objectPosition: 'top' }} />
        </div>
      }
    >
      <Text size={26}>I explored a personal chief-of-staff approach: a mobile AI that could handle scheduling, reminders and relationship management.</Text>
      <Spacer />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: `1px solid ${t.line}`, paddingTop: 24 }}>
        <Label color="#A5460F">Strongly held — and wrong</Label>
        <Text size={24}>A clear, opinionated direction gave the founder something concrete to push against.</Text>
      </div>
    </ImageSlide>
  );
}

export function QuinnPivot() {
  const t = useTheme();
  return (
    <Slide dark>
      <GatewayWindow />
      <Eyebrow dark>02 — Quinn · The pivot</Eyebrow>
      <Spacer />
      <Title size={104} width={1560}>
        “Strictly for business use cases. This needs to solve a specific business intelligence problem.”
      </Title>
      <Text color={t.inverse2} width={1200}>
        The founder&apos;s feedback on the chief-of-staff direction. I pivoted quickly: clear direction creates momentum, even when it has to change.
      </Text>
    </Slide>
  );
}

export function QuinnPantry() {
  const t = useTheme();
  return (
    <Slide row gap={72}>
      <Column width={620} gap={36}>
        <Eyebrow>02 — Quinn · The Pantry</Eyebrow>
        <Title size={64}>Everything we could build, then one question to cut it</Title>
        <Text size={26}>A feature brainstorm, from “Dead to Me” to “Tinder Quinn”. Then one question decided what made the cut.</Text>
        <Spacer />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 28, borderRadius: 20, background: '#E8EFFC' }}>
          <Label color="#3333CC">The focus question</Label>
          <Text size={26} color={t.ink} style={{ fontWeight: 500 }}>
            What specifically lets people query their relationships, get intelligent answers, and take strategic business action?
          </Text>
        </div>
      </Column>
      <Pantry />
    </Slide>
  );
}

const LAYERS: [string, string, string, string, string][] = [
  ['Layer 1', 'Search', 'Natural-language queries that create temporary contact tables.', '#E8EFFC', '#3333CC'],
  ['Layer 2', 'Groups', 'Save valuable queries as persistent, auto-updating collections.', '#A7C0F1', '#212191'],
  ['Layer 3', 'Playbooks', 'Goal-oriented workflows that optimise relationships for a specific outcome.', '#4250D5', '#D2DFF9'],
];

export function QuinnFramework() {
  const t = useTheme();
  return (
    <Slide>
      <Eyebrow>02 — Quinn · The framework</Eyebrow>
      <Title width={1500}>Progressive complexity: each layer solves a business problem and earns the next</Title>
      <div style={{ flex: 1, display: 'flex', gap: 24, alignItems: 'flex-end' }}>
        {LAYERS.map(([layer, name, body, bg, label], i) => {
          const last = i === LAYERS.length - 1;
          return (
            <div key={name} style={{ flex: 1, height: 300 + i * 140, borderRadius: '24px 24px 0 0', background: bg, padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Label color={label}>{layer}</Label>
              <div style={{ fontFamily: t.serif, fontWeight: 580, fontSize: 48, letterSpacing: '-0.02em', color: last ? t.inverse : t.ink }}>{name}</div>
              <Text size={24} color={last ? '#E8EFFC' : t.ink2}>
                {body}
              </Text>
            </div>
          );
        })}
      </div>
    </Slide>
  );
}

function PanelSlide({ eyebrow, title, intro, notes, shot }: { eyebrow: string; title: string; intro: string; notes: [string, string][]; shot: ReactNode }) {
  return (
    <Slide row gap={72}>
      <Column>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title size={56}>{title}</Title>
        <Text size={24}>{intro}</Text>
        <Spacer />
        <Notes items={notes} />
      </Column>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>{shot}</div>
    </Slide>
  );
}

export function QuinnMasterTable() {
  return (
    <PanelSlide
      eyebrow="02 — Quinn · Layer 1"
      title="The master table is the foundation"
      intro="Every later feature enhances this table rather than replacing it."
      notes={[
        ['People first.', 'Each row leads with a person, not a data point.'],
        ['Strength at a glance.', 'Colour-coded rings show relationship depth.'],
        ['Recent context.', 'Timely conversation starters for outreach.'],
        ['Ask in plain language.', 'No complex filter setup for busy executives.'],
      ]}
      shot={<MasterTableScreen />}
    />
  );
}

const PROMPT_NOTES: [string, string, number][] = [
  ['Suggested commands.', 'Prompts like “Filter to Series B” show what the AI can do.', 1],
  ['Confirm before it runs.', 'A 5-second countdown to review the columns it will add.', 3],
  ['Always stoppable.', 'Progress and time left stay visible, with stop one click away.', 4],
];

export function QuinnInteractionDetails() {
  const t = useTheme();
  return (
    <Slide row gap={72}>
      <PromptStates
        notes={({ active, jump }) => (
          <Column>
            <Eyebrow>02 — Quinn · Interaction details</Eyebrow>
            <Title size={56}>The prompt bar narrates what the AI is doing</Title>
            <Text size={24}>Bounded AI feels predictable. One small surface shows every step, and the user can step in at any of them.</Text>
            <Spacer />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {PROMPT_NOTES.map(([head, body, step], i) => {
                const on = active === step;
                return (
                  <button
                    key={head}
                    type="button"
                    onClick={() => jump(step)}
                    style={{
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      borderTop: `1px solid ${i === 0 ? t.ink : t.line}`,
                      borderBottom: i === PROMPT_NOTES.length - 1 ? `1px solid ${t.line}` : undefined,
                      padding: '16px 0 16px 18px',
                      position: 'relative',
                      fontFamily: t.sans,
                      fontSize: 22,
                      lineHeight: 1.45,
                      color: on ? t.ink : t.ink2,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ position: 'absolute', left: 0, top: 18, bottom: 18, width: 4, borderRadius: 2, background: on ? t.accent : 'transparent', transition: 'background 200ms' }} />
                    <strong style={{ fontWeight: 600, color: t.ink }}>{head}</strong> {body}
                  </button>
                );
              })}
            </div>
          </Column>
        )}
      />
    </Slide>
  );
}

export function QuinnSearchToGroup() {
  const t = useTheme();
  const caption = (n: number, head: string, body: string) => (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 13, background: t.mark, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.mono, fontSize: 13 }}>
        {n}
      </span>
      <Text size={22}>
        <strong style={{ fontWeight: 600, color: t.ink }}>{head}</strong> {body}
      </Text>
    </div>
  );
  return (
    <Slide>
      <Eyebrow>02 — Quinn · Layer 2</Eyebrow>
      <Title size={64} width={1500}>
        From a precise search to a group you can keep
      </Title>
      <SearchToGroup
        captions={[caption(1, 'Granular filters.', 'Narrow by strength, role, channel or location.'), caption(2, 'Save as a Group.', 'Any filtered result becomes a persistent, shareable collection.')]}
      />
    </Slide>
  );
}

export function QuinnResearch() {
  return (
    <PanelSlide
      eyebrow="02 — Quinn · Layer 2"
      title="Groups that keep researching themselves"
      intro="A saved search stops being a static list. It becomes relationship intelligence that stays current."
      notes={[
        ['Always up to date.', 'Groups refresh on their own and say when they last did.'],
        ['Ask for new data.', '“Add funding data” starts research that adds the columns for you.'],
      ]}
      shot={<Research />}
    />
  );
}

export function QuinnPlaybooks() {
  return (
    <PanelSlide
      eyebrow="02 — Quinn · Layer 3"
      title="Playbooks turn relationships into next steps"
      intro="Multi-step relationship strategies with a clear goal, surfaced as daily updates."
      notes={[
        ['A goal per playbook.', '“Potential SPC Member”, “Portfolio Companies Hiring”.'],
        ['Q-Score.', 'How likely this person is to convert toward that goal.'],
        ['One suggested action.', 'Send Email for hiring, Source Introductions for partners.'],
      ]}
      shot={<Playbooks />}
    />
  );
}

export function QuinnQScore() {
  const t = useTheme();
  const card = (goal: string, score: string, high: boolean, body: string) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, padding: 40, borderRadius: 28, background: high ? '#E8EFFC' : '#F5F5F5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label size={20} color={high ? '#3333CC' : t.ink3}>
          {goal}
        </Label>
        <span
          style={{
            padding: '10px 20px',
            borderRadius: 999,
            fontSize: 22,
            fontWeight: 600,
            background: high ? t.accent : '#FFFFFF',
            color: high ? t.inverse : t.ink2,
            border: high ? undefined : '1px solid #CCCCCC',
          }}
        >
          {score}
        </span>
      </div>
      <div style={{ fontFamily: t.serif, fontWeight: 580, fontSize: 48, letterSpacing: '-0.02em' }}>Sambhav Anand · Fulcrum</div>
      <Text size={26}>{body}</Text>
    </div>
  );
  return (
    <Slide>
      <Eyebrow>02 — Quinn · Contextual Q-Score</Eyebrow>
      <Title width={1500}>The same person scores differently depending on your goal</Title>
      <Spacer />
      <div style={{ display: 'flex', gap: 32 }}>
        {card('Goal · Hiring', 'High Q-Score', true, 'Fulcrum recently posted engineering roles, so he is worth reaching out to now.')}
        {card('Goal · Fundraising', 'Low Q-Score', false, "Fulcrum just completed its Series A, so this isn't the moment.")}
      </div>
      <Text size={26} width={1300} style={{ paddingTop: 8 }}>
        A score is only useful if it answers <strong style={{ fontWeight: 600, color: t.ink }}>“useful for what?”</strong> — so the score is computed against the user&apos;s current objective, not as a single global number.
      </Text>
    </Slide>
  );
}

export function QuinnPrecedent() {
  const t = useTheme();
  const rows: [string, string][] = [
    ['Master database', 'immediate utility'],
    ['Smart filtering', 'query capabilities'],
    ['Dynamic groups', 'persistent intelligence'],
    ['AI playbooks', 'strategic automation'],
  ];
  return (
    <ImageSlide
      eyebrow="02 — Quinn · Precedent"
      title="The iTunes and Spotify pattern, applied to people"
      image={<Img src={`${IMG}/Inspirations.png`} alt="iTunes and Spotify library screens" style={{ width: 992, height: 744 }} />}
    >
      <Text size={26}>Both started with a comprehensive database that was useful on day one, then layered intelligence on top.</Text>
      <Spacer />
      <div>
        {rows.map(([a, b], i) => (
          <div
            key={a}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '14px 0',
              fontSize: 22,
              color: t.ink2,
              borderTop: `1px solid ${i === 0 ? t.ink : t.line}`,
              borderBottom: i === rows.length - 1 ? `1px solid ${t.line}` : undefined,
            }}
          >
            <strong style={{ fontWeight: 600, color: i === rows.length - 1 ? t.accent : t.ink }}>{a}</strong>
            <span>{b}</span>
          </div>
        ))}
      </div>
    </ImageSlide>
  );
}

export function QuinnLearned() {
  return (
    <Slide dark>
      <Eyebrow dark>02 — Quinn · What I learned</Eyebrow>
      <Title width={1400}>Three things I now design by</Title>
      <Spacer />
      <Columns
        dark
        items={[
          { label: '01', title: 'Focus on the golden path', body: 'Find the core 80% use case and make it exceptional. For Quinn: executive relationship querying over casual networking.' },
          { label: '02', title: 'Strong opinions, loosely held', body: '“Chief of staff for everyone” was strongly held and wrong. A clear hypothesis made the pivot fast.' },
          { label: '03', title: 'Systems that evolve', body: 'Search, groups and scoring work as one theory of the system. The table became the foundation, not just a contact list.' },
        ]}
      />
    </Slide>
  );
}
