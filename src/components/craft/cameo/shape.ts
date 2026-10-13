// The parts of Cameo's playground that its "your own shape" controller is
// built on, brought over as they are (apps/playground/src/lib/config.ts and
// components/Mini.tsx): what a drawn head is, how far its dials go, the
// drawings to try, and how an eye is drawn on the plan.

import {
  BUILD_METRICS,
  DEFAULT_CONFIG,
  DRAWN_DEFAULTS,
  drawnSilhouette,
  flattenPath,
  profileFor,
  profileToPath,
  traceFrom,
  type Drawing,
  type Silhouette,
} from "@shrysp/cameo";

/** A head made from a drawing, and the dials that shape it. */
export type Drawn = {
  drawing: Drawing;
  /** Where it came from, for showing: a file name. */
  name: string;
  fidelity: number;
  smoothing: number;
  bezel: number;
  /** How high the eyes sit, or null to leave them where there is most room. */
  eyeLevel: number | null;
  eyeSpacing: number;
  /** Where the screen was put, or null to leave it the roomiest part. */
  screenAt: { x: number; y: number } | null;
  screenReach: number;
  ownScreen: boolean;
};

export const EYE_LEVEL = { min: 0.15, max: 0.85 };
export const EYE_SPACING = { min: 0.5, max: 1.6 };
/** How far the screen may reach from where it was put. */
export const SCREEN_REACH = { min: 0.08, max: 0.6 };

/** The dials under the plan, as the playground has them. */
export const SOFTEN = { key: "smoothing", label: "Soften corners", min: 0, max: 1, step: 0.01, places: 2 } as const;
/** How thick the shell is round the glass: from a rim to nearly a porthole. */
export const BORDER = { key: "bezel", label: "Border", min: 0.03, max: 0.2, step: 0.005, places: 3 } as const;

export const headOf = (drawn: Drawn): Silhouette =>
  drawnSilhouette(drawn.drawing, {
    fidelity: drawn.fidelity,
    smoothing: drawn.smoothing,
    bezel: drawn.bezel,
    eyeLevel: drawn.eyeLevel ?? undefined,
    eyeSpacing: drawn.eyeSpacing,
    screenAt: drawn.screenAt ?? undefined,
    screenReach: drawn.screenReach,
    ownScreen: drawn.ownScreen,
  });

/** How a drawn head seats its eyes, where they are, at the usual spacing. */
export const usualSpacingSeat = (drawn: Drawn) =>
  headOf({ ...drawn, eyeSpacing: DRAWN_DEFAULTS.eyeSpacing }).outline?.eyes ?? null;

/** Where a drawn head puts its eyes when nobody has said. */
export const restingEyeLevel = (drawn: Drawn): number =>
  Number((1 - (headOf({ ...drawn, eyeLevel: null }).outline?.eyes?.y ?? 0.5)).toFixed(2));

/** A drawing as a head to wear, with every dial where it starts. */
export const drawnFrom = (drawing: Drawing, name: string): Drawn => ({
  drawing,
  name,
  ...DRAWN_DEFAULTS,
  eyeLevel: null,
  screenAt: null,
});

/**
 * Drawings to try: what a head of your own can be, without having one to
 * hand. Each is a path as a design tool would write it, and goes through
 * exactly what an uploaded one does.
 */
export const SHAPE_EXAMPLES = [
  { id: "triangle", label: "Triangle", d: "M100 0 L200 180 L0 180 Z" },
  {
    id: "cat",
    label: "Cat",
    d: "M30 8 L72 44 C90 38 110 38 128 44 L170 8 C178 40 182 60 182 100 C182 150 150 172 100 172 C50 172 18 150 18 100 C18 60 22 40 30 8 Z",
  },
  { id: "ghost", label: "Ghost", d: "M10 50 C10 -3 90 -3 90 50 L90 100 L76 88 L63 100 L50 88 L37 100 L24 88 L10 100 Z" },
  {
    id: "monitor",
    label: "Monitor",
    d: "M10 0 L290 0 Q300 0 300 10 L300 170 Q300 180 290 180 L10 180 Q0 180 0 170 L0 10 Q0 0 10 0 Z M135 180 L165 180 L165 220 L135 220 Z M94 220 L206 220 Q210 220 210 224 L210 231 Q210 235 206 235 L94 235 Q90 235 90 231 L90 224 Q90 220 94 220 Z",
  },
] as const;

export type ShapeExampleId = (typeof SHAPE_EXAMPLES)[number]["id"];

const exampleDrawn = new Map<string, Drawn>();
/** An example as a head to wear. Worked out when first asked for, and once. */
export function shapeExample(id: ShapeExampleId): Drawn {
  const made = exampleDrawn.get(id);
  if (made) return made;
  const example = SHAPE_EXAMPLES.find((e) => e.id === id)!;
  const drawn = drawnFrom(traceFrom(flattenPath(example.d)), example.label);
  exampleDrawn.set(id, drawn);
  return drawn;
}

// The eyes on the plan are the playground's ovals: the engine's own outline at
// rest, mirrored for the right eye where the shape leans
const EYE = { shape: "egg", build: "horizontal" } as const;

export function eyePath(side: "left" | "right", scale: number): string {
  return profileToPath(profileFor(EYE.shape, side), scale);
}

/** How large an eye is drawn on glass of a given height, and how far from the middle it sits. */
export function eyeMetrics() {
  const { size, spread } = BUILD_METRICS[EYE.build];
  return { size: size * DEFAULT_CONFIG.eyeScale, spread };
}

/** The plan's size on the page at most, and the room kept for its rails, in pixels. */
export const PAD = { tall: 290, wide: 364, beside: 44, below: 46 };
