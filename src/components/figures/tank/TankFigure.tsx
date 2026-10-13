"use client";

import * as React from "react";
import { DEFAULT_CONFIG, HOUSING_W, PIP, createEngine, resolvePalette, type Engine, type EngineConfig } from "@shrysp/cameo";
import { Stage } from "@shrysp/cameo/react";
import "@shrysp/cameo/styles.css";
import { Dots, IsoFigure, Line, Solid } from "@/components/iso/react/draw";
import { follow, useInView, useLoop } from "@/components/iso/react/live";
import FigureCard from "../FigureCard";
import { Device, type DeviceHandle } from "../device/Device";
import { BENCH_ART, CHART_ART, CHART_SPAN, DEVICE_ART, GLASS, HEIGHT, INLET_ART, SCALE, TANK_ART, WIDTH, dropAt, feedOf, penAt, traceOf } from "./geometry";
import { BANDS, CAPTION, DUMPED, EVENTS, LEAVE, START, TOUR, bandOf, drain, percent, spokenOf } from "./model";
import "./tank.css";

// Its own unprompted glances are left off: on a bench it looks at its work
const FACE: EngineConfig = { ...DEFAULT_CONFIG, saccades: false, lookStrength: 0 };
// The drawn one is asked for the same moment without the breathing, so it stands still on its bench
const STILL: EngineConfig = { ...FACE, idleMotion: false };
const EACH = 1 / 30;
const KEPT = Math.ceil(CHART_SPAN / EACH) + 2;
// How long a line or a lamp stays lit after a signal
const SIGNAL = 0.55;
// How long after a visitor's last touch the tour picks up again
const TOUR_BACK = 14;

const LABEL =
  "A tall tank with a sight glass on its face, standing on a bench. A unit behind the bench takes events in from a line off it and opens the tank's fill valve; a tap at the tank's foot drips into a dish. Beside the glass a scale is marked in four bands: asleep, drowsy, idle and attentive. A float in the glass points at the band the level is in, which sets the face of a small character wired to the tank. A chart recorder along the front draws the level over time.";

const BENCH = (
  <g>
    <path className="iso-halo" d={BENCH_ART.halo} />
    {BENCH_ART.feet.map((parts, index) => (
      <g key={index}>
        {parts.map((paths, part) => (
          <Solid key={part} paths={paths} tone={part ? "mid" : "lo"} />
        ))}
      </g>
    ))}
    <Solid paths={BENCH_ART.slab} tone="mid" />
    <Line d={BENCH_ART.groove} tone="lo" />
    <Line d={BENCH_ART.screwRings} tone="lo" />
    <Dots points={BENCH_ART.screws} size={0.5} />
    {BENCH_ART.wires.map((d, index) => (
      <Line key={index} d={d} tone="mid" className="tk-wire" />
    ))}
  </g>
);

/** What the panel under the drawing follows. */
interface Showing {
  /** Attention, as a whole number of percent. */
  level: number;
  band: number;
  /** The last thing that happened, while it is fresh, or -1. */
  event: number;
}

interface BenchProps {
  /** The one engine behind both faces: the drawn one here and the real one beside the controls. */
  engine: Engine;
  onShow: (showing: Showing) => void;
  act: React.RefObject<((event: number) => void) | null>;
}

