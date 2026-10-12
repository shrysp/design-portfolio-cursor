"use client";

import { useRef } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { IconArrowLeft, IconArrowRight, IconXmark } from "nucleo-micro-bold-essential";

export interface LightboxItem {
  src: string;
  caption?: string;
}

interface LightboxProps {
  /** Every figure on the page, in reading order */
  items: LightboxItem[];
  /** The one being shown, or null when closed */
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

const SWIPE_DISTANCE = 60;

const slideVariants = {
  enter: (direction: number) => ({ x: direction * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -48, opacity: 0 }),
};

// A figure at full size, with the page's other figures a step away: arrow
// keys, the side buttons or a swipe. Its layers sit above 9990 so the footer
// dock steps aside.
export default function Lightbox({ items, index, onIndexChange }: LightboxProps) {
  // Which way the last step went, so the pictures slide the matching way
  const direction = useRef(0);
  // A swipe ends with a click on the backdrop; this keeps it from closing the view
  const justSwiped = useRef(false);

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

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onIndexChange(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-stone-950/75 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          aria-describedby={undefined}
          // Focus the view itself, so arrow keys work at once and no button shows a focus ring
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus();
          }}
          onClick={() => {
            if (justSwiped.current) justSwiped.current = false;
            else onIndexChange(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") step(-1);
            if (event.key === "ArrowRight") step(1);
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center gap-4 p-4 pt-16 md:px-20 md:pb-8 md:pt-20 cursor-zoom-out outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          <Dialog.Title className="sr-only">{item?.caption || "Project image"}</Dialog.Title>

          {items.length > 1 && isOpen && (
            <div className="absolute top-4 left-4 md:top-6 md:left-6 h-8 flex items-center text-sm font-medium text-white/70 tabular-nums">
              {index + 1} / {items.length}
            </div>
          )}

          <Dialog.Close className="aqua aqua-to-amber absolute top-4 right-4 md:top-6 md:right-6 h-8 pl-2 pr-2.5 gap-1 text-sm font-medium">
            <IconXmark size={14} />
            Esc
          </Dialog.Close>

          <div className="relative w-full flex-1 min-h-0">
            <AnimatePresence initial={false} custom={direction.current}>
              {item && (
                <motion.div
                  key={item.src + index}
                  custom={direction.current}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  drag={items.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.3}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) < SWIPE_DISTANCE) return;
                    justSwiped.current = true;
                    step(info.offset.x < 0 ? 1 : -1);
                  }}
                  className="absolute inset-0"
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

          <p className="min-h-5 text-sm text-white/80 text-center text-pretty max-w-[60ch]">{item?.caption}</p>

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
                className="aqua aqua-round aqua-to-blue absolute left-3 md:left-6 top-1/2 -translate-y-1/2 size-9 disabled:opacity-40"
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
                className="aqua aqua-round aqua-to-blue absolute right-3 md:right-6 top-1/2 -translate-y-1/2 size-9 disabled:opacity-40"
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
