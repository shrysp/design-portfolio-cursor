// Every path of the header tank. A tall tank with a sight glass stands at the
// left; behind the bench's middle a unit takes events in from a line off the
// bench and opens the tank's fill valve. The float's level goes to the
// character, and to a chart recorder along the front that draws it.

import * as k from "@/components/iso/iso-kit";
import type { Flat, Plan, Plane, Point3 } from "@/components/iso/iso-kit";
import { DEVICE_TOP, deviceOf, footprintOf } from "../device/geometry";
import { BANDS, EVENTS } from "./model";

export const WIDTH = 680;
export const HEIGHT = 468;

// ── World layout: x runs along the bench, y toward the viewer, z up ──

const PLATE: Plan = { x: -196, y: -100, w: 392, d: 202, r: 9 };
const PLATE_H = 9;
const FOOT_H = 5;

// The tank on its plinth
const PLINTH: Plan = { x: -178, y: -88, w: 90, d: 76, r: 8 };
const PLINTH_TOP = 6;
const TANK: Plan = { x: -170, y: -80, w: 74, d: 60, r: 9 };
const TANK_TOP = PLINTH_TOP + 86;
const FACE_Y = TANK.y + TANK.d;
/** The sight glass on the tank's face: its width and height, in world units. */
export const GLASS = { w: 20, h: 70 };
const GLASS_X = TANK.x + 13;
const GLASS_TOP = TANK_TOP - 8;
const VALVE: Plane = [TANK.x + TANK.w / 2, TANK.y + TANK.d / 2];

// Where events come in
const INLET: Plan = { x: -66, y: -46, w: 130, d: 34, r: 4 };
const INLET_TOP = 9;
const LAMP_X = (index: number) => INLET.x + 15 + index * 25;
const LAMP_Y = INLET.y + 8;

const DEVICE = footprintOf(84, -64);

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
// The trace: where an empty tank puts the pen, and how far a full one moves it
const EMPTY_Y = PAPER.y + PAPER.d - 3;
const FULL = 20;

export const P = k.fitProjection([...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [TANK.x, TANK.y, TANK_TOP + 16], [DEVICE.x + DEVICE.w, DEVICE.y, DEVICE_TOP + 4]], WIDTH, HEIGHT, { pad: 22, headroom: 4 });

const at = (point: Point3): Flat => k.iso(point, P);
const byDepth = (points: Plane[]) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const tenth = (value: number) => Math.round(value * 10) / 10;

// ── The plate and its wiring ──

const onPlate = (points: Plane[]) => k.onTop(points, 0, P);
// The line events arrive on, the inlet's to the fill valve, the float's to the character and to the recorder
const OUTSIDE_WIRE: Plane[] = [[0, PLATE.y + 12], [0, INLET.y - 3]];
const FILL_WIRE: Plane[] = [[INLET.x - 3, INLET.y + 16], [PLINTH.x + PLINTH.w, INLET.y + 16]];
const BAND_WIRE: Plane[] = [[PLINTH.x + 62, PLINTH.y + PLINTH.d + 3], [PLINTH.x + 62, 22], [73, 22], [73, DEVICE.y + 28], [DEVICE.x, DEVICE.y + 28]];
const CHART_WIRE: Plane[] = [[PLINTH.x + 24, PLINTH.y + PLINTH.d + 3], [PLINTH.x + 24, CHART.y - 3]];
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
  /** In order: the line from outside, the inlet's to the valve, the float's to the character, and to the recorder. */
  wires: [onPlate(OUTSIDE_WIRE), onPlate(FILL_WIRE), onPlate(BAND_WIRE), onPlate(CHART_WIRE)],
  // Where the line from outside comes onto the bench, at its back edge
  terminal: k.slabOf({ x: -6, y: PLATE.y + 7, w: 12, d: 6, r: 1.2 }, 0, 5, P, 2, 0.3),
  terminalScrews: [at([-3, PLATE.y + 10, 5]), at([3, PLATE.y + 10, 5])],
  glands: {
    inletIn: gland(-4, INLET.y - 3, 8, 3),
    inletOut: gland(INLET.x - 3, INLET.y + 12, 3, 8),
    tankIn: gland(PLINTH.x + PLINTH.w, INLET.y + 12, 3, 8),
    tankOut: [gland(PLINTH.x + 20, PLINTH.y + PLINTH.d, 8, 3), gland(PLINTH.x + 58, PLINTH.y + PLINTH.d, 8, 3)],
    deviceIn: gland(DEVICE.x - 3, DEVICE.y + 24, 3, 8),
    chartIn: gland(PLINTH.x + 20, CHART.y - 3, 8, 3),
  },
};