function Bench({ engine, onShow, act }: BenchProps) {
  const anchor = React.useRef<HTMLDivElement>(null);
  const clip = React.useId();
  const device = React.useRef<DeviceHandle | null>(null);
  const water = React.useRef<SVGRectElement>(null);
  const surface = React.useRef<SVGGElement>(null);
  const bands = React.useRef<(SVGTextElement | null)[]>([]);
  const lamps = React.useRef<(SVGGElement | null)[]>([]);
  const lampNames = React.useRef<(SVGTextElement | null)[]>([]);
  const valve = React.useRef<SVGGElement>(null);
  const dump = React.useRef<SVGGElement>(null);
  const flows = React.useRef<(SVGPathElement | null)[]>([]);
  const drop = React.useRef<SVGCircleElement>(null);
  const trace = React.useRef<SVGPathElement>(null);
  const feed = React.useRef<SVGPathElement>(null);
  const pen = React.useRef<SVGGElement>(null);
  const shown = React.useRef("");

  const state = React.useRef({
    level: START,
    seen: START,
    band: bandOf(START),
    pose: "idle",
    // The face's reaction to an event, and a gesture it is left to finish
    reaction: "",
    reactionUntil: 0,
    busyUntil: 0,
    event: -1,
    eventUntil: 0,
    lit: EVENTS.map(() => 0),
    filling: 0,
    dumping: 0,
    signal: [0, 0, 0],
    dripping: 0,
    levels: new Float32Array(KEPT).fill(START),
    since: 0,
    elapsed: 0,
    step: 0,
    hands: 0,
  });
  const visible = useInView(anchor);

  const happen = (event: number, now: number) => {
    const s = state.current;
    s.event = event;
    s.eventUntil = now + 2.4;
    if (event === LEAVE) {
      // The one thing that lowers it
      s.level = Math.min(s.level, DUMPED);
      s.dumping = now + 0.9;
      return;
    }
    const { to, pose, lasts } = EVENTS[event];
    // A floor, never an addition: a tank already above the mark stays where it is
    s.level = Math.max(s.level, to);
    s.lit[event] = now + 0.9;
    s.filling = now + SIGNAL;
    s.signal[0] = s.signal[1] = now + SIGNAL;
    if (pose === "wink") {
      engine.setPose(pose, now, FACE);
      s.busyUntil = now + lasts;
    } else if (pose) {
      s.reaction = pose;
      s.reactionUntil = now + lasts;
    }
  };

  const kick = useLoop((dt, calm) => {
    const s = state.current;
    const now = performance.now() / 1000;
    s.elapsed += dt;

    // Time drains it; left alone, the tour tops it up whenever it has fallen far enough
    if (!calm) s.level = drain(s.level, dt);
    s.hands = Math.max(0, s.hands - dt);
    if (!s.hands && !calm && s.level < TOUR[s.step][0]) {
      happen(TOUR[s.step][1], now);
      s.step = (s.step + 1) % TOUR.length;
    }
    if (now > s.eventUntil) s.event = -1;

    // The glass: the water follows the level quickly, as a fill does
    s.seen = follow(s.seen, s.level, dt, 0.1, calm);
    const top = GLASS.h * (1 - s.seen);
    water.current?.setAttribute("y", top.toFixed(2));
    water.current?.setAttribute("height", Math.max(0, GLASS.h - top).toFixed(2));
    surface.current?.setAttribute("transform", `translate(0 ${top.toFixed(2)})`);
    const band = bandOf(s.level);
    BANDS.forEach((_, index) => bands.current[index]?.toggleAttribute("data-on", index === band));
    if (band !== s.band) {
      s.band = band;
      s.signal[2] = now + SIGNAL;
    }

    // The fill valve, the dump valve, the lamps and the lines
    EVENTS.forEach((_, index) => {
      lamps.current[index]?.toggleAttribute("data-on", now < s.lit[index]);
      lampNames.current[index]?.toggleAttribute("data-on", now < s.lit[index]);
    });
    valve.current?.toggleAttribute("data-on", now < s.filling);
    dump.current?.toggleAttribute("data-on", now < s.dumping);
    flows.current.forEach((node, index) => node?.toggleAttribute("data-flow", now < s.signal[index]));

    // The tap drips faster the fuller the tank is, which is what halving every so often means
    s.dripping = (s.dripping + dt * (0.5 + s.level * 3.2)) % 1;
    const [dx, dy] = dropAt(s.dripping);
    drop.current?.setAttribute("cx", dx.toFixed(1));
    drop.current?.setAttribute("cy", dy.toFixed(1));
    drop.current?.setAttribute("opacity", calm || s.level < 0.02 ? "0" : "1");

    // The face: the pose its band rests in, an event's reaction over it, and a gesture left to finish
    const pose = now < s.reactionUntil ? s.reaction : BANDS[band].pose;
    if (now > s.busyUntil && engine.poseId !== pose) engine.setPose(pose, now, FACE);
    if (engine.poseId !== s.pose) {
      s.pose = engine.poseId;
      device.current?.pose(s.pose);
    }
    device.current?.show(engine.sample(now, {}, STILL));

    // The recorder
    s.since += dt;
    while (s.since >= EACH) {
      s.since -= EACH;
      s.levels.copyWithin(1, 0);
      s.levels[0] = s.seen;
    }
    pen.current?.setAttribute("transform", penAt(s.seen));
    trace.current?.setAttribute("d", traceOf(s.levels, KEPT, EACH));
    feed.current?.setAttribute("d", feedOf(s.elapsed));

    const whole = Math.round(s.level * 100);
    const key = `${whole}-${band}-${s.event}`;
    if (key !== shown.current) {
      shown.current = key;
      onShow({ level: whole, band, event: s.event });
      anchor.current?.setAttribute("aria-label", spokenOf(s.level, s.event));
    }
    return !calm;
  }, visible);

  // A visitor's hand does the same as the tour, and holds the tour off for a while
  React.useImperativeHandle(act, () => (event: number) => {
    state.current.hands = TOUR_BACK;
    happen(event, performance.now() / 1000);
    kick();
  });

  const reach = GLASS.w + SCALE.reach;
  return (
    <div ref={anchor} className="relative" role="img" aria-label={spokenOf(START, -1)}>
      <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
        {BENCH}
        {[0, 1, 2].map((index) => (
          <path
            key={index}
            ref={(node) => {
              flows.current[index] = node;
            }}
            className="iso-line tk-flow"
            data-tone="lit"
            d={BENCH_ART.wires[index]}
          />
        ))}

        {/* The tank */}
        <Solid paths={TANK_ART.plinth} tone="mid" inner={<Line d={TANK_ART.plinthSeam} tone="faint" />} />
        <Dots points={TANK_ART.plinthScrews} size={0.45} />
        <Solid paths={TANK_ART.body} tone="hi" crease="lo" inner={<Line d={TANK_ART.bands} tone="lo" />} />
        <Dots points={TANK_ART.rivets} size={0.5} />
        <g className="tk-face" transform={TANK_ART.plane}>
          <defs>
            <clipPath id={clip}>
              <rect width={GLASS.w} height={GLASS.h} rx={3} />
            </clipPath>
          </defs>
          {/* The scale: where each band starts, and its name */}
          {SCALE.bands.map((band, index) => (
            <g key={band.name}>
              <line className="tk-tick" x1={GLASS.w} x2={reach} y1={band.top} y2={band.top} />
              <text
                ref={(node) => {
                  bands.current[index] = node;
                }}
                className="iso-face-text tk-name"
                x={GLASS.w + 4}
                y={(band.top + band.bottom) / 2 + 1.3}
                fontSize={3.5}
              >
                {band.name.toUpperCase()}
              </text>
            </g>
          ))}
          <line className="tk-tick" x1={GLASS.w} x2={reach} y1={GLASS.h} y2={GLASS.h} />
          <line className="tk-tick" x1={reach} x2={reach} y1={0} y2={GLASS.h} />
          {/* Where each event fills to */}
          {SCALE.marks.map((y) => (
            <line key={y} className="tk-mark" x1={-5} x2={0} y1={y} y2={y} />
          ))}
          <rect className="tk-glass" width={GLASS.w} height={GLASS.h} rx={3} />
          <g clipPath={`url(#${clip})`}>
            <rect ref={water} className="tk-water" width={GLASS.w} y={GLASS.h * (1 - START)} height={GLASS.h * START} />
          </g>
          {/* The float, and the pointer it carries along the scale */}
          <g ref={surface} transform={`translate(0 ${GLASS.h * (1 - START)})`}>
            <line className="tk-surface" x1={0} x2={GLASS.w} y1={0} y2={0} />
            <rect className="tk-float" x={3.5} y={-1.7} width={GLASS.w - 7} height={3.4} rx={1.4} />
            <line className="tk-pointer" x1={GLASS.w} x2={reach} y1={0} y2={0} />
            <circle className="tk-pointer-end" cx={reach} cy={0} r={1} />
          </g>
          <rect className="tk-glass" width={GLASS.w} height={GLASS.h} rx={3} style={{ fill: "none" }} />
        </g>
        <Solid paths={TANK_ART.lid} tone="mid" />
        <g ref={valve} className="tk-lamp">
          <Solid paths={TANK_ART.valve} tone="mid" />
          <Solid paths={TANK_ART.cap} tone="hi" crease="lo" />
          <Line d={TANK_ART.knurl} tone="lo" />
          <Dots points={TANK_ART.valveLamp} size={1.1} tone="hi" />
        </g>
        <g ref={dump} className="tk-lamp">
          <Solid paths={TANK_ART.dump} tone="mid" />
          <Solid paths={TANK_ART.dumpLamp} tone="mid" />
          <Dots points={TANK_ART.dumpDot} size={0.9} tone="hi" />
        </g>
        <Solid paths={TANK_ART.tap} tone="mid" />
        <Solid paths={TANK_ART.tapHandle} tone="hi" crease="lo" />
        <Solid paths={TANK_ART.dish} tone="mid" />
        <Line d={TANK_ART.dishRim} tone="lo" />
        <circle ref={drop} className="tk-drop" r={1.2} opacity={0} />
        {BENCH_ART.glands.tankOut.map((paths, index) => (
          <Solid key={index} paths={paths} tone="mid" crease="none" />
        ))}
        <Solid paths={BENCH_ART.glands.tankIn} tone="mid" crease="none" />

        {/* Where events come in */}
        <Solid paths={BENCH_ART.terminal} tone="mid" />
        <Dots points={BENCH_ART.terminalScrews} size={0.45} />
        <Solid paths={BENCH_ART.glands.inletIn} tone="mid" crease="none" />
        <Solid paths={BENCH_ART.glands.inletOut} tone="mid" crease="none" />
        <Solid paths={INLET_ART.base} tone="mid" inner={<Line d={INLET_ART.seam} tone="faint" />} />
        <Dots points={INLET_ART.screws} size={0.45} />
        {INLET_ART.lamps.map((lamp, index) => (
          <g key={EVENTS[index].name}>
            <g
              ref={(node) => {
                lamps.current[index] = node;
              }}
              className="tk-lamp"
            >
              <Solid paths={lamp.collar} tone="lo" />
              <Solid paths={lamp.lens} tone="mid" />
              <Dots points={lamp.dot} size={1} tone="hi" />
            </g>
            <text
              ref={(node) => {
                lampNames.current[index] = node;
              }}
              className="iso-face-text tk-name"
              transform={lamp.name}
              fontSize={3.5}
              textAnchor="end"
            >
              {EVENTS[index].name.toUpperCase()}
            </text>
          </g>
        ))}

        {/* The character */}
        <Solid paths={BENCH_ART.glands.deviceIn} tone="mid" crease="none" />
        <Device art={DEVICE_ART} handle={device} />

        {/* The chart recorder */}
        <Solid paths={BENCH_ART.glands.chartIn} tone="mid" crease="none" />
        <Solid paths={CHART_ART.base} tone="mid" inner={<Line d={CHART_ART.seam} tone="faint" />} />
        <Dots points={CHART_ART.screws} size={0.45} />
        <Solid paths={CHART_ART.paper} tone="hi" crease="none" />
        {CHART_ART.rules.map((d, index) => (
          <Line key={index} d={d} tone="faint" dotted />
        ))}
        <path ref={feed} className="iso-line" data-tone="lo" d="" />
        <path ref={trace} className="iso-line tk-trace" data-tone="lit" d="" />
        <Solid paths={CHART_ART.intake} tone="mid" />
        <Dots points={CHART_ART.intakeScrews} size={0.45} />
        <Solid paths={CHART_ART.posts[0]} tone="mid" />
        <Solid paths={CHART_ART.bar} tone="mid" />
        <g ref={pen}>
          <Line d={CHART_ART.pen} tone="hi" />
          <Solid paths={CHART_ART.carriage} tone="hi" crease="lo" />
          <Dots points={CHART_ART.penDot} size={0.8} tone="hi" />
        </g>
        <Solid paths={CHART_ART.posts[1]} tone="mid" />
      </IsoFigure>
    </div>
  );
}

