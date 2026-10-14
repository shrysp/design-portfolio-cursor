'use client';

/**
 * Handouts: the cards PIP can put in the centre of the stage when words are
 * not enough — a case study to open, or every way to reach Shreyas.
 *
 * A card is mostly its picture. PIP says what a card is about, and the page
 * it opens says the rest, so under the picture there is one line: what kind
 * of card it is, its name, and what it does.
 *
 * Every card is filled from a fixed list of real things (the site's own
 * projects, Shreyas's own address and links). Nothing on a card is written by
 * a model: a card is clickable and looks official, so a made-up link is worse
 * here than a made-up sentence.
 *
 * The contact card can be written on: Write turns its picture into a
 * message to him, sent from the site (/api/contact). The way in uses the
 * same card, already writing, for a visitor without a code.
 *
 * Its styles are its own (handout.css), so it can appear on the way in,
 * where the tour's stylesheet is not loaded.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion as fm, useReducedMotion } from 'framer-motion';
import { Doto } from 'next/font/google';
import { projectsData } from '@/data/projectsData';
import './handout.css';

/** The dot-matrix LCD of the way in (TourEntrance), for a card's tag and its screen with no picture. */
const dots = Doto({ subsets: ['latin'], axes: ['ROND'], variable: '--font-dot', display: 'swap' });

export const HANDOUT_EMAIL = 'shreyaspatil.design@gmail.com';

/** The projects a card can be made for: every one on the site, by its title. */
export const HANDOUT_PROJECTS = projectsData.map((p) => p.title);

/** Him, for the cards that are about reaching him. From the tour's own library. */
const PORTRAIT = '/tour/images/headshot-winter.jpg';
/** Where his face is in the portrait, for a card's wide window: under the fountain, a little below the middle. */
const PORTRAIT_AT = '50% 46%';

/** Where else he is, on the contact card beside his email. The same links as the site's own dock. */
const PROFILES = [
  {
    label: 'Shreyas on X',
    href: 'https://x.com/ShreyasPatil_',
    icon: 'M3.5 3h3.6l3.3 4.6L14.3 3h1.9l-5 5.8L16.6 17H13l-3.6-5-4.4 5H3.1l5.5-6.2z',
  },
  {
    label: 'Shreyas on LinkedIn',
    href: 'https://www.linkedin.com/in/shreyastpatil/',
    icon: 'M4.5 7.5h2.6V16H4.5zM5.8 3.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM9 7.5h2.5v1.2c.4-.8 1.4-1.4 2.7-1.4 2.6 0 3 1.7 3 3.9V16h-2.6v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2V16H9z',
  },
] as const;

/** A case study, or the card for reaching him: his email (to write to here, or copy), X and LinkedIn. */
export type Handout = { kind: 'project'; project: string } | { kind: 'contact' };

/**
 * The message a visitor without a code starts from, on the way in: the ask,
 * and room in [brackets] for who they are. Send stays off until it has been
 * changed and every bracket filled in.
 */
export const CODE_REQUEST = `Hi Shreyas,

I'd love to try the PIP tour. Could you send me an access code?

A bit about me: [who you are, and what brought you here]

Thanks,
[your name]`;
/** A part of a draft still to be filled in. */
const BLANK = /\[[^\]]*\]/;

/** How the card's parts move: one quick ease-out, a little quicker out than in. */
const EASE = [0.23, 1, 0.32, 1] as const;

const Arrow = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 11 11 5M6 5h5v5" />
  </svg>
);

/**
 * Copies, and says so — in the same size either way: both labels are always
 * there, one over the other, and only one shows, so the button never changes
 * width under the pointer.
 */
function Copy({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="handout-btn"
      // Lit green for a moment, in its own weight: nothing about its size changes.
      data-done={copied ? '' : undefined}
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        });
      }}
    >
      <span className="handout-btn-labels">
        <span data-on={!copied}>{label}</span>
        <span data-on={copied} aria-hidden={!copied}>
          Copied
        </span>
      </span>
    </button>
  );
}

/** A line on the window's LCD, typed out in dots and sized to its length: a name fills the screen, a command fits it. */
function Lcd({ line }: { line: string }) {
  return (
    <div className="handout-window handout-window--lcd">
      <p className="handout-poster" style={{ fontSize: Math.round(Math.min(48, Math.max(22, 470 / line.length))) }}>
        <span className="sr-only">{line}</span>
        {[...line].map((c, i) => (
          <span key={i} style={{ '--i': i } as CSSProperties} aria-hidden>
            {c === ' ' ? ' ' : c}
          </span>
        ))}
      </p>
    </div>
  );
}

