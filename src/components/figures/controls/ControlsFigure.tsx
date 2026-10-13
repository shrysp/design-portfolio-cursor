"use client";

import * as React from "react";
import {
  DEFAULT_CONFIG,
  HOUSING_W,
  PIP,
  createEngine,
  resolvePalette,
  type Engine,
  type EngineConfig,
} from "@shrysp/cameo";
import { Stage } from "@shrysp/cameo/react";
import "@shrysp/cameo/styles.css";
import { Dots, IsoFigure, Line, Solid } from "@/components/iso/react/draw";
import {
  follow,
  spring,
  useInView,
  useLoop,
  type Spring,
} from "@/components/iso/react/live";
import FigureCard from "../FigureCard";
import { Device, type DeviceHandle } from "../device/Device";
import {
  BENCH_ART,
  BOX_ART,
  CHART_ART,
  CHART_SPAN,
  DEVICE_ART,
  HEIGHT,
  INLET_ART,
  TOUCH_AT,
  WIDTH,
  feedOf,
  keyAt,
  leverAt,
  penAt,
  traceOf,
} from "./geometry";
import {
  CAPTION,
  EVENTS,
  GESTURES,
  STATES,
  TOUR,
  lengthOf,
  reactionOf,
  spokenOf,
  type Action,
  type Showing,
} from "./model";
import "./controls.css";

// Its own unprompted glances are left off: on a bench it looks at its work
const FACE: EngineConfig = {
  ...DEFAULT_CONFIG,
  saccades: false,
  lookStrength: 0,
};
// The drawn one is asked for the same moment without the breathing, so it stands still on its bench
const STILL: EngineConfig = { ...FACE, idleMotion: false };
// How often the pen's level is kept, in seconds, and how many are kept
const EACH = 1 / 30;
const KEPT = Math.ceil(CHART_SPAN / EACH) + 2;
// How long a line stays lit after a signal has gone down it, and a key stays down
const SIGNAL = 0.5;
const PRESS = 0.16;
// How long after a visitor's last touch the tour picks up again
const TOUR_BACK = 9;

const LABEL =
  "A control box wired to a small character with a screen for a face. The box has a lever with six stops, one for each state, and four sprung keys, one for each gesture. Behind it a unit with four lamps takes events in from a line off the bench. A chart recorder along the front draws what the face does: a step that holds for a state, a spike for a gesture, and a bump that returns for an event.";

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
      <Line key={index} d={d} tone="mid" className="ct-wire" />
    ))}
  </g>
);

const rest = (at: number): Spring => ({ at, rate: 0 });

interface BenchProps {
  /** The one engine behind both faces: the drawn one here and the real one beside the controls. */
  engine: Engine;
  voice: React.RefObject<number>;
  onShow: (showing: Showing) => void;
  act: React.RefObject<((action: Action) => void) | null>;
}

