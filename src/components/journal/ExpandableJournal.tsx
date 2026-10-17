"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal, preload } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IconArrowLeft, IconArrowRight, IconXmark } from "nucleo-micro-bold-essential";
import { useKeyFlash } from "@/lib/useKeyFlash";
import { Button } from "@/components/ui/button";
import { useCanHover } from "@/lib/useCanHover";
import { JOURNAL_EMAIL } from "./journalPages";
import manifest from "./journalManifest.json";
import type { Journal3DHandle } from "./Journal3D";
import type { JournalHotspot } from "./journalScene";

/**
 * three.js stays out of the page bundle: the book's module is fetched once the
 * page is up. Not through next/dynamic, whose lazy wrapper rendered the book
 * hundreds of times without ever committing it on the dev server, so the old
 * fallback timer fired and a CSS journal stood in for it.
 */
type Journal3DComponent = typeof import("./Journal3D").default;

// The cover sits this far left of its wrapper (the -ml-2 below).
const COVER_NUDGE_PX = 8;
// The name sticker goes on this long after the page has loaded, or this soon
// after the journal appears if that happens later
const STICK_ON_AFTER_LOAD_MS = 1100;
const STICK_ON_AFTER_REVEAL_MS = 350;
// Room around the resting cover for the 3D book to tilt, lift and cast its shadow.
const REST_MARGIN_PX = 72;

/**
 * The pictures the 3D book waits for before it shows (journalScene's
 * checkReady): its bare cover, the name sticker and the first three page
 * sides, the same in both layouts. Asked for at the top of the page's own
 * requests, so on a slow connection they are not queued behind everything
 * else. There used to be a CSS journal it fell back to after eight seconds,
 * and on a slow connection that is what people saw.
 */
const FIRST_TEXTURES = [
  `${manifest.coverBare}?v=${manifest.version}`,
  manifest.coverSticker.src,
  ...manifest.sides.slice(0, 3).map((src) => `${src}?v=${manifest.version}`),
];

// Checked up front: a browser without WebGL 2 shows the journal's cover as a picture.
let webglSupport: boolean | null = null;
function supportsWebGL() {
  webglSupport ??= document.createElement("canvas").getContext("webgl2") !== null;
  return webglSupport;
}

interface ExpandableJournalProps {
  // Size when collapsed (in header)
  collapsedWidth?: number;
  collapsedHeight?: number;
}

