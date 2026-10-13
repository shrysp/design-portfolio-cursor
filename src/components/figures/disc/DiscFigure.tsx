"use client";

import * as React from "react";
import { HOUSING_W, PIP, housingHeight, resolvePalette } from "@shrysp/cameo";
import { CharacterView } from "@shrysp/cameo/react";
import "@shrysp/cameo/styles.css";
import { IconMediaPauseFilled, IconMediaPlayFilled } from "nucleo-micro-bold-essential";
import { Dots, IsoFigure, Line, Solid } from "@/components/iso/react/draw";
import { spring, useInView, useLoop, type Spring } from "@/components/iso/react/live";
import FigureCard from "../FigureCard";
import { Device, type DeviceHandle } from "../device/Device";
import { BENCH_ART, BOX_ART, DEVICE_ART, HEIGHT, TABLE_ART, TOUCH_AT, WIDTH, eyesAt, eyesTrack, keyAt, marksOf, shellAt, shellTrack } from "./geometry";
import { ALL_ON, CAPTION, FEEL, FROM, POSES, TO, cut, read, spokenOf, type Disc, type Feel } from "./model";
import "./disc.css";

// Played, the disc turns at a quarter of its true speed, slow enough to see each part
const SLOW = 4;
// Left alone it plays through, rests on the finished face, and goes on to the next expression
const REST = 1.3;
// How long after a visitor's last touch that tour picks up again
const TOUR_BACK = 12;

const LABEL =
  "A disc lying on a turntable, with two tracks cut into it: the outer is the height of the character's eyes and the inner how far its shell has risen. An arm across the disc carries a follower on each track, wired to a small character with a screen for a face. A row of five switches decides how the disc is cut: anticipation, eyes lead, blink, settle and head arc.";

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
      <Line key={index} d={d} tone="mid" className="dc-wire" />
    ))}
  </g>
);

interface BenchProps {
  disc: Disc;
  pose: string;
  feel: Feel;
  /** The moment the disc stands at, in seconds from the change. */
  at: number;
  playing: boolean;
  onAt: (at: number) => void;
  onEnd: () => void;
  onToggle: (key: keyof Feel) => void;
}

const rest = (at: number): Spring => ({ at, rate: 0 });

