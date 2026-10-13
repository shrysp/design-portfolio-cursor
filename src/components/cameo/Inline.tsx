"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import {
  DEFAULT_CONFIG,
  HOUSING_W,
  JADE,
  NOVA,
  PIP,
  TIDE,
  createEngine,
  housingHeight,
  resolvePalette,
  type EngineConfig,
  type Frame,
} from "@shrysp/cameo";
import { CharacterView } from "@shrysp/cameo/react";
import "@shrysp/cameo/styles.css";

const PRESETS = { JADE, NOVA, PIP, TIDE };
const STILL: EngineConfig = {
  ...DEFAULT_CONFIG,
  blinking: false,
  saccades: false,
  idleMotion: false,
  lookStrength: 0,
};
// A gesture is caught part-way through; anything else once it has settled
const MID_GESTURE: Record<string, number> = {
  wink: 0.3,
  nod: 0.2,
  yawn: 0.7,
  stretch: 0.55,
};

const frames = new Map<string, Frame>();
function frameOf(preset: keyof typeof PRESETS, pose: string) {
  const key = `${preset}:${pose}`;
  let frame = frames.get(key);
  if (!frame) {
    const engine = createEngine("idle", PRESETS[preset].eyeBuild);
    engine.setPose(pose, 2, STILL);
    frame = engine.sample(
      2 + (MID_GESTURE[pose] ?? 30),
      { voice: pose === "speaking" ? 0.6 : 0 },
      STILL,
    );
    frames.set(key, frame);
  }
  return frame;
}

const subscribe = () => () => {};
const WIDTH = 27;

/**
 * The character's face at the size of a word, to sit in a sentence beside the
 * word it shows, which can be given to it so the two never part at a line's
 * end. A still: one frame of the real engine in that pose.
 */
export function Face({
  pose = "idle",
  preset = "PIP",
  children,
}: {
  pose?: string;
  preset?: keyof typeof PRESETS;
  children?: ReactNode;
}) {
  // Drawn in the browser only: the engine's numbers differ in their last digit on the server
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const character = PRESETS[preset];
  const scale = WIDTH / HOUSING_W;
  const height = housingHeight(character.silhouette) * scale;
  // Set by its middle, not its baseline: the character inside is laid out at full size and scaled down, so its own baseline is far below the line
  const face = (
    <span
      aria-hidden="true"
      className="relative -top-px mr-1.5 ml-0.5 inline-block align-middle"
      style={{ width: WIDTH, height }}
    >
      {mounted && (
        <span className="char-stage-frame" style={{ width: WIDTH, height }}>
          <CharacterView
            frame={frameOf(preset, pose)}
            silhouette={character.silhouette}
            palette={resolvePalette(character)}
            polarity={character.polarity}
            scanlines={false}
            scale={scale}
          />
        </span>
      )}
    </span>
  );
  // With the word it shows, the two stay on one line together
  return children ? (
    <span className="whitespace-nowrap">
      {face}
      {children}
    </span>
  ) : (
    face
  );
}

/** A word or two with the icon of the thing it names, set a little apart from the sentence around it. */
export function Term({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="whitespace-nowrap font-medium text-stone-800">
      <span
        aria-hidden="true"
        className="mr-1 inline-block align-[-0.12em] text-stone-400"
      >
        {icon}
      </span>
      {children}
    </span>
  );
}

/** A step's number, drawn like the numbered markers on a figure, so a sentence can point at one. */
export function Step({ n }: { n: number }) {
  return (
    <span className="relative -top-px mx-0.5 inline-grid size-[1.15rem] place-items-center rounded-full bg-blue-500 align-middle text-[0.7rem] leading-none font-semibold text-white tabular-nums shadow-[inset_0_0_0_1px_var(--color-blue-700)]">
      {n}
    </span>
  );
}
