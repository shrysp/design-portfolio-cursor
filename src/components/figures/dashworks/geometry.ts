// Every path of the Dashworks bench. A question station stands front left,
// five app sources stand along the back on one shared line, and the ranking box
// and answer printer stand front right. Everything that moves rises straight
// up, so the painter's order never changes.

import * as k from "@/components/iso/iso-kit";
import type { Flat, Plan, Plane, Point3 } from "@/components/iso/iso-kit";
import { SOURCES } from "./model";

export const WIDTH = 680;
export const HEIGHT = 384;

// ── World layout: x runs along the bench, y toward the viewer, z up ──

const PLATE: Plan = { x: -190, y: -86, w: 380, d: 172, r: 9 };
const PLATE_H = 10;
const FOOT_H = 5;
const BASE_H = 6;

// The sources: a drum each, along the back
const DRUM_X = [-120, -60, 0, 60, 120];
const DRUM_Y = -52;
const DRUM_R = 15;
const DRUM_TOP = 20;
// The shared line they hang off, and where the two stations join it
const BUS_Y = -16;
const PORT_Y = DRUM_Y + DRUM_R + 3;
const FEED_X = -40;
const RETURN_X = 20;
const JOIN_Y = 20;

// The question station
const ASK: Plan = { x: -176, y: 2, w: 120, d: 66, r: 5 };
const READER: Plan = { x: -170, y: 8, w: 62, d: 32, r: 3 };
const READER_TOP = BASE_H + 14;
const SLOT_Y = 48;
const SLIP = { x: -168, w: 104, h: 17 };

// The ranking box and the answer printer
const RANK: Plan = { x: 40, y: 2, w: 138, d: 66, r: 5 };
const WALL = 3.4;
const WALL_H = 14;
const DOC_W = 55;
const DOC_H = 25;
const DOC_Z = BASE_H + 1;
const DOC_TOP = DOC_Z + DOC_H;
const BOX_X = 46;
const BOX_W = DOC_W + 5 + WALL * 2;
const DOC_X = BOX_X + WALL + 2.5;
const DOC_Y = (index: number) => 15 + index * 8.2;
const PRINTER_X = 124;
const PRINTER_W = 46;
const PRINTER_BACK: Plan = { x: PRINTER_X, y: 8, w: PRINTER_W, d: 24, r: 2 };
const PRINTER_FRONT: Plan = { x: PRINTER_X, y: 33.4, w: PRINTER_W, d: 24.6, r: 2 };
const PRINTER_BACK_TOP = BASE_H + 17;
const PRINTER_FRONT_TOP = BASE_H + 13;
const SHEET = { x: PRINTER_X + 5, y: 32.3, w: 36, h: 13 };

/** How high a card hangs over its slot before it drops in. */
export const DROP = 22;
/** How far a document comes up as it arrives in the box. */
export const ARRIVE = 8;
/** How far each document rises once ranked, back to front: the first two are the sources of truth. */
export const RANKS = [17, 10.5, 0, 0, 0];
/** How far the answer rises out of the printer. */
export const ANSWER_LIFT = 11;

export const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [DRUM_X[0] - DRUM_R, DRUM_Y, DRUM_TOP + 4], [DOC_X, DOC_Y(0), DOC_TOP + RANKS[0] + 2]],
  WIDTH,
  HEIGHT,
  { pad: 28 },
);

const at = (point: Point3): Flat => k.iso(point, P);
const byDepth = (points: Plane[]) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const share = (point: Point3) => {
  const [sx, sy] = at(point);
  return { left: `${Math.round((sx / WIDTH) * 1000) / 10}%`, top: `${Math.round((sy / HEIGHT) * 1000) / 10}%` };
};

/** Moves a part straight up. */
export const raise = (by: number) => k.translateAlong(P, [0, 0, by]);

/** Where the status tag floats at each step: over the question, over the sources, then in front of the box and printer. */
export const TAG_AT = [
  share([ASK.x + ASK.w / 2, 30, 62]),
  share([0, DRUM_Y, DRUM_TOP + 36]),
  // The last two steps share a place in front of the plate, clear of the sources behind the box
  share([RANK.x + RANK.w / 2 - 6, 152, -PLATE_H - FOOT_H]),
  share([RANK.x + RANK.w / 2 - 6, 152, -PLATE_H - FOOT_H]),
];

// ── The plate, and the lines laid on it ──

const line = (points: Plane[]) => k.onTop(points, 0, P);

