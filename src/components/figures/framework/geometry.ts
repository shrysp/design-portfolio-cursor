// Every path of the Search, Groups, Playbooks bench. Three stations stand on
// one plate behind a shared slot rail. Everything that moves either rises
// straight up or slides along the rail, so the painter's order never changes.

import * as k from "@/components/iso/iso-kit";
import type { Flat, Plan, Plane, Point3, SolidPaths } from "@/components/iso/iso-kit";
import { DECK, GROUP, MATCHES } from "./model";

export const WIDTH = 680;
export const HEIGHT = 376;

// ── World layout: x runs along the bench, y toward the viewer, z up ──

const PLATE: Plan = { x: -204, y: -64, w: 424, d: 128, r: 9 };
const PLATE_H = 10;
const FOOT_H = 5;

const BASE_H = 6;
const WALL = 3.4;
const WALL_H = 14;
const CARD_W = 55;
const CARD_H = 25;
const CARD_Z = BASE_H + 1;
const CARD_TOP = CARD_Z + CARD_H;

// The slot rail along the front: the query card stands in it and slides from station to station
const RAIL_Y = 28;
const RAIL_H = 5;
const SLOT_Y = RAIL_Y + 3.2;
const SLIP: { w: number; h: number } = { w: 72, h: 17 };

// Station centres along the bench
const SEARCH_X = -151;
const GROUPS_X = 0;
const PLAYBOOKS_X = 124;

/** How far a matching card rises out of its box. */
export const LIFT = 15;
/** How high a card is carried on its way from the deck to the group: clear of every card still in the deck. */
export const HIGH = 31;
/** How much further an email rises as it is sent, fading as it goes. */
export const SEND = 30;
/** How far the receipt rises out of the printer. */
export const TICKET_LIFT = 11;
/** How far the query card travels along the rail, from Search to Groups. */
export const SLIDE = GROUPS_X - SEARCH_X;
/** How high a card hangs over the rail before it drops in. */
export const DROP = 22;

export const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [SEARCH_X - CARD_W / 2, -40, CARD_TOP + LIFT + 2],
    [SEARCH_X - CARD_W / 2, -40, CARD_TOP + HIGH + 2],
    [PLAYBOOKS_X - CARD_W / 2, -22, CARD_TOP + LIFT + SEND * 0.6],
  ],
  WIDTH,
  HEIGHT,
  { pad: 28 },
);

const at = (point: Point3): Flat => k.iso(point, P);
const byDepth = (points: Plane[]) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

/** Moves a part straight up, along the rail, or anywhere over the bench. */
export const raise = (by: number) => k.translateAlong(P, [0, 0, by]);
export const carry = (by: Point3) => k.translateAlong(P, by);
export const shift = (along: number, up: number) => k.translateAlong(P, [along, 0, up]);

// ── A contact card: a thin slab with a portrait and a name on its face ──

export interface CardArt {
  slab: SolidPaths;
  portrait: string;
  name: string;
  role: string;
}

function cardOf(x: number, y: number, seed: number): CardArt {
  const face = y + 1.1;
  const on = (dx: number, down: number): Point3 => [x + dx, face, CARD_TOP - down];
  const long = 14 + ((seed * 7) % 12);
  return {
    slab: k.slabOf({ x, y, w: CARD_W, d: 1.1, r: 0.3 }, CARD_Z, CARD_H, P, 2),
    portrait: k.sideRing(on(6.5, 5), 3, "y", P, 20),
    name: k.segment(on(12.5, 3.8), on(12.5 + long, 3.8), P),
    role: k.segment(on(12.5, 6.6), on(12.5 + long * 0.62, 6.6), P),
  };
}

// ── An email: the same slab, with a flap and an address ──

function envelopeOf(x: number, y: number) {
  const face = y + 1.1;
  const on = (dx: number, down: number): Point3 => [x + dx, face, CARD_TOP - down];
  return {
    slab: k.slabOf({ x, y, w: CARD_W, d: 1.1, r: 0.3 }, CARD_Z, CARD_H, P, 2),
    // The flap runs from the two top corners to a point, so every end lands on an edge
    flap: k.pathOf([at(on(0, 0)), at(on(CARD_W / 2, 9.5)), at(on(CARD_W, 0))]),
  };
}

// ── A file box: four walls round a row of cards, split so the cards sit inside ──

