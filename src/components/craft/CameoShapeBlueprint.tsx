"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Silhouette } from "@shrysp/cameo";
import { StillPad, type PointerOn } from "./cameo/ScreenPad";
import { EYE_LEVEL, headOf, restingEyeLevel, shapeExample, usualSpacingSeat, type Drawn, type ShapeExampleId } from "./cameo/shape";

// What the tile plays, in order: each scene is one head, and a run of moves
// on it. A move eases one thing from where it stands to a new value over
// `for` seconds (or only waits), with the pointer shown on what it holds.
//   cat:   the eyes are moved, up and then apart
//   ghost: the eyes are moved, then a screen is placed, sized and shifted
type Move = {
  for: number;
  pointer?: PointerOn;
  /** How far the eyes rise above where they rest, as a share of the glass */
  lift?: number;
  spacing?: number;
  /** Puts the screen down (the first time, at once) and moves it */
  screenAt?: { x: number; y: number };
  reach?: number;
};
const scenes: { shape: ShapeExampleId; label: string; moves: Move[] }[] = [
  {
    shape: "cat",
    label: "Cat",
    moves: [
      { for: 0.8 },
      { for: 1.1, pointer: "level", lift: 0.16 },
      { for: 0.35, pointer: "level" },
      { for: 1.1, pointer: "level", lift: -0.07 },
      { for: 0.5, pointer: "spacing" },
      { for: 1.1, pointer: "spacing", spacing: 1.32 },
      { for: 1.4 },
    ],
  },
  {
    shape: "ghost",
    label: "Ghost",
    moves: [
      { for: 0.8 },
      { for: 1.0, pointer: "spacing", spacing: 1.24 },
      { for: 0.4, pointer: "level" },
      { for: 1.0, pointer: "level", lift: 0.1 },
      { for: 0.5 },
      { for: 0.45, pointer: "screen", screenAt: { x: 0.5, y: 0.45 }, reach: 0.2 },
      { for: 1.2, pointer: "reach", reach: 0.33 },
      { for: 0.4, pointer: "screen" },
      { for: 1.1, pointer: "screen", screenAt: { x: 0.5, y: 0.55 } },
      { for: 1.6 },
    ],
  },
];

const sceneSeconds = scenes.map((scene) => scene.moves.reduce((sum, move) => sum + move.for, 0));
const loopSeconds = sceneSeconds.reduce((sum, seconds) => sum + seconds, 0);

const ease = (t: number) => t * t * (3 - 2 * t);
const mix = (from: number, to: number, t: number) => from + (to - from) * t;
// Values are held to a grid so a head worked out once is found again on every
// later pass: each takes the package about a sixtieth of a second to build
const snap = (value: number, step: number) => Math.round(value / step) * step;

/** What the tile shows at a moment in its loop. */
function momentAt(seconds: number) {
  let t = seconds % loopSeconds;
  let sceneIndex = 0;
  while (t >= sceneSeconds[sceneIndex]) t -= sceneSeconds[sceneIndex++];
  const scene = scenes[sceneIndex];

  const state = { lift: 0, spacing: 1, screenAt: null as { x: number; y: number } | null, reach: 0.3 };
  let pointer: PointerOn | undefined;
  for (const move of scene.moves) {
    const k = ease(Math.min(1, t / move.for));
    if (move.lift != null) state.lift = mix(state.lift, move.lift, k);
    if (move.spacing != null) state.spacing = mix(state.spacing, move.spacing, k);
    // A screen is put down where it is pressed; only once down does it travel
    if (move.screenAt) state.screenAt = state.screenAt ? { x: mix(state.screenAt.x, move.screenAt.x, k), y: mix(state.screenAt.y, move.screenAt.y, k) } : move.screenAt;
    if (move.reach != null) state.reach = state.screenAt && move.reach !== state.reach && !move.screenAt ? mix(state.reach, move.reach, k) : move.reach;
    pointer = move.pointer;
    if (t < move.for) break;
    t -= move.for;
  }
  return { sceneIndex, scene, state, pointer };
}

