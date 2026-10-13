// Every path of the control box. A lever with six stops stands at the back of
// a box and four sprung keys at the front; behind it a unit takes events in
// from a line off the bench. All three are wired to the character, and a
// chart recorder along the front draws what the face does.

import * as k from "@/components/iso/iso-kit";
import type { Flat, Plan, Plane, Point3 } from "@/components/iso/iso-kit";
import { DEVICE_TOP, deviceOf, footprintOf } from "../device/geometry";
import { EVENTS, GESTURES, STATES } from "./model";

export const WIDTH = 680;
export const HEIGHT = 414;

// ── World layout: x runs along the bench, y toward the viewer, z up ──

const PLATE: Plan = { x: -196, y: -100, w: 392, d: 202, r: 9 };
const PLATE_H = 9;
const FOOT_H = 5;

const BOX: Plan = { x: -176, y: -50, w: 192, d: 96, r: 7 };
const BOX_TOP = 14;
// The lever's slot, and its six stops
const SLOT_Y = -34;
const STOP_X = (index: number) => -156 + index * 27;
// The keys
const KEY: Plan = { x: 0, y: 15, w: 28, d: 18, r: 3 };
const KEY_X = (index: number) => -160 + index * 36;
const KEY_H = 5;
/** How far a key goes down when pressed. */
export const KEY_TRAVEL = 3.2;

// Where events come in
const INLET: Plan = { x: -176, y: -92, w: 128, d: 34, r: 4 };
const INLET_TOP = 9;
const LAMP_X = (index: number) => INLET.x + 16 + index * 32;
const LAMP_Y = INLET.y + 8;

const DEVICE = footprintOf(84, -78);

// The chart recorder along the front
const CHART: Plan = { x: -176, y: 58, w: 330, d: 34, r: 5 };
const CHART_TOP = 6;
const PAPER: Plan = { x: -166, y: 62, w: 285, d: 26, r: 0.6 };
const PAPER_TOP = CHART_TOP + 0.8;
const PEN_X = 112;
/** Paper under the pen, in world units a second. */
export const CHART_SPEED = 20;
/** How many seconds of the strip are on show. */
export const CHART_SPAN = (PEN_X - PAPER.x - 12) / CHART_SPEED;
// The trace: where it rests, how far a held state lifts it, and a gesture or event on top
const REST_Y = PAPER.y + PAPER.d - 5;
const HELD = 8;
const BUMP = 7;

export const P = k.fitProjection([...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [DEVICE.x, DEVICE.y, DEVICE_TOP + 4], [DEVICE.x + DEVICE.w, DEVICE.y, DEVICE_TOP + 4]], WIDTH, HEIGHT, { pad: 22, headroom: 6 });

const at = (point: Point3): Flat => k.iso(point, P);
const byDepth = (points: Plane[]) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const share = (point: Point3) => {
  const [sx, sy] = at(point);
  return { left: `${Math.round((sx / WIDTH) * 1000) / 10}%`, top: `${Math.round((sy / HEIGHT) * 1000) / 10}%` };
};
const tenth = (value: number) => Math.round(value * 10) / 10;

/** Where a visitor's hand finds each control on the drawing: the lever's stops, the keys, the events' lamps. */
export const TOUCH_AT = {
  state: STATES.map((_, index) => share([STOP_X(index), SLOT_Y + 1, BOX_TOP + 6])),
  gesture: GESTURES.map((_, index) => share([KEY_X(index) + KEY.w / 2, KEY.y + KEY.d / 2, BOX_TOP + KEY_H])),
  event: EVENTS.map((_, index) => share([LAMP_X(index), LAMP_Y, INLET_TOP + 2])),
};

// ── The plate and its wiring ──