function boxOf(x: number, y0: number, y1: number) {
  const w = CARD_W + 5 + WALL * 2;
  const wall = (plan: Plan) => k.slabOf(plan, BASE_H, WALL_H, P, 2, 0.4);
  return {
    back: wall({ x, y: y0, w, d: WALL, r: 1 }),
    left: wall({ x, y: y0 + WALL, w: WALL, d: y1 - y0 - WALL * 2, r: 0.6 }),
    right: wall({ x: x + w - WALL, y: y0 + WALL, w: WALL, d: y1 - y0 - WALL * 2, r: 0.6 }),
    front: wall({ x, y: y1 - WALL, w, d: WALL, r: 1 }),
    rivets: [at([x + 5, y1, BASE_H + WALL_H - 3]), at([x + w - 5, y1, BASE_H + WALL_H - 3])],
  };
}

const BOX_W = CARD_W + 5 + WALL * 2;
const BOX_FRONT = 22;

// ── The plate ──

const stationPlan = (cx: number, left: number, right: number): Plan => ({ x: cx - left, y: -46, w: left + right, d: 72, r: 5 });
const SEARCH_BASE = stationPlan(SEARCH_X, 39, 69);
const GROUPS_BASE = stationPlan(GROUPS_X, 54, 54);
const PLAYBOOKS_BASE = stationPlan(PLAYBOOKS_X, 42, 82);
const LINK_Y = 14;

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
  // A lead from each station to the next
  links: [
    [SEARCH_BASE.x + SEARCH_BASE.w, GROUPS_BASE.x],
    [GROUPS_BASE.x + GROUPS_BASE.w, PLAYBOOKS_BASE.x],
  ].map(([from, to]) => k.lineOnTop([from + 3, LINK_Y], [to, LINK_Y], 0, P)),
  glands: [SEARCH_BASE, GROUPS_BASE].map((plan) => k.slabOf({ x: plan.x + plan.w, y: LINK_Y - 4, w: 3, d: 8, r: 0.8 }, 0, 4, P, 2)),
  // Each station's name, engraved on the plate in front of it
  names: [SEARCH_X, GROUPS_X, PLAYBOOKS_X].map((x) => k.topMatrix([x, 49], 0, P, "x")),
};

/** Where the status tag floats for each station: over its box, clear of anything that rises out of it, as a share of the drawing. */
export const TAG_AT = [SEARCH_X, GROUPS_X, PLAYBOOKS_X].map((x) => {
  const [sx, sy] = at([x, -30, CARD_TOP + HIGH + 30]);
  return { left: `${Math.round((sx / WIDTH) * 1000) / 10}%`, top: `${Math.round((sy / HEIGHT) * 1000) / 10}%` };
});

// ── The rail ──

const RAIL_X = PLATE.x + 8;
const RAIL_W = PLATE.w - 16;
const slipOf = (cx: number) => ({
  slab: k.slabOf({ x: cx - SLIP.w / 2, y: SLOT_Y, w: SLIP.w, d: 1.2, r: 0.3 }, 1.5, SLIP.h, P, 2),
  text: k.sideMatrix([cx, SLOT_Y + 1.2], 8.6, P, "left"),
  // A printed band across the top of the card, edge to edge
  rule: k.segment([cx - SLIP.w / 2, SLOT_Y + 1.2, 15.2], [cx + SLIP.w / 2, SLOT_Y + 1.2, 15.2], P),
});

export const RAIL_ART = {
  back: k.slabOf({ x: RAIL_X, y: RAIL_Y, w: RAIL_W, d: 3, r: 1 }, 0, RAIL_H, P, 2, 0.3),
  front: k.slabOf({ x: RAIL_X, y: RAIL_Y + 4.6, w: RAIL_W, d: 3, r: 1 }, 0, RAIL_H, P, 2, 0.3),
  frontScrews: [SEARCH_X, GROUPS_X, PLAYBOOKS_X].flatMap((x) => [at([x - 44, RAIL_Y + 6.1, RAIL_H]), at([x + 44, RAIL_Y + 6.1, RAIL_H])]),
  stops: [RAIL_X - 3, RAIL_X + RAIL_W - 1].map((x) => k.slabOf({ x, y: RAIL_Y - 1.4, w: 4, d: 10.4, r: 1.2 }, 0, RAIL_H + 2.4, P, 3, 0.4)),
  stopScrews: [RAIL_X - 1, RAIL_X + RAIL_W + 1].map((x) => at([x, RAIL_Y + 3.8, RAIL_H + 2.4])),
  // The query starts at Search; the goal drops in at Playbooks
  query: slipOf(SEARCH_X),
  goal: slipOf(PLAYBOOKS_X),
};