export const BENCH_ART = {
  halo: k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P),
  feet: byDepth(k.corners(PLATE, 22)).map(([x, y]) => [
    k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28),
    k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28),
  ]),
  slab: k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6),
  groove: k.planOutline(k.insetPlan(PLATE, 5), 0, P),
  screwRings: k
    .corners(PLATE, 11)
    .map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16))
    .join(""),
  screws: k.corners(PLATE, 11).map(([x, y]) => at([x, y, 0])),
  // The line as it lies: a feed from the question station, the bus, a tap to each source, a return to the box
  wiring:
    line([
      [ASK.x + ASK.w + 3, JOIN_Y],
      [FEED_X, JOIN_Y],
      [FEED_X, BUS_Y],
    ]) +
    line([
      [DRUM_X[0], BUS_Y],
      [DRUM_X[DRUM_X.length - 1], BUS_Y],
    ]) +
    DRUM_X.map((x) => line([[x, BUS_Y], [x, PORT_Y]])).join("") +
    line([
      [RETURN_X, BUS_Y],
      [RETURN_X, JOIN_Y],
      [RANK.x, JOIN_Y],
    ]),
  // The same line as each source's own path: the query going out to it, and its document coming back
  out: DRUM_X.map((x) =>
    line([
      [ASK.x + ASK.w + 3, JOIN_Y],
      [FEED_X, JOIN_Y],
      [FEED_X, BUS_Y],
      [x, BUS_Y],
      [x, PORT_Y],
    ]),
  ),
  back: DRUM_X.map((x) =>
    line([
      [x, PORT_Y],
      [x, BUS_Y],
      [RETURN_X, BUS_Y],
      [RETURN_X, JOIN_Y],
      [RANK.x, JOIN_Y],
    ]),
  ),
  joints: [at([FEED_X, BUS_Y, 0]), at([RETURN_X, BUS_Y, 0]), ...DRUM_X.map((x) => at([x, BUS_Y, 0]))],
  gland: k.slabOf({ x: ASK.x + ASK.w, y: JOIN_Y - 4, w: 3, d: 8, r: 0.8 }, 0, 4, P, 2),
  // The two ends of the bench, engraved on the plate
  names: [k.topMatrix([ASK.x + ASK.w / 2, 79], 0, P, "x"), k.topMatrix([RANK.x + RANK.w / 2, 79], 0, P, "x")],
};

// ── The sources ──

export const SOURCE_ART = DRUM_X.map((x) => ({
  flange: k.cylinder(x, DRUM_Y, DRUM_R + 2, 0, 1.6, P, 48),
  drum: k.cylinder(x, DRUM_Y, DRUM_R, 1.6, DRUM_TOP - 1.6, P, 56, 0.6),
  bands: k.sideArc(x, DRUM_Y, DRUM_R, 7, P, 28) + k.sideArc(x, DRUM_Y, DRUM_R, 14, P, 28),
  rim: k.ring(x, DRUM_Y, DRUM_R - 2.2, DRUM_TOP, P, 48),
  port: k.slabOf({ x: x - 4, y: DRUM_Y + DRUM_R - 0.6, w: 8, d: 3.6, r: 0.8 }, 0, 4, P, 2),
  // The app's name, engraved on the lid
  name: k.topMatrix([x, DRUM_Y + 1.5], DRUM_TOP, P, "x"),
}));

// ── The question station: a reader, and a slot the question stands in ──

const DIAL: Plane = [READER.x + 14, READER.y + 16];
const LAMP: Plane = [READER.x + READER.w - 8, READER.y + 8];

export const ASK_ART = {
  base: k.slabOf(ASK, 0, BASE_H, P, 6, 0.6),
  seam: k.sideSeam(ASK, 1.8, P, 6),
  reader: k.slabOf(READER, BASE_H, READER_TOP - BASE_H, P, 4, 0.5),
  readerSeam: k.sideSeam(READER, READER_TOP - 4, P, 4),
  skirt: k.cylinder(DIAL[0], DIAL[1], 7.6, READER_TOP, 1.2, P, 32),
  knob: k.cylinder(DIAL[0], DIAL[1], 5.6, READER_TOP + 1.2, 6, P, 32, 0.5),
  knurl: k.knurl(DIAL[0], DIAL[1], 5.6, READER_TOP + 1.2, READER_TOP + 7.2, 30, P, 0.4),
  cap: k.ring(DIAL[0], DIAL[1], 3.6, READER_TOP + 7.2, P, 24),
  pointer: k.lineOnTop(DIAL, [DIAL[0] - 2.55, DIAL[1] - 2.55], READER_TOP + 7.2, P),
  capDot: [at([DIAL[0], DIAL[1], READER_TOP + 7.2])],
  vents: [14, 18.5, 23].map((y) => k.planOutline({ x: READER.x + 27, y: READER.y + y, w: 28, d: 1.8, r: 0.9 }, READER_TOP, P, 3)).join(""),
  lamp: k.cylinder(LAMP[0], LAMP[1], 2.4, READER_TOP, 1.8, P, 20),
  lampDot: [at([LAMP[0], LAMP[1], READER_TOP + 1.8])],
  slotBack: k.slabOf({ x: ASK.x + 4, y: SLOT_Y, w: ASK.w - 8, d: 3, r: 1 }, BASE_H, 5, P, 2, 0.3),
  slotFront: k.slabOf({ x: ASK.x + 4, y: SLOT_Y + 4.6, w: ASK.w - 8, d: 3, r: 1 }, BASE_H, 5, P, 2, 0.3),
  slotScrews: [at([ASK.x + 8, SLOT_Y + 6.1, BASE_H + 5]), at([ASK.x + ASK.w - 8, SLOT_Y + 6.1, BASE_H + 5])],
  question: k.slabOf({ x: SLIP.x, y: SLOT_Y + 3.2, w: SLIP.w, d: 1.2, r: 0.3 }, BASE_H + 1.5, SLIP.h, P, 2),
  // A printed band across the top of the card, edge to edge and on round its end
  questionBand: k.pathOf([at([SLIP.x, SLOT_Y + 4.4, BASE_H + 15.2]), at([SLIP.x + SLIP.w, SLOT_Y + 4.4, BASE_H + 15.2]), at([SLIP.x + SLIP.w, SLOT_Y + 3.2, BASE_H + 15.2])]),
  questionText: k.sideMatrix([SLIP.x + SLIP.w / 2, SLOT_Y + 4.4], BASE_H + 8.6, P, "left"),
};