function Bench({ engine, voice, onShow, act }: BenchProps) {
  const anchor = React.useRef<HTMLDivElement>(null);
  const device = React.useRef<DeviceHandle | null>(null);
  const lever = React.useRef<SVGGElement>(null);
  const stops = React.useRef<(SVGTextElement | null)[]>([]);
  const keys = React.useRef<(SVGGElement | null)[]>([]);
  const keyNames = React.useRef<(SVGTextElement | null)[]>([]);
  const lamps = React.useRef<(SVGGElement | null)[]>([]);
  const lampNames = React.useRef<(SVGTextElement | null)[]>([]);
  const flows = React.useRef<(SVGPathElement | null)[]>([]);
  const trace = React.useRef<SVGPathElement>(null);
  const feed = React.useRef<SVGPathElement>(null);
  const pen = React.useRef<SVGGElement>(null);
  const shown = React.useRef("");

  const state = React.useRef({
    held: 0,
    pose: "idle",
    // A gesture or an event in play: which one, and when it is over
    gesture: -1,
    gestureUntil: 0,
    event: -1,
    eventUntil: 0,
    eventPose: "",
    // The face is busy with a gesture until then, and is left to finish it
    busyUntil: 0,
    lever: rest(0),
    pressed: GESTURES.map(() => rest(0)),
    pressedUntil: GESTURES.map(() => 0),
    lit: EVENTS.map(() => 0),
    signal: [0, 0, 0],
    level: 0,
    levels: new Float32Array(KEPT),
    since: 0,
    elapsed: 0,
    // The tour: which step is next, how long until it, and how long a visitor's touch holds it off
    step: 0,
    wait: TOUR[0][0],
    hands: 0,
  });
  const visible = useInView(anchor);

  const perform = (action: Action, now: number) => {
    const s = state.current;
    if (action.kind === "state") {
      s.held = action.index;
      s.signal[0] = now + SIGNAL;
    } else if (action.kind === "gesture") {
      const id = GESTURES[action.index];
      engine.setPose(id, now, FACE);
      s.gesture = action.index;
      s.gestureUntil = s.busyUntil = now + lengthOf(id);
      s.pressedUntil[action.index] = now + PRESS;
      s.signal[0] = now + SIGNAL;
    } else {
      const reaction = reactionOf(action.index);
      s.event = action.index;
      s.eventUntil = now + reaction.lasts;
      s.eventPose = reaction.gesture ? "" : reaction.pose;
      if (reaction.gesture) {
        engine.setPose(reaction.pose, now, FACE);
        s.busyUntil = now + reaction.lasts;
      }
      s.lit[action.index] = now + Math.max(0.7, reaction.lasts);
      s.signal[1] = s.signal[2] = now + SIGNAL;
    }
  };

  const kick = useLoop((dt, calm) => {
    const s = state.current;
    const now = performance.now() / 1000;
    s.elapsed += dt;

    // Left alone, the box works through its tour
    s.hands = Math.max(0, s.hands - dt);
    if (!s.hands && !calm) {
      s.wait -= dt;
      if (s.wait <= 0) {
        perform(TOUR[s.step][1], now);
        s.step = (s.step + 1) % TOUR.length;
        s.wait = TOUR[s.step][0];
      }
    }
    if (s.gesture >= 0 && now > s.gestureUntil) s.gesture = -1;
    if (s.event >= 0 && now > s.eventUntil) s.event = -1;

    // The face: the state it is held in, an event's reaction over it, and a gesture left to finish
    const pose = s.event >= 0 && s.eventPose ? s.eventPose : STATES[s.held];
    if (now > s.busyUntil && engine.poseId !== pose)
      engine.setPose(pose, now, FACE);
    if (engine.poseId !== s.pose) {
      s.pose = engine.poseId;
      device.current?.pose(s.pose);
    }
    // Held speaking, it has to have something to say
    voice.current =
      STATES[s.held] === "speaking"
        ? 0.45 + 0.35 * Math.sin(now * 9) * Math.sin(now * 2.3)
        : 0;
    device.current?.show(engine.sample(now, { voice: voice.current }, STILL));

    // The controls
    spring(s.lever, s.held, dt, 260, 24, calm);
    lever.current?.setAttribute("transform", leverAt(s.lever.at));
    STATES.forEach((_, index) =>
      stops.current[index]?.toggleAttribute("data-on", index === s.held),
    );
    GESTURES.forEach((_, index) => {
      spring(
        s.pressed[index],
        now < s.pressedUntil[index] ? 1 : 0,
        dt,
        520,
        26,
        calm,
      );
      keys.current[index]?.setAttribute(
        "transform",
        keyAt(Math.max(0, s.pressed[index].at)),
      );
      keyNames.current[index]?.toggleAttribute("data-on", index === s.gesture);
    });
    EVENTS.forEach((_, index) => {
      lamps.current[index]?.toggleAttribute("data-on", now < s.lit[index]);
      lampNames.current[index]?.toggleAttribute("data-on", now < s.lit[index]);
    });
    flows.current[0]?.toggleAttribute("data-flow", now < s.signal[0]);
    flows.current[1]?.toggleAttribute("data-flow", now < s.signal[1]);
    flows.current[2]?.toggleAttribute("data-flow", now < s.signal[2]);

    // The pen: lifted by a held state, and further by a gesture or an event on top of it
    const target = (s.held ? 1 : 0) + (s.gesture >= 0 || s.event >= 0 ? 1 : 0);
    s.level = follow(s.level, target, dt, 0.05, calm);
    s.since += dt;
    while (s.since >= EACH) {
      s.since -= EACH;
      s.levels.copyWithin(1, 0);
      s.levels[0] = s.level;
    }
    pen.current?.setAttribute("transform", penAt(s.level));
    trace.current?.setAttribute("d", traceOf(s.levels, KEPT, EACH));
    feed.current?.setAttribute("d", feedOf(s.elapsed));

    const key = `${s.held}-${s.gesture}-${s.event}`;
    if (key !== shown.current) {
      shown.current = key;
      const showing = { state: s.held, gesture: s.gesture, event: s.event };
      onShow(showing);
      anchor.current?.setAttribute("aria-label", spokenOf(showing));
    }
    return !calm;
  }, visible);

  // A visitor's hand does the same as the tour, and holds the tour off for a while
  React.useImperativeHandle(act, () => (action: Action) => {
    state.current.hands = TOUR_BACK;
    perform(action, performance.now() / 1000);
    kick();
  });
  const touch = (action: Action) => () => act.current?.(action);

  return (
    <div
      ref={anchor}
      className="relative"
      role="img"
      aria-label={spokenOf({ state: 0, gesture: -1, event: -1 })}
    >
      <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
        {BENCH}
        {/* The box's line, the inlet's, and the one events arrive on, lit while a signal is on them */}
        {[0, 1, 2].map((index) => (
          <path
            key={index}
            ref={(node) => {
              flows.current[index] = node;
            }}
            className="iso-line ct-flow"
            data-tone="lit"
            d={BENCH_ART.wires[index]}
          />
        ))}
        <Solid paths={BENCH_ART.terminal} tone="mid" />
        <Dots points={BENCH_ART.terminalScrews} size={0.45} />

        {/* Where events come in */}
        <Solid paths={BENCH_ART.glands.inletIn} tone="mid" crease="none" />
        <Solid
          paths={INLET_ART.base}
          tone="mid"
          inner={<Line d={INLET_ART.seam} tone="faint" />}
        />
        <Dots points={INLET_ART.screws} size={0.45} />
        {INLET_ART.lamps.map((lamp, index) => (
          <g key={EVENTS[index].name}>
            <g
              ref={(node) => {
                lamps.current[index] = node;
              }}
              className="ct-lamp"
            >
              <Solid paths={lamp.collar} tone="lo" />
              <Solid paths={lamp.lens} tone="mid" />
              <Dots points={lamp.dot} size={1} tone="hi" />
            </g>
            <text
              ref={(node) => {
                lampNames.current[index] = node;
              }}
              className="iso-face-text ct-name"
              transform={lamp.name}
              fontSize={3.5}
              textAnchor="end"
            >
              {EVENTS[index].name.toUpperCase()}
            </text>
          </g>
        ))}
        <Solid paths={BENCH_ART.glands.inletOut} tone="mid" crease="none" />

        {/* The box */}
        <Solid
          paths={BOX_ART.base}
          tone="mid"
          inner={<Line d={BOX_ART.seam} tone="faint" />}
        />
        <Line d={BOX_ART.groove} tone="faint" />
        <Dots points={BOX_ART.screws} size={0.45} />
        <Line d={BOX_ART.slot} tone="mid" />
        <Line d={BOX_ART.stops} tone="lo" />
        {STATES.map((name, index) => (
          <text
            key={name}
            ref={(node) => {
              stops.current[index] = node;
            }}
            className="iso-face-text ct-name"
            transform={BOX_ART.names[index]}
            fontSize={3.5}
            textAnchor="end"
          >
            {name.toUpperCase()}
          </text>
        ))}
        <g ref={lever}>
          <Solid paths={BOX_ART.lever.skirt} tone="lo" />
          <Solid paths={BOX_ART.lever.cap} tone="hi" lit />
          <Line d={BOX_ART.lever.grip} tone="lit" />
        </g>
        <Solid paths={BOX_ART.pilot} tone="mid" />
        <Dots points={BOX_ART.pilotDot} size={0.8} tone="hi" />
        {BOX_ART.keys.map((key, index) => (
          <g key={GESTURES[index]}>
            <Line d={key.well} tone="lo" />
            <g
              ref={(node) => {
                keys.current[index] = node;
              }}
            >
              <Solid paths={key.cap} tone="hi" crease="lo" />
              <text
                ref={(node) => {
                  keyNames.current[index] = node;
                }}
                className="iso-face-text ct-name"
                transform={key.name}
                fontSize={3.8}
                textAnchor="middle"
              >
                {GESTURES[index].toUpperCase()}
              </text>
            </g>
          </g>
        ))}
        <Line d={BOX_ART.plate} tone="lo" />
        <Line d={BOX_ART.plateLines} tone="lo" free />
        <Solid paths={BENCH_ART.glands.boxOut} tone="mid" crease="none" />

        {/* The character */}
        {BENCH_ART.glands.deviceIn.map((paths, index) => (
          <Solid key={index} paths={paths} tone="mid" crease="none" />
        ))}
        <Device art={DEVICE_ART} handle={device} />
        <Solid paths={BENCH_ART.glands.deviceOut} tone="mid" crease="none" />

        {/* The chart recorder */}
        <Solid paths={BENCH_ART.glands.chartIn} tone="mid" crease="none" />
        <Solid
          paths={CHART_ART.base}
          tone="mid"
          inner={<Line d={CHART_ART.seam} tone="faint" />}
        />
        <Dots points={CHART_ART.screws} size={0.45} />
        <Solid paths={CHART_ART.paper} tone="hi" crease="none" />
        {CHART_ART.rules.map((d, index) => (
          <Line key={index} d={d} tone="faint" dotted />
        ))}
        <path ref={feed} className="iso-line" data-tone="lo" d="" />
        <path ref={trace} className="iso-line ct-trace" data-tone="lit" d="" />
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

      {/* Each control can be pressed where it is drawn */}
      {STATES.map((name, index) => (
        <button
          key={name}
          type="button"
          className="ct-touch"
          style={TOUCH_AT.state[index]}
          aria-label={`Hold ${name}`}
          onClick={touch({ kind: "state", index })}
        />
      ))}
      {GESTURES.map((name, index) => (
        <button
          key={name}
          type="button"
          className="ct-touch"
          style={TOUCH_AT.gesture[index]}
          aria-label={`Play a ${name}`}
          onClick={touch({ kind: "gesture", index })}
        />
      ))}
      {EVENTS.map(({ name }, index) => (
        <button
          key={name}
          type="button"
          className="ct-touch"
          style={TOUCH_AT.event[index]}
          aria-label={`Send a ${name} event`}
          onClick={touch({ kind: "event", index })}
        />
      ))}
    </div>
  );
}

