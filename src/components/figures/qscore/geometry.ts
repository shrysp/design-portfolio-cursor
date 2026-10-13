// Every path of the Q-score bench: one contact card, wired to two meters, one
// per goal. The static parts are computed once, when the module loads; the
// needles and score arcs are rebuilt from the functions at the bottom.

import * as k from "@/components/iso/iso-kit";
import type { Flat, Plan, Plane, Point3 } from "@/components/iso/iso-kit";
import { GOALS, SCALE } from "./model";

export const WIDTH = 600;
export const HEIGHT = 360;

// ── World layout: x and y on the bench, z up, about a pixel a unit ──

const PLATE: Plan = { x: -128, y: -78, w: 256, d: 156, r: 9 };
const PLATE_H = 12;
const FOOT_H = 5;

// The contact: one card, clamped in a holder at the back
const HOLDER: Plan = { x: -47, y: -68, w: 94, d: 22, r: 3 };
const HOLDER_H = 7;
const CARD: Plan = { x: -39, y: -58, w: 78, d: 1.6, r: 0.3 };
const CARD_H = 46;
const CARD_FACE = CARD.y + CARD.d;
const CARD_TOP = HOLDER_H + CARD_H;

// The meters: a square housing each, with a round dial let into its top and a name strip in front
const METER_X = [-63, 63];
const HOUSING_H = 14;
const BEZEL_H = 5;
const DIAL_TOP = HOUSING_H + BEZEL_H;
const DIAL_Y = 16;
const DIAL_R = 33;
const RIM_R = DIAL_R - 2.4;
const TRACK_R = DIAL_R - 12;
const NUMERALS_R = DIAL_R - 18.5;
const NEEDLE_Z = DIAL_TOP + 0.4;
const HUB_H = 1.6;
const housingOf = (cx: number): Plan => ({ x: cx - 40, y: -22, w: 80, d: 90, r: 7 });

// Each scale sweeps 270°, with its middle pointing away from the viewer
const SWEEP = Math.PI * 1.5;
const MIDDLE = -Math.PI / 4;

// The rest of the network, waiting in a tray
const TRAY: Plan = { x: 66, y: -70, w: 32, d: 26, r: 2.5 };
const TRAY_H = 5;

export const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [CARD.x, CARD.y, CARD_TOP + 2], [METER_X[1] + 40, DIAL_Y, DIAL_TOP]],
  WIDTH,
  HEIGHT,
  { pad: 26 },
);

const at = (point: Point3): Flat => k.iso(point, P);
const byDepth = (points: Plane[]) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

/** The direction a dial angle points: 0 is away along −y, growing clockwise from above. */
const toward = (angle: number): Plane => [Math.sin(angle), -Math.cos(angle)];
const from = ([cx, cy]: Plane, angle: number, radius: number): Plane => {
  const [dx, dy] = toward(angle);
  return [cx + dx * radius, cy + dy * radius];
};
const angleOf = (score: number) => MIDDLE + (score / SCALE - 0.5) * SWEEP;

/** An arc of a dial face between two scores, as points. */
function arcBetween(centre: Plane, low: number, high: number, radius: number): Plane[] {
  const steps = Math.max(Math.ceil(Math.abs(high - low) / 1.5), 1);
  const points: Plane[] = [];
  for (let step = 0; step <= steps; step++) points.push(from(centre, angleOf(low + ((high - low) * step) / steps), radius));
  return points;
}

// ── Base ──

const LABEL: Plan = { x: -15, y: 48, w: 30, d: 14, r: 1.5 };

export const BASE_ART = {
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
  label: k.slabOf(LABEL, 0, 0.8, P, 4),
  labelLine: k.planOutline(k.insetPlan(LABEL, 1.6), 0.8, P, 4),
  labelRule: [4.4, 7, 9.6].map((y, index) => k.lineOnTop([LABEL.x + 4, LABEL.y + y], [LABEL.x + [22, 16, 19][index], LABEL.y + y], 0.8, P)).join(""),
  labelScrews: [at([LABEL.x + LABEL.w - 3, LABEL.y + 3, 0.8]), at([LABEL.x + LABEL.w - 3, LABEL.y + LABEL.d - 3, 0.8])],
};

// ── The contact card in its holder ──

