// Every path of the tape deck. Two reels lie flat at the back of a deck; the
// tape runs along the front past a reading head and then a playing head, a
// second of tape apart. To the right stand the reader with its eight lamps,
// and the character whose face the reading changes. The tape is the only
// thing that moves across the drawing, and it moves along one straight run.

import * as k from "@/components/iso/iso-kit";
import type { Flat, Plan, Plane, Point3 } from "@/components/iso/iso-kit";
import { LAMPS, LEAD, SPEED, type Clip } from "./model";

export const WIDTH = 680;
export const HEIGHT = 390;

// ── World layout: x runs along the bench, y toward the viewer, z up ──

const PLATE: Plan = { x: -196, y: -90, w: 392, d: 190, r: 9 };
const PLATE_H = 9;
const FOOT_H = 5;

const DECK: Plan = { x: -184, y: -74, w: 236, d: 140, r: 8 };
const DECK_TOP = 12;

// The reels, lying flat
const REEL_R = 38;
const REELS = [
  { x: -128, y: -24, pack: 31 },
  { x: -4, y: -24, pack: 22 },
] as const;
const FLANGE = 1.2;
const PACK_H = 7.4;
const REEL_TOP = DECK_TOP + 2 + FLANGE * 2 + PACK_H;

// The tape's straight run along the front, and what stands on it
const TAPE_Y = 44;
const TAPE_Z0 = DECK_TOP + 2 + FLANGE;
const TAPE_Z1 = TAPE_Z0 + PACK_H;
const RUN = [-164, 32] as const;
/** Where the voice is played, and upstream of it where the words are read. */
export const PLAY_X = -52;
export const READ_X = PLAY_X - LEAD * SPEED;
// The plate the heads and guides stand on, just under the tape
const RAIL: Plan = { x: RUN[0] - 8, y: TAPE_Y - 20, w: RUN[1] - RUN[0] + 16, d: 21.4, r: 3 };
const RAIL_TOP = DECK_TOP + 2.8;
const HEAD_TOP = DECK_TOP + 14;
const CAPSTAN_X = -12;

// The reader, and the character
const READER: Plan = { x: 70, y: 22, w: 114, d: 50, r: 5 };
const READER_TOP = 12;
const LAMP_Y = READER.y + 11;
const LAMP_X = (index: number) => READER.x + 11 + index * 13.2;
const PEDESTAL: Plan = { x: 84, y: -76, w: 88, d: 56, r: 8 };
const PEDESTAL_TOP = 6;
const BODY: Plan = { x: 90, y: -70, w: 76, d: 44, r: 11 };
const BODY_Z = PEDESTAL_TOP + 5;
const BODY_H = 56;
const FACE_Y = BODY.y + BODY.d;
/** The character's screen, on the face of its body that looks at the viewer: width, height, in world units. */
export const SCREEN = { w: 54, h: 38 };
const SCREEN_X = BODY.x + (BODY.w - SCREEN.w) / 2;
const SCREEN_TOP = BODY_Z + BODY_H - 8;

export const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [BODY.x, BODY.y, BODY_Z + BODY_H + 4], [BODY.x + BODY.w, BODY.y, BODY_Z + BODY_H + 4]],
  WIDTH,
  HEIGHT,
  { pad: 22, headroom: 30 },
);

const at = (point: Point3): Flat => k.iso(point, P);
const byDepth = (points: Plane[]) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const share = (point: Point3) => {
  const [sx, sy] = at(point);
  return { left: `${Math.round((sx / WIDTH) * 1000) / 10}%`, top: `${Math.round((sy / HEIGHT) * 1000) / 10}%` };
};
const tenth = (value: number) => Math.round(value * 10) / 10;

/** Where the three numbered markers sit, on the plate beside the part each belongs to: the reading head's lead, the reader, the playing head's lead. */
export const MARK_AT = [share([READ_X - 12, DECK.y + DECK.d + 5, 0]), share([READER.x - 13, READER.y + 6, 0]), share([PLAY_X + 12, DECK.y + DECK.d + 5, 0])];

// ── The plate, and the wiring laid on it ──