function Bench({ disc, pose, feel, at, playing, onAt, onEnd, onToggle }: BenchProps) {
  const anchor = React.useRef<HTMLDivElement>(null);
  const device = React.useRef<DeviceHandle | null>(null);
  const tracks = React.useRef<(SVGPathElement | null)[]>([]);
  const ticks = React.useRef<SVGPathElement>(null);
  const start = React.useRef<SVGPathElement>(null);
  const followers = React.useRef<(SVGGElement | null)[]>([]);
  const keys = React.useRef<(SVGGElement | null)[]>([]);
  const now = React.useRef({ at, playing, feel });
  const down = React.useRef(FEEL.map(() => rest(0)));
  const visible = useInView(anchor);

  // The disc is drawn for the moment it stands at, whenever that or its cut changes
  React.useLayoutEffect(() => {
    tracks.current[0]?.setAttribute("d", eyesTrack(disc.eyes, at));
    tracks.current[1]?.setAttribute("d", shellTrack(disc.shell, at));
    const marks = marksOf(at);
    ticks.current?.setAttribute("d", marks.ticks);
    start.current?.setAttribute("d", marks.start);
    followers.current[0]?.setAttribute("transform", eyesAt(read(disc.eyes, at)));
    followers.current[1]?.setAttribute("transform", shellAt(read(disc.shell, at)));
    device.current?.show(disc.frameAt(at));
    // The screen takes the new mood's colour once the change is well under way, as the real one does
    device.current?.pose(at > 0.14 ? pose : "idle");
    anchor.current?.setAttribute("aria-label", spokenOf(pose, at));
  }, [disc, at, pose]);

  // The loop only keeps time while the disc plays, and lets a switch settle after it is pressed
  React.useEffect(() => {
    now.current = { at, playing, feel };
  });
  const kick = useLoop((dt, calm) => {
    const state = now.current;
    let settled = true;
    FEEL.forEach(({ key }, index) => {
      settled = spring(down.current[index], state.feel[key] ? 0 : 1, dt, 420, 30, calm) && settled;
      keys.current[index]?.setAttribute("transform", keyAt(Math.max(0, down.current[index].at)));
    });
    if (state.playing && !calm) {
      const next = state.at + dt / SLOW;
      if (next >= TO) {
        onAt(TO);
        onEnd();
      } else {
        // Kept here as well, so a frame that comes before React has caught up doesn't lose its step
        state.at = next;
        onAt(next);
      }
    }
    return (state.playing && !calm) || !settled;
  }, visible);
  React.useEffect(() => {
    kick();
  }, [playing, feel, kick]);

  return (
    <div ref={anchor} className="relative" role="img" aria-label={spokenOf(pose, at)}>
      <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
        {BENCH}

        {/* The turntable and its disc */}
        <Solid paths={TABLE_ART.base} tone="mid" inner={<Line d={TABLE_ART.seam} tone="faint" />} />
        <Dots points={TABLE_ART.screws} size={0.45} />
        <Line d={TABLE_ART.well} tone="lo" />
        <Solid paths={TABLE_ART.disc} tone="hi" crease="lo" />
        <Line d={TABLE_ART.rests} tone="faint" dotted />
        <Line d={TABLE_ART.label} tone="lo" />
        <path ref={ticks} className="iso-line" data-tone="lo" d="" />
        <path ref={start} className="iso-line dc-start" data-tone="lit" d="" />
        {[0, 1].map((index) => (
          <path
            key={index}
            ref={(node) => {
              tracks.current[index] = node;
            }}
            className="iso-line dc-track"
            data-tone="lit"
            d=""
          />
        ))}

        {/* The arm and its two followers, hub to edge */}
        <Solid paths={TABLE_ART.hub} tone="mid" />
        <Dots points={TABLE_ART.hubCap} size={0.7} tone="hi" />
        <Solid paths={TABLE_ART.bar} tone="mid" />
        {[1, 0].map((index) => (
          <g
            key={index}
            ref={(node) => {
              followers.current[index] = node;
            }}
          >
            <Line d={TABLE_ART.followers[index].stylus} tone="hi" />
            <Dots points={TABLE_ART.followers[index].tip} size={0.9} tone="hi" />
            <Solid paths={TABLE_ART.followers[index].carriage} tone="hi" lit />
            <text className="iso-face-text dc-name" data-on="" transform={TABLE_ART.followers[index].name} fontSize={2.9} textAnchor="middle">
              {index ? "SHELL" : "EYES"}
            </text>
          </g>
        ))}
        <Solid paths={TABLE_ART.endFoot} tone="lo" />
        <Solid paths={TABLE_ART.end} tone="mid" />
        <Dots points={TABLE_ART.endCap} size={0.6} tone="hi" />
        {BENCH_ART.glands.tableOut.map((paths, index) => (
          <Solid key={index} paths={paths} tone="mid" crease="none" />
        ))}

        {/* The character */}
        {BENCH_ART.glands.deviceIn.map((paths, index) => (
          <Solid key={index} paths={paths} tone="mid" crease="none" />
        ))}
        <Device art={DEVICE_ART} handle={device} />

        {/* The switches */}
        <Solid paths={BENCH_ART.glands.boxOut} tone="mid" crease="none" />
        <Solid paths={BOX_ART.base} tone="mid" inner={<Line d={BOX_ART.seam} tone="faint" />} />
        <Line d={BOX_ART.groove} tone="faint" />
        <Dots points={BOX_ART.screws} size={0.45} />
        {BOX_ART.keys.map((key, index) => (
          <g key={FEEL[index].key}>
            <Line d={key.well} tone="lo" />
            <g
              ref={(node) => {
                keys.current[index] = node;
              }}
              className="dc-lamp"
              data-on={feel[FEEL[index].key] ? "" : undefined}
            >
              <Solid paths={key.cap} tone="hi" crease="lo" />
              <Dots points={key.lamp} size={1} tone="hi" />
            </g>
            <text className="iso-face-text dc-name" data-on={feel[FEEL[index].key] ? "" : undefined} transform={key.name} fontSize={3.4} textAnchor="end">
              {FEEL[index].name.toUpperCase()}
            </text>
          </g>
        ))}
      </IsoFigure>

      {FEEL.map(({ key, name }, index) => (
        <button key={key} type="button" className="dc-touch" style={TOUCH_AT[index]} aria-pressed={feel[key]} aria-label={`Carry the change with ${name}`} onClick={() => onToggle(key)} />
      ))}
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
      <div className="-mx-1.5 flex flex-wrap items-center gap-y-1">{children}</div>
    </div>
  );
}

const REAL = 132;
const PALETTE = resolvePalette(PIP);
const subscribe = () => () => {};