function Picture({ src, at }: { src: string; at?: string }) {
  return (
    <div className="handout-window" style={{ '--shot-at': at } as CSSProperties}>
      {/* A plain img: one small card, and a file the site already serves. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} />
    </div>
  );
}

type Status = 'writing' | 'sending' | 'sent' | 'error';

/**
 * A message to Shreyas, written on the card: who to reply to, and what to
 * say. Sent from the site; where it cannot be (no mail service set up), the
 * same message opens in the visitor's own mail app instead.
 */
function Composer({
  status,
  from,
  setFrom,
  message,
  setMessage,
  note,
  hint,
  onCancel,
}: {
  status: Status;
  /** What is left to do before it can be sent. */
  hint: string | null;
  from: string;
  setFrom: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  note: string | null;
  onCancel: () => void;
}) {
  const first = useRef<HTMLInputElement>(null);
  /** The next part in [brackets], selected, so typing replaces it. */
  const pickBlank = (el: HTMLTextAreaElement) => {
    const m = BLANK.exec(el.value);
    if (m) el.setSelectionRange(m.index, m.index + m[0].length);
  };
  useEffect(() => {
    first.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div
      className="handout-window handout-compose"
      // Typing here is typing: not the stage's shortcuts, and Escape puts the pen down.
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') onCancel();
      }}
    >
      <input
        ref={first}
        className="handout-input"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="Your email, for his reply"
        aria-label="Your email"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        disabled={status === 'sending'}
      />
      <textarea
        className="handout-input handout-textarea"
        placeholder="What would you like to ask him?"
        aria-label="Your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        // After the click has placed the caret, so the selection is ours.
        onFocus={(e) => {
          const el = e.currentTarget;
          requestAnimationFrame(() => pickBlank(el));
        }}
        onKeyDown={(e) => {
          // Tab from one blank to the next while there are any.
          if (e.key === 'Tab' && !e.shiftKey && BLANK.test(e.currentTarget.value)) {
            e.preventDefault();
            pickBlank(e.currentTarget);
          }
        }}
        maxLength={4000}
        disabled={status === 'sending'}
      />
      <p className={`handout-note ${note ? '' : 'handout-note--hint'}`} role={note ? 'alert' : undefined}>
        {note ?? hint}
      </p>
    </div>
  );
}

/** What a card is: its window, its tag and name, and what it does. */
type Sheet = { window: ReactNode; tag: string; title: string; actions: ReactNode };

export function TourHandout({
  handout,
  leaving,
  onClose,
  writing: startWriting = false,
  draft = '',
  where = 'tour',
  className = '',
  style,
}: {
  handout: Handout;
  /** On its way out: the same card, playing its exit. */
  leaving: boolean;
  onClose: () => void;
  /** The contact card, opened already writing (the way in, for a visitor without a code). */
  writing?: boolean;
  /** A message to start from (CODE_REQUEST on the way in); Send waits until it has been made theirs. */
  draft?: string;
  /** Where the card is, for the message it sends. */
  where?: 'tour' | 'entrance';
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const [writing, setWriting] = useState(startWriting);
  const [status, setStatus] = useState<Status>('writing');
  const [from, setFrom] = useState('');
  const [message, setMessage] = useState(draft);
  const [note, setNote] = useState<string | null>(null);
  const honey = useRef<HTMLInputElement>(null);

  const mailto = `mailto:${HANDOUT_EMAIL}?body=${encodeURIComponent(message)}`;
  const send = async () => {
    if (status === 'sending') return;
    setStatus('sending');
    setNote(null);
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, message, where, website: honey.current?.value ?? '' }),
    }).catch(() => null);
    if (res?.ok) {
      setStatus('sent');
      return;
    }
    const error = (await res?.json().catch(() => null))?.error as string | undefined;
    setStatus('error');
    // No mail service here: the message goes to their own mail app instead.
    if (error === 'unavailable') window.location.href = mailto;
    else setNote(error ?? 'It didn’t send. Check your connection, then try again.');
  };
  const stopWriting = () => {
    setWriting(false);
    setStatus('writing');
    setNote(null);
    if (startWriting) onClose();
  };

  let sheet: Sheet;
  if (handout.kind === 'project') {
    const project = projectsData.find((p) => p.title === handout.project) ?? projectsData[0];
    sheet = {
      window: project.images[0] ? <Picture src={project.images[0]} /> : <Lcd line={project.title.toLowerCase()} />,
      tag: 'Case study',
      title: project.title,
      actions: (
        <a className="handout-btn handout-btn--go" href={`/projects/${project.title.toLowerCase()}`} target="_blank" rel="noreferrer">
          Open
          <Arrow />
        </a>
      ),
    };
  } else if (!writing) {
    sheet = {
      window: <Picture src={PORTRAIT} at={PORTRAIT_AT} />,
      tag: 'Contact',
      title: 'Shreyas',
      actions: (
        <>
          {PROFILES.map((p) => (
            <a key={p.href} className="handout-btn handout-btn--icon" href={p.href} target="_blank" rel="noreferrer" aria-label={p.label} title={p.label}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d={p.icon} />
              </svg>
            </a>
          ))}
          <Copy text={HANDOUT_EMAIL} label="Copy email" />
          <button type="button" className="handout-btn handout-btn--go" onClick={() => setWriting(true)}>
            Write
          </button>
        </>
      ),
    };
  } else if (status === 'sent') {
    sheet = {
      window: <Lcd line="sent" />,
      tag: 'Sent',
      title: `He’ll reply to ${from}`,
      actions: (
        <button type="button" className="handout-btn handout-btn--go" onClick={onClose}>
          Done
        </button>
      ),
    };
  } else {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(from.trim());
    // A draft is theirs once it is changed and nothing is left in [brackets].
    const blanks = BLANK.test(message);
    const untouched = draft !== '' && message.trim() === draft.trim();
    const ready = emailOk && message.trim().length > 0 && !untouched && !blanks;
    const hint = blanks ? 'Fill in the parts in [brackets] to send.' : !emailOk && from.trim() ? 'Add an email he can reply to.' : null;
    sheet = {
      window: (
        <Composer
          status={status}
          from={from}
          setFrom={setFrom}
          message={message}
          setMessage={setMessage}
          note={note}
          hint={hint}
          onCancel={stopWriting}
        />
      ),
      tag: 'Writing',
      title: 'To Shreyas',
      actions: (
        <>
          <button type="button" className="handout-btn" onClick={stopWriting}>
            Cancel
          </button>
          <button type="button" className="handout-btn handout-btn--go" onClick={() => void send()} disabled={!ready || status === 'sending'}>
            <span className="handout-btn-labels">
              <span data-on={status !== 'sending'}>Send</span>
              <span data-on={status === 'sending'} aria-hidden={status !== 'sending'}>
                Sending
              </span>
            </span>
          </button>
        </>
      ),
    };
  }

  // A change of what the window shows — writing, sent — swaps through a blur, not a cut.
  const face = handout.kind === 'contact' ? (writing ? status === 'sent' ? 'sent' : 'writing' : 'card') : 'card';
  const swap = reduce
    ? {}
    : {
        initial: { opacity: 0, filter: 'blur(6px)' },
        animate: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.24, ease: EASE } },
        exit: { opacity: 0, filter: 'blur(6px)', transition: { duration: 0.16, ease: EASE } },
      };

  return (
    <div
      // Plastic, like the bar: in front of the CRT glass, which leaves it clear.
      className={`tour-handout ${dots.variable} ${leaving ? 'tour-handout--leaving' : ''} ${className}`}
      data-crt-clear
      style={style}
      role="dialog"
      aria-label={handout.kind === 'contact' ? 'Write to Shreyas' : 'From PIP'}
      // Space on the window starts and ends the tour — not while a button here has it.
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') e.stopPropagation();
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <fm.div key={face} className="handout-face" {...swap}>
          {sheet.window}
        </fm.div>
      </AnimatePresence>
      <div className="handout-line">
        <span className="handout-tag">{sheet.tag}</span>
        <span className="handout-title">{sheet.title}</span>
        <span className="handout-actions">{sheet.actions}</span>
      </div>
      {/* Not while writing: Cancel is the way out then, and the corner is the field's. */}
      {face !== 'writing' && (
        <button type="button" className="handout-btn handout-btn--round handout-close" onClick={onClose} aria-label="Put this away" title="Put this away">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      )}
      {/* For bots only: a person never sees or fills it. */}
      <input ref={honey} className="handout-honey" tabIndex={-1} autoComplete="off" aria-hidden name="website" />
    </div>
  );
}