const onPlate = (points: Plane[]) => k.onTop(points, 0, P);
const FRONT = DECK.y + DECK.d;
// The reading head's line to the reader, the reader's to the character, and the playing head's to the character
const READ_WIRE: Plane[] = [[READ_X, FRONT + 3], [READ_X, FRONT + 10], [READER.x - 8, FRONT + 10], [READER.x - 8, READER.y + 30], [READER.x, READER.y + 30]];
const MOOD_WIRE: Plane[] = [[READER.x + 30, READER.y], [READER.x + 30, PEDESTAL.y + PEDESTAL.d]];
const VOICE_WIRE: Plane[] = [[PLAY_X, FRONT + 3], [PLAY_X, FRONT + 19], [READER.x + READER.w + 6, FRONT + 19], [READER.x + READER.w + 6, PEDESTAL.y + 30], [PEDESTAL.x + PEDESTAL.w, PEDESTAL.y + 30]];
const gland = (x: number, y: number, w: number, d: number) => k.slabOf({ x, y, w, d, r: 0.8 }, 0, 4, P, 2);

export const BENCH_ART = {
  halo: k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P),
  feet: byDepth(k.corners(PLATE, 22)).map(([x, y]) => [k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28)]),
  slab: k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6),
  groove: k.planOutline(k.insetPlan(PLATE, 5), 0, P),
  screwRings: k
    .corners(PLATE, 11)
    .map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16))
    .join(""),
  screws: k.corners(PLATE, 11).map(([x, y]) => at([x, y, 0])),
  wires: [onPlate(READ_WIRE), onPlate(MOOD_WIRE), onPlate(VOICE_WIRE)],
  glands: [gland(READ_X - 4, FRONT, 8, 3), gland(PLAY_X - 4, FRONT, 8, 3), gland(READER.x - 3, READER.y + 26, 3, 8), gland(READER.x + 26, READER.y - 3, 8, 3), gland(READER.x + 26, PEDESTAL.y + PEDESTAL.d, 8, 3), gland(PEDESTAL.x + PEDESTAL.w, PEDESTAL.y + 26, 3, 8)],
};

// ── The deck ──

const reelOf = ({ x, y, pack }: (typeof REELS)[number]) => ({
  spindle: k.cylinder(x, y, 13, DECK_TOP, 2, P, 40),
  lower: k.cylinder(x, y, REEL_R, DECK_TOP + 2, FLANGE, P, 72),
  pack: k.cylinder(x, y, pack, DECK_TOP + 2 + FLANGE, PACK_H, P, 64),
  // The tape wound on it, as the lines its edges make
  winds: [0.35, 0.7].map((share) => k.sideArc(x, y, pack, DECK_TOP + 2 + FLANGE + PACK_H * share, P, 32)).join(""),
  upper: k.cylinder(x, y, REEL_R, DECK_TOP + 2 + FLANGE + PACK_H, FLANGE, P, 72, 0.5),
  hub: k.cylinder(x, y, 8.4, REEL_TOP, 2.2, P, 32, 0.4),
  hubRing: k.ring(x, y, 12.5, REEL_TOP, P, 40),
  nut: [at([x, y, REEL_TOP + 2.2])],
});

const post = (x: number, y: number, r: number, top: number, floor = RAIL_TOP) => ({
  foot: k.cylinder(x, y, r + 1.6, floor, 1, P, 20),
  shaft: k.cylinder(x, y, r, floor + 1, top - floor - 1, P, 20, 0.3),
  cap: [at([x, y, top])],
});

const headOf = (x: number) => {
  const block: Plan = { x: x - 10, y: TAPE_Y - 17, w: 20, d: 12, r: 2 };
  const nose: Plan = { x: x - 5, y: TAPE_Y - 5, w: 10, d: 4.6, r: 1.6 };
  return {
    block: k.slabOf(block, RAIL_TOP, HEAD_TOP - RAIL_TOP, P, 3, 0.5),
    seam: k.sideSeam(block, RAIL_TOP + 2.2, P, 3),
    nose: k.slabOf(nose, RAIL_TOP, HEAD_TOP - RAIL_TOP - 2.5, P, 3, 0.3),
    // The gap the tape is read through, as a line down the nose
    gap: k.rise([x, TAPE_Y - 0.4], TAPE_Z1 + 0.4, HEAD_TOP - 2.5, P),
    screws: [at([block.x + 3, block.y + 3, HEAD_TOP]), at([block.x + block.w - 3, block.y + 3, HEAD_TOP])],
    lamp: k.cylinder(x, block.y + 3.4, 1.9, HEAD_TOP, 1.2, P, 16),
    lampDot: [at([x, block.y + 3.4, HEAD_TOP + 1.2])],
    name: k.topMatrix([x, block.y + 10.2], HEAD_TOP, P, "x"),
  };
};

