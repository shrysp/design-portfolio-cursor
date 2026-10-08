"use client";

import React, { useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { motion } from "framer-motion";
import Book, { BookHandle } from "./Book";
import { getJournalPages } from "./journalPages";

// The CSS journal, used when WebGL isn't available.

export interface JournalFallbackHandle {
  // Flips back to the cover, resolving once the pages have settled.
  reset: () => Promise<void>;
  flipNext: () => void;
  flipPrev: () => void;
}

// Hook to get responsive scale and center position
// The book always renders at desktop dimensions, but scales down on mobile
function useResponsiveJournalScale(
  desktopWidth: number,
  desktopHeight: number,
  mobileMargin: number = 16
) {
  const [state, setState] = useState({
    scale: 1,
    centerX: 0,
    centerY: 0,
  });

  useEffect(() => {
    function calculate() {
      const screenWidth = window.innerWidth;
      // Use visualViewport for accurate mobile height (accounts for dynamic address bar)
      // Falls back to innerHeight for desktop browsers
      const screenHeight = window.visualViewport?.height ?? window.innerHeight;

      // The spread (2 pages) width at full scale
      const spreadWidth = desktopWidth * 2;

      // Calculate scale factor - scale down if spread doesn't fit
      // Available width for spread = screen - margin
      const availableWidth = screenWidth - mobileMargin;
      const scale = Math.min(1, availableWidth / spreadWidth);

      // Also check height constraint
      const availableHeight = screenHeight - mobileMargin;
      const heightScale = Math.min(1, availableHeight / desktopHeight);

      // Use the smaller scale to ensure it fits both dimensions
      const finalScale = Math.min(scale, heightScale);

      // Visual height after scaling (for vertical centering)
      const visualHeight = desktopHeight * finalScale;

      // Center position - account for the fact that when open,
      // the spread extends from -pageWidth/2 to +pageWidth*1.5 relative to origin
      // So center of spread is at pageWidth/2 from container origin
      // We want the spread center at screen center
      const spreadCenterOffset = (desktopWidth / 2) * finalScale;
      const centerX = (screenWidth / 2) - spreadCenterOffset;
      const centerY = Math.max(mobileMargin / 2, (screenHeight - visualHeight) / 2);

      setState({ scale: finalScale, centerX, centerY });
    }

    calculate();
    window.addEventListener('resize', calculate);
    // Listen to visualViewport resize for mobile address bar changes
    window.visualViewport?.addEventListener('resize', calculate);
    return () => {
      window.removeEventListener('resize', calculate);
      window.visualViewport?.removeEventListener('resize', calculate);
    };
  }, [desktopWidth, desktopHeight, mobileMargin]);

  return state;
}

interface JournalFallbackProps {
  apiRef: React.RefObject<JournalFallbackHandle | null>;
  // Where the collapsed journal sits, for the FLIP animation
  originRect: DOMRect | null;
  collapsedWidth: number;
  collapsedHeight: number;
  expandedWidth: number;
  expandedHeight: number;
  disableHover: boolean;
  copied: boolean;
  onCopyEmail: () => void;
  onDismiss: () => void;
}

export default function JournalFallback({
  apiRef,
  originRect,
  collapsedWidth,
  collapsedHeight,
  expandedWidth,
  expandedHeight,
  disableHover,
  copied,
  onCopyEmail,
  onDismiss,
}: JournalFallbackProps) {
  const bookRef = useRef<BookHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Book always renders at desktop dimensions, but we scale the container on mobile
  const { scale, centerX, centerY } = useResponsiveJournalScale(expandedWidth, expandedHeight);

  // The flip and close buttons sit outside the book but shouldn't dismiss it
  useOnClickOutside(containerRef as React.RefObject<HTMLElement>, (event) => {
    if ((event.target as Element | null)?.closest?.("[data-journal-controls]")) return;
    onDismiss();
  });

  useEffect(() => {
    apiRef.current = {
      reset: async () => {
        if (bookRef.current && bookRef.current.getCurrentPage() > 0) {
          await bookRef.current.resetTocover();
        }
      },
      flipNext: () => bookRef.current?.flipNext(),
      flipPrev: () => bookRef.current?.flipPrev(),
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef]);

  // Calculate initial position from origin rect (FLIP animation)
  // Use originRect for POSITION only, use known props for SCALE to avoid measurement discrepancies
  const initialX = originRect ? originRect.left : centerX;
  const initialY = originRect ? originRect.top : centerY;
  // Use the prop values for scale to ensure exact match with collapsed element
  const initialScaleX = collapsedWidth / expandedWidth;
  const initialScaleY = collapsedHeight / expandedHeight;

  return (
    <motion.div
      ref={containerRef}
      className="fixed z-[9999] pointer-events-auto origin-top-left"
      style={{
        width: expandedWidth,
        height: expandedHeight,
        borderRadius: 12,
      }}
      initial={{
        left: initialX,
        top: initialY,
        rotate: 3,
        scaleX: initialScaleX,
        scaleY: initialScaleY,
      }}
      animate={{
        left: centerX,
        top: centerY,
        scaleX: scale,
        scaleY: scale,
        rotate: 0,
      }}
      exit={{
        left: initialX + 9,
        top: initialY - 1,
        scaleX: initialScaleX,
        scaleY: initialScaleY,
        rotate: 3,
      }}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 30,
      }}
    >
      <Book
        ref={bookRef}
        pageWidth={expandedWidth}
        pageHeight={expandedHeight}
        pages={getJournalPages({ copied, onCopyEmail })}
        isExpanded
        disableHover={disableHover}
      />
    </motion.div>
  );
}
