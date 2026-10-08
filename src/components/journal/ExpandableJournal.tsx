"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, animate, useMotionValue, useTransform, MotionValue } from "framer-motion";
import { IconArrowLeft, IconArrowRight, IconXmark } from "nucleo-micro-bold-essential";
import { Button } from "@/components/ui/button";
import { useCanHover } from "@/lib/useCanHover";
import { JournalCover, JOURNAL_EMAIL } from "./journalPages";
import type { Journal3DHandle } from "./Journal3D";
import type { JournalFallbackHandle } from "./JournalFallback";
import type { JournalHotspot } from "./journalScene";

// three.js stays out of the page bundle; it loads once the page is idle.
const Journal3D = dynamic(() => import("./Journal3D"), { ssr: false });
const JournalFallback = dynamic(() => import("./JournalFallback"), { ssr: false });

// The cover sits this far left of its wrapper (the -ml-2 below).
const COVER_NUDGE_PX = 8;
// If the 3D book still hasn't loaded after this long, give up on it and use the CSS journal
const JOURNAL_3D_TIMEOUT_MS = 8000;
// The name sticker goes on this long after the page has loaded, or this soon
// after the journal appears if that happens later
const STICK_ON_AFTER_LOAD_MS = 1100;
const STICK_ON_AFTER_REVEAL_MS = 350;
// Room around the resting cover for the 3D book to tilt, lift and cast its shadow.
const REST_MARGIN_PX = 72;

// Checked up front so a browser without WebGL goes straight to the CSS journal.
let webglSupport: boolean | null = null;
function supportsWebGL() {
  webglSupport ??= document.createElement("canvas").getContext("webgl2") !== null;
  return webglSupport;
}

// The name sticker being stuck onto the cover: its left edge goes down first
// with the rest curled up off the surface, then it is pressed flat from left to right.
const STICKER = {
  src: "/images/About/Name-Sticker.webp",
  // The image's own proportions
  aspect: 1006 / 738,
  // The sticker is cut into vertical strips hinged to one another, so it can curl
  strips: 6,
  // How far each strip bends up from the one before it, in degrees
  curlPerStrip: 14,
  delay: 1,
  arrive: 0.16,
  press: 0.6,
};

// How far strip `index` is still lifted (1) or pressed down (0). Strips go
// down one after another, like a thumb running along the sticker.
function stripLift(index: number, progress: number) {
  return Math.min(Math.max(index + 1 - progress * (STICKER.strips + 1), 0), 1);
}

