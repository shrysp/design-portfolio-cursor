"use client";

import { useRef } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { IconArrowLeft, IconArrowRight, IconXmark } from "nucleo-micro-bold-essential";
import { startZoomTransition } from "@/lib/routeTransition";
import { useKeyFlash } from "@/lib/useKeyFlash";

export interface LightboxItem {
  src: string;
  caption?: string;
  /** Width / height of the picture, so the frame can match it exactly */
  ratio?: number;
  /** The copy already loaded on the page, shown until the full-size one arrives */
  preview?: string;
}

interface LightboxProps {
  /** Every figure on the page, in reading order */
  items: LightboxItem[];
  /** The one being shown, or null when closed */
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

const SWIPE_DISTANCE = 60;
// A quick flick counts as a swipe however short, if it averages faster than
// this (px per ms) from start to release and moved more than a nudge
const SWIPE_SPEED = 0.11;
const FLICK_DISTANCE = 12;

// How long Esc shows on its button before the view starts to close
const CLOSE_KEY_DELAY = 120;

// The next picture pushes the current one aside: both travel the same short
// distance on the same spring, while one fades and blurs out and the other
// fades and sharpens in. Neither starts or ends off screen.
const PUSH_DISTANCE = 180;

const push = { type: "spring", stiffness: 300, damping: 34, mass: 1 } as const;
const soften = { duration: 0.28, ease: "easeOut" } as const;

const slideVariants = {
  enter: (direction: number) => ({ x: direction * PUSH_DISTANCE, opacity: 0, filter: "blur(8px)" }),
  center: { x: 0, opacity: 1, filter: "blur(0px)", transition: { x: push, opacity: soften, filter: soften } },
  exit: (direction: number) => ({
    x: -direction * PUSH_DISTANCE,
    opacity: 0,
    filter: "blur(8px)",
    transition: { x: push, opacity: soften, filter: soften },
  }),
};

// A figure at full size, with the page's other figures a step away: arrow
// keys, the side buttons or a swipe. Its layers sit above 9990 so the footer
// dock steps aside. It has no open or close animation of its own: the figure
// morphs into the frame and back (see startZoomTransition).
export default function Lightbox({ items, index, onIndexChange }: LightboxProps) {
  // Which way the last step went, so the pictures slide the matching way
  const direction = useRef(0);
  // A swipe ends with a click on the backdrop; this keeps it from closing the view
  const justSwiped = useRef(false);
  // When the current drag began, to tell a flick from a slow push
  const dragStart = useRef(0);
  // Arrow keys and Esc show on their buttons
  const [pressedKey, flashKey] = useKeyFlash<"previous" | "next" | "close">();
  const isClosing = useRef(false);

  const isOpen = index !== null;
  const item = isOpen ? items[index] : null;
  const hasPrevious = isOpen && index > 0;
  const hasNext = isOpen && index < items.length - 1;

  const step = (by: number) => {
    if (index === null) return;
    const next = index + by;
    if (next < 0 || next >= items.length) return;
    direction.current = by;
    onIndexChange(next);
  };

  // Shrinks the picture back into its figure on the page, bringing that
  // figure into view first if the carousel has moved on from where it started
  const close = () => {
    const current = index;
    startZoomTransition(() => {
      flushSync(() => onIndexChange(null));
      if (current === null) return;
      const figure = document.querySelectorAll<HTMLElement>("[data-zoom-src]")[current];
      if (!figure) return;
      const box = figure.getBoundingClientRect();
      if (box.top < 0 || box.bottom > window.innerHeight) figure.scrollIntoView({ block: "center", behavior: "instant" });
      figure.setAttribute("data-zoom-active", "figure");
    });
  };

  const ratio = item?.ratio ?? 4 / 3;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-stone-950/75 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          // Focus the view itself, so arrow keys work at once and no button shows a focus ring
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus();
          }}
          onClick={() => {
            if (justSwiped.current) justSwiped.current = false;
            else close();
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" && hasPrevious) {
              flashKey("previous");
              step(-1);
            }
            if (event.key === "ArrowRight" && hasNext) {
              flashKey("next");
              step(1);
            }
          }}
          // Esc dips its button first, then closes
          onEscapeKeyDown={(event) => {
            event.preventDefault();
            if (isClosing.current) return;
            isClosing.current = true;
            flashKey("close");
            setTimeout(() => {
              isClosing.current = false;
              close();
            }, CLOSE_KEY_DELAY);
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center gap-4 p-4 pt-16 md:px-20 md:pb-8 md:pt-20 cursor-collapse outline-none"
        >
          <Dialog.Title className="sr-only">{item?.caption || "Project image"}</Dialog.Title>

          {items.length > 1 && isOpen && (
            <div className="absolute top-4 left-4 md:top-6 md:left-6 h-8 flex items-center text-sm font-medium text-white/70 tabular-nums">
              {index + 1} / {items.length}
            </div>
          )}

          <Dialog.Close
            // The backdrop behind it also closes on click; one close is enough
            onClick={(event) => event.stopPropagation()}
            className={`aqua aqua-to-amber absolute top-4 right-4 md:top-6 md:right-6 h-8 pl-2 pr-2.5 gap-1 text-sm font-medium ${pressedKey === "close" ? "aqua-pressed" : ""}`}
          >
            <IconXmark size={14} />
            Esc
          </Dialog.Close>

          {/* The stage. The frame inside is exactly the picture's shape, as
              large as fits, so the figure has a true target to grow into. */}
          <div className="relative w-full flex-1 min-h-0 [container-type:size]">
            <AnimatePresence initial={false} custom={direction.current}>
              {item && (
                <motion.div
                  key={item.src + index}
                  custom={direction.current}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag={items.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.3}
                  onDragStart={() => {
                    dragStart.current = performance.now();
                  }}
                  onDragEnd={(_, info) => {
                    const distance = Math.abs(info.offset.x);
                    const speed = distance / Math.max(1, performance.now() - dragStart.current);
                    const flicked = distance > FLICK_DISTANCE && speed > SWIPE_SPEED;
                    if (distance < SWIPE_DISTANCE && !flicked) return;
                    justSwiped.current = true;
                    step(info.offset.x < 0 ? 1 : -1);
                  }}
                  data-zoom-active="frame"
                  // White behind the picture, as in its figure on the page, so
                  // a cut-out with a transparent background arrives on the same
                  // backing it left with instead of landing on the dark backdrop
                  className="absolute inset-0 m-auto bg-white bg-cover bg-center"
                  style={{
                    aspectRatio: ratio,
                    width: `min(100cqw, calc(100cqh * ${ratio}))`,
                    backgroundImage: item.preview ? `url("${item.preview}")` : undefined,
                  }}
                >
                  <Image
                    src={item.src}
                    alt={item.caption || "Project image"}
                    fill
                    sizes="100vw"
                    quality={90}
                    draggable={false}
                    className="object-contain select-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* The caption hands over with the picture */}
          <div className="min-h-5 max-w-[60ch]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="text-sm text-white/80 text-center text-pretty"
              >
                {item?.caption}
              </motion.p>
            </AnimatePresence>
          </div>

          {items.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                disabled={!hasPrevious}
                onClick={(event) => {
                  event.stopPropagation();
                  step(-1);
                }}
                className={`aqua aqua-round aqua-to-blue absolute left-3 md:left-6 top-1/2 -translate-y-1/2 size-9 disabled:opacity-40 ${pressedKey === "previous" ? "aqua-pressed" : ""}`}
              >
                <IconArrowLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next image"
                disabled={!hasNext}
                onClick={(event) => {
                  event.stopPropagation();
                  step(1);
                }}
                className={`aqua aqua-round aqua-to-blue absolute right-3 md:right-6 top-1/2 -translate-y-1/2 size-9 disabled:opacity-40 ${pressedKey === "next" ? "aqua-pressed" : ""}`}
              >
                <IconArrowRight size={16} />
              </button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
