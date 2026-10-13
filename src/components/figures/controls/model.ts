// What the control box shows: the three ways a product directs the character.
// A state is held until it changes, a gesture plays once, and an event is a
// reaction on top of whatever is held, after which the face goes back to it.
// The poses and their timings are the package's own.

import { DEFAULT_REACTIONS, POSE_MAP } from "@shrysp/cameo";

export const STATES = ["idle", "listening", "thinking", "speaking", "error", "sleeping"] as const;
export const GESTURES = ["nod", "wink", "yawn", "stretch"] as const;
/** What can happen around the character, by the names the package gives them. */
export const EVENTS = [
  { name: "success", type: "action:success" },
  { name: "error", type: "action:error" },
  { name: "copy", type: "copy" },
  { name: "hover", type: "target:hover" },
] as const;

export type State = (typeof STATES)[number];

/** How long a gesture takes, start to finish, in seconds: out, held, and back. */
export function lengthOf(gesture: string) {
  const pose = POSE_MAP[gesture];
  return (pose?.duration ?? 0.4) + (pose?.hold ?? 0) + (pose?.releaseDuration ?? 0.4);
}

/** What the face does about an event, and for how long. Some react with a gesture, which then times itself. */
export function reactionOf(index: number) {
  const reaction = DEFAULT_REACTIONS[EVENTS[index].type];
  const pose = reaction?.pose ?? "idle";
  const gesture = POSE_MAP[pose]?.hold != null;
  return { pose, gesture, lasts: gesture ? lengthOf(pose) : (reaction?.duration ?? 1.2) };
}

/** What a visitor, or the tour, does to the box. */
export type Action = { kind: "state" | "gesture" | "event"; index: number };

/** Left alone, the box works through this: seconds to wait, then what to do. */
export const TOUR: [number, Action][] = [
  [1.6, { kind: "state", index: 2 }],
  [2.6, { kind: "event", index: 0 }],
  [3.2, { kind: "gesture", index: 0 }],
  [2.4, { kind: "state", index: 1 }],
  [2.4, { kind: "event", index: 2 }],
  [2.6, { kind: "gesture", index: 2 }],
  [3.2, { kind: "state", index: 3 }],
  [2.6, { kind: "event", index: 1 }],
  [3, { kind: "state", index: 0 }],
  [2.2, { kind: "gesture", index: 1 }],
  [2.4, { kind: "event", index: 3 }],
  [2.8, { kind: "state", index: 5 }],
  [3.4, { kind: "state", index: 0 }],
];

/** What the panel under the drawing follows. */
export interface Showing {
  state: number;
  /** The gesture or event in play, or -1. */
  gesture: number;
  event: number;
}

/** The figure in words, for a screen reader. */
export function spokenOf({ state, gesture, event }: Showing) {
  const held = `The character is held ${STATES[state] === "idle" ? "at rest" : STATES[state]}.`;
  if (event >= 0) return `${held} A ${EVENTS[event].name} event arrives: the face reacts, then goes back.`;
  if (gesture >= 0) return `${held} It plays a ${GESTURES[gesture]} once.`;
  return held;
}

export const CAPTION =
  "A state lasts until something changes it. A gesture happens once. An event is a brief reaction, after which the face returns to what it was doing.";
