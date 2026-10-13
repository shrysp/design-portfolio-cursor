"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DRAWN_DEFAULTS, HOUSING_W, JADE, PALETTE_MAP, definePreset, housingHeight, type CharacterPreset, type Silhouette } from "@shrysp/cameo";
import { Character } from "@shrysp/cameo/react";
import "@shrysp/cameo/styles.css";
import { IconPlus, IconXmark } from "nucleo-micro-bold-essential";
import ScreenPad from "./cameo/ScreenPad";
import { BORDER, SHAPE_EXAMPLES, SOFTEN, drawnFrom, headOf, restingEyeLevel, shapeExample, usualSpacingSeat, type Drawn } from "./cameo/shape";
import { SvgError, looksLikeSvg, readSvgDrawing } from "./cameo/svg";

// Each head that has been asked for, by its drawing and every dial on it.
// They are kept outside the component because the character waits on its
// preset while it loads: a preset made afresh on every attempt is one it would
// wait on forever, and the playground would never appear.
type Built = { head: Silhouette; preset: CharacterPreset; eyeRest: number; spacingRest: ReturnType<typeof usualSpacingSeat> };
const built = new WeakMap<object, Map<string, Built>>();
function build(drawn: Drawn) {
  let heads = built.get(drawn.drawing);
  if (!heads) built.set(drawn.drawing, (heads = new Map()));
  // Everything but the drawing itself, which the outer map is already keyed by
  const key = JSON.stringify({ ...drawn, drawing: null });
  let made = heads.get(key);
  if (!made) {
    const head = headOf(drawn);
    made = {
      head,
      preset: definePreset({ silhouette: head, palette: "green", eyeBuild: "horizontal", polarity: "lcd" }),
      eyeRest: restingEyeLevel(drawn),
      spacingRest: usualSpacingSeat(drawn),
    };
    // A long drag asks for a great many; none is worth keeping for ever
    if (heads.size > 240) heads.clear();
    heads.set(key, made);
  }
  return made;
}

const ACCENT = PALETTE_MAP.green.screen[1];

const pill = "aqua h-7 px-2.5 gap-1 text-[13px] font-medium";
const quiet = "aqua-to-blue [--aqua-ink:var(--color-stone-600)]";
const legend = "text-[11px] font-medium uppercase tracking-[0.16em]! text-stone-400";
// A shape to choose, as a small picture of its head over its name
const shapeTile = "flex flex-col items-center gap-1.5 rounded-xl px-1 pt-2.5 pb-2 text-[12px] font-medium transition-[background-color,box-shadow,color] duration-150";
const shapeTileOn = "bg-stone-100 text-stone-800 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]";
const shapeTileOff = "text-stone-500 hover:bg-stone-50";

/** A head in miniature, for the row of shapes to choose from: its outline and its screen. */
function MiniHead({ head }: { head: Silhouette }) {
  const outline = head.outline;
  if (!outline) return null;
  return (
    <svg viewBox={`-12 -12 ${HOUSING_W + 24} ${housingHeight(head) + 24}`} className="h-7 w-9" aria-hidden>
      <path d={outline.housingPath} className="fill-white stroke-stone-500 [stroke-width:14]" />
      <path d={outline.screenPath} transform={`translate(${outline.box.x} ${outline.box.y})`} fill={ACCENT} />
    </svg>
  );
}

