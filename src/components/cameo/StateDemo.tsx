'use client';

import { useRef, useState } from 'react';
import { JADE } from '@shrysp/cameo';
import { Character, type CharacterHandle } from '@shrysp/cameo/react';
import '@shrysp/cameo/styles.css';
import { Row, lit, resting } from './DemoParts';

const STATES = ['idle', 'listening', 'thinking', 'speaking', 'error', 'sleeping'] as const;
const GESTURES = ['nod', 'wink', 'yawn', 'stretch'] as const;
const EVENTS = [
  { label: 'success', type: 'action:success' },
  { label: 'error', type: 'action:error' },
  { label: 'submit', type: 'user:submit' },
  { label: 'copy', type: 'copy' },
] as const;

type State = (typeof STATES)[number];

/**
 * The three ways to direct the character, on the character itself: a state it
 * holds, a gesture it plays once, and an event it reacts to before going back
 * to whatever it was doing. The line under the face is the code each button ran.
 */
export default function StateDemo() {
  const character = useRef<CharacterHandle>(null);
  const [state, setState] = useState<State>('idle');
  const [ran, setRan] = useState('<Character state="idle" />');

  return (
    <figure className="isolate relative w-full surface bg-stone-100 -space-y-2 my-3">
      <div className="isolate relative rounded-[calc(var(--surface-radius)-1px)] bg-white overflow-hidden outline outline-stone-200">
        {/* Room above and to the right of the head for the thought bubble */}
        <div className="flex h-72 items-center justify-center">
          <Character ref={character} preset={JADE} size={168} state={state} thoughtBubble />
        </div>
        <p aria-live="polite" className="pb-5 text-center font-mono text-[13px] text-stone-500">
          {ran}
        </p>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4 pt-6">
        <Row name="State" note="Held until it changes">
          {STATES.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={state === name}
              onClick={() => {
                setState(name);
                setRan(`<Character state="${name}" />`);
              }}
              className={state === name ? lit : resting}
            >
              {name}
            </button>
          ))}
        </Row>
        <Row name="Gesture" note="Plays once">
          {GESTURES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                character.current?.setPose(name);
                setRan(`character.setPose("${name}")`);
              }}
              className={resting}
            >
              {name}
            </button>
          ))}
        </Row>
        <Row name="Event" note="A reaction, then back">
          {EVENTS.map(({ label, type }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                character.current?.emit({ type });
                setRan(`character.emit({ type: "${type}" })`);
              }}
              className={resting}
            >
              {label}
            </button>
          ))}
        </Row>
      </div>
    </figure>
  );
}