// ── The tank ──

const LID = k.insetPlan(TANK, -2.4);
const RIVET_X = [TANK.x + 12, TANK.x + 26, TANK.x + 48, TANK.x + 62];

export const TANK_ART = {
  plinth: k.slabOf(PLINTH, 0, PLINTH_TOP, P, 6, 0.6),
  plinthSeam: k.sideSeam(PLINTH, 1.8, P, 6),
  plinthScrews: k.corners(PLINTH, 5).map(([x, y]) => at([x, y, PLINTH_TOP])),
  body: k.slabOf(TANK, PLINTH_TOP, TANK_TOP - PLINTH_TOP, P, 9, 0.8),
  // The bands that hold it together, and their rivets on the face
  bands: [PLINTH_TOP + 4, TANK_TOP - 4].map((z) => k.sideSeam(TANK, z, P, 9)).join(""),
  rivets: [PLINTH_TOP + 2, TANK_TOP - 2].flatMap((z) => RIVET_X.map((x) => at([x, FACE_Y, z]))),
  lid: k.slabOf(LID, TANK_TOP, 3, P, 9, 0.8),
  // The fill valve on the lid: a body, a knurled cap and its lamp
  valve: k.cylinder(VALVE[0], VALVE[1], 9, TANK_TOP + 3, 5, P, 36, 0.4),
  cap: k.cylinder(VALVE[0], VALVE[1], 6, TANK_TOP + 8, 5, P, 28, 0.4),
  knurl: k.knurl(VALVE[0], VALVE[1], 6, TANK_TOP + 8, TANK_TOP + 13, 26, P, 0.4),
  valveLamp: [at([VALVE[0], VALVE[1], TANK_TOP + 13])],
  // Flat coordinates on the face: x across, y down, in world units from the sight glass's top-left corner
  plane: k.sideMatrix([GLASS_X, FACE_Y], GLASS_TOP, P, "left"),
  // The drain at the tank's foot: a tap, and the dish it drips into
  tap: k.slabOf({ x: TANK.x + TANK.w - 16, y: FACE_Y, w: 9, d: 6, r: 1.6 }, PLINTH_TOP + 1, 5, P, 3, 0.3),
  tapHandle: k.cylinder(TANK.x + TANK.w - 11.5, FACE_Y + 3, 2.2, PLINTH_TOP + 6, 2, P, 16),
  dish: k.cylinder(TANK.x + TANK.w - 11.5, FACE_Y + 14, 7, 0, 2, P, 28),
  dishRim: k.ring(TANK.x + TANK.w - 11.5, FACE_Y + 14, 5, 2, P, 24),
  // The larger valve that empties it at once, with its lamp
  dump: k.slabOf({ x: TANK.x + 37, y: FACE_Y, w: 14, d: 7, r: 2 }, PLINTH_TOP + 1, 6, P, 3, 0.4),
  dumpLamp: k.cylinder(TANK.x + 44, FACE_Y + 3.5, 2, PLINTH_TOP + 7, 1.4, P, 16),
  dumpDot: [at([TANK.x + 44, FACE_Y + 3.5, PLINTH_TOP + 8.4])],
};