/** A dial under the plan: its name, where it stands, and a groove to drag along. */
function Dial({ dial, value, onChange }: { dial: typeof SOFTEN | typeof BORDER; value: number; onChange: (value: number) => void }) {
  const filled = ((value - dial.min) / (dial.max - dial.min)) * 100;
  return (
    <label className="grid grid-cols-[1fr_auto] items-center gap-x-3 text-[13px] text-stone-600">
      <span>{dial.label}</span>
      <span className="tabular-nums text-stone-400">{value.toFixed(dial.places)}</span>
      <input
        type="range"
        className="pad-dial col-span-2"
        min={dial.min}
        max={dial.max}
        step={dial.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--filled": `${filled}%` } as React.CSSProperties}
      />
    </label>
  );
}

// Cameo's "your own shape", to play with: any outline becomes a head, and the
// package fits a screen and eyes inside it. On the right is the playground's
// own controller, brought over as it is: press the plan to place the screen,
// drag an eye or a handle to move the pair. A shape of your own can be
// uploaded, dropped on the plan, or pasted as SVG; it is read in the browser
// by the package itself. This opens on the craft stage; the tile shows the
// plan alone (see CameoShapeBlueprint).
export default function CameoShape() {
  const [drawn, setDrawn] = useState<Drawn | null>(() => shapeExample("cat"));
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const made = drawn ? build(drawn) : null;
  /** A drawing that is not one of the examples: somebody's own. */
  const ownShape = drawn != null && !SHAPE_EXAMPLES.some((e) => shapeExample(e.id).drawing === drawn.drawing);

  /** SVG from anywhere (a file, the clipboard) into a head. */
  const takeSvg = useCallback((text: string, name: string) => {
    setUploadError("");
    try {
      setDrawn(drawnFrom(readSvgDrawing(text), name));
    } catch (error) {
      // Only the reader's own messages are written for people to read.
      setUploadError(error instanceof SvgError ? error.message : "That could not be read as a shape.");
    }
  }, []);

  /** A file dragged onto the box is over it. */
  const [over, setOver] = useState(false);
  /** What makes a box somewhere a file can be dropped. */
  const drop = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setOver(false);
      const file = e.dataTransfer.files[0];
      if (file) file.text().then((text) => takeSvg(text, file.name));
    },
  };

  // Pasting anywhere works while the playground is open, which is how a shape
  // arrives from a design tool: copy as SVG there, paste here. Left alone when
  // the paste is into a text field, or is not SVG.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      const file = Array.from(event.clipboardData?.files ?? []).find(
        (f) => f.type === "image/svg+xml" || f.name.toLowerCase().endsWith(".svg")
      );
      if (file) {
        event.preventDefault();
        file.text().then((text) => takeSvg(text, file.name));
        return;
      }
      const text = event.clipboardData?.getData("text/plain") ?? "";
      if (!looksLikeSvg(text)) return;
      event.preventDefault();
      takeSvg(text, "Pasted SVG");
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [takeSvg]);

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  // What there is to undo, each offered only once there is something of yours
  const resets = drawn
    ? [
        drawn.screenAt && { label: "Reset screen", run: () => setDrawn({ ...drawn, screenAt: null }) },
        (drawn.eyeLevel != null || drawn.eyeSpacing !== DRAWN_DEFAULTS.eyeSpacing) && {
          label: "Reset eyes",
          run: () => setDrawn({ ...drawn, eyeLevel: null, eyeSpacing: DRAWN_DEFAULTS.eyeSpacing }),
        },
      ].filter((reset): reset is { label: string; run: () => void } => Boolean(reset))
    : [];

  return (
    <div className="@container absolute inset-0 overflow-auto bg-[#f2f4f5] text-stone-700">
      <div className="min-h-full grid grid-cols-1 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] gap-5 p-5 @3xl:p-6">
        {/* The face the drawing makes, alive as any other, with the room to itself */}
        <section className="flex flex-col items-center justify-center gap-10 px-4 py-8">
          <div className="w-[min(100%,320px)] @3xl:w-[min(88%,460px)]">
            <Character preset={made?.preset ?? JADE} fill />
          </div>
          <p className="max-w-[30ch] text-center text-[13px] leading-snug text-stone-500 text-pretty">
            Any outline becomes a head. Press the plan to place the screen, and drag an eye to move the pair.
          </p>
        </section>

        {/* Everything there is to change, on one card the height of the stage */}
        <section className="surface flex flex-col gap-4 bg-white p-5">
          <div className="flex h-7 items-center justify-between gap-3">
            <h2 className={legend}>Your own shape</h2>
            {/* Kept to one row that is always there, so offering them never moves the plan */}
            <div className="flex items-center gap-1.5">
              <AnimatePresence initial={false}>
                {resets.map((reset) => (
                  <motion.button
                    key={reset.label}
                    type="button"
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    onClick={reset.run}
                    className={`${pill} ${quiet}`}
                  >
                    {reset.label}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Once there is a shape, the box that asked for one becomes the plan
              of it. Pasting still works anywhere, and a file can be dropped on either. */}
          {drawn && made ? (
            <>
              <div className="overflow-hidden rounded-xl">
                <ScreenPad
                  head={made.head}
                  drawn={drawn}
                  eyeRest={made.eyeRest}
                  spacingRest={made.spacingRest}
                  over={over}
                  drop={drop}
                  onChange={(change) => setDrawn({ ...drawn, ...change })}
                  remove={
                    <button
                      type="button"
                      aria-label="Remove this shape"
                      title="Remove this shape"
                      onClick={() => setDrawn(null)}
                      className="pad-remove aqua aqua-round aqua-to-amber size-7 z-10"
                    >
                      <IconXmark size={12} />
                    </button>
                  }
                />
              </div>

              <div className="flex flex-col gap-3 pt-1">
                <Dial dial={SOFTEN} value={drawn.smoothing} onChange={(smoothing) => setDrawn({ ...drawn, smoothing })} />
                {/* A screen of the drawing's own has the border it was drawn with. */}
                {!(drawn.drawing.screen && drawn.ownScreen) && (
                  <Dial dial={BORDER} value={drawn.bezel} onChange={(bezel) => setDrawn({ ...drawn, bezel })} />
                )}
                {drawn.drawing.screen && (
                  <button
                    type="button"
                    aria-pressed={drawn.ownScreen}
                    className={`${pill} self-start ${drawn.ownScreen ? "aqua-blue" : quiet}`}
                    onClick={() => setDrawn({ ...drawn, ownScreen: !drawn.ownScreen })}
                  >
                    Screen from the drawing
                  </button>
                )}
              </div>
            </>
          ) : (
            <div
              {...drop}
              className={`min-h-[220px] flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-2 text-[13px] leading-tight transition-colors duration-150 ${over ? "border-[#82c953] bg-[#bcdf9d]/25" : "border-stone-300 bg-stone-900/[0.04]"}`}
            >
              <p className="flex items-center gap-1">
                <kbd className="font-semibold font-sans">{isMac ? "⌘" : "Ctrl"} + V</kbd>
                <span>to paste an SVG</span>
              </p>
              <p className="text-stone-400">or</p>
              <button type="button" onClick={() => fileInput.current?.click()} className={`${pill} ${quiet}`}>
                Upload from computer
              </button>
            </div>
          )}
          {uploadError && (
            <p className="text-[12px] text-red-700" role="alert">
              {uploadError}
            </p>
          )}

          {/* Drawings to try, and your own, at the foot of the card */}
          <div className="mt-auto flex flex-col gap-2 border-t border-dashed border-stone-300/70 pt-4">
            <h2 className={legend}>Shape</h2>
            <div className="-mx-1.5 grid grid-cols-5 gap-0.5">
              {SHAPE_EXAMPLES.map((example) => {
                const isOn = drawn?.drawing === shapeExample(example.id).drawing;
                return (
                  <button
                    key={example.id}
                    type="button"
                    aria-pressed={isOn}
                    // Each starts as the playground's does, with every dial where it begins
                    onClick={() => {
                      setUploadError("");
                      setDrawn(shapeExample(example.id));
                    }}
                    className={`${shapeTile} ${isOn ? shapeTileOn : shapeTileOff}`}
                  >
                    <MiniHead head={build(shapeExample(example.id)).head} />
                    {example.label}
                  </button>
                );
              })}
              {/* A drawing of your own sits here once there is one */}
              <button
                type="button"
                aria-pressed={ownShape}
                aria-label={ownShape ? "Your shape. Press to choose another file." : "Add your own shape"}
                onClick={() => fileInput.current?.click()}
                className={`${shapeTile} ${ownShape ? shapeTileOn : shapeTileOff}`}
              >
                {ownShape && made ? (
                  <MiniHead head={made.head} />
                ) : (
                  <span className="flex h-7 w-9 items-center justify-center">
                    <IconPlus size={14} />
                  </span>
                )}
                {ownShape ? "Yours" : "Add"}
              </button>
            </div>
          </div>
        </section>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept=".svg,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) file.text().then((text) => takeSvg(text, file.name));
          // Cleared so that choosing the same file again still counts.
          e.target.value = "";
        }}
      />
    </div>
  );
}