// The tape between a reel and the post at its end of the run: a ribbon on edge
const ribbon = (from: Plane, to: Plane) => ({
  fill: k.pathOf([at([from[0], from[1], TAPE_Z0]), at([to[0], to[1], TAPE_Z0]), at([to[0], to[1], TAPE_Z1]), at([from[0], from[1], TAPE_Z1])], true),
  edges: k.segment([from[0], from[1], TAPE_Z0], [to[0], to[1], TAPE_Z0], P) + k.segment([from[0], from[1], TAPE_Z1], [to[0], to[1], TAPE_Z1], P),
});
const tangent = ({ x, y, pack }: (typeof REELS)[number], degrees: number): Plane => [x + pack * Math.cos((degrees * Math.PI) / 180), y + pack * Math.sin((degrees * Math.PI) / 180)];

const KEYS = [-176, -161, -146].map((x): Plan => ({ x, y: TAPE_Y + 9, w: 12, d: 8, r: 1.6 }));
const COUNTER: Plan = { x: -124, y: TAPE_Y + 9, w: 38, d: 9, r: 1.4 };
// A level meter: its needle swings with the voice
const METER: Plan = { x: 12, y: TAPE_Y + 6, w: 34, d: 15, r: 2 };
const METER_PIVOT: Plane = [METER.x + METER.w / 2, METER.y + 13];
const METER_TOP = DECK_TOP + 1.6;

export const DECK_ART = {
  slab: k.slabOf(DECK, 0, DECK_TOP, P, 8, 1.2),
  seam: k.sideSeam(DECK, 3, P, 8),
  groove: k.planOutline(k.insetPlan(DECK, 4), DECK_TOP, P),
  screws: k.corners(DECK, 9).map(([x, y]) => at([x, y, DECK_TOP])),
  screwRings: k
    .corners(DECK, 9)
    .map(([x, y]) => k.ring(x, y, 1.8, DECK_TOP, P, 14))
    .join(""),
  // A ruler under the run, a second of tape to each long tick
  rail: k.slabOf(RAIL, DECK_TOP, RAIL_TOP - DECK_TOP, P, 4, 0.4),
  railScrews: [at([RAIL.x + 4, RAIL.y + 4, RAIL_TOP]), at([RAIL.x + RAIL.w - 4, RAIL.y + 4, RAIL_TOP]), at([(READ_X + PLAY_X) / 2, RAIL.y + 4, RAIL_TOP])],
  ruler: k.topTicks(RUN[0] + 8, RUN[1] - 4, SPEED / 4, 4, TAPE_Y + 2.6, DECK_TOP, [1.6, 3.2], P),
  reels: REELS.map(reelOf),
  feed: ribbon(tangent(REELS[0], 196), [RUN[0], TAPE_Y]),
  take: ribbon([RUN[1], TAPE_Y], tangent(REELS[1], -16)),
  posts: [post(RUN[0] - 1, TAPE_Y - 3.2, 3, TAPE_Z1 + 2.4), post(-140, TAPE_Y - 3, 2.4, TAPE_Z1 + 1.6), post(RUN[1] + 1, TAPE_Y - 3.2, 3, TAPE_Z1 + 2.4)],
  heads: [headOf(READ_X), headOf(PLAY_X)],
  capstan: post(CAPSTAN_X, TAPE_Y - 2.6, 2.2, TAPE_Z1 + 5),
  // The run itself: paper the tape's marks are drawn on
  run: k.slabOf({ x: RUN[0], y: TAPE_Y, w: RUN[1] - RUN[0], d: 0.7, r: 0.2 }, TAPE_Z0, TAPE_Z1 - TAPE_Z0, P, 2),
  pinch: k.cylinder(CAPSTAN_X, TAPE_Y + 7.4, 5, DECK_TOP + 1.4, 9.6, P, 28, 0.4),
  pinchCap: k.ring(CAPSTAN_X, TAPE_Y + 7.4, 2.2, DECK_TOP + 11, P, 16),
  pinchArm: k.slabOf({ x: CAPSTAN_X - 3, y: TAPE_Y + 4.4, w: 26, d: 6, r: 2.6 }, DECK_TOP, 1.4, P, 4),
  pivot: post(CAPSTAN_X + 19, TAPE_Y + 7.4, 1.8, DECK_TOP + 4, DECK_TOP),
  keys: KEYS.map((plan) => k.slabOf(plan, DECK_TOP, 3, P, 3, 0.3)),
  keyMarks: KEYS.map((plan) => at([plan.x + plan.w / 2, plan.y + plan.d / 2, DECK_TOP + 3])),
  counter: k.slabOf(COUNTER, DECK_TOP, 1.4, P, 3),
  counterWindow: k.planOutline(k.insetPlan(COUNTER, 1.5), DECK_TOP + 1.4, P, 3),
  counterText: k.topMatrix([COUNTER.x + COUNTER.w / 2, COUNTER.y + 6.7], DECK_TOP + 1.4, P, "x"),
  meter: k.slabOf(METER, DECK_TOP, 1.6, P, 3),
  meterWindow: k.planOutline(k.insetPlan(METER, 1.6), METER_TOP, P, 3),
  // Its scale: an arc of ticks about the needle's pivot, the loud end marked longer
  meterScale: k.radialTicks(METER_PIVOT[0], METER_PIVOT[1], 10.6, 9, 4, METER_TOP, [1.2, 2.2], P, -0.95, 1.9),
  meterPivot: [at([METER_PIVOT[0], METER_PIVOT[1], METER_TOP])],
};