const JAWS: Plan[] = [
  { x: CARD.x - 5, y: CARD.y - 3.2, w: 5, d: 8, r: 1 },
  { x: CARD.x + CARD.w, y: CARD.y - 3.2, w: 5, d: 8, r: 1 },
];
const JAW_TOP = HOLDER_H + 14;
const PORTRAIT_R = 5.6;
const SHOULDER = (48 * Math.PI) / 180;
/** A point on the card's face: `x` in from its left edge, `down` from its top. */
const onCard = (x: number, down: number): Point3 => [CARD.x + x, CARD_FACE, CARD_TOP - down];
const cardRule = (x0: number, x1: number, down: number) => k.segment(onCard(x0, down), onCard(x1, down), P);
// Where each signal is flagged on the card, one row per goal
const SIGNAL_ROWS = [26.5, 36.5];
// Where each meter's lead leaves the holder
const LEAD_X = [-28, 28];
const LEAD_Y = -34;

export const HOLDER_ART = {
  block: k.slabOf(HOLDER, 0, HOLDER_H, P, 5, 0.5),
  seam: k.sideSeam(HOLDER, 2, P, 5),
  groove: k.planOutline(k.insetPlan(HOLDER, 2.6), HOLDER_H, P, 5),
  screws: [at([HOLDER.x + 5, HOLDER.y + HOLDER.d - 4.5, HOLDER_H]), at([HOLDER.x + HOLDER.w - 5, HOLDER.y + HOLDER.d - 4.5, HOLDER_H])],
  jaws: JAWS.map((plan) => k.slabOf(plan, HOLDER_H, JAW_TOP - HOLDER_H, P, 3, 0.4)),
  jawScrew: [at([JAWS[0].x + 2.5, JAWS[0].y + 4, JAW_TOP])],
  thumb: k.cylinder(JAWS[1].x + 2.5, JAWS[1].y + 4, 2.3, JAW_TOP, 3.2, P, 20),
  thumbKnurl: k.knurl(JAWS[1].x + 2.5, JAWS[1].y + 4, 2.3, JAW_TOP, JAW_TOP + 3.2, 18, P, 0.3),
  card: k.slabOf(CARD, HOLDER_H, CARD_H, P, 2),
  // The face of the card: a portrait and a name, then what is true of them right now
  portrait: k.sideRing(onCard(11, 9.5), PORTRAIT_R, "y", P, 36),
  head: k.sideRing(onCard(11, 7.8), 1.9, "y", P, 16),
  // The shoulders spring from the portrait's own ring, so both ends land on it
  shoulders: k.pathOf(
    Array.from({ length: 13 }, (_, step) => {
      const across = (step / 6 - 1) * PORTRAIT_R * Math.sin(SHOULDER);
      const drop = PORTRAIT_R * Math.cos(SHOULDER);
      return at(onCard(11 + across, 9.5 + drop - 2.7 * (1 - (step / 6 - 1) ** 2)));
    }),
  ),
  name: cardRule(21, 46, 7.4),
  role: cardRule(21, 37, 11.4),
  // The rule under the name runs across the face and on round the card's edge, so it ends on the outline
  divider: k.pathOf([at(onCard(0, 18.5)), at(onCard(CARD.w, 18.5)), at([CARD.x + CARD.w, CARD.y, CARD_TOP - 18.5])]),
  signals: SIGNAL_ROWS.map((down) => ({
    flag: k.sideRing(onCard(7.5, down - 1.6), 1.9, "y", P, 16),
    text: k.sideMatrix([CARD.x + 13, CARD_FACE], CARD_TOP - down, P, "left"),
  })),
  glands: LEAD_X.map((x) => k.slabOf({ x: x - 4, y: HOLDER.y + HOLDER.d, w: 8, d: 3, r: 0.8 }, 0, 4, P, 2)),
  // A lead from the holder to each meter: out, across, and in under the housing's back
  leads: LEAD_X.map((x, index) =>
    k.onTop(
      [
        [x, HOLDER.y + HOLDER.d + 3],
        [x, LEAD_Y],
        [METER_X[index], LEAD_Y],
        [METER_X[index], housingOf(METER_X[index]).y],
      ],
      0,
      P,
    ),
  ),
  clips: LEAD_X.map((x, index) => k.slabOf({ x: (x + METER_X[index]) / 2 - 1.7, y: LEAD_Y - 2.5, w: 3.4, d: 5, r: 0.8 }, 0, 1.5, P, 2)),
};

// ── The tray of other contacts ──

const TRAY_CARDS = [0, 1, 2, 3].map((index): Plan => ({ x: TRAY.x + 3, y: TRAY.y + 3.4 + index * 4.6, w: TRAY.w - 6, d: 1.2, r: 0.3 }));
const lastCard = TRAY_CARDS[TRAY_CARDS.length - 1];
const onLast = (x: number, z: number): Point3 => [lastCard.x + x, lastCard.y + lastCard.d, TRAY_H + z];