// ── Search: the whole deck, and a dial to tune the search ──

const SEARCH_BOX_X = SEARCH_X - BOX_W / 2;
const DECK_Y = (index: number) => -36.5 + index * 4.5;
const CONSOLE: Plan = { x: SEARCH_BOX_X + BOX_W + 7, y: -40, w: 24, d: 60, r: 3 };
const CONSOLE_TOP = BASE_H + 10;
const DIAL: Plane = [CONSOLE.x + 12, -24];
const PLAQUE: Plan = { x: CONSOLE.x + 4, y: -6, w: 16, d: 20, r: 1 };

export const SEARCH_ART = {
  base: k.slabOf(SEARCH_BASE, 0, BASE_H, P, 6, 0.6),
  seam: k.sideSeam(SEARCH_BASE, 1.8, P, 6),
  box: boxOf(SEARCH_BOX_X, -42, BOX_FRONT),
  cards: Array.from({ length: DECK }, (_, index) => ({ ...cardOf(SEARCH_X - CARD_W / 2, DECK_Y(index), index + 3), match: MATCHES.includes(index) })),
  console: k.slabOf(CONSOLE, BASE_H, CONSOLE_TOP - BASE_H, P, 4, 0.5),
  consoleLine: k.planOutline(k.insetPlan(CONSOLE, 2.2), CONSOLE_TOP, P, 4),
  skirt: k.cylinder(DIAL[0], DIAL[1], 7.6, CONSOLE_TOP, 1.2, P, 32),
  knob: k.cylinder(DIAL[0], DIAL[1], 5.6, CONSOLE_TOP + 1.2, 6, P, 32, 0.5),
  knurl: k.knurl(DIAL[0], DIAL[1], 5.6, CONSOLE_TOP + 1.2, CONSOLE_TOP + 7.2, 30, P, 0.4),
  cap: k.ring(DIAL[0], DIAL[1], 3.6, CONSOLE_TOP + 7.2, P, 24),
  pointer: k.lineOnTop(DIAL, [DIAL[0] - 2.55, DIAL[1] - 2.55], CONSOLE_TOP + 7.2, P),
  capDot: [at([DIAL[0], DIAL[1], CONSOLE_TOP + 7.2])],
  plaque: k.slabOf(PLAQUE, CONSOLE_TOP, 0.7, P, 3),
  plaqueRule: [4, 8, 12, 16].map((y, index) => k.lineOnTop([PLAQUE.x + 3, PLAQUE.y + y], [PLAQUE.x + (index % 2 ? 10 : 13), PLAQUE.y + y], CONSOLE_TOP + 0.7, P)).join(""),
  plaqueScrews: [at([PLAQUE.x + 8, PLAQUE.y + 1.6, CONSOLE_TOP + 0.7]), at([PLAQUE.x + 8, PLAQUE.y + PLAQUE.d - 1.6, CONSOLE_TOP + 0.7])],
};

// ── Groups: a box that keeps the matches, and a feeder that adds to it ──

const GROUP_BOX_X = GROUPS_X - BOX_W / 2;
const GROUP_Y = (index: number) => -19 + index * 8;
const FEEDER: Plan = { x: GROUPS_X - 30, y: -44, w: 60, d: 13, r: 2.5 };
const FEEDER_TOP = BASE_H + 22;
const LAMP: Plane = [FEEDER.x + FEEDER.w - 8, FEEDER.y + 6.5];

