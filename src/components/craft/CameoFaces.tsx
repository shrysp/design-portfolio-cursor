"use client";

import { Fragment, useRef, useState } from "react";
import { JADE, NOVA, PIP, TIDE } from "@shrysp/cameo";
import { Character, type CharacterHandle } from "@shrysp/cameo/react";
import "@shrysp/cameo/styles.css";

// The package's own characters; pressing the face moves on to the next
const characters = [
  { name: "Pip", preset: PIP },
  { name: "Jade", preset: JADE },
  { name: "Nova", preset: NOVA },
  { name: "Tide", preset: TIDE },
];

// States the face holds until another is picked
const moods = [
  { id: "idle", label: "Idle" },
  { id: "thinking", label: "Thinking" },
  { id: "sleeping", label: "Sleeping" },
  { id: "happy", label: "Happy" },
] as const;

type Mood = (typeof moods)[number]["id"];

// Cameo, live: one of its characters, which blinks and follows the cursor as
// it does anywhere, with a row of buttons to put it through its states. That
// is the truest picture of a library whose whole point is how it moves.
export default function CameoFaces() {
  const face = useRef<CharacterHandle>(null);
  const [mood, setMood] = useState<Mood>("idle");
  const [characterIndex, setCharacterIndex] = useState(0);
  const character = characters[characterIndex];

  const pill = "aqua h-7 px-2.5 text-[12px] font-medium";

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#f2f4f5] [container-type:inline-size]">
      <button
        type="button"
        onClick={() => setCharacterIndex((index) => (index + 1) % characters.length)}
        aria-label={`${character.name}. Show the next character`}
        title="Next character"
        // A third of the tile's width, so the face scales with the wall's columns
        className="w-[34cqw] cursor-pointer outline-none rounded-3xl focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f2f4f5]"
      >
        <Character ref={face} preset={character.preset} state={mood} fill />
      </button>

      {/* Along the foot of the tile, leaving the face the middle to itself */}
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-1.5 px-3 pb-[4cqw]">
        {moods.map(({ id, label }, index) => (
          <Fragment key={id}>
            <button
              type="button"
              onClick={() => setMood(id)}
              aria-pressed={mood === id}
              className={`${pill} ${mood === id ? "aqua-blue" : "aqua-to-blue [--aqua-ink:var(--color-stone-600)]"}`}
            >
              {label}
            </button>
            {/* Wink sits second. It's a gesture, not a state: it plays once
                and the face returns to itself. */}
            {index === 0 && (
              <button
                type="button"
                onClick={() => face.current?.setPose("wink")}
                className={`${pill} aqua-to-blue [--aqua-ink:var(--color-stone-600)]`}
              >
                Wink
              </button>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
