// Every path of the program disc. A disc lies on a turntable at the left with
// two tracks cut into it; an arm across it carries a follower on each track.
// A row of switches at the front decides how the disc is cut, and the
// followers are wired to the character.

import * as k from "@/components/iso/iso-kit";
import type { Flat, Plan, Plane, Point3 } from "@/components/iso/iso-kit";
import { DEVICE_TOP, deviceOf, footprintOf } from "../device/geometry";
import { CUTS, FEEL, FROM, TO, timeOf } from "./model";

export const WIDTH = 680;
export const HEIGHT = 408;

// ── World layout: x runs along the bench, y toward the viewer, z up ──

const PLATE: Plan = { x: -196, y: -100, w: 392, d: 202, r: 9 };
const PLATE_H = 9;
const FOOT_H = 5;

// The turntable and its disc
const TABLE: Plan = { x: -188, y: -96, w: 188, d: 180, r: 14 };
const TABLE_TOP = 8;
const HUB: Plane = [-100, -6];
const DISC_R = 80;
const DISC_TOP = TABLE_TOP + 4;
// Where each track rests, and how far a unit of its value moves it outward
const EYES_R = 62;
const EYES_PER = 40;
const SHELL_R = 32;
const SHELL_PER = 0.9;
/** Radians of the disc to a second: the whole stretch takes up most of a turn, and the rest is left blank. */
const TURN = (300 * Math.PI) / 180 / (TO - FROM);

// The arm: from a post at the hub to one at the table's edge, along x
const ARM_END = HUB[0] + DISC_R + 10;
const ARM_Z = DISC_TOP + 11;

// The switches
const BOX: Plan = { x: 26, y: 24, w: 158, d: 54, r: 6 };
const BOX_TOP = 11;
const KEY: Plan = { x: 0, y: BOX.y + 7, w: 22, d: 15, r: 2.6 };
const KEY_X = (index: number) => BOX.x + 10 + index * 29;
const KEY_H = 4.6;

const DEVICE = footprintOf(84, -84);

export const P = k.fitProjection([...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [DEVICE.x, DEVICE.y, DEVICE_TOP + 4], [DEVICE.x + DEVICE.w, DEVICE.y, DEVICE_TOP + 4]], WIDTH, HEIGHT, { pad: 22, headroom: 6 });

const at = (point: Point3): Flat => k.iso(point, P);
const byDepth = (points: Plane[]) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const share = (point: Point3) => {
  const [sx, sy] = at(point);
  return { left: `${Math.round((sx / WIDTH) * 1000) / 10}%`, top: `${Math.round((sy / HEIGHT) * 1000) / 10}%` };
};
const tenth = (value: number) => Math.round(value * 10) / 10;

/** Where a visitor's hand finds each switch on the drawing. */
export const TOUCH_AT = FEEL.map((_, index) => share([KEY_X(index) + KEY.w / 2, KEY.y + KEY.d / 2, BOX_TOP + KEY_H]));

// ── The plate and its wiring ──

const onPlate = (points: Plane[]) => k.onTop(points, 0, P);
const TABLE_RIGHT = TABLE.x + TABLE.w;
// The followers' two lines to the character, and the switches' line to the turntable
const EYES_WIRE: Plane[] = [[TABLE_RIGHT + 3, HUB[1] - 4], [58, HUB[1] - 4], [58, DEVICE.y + 16], [DEVICE.x, DEVICE.y + 16]];
const SHELL_WIRE: Plane[] = [[TABLE_RIGHT + 3, HUB[1] + 6], [70, HUB[1] + 6], [70, DEVICE.y + 32], [DEVICE.x, DEVICE.y + 32]];
const CUT_WIRE: Plane[] = [[BOX.x - 3, BOX.y + 30], [TABLE_RIGHT + 3, BOX.y + 30]];
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
  /** In order: the eyes' line, the shell's, and the switches'. */
  wires: [onPlate(EYES_WIRE), onPlate(SHELL_WIRE), onPlate(CUT_WIRE)],
  glands: {
    tableOut: [gland(TABLE_RIGHT, HUB[1] - 8, 3, 8), gland(TABLE_RIGHT, HUB[1] + 2, 3, 8), gland(TABLE_RIGHT, BOX.y + 26, 3, 8)],
    deviceIn: [gland(DEVICE.x - 3, DEVICE.y + 12, 3, 8), gland(DEVICE.x - 3, DEVICE.y + 28, 3, 8)],
    boxOut: gland(BOX.x - 3, BOX.y + 26, 3, 8),
  },
};

// ── The turntable ──

const post = (x: number, y: number, r: number, from: number, to: number) => k.cylinder(x, y, r, from, to - from, P, 20, 0.3);
const carriageOf = (r: number): Plan => ({ x: HUB[0] + r - 4.5, y: HUB[1] - 5, w: 9, d: 10, r: 1.8 });