const chip = "relative cursor-pointer px-1.5 py-0.5 text-sm transition-colors duration-150";
const chosen = "font-medium text-stone-900 after:absolute after:inset-x-1.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-blue-500";
const resting = "text-stone-500 hover:text-stone-800";

// One line of the panel: what it is and how it behaves, then what there is to press or read
function Row({ name, note, children }: { name: string; note: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-x-4 gap-y-1 border-t border-dashed border-stone-200 py-2.5 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[7rem_1fr]">
      <p className="flex items-baseline gap-1.5 text-sm sm:flex-col sm:gap-0">
        <span className="font-medium text-stone-800">{name}</span>
        <span className="text-[13px] text-stone-400">{note}</span>
      </p>
      <div className="-mx-1.5 flex flex-wrap items-baseline gap-y-1">{children}</div>
    </div>
  );
}

const LOOK = { x: 0, y: 0 };
const REAL = 132;
const PALETTE = resolvePalette(PIP);
const subscribe = () => () => {};

/** Attention: everything that happens fills it, time drains it, and the band it is in is the face at rest. */
export default function TankFigure() {
  const act = React.useRef<((event: number) => void) | null>(null);
  const [showing, setShowing] = React.useState<Showing>({ level: Math.round(START * 100), band: bandOf(START), event: -1 });
  const [engine] = React.useState(() => createEngine("idle", PIP.eyeBuild));
  const look = React.useRef(LOOK);
  const voice = React.useRef(0);
  // The real face is drawn in the browser only: the engine's numbers differ in their last digit on the server
  const mounted = React.useSyncExternalStore(subscribe, () => true, () => false);

  // Under the drawing: what can happen, where the level is, and the real face it gives
  const below = (
    <div className="flex flex-col-reverse items-center gap-x-6 gap-y-4 px-3 sm:flex-row md:px-1">
      <div className="w-full min-w-0 flex-1">
        <Row name="Event" note="fills to its mark">
          {EVENTS.map(({ name, to }, index) => (
            <button key={name} type="button" onClick={() => act.current?.(index)} className={`${chip} ${index === showing.event ? chosen : resting}`}>
              {name} <span className="text-[12px] text-stone-400 tabular-nums">{percent(to)}</span>
            </button>
          ))}
        </Row>
        <Row name="Leaving" note="empties it">
          <button type="button" onClick={() => act.current?.(LEAVE)} className={`${chip} ${showing.event === LEAVE ? chosen : resting}`}>
            leave the tab <span className="text-[12px] text-stone-400 tabular-nums">{percent(DUMPED)}</span>
          </button>
        </Row>
        <Row name="Attention" note="now">
          <p className="px-1.5 text-sm tabular-nums">
            <span className="font-medium text-blue-600">{showing.level}%</span> <span className="text-stone-500">{BANDS[showing.band].name}</span>
          </p>
        </Row>
      </div>
      {/* The real character, on the same engine as the one in the drawing */}
      <div className="shrink-0" style={{ width: REAL, minHeight: REAL * 0.76 }} aria-hidden="true">
        {mounted && <Stage engine={engine} config={FACE} silhouette={PIP.silhouette} palette={PALETTE} polarity={PIP.polarity} scanlines scale={REAL / HOUSING_W} lookRef={look} voiceRef={voice} />}
      </div>
    </div>
  );

  return (
    <FigureCard className="tank" ratio={WIDTH / HEIGHT} caption={CAPTION} below={below}>
      <Bench engine={engine} onShow={setShowing} act={act} />
    </FigureCard>
  );
}