function StickerStrip({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const rotateY = useTransform(progress, (value) => -stripLift(index, value) * STICKER.curlPerStrip);
  // A strip darkens the further it has curled away from the light
  const filter = useTransform(progress, (value) => {
    let curl = 0;
    for (let strip = 0; strip <= index; strip++) curl += stripLift(strip, value) * STICKER.curlPerStrip;
    return `brightness(${1 - 0.35 * Math.sin((Math.min(curl, 90) * Math.PI) / 180)})`;
  });
  const isLast = index === STICKER.strips - 1;

  return (
    <motion.div
      className="absolute top-0 h-full"
      style={{
        // The first strip is a slice of the sticker; each later one matches the strip it hangs off
        left: index === 0 ? 0 : "100%",
        width: index === 0 ? `${100 / STICKER.strips}%` : "100%",
        transformOrigin: "left center",
        transformStyle: "preserve-3d",
        rotateY,
      }}
    >
      {/* The image is laid out against the strip itself, but painted a pixel
          further into a transparent border so no gap shows before the next strip */}
      <motion.div
        className="absolute inset-y-0 left-0 box-border"
        style={{
          right: isLast ? 0 : -1,
          borderRight: isLast ? undefined : "1px solid transparent",
          backgroundImage: `url("${STICKER.src}")`,
          backgroundSize: `${STICKER.strips * 100}% 100%`,
          backgroundPosition: `${(index / (STICKER.strips - 1)) * 100}% 0`,
          backgroundRepeat: "no-repeat",
          backgroundOrigin: "content-box",
          backgroundClip: "border-box",
          filter,
        }}
      />
      {!isLast && <StickerStrip index={index + 1} progress={progress} />}
    </motion.div>
  );
}

// The CSS version of the sticker going on, for when the 3D journal isn't
// available. `canStart` holds it back until that is known.
function SlapSticker({ canStart }: { canStart: boolean }) {
  const [isReady, setIsReady] = useState(false);
  // Seconds to wait before sticking, set once the page has loaded and the journal is showing
  const [startDelay, setStartDelay] = useState<number | null>(null);
  const readyAt = useRef(0);
  const [hasLanded, setHasLanded] = useState(false);
  // 0 = held by its left edge with the rest curled up, 1 = pressed flat
  const progress = useMotionValue(0);
  const shadowOpacity = useTransform(progress, [0, 1], [0, 0.35]);

  useEffect(() => {
    // Wait for page to fully load before starting animation
    const handleLoad = () => {
      // Add small delay after load for smoother experience
      setTimeout(() => {
        readyAt.current = performance.now();
        setIsReady(true);
      }, 100);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Normally the sticker goes on a second after load. If the journal arrived
  // late, it follows shortly after the journal instead.
  useEffect(() => {
    if (!isReady || !canStart) return;
    const waited = (performance.now() - readyAt.current) / 1000;
    setStartDelay((current) => current ?? Math.max(STICKER.delay - waited, 0.35));
  }, [isReady, canStart]);

  useEffect(() => {
    if (startDelay === null) return;
    const land = () => setHasLanded(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      progress.set(1);
      land();
      return;
    }
    const controls = animate(progress, 1, {
      duration: STICKER.press,
      delay: startDelay + STICKER.arrive * 0.5,
      ease: [0.3, 0, 0.2, 1],
      onComplete: land,
    });
    return () => controls.stop();
  }, [startDelay, progress]);

  return (
    <motion.div
      className="z-[1] absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2"
      initial={{
        scale: 1.12,
        rotate: -3,
        opacity: 0,
        y: -14,
      }}
      animate={startDelay !== null ? {
        scale: 1,
        rotate: 3,
        opacity: 1,
        y: 0,
      } : {}}
      transition={{
        type: "tween",
        ease: "easeOut",
        duration: STICKER.arrive,
        delay: startDelay ?? 0,
      }}
    >
      {/* Shadow - deepens as the sticker is pressed down */}
      <motion.div
        className="absolute inset-0 bg-black/25 rounded-full blur-sm scale-75 translate-y-3"
        style={{ transform: "scale(0.75)", opacity: shadowOpacity }}
      />
      {/* Always present so the sticker keeps its size; hidden while the strips stand in for it */}
      <img 
        src={STICKER.src}
        alt="Hello, my name is Shreyas" 
        className={`size-60 object-contain relative z-10 ${hasLanded ? '' : 'opacity-0'}`}
      />
      {!hasLanded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center" aria-hidden="true">
          <div className="relative w-full max-h-full" style={{ aspectRatio: STICKER.aspect, perspective: 700 }}>
            <StickerStrip index={0} progress={progress} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface ExpandableJournalProps {
  // Size when collapsed (in header)
  collapsedWidth?: number;
  collapsedHeight?: number;
  // Size when expanded (centered)
  expandedWidth?: number;
  expandedHeight?: number;
}

export function ExpandableJournal({
  collapsedWidth = 210,
  collapsedHeight = 280,
  expandedWidth = 420,
  expandedHeight = 560,
}: ExpandableJournalProps) {
  const canHover = useCanHover();
  const [isMounted, setIsMounted] = useState(false);
  // The journal is 3D wherever WebGL works, and falls back to the CSS book where it doesn't
  const [mode, setMode] = useState<"3d" | "css">("3d");
  const [is3DMounted, setIs3DMounted] = useState(false);
  const [is3DReady, setIs3DReady] = useState(false);
  const [is3DActive, setIs3DActive] = useState(false); // Journal is open in 3D
  const [wantsOpen, setWantsOpen] = useState(false); // Clicked before the journal finished loading
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false); // Track exit animation
  const [isCoverHidden, setIsCoverHidden] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false); // Track keyboard navigation mode
  const [copied, setCopied] = useState(false);
  const journal3DRef = useRef<Journal3DHandle | null>(null);
  const fallbackRef = useRef<JournalFallbackHandle | null>(null);
  const collapsedRef = useRef<HTMLDivElement>(null);
  const restHostRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  // In 3D the journal is only ever the 3D book: nothing is shown in its place
  // while it loads. The cover below stays behind, unseen, as the click target.
  const is3DLive = mode === "3d" && is3DReady;

  const isOpen = isExpanded || isAnimatingOut || is3DActive;

  // For portal rendering - only after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Build the 3D journal straight away; the journal is held back until it's ready
  const prepare3D = useCallback(() => {
    if (supportsWebGL()) {
      setIs3DMounted(true);
    } else {
      setMode("css");
    }
  }, []);

  useEffect(() => {
    prepare3D();
  }, [prepare3D]);

  // Without WebGL (or if the textures fail to load) use the CSS journal instead
  const handle3DError = useCallback(() => {
    setMode("css");
    setIs3DMounted(false);
    setIs3DActive(false);
  }, []);

  useEffect(() => {
    if (mode !== "3d" || is3DReady) return;
    const timer = setTimeout(handle3DError, JOURNAL_3D_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [mode, is3DReady, handle3DError]);

  // The journal is brought in once it's ready to show
  const isRevealed = mode === "css" || is3DReady;

  // Stick the name sticker on once the 3D book is showing and the page has settled
  useEffect(() => {
    if (!is3DLive) return;
    const loadedAt = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.loadEventEnd || performance.now();
    const wait = Math.max(loadedAt + STICK_ON_AFTER_LOAD_MS - performance.now(), STICK_ON_AFTER_REVEAL_MS);
    const timer = setTimeout(() => journal3DRef.current?.stickOn(), wait);
    return () => clearTimeout(timer);
  }, [is3DLive]);


  // Prevent body scrolling when journal is expanded
  useEffect(() => {
    if (isOpen) {
      // Save the current scroll position
      const scrollY = window.scrollY;
      // Prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      // Prevent touch scrolling on mobile
      document.body.style.touchAction = 'none';
      document.documentElement.style.overflow = 'hidden';
      
      // Prevent touchmove on the document for mobile
      const preventTouchMove = (e: TouchEvent) => {
        e.preventDefault();
      };
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
      
      return () => {
        // Restore scrolling
        const bodyTop = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.documentElement.style.overflow = '';
        document.removeEventListener('touchmove', preventTouchMove);
        // Restore scroll position
        if (bodyTop) {
          window.scrollTo(0, parseInt(bodyTop || '0') * -1);
        }
      };
    }
  }, [isOpen]);

  const open = useCallback(() => {
    const cover = collapsedRef.current;
    if (!cover) return;
    if (mode === "3d") {
      // The book lifts off the page from where it rests
      journal3DRef.current?.open();
      setIs3DActive(true);
    } else {
      // Capture the position of the collapsed element before expanding
      setOriginRect(cover.getBoundingClientRect());
      setIsCoverHidden(true);
    }
    setIsExpanded(true);
  }, [mode]);

  const handleExpand = () => {
    if (isOpen) return;
    if (mode === "3d" && !is3DReady) {
      prepare3D();
      setWantsOpen(true);
      return;
    }
    open();
  };

  // Open as soon as whichever journal we ended up with is ready
  useEffect(() => {
    if (!wantsOpen || (mode === "3d" && !is3DReady)) return;
    setWantsOpen(false);
    open();
  }, [wantsOpen, mode, is3DReady, open]);

  // Close handler - defined first so it can be used in effects
  const handleClose = useCallback(async () => {
    if (!isExpanded || isClosingRef.current) return;
    isClosingRef.current = true;

    if (mode === "3d" && journal3DRef.current) {
      // The book shuts, then flies home while the overlay fades behind it
      await journal3DRef.current.close(() => setIsExpanded(false));
      setIs3DActive(false);
    } else {
      // First reset pages to cover if needed
      await fallbackRef.current?.reset();
      // Start exit animation - keep collapsed hidden during animation
      setIsAnimatingOut(true);
    }
    setIsExpanded(false);
    isClosingRef.current = false;
  }, [isExpanded, mode]);

  // Called when AnimatePresence exit animation completes
  const handleExitComplete = useCallback(() => {
    setIsAnimatingOut(false);
    setIsCoverHidden(false);
  }, []);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JOURNAL_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback if Clipboard API not available
    }
  }, []);

  // Links on a 3D page are part of its texture, so the scene reports clicks on them
  const handleHotspot = useCallback((hotspot: JournalHotspot) => {
    if (hotspot.action === "copy-email") {
      copyEmail();
    } else if (hotspot.href) {
      window.open(hotspot.href, "_blank", "noopener,noreferrer");
    }
  }, [copyEmail]);

  const flipJournal = useCallback((direction: 1 | -1) => {
    const book = mode === "3d" ? journal3DRef.current : fallbackRef.current;
    if (direction === 1) book?.flipNext();
    else book?.flipPrev();
  }, [mode]);

  // Handle keyboard navigation (Escape, Arrow keys)
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!isExpanded) return;
      
      if (event.key === "Escape") {
        handleClose();
        return;
      }

      // Arrow key navigation
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIsKeyboardNavigating(true);
        flipJournal(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIsKeyboardNavigating(true);
        flipJournal(-1);
      }
    }
    
    // Exit keyboard navigation mode when mouse moves
    function onMouseMove() {
      if (isKeyboardNavigating) {
        setIsKeyboardNavigating(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [isExpanded, flipJournal, handleClose, isKeyboardNavigating]);

  // We need to render the AnimatePresence outside the portal conditional
  // to properly handle exit animations
  const portalWrapper = isMounted ? createPortal(
    <>
      <AnimatePresence onExitComplete={handleExitComplete}>
        {isExpanded && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 w-full h-[100dvh] bg-black/60 backdrop-blur-sm z-[9998] overflow-hidden touch-none overscroll-none"
              style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
              onClick={handleClose}
            />

            {/* Controls - flip and close, for anyone not using the keyboard or the page itself */}
            <motion.div
              key="journal-controls"
              data-journal-controls=""
              className="fixed z-[10000] flex items-center gap-3 -translate-x-1/2 left-1/2 top-6 sm:top-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Button
                type="button"
                variant="iconPrimary"
                size="icon"
                showHighlight
                aria-label="Previous page"
                title="Previous page (←)"
                onClick={() => flipJournal(-1)}
                className="size-8"
              >
                <IconArrowLeft size={14} />
              </Button>
              <Button
                type="button"
                variant="iconPrimary"
                size="icon"
                showHighlight
                aria-label="Next page"
                title="Next page (→)"
                onClick={() => flipJournal(1)}
                className="size-8"
              >
                <IconArrowRight size={14} />
              </Button>
              <Button
                type="button"
                variant="back"
                showHighlight
                aria-label="Close journal"
                title="Close (Esc)"
                onClick={handleClose}
                className="h-8 pl-2 pr-2.5 gap-1 text-sm"
              >
                <IconXmark size={14} />
                Esc
              </Button>
            </motion.div>

            {/* Confirms a copy made from a 3D page, which can't show its own "Copied!" */}
            {mode === "3d" && copied && (
              <motion.div
                key="copied"
                role="status"
                className="fixed z-[10000] pointer-events-none -translate-x-1/2 left-1/2 bottom-10 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg text-[11px] text-white/90"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                Email copied
              </motion.div>
            )}

            {/* CSS journal - animates from collapsed position to center, scales on mobile */}
            {mode === "css" && (
              <JournalFallback
                key="expanded-journal"
                apiRef={fallbackRef}
                originRect={originRect}
                collapsedWidth={collapsedWidth}
                collapsedHeight={collapsedHeight}
                expandedWidth={expandedWidth}
                expandedHeight={expandedHeight}
                disableHover={isKeyboardNavigating}
                copied={copied}
                onCopyEmail={copyEmail}
                onDismiss={handleClose}
              />
            )}
          </>
        )}
      </AnimatePresence>

      {/* 3D journal - rests in the header below and moves here while open */}
      {mode === "3d" && is3DMounted && (
        <Journal3D
          apiRef={journal3DRef}
          restHostRef={restHostRef}
          restWidth={collapsedWidth}
          active={is3DActive}
          onReady={() => setIs3DReady(true)}
          onError={handle3DError}
          onDismiss={handleClose}
          onHotspot={handleHotspot}
        />
      )}
    </>,
    document.body
  ) : null;

  const isCoverInvisible = mode === "3d" || isCoverHidden;

  return (
    <>
      {portalWrapper}

      <motion.div
        className="relative"
        style={{ width: collapsedWidth, height: collapsedHeight }}
        initial={false}
        animate={{ opacity: isRevealed ? 1 : 0, scale: isRevealed ? 1 : 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Collapsed state - in header position. Stays as the click target once the 3D journal takes over */}
        <motion.div
          ref={collapsedRef}
          className={`cursor-pointer relative group perspective-1000 ${isCoverInvisible ? 'opacity-0' : ''}`}
          role="button"
          aria-label="Open journal"
          tabIndex={isOpen ? -1 : 0}
          style={{ 
            rotate: 3,
            width: collapsedWidth,
            height: collapsedHeight,
            borderRadius: 12,
          }}
          onClick={handleExpand}
          onPointerEnter={prepare3D}
          onPointerMove={(e) => {
            if (e.pointerType === "mouse") journal3DRef.current?.hover({ x: e.clientX, y: e.clientY });
          }}
          onPointerLeave={() => journal3DRef.current?.hover(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleExpand();
            }
          }}
          whileHover={canHover ? {
            rotate: -3,
            transition: { duration: 0.2 }
          } : undefined}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          {/* Collapsed cover - uses expanded content scaled down by same factor as animation */}
          <div className="w-full h-full rounded-l-sm rounded-r-lg overflow-hidden shadow-md -ml-2 ">
            {/* Inner wrapper at expanded dimensions, scaled down to match animation end state */}
            <div 
              className="origin-top-left"
              style={{
                width: expandedWidth,
                height: expandedHeight,
                transform: `scale(${collapsedWidth / expandedWidth}, ${collapsedHeight / expandedHeight})`,
              }}
            >
              {/* Exact same content as expanded front cover */}
              <JournalCover sticker={<SlapSticker canStart={mode === "css"} />} />
            </div>
          </div>
        </motion.div>

        {/* Where the 3D journal rests, centred on the cover */}
        <div
          ref={restHostRef}
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            top: -REST_MARGIN_PX,
            bottom: -REST_MARGIN_PX,
            left: -REST_MARGIN_PX - COVER_NUDGE_PX,
            right: -REST_MARGIN_PX + COVER_NUDGE_PX,
            visibility: is3DLive ? "visible" : "hidden",
          }}
        />
      </motion.div>
    </>
  );
}