export const GROUPS_ART = {
  base: k.slabOf(GROUPS_BASE, 0, BASE_H, P, 6, 0.6),
  seam: k.sideSeam(GROUPS_BASE, 1.8, P, 6),
  feeder: k.slabOf(FEEDER, BASE_H, FEEDER_TOP - BASE_H, P, 4, 0.5),
  feederSeam: k.sideSeam(FEEDER, FEEDER_TOP - 4, P, 4),
  // The slot new cards come out of, and a lamp beside it
  feederSlot: k.planOutline({ x: FEEDER.x + 6, y: FEEDER.y + 5.2, w: 36, d: 2.6, r: 1.3 }, FEEDER_TOP, P, 4),
  lamp: k.cylinder(LAMP[0], LAMP[1], 2.4, FEEDER_TOP, 1.8, P, 20),
  lampDot: [at([LAMP[0], LAMP[1], FEEDER_TOP + 1.8])],
  feederScrews: [at([FEEDER.x + 3, FEEDER.y + 6.5, FEEDER_TOP])],
  box: boxOf(GROUP_BOX_X, -26, BOX_FRONT),
  // The first card is the one the group finds for itself. The rest are the deck's
  // own matches, drawn again here: each takes over from its twin once it is lifted clear.
  cards: Array.from({ length: GROUP }, (_, index) => cardOf(GROUPS_X - CARD_W / 2, GROUP_Y(index), index ? MATCHES[index - 1] + 3 : 20)),
};

/** Where each match starts its journey, measured from its place in the group. */
export const JOURNEYS = MATCHES.map((deck, index): Point3 => [SEARCH_X - GROUPS_X, DECK_Y(deck) - GROUP_Y(index + 1), 0]);

// ── Playbooks: an email for every contact in the group, and a printer for the receipt ──

const RANK_BOX_X = PLAYBOOKS_X - BOX_W / 2;
const PRINTER_X = RANK_BOX_X + BOX_W + 8;
const PRINTER_W = 32;
const TICKET_Y = -3.7;
const TICKET = { x: PRINTER_X + 5, w: 22, h: 13 };
const PRINTER_BACK: Plan = { x: PRINTER_X, y: -30, w: PRINTER_W, d: 26, r: 2 };
const PRINTER_FRONT: Plan = { x: PRINTER_X, y: -2.6, w: PRINTER_W, d: 20, r: 2 };
const PRINTER_BACK_TOP = BASE_H + 17;
const PRINTER_FRONT_TOP = BASE_H + 13;
const onTicket = (dx: number, down: number): Point3 => [TICKET.x + dx, TICKET_Y + 0.8, BASE_H + TICKET.h - down];

export const PLAYBOOKS_ART = {
  base: k.slabOf(PLAYBOOKS_BASE, 0, BASE_H, P, 6, 0.6),
  seam: k.sideSeam(PLAYBOOKS_BASE, 1.8, P, 6),
  box: boxOf(RANK_BOX_X, -26, BOX_FRONT),
  mail: Array.from({ length: GROUP }, (_, index) => envelopeOf(PLAYBOOKS_X - CARD_W / 2, GROUP_Y(index))),
  printerBack: k.slabOf(PRINTER_BACK, BASE_H, PRINTER_BACK_TOP - BASE_H, P, 4, 0.5),
  printerVents: [5, 8.5, 12].map((y) => k.planOutline({ x: PRINTER_X + 6, y: PRINTER_BACK.y + y, w: 20, d: 1.6, r: 0.8 }, PRINTER_BACK_TOP, P, 3)).join(""),
  printerScrews: [at([PRINTER_X + 3.2, PRINTER_BACK.y + 21, PRINTER_BACK_TOP]), at([PRINTER_X + PRINTER_W - 3.2, PRINTER_BACK.y + 21, PRINTER_BACK_TOP])],
  ticket: k.slabOf({ x: TICKET.x, y: TICKET_Y, w: TICKET.w, d: 0.8, r: 0.2 }, BASE_H, TICKET.h, P, 2),
  ticketMark: k.pathOf([at(onTicket(2.6, 4.2)), at(onTicket(4.2, 5.8)), at(onTicket(7, 2.4))]),
  ticketRules: k.segment(onTicket(9, 3.2), onTicket(19, 3.2), P) + k.segment(onTicket(9, 5.6), onTicket(16, 5.6), P),
  printerFront: k.slabOf(PRINTER_FRONT, BASE_H, PRINTER_FRONT_TOP - BASE_H, P, 4, 0.5),
  printerLine: k.planOutline(k.insetPlan({ ...PRINTER_FRONT, y: PRINTER_FRONT.y + 3, d: PRINTER_FRONT.d - 3 }, 2.4), PRINTER_FRONT_TOP, P, 3),
  button: k.cylinder(PRINTER_X + PRINTER_W - 8, 9, 2.6, PRINTER_FRONT_TOP, 1.4, P, 20),
  buttonDot: [at([PRINTER_X + PRINTER_W - 8, 9, PRINTER_FRONT_TOP + 1.4])],
};
