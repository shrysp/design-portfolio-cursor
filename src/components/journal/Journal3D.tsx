"use client";

import { useEffect, useRef, useState } from "react";
import { createJournalScene, JournalHotspot, JournalScene } from "./journalScene";
import manifest from "./journalManifest.json";

// Below this width an open spread is too small to read, so the journal shows one page at a time.
const SINGLE_PAGE_QUERY = "(max-width: 640px)";

export type Journal3DHandle = Omit<JournalScene, "dispose">;

interface Journal3DProps {
  // Filled in once the scene exists. A prop rather than a ref so it survives next/dynamic.
  apiRef: React.RefObject<Journal3DHandle | null>;
  // The element on the page where the closed journal rests
  restHostRef: React.RefObject<HTMLElement | null>;
  // Width of the closed cover on the page
  restWidth: number;
  // Whether the journal is open. Until then the canvas sits in the rest host.
  active: boolean;
  onReady: () => void;
  onError: (error: unknown) => void;
  onDismiss: () => void;
  onHotspot: (hotspot: JournalHotspot) => void;
}

export default function Journal3D({ apiRef, restHostRef, restWidth, active, onReady, onError, onDismiss, onHotspot }: Journal3DProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onReady, onError, onDismiss, onHotspot });
  callbacks.current = { onReady, onError, onDismiss, onHotspot };

  // The layout is fixed for as long as the journal is open, and re-checked when it's closed.
  const [layout, setLayout] = useState<"spread" | "single" | null>(null);
  useEffect(() => {
    if (active) return;
    const query = window.matchMedia(SINGLE_PAGE_QUERY);
    const update = () => setLayout(query.matches ? "single" : "spread");
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [active]);

  useEffect(() => {
    const stageHost = stageRef.current;
    const restHost = restHostRef.current;
    if (!stageHost || !restHost || !layout) return;

    let scene: JournalScene;
    try {
      scene = createJournalScene({
        restHost,
        stageHost,
        restWidth,
        layout,
        sides: (layout === "single" ? manifest.singleSides : manifest.sides).map((src) => `${src}?v=${manifest.version}`),
        backCover: `${manifest.singleBackCover}?v=${manifest.version}`,
        coverBare: `${manifest.coverBare}?v=${manifest.version}`,
        coverSticker: manifest.coverSticker,
        hotspots: manifest.hotspots,
        pageWidth: manifest.pageWidth,
        pageHeight: manifest.pageHeight,
        glossAlpha: manifest.glossAlpha,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        onReady: () => callbacks.current.onReady(),
        onError: (error) => callbacks.current.onError(error),
        onDismiss: () => callbacks.current.onDismiss(),
        onHotspot: (hotspot) => callbacks.current.onHotspot(hotspot),
      });
    } catch (error) {
      // No WebGL: the caller falls back to the CSS journal.
      callbacks.current.onError(error);
      return;
    }

    apiRef.current = scene;
    return () => {
      apiRef.current = null;
      scene.dispose();
    };
  }, [apiRef, restHostRef, restWidth, layout]);

  return (
    <div
      ref={stageRef}
      role="dialog"
      aria-modal="true"
      aria-label="Journal"
      aria-hidden={!active}
      // Only raised above the page while open. The footer hides itself whenever it
      // finds a full-screen layer with a high z-index, and this one is always mounted.
      className={`fixed inset-0 h-[100dvh] w-full touch-none overscroll-none ${active ? "z-[9999]" : ""}`}
      style={{ visibility: active ? "visible" : "hidden", pointerEvents: active ? "auto" : "none" }}
    />
  );
}
