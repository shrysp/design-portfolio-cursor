"use client";

import * as React from "react";
import {
  DEFAULT_CONFIG,
  PIP,
  createEngine,
  profileToPath,
  screenBox,
  type EngineConfig,
} from "@shrysp/cameo";
import { Dots, IsoFigure, Line, Solid } from "@/components/iso/react/draw";
import { follow, useInView, useLoop } from "@/components/iso/react/live";
import {
  IconMediaPauseFilled,
  IconMediaPlayFilled,
  IconVolume,
  IconVolumeUp,
} from "nucleo-micro-bold-essential";
import FigureCard from "../FigureCard";
import {
  BENCH_ART,
  CHARACTER_ART,
  DECK_ART,
  HEIGHT,
  READER_ART,
  SCREEN,
  MARK_AT,
  WIDTH,
  needleOf,
  sentenceOn,
  turnOf,
  waveOn,
  windowsOf,
} from "./geometry";
import {
  CAPTION,
  CLIPS,
  LAMPS,
  LEAD_IN,
  RUN_OUT,
  loudnessOf,
  STEPS,
  progressOf,
  valuesOf,
  reactionOf,
  spokenOf,
} from "./model";
import "./tape.css";

// The character's real screen, and how much smaller it is drawn here
const BOX = screenBox(PIP.silhouette);
const SHRINK = SCREEN.w / BOX.width;
// Its own unprompted glances are left off: on a bench it looks at its work
const FACE: EngineConfig = {
  ...DEFAULT_CONFIG,
  saccades: false,
  lookStrength: 0,
};
// How long a line stays lit after a signal has gone down it
const SIGNAL = 0.45;

const LABEL =
  "A reel-to-reel tape deck. The tape runs from the left reel to the right, past a reading head and then a playing head, one second of tape apart. The reading head is wired to a reader with eight lamps, one for each mood, and both are wired to a small character with a screen for a face. A sentence reaches the reading head first, the reader lights the lamp for its mood, and the character's face changes while the same sentence is still on its way to the playing head.";

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
      <Line key={index} d={d} tone="mid" className="tp-wire" />
    ))}
  </g>
);

const Post = ({ art }: { art: (typeof DECK_ART.posts)[number] }) => (
  <g>
    <Solid paths={art.foot} tone="lo" />
    <Solid paths={art.shaft} tone="mid" />
    <Dots points={art.cap} size={0.5} tone="hi" />
  </g>
);

/** What the panel under the drawing follows: the recording, the sentence and how far it has got. */
interface Showing {
  clip: number;
  sentence: number;
  step: number;
  sound: boolean;
  paused: boolean;
}

interface Controls {
  pick: (clip: number) => void;
  toggleSound: () => void;
  togglePause: () => void;
}