const chip =
  "relative cursor-pointer px-1.5 py-0.5 text-sm transition-colors duration-150";
const chosen =
  "font-medium text-stone-900 after:absolute after:inset-x-1.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-blue-500";
const resting = "text-stone-500 hover:text-stone-800";

// One kind of direction: what it is called and how it behaves, then its choices on one line
function Kind({
  name,
  note,
  children,
}: {
  name: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-x-4 gap-y-1 border-t border-dashed border-stone-200 py-2.5 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[7rem_1fr]">
      <p className="flex items-baseline gap-1.5 text-sm sm:flex-col sm:gap-0">
        <span className="font-medium text-stone-800">{name}</span>
        <span className="text-[13px] text-stone-400">{note}</span>
      </p>
      <div className="-mx-1.5 flex flex-wrap gap-y-1">{children}</div>
    </div>
  );
}

const LOOK = { x: 0, y: 0 };
const subscribe = () => () => {};
const REAL = 132;
const PALETTE = resolvePalette(PIP);

/** The three ways to direct the face: a state it holds, a gesture it plays once, an event it reacts to and comes back from. */
export default function ControlsFigure() {
  const act = React.useRef<((action: Action) => void) | null>(null);
  const [showing, setShowing] = React.useState<Showing>({
    state: 0,
    gesture: -1,
    event: -1,
  });
  const [engine] = React.useState(() => createEngine("idle", PIP.eyeBuild));
  const look = React.useRef(LOOK);
  const voice = React.useRef(0);
  // The real face is drawn in the browser only: the engine's numbers differ in their last digit on the server
  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  // Under the drawing: the same three sets of controls by name, and the real face they direct
  const below = (
    <div className="flex flex-col-reverse items-center gap-x-6 gap-y-4 px-3 sm:flex-row md:px-1">
      <div className="w-full min-w-0 flex-1">
        <Kind name="State" note="held">
          {STATES.map((name, index) => (
            <button
              key={name}
              type="button"
              aria-pressed={index === showing.state}
              onClick={() => act.current?.({ kind: "state", index })}
              className={`${chip} ${index === showing.state ? chosen : resting}`}
            >
              {name}
            </button>
          ))}
        </Kind>
        <Kind name="Gesture" note="plays once">
          {GESTURES.map((name, index) => (
            <button
              key={name}
              type="button"
              onClick={() => act.current?.({ kind: "gesture", index })}
              className={`${chip} ${index === showing.gesture ? chosen : resting}`}
            >
              {name}
            </button>
          ))}
        </Kind>
        <Kind name="Event" note="reacts, then back">
          {EVENTS.map(({ name }, index) => (
            <button
              key={name}
              type="button"
              onClick={() => act.current?.({ kind: "event", index })}
              className={`${chip} ${index === showing.event ? chosen : resting}`}
            >
              {name}
            </button>
          ))}
        </Kind>
      </div>
      {/* The real character, on the same engine as the one in the drawing */}
      <div
        className="shrink-0"
        style={{ width: REAL, minHeight: REAL * 0.76 }}
        aria-hidden="true"
      >
        {mounted && (
          <Stage
            engine={engine}
            config={FACE}
            silhouette={PIP.silhouette}
            palette={PALETTE}
            polarity={PIP.polarity}
            scanlines
            scale={REAL / HOUSING_W}
            lookRef={look}
            voiceRef={voice}
          />
        )}
      </div>
    </div>
  );

  return (
    <FigureCard
      className="controls"
      ratio={WIDTH / HEIGHT}
      caption={CAPTION}
      below={below}
    >
      <Bench engine={engine} voice={voice} onShow={setShowing} act={act} />
    </FigureCard>
  );
}