// ── The ranking box and the answer printer ──

function docOf(index: number) {
  const y = DOC_Y(index);
  const on = (dx: number, down: number): Point3 => [DOC_X + dx, y + 1.1, DOC_TOP - down];
  const long = 26 + ((index * 11) % 17);
  return {
    slab: k.slabOf({ x: DOC_X, y, w: DOC_W, d: 1.1, r: 0.3 }, DOC_Z, DOC_H, P, 2),
    title: k.segment(on(5, 3.6), on(5 + long * 0.6, 3.6), P),
    text: k.segment(on(5, 6.4), on(5 + long, 6.4), P) + k.segment(on(5, 8.8), on(long - 3, 8.8), P),
  };
}

const wall = (plan: Plan) => k.slabOf(plan, BASE_H, WALL_H, P, 2, 0.4);
const BOX_Y0 = 8;
const BOX_Y1 = 58;
const onSheet = (dx: number, down: number): Point3 => [SHEET.x + dx, SHEET.y + 0.8, BASE_H + SHEET.h - down];

export const RANK_ART = {
  base: k.slabOf(RANK, 0, BASE_H, P, 6, 0.6),
  seam: k.sideSeam(RANK, 1.8, P, 6),
  boxBack: wall({ x: BOX_X, y: BOX_Y0, w: BOX_W, d: WALL, r: 1 }),
  boxLeft: wall({ x: BOX_X, y: BOX_Y0 + WALL, w: WALL, d: BOX_Y1 - BOX_Y0 - WALL * 2, r: 0.6 }),
  boxRight: wall({ x: BOX_X + BOX_W - WALL, y: BOX_Y0 + WALL, w: WALL, d: BOX_Y1 - BOX_Y0 - WALL * 2, r: 0.6 }),
  boxFront: wall({ x: BOX_X, y: BOX_Y1 - WALL, w: BOX_W, d: WALL, r: 1 }),
  rivets: [at([BOX_X + 5, BOX_Y1, BASE_H + WALL_H - 3]), at([BOX_X + BOX_W - 5, BOX_Y1, BASE_H + WALL_H - 3])],
  docs: SOURCES.map((_, index) => docOf(index)),
  printerBack: k.slabOf(PRINTER_BACK, BASE_H, PRINTER_BACK_TOP - BASE_H, P, 4, 0.5),
  vents: [5, 8.5, 12].map((y) => k.planOutline({ x: PRINTER_X + 8, y: PRINTER_BACK.y + y, w: 30, d: 1.6, r: 0.8 }, PRINTER_BACK_TOP, P, 3)).join(""),
  printerScrews: [at([PRINTER_X + 3.4, PRINTER_BACK.y + 19, PRINTER_BACK_TOP]), at([PRINTER_X + PRINTER_W - 3.4, PRINTER_BACK.y + 19, PRINTER_BACK_TOP])],
  // The answer: a few lines of writing, and a mark for each reference
  answer: k.slabOf({ x: SHEET.x, y: SHEET.y, w: SHEET.w, d: 0.8, r: 0.2 }, BASE_H, SHEET.h, P, 2),
  answerText: k.segment(onSheet(4, 2.8), onSheet(30, 2.8), P) + k.segment(onSheet(4, 5.2), onSheet(26, 5.2), P),
  answerRefs: [at(onSheet(5, 8.2)), at(onSheet(9.5, 8.2))],
  printerFront: k.slabOf(PRINTER_FRONT, BASE_H, PRINTER_FRONT_TOP - BASE_H, P, 4, 0.5),
  printerLine: k.planOutline(k.insetPlan({ ...PRINTER_FRONT, y: PRINTER_FRONT.y + 3, d: PRINTER_FRONT.d - 3 }, 2.6), PRINTER_FRONT_TOP, P, 3),
  button: k.cylinder(PRINTER_X + PRINTER_W - 9, 46, 2.6, PRINTER_FRONT_TOP, 1.4, P, 20),
  buttonDot: [at([PRINTER_X + PRINTER_W - 9, 46, PRINTER_FRONT_TOP + 1.4])],
};