export function ExpandableJournal({ collapsedWidth = 210, collapsedHeight = 280 }: ExpandableJournalProps) {
  // three.js asks for textures in CORS mode, and a preload in another mode is fetched twice
  for (const href of FIRST_TEXTURES) preload(href, { as: "image", fetchPriority: "high", crossOrigin: "anonymous" });

  const canHover = useCanHover();
  const [isMounted, setIsMounted] = useState(false);
  const [Journal3D, setJournal3D] = useState<Journal3DComponent | null>(null);
  const [is3DReady, setIs3DReady] = useState(false);
  // No WebGL, or the textures would not load: the cover stays as a still picture
  const [isStill, setIsStill] = useState(false);
  const [is3DActive, setIs3DActive] = useState(false); // Journal is open in 3D
  const [wantsOpen, setWantsOpen] = useState(false); // Clicked before the journal finished loading
  const [isExpanded, setIsExpanded] = useState(false);
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false); // Track keyboard navigation mode
  const [copied, setCopied] = useState(false);
  // Arrow keys and Esc show on their buttons
  const [pressedKey, flashKey] = useKeyFlash<"previous" | "next" | "close">();
  const journal3DRef = useRef<Journal3DHandle | null>(null);
  const restHostRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);
  // On its way home: the controls go at once, as the close starts
  const [isClosing, setIsClosing] = useState(false);

  const isOpen = isExpanded || is3DActive;

  // For portal rendering - only after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!supportsWebGL()) {
      setIsStill(true);
      return;
    }
    let cancelled = false;
    import("./Journal3D").then(
      (module) => !cancelled && setJournal3D(() => module.default),
      () => !cancelled && setIsStill(true),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const handle3DError = useCallback(() => {
    setIsStill(true);
    setJournal3D(null);
    setIs3DActive(false);
  }, []);

  // The journal is brought in once it's ready to show
  const isRevealed = is3DReady || isStill;

  // Stick the name sticker on once the 3D book is showing and the page has settled
  useEffect(() => {
    if (!is3DReady) return;
    const loadedAt = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.loadEventEnd || performance.now();
    const wait = Math.max(loadedAt + STICK_ON_AFTER_LOAD_MS - performance.now(), STICK_ON_AFTER_REVEAL_MS);
    const timer = setTimeout(() => journal3DRef.current?.stickOn(), wait);
    return () => clearTimeout(timer);
  }, [is3DReady]);

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
    // The book lifts off the page from where it rests
    journal3DRef.current?.open();
    setIs3DActive(true);
    setIsExpanded(true);
  }, []);

  const handleExpand = () => {
    if (isOpen || isStill) return;
    if (!is3DReady) {
      setWantsOpen(true);
      return;
    }
    open();
  };

  // Open as soon as the journal is ready, for a click that came first
  useEffect(() => {
    if (!wantsOpen || !is3DReady) return;
    setWantsOpen(false);
    open();
  }, [wantsOpen, is3DReady, open]);

  const handleClose = useCallback(async () => {
    if (!isExpanded || isClosingRef.current) return;
    isClosingRef.current = true;
    setIsClosing(true);
    // The book shuts, then flies home while the overlay fades behind it
    const landed = await journal3DRef.current?.close(() => setIsExpanded(false));
    isClosingRef.current = false;
    setIsClosing(false);
    // Pressed on its way home, it has come back out instead (handleReopen)
    if (landed === false) return;
    setIs3DActive(false);
    setIsExpanded(false);
  }, [isExpanded]);

  const handleReopen = useCallback(() => {
    isClosingRef.current = false;
    setIsClosing(false);
    setIsExpanded(true);
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
    if (direction === 1) journal3DRef.current?.flipNext();
    else journal3DRef.current?.flipPrev();
  }, []);

  // Handle keyboard navigation (Escape, Arrow keys)
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!isExpanded) return;

      if (event.key === "Escape") {
        flashKey("close");
        handleClose();
        return;
      }

      // Arrow key navigation
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIsKeyboardNavigating(true);
        flashKey("next");
        flipJournal(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIsKeyboardNavigating(true);
        flashKey("previous");
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
  }, [isExpanded, flipJournal, handleClose, isKeyboardNavigating, flashKey]);

  const portalWrapper = isMounted ? createPortal(
    <>
      <AnimatePresence>
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

            {/* Controls - flip and close, for anyone not using the keyboard or the page itself.
                They wait for the book to arrive, but leave the moment it's closed. */}
            <AnimatePresence>
            {!isClosing && (
            <motion.div
              key="journal-controls"
              data-journal-controls=""
              className="fixed z-[10000] flex items-center gap-3 -translate-x-1/2 left-1/2 top-6 sm:top-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10, transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] } }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Button
                type="button"
                variant="iconPrimary"
                size="icon"
                aria-label="Previous page"
                title="Previous page (←)"
                onClick={() => flipJournal(-1)}
                className={`size-8 ${pressedKey === "previous" ? "aqua-pressed" : ""}`}
              >
                <IconArrowLeft size={14} />
              </Button>
              <Button
                type="button"
                variant="iconPrimary"
                size="icon"
                aria-label="Next page"
                title="Next page (→)"
                onClick={() => flipJournal(1)}
                className={`size-8 ${pressedKey === "next" ? "aqua-pressed" : ""}`}
              >
                <IconArrowRight size={14} />
              </Button>
              <Button
                type="button"
                variant="back"
                aria-label="Close journal"
                title="Close (Esc)"
                onClick={handleClose}
                className={`h-8 pl-2 pr-2.5 gap-1 text-sm ${pressedKey === "close" ? "aqua-pressed" : ""}`}
              >
                <IconXmark size={14} />
                Esc
              </Button>
            </motion.div>
            )}
            </AnimatePresence>

            {/* Confirms a copy made from a 3D page, which can't show its own "Copied!" */}
            {copied && (
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
          </>
        )}
      </AnimatePresence>

      {/* The 3D journal - rests in the header below and moves here while open */}
      {Journal3D && !isStill && (
        <Journal3D
          apiRef={journal3DRef}
          restHostRef={restHostRef}
          restWidth={collapsedWidth}
          active={is3DActive}
          onReady={() => setIs3DReady(true)}
          onError={handle3DError}
          onDismiss={handleClose}
          onReopen={handleReopen}
          onHotspot={handleHotspot}
        />
      )}
    </>,
    document.body
  ) : null;

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
        {isStill ? (
          // Without WebGL: the cover, as a picture
          <div className="relative w-full h-full -ml-2 rotate-3 rounded-l-sm rounded-r-lg overflow-hidden shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FIRST_TEXTURES[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={manifest.coverSticker.src}
              alt="Hello, my name is Shreyas"
              className="absolute left-1/2 top-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rotate-3 object-contain"
            />
          </div>
        ) : (
          // The click target for the 3D book, which draws itself in the rest host below
          <motion.div
            className="cursor-pointer relative opacity-0"
            role="button"
            aria-label="Open journal"
            tabIndex={isOpen ? -1 : 0}
            style={{ rotate: 3, width: collapsedWidth, height: collapsedHeight, borderRadius: 12 }}
            onClick={handleExpand}
            onPointerMove={(e) => {
              if (e.pointerType === "mouse") journal3DRef.current?.hover({ x: e.clientX, y: e.clientY });
            }}
            onPointerLeave={() => journal3DRef.current?.hover(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleExpand();
              }
            }}
            whileHover={canHover ? { rotate: -3, transition: { duration: 0.2 } } : undefined}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

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
            visibility: is3DReady ? "visible" : "hidden",
          }}
        />
      </motion.div>
    </>
  );
}