// ── The reader ──

export const READER_ART = {
  base: k.slabOf(READER, 0, READER_TOP, P, 6, 0.7),
  seam: k.sideSeam(READER, 2.4, P, 6),
  plate: k.planOutline({ x: READER.x + 4, y: READER.y + 4, w: READER.w - 8, d: READER.d - 8, r: 2.4 }, READER_TOP, P, 4),
  screws: k.corners(READER, 6.5).map(([x, y]) => at([x, y, READER_TOP])),
  lamps: LAMPS.map((_, index) => ({
    collar: k.cylinder(LAMP_X(index), LAMP_Y, 3.7, READER_TOP, 1, P, 20),
    lens: k.cylinder(LAMP_X(index), LAMP_Y, 2.7, READER_TOP + 1, 2.2, P, 20, 0.3),
    dot: [at([LAMP_X(index), LAMP_Y, READER_TOP + 3.2])],
    // Its mood, engraved running toward the viewer
    name: k.topMatrix([LAMP_X(index) + 1.3, LAMP_Y + 5.6], READER_TOP, P, "y"),
  })),
  // The maker's name on the front
  name: k.sideMatrix([READER.x + READER.w - 6, READER.y + READER.d], READER_TOP - 3.6, P, "left"),
};

// ── The character: a pedestal with a grille, and a body with a screen ──

const NECK: Plane = [BODY.x + BODY.w / 2, BODY.y + BODY.d / 2];
const screenAt = (dx: number, down: number): Point3 => [SCREEN_X + dx, FACE_Y, SCREEN_TOP - down];
const frameOf = (inset: number, r: number, steps = 6) => {
  // A rounded rectangle on the face, as points
  const [w, h] = [SCREEN.w - inset * 2, SCREEN.h - inset * 2];
  const points: Flat[] = [];
  const corner = (cx: number, cy: number, from: number) => {
    for (let step = 0; step <= steps; step++) {
      const angle = from + (step / steps) * (Math.PI / 2);
      points.push(at(screenAt(inset + cx + r * Math.cos(angle), inset + cy + r * Math.sin(angle))));
    }
  };
  corner(w - r, r, -Math.PI / 2);
  corner(w - r, h - r, 0);
  corner(r, h - r, Math.PI / 2);
  corner(r, r, Math.PI);
  return k.pathOf(points, true);
};