const onPlate = (points: Plane[]) => k.onTop(points, 0, P);
const DEVICE_LEFT = DEVICE.x;
// The box's line to the character, the inlet's, the line events arrive on, and the character's to the recorder
const BOX_WIRE: Plane[] = [[BOX.x + BOX.w + 3, -22], [48, -22], [48, DEVICE.y + 30], [DEVICE_LEFT, DEVICE.y + 30]];
const INLET_WIRE: Plane[] = [[INLET.x + INLET.w + 3, INLET.y + 16], [64, INLET.y + 16], [64, DEVICE.y + 14], [DEVICE_LEFT, DEVICE.y + 14]];
const OUTSIDE_WIRE: Plane[] = [[PLATE.x + 8, INLET.y + 16], [INLET.x - 3, INLET.y + 16]];
const CHART_WIRE: Plane[] = [[DEVICE.x + 44, DEVICE.y + DEVICE.d + 3], [DEVICE.x + 44, CHART.y - 3]];
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
  /** In order: the box's line, the inlet's, the line from outside, the recorder's. */
  wires: [onPlate(BOX_WIRE), onPlate(INLET_WIRE), onPlate(OUTSIDE_WIRE), onPlate(CHART_WIRE)],
  // Where the line from outside comes onto the bench
  terminal: k.slabOf({ x: PLATE.x + 6, y: INLET.y + 10, w: 6, d: 12, r: 1.2 }, 0, 5, P, 2, 0.3),
  terminalScrews: [at([PLATE.x + 9, INLET.y + 13, 5]), at([PLATE.x + 9, INLET.y + 19, 5])],
  glands: {
    inletIn: gland(INLET.x - 3, INLET.y + 12, 3, 8),
    inletOut: gland(INLET.x + INLET.w, INLET.y + 12, 3, 8),
    boxOut: gland(BOX.x + BOX.w, -26, 3, 8),
    deviceIn: [gland(DEVICE_LEFT - 3, DEVICE.y + 10, 3, 8), gland(DEVICE_LEFT - 3, DEVICE.y + 26, 3, 8)],
    deviceOut: gland(DEVICE.x + 40, DEVICE.y + DEVICE.d, 8, 3),
    chartIn: gland(DEVICE.x + 40, CHART.y - 3, 8, 3),
  },
};

// ── Where events come in ──

export const INLET_ART = {
  base: k.slabOf(INLET, 0, INLET_TOP, P, 5, 0.6),
  seam: k.sideSeam(INLET, 2.2, P, 5),
  screws: [at([INLET.x + 4.5, INLET.y + INLET.d - 4.5, INLET_TOP]), at([INLET.x + INLET.w - 4.5, INLET.y + INLET.d - 4.5, INLET_TOP])],
  lamps: EVENTS.map((_, index) => ({
    collar: k.cylinder(LAMP_X(index), LAMP_Y, 3.7, INLET_TOP, 1, P, 20),
    lens: k.cylinder(LAMP_X(index), LAMP_Y, 2.7, INLET_TOP + 1, 2.2, P, 20, 0.3),
    dot: [at([LAMP_X(index), LAMP_Y, INLET_TOP + 3.2])],
    name: k.topMatrix([LAMP_X(index) + 1.3, LAMP_Y + 5.6], INLET_TOP, P, "y"),
  })),
};

// ── The box: a lever and four keys ──

const LEVER: Plan = { x: STOP_X(0) - 6, y: SLOT_Y - 6, w: 12, d: 14, r: 2.4 };

export const BOX_ART = {
  base: k.slabOf(BOX, 0, BOX_TOP, P, 7, 1),
  seam: k.sideSeam(BOX, 3, P, 7),
  groove: k.planOutline(k.insetPlan(BOX, 4), BOX_TOP, P),
  screws: k.corners(BOX, 8).map(([x, y]) => at([x, y, BOX_TOP])),
  slot: k.planOutline({ x: STOP_X(0) - 7, y: SLOT_Y - 2, w: STOP_X(5) - STOP_X(0) + 14, d: 5.4, r: 2.7 }, BOX_TOP, P, 5),
  // A notch at each stop, on the far side of the slot
  stops: STATES.map((_, index) => k.lineOnTop([STOP_X(index), SLOT_Y - 2], [STOP_X(index), SLOT_Y - 6], BOX_TOP, P)).join(""),
  names: STATES.map((_, index) => k.topMatrix([STOP_X(index) + 1.3, SLOT_Y + 11], BOX_TOP, P, "y")),
  // The lever, built at its first stop
  lever: {
    skirt: k.slabOf(k.insetPlan(LEVER, -1.4), BOX_TOP, 1, P, 3),
    cap: k.slabOf(LEVER, BOX_TOP + 1, 6.4, P, 3, 0.5),
    grip: [-2.6, 0, 2.6].map((dy) => k.lineOnTop([LEVER.x + 2.4, SLOT_Y + 1 + dy], [LEVER.x + LEVER.w - 2.4, SLOT_Y + 1 + dy], BOX_TOP + 7.4, P)).join(""),
  },
  keys: GESTURES.map((_, index) => {
    const plan: Plan = { ...KEY, x: KEY_X(index) };
    return {
      well: k.planOutline(k.insetPlan(plan, -1.6), BOX_TOP, P, 4),
      cap: k.slabOf(plan, BOX_TOP, KEY_H, P, 4, 0.5),
      name: k.topMatrix([plan.x + plan.w / 2, plan.y + 11.2], BOX_TOP + KEY_H, P, "x"),
    };
  }),
  // A pilot lamp and the maker's plate, at the end of the box
  pilot: k.cylinder(BOX.x + BOX.w - 12, SLOT_Y, 2.6, BOX_TOP, 1.6, P, 20),
  pilotDot: [at([BOX.x + BOX.w - 12, SLOT_Y, BOX_TOP + 1.6])],
  plate: k.planOutline({ x: BOX.x + BOX.w - 22, y: 18, w: 16, d: 12, r: 1.2 }, BOX_TOP, P, 3),
  plateLines: [22, 25, 28].map((y) => k.lineOnTop([BOX.x + BOX.w - 19, y], [BOX.x + BOX.w - (y === 28 ? 13 : 9), y], BOX_TOP, P)).join(""),
};