export const TRAY_ART = {
  block: k.slabOf(TRAY, 0, TRAY_H, P, 4, 0.4),
  groove: k.planOutline(k.insetPlan(TRAY, 1.8), TRAY_H, P, 4),
  cards: TRAY_CARDS.map((plan, index) => k.slabOf(plan, TRAY_H, 19 - (index % 2) * 1.6, P, 2)),
  portrait: k.sideRing(onLast(6, 11.5), 3, "y", P, 20),
  rules: k.segment(onLast(11.5, 12.8), onLast(22, 12.8), P) + k.segment(onLast(11.5, 10), onLast(18, 10), P),
  lip: k.slabOf({ x: TRAY.x, y: TRAY.y + TRAY.d - 2.6, w: TRAY.w, d: 2.6, r: 1.2 }, TRAY_H, 2.6, P, 3),
};

// ── The meters ──

function meterOf(cx: number) {
  const housing = housingOf(cx);
  const dial: Plane = [cx, DIAL_Y];
  const ticks = k.radialTicks(cx, DIAL_Y, RIM_R, 50, 5, DIAL_TOP, [1.5, 3], P, angleOf(0), SWEEP);
  const front = housing.y + housing.d;
  // The window the score shows in, let into the name strip
  const window: Plan = { x: cx + 15, y: front - 14.4, w: 19, d: 10.4, r: 1.6 };
  return {
    housing: k.slabOf(housing, 0, HOUSING_H, P, 8, 1),
    seam: k.sideSeam(housing, 3, P, 8),
    screws: k.corners(housing, 6).map(([x, y]) => at([x, y, HOUSING_H])),
    screwRings: k
      .corners(housing, 6)
      .map(([x, y]) => k.ring(x, y, 1.8, HOUSING_H, P, 14))
      .join(""),
    bezel: k.cylinder(cx, DIAL_Y, DIAL_R, HOUSING_H, BEZEL_H, P, 76, 0.8),
    knurl: k.knurl(cx, DIAL_Y, DIAL_R, DIAL_TOP - 3, DIAL_TOP, 130, P, 0.3),
    band: k.sideArc(cx, DIAL_Y, DIAL_R, DIAL_TOP - 3, P, 44),
    rim: k.ring(cx, DIAL_Y, RIM_R, DIAL_TOP, P, 76),
    minor: ticks.minor,
    major: ticks.major,
    // The scale's two end stops run in from the rim to close the track
    stops: [0, SCALE].map((score) => k.lineOnTop(from(dial, angleOf(score), TRACK_R), from(dial, angleOf(score), RIM_R), DIAL_TOP, P)).join(""),
    track: k.onTop(arcBetween(dial, 0, SCALE, TRACK_R), DIAL_TOP, P),
    numerals: [0, 50, 100].map((score) => ({
      text: `${score}`,
      transform: k.topMatrix(from(from(dial, angleOf(score), NUMERALS_R), Math.PI, 1.6), DIAL_TOP, P, "x"),
    })),
    hub: k.cylinder(cx, DIAL_Y, 3.2, DIAL_TOP, HUB_H, P, 24),
    hubDot: [at([cx, DIAL_Y, DIAL_TOP + HUB_H])],
    // The name strip: the goal engraved on the left, its score in a window on the right
    name: k.topMatrix([cx - 30, front - 6.4], HOUSING_H, P, "x"),
    window: k.planOutline(window, HOUSING_H, P, 4),
    score: k.topMatrix([window.x + window.w / 2, window.y + window.d - 2.2], HOUSING_H, P, "x"),
  };
}

export const METERS = METER_X.map(meterOf);

// ── What moves ──

/** A meter's needle, pointing at a score. */
export const needleAt = (meter: number, score: number) => {
  const dial: Plane = [METER_X[meter], DIAL_Y];
  return k.lineOnTop(from(dial, angleOf(score) + Math.PI, 5), from(dial, angleOf(score), RIM_R - 4.2), NEEDLE_Z, P);
};

/** A meter's lit arc, filled from zero up to a score, like the ring around a Q-score in the product. */
export const arcAt = (meter: number, score: number) => k.onTop(arcBetween([METER_X[meter], DIAL_Y], 0, Math.max(score, 0.01), TRACK_R), DIAL_TOP, P);

/** The scores at rest, for the first paint. */
export const REST = GOALS.map((goal, index) => ({ needle: needleAt(index, goal.score), arc: arcAt(index, goal.score) }));