export const CHARACTER_ART = {
  pedestal: k.slabOf(PEDESTAL, 0, PEDESTAL_TOP, P, 6, 0.6),
  pedestalSeam: k.sideSeam(PEDESTAL, 1.8, P, 6),
  // The speaker, as slots in the pedestal's top
  grille: [0, 4.2, 8.4].map((dy) => k.planOutline({ x: PEDESTAL.x + 12, y: FACE_Y + 2.6 + dy, w: PEDESTAL.w - 24, d: 1.9, r: 0.95 }, PEDESTAL_TOP, P, 3)).join(""),
  screws: [at([PEDESTAL.x + 5, PEDESTAL.y + PEDESTAL.d - 5, PEDESTAL_TOP]), at([PEDESTAL.x + PEDESTAL.w - 5, PEDESTAL.y + PEDESTAL.d - 5, PEDESTAL_TOP])],
  neck: k.cylinder(NECK[0], NECK[1], 15, PEDESTAL_TOP, BODY_Z - PEDESTAL_TOP, P, 40),
  body: k.slabOf(BODY, BODY_Z, BODY_H, P, 10, 1.4),
  bodySeam: k.sideSeam(BODY, BODY_Z + 4, P, 10),
  // Vents in its top, and the line where the shell's two halves meet
  vents: [0, 4.4, 8.8].map((dy) => k.planOutline({ x: BODY.x + 22, y: BODY.y + 9 + dy, w: BODY.w - 44, d: 2, r: 1 }, BODY_Z + BODY_H, P, 3)).join(""),
  shellSeam: k.sideSeam(BODY, BODY_Z + BODY_H - 5, P, 10),
  bezel: frameOf(-2.4, 7),
  screen: frameOf(0, 5),
  // Flat coordinates on the screen: x across, y down, in world units from its top-left corner
  plane: k.sideMatrix([SCREEN_X, FACE_Y], SCREEN_TOP, P, "left"),
  // A power lamp under the screen
  lamp: [at([BODY.x + BODY.w - 12, FACE_Y, BODY_Z + 5])],
};

// ── What moves ──

const TAPE_FACE = TAPE_Y + 0.7;
const origin = at([0, TAPE_FACE, 0]);
const alongX = k.axisVector(P, [1, 0, 0]);
const alongZ = k.axisVector(P, [0, 0, 1]);
const onTape = (x: number, z: number) => `${tenth(origin[0] + x * alongX[0] + z * alongZ[0])} ${tenth(origin[1] + x * alongX[1] + z * alongZ[1])}`;
const MID = (TAPE_Z0 + TAPE_Z1) / 2;
/** Where on the run the moment `at` of a recording is, when its clock reads `t`. Later moments are further upstream, to the left. */
const placeOf = (moment: number, t: number) => PLAY_X - (moment - t) * SPEED;

/** The voice on the tape as it passes: a tick for each instant, as tall as it is loud. */
export function waveOn(clip: Clip, t: number) {
  const each = clip.length / clip.peaks.length;
  let d = "";
  // Only what is on the run just now
  const first = Math.max(0, Math.floor((t - (RUN[1] - 2 - PLAY_X) / SPEED) / each));
  const last = Math.min(clip.peaks.length - 1, Math.ceil((t + (PLAY_X - RUN[0] - 2) / SPEED) / each));
  for (let index = first; index <= last; index++) {
    const x = placeOf(index * each, t);
    if (x < RUN[0] + 2 || x > RUN[1] - 2) continue;
    const half = 0.3 + clip.peaks[index] * 2.5;
    d += `M${onTape(x, MID - half)}L${onTape(x, MID + half)}`;
  }
  return d;
}

/** One sentence on the tape: a rule along its foot, as long as the sentence is. */
export function sentenceOn(heard: readonly [number, number], t: number) {
  const from = Math.max(RUN[0] + 2, placeOf(heard[1], t));
  const to = Math.min(RUN[1] - 2, placeOf(heard[0], t));
  return to > from ? `M${onTape(from, TAPE_Z0 + 1.1)}L${onTape(to, TAPE_Z0 + 1.1)}` : "";
}

const SPOKES = 3;
/** A reel's windows, turned to `angle`. */
export function windowsOf(reel: number, angle: number) {
  const { x, y } = REELS[reel];
  let d = "";
  for (let spoke = 0; spoke < SPOKES; spoke++) {
    const turn = angle + (spoke / SPOKES) * Math.PI * 2;
    d += k.ring(x + 24 * Math.cos(turn), y + 24 * Math.sin(turn), 9, REEL_TOP, P, 20);
    d += k.lineOnTop([x + 9 * Math.cos(turn + 1.05), y + 9 * Math.sin(turn + 1.05)], [x + 12.5 * Math.cos(turn + 1.05), y + 12.5 * Math.sin(turn + 1.05)], REEL_TOP, P);
  }
  return d;
}
/** How fast a reel turns for the tape to leave it at the tape's speed, in radians a second. */
export const turnOf = (reel: number) => SPEED / REELS[reel].pack;

/** The level meter's needle, for a loudness of 0 to 1. Angle 0 points away from the viewer. */
export function needleOf(level: number) {
  const angle = -0.9 + level * 1.8;
  const tip: Plane = [METER_PIVOT[0] + 9.4 * Math.sin(angle), METER_PIVOT[1] - 9.4 * Math.cos(angle)];
  return k.lineOnTop(METER_PIVOT, tip, METER_TOP, P);
}