function Deck({
  onShow,
  controls,
}: {
  onShow: (showing: Showing) => void;
  controls: React.RefObject<Controls | null>;
}) {
  const anchor = React.useRef<HTMLDivElement>(null);
  const marks = React.useRef<(HTMLSpanElement | null)[]>([]);
  const shown = React.useRef("");
  const audio = React.useRef<HTMLAudioElement | null>(null);
  const windows = React.useRef<(SVGPathElement | null)[]>([]);
  const wave = React.useRef<SVGPathElement>(null);
  const rules = React.useRef<(SVGPathElement | null)[]>([]);
  const flows = React.useRef<(SVGPathElement | null)[]>([]);
  const headLamps = React.useRef<(SVGGElement | null)[]>([]);
  const headNames = React.useRef<(SVGTextElement | null)[]>([]);
  const lamps = React.useRef<(SVGGElement | null)[]>([]);
  const moods = React.useRef<(SVGTextElement | null)[]>([]);
  const eyes = React.useRef<(SVGPathElement | null)[]>([]);
  const counter = React.useRef<SVGTextElement>(null);
  const face = React.useRef<SVGGElement>(null);
  const needle = React.useRef<SVGPathElement>(null);

  const [engine] = React.useState(() => createEngine("idle", PIP.eyeBuild));
  const state = React.useRef({
    clip: 0,
    t: -LEAD_IN,
    turned: 0,
    level: 0,
    pose: "idle",
    sound: false,
    paused: false,
  });
  const visible = useInView(anchor);

  const start = (clip: number) => {
    const s = state.current;
    s.clip = (clip + CLIPS.length) % CLIPS.length;
    s.t = -LEAD_IN;
    audio.current?.pause();
  };

  const kick = useLoop((dt, calm) => {
    const s = state.current;
    const now = performance.now() / 1000;
    // Still, the figure rests on the moment the second sentence's reading lands
    if (calm) s.t = CLIPS[s.clip].sentences[1].read + 0.5;
    else {
      const playing = audio.current && !audio.current.paused;
      // With sound on, the voice keeps the time. Paused, the tape stands still and the face stays alive.
      if (playing) s.t = audio.current!.currentTime;
      else if (!s.paused) s.t += dt;
      if (!s.paused) s.turned += dt;
    }
    let clip = CLIPS[s.clip];
    if (s.t > clip.length + RUN_OUT) {
      // One recording after another, round and round
      if (!calm) start(s.clip + 1);
      else s.t = -LEAD_IN;
      clip = CLIPS[s.clip];
    }
    const t = s.t;
    if (
      s.sound &&
      !s.paused &&
      !calm &&
      t >= 0 &&
      t < 0.2 &&
      audio.current?.paused
    ) {
      if (!audio.current.src.endsWith(clip.src)) audio.current.src = clip.src;
      audio.current.currentTime = 0;
      void audio.current.play().catch(() => {});
    }

    // The deck
    windows.current.forEach((node, reel) =>
      node?.setAttribute("d", windowsOf(reel, s.turned * turnOf(reel))),
    );
    wave.current?.setAttribute("d", waveOn(clip, t));
    const heard = clip.sentences.some(
      (sentence) => t >= sentence.heard[0] && t < sentence.heard[1],
    );
    const written = clip.sentences.some(
      (sentence) => t >= sentence.written[0] && t < sentence.written[1],
    );
    rules.current.forEach((node, index) => {
      const sentence = clip.sentences[index];
      node?.setAttribute("d", sentence ? sentenceOn(sentence.heard, t) : "");
      // A sentence is marked once its reading is back and has something to say
      node?.setAttribute(
        "data-tone",
        sentence && t >= sentence.read && reactionOf(sentence) ? "lit" : "mid",
      );
    });
    headLamps.current[0]?.toggleAttribute("data-on", written);
    headLamps.current[1]?.toggleAttribute("data-on", heard);
    headNames.current[0]?.toggleAttribute("data-on", written);
    headNames.current[1]?.toggleAttribute("data-on", heard);
    if (counter.current)
      counter.current.textContent = `${t < 0 ? "-" : ""}${Math.abs(t).toFixed(2).padStart(5, "0")}`;

    // The signals: a finished sentence to the reader, its reading to the character, the voice to the character
    const reading = clip.sentences.find(
      (sentence) => t >= sentence.written[1] && t < sentence.read,
    );
    const landed = clip.sentences
      .filter((sentence) => t >= sentence.read)
      .pop();
    flows.current[0]?.toggleAttribute("data-flow", Boolean(reading));
    flows.current[1]?.toggleAttribute(
      "data-flow",
      Boolean(landed && t < landed.read + SIGNAL),
    );
    flows.current[2]?.toggleAttribute("data-flow", heard);
    LAMPS.forEach((mood, index) => {
      const on = Boolean(
        landed && landed.mood === mood && t < landed.heard[1] + 0.4,
      );
      lamps.current[index]?.toggleAttribute("data-on", on);
      moods.current[index]?.toggleAttribute("data-on", on);
    });

    // The face: speaking while the voice is heard, and the reading's pose for as long as it lasts
    const reaction = landed && reactionOf(landed);
    const pose =
      reaction && t < landed.read + reaction.lasts
        ? reaction.pose
        : heard
          ? "speaking"
          : "idle";
    if (pose !== s.pose) {
      s.pose = pose;
      engine.setPose(pose, now, FACE);
      face.current?.setAttribute("data-pose", pose);
    }
    const loud = heard ? loudnessOf(clip, t) : 0;
    // A meter's needle is quick up and slow down
    s.level = calm
      ? loud
      : loud > s.level
        ? loud
        : follow(s.level, loud, dt, 0.16);
    needle.current?.setAttribute("d", needleOf(s.level));
    const frame = engine.sample(now, { voice: loud }, FACE);
    [frame.left, frame.right].forEach((eye, index) => {
      const node = eyes.current[index];
      if (!node) return;
      const cx = BOX.width * 0.5 + (index ? 1 : -1) * eye.spread * BOX.width;
      node.setAttribute(
        "d",
        profileToPath(eye.profile, eye.size * BOX.height, eye.bend),
      );
      node.setAttribute(
        "transform",
        `translate(${(cx + eye.x).toFixed(1)} ${(BOX.height * 0.5 + eye.y).toFixed(1)}) rotate(${eye.rotation.toFixed(1)}) scale(${eye.scaleX.toFixed(3)} ${eye.scaleY.toFixed(3)})`,
      );
      node.setAttribute("opacity", eye.opacity.toFixed(2));
    });

    // The markers light as the sentence being followed gets to each, and the panel is told
    const progress = progressOf(clip, t);
    marks.current.forEach((node, index) =>
      node?.toggleAttribute("data-on", progress.step > index),
    );
    const key = `${s.clip}-${progress.sentence}-${progress.step}-${s.sound}-${s.paused}`;
    if (key !== shown.current) {
      shown.current = key;
      onShow({ clip: s.clip, ...progress, sound: s.sound, paused: s.paused });
      anchor.current?.setAttribute("aria-label", spokenOf(clip, progress));
    }
    return !calm;
  }, visible);

  React.useEffect(() => () => audio.current?.pause(), []);
  // Out of sight, it is out of earshot too
  React.useEffect(() => {
    if (!visible) audio.current?.pause();
  }, [visible]);

  React.useImperativeHandle(controls, () => ({
    pick(clip) {
      state.current.paused = false;
      start(clip);
      // Straight to the first words, since they asked for it
      state.current.t = -0.6;
      kick();
    },
    toggleSound() {
      const s = state.current;
      s.sound = !s.sound;
      audio.current ??= new Audio();
      if (s.sound) {
        start(s.clip);
        s.t = -0.6;
      } else audio.current.pause();
      kick();
    },
    togglePause() {
      const s = state.current;
      s.paused = !s.paused;
      if (s.paused) audio.current?.pause();
      else if (
        s.sound &&
        audio.current &&
        s.t >= 0 &&
        s.t < CLIPS[s.clip].length
      ) {
        // Pick the voice up where the tape stopped
        audio.current.currentTime = s.t;
        void audio.current.play().catch(() => {});
      }
      kick();
    },
  }));

  return (
    <div
      ref={anchor}
      className="relative"
      role="img"
      aria-label={spokenOf(CLIPS[0], { sentence: -1, step: 0 })}
    >
      <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
        {BENCH}
        {BENCH_ART.wires.map((d, index) => (
          <path
            key={index}
            ref={(node) => {
              flows.current[index] = node;
            }}
            className="iso-line tp-flow"
            data-tone="lit"
            d={d}
          />
        ))}

        {/* The deck */}
        <Solid
          paths={DECK_ART.slab}
          tone="mid"
          inner={<Line d={DECK_ART.seam} tone="faint" />}
        />
        <Line d={DECK_ART.groove} tone="faint" />
        <Line d={DECK_ART.screwRings} tone="lo" />
        <Dots points={DECK_ART.screws} size={0.45} />
        <Line d={DECK_ART.ruler.minor} tone="lo" />
        <Line d={DECK_ART.ruler.major} tone="mid" />

        {/* The reels: each one's tape leaves from under its upper flange */}
        {DECK_ART.reels.map((reel, index) => (
          <g key={index}>
            <Solid paths={reel.spindle} tone="lo" />
            <Solid paths={reel.lower} tone="mid" />
            <Solid
              paths={reel.pack}
              tone="mid"
              inner={<Line d={reel.winds} tone="faint" />}
            />
            <path
              className="tp-ribbon"
              d={(index ? DECK_ART.take : DECK_ART.feed).fill}
            />
            <Line
              d={(index ? DECK_ART.take : DECK_ART.feed).edges}
              tone="mid"
            />
            <Solid paths={reel.upper} tone="hi" crease="lo" />
            <path
              ref={(node) => {
                windows.current[index] = node;
              }}
              className="iso-line"
              data-tone="lo"
              d={windowsOf(index, 0)}
            />
            <Line d={reel.hubRing} tone="lo" />
            <Solid paths={reel.hub} tone="mid" />
            <Dots points={reel.nut} size={0.8} tone="hi" />
          </g>
        ))}

        {/* What stands behind the tape, left to right, on its plate */}
        <Solid paths={DECK_ART.rail} tone="mid" />
        <Dots points={DECK_ART.railScrews} size={0.4} />
        <Post art={DECK_ART.posts[0]} />
        <Post art={DECK_ART.posts[1]} />
        {DECK_ART.heads.map((head, index) => (
          <g key={index}>
            <Solid
              paths={head.block}
              tone="mid"
              inner={<Line d={head.seam} tone="faint" />}
            />
            <Dots points={head.screws} size={0.4} />
            <g
              ref={(node) => {
                headLamps.current[index] = node;
              }}
              className="tp-lamp"
            >
              <Solid paths={head.lamp} tone="mid" />
              <Dots points={head.lampDot} size={0.8} tone="hi" />
            </g>
            <text
              ref={(node) => {
                headNames.current[index] = node;
              }}
              className="iso-face-text tp-name"
              transform={head.name}
              fontSize={4.4}
              textAnchor="middle"
            >
              {index ? "PLAY" : "READ"}
            </text>
            <Solid paths={head.nose} tone="hi" crease="lo" />
            <Line d={head.gap} tone="mid" />
          </g>
        ))}
        <Post art={DECK_ART.capstan} />
        <Post art={DECK_ART.posts[2]} />

        {/* The tape's run, with the voice written on it */}
        <Solid paths={DECK_ART.run} tone="hi" crease="none" />
        <path ref={wave} className="iso-line tp-wave" data-tone="mid" d="" />
        {[0, 1, 2].map((index) => (
          <path
            key={index}
            ref={(node) => {
              rules.current[index] = node;
            }}
            className="iso-line tp-sentence"
            data-tone="mid"
            d=""
          />
        ))}

        {/* In front of the tape */}
        {DECK_ART.keys.map((key, index) => (
          <Solid key={index} paths={key} tone="mid" />
        ))}
        <Dots points={DECK_ART.keyMarks} size={0.7} tone="mid" />
        <Solid paths={DECK_ART.counter} tone="mid" />
        <Line d={DECK_ART.counterWindow} tone="lo" />
        <text
          ref={counter}
          className="iso-face-text tp-counter"
          transform={DECK_ART.counterText}
          fontSize={5}
          textAnchor="middle"
        >
          00.00
        </text>
        <Solid paths={DECK_ART.meter} tone="mid" />
        <Line d={DECK_ART.meterWindow} tone="lo" />
        <Line d={DECK_ART.meterScale.minor} tone="lo" />
        <Line d={DECK_ART.meterScale.major} tone="mid" />
        <path
          ref={needle}
          className="iso-line"
          data-tone="hi"
          d={needleOf(0)}
        />
        <Dots points={DECK_ART.meterPivot} size={0.8} tone="hi" />
        <Solid paths={DECK_ART.pinchArm} tone="lo" />
        <Solid paths={DECK_ART.pinch} tone="mid" />
        <Line d={DECK_ART.pinchCap} tone="lo" />
        <Post art={DECK_ART.pivot} />
        <Solid paths={BENCH_ART.glands[0]} tone="mid" crease="none" />
        <Solid paths={BENCH_ART.glands[1]} tone="mid" crease="none" />

        {/* The character */}
        <Solid
          paths={CHARACTER_ART.pedestal}
          tone="mid"
          inner={<Line d={CHARACTER_ART.pedestalSeam} tone="faint" />}
        />
        <Solid paths={CHARACTER_ART.neck} tone="lo" />
        <Solid
          paths={CHARACTER_ART.body}
          tone="hi"
          crease="lo"
          inner={
            <>
              <Line d={CHARACTER_ART.bodySeam} tone="faint" />
              <Line d={CHARACTER_ART.shellSeam} tone="faint" />
            </>
          }
        />
        <Line d={CHARACTER_ART.vents} tone="lo" />
        <path className="tp-bezel" d={CHARACTER_ART.bezel} />
        <g ref={face} className="tp-face" data-pose="idle">
          <path className="tp-screen" d={CHARACTER_ART.screen} />
          <g transform={CHARACTER_ART.plane}>
            <g transform={`scale(${SHRINK.toFixed(4)})`}>
              {[0, 1].map((index) => (
                <path
                  key={index}
                  ref={(node) => {
                    eyes.current[index] = node;
                  }}
                  className="tp-eye"
                />
              ))}
            </g>
          </g>
        </g>
        <Dots points={CHARACTER_ART.lamp} size={0.8} tone="mid" />
        <Line d={CHARACTER_ART.grille} tone="lo" />
        <Dots points={CHARACTER_ART.screws} size={0.45} />
        <Solid paths={BENCH_ART.glands[4]} tone="mid" crease="none" />
        <Solid paths={BENCH_ART.glands[5]} tone="mid" crease="none" />

        {/* The reader */}
        <Solid paths={BENCH_ART.glands[2]} tone="mid" crease="none" />
        <Solid paths={BENCH_ART.glands[3]} tone="mid" crease="none" />
        <Solid
          paths={READER_ART.base}
          tone="mid"
          inner={<Line d={READER_ART.seam} tone="faint" />}
        />
        <Line d={READER_ART.plate} tone="faint" />
        <Dots points={READER_ART.screws} size={0.45} />
        {READER_ART.lamps.map((lamp, index) => (
          <g key={LAMPS[index]}>
            <g
              ref={(node) => {
                lamps.current[index] = node;
              }}
              className="tp-lamp"
            >
              <Solid paths={lamp.collar} tone="lo" />
              <Solid paths={lamp.lens} tone="mid" />
              <Dots points={lamp.dot} size={1} tone="hi" />
            </g>
            <text
              ref={(node) => {
                moods.current[index] = node;
              }}
              className="iso-face-text tp-name"
              transform={lamp.name}
              fontSize={3.5}
              textAnchor="end"
            >
              {LAMPS[index].toUpperCase()}
            </text>
          </g>
        ))}
        <text
          className="iso-face-text tp-name"
          transform={READER_ART.name}
          fontSize={5}
          textAnchor="end"
        >
          JEV
        </text>
      </IsoFigure>
      {MARK_AT.map((place, index) => (
        <span
          key={index}
          ref={(node) => {
            marks.current[index] = node;
          }}
          className="tp-mark"
          style={place}
          aria-hidden="true"
        >
          {index + 1}
        </span>
      ))}
    </div>
  );
}