export const TABLE_ART = {
  base: k.slabOf(TABLE, 0, TABLE_TOP, P, 9, 1),
  seam: k.sideSeam(TABLE, 2.4, P, 9),
  screws: k.corners(TABLE, 8).map(([x, y]) => at([x, y, TABLE_TOP])),
  well: k.ring(HUB[0], HUB[1], DISC_R + 3, TABLE_TOP, P, 72),
  disc: k.cylinder(HUB[0], HUB[1], DISC_R, TABLE_TOP, DISC_TOP - TABLE_TOP, P, 96, 0.5),
  // Where each track rests: a fine ring the cut wanders either side of
  rests: k.ring(HUB[0], HUB[1], EYES_R, DISC_TOP, P, 72) + k.ring(HUB[0], HUB[1], SHELL_R, DISC_TOP, P, 56),
  label: k.ring(HUB[0], HUB[1], 15, DISC_TOP, P, 40),
  hub: post(HUB[0], HUB[1], 5, DISC_TOP, ARM_Z + 3),
  hubCap: [at([HUB[0], HUB[1], ARM_Z + 3])],
  bar: k.slabOf({ x: HUB[0] - 3, y: HUB[1] - 2.4, w: ARM_END - HUB[0] + 6, d: 4.8, r: 1.6 }, ARM_Z, 2.6, P, 2, 0.3),
  end: post(ARM_END, HUB[1], 3.4, TABLE_TOP, ARM_Z + 3),
  endFoot: k.cylinder(ARM_END, HUB[1], 5.4, TABLE_TOP, 1.2, P, 20),
  endCap: [at([ARM_END, HUB[1], ARM_Z + 3])],
  // The two followers, built where their tracks rest: a carriage on the arm and a stylus down to the disc
  followers: [EYES_R, SHELL_R].map((r) => ({
    carriage: k.slabOf(carriageOf(r), ARM_Z - 2, 7, P, 3, 0.4),
    stylus: k.rise([HUB[0] + r, HUB[1]], DISC_TOP, ARM_Z - 2, P),
    tip: [at([HUB[0] + r, HUB[1], DISC_TOP])],
    name: k.topMatrix([HUB[0] + r, HUB[1] + 1.3], ARM_Z + 5, P, "x"),
  })),
};

/** Moves a follower along the arm for its track's value at the moment under it. */
export const eyesAt = (value: number) => k.translateAlong(P, [value * EYES_PER, 0, 0]);
export const shellAt = (value: number) => k.translateAlong(P, [value * SHELL_PER, 0, 0]);

// The disc turns under the arm: the moment `moment` lies this far round from the arm when the disc stands at `t`
const round = (moment: number, t: number) => (moment - t) * TURN;
const onDisc = (r: number, angle: number) => {
  const [sx, sy] = at([HUB[0] + r * Math.cos(angle), HUB[1] + r * Math.sin(angle), DISC_TOP]);
  return `${tenth(sx)} ${tenth(sy)}`;
};

/** A track as it lies with the disc standing at `t`. */
function trackOf(values: Float32Array, rest: number, per: number, t: number) {
  let d = "";
  for (let index = 0; index < CUTS; index++) d += `${index ? "L" : "M"}${onDisc(rest + values[index] * per, round(timeOf(index), t))}`;
  return d;
}
export const eyesTrack = (values: Float32Array, t: number) => trackOf(values, EYES_R, EYES_PER, t);
export const shellTrack = (values: Float32Array, t: number) => trackOf(values, SHELL_R, SHELL_PER, t);

/** The disc's own markings, turned with it: a tick at every tenth of a second round its edge, and a line across it where the change begins. */
export function marksOf(t: number) {
  let ticks = "";
  for (let moment = FROM; moment <= TO + 0.001; moment += 0.05) {
    const whole = Math.abs(moment * 10 - Math.round(moment * 10)) < 0.01;
    const angle = round(moment, t);
    ticks += `M${onDisc(DISC_R - 2, angle)}L${onDisc(DISC_R - (whole ? 7 : 4.5), angle)}`;
  }
  const start = round(0, t);
  return { ticks, start: `M${onDisc(18, start)}L${onDisc(DISC_R - 2, start)}` };
}

// ── The switches ──

export const BOX_ART = {
  base: k.slabOf(BOX, 0, BOX_TOP, P, 6, 0.8),
  seam: k.sideSeam(BOX, 2.6, P, 6),
  groove: k.planOutline(k.insetPlan(BOX, 3.6), BOX_TOP, P),
  screws: k.corners(BOX, 6).map(([x, y]) => at([x, y, BOX_TOP])),
  keys: FEEL.map((_, index) => {
    const plan: Plan = { ...KEY, x: KEY_X(index) };
    return {
      well: k.planOutline(k.insetPlan(plan, -1.4), BOX_TOP, P, 4),
      cap: k.slabOf(plan, BOX_TOP, KEY_H, P, 4, 0.4),
      lamp: [at([plan.x + plan.w / 2, plan.y + 4, BOX_TOP + KEY_H])],
      name: k.topMatrix([plan.x + plan.w / 2 + 1.3, plan.y + plan.d + 4], BOX_TOP, P, "y"),
    };
  }),
};

/** Moves a switch down when it is off. */
export const keyAt = (down: number) => k.translateAlong(P, [0, 0, -down * 2.8]);

// ── The character ──

export const DEVICE_ART = deviceOf(DEVICE.x, DEVICE.y, P);
