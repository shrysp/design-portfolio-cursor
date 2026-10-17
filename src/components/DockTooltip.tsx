"use client";

import { useLayoutEffect, useRef, useState, type FocusEvent, type PointerEvent, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Glass from "./Glass";

interface Tip {
  label: string;
  /** Centre of the hovered item, measured from the dock's left edge */
  x: number;
  /** Which way the tooltip travelled to get here: -1 left, 1 right, 0 fresh */
  direction: number;
}

const SHOW_DELAY = 300;
const HIDE_DELAY = 120;

// One tooltip for the whole dock. It waits before it first appears, then
// follows the pointer from item to item without closing in between.
export function useDockTooltip(dockRef: RefObject<HTMLElement | null>) {
  const [tip, setTip] = useState<Tip | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isOpen = useRef(false);
  // What a tooltip still waiting to appear will say
  const pending = useRef("");

  const open = (label: string, item: HTMLElement) => {
    clearTimeout(timer.current);
    const dock = dockRef.current;
    if (!dock) return;
    const dockBox = dock.getBoundingClientRect();
    const itemBox = item.getBoundingClientRect();
    const x = itemBox.left - dockBox.left + itemBox.width / 2;
    pending.current = label;
    const show = () => {
      isOpen.current = true;
      const words = pending.current;
      setTip((previous) => ({ label: words, x, direction: previous ? Math.sign(x - previous.x) : 0 }));
    };
    if (isOpen.current) show();
    else timer.current = setTimeout(show, SHOW_DELAY);
  };

  const close = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      isOpen.current = false;
      setTip(null);
    }, HIDE_DELAY);
  };

  // Spread onto each dock item
  const tipFor = (label: string) => ({
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      // A tap fires pointerenter too, and would leave the tooltip stuck open
      if (event.pointerType === "mouse") open(label, event.currentTarget);
    },
    onPointerLeave: close,
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (event.currentTarget.matches(":focus-visible")) open(label, event.currentTarget);
    },
    onBlur: close,
  });

  // Changes what the open tooltip says, if it is showing `from`: the new words
  // swap in where the old ones were, as a label does between items
  const relabel = (from: string, to: string) => {
    if (pending.current === from) pending.current = to;
    setTip((previous) => (previous && previous.label === from ? { ...previous, label: to, direction: 0 } : previous));
  };

  return { tip, tipFor, relabel };
}

const slide = { type: "spring", stiffness: 520, damping: 40, mass: 0.8 } as const;
const fade = { duration: 0.15, ease: "easeOut" } as const;

const textVariants = {
  enter: (direction: number) => ({ x: direction * 14, opacity: 0, filter: "blur(3px)" }),
  center: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit: (direction: number) => ({ x: direction * -14, opacity: 0, filter: "blur(3px)" }),
};

interface DockTooltipProps {
  tip: Tip | null;
  /** Every label the dock can show, so each width is known before it's needed */
  labels: string[];
  /** Lift the tooltip clear of the project switcher when that sits above the dock */
  raised?: boolean;
}

export function DockTooltip({ tip, labels, raised = false }: DockTooltipProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [widths, setWidths] = useState<Record<string, number>>({});

  useLayoutEffect(() => {
    const measure = () => {
      const next: Record<string, number> = {};
      measureRef.current?.querySelectorAll<HTMLElement>("[data-label]").forEach((el) => {
        next[el.dataset.label as string] = Math.ceil(el.getBoundingClientRect().width);
      });
      setWidths(next);
    };
    measure();
    // The web font changes every width once it arrives
    document.fonts?.ready.then(measure);
  }, [labels]);

  const width = tip ? widths[tip.label] : undefined;

  return (
    <>
      <div ref={measureRef} aria-hidden className="absolute invisible pointer-events-none h-0 overflow-hidden whitespace-nowrap text-xs font-medium">
        {labels.map((label) => (
          <span key={label} data-label={label} className="inline-block px-3">
            {label}
          </span>
        ))}
      </div>

      <AnimatePresence>
        {tip && width && (
          <Glass
            key="dock-tooltip"
            aria-hidden
            blur={12}
            tint={0.8}
            refraction={12}
            bezel={6}
            className={`absolute left-0 bottom-full z-10 h-7 overflow-hidden pointer-events-none text-xs font-medium text-stone-700 ${raised ? "mb-[4.125rem]" : "mb-2.5"}`}
            initial={{ x: tip.x - width / 2, width, opacity: 0, y: 4 }}
            animate={{ x: tip.x - width / 2, width, opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ x: slide, width: slide, opacity: fade, y: fade }}
          >
            {/* The label leaves the way the tooltip came and the next one follows it in */}
            <AnimatePresence initial={false} custom={tip.direction}>
              <motion.span
                key={tip.label}
                custom={tip.direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
              >
                {tip.label}
              </motion.span>
            </AnimatePresence>
          </Glass>
        )}
      </AnimatePresence>
    </>
  );
}