/** Moves the lever from its first stop to a place along the slot, in stops. */
export const leverAt = (stop: number) => k.translateAlong(P, [stop * 27, 0, 0]);
/** Moves a key down by how far it is pressed, 0 to 1. */
export const keyAt = (pressed: number) => k.translateAlong(P, [0, 0, -pressed * KEY_TRAVEL]);

// ── The character ──

export const DEVICE_ART = deviceOf(DEVICE.x, DEVICE.y, P);

// ── The chart recorder ──

const post = (y: number) => k.cylinder(PEN_X, y, 2, CHART_TOP, 9, P, 18, 0.3);
const CARRIAGE: Plan = { x: PEN_X - 5, y: REST_Y - 3.4, w: 10, d: 6.8, r: 1.6 };

export const CHART_ART = {
  base: k.slabOf(CHART, 0, CHART_TOP, P, 6, 0.6),
  seam: k.sideSeam(CHART, 1.8, P, 6),
  paper: k.slabOf(PAPER, CHART_TOP, 0.8, P, 2),
  // The rule a state lifts the trace to, and the one it rests on
  rules: [REST_Y, REST_Y - HELD].map((y) => k.lineOnTop([PAPER.x + 12, y], [PEN_X + 8, y], PAPER_TOP, P)),
  // Where the paper goes in, and what holds the pen over it
  intake: k.slabOf({ x: CHART.x + 4, y: CHART.y + 2, w: 11, d: CHART.d - 4, r: 2 }, CHART_TOP, 5.4, P, 3, 0.4),
  intakeScrews: [at([CHART.x + 9.5, CHART.y + 6, CHART_TOP + 5.4]), at([CHART.x + 9.5, CHART.y + CHART.d - 6, CHART_TOP + 5.4])],
  posts: [post(PAPER.y - 1.6), post(PAPER.y + PAPER.d + 1.6)],
  bar: k.slabOf({ x: PEN_X - 2.2, y: PAPER.y - 3.4, w: 4.4, d: PAPER.d + 6.8, r: 1.2 }, CHART_TOP + 9, 2.4, P, 2, 0.3),
  // The pen and its carriage, built on the rest line
  carriage: k.slabOf(CARRIAGE, CHART_TOP + 7.4, 6.4, P, 3, 0.4),
  pen: k.rise([PEN_X, REST_Y], PAPER_TOP, CHART_TOP + 7.4, P),
  penDot: [at([PEN_X, REST_Y, PAPER_TOP])],
  screws: [at([CHART.x + CHART.w - 5, CHART.y + 5, CHART_TOP]), at([CHART.x + CHART.w - 5, CHART.y + CHART.d - 5, CHART_TOP])],
};

/** Moves the pen to a level: 0 at rest, 1 held, up to 2 with a gesture or event on top. */
export const penAt = (level: number) => k.translateAlong(P, [0, -yOf(level), 0]);
const yOf = (level: number) => Math.min(level, 1) * HELD + Math.max(level - 1, 0) * BUMP + (level < 1 ? 0 : 0);

const origin = at([0, 0, PAPER_TOP]);
const alongX = k.axisVector(P, [1, 0, 0]);
const alongY = k.axisVector(P, [0, 1, 0]);
const onPaper = (x: number, y: number) => `${tenth(origin[0] + x * alongX[0] + y * alongY[0])} ${tenth(origin[1] + x * alongX[1] + y * alongY[1])}`;

/** The trace on the strip: `levels` are the pen's levels, newest first, `each` seconds apart. */
export function traceOf(levels: ArrayLike<number>, count: number, each: number) {
  let d = "";
  for (let index = 0; index < count; index++) {
    const x = PEN_X - index * each * CHART_SPEED;
    if (x < PAPER.x + 12) break;
    d += `${index ? "L" : "M"}${onPaper(x, REST_Y - yOf(levels[index]))}`;
  }
  return d;
}

const FEED = 10;
/** The strip's feed marks along its near edge, after `elapsed` seconds of running. */
export function feedOf(elapsed: number) {
  const shift = (elapsed * CHART_SPEED) % FEED;
  let d = "";
  for (let x = PEN_X + 6 - shift; x > PAPER.x + 12; x -= FEED) d += `M${onPaper(x, PAPER.y + PAPER.d - 0.2)}L${onPaper(x, PAPER.y + PAPER.d - 2)}`;
  return d;
}