/** A drop on its way from the tap to the dish: how far it has fallen, 0 to 1. */
export function dropAt(fallen: number): Flat {
  return at([TANK.x + TANK.w - 11.5, FACE_Y + 7.5, PLINTH_TOP + 0.5 - fallen * (PLINTH_TOP - 2)]);
}

/** On the face, what stands beside the sight glass: where each band starts and each event fills to, down from the glass's top. */
export const SCALE = {
  bands: BANDS.map((band, index) => ({ name: band.name, top: GLASS.h * (1 - (BANDS[index + 1]?.from ?? 1)), bottom: GLASS.h * (1 - band.from) })),
  marks: [...new Set(EVENTS.map((event) => event.to))].map((to) => GLASS.h * (1 - to)),
  /** How far right of the glass the scale runs. */
  reach: 34,
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

// ── The character ──

export const DEVICE_ART = deviceOf(DEVICE.x, DEVICE.y, P);

// ── The chart recorder ──

const post = (y: number) => k.cylinder(PEN_X, y, 2, CHART_TOP, 9, P, 18, 0.3);
const CARRIAGE: Plan = { x: PEN_X - 5, y: EMPTY_Y - 3.4, w: 10, d: 6.8, r: 1.6 };

export const CHART_ART = {
  base: k.slabOf(CHART, 0, CHART_TOP, P, 6, 0.6),
  seam: k.sideSeam(CHART, 1.8, P, 6),
  paper: k.slabOf(PAPER, CHART_TOP, 0.8, P, 2),
  // A rule where each band starts
  rules: BANDS.slice(1).map((band) => k.lineOnTop([PAPER.x + 12, EMPTY_Y - band.from * FULL], [PEN_X + 8, EMPTY_Y - band.from * FULL], PAPER_TOP, P)),
  intake: k.slabOf({ x: CHART.x + 4, y: CHART.y + 2, w: 11, d: CHART.d - 4, r: 2 }, CHART_TOP, 5.4, P, 3, 0.4),
  intakeScrews: [at([CHART.x + 9.5, CHART.y + 6, CHART_TOP + 5.4]), at([CHART.x + 9.5, CHART.y + CHART.d - 6, CHART_TOP + 5.4])],
  posts: [post(PAPER.y - 1.6), post(PAPER.y + PAPER.d + 1.6)],
  bar: k.slabOf({ x: PEN_X - 2.2, y: PAPER.y - 3.4, w: 4.4, d: PAPER.d + 6.8, r: 1.2 }, CHART_TOP + 9, 2.4, P, 2, 0.3),
  carriage: k.slabOf(CARRIAGE, CHART_TOP + 7.4, 6.4, P, 3, 0.4),
  pen: k.rise([PEN_X, EMPTY_Y], PAPER_TOP, CHART_TOP + 7.4, P),
  penDot: [at([PEN_X, EMPTY_Y, PAPER_TOP])],
  screws: [at([CHART.x + CHART.w - 5, CHART.y + 5, CHART_TOP]), at([CHART.x + CHART.w - 5, CHART.y + CHART.d - 5, CHART_TOP])],
};

/** Moves the pen to a level, 0 to 1. */
export const penAt = (level: number) => k.translateAlong(P, [0, -level * FULL, 0]);

const origin = at([0, 0, PAPER_TOP]);
const alongX = k.axisVector(P, [1, 0, 0]);
const alongY = k.axisVector(P, [0, 1, 0]);
const onPaper = (x: number, y: number) => `${tenth(origin[0] + x * alongX[0] + y * alongY[0])} ${tenth(origin[1] + x * alongX[1] + y * alongY[1])}`;

/** The trace on the strip: `levels` are the tank's levels, newest first, `each` seconds apart. */
export function traceOf(levels: ArrayLike<number>, count: number, each: number) {
  let d = "";
  for (let index = 0; index < count; index++) {
    const x = PEN_X - index * each * CHART_SPEED;
    if (x < PAPER.x + 12) break;
    d += `${index ? "L" : "M"}${onPaper(x, EMPTY_Y - levels[index] * FULL)}`;
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