/** How it moves: one change of expression cut into a disc, which gives the face for whatever moment it is turned to. */
export default function DiscFigure() {
  const [pose, setPose] = React.useState(0);
  const [feel, setFeel] = React.useState<Feel>(ALL_ON);
  const [at, setAt] = React.useState(FROM);
  const [playing, setPlaying] = React.useState(true);
  // When a visitor last touched it, so the tour knows to keep off
  const touched = React.useRef(-Infinity);
  const next = React.useRef<number | undefined>(undefined);
  const disc = React.useMemo(() => cut(POSES[pose], feel), [pose, feel]);
  // The real face is drawn in the browser only: the engine's numbers differ in their last digit on the server
  const mounted = React.useSyncExternalStore(subscribe, () => true, () => false);

  React.useEffect(() => () => window.clearTimeout(next.current), []);
  const touch = () => {
    touched.current = performance.now();
    window.clearTimeout(next.current);
  };
  const play = (from = FROM) => {
    setAt(from);
    setPlaying(true);
  };
  // At the end it rests on the finished face; left alone, it then goes on to the next expression
  const onEnd = () => {
    setPlaying(false);
    window.clearTimeout(next.current);
    next.current = window.setTimeout(
      () => {
        if (performance.now() - touched.current < TOUR_BACK * 1000) return;
        setPose((current) => (current + 1) % POSES.length);
        play();
      },
      REST * 1000,
    );
  };

  const ms = Math.round(at * 1000);
  const scale = REAL / HOUSING_W;
  const below = (
    <div className="flex flex-col-reverse items-center gap-x-6 gap-y-4 px-3 sm:flex-row md:px-1">
      <div className="w-full min-w-0 flex-1">
        <Row name="Moment" note="turn to any">
          <div className="flex w-full items-center gap-3 px-1.5">
            <button
              type="button"
              aria-label={playing ? "Pause" : "Play slowly"}
              title={playing ? "Pause" : "Play slowly"}
              onClick={() => {
                touch();
                if (playing) setPlaying(false);
                else play(at >= TO ? FROM : at);
              }}
              className="aqua aqua-round aqua-to-blue size-7 shrink-0 [--aqua-ink:var(--color-stone-600)]"
            >
              {playing ? <IconMediaPauseFilled size={12} /> : <IconMediaPlayFilled size={12} />}
            </button>
            <input
              type="range"
              aria-label="Moment"
              min={FROM}
              max={TO}
              step={0.005}
              value={at}
              onChange={(event) => {
                touch();
                setPlaying(false);
                setAt(Number(event.target.value));
              }}
              className="h-7 min-w-0 flex-1 cursor-pointer accent-blue-500"
            />
            <span className="w-16 shrink-0 text-right text-sm text-stone-600 tabular-nums">
              {ms < 0 ? "−" : "+"}
              {Math.abs(ms)} ms
            </span>
          </div>
        </Row>
        <Row name="Change to" note="from rest">
          {POSES.map((name, index) => (
            <button
              key={name}
              type="button"
              aria-pressed={index === pose}
              onClick={() => {
                touch();
                setPose(index);
                play();
              }}
              className={`${chip} ${index === pose ? chosen : resting}`}
            >
              {name}
            </button>
          ))}
        </Row>
        <Row name="Carried by" note="tap to remove">
          {FEEL.map(({ key, name }) => (
            <button
              key={key}
              type="button"
              aria-pressed={feel[key]}
              onClick={() => {
                touch();
                setFeel((current) => ({ ...current, [key]: !current[key] }));
              }}
              className={`${chip} ${feel[key] ? "text-stone-800" : "text-stone-400 line-through decoration-stone-300"}`}
            >
              {name}
            </button>
          ))}
        </Row>
      </div>
      {/* The real character, asked for the same moment as the one in the drawing */}
      <div className="shrink-0" style={{ width: REAL, minHeight: REAL * 0.76 }} aria-hidden="true">
        {mounted && (
          <div className="char-stage-frame" style={{ width: REAL, height: housingHeight(PIP.silhouette) * scale }}>
            <CharacterView frame={disc.frameAt(at)} silhouette={PIP.silhouette} palette={PALETTE} polarity={PIP.polarity} scanlines scale={scale} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <FigureCard className="disc" ratio={WIDTH / HEIGHT} caption={CAPTION} below={below}>
      <Bench
        disc={disc}
        pose={POSES[pose]}
        feel={feel}
        at={at}
        playing={playing}
        onAt={setAt}
        onEnd={onEnd}
        onToggle={(key) => {
          touch();
          setFeel((current) => ({ ...current, [key]: !current[key] }));
        }}
      />
    </FigureCard>
  );
}
