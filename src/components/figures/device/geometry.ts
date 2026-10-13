// The character as a thing on a bench: a pedestal with a speaker grille, and a
// body whose face that looks at the viewer is a screen. Built wherever a figure
// stands it, in that figure's own camera.

import * as k from "@/components/iso/iso-kit";
import type { Flat, Plan, Plane, Point3, Projection } from "@/components/iso/iso-kit";

/** The screen's width and height, in world units. */
export const SCREEN = { w: 54, h: 38 };
const PEDESTAL_TOP = 6;
const BODY_Z = PEDESTAL_TOP + 5;
const BODY_H = 56;

/** The floor the device takes up, with its back left corner at `x`, `y`. */
export const footprintOf = (x: number, y: number): Plan => ({ x, y, w: 88, d: 56, r: 8 });
/** How high it stands. */
export const DEVICE_TOP = BODY_Z + BODY_H;

/** How the body is carried at a moment: lifted, shifted along the bench, and stretched, as the engine's frame has it. */
export interface Carriage {
  lift: number;
  shift: number;
  wide: number;
  tall: number;
}

export const AT_REST: Carriage = { lift: 0, shift: 0, wide: 1, tall: 1 };
/** World units to one unit of the real character's own, which is 510 across. */
export const TO_WORLD = 76 / 510;

export function deviceOf(x: number, y: number, P: Projection) {
  const at = (point: Point3): Flat => k.iso(point, P);
  const pedestal = footprintOf(x, y);
  const centre: Plane = [x + 44, y + 28];

  // The body and everything on it, however it is being carried
  const bodyOf = ({ lift, shift, wide, tall }: Carriage) => {
    const w = 76 * wide;
    const body: Plan = { x: centre[0] - w / 2 + shift, y: y + 6, w, d: 44, r: 11 };
    const floor = BODY_Z + lift;
    const height = BODY_H * tall;
    const face = body.y + body.d;
    const [sw, sh] = [SCREEN.w * wide, SCREEN.h * tall];
    const screenX = body.x + (body.w - sw) / 2;
    const screenTop = floor + height - 8 * tall;
    const onScreen = (dx: number, down: number): Point3 => [screenX + dx, face, screenTop - down];
    // A rounded rectangle on the face, as a path
    const frame = (inset: number, r: number, steps = 6) => {
      const [fw, fh] = [sw - inset * 2, sh - inset * 2];
      const points: Flat[] = [];
      const corner = (cx: number, cy: number, from: number) => {
        for (let step = 0; step <= steps; step++) {
          const angle = from + (step / steps) * (Math.PI / 2);
          points.push(at(onScreen(inset + cx + r * Math.cos(angle), inset + cy + r * Math.sin(angle))));
        }
      };
      corner(fw - r, r, -Math.PI / 2);
      corner(fw - r, fh - r, 0);
      corner(r, fh - r, Math.PI / 2);
      corner(r, r, Math.PI);
      return k.pathOf(points, true);
    };
    return {
      body: k.slabOf(body, floor, height, P, 10, 1.4),
      seams: k.sideSeam(body, floor + 4, P, 10) + k.sideSeam(body, floor + height - 5, P, 10),
      // Vents in its top
      vents: [0, 4.4, 8.8].map((dy) => k.planOutline({ x: body.x + 22 * wide, y: body.y + 9 + dy, w: body.w - 44 * wide, d: 2, r: 1 }, floor + height, P, 3)).join(""),
      bezel: frame(-2.4, 7),
      screen: frame(0, 5),
      // Flat coordinates on the screen: x across, y down, from its top-left corner, stretched with the body
      plane: `${k.sideMatrix([screenX, face], screenTop, P, "left")} scale(${wide.toFixed(4)} ${tall.toFixed(4)})`,
      lamp: at([body.x + body.w - 12 * wide, face, floor + 5]),
    };
  };

  return {
    pedestal: k.slabOf(pedestal, 0, PEDESTAL_TOP, P, 6, 0.6),
    pedestalSeam: k.sideSeam(pedestal, 1.8, P, 6),
    // The speaker, as slots in the pedestal's top
    grille: [0, 4.2, 8.4].map((dy) => k.planOutline({ x: pedestal.x + 12, y: y + 52.6 + dy, w: pedestal.w - 24, d: 1.9, r: 0.95 }, PEDESTAL_TOP, P, 3)).join(""),
    screws: [at([pedestal.x + 5, pedestal.y + pedestal.d - 5, PEDESTAL_TOP]), at([pedestal.x + pedestal.w - 5, pedestal.y + pedestal.d - 5, PEDESTAL_TOP])],
    // Tall enough to stay inside the body when it lifts
    neck: k.cylinder(centre[0], centre[1], 15, PEDESTAL_TOP, BODY_Z - PEDESTAL_TOP + 3, P, 40),
    rest: bodyOf(AT_REST),
    /** Moves the body: up by `lift` and along the bench by `shift`, in world units. */
    carry: (lift: number, shift: number) => k.translateAlong(P, [shift, 0, lift]),
  };
}

export type DeviceArt = ReturnType<typeof deviceOf>;
