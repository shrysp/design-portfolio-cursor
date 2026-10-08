"use client";

import { useEffect, useRef, useState } from "react";
import { getJournalPages, getJournalSinglePages, JOURNAL_PAGE_WIDTH, JOURNAL_PAGE_HEIGHT } from "./journalPages";

// Renders a single page side on its own, flush to the top-left of the viewport,
// so scripts/capture-journal-pages.mjs can screenshot it into a texture.
// `single` renders the side as it appears when the journal shows one page at a time.
export default function JournalCapture({ side, single }: { side: number; single: boolean }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const pages = getJournalPages();
  const singlePages = getJournalSinglePages();
  const page = pages[side >> 1];
  const content = single ? singlePages.pages[side] : page ? (side % 2 === 0 ? page.front : page.back) : null;

  useEffect(() => {
    const images = Array.from(pageRef.current?.querySelectorAll("img") ?? []);
    Promise.all([
      document.fonts.ready,
      ...images.map((img) => img.complete || new Promise((resolve) => { img.onload = img.onerror = resolve; })),
    ]).then(() => setReady(true));
  }, []);

  return (
    <div data-journal-capture="" data-ready={ready} data-side-count={pages.length * 2} data-single-count={singlePages.pages.length} data-single-overrides={singlePages.overrides.join(",")} className="fixed inset-0 z-[2147483647] bg-white">
      {/* Corners are rounded by the 3D journal itself, and dev overlays must stay out of the shot. */}
      <style>{`
        [data-journal-page] > * { border-radius: 0 !important; }
        nextjs-portal, [data-feedback-toolbar] { display: none !important; }
      `}</style>
      <div
        ref={pageRef}
        data-journal-page=""
        className="absolute top-0 left-0 overflow-hidden select-none font-handwriting"
        style={{ width: JOURNAL_PAGE_WIDTH, height: JOURNAL_PAGE_HEIGHT }}
      >
        {content}
      </div>
    </div>
  );
}
