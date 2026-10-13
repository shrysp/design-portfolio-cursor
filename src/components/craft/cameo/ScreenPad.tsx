"use client";

import { useRef, type HTMLAttributes, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { DRAWN_DEFAULTS, HOUSING_W, PALETTE_MAP, housingHeight, type Silhouette } from "@shrysp/cameo";
import { EYE_LEVEL, EYE_SPACING, PAD, SCREEN_REACH, eyeMetrics, eyePath, type Drawn } from "./shape";
import "./pad.css";

// The colour of the character's screen, which the plan's glass and knobs take
const ACCENT = PALETTE_MAP.green.screen[1];

type Seat = { x: number; y: number; fit: number; gap?: number };

interface PlanProps {
  head: Silhouette;
  drawn: Drawn;
  /** Where the eyes go when left alone; back there, they are let go again. */
  eyeRest: number;
  /** How the eyes would be seated at the usual spacing, for marking where that is. */
  spacingRest: Seat | null;
}

/** Everything about the plan that is worked out from the head. */
function planOf({ head, drawn, spacingRest }: Omit<PlanProps, "eyeRest">) {
  const outline = head.outline;
  if (!outline) return null;
  const height = housingHeight(head);
  const { box } = outline;
  const seat: Seat = outline.eyes ?? { x: 0.5, y: 0.5, fit: 1 };
  const metrics = eyeMetrics();
  const middle = box.x + box.width * seat.x;
  const row = box.y + box.height * seat.y;
  /** How far each eye stands from the middle. */
  const out = metrics.spread * box.width * seat.fit * (seat.gap ?? 1);
  const at = drawn.screenAt;
  const reach = drawn.screenReach * HOUSING_W;
  const knob = at && { x: at.x * HOUSING_W + reach * Math.SQRT1_2, y: at.y * height + reach * Math.SQRT1_2 };

  // The plan is drawn with room beside it and beneath for the two rails the
  // eyes are worked from. Everything on it that should look the same size
  // whatever the head's proportions is sized in `u`: a pixel, in the head's
  // units, at the size the plan will be shown.
  const u = Math.max(height / (PAD.tall - PAD.below), HOUSING_W / (PAD.wide - PAD.beside * 2));
  const view = { x: -PAD.beside * u, y: 0, width: HOUSING_W + PAD.beside * 2 * u, height: height + PAD.below * u };
  const rail = { x: HOUSING_W + 16 * u, y: height + 16 * u };
  const levelAt = (level: number) => box.y + (1 - level) * box.height;
  /** How far out an eye stands at the usual spacing. */
  const usual = spacingRest ? metrics.spread * box.width * spacingRest.fit * (spacingRest.gap ?? 1) : null;
  const eyeSize = metrics.size * box.height * seat.fit;

  return { outline, height, box, middle, row, out, at, reach, knob, u, view, rail, levelAt, usual, eyeSize };
}

type Plan = NonNullable<ReturnType<typeof planOf>>;

/** What a pointer can be shown holding, on a plan that plays by itself */
export type PointerOn = "level" | "spacing" | "reach" | "screen";

/**
 * The plan itself, as the playground draws it: the shell's outline, the screen
 * inside it and the eyes on that, a rail beside the head for how high the eyes
 * sit and one beneath for how far apart, each handle joined to the eyes by a
 * line. `row` and `out` can be given to show the eyes somewhere other than
 * where the head seats them, which is how the tile on the wall plays.
 */
function PlanDrawing({
  plan,
  eyeRest,
  pointer,
  svgProps,
}: {
  plan: Plan;
  eyeRest: number;
  /** Shows a pointer resting on one of the things that can be taken hold of */
  pointer?: PointerOn | null;
  svgProps?: React.SVGProps<SVGSVGElement>;
}) {
  const { outline, height, box, middle, row, out, at, reach, knob, u, view, rail, levelAt, usual, eyeSize } = plan;
  const pointerAt =
    pointer === "level"
      ? { x: rail.x, y: row }
      : pointer === "spacing"
        ? { x: middle + out, y: rail.y }
        : pointer === "reach"
          ? knob
          : pointer === "screen" && at
            ? { x: at.x * HOUSING_W, y: at.y * height }
            : null;

  return (
    <svg
      viewBox={`${view.x.toFixed(1)} ${view.y} ${view.width.toFixed(1)} ${view.height.toFixed(1)}`}
      // Never letterboxed: where a press lands is read off the plan's own box.
      style={{
        aspectRatio: `${view.width.toFixed(1)} / ${view.height.toFixed(1)}`,
        width: `min(100%, ${(view.width / u).toFixed(0)}px)`,
      }}
      role="img"
      {...svgProps}
    >
      <path className="pad-shell" d={outline.housingPath} />
      <path className="pad-glass" d={outline.screenPath} transform={`translate(${box.x} ${box.y})`} />
      {at && <circle className="pad-reach" cx={at.x * HOUSING_W} cy={at.y * height} r={reach} />}
      {(["left", "right"] as const).map((side) => (
        <path
          key={side}
          className="pad-eye"
          data-part={side}
          d={eyePath(side, eyeSize)}
          transform={`translate(${middle + (side === "left" ? -1 : 1) * out} ${row})`}
        />
      ))}
      {knob && <circle className="pad-knob" data-part="reach" cx={knob.x} cy={knob.y} r={6 * u} />}

      {/* How high the eyes sit: a rail beside the head, its handle level
          with them and joined to them by a line. */}
      <line className="pad-rail" x1={rail.x} x2={rail.x} y1={levelAt(EYE_LEVEL.max)} y2={levelAt(EYE_LEVEL.min)} />
      {/* Where they go left alone, marked: the handle catches there. */}
      <line className="pad-mark" x1={rail.x - 7 * u} x2={rail.x + 7 * u} y1={levelAt(eyeRest)} y2={levelAt(eyeRest)} />
      <line className="pad-guide" x1={middle + out} x2={rail.x} y1={row} y2={row} />
      {/* More to take hold of than the handle shows: the playground's is the
          handle alone, which is a small thing to land on */}
      <rect className="pad-hit" data-part="level" data-way="up" x={rail.x - 20 * u} y={row - 18 * u} width={40 * u} height={36 * u} />
      <rect className="pad-handle" data-part="level" data-way="up" x={rail.x - 9 * u} y={row - 5 * u} width={18 * u} height={10 * u}>
        <title>Eye height</title>
      </rect>
      <text className="pad-label" fontSize={9 * u} transform={`translate(${rail.x + 20 * u} ${row}) rotate(90)`}>
        HEIGHT
      </text>

      {/* How far apart they stand: a rail beneath, a handle under each. */}
      <line className="pad-rail" x1={box.x} x2={box.x + box.width} y1={rail.y} y2={rail.y} />
      {usual != null &&
        [-1, 1].map((sign) => (
          <line key={sign} className="pad-mark" x1={middle + sign * usual} x2={middle + sign * usual} y1={rail.y - 7 * u} y2={rail.y + 7 * u} />
        ))}
      {(["left", "right"] as const).map((side) => {
        const x = middle + (side === "left" ? -1 : 1) * out;
        return (
          <g key={side}>
            <line className="pad-guide" x1={x} x2={x} y1={row} y2={rail.y} />
            {/* Each reaches no further in than halfway to the other, so that
                with the eyes close together neither takes the other's press */}
            <rect
              className="pad-hit"
              data-part={side}
              data-way="across"
              x={side === "left" ? x - 18 * u : x - Math.min(18 * u, out)}
              y={rail.y - 20 * u}
              width={18 * u + Math.min(18 * u, out)}
              height={40 * u}
            />
            <rect className="pad-handle" data-part={side} data-way="across" x={x - 5 * u} y={rail.y - 9 * u} width={10 * u} height={18 * u}>
              <title>Eye spacing</title>
            </rect>
          </g>
        );
      })}
      <text className="pad-label" fontSize={9 * u} x={middle} y={rail.y + 24 * u}>
        SPACING
      </text>
      {pointerAt && <circle className="pad-pointer" cx={pointerAt.x} cy={pointerAt.y} r={9 * u} />}
    </svg>
  );
}

/**
 * The plan with nothing to take hold of: for the tile on the wall, which plays
 * by itself. It is given the head as it stands at each moment, and what the
 * pointer is shown holding.
 */
export function StillPad({ pointer, ...props }: PlanProps & { pointer?: PointerOn | null }) {
  const plan = planOf(props);
  if (!plan) return null;
  return (
    <div className="pad" data-still="" style={{ "--accent": ACCENT } as React.CSSProperties}>
      <PlanDrawing
        plan={plan}
        eyeRest={props.eyeRest}
        pointer={pointer}
        svgProps={{ "aria-label": "A head as a plan: its outline, its screen and its eyes, with a handle for how high they sit and how far apart." }}
      />
    </div>
  );
}

/**
 * The head as a plan, to be worked on directly: the shell's outline, the
 * screen inside it and the eyes on that. A press anywhere puts the screen
 * there, and it follows a drag; the dot on its ring is pulled to set how far
 * it may reach. An eye is dragged up and down to move the pair, and sideways
 * to set how far apart they stand.
 *
 * This is Cameo's playground's own controller (ScreenPad in
 * apps/playground/src/components/Playground.tsx), brought over as it is.
 */
export default function ScreenPad({
  head,
  drawn,
  eyeRest,
  spacingRest,
  over,
  drop,
  onChange,
  remove,
}: PlanProps & {
  /** A file is being dragged over it, and what takes one that is dropped. */
  over: boolean;
  drop: Pick<HTMLAttributes<HTMLDivElement>, "onDragOver" | "onDragLeave" | "onDrop">;
  onChange: (change: Partial<Drawn>) => void;
  /** The key in the corner that takes the shape away */
  remove: ReactNode;
}) {
  /** What a drag has hold of, and where on it the hold is. */
  const held = useRef<
    | { part: "screen" | "reach" }
    | {
        part: "eyes";
        sign: number;
        /** Where the press was, and how far out and how spaced the eyes were then. */
        from: { x: number; y: number };
        row: number;
        out: number;
        spacing: number;
        /** Which way the drag turned out to be going: one thing is moved at a time. */
        way: "up" | "across" | null;
      }
    | null
  >(null);

  const plan = planOf({ head, drawn, spacingRest });
  if (!plan) return null;
  const { height, box, row, out, at, view } = plan;

  /** Where the pointer is, in the head's own units. */
  const where = (event: ReactPointerEvent<SVGSVGElement>) => {
    const frame = event.currentTarget.getBoundingClientRect();
    return {
      x: view.x + ((event.clientX - frame.left) / frame.width) * view.width,
      y: view.y + ((event.clientY - frame.top) / frame.height) * view.height,
    };
  };
  const within = (v: number, dial: { min: number; max: number }) => Math.min(dial.max, Math.max(dial.min, v));
  const part = (v: number) => Number(Math.min(1, Math.max(0, v)).toFixed(3));

  const follow = (event: ReactPointerEvent<SVGSVGElement>) => {
    const hold = held.current;
    if (!hold) return;
    const p = where(event);
    if (hold.part === "screen") {
      onChange({ screenAt: { x: part(p.x / HOUSING_W), y: part(p.y / height) } });
    } else if (hold.part === "reach" && at) {
      const far = Math.hypot(p.x - at.x * HOUSING_W, p.y - at.y * height) / HOUSING_W;
      onChange({ screenReach: Number(within(far, SCREEN_REACH).toFixed(3)) });
    } else if (hold.part === "eyes") {
      const dx = p.x - hold.from.x;
      const dy = p.y - hold.from.y;
      if (!hold.way && Math.hypot(dx, dy) > HOUSING_W * 0.012) hold.way = Math.abs(dy) > Math.abs(dx) ? "up" : "across";
      if (hold.way === "up") {
        const level = Number(within(1 - (hold.row + dy - box.y) / box.height, EYE_LEVEL).toFixed(2));
        onChange({ eyeLevel: Math.abs(level - eyeRest) < 0.02 ? null : level });
      } else if (hold.way === "across") {
        // In proportion to how far out the eye was when it was taken hold of.
        // Where room is short the eyes shrink as they part, so the eye does
        // not keep exactly under the pointer; it does keep going the same way.
        const wanted = Math.max(0, hold.out + hold.sign * dx);
        const spacing = Number(within((hold.spacing * wanted) / Math.max(1, hold.out), EYE_SPACING).toFixed(2));
        // Near the usual, it is the usual: the mark on the rail is easy to come back to.
        onChange({ eyeSpacing: Math.abs(spacing - DRAWN_DEFAULTS.eyeSpacing) < 0.05 ? DRAWN_DEFAULTS.eyeSpacing : spacing });
      }
    }
  };

  return (
    <div className="pad" data-over={over || undefined} style={{ "--accent": ACCENT } as React.CSSProperties} {...drop}>
      {remove}
      <PlanDrawing
        plan={plan}
        eyeRest={eyeRest}
        svgProps={{
          "aria-label": "The head. Press to place the screen; drag an eye to move the pair.",
          onPointerDown: (event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            const p = where(event);
            const on = (event.target as Element).getAttribute("data-part");
            if (on === "left" || on === "right" || on === "level") {
              const sign = on === "left" ? -1 : 1;
              // A rail moves the one thing it is the rail of. An eye itself goes
              // whichever way it is first pulled.
              const way = (event.target as Element).getAttribute("data-way") as "up" | "across" | null;
              held.current = { part: "eyes", sign, from: p, row, out, spacing: drawn.eyeSpacing, way };
            } else if (on === "reach") {
              held.current = { part: "reach" };
            } else {
              held.current = { part: "screen" };
              follow(event);
            }
          },
          onPointerMove: follow,
          onPointerUp: () => (held.current = null),
          onPointerCancel: () => (held.current = null),
        }}
      />
    </div>
  );
}