const tab =
  "relative cursor-pointer px-2 py-1 text-sm capitalize transition-colors duration-150";

/** Why the face can react mid-sentence: the words reach the reader a second before the voice says them. */
export default function TapeFigure() {
  const controls = React.useRef<Controls | null>(null);
  const [showing, setShowing] = React.useState<Showing>({
    clip: 0,
    sentence: -1,
    step: 0,
    sound: false,
    paused: false,
  });
  const clip = CLIPS[showing.clip];
  // Before the first sentence is written, the one that is coming
  const sentence = clip.sentences[Math.max(showing.sentence, 0)];
  const values = valuesOf(sentence);
  const waiting = ["–", "reading…", "still speaking…"];

  // Over the drawing: which recording, and whether it is heard
  const above = (
    <div className="flex items-start justify-between gap-3 px-3 md:px-1">
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
        <span className="pr-1 text-sm text-stone-400">PIP sounding</span>
        {CLIPS.map(({ name }, index) => (
          <button
            key={name}
            type="button"
            aria-pressed={index === showing.clip}
            onClick={() => controls.current?.pick(index)}
            className={`${tab} ${index === showing.clip ? "font-medium text-stone-900 after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-blue-500" : "text-stone-500 hover:text-stone-800"}`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          aria-label={showing.paused ? "Play" : "Pause"}
          title={showing.paused ? "Play" : "Pause"}
          onClick={() => controls.current?.togglePause()}
          className="aqua aqua-round aqua-to-blue size-8 [--aqua-ink:var(--color-stone-600)]"
        >
          {showing.paused ? (
            <IconMediaPlayFilled size={14} />
          ) : (
            <IconMediaPauseFilled size={14} />
          )}
        </button>
        <button
          type="button"
          aria-pressed={showing.sound}
          aria-label={showing.sound ? "Turn the sound off" : "Play with sound"}
          title={showing.sound ? "Sound on" : "Play with sound"}
          onClick={() => controls.current?.toggleSound()}
          className={`aqua aqua-round size-8 shrink-0 ${showing.sound ? "aqua-blue" : "aqua-to-blue [--aqua-ink:var(--color-stone-600)]"}`}
        >
          {showing.sound ? (
            <IconVolumeUp size={16} />
          ) : (
            <IconVolume size={16} />
          )}
        </button>
      </div>
    </div>
  );

  // Under it: the sentence being followed, and the same three steps as the numbers on the drawing, holding what each one showed
  const below = (
    <div className="flex flex-col gap-3 px-3 text-sm md:px-1">
      <p
        className={`min-h-10 text-[15px] leading-snug text-pretty ${showing.sentence < 0 ? "text-stone-400" : "text-stone-800"}`}
      >
        &ldquo;{sentence.text}&rdquo;
      </p>
      <ol className="grid gap-x-4 gap-y-2 sm:grid-cols-3">
        {STEPS.map((name, index) => {
          const done = showing.step > index;
          return (
            <li
              key={name}
              data-done={done ? "" : undefined}
              className="flex items-start gap-2"
            >
              <span className="tp-step-mark mt-0.5 shrink-0">{index + 1}</span>
              <span className="flex flex-col">
                <span className="text-stone-500">{name}</span>
                <span
                  className={`font-medium tabular-nums ${done ? (index === 1 ? "text-blue-600" : "text-stone-800") : "text-stone-400"}`}
                >
                  {done
                    ? values[index]
                    : showing.step === index
                      ? waiting[index]
                      : "–"}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );

  return (
    <FigureCard
      className="tape"
      ratio={WIDTH / HEIGHT}
      caption={CAPTION}
      above={above}
      below={below}
    >
      <Deck onShow={setShowing} controls={controls} />
    </FigureCard>
  );
}
