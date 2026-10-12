'use client';

/**
 * Handouts: the cards PIP can put in the centre of the stage when words are
 * not enough — a case study to open, an address to copy, a link.
 *
 * Every card is one of the designs below, filled from a fixed list of real
 * things (the site's own projects, Shreyas's own address and links). Nothing
 * on a card is written by a model: a card is clickable and looks official,
 * so a made-up link is worse here than a made-up sentence.
 *
 * What decides when one appears is not here. For now the stage shows them
 * from the DialKit panel only, so the designs can be settled first.
 */

import { useState, type CSSProperties, type ReactNode } from 'react';
import { projectsData } from '@/data/projectsData';

export const HANDOUT_EMAIL = 'shreyaspatil.design@gmail.com';

/** The projects a card can be made for: every one on the site, by its title. */
export const HANDOUT_PROJECTS = projectsData.map((p) => p.title);

/** Him, for the cards that are about reaching him. From the tour's own library. */
const PORTRAIT = '/tour/images/headshot-winter.jpg';

export const HANDOUT_LINKS = {
  cameo: {
    title: 'Cameo on npm',
    body: 'The library PIP is built with. Pick a character or make your own, and give your product a face.',
    href: 'https://www.npmjs.com/package/@shrysp/cameo',
    shown: 'npmjs.com/package/@shrysp/cameo',
    image: undefined as string | undefined,
    poster: 'npm i @shrysp/cameo',
  },
  linkedin: {
    title: 'Shreyas on LinkedIn',
    body: 'Where he has worked and studied, and the quickest way to connect.',
    href: 'https://www.linkedin.com/in/shreyastpatil/',
    shown: 'linkedin.com/in/shreyastpatil',
    image: PORTRAIT as string | undefined,
    poster: 'in/shreyastpatil',
  },
} as const;
export type HandoutLink = keyof typeof HANDOUT_LINKS;

export type Handout = { kind: 'project'; project: string } | { kind: 'contact' } | { kind: 'link'; link: HandoutLink };

/** The two ways a card can be a screen — see the note above .tour-handout in tour.css. */
export const HANDOUT_LOOKS = ['photo', 'screen'] as const;
export type HandoutLook = (typeof HANDOUT_LOOKS)[number];

const Arrow = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 11 11 5M6 5h5v5" />
  </svg>
);

function Copy({ text, label = 'Copy address' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="tour-btn"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        });
      }}
    >
      {copied ? 'Copied' : label}
    </button>
  );
}

/** What a card shows, whatever it is about: a picture or a name for the top, and the words under it. */
type Sheet = { image?: string; imageAt?: string; poster: string; text: ReactNode };

function sheetFor(handout: Handout): Sheet {
  if (handout.kind === 'project') {
    const project = projectsData.find((p) => p.title === handout.project) ?? projectsData[0];
    return {
      image: project.images[0],
      poster: project.title.toLowerCase(),
      text: (
        <>
          <p className="tour-handout-eyebrow">
            Case study<span>{project.timeline}</span>
          </p>
          <h2 className="tour-handout-title">{project.title}</h2>
          <p className="tour-handout-body">{project.description[0]}</p>
          <p className="tour-handout-meta">{project.role}</p>
          <div className="tour-handout-actions">
            <a
              className="tour-btn tour-btn--primary"
              href={`/projects/${project.title.toLowerCase()}`}
              target="_blank"
              rel="noreferrer"
            >
              Open case study
              <Arrow />
            </a>
          </div>
        </>
      ),
    };
  }

  if (handout.kind === 'contact') {
    return {
      image: PORTRAIT,
      // His face is in the top third of the portrait.
      imageAt: '50% 22%',
      poster: 'shreyas',
      text: (
        <>
          <p className="tour-handout-eyebrow">One for Shreyas</p>
          <h2 className="tour-handout-title">Ask him directly</h2>
          <p className="tour-handout-body">Some answers are his to give. He reads everything sent here.</p>
          <p className="tour-handout-address">{HANDOUT_EMAIL}</p>
          <div className="tour-handout-actions">
            <a className="tour-btn tour-btn--primary" href={`mailto:${HANDOUT_EMAIL}`}>
              Write to him
            </a>
            <Copy text={HANDOUT_EMAIL} />
          </div>
        </>
      ),
    };
  }

  const link = HANDOUT_LINKS[handout.link];
  return {
    image: link.image,
    imageAt: '50% 22%',
    poster: link.poster,
    text: (
      <>
        <p className="tour-handout-eyebrow">Link</p>
        <h2 className="tour-handout-title">{link.title}</h2>
        <p className="tour-handout-body">{link.body}</p>
        <p className="tour-handout-address">{link.shown}</p>
        <div className="tour-handout-actions">
          <a className="tour-btn tour-btn--primary" href={link.href} target="_blank" rel="noreferrer">
            Open
            <Arrow />
          </a>
          <Copy text={link.href} label="Copy link" />
        </div>
      </>
    ),
  };
}

export function TourHandout({
  handout,
  look,
  leaving,
  onClose,
  style,
}: {
  handout: Handout;
  look: HandoutLook;
  /** On its way out: the same card, playing its exit. */
  leaving: boolean;
  onClose: () => void;
  style?: CSSProperties;
}) {
  const sheet = sheetFor(handout);
  return (
    <div
      className={`tour-handout tour-handout--${look} ${leaving ? 'tour-handout--leaving' : ''}`}
      style={style}
      role="dialog"
      aria-label="From PIP"
      // Space on the window starts and ends the tour — not while a button here has it.
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') e.stopPropagation();
      }}
    >
      {/* Plain imgs throughout: one small card, and files the site already serves. */}
      {/* eslint-disable @next/next/no-img-element */}
      <div className="tour-handout-halo" aria-hidden>
        {sheet.image && <img src={sheet.image} alt="" />}
      </div>
      <div className="tour-handout-screen">
        {sheet.image && <img className="tour-handout-tint" src={sheet.image} alt="" aria-hidden />}
        {sheet.image ? (
          <div className="tour-handout-shot" style={{ '--shot-at': sheet.imageAt } as CSSProperties}>
            <img src={sheet.image} alt="" draggable={false} />
          </div>
        ) : (
          <div className="tour-handout-poster">{sheet.poster}</div>
        )}
        <div className="tour-handout-text">{sheet.text}</div>
      </div>
      {/* eslint-enable @next/next/no-img-element */}
      <button className="tour-handout-close" onClick={onClose} aria-label="Put this away">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  );
}