type Shown = { drawn: Drawn; head: Silhouette; eyeRest: number; spacingRest: ReturnType<typeof usualSpacingSeat> };
const shownCache = new Map<string, Shown>();

function shownAt(seconds: number) {
  const { sceneIndex, scene, state, pointer } = momentAt(seconds);
  const base = shapeExample(scene.shape);
  const eyeRest = restingEyeLevel(base);
  const lift = snap(state.lift, 0.01);
  const drawn: Drawn = {
    ...base,
    eyeLevel: lift === 0 ? null : Number(Math.min(EYE_LEVEL.max, Math.max(EYE_LEVEL.min, eyeRest + lift)).toFixed(2)),
    eyeSpacing: Number(snap(state.spacing, 0.02).toFixed(2)),
    screenAt: state.screenAt && { x: Number(snap(state.screenAt.x, 0.01).toFixed(2)), y: Number(snap(state.screenAt.y, 0.01).toFixed(2)) },
    screenReach: Number(snap(state.reach, 0.01).toFixed(2)),
  };
  const key = `${scene.shape}/${drawn.eyeLevel}/${drawn.eyeSpacing}/${drawn.screenAt?.x},${drawn.screenAt?.y}/${drawn.screenReach}`;
  let shown = shownCache.get(key);
  if (!shown) {
    shown = { drawn, head: headOf(drawn), eyeRest, spacingRest: usualSpacingSeat(drawn) };
    shownCache.set(key, shown);
  }
  return { sceneIndex, pointer, shown };
}

// Builds every head the loop will show, a little at a time while the page is
// idle, and says when it is done. Each takes the package about a sixtieth of a
// second; built as the play reached them, they made the first pass stutter and
// took the rest of the wall's motion down with it.
function warmUp(onReady: () => void) {
  const idle: (run: (deadline?: IdleDeadline) => void) => number =
    typeof requestIdleCallback === "function" ? (run) => requestIdleCallback(run, { timeout: 400 }) : (run) => window.setTimeout(run, 30);
  const cancel = typeof cancelIdleCallback === "function" ? cancelIdleCallback : clearTimeout;
  let at = 0;
  let handle = idle(function work(deadline?: IdleDeadline) {
    // At least one each turn, and more while there is time to spare
    do {
      shownAt(at);
      at += 1 / 30;
    } while (at < loopSeconds && (deadline?.timeRemaining() ?? 0) > 18);
    if (at < loopSeconds) handle = idle(work);
    else onReady();
  });
  return () => cancel(handle);
}

// The tile for "Cameo shapes": the plan a head is built from, and nothing
// alive. It is the playground's own drawing, playing by itself: on one head
// the eyes are moved, on the next a screen is placed and sized too, with a
// pointer on whatever is being held. The handles themselves are for the
// stage, where there's room.
export default function CameoShapeBlueprint() {
  const frameRef = useRef<HTMLDivElement>(null);
  // Seconds of play so far; it only runs while the tile is on screen
  const [time, setTime] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = 0;
    let played = 0;
    // It waits on its first head until every one it will show is ready
    let isWarm = false;
    const stopWarming = warmUp(() => (isWarm = true));
    const tick = (now: number) => {
      // Held still while a piece is open on the stage. Besides being hidden
      // behind it, a tile redrawing every frame keeps cutting in on the stage's
      // own first render, and what was opened never arrives.
      if (!isWarm || document.querySelector('[data-zoom-active="frame"]')) {
        last = 0;
        raf = requestAnimationFrame(tick);
        return;
      }
      // A long frame (a head being built for the first time) doesn't skip the play ahead
      if (last) played += Math.min(0.05, (now - last) / 1000);
      last = now;
      setTime(played);
      raf = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      last = 0;
      if (entry.isIntersecting) raf = requestAnimationFrame(tick);
    });
    observer.observe(frame);
    return () => {
      stopWarming();
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const { sceneIndex, pointer, shown } = shownAt(time);

  return (
    <div ref={frameRef} className="absolute inset-0 flex items-center justify-center bg-[#f2f4f5] [container-type:inline-size]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={sceneIndex}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-[72cqw]"
        >
          <StillPad {...shown} pointer={pointer} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
