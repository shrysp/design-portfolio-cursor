"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from "react";

// Hook to detect if device supports hover (non-touch)
function useCanHover() {
  const [canHover, setCanHover] = useState(false);
  
  useEffect(() => {
    // Check if the device supports hover (not a touch-only device)
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setCanHover(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return canHover;
}

type BookPage = {
    front: React.ReactNode;
    back: React.ReactNode;
  };

export interface BookHandle {
  resetTocover: () => Promise<void>;
  getCurrentPage: () => number;
  getTotalPages: () => number;
  flipNext: () => void;
  flipPrev: () => void;
}

interface BookProps {
  pages: BookPage[];
  pageWidth?: number;
  pageHeight?: number;
  isOpen?: boolean;
  isExpanded?: boolean; // Controls whether page flipping is allowed
  disableHover?: boolean; // Disable hover effects (e.g., during keyboard navigation)
  onPageChange?: (page: number) => void;
}

const Book = forwardRef<BookHandle, BookProps>(function Book({
  pages,
  pageWidth = 360,
  pageHeight = 480,
  isOpen = true,
  isExpanded = true,
  disableHover = false,
  onPageChange,
}, ref) {
  // currentPage = how many pages have been flipped (triggers rotation)
  const [currentPage, setCurrentPage] = useState(0);
  
  // Track which pages have passed the halfway point (for z-index swap)
  const [zIndexSwapped, setZIndexSwapped] = useState<boolean[]>(
    () => pages.map(() => false)
  );

  // Track if we're currently resetting
  const [isResetting, setIsResetting] = useState(false);
  
  // Only enable hover effects on non-touch devices
  const canHover = useCanHover();

  
  const total = pages.length;

  // Derive container width based on open/closed state
  const containerWidth = pageWidth;

  // Notify parent of page changes
  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  // Reset to cover page with animation
  const resetTocover = useCallback(async (): Promise<void> => {
    if (currentPage === 0) return Promise.resolve();
    
    setIsResetting(true);
    
    // Flip back one page at a time with delay
    return new Promise((resolve) => {
      let page = currentPage;
      const flipInterval = setInterval(() => {
        if (page > 0) {
          page--;
          setCurrentPage(page);
          setZIndexSwapped((prev) => {
            const copy = [...prev];
            copy[page] = true; // Set swap flag for unflipping
            return copy;
          });
        } else {
          clearInterval(flipInterval);
          setIsResetting(false);
          // Give time for the last flip animation to complete
          setTimeout(resolve, 400);
        }
      }, 150); // Stagger flips for nice effect
    });
  }, [currentPage]);

  // Whenever the book closes, reset flipped state so it returns to cover
  useEffect(() => {
    if (!isOpen) {
      setCurrentPage(0);
      setZIndexSwapped(pages.map(() => false));
    }
  }, [isOpen, pages]);

  // Flip forward: page goes from right stack to left stack
  const beginFlip = (index: number) => {
    setCurrentPage((prev) => prev + 1);
    // Ensure swap flag is false so it swaps at -90°
    setZIndexSwapped((prev) => {
      const copy = [...prev];
      copy[index] = false;
      return copy;
    });
  };

  // Flip backward: page goes from left stack back to right stack
  const beginUnflip = (index: number) => {
    setCurrentPage((prev) => prev - 1);
    // Ensure swap flag is true so it swaps back at -90°
    setZIndexSwapped((prev) => {
      const copy = [...prev];
      copy[index] = true;
      return copy;
    });
  };

  // Keyboard navigation: flip to next page
  const flipNext = useCallback(() => {
    if (!isExpanded || isResetting || currentPage >= total) return;
    beginFlip(currentPage);
  }, [isExpanded, isResetting, currentPage, total]);

  // Keyboard navigation: flip to previous page
  const flipPrev = useCallback(() => {
    if (!isExpanded || isResetting || currentPage <= 0) return;
    beginUnflip(currentPage - 1);
  }, [isExpanded, isResetting, currentPage]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    resetTocover,
    getCurrentPage: () => currentPage,
    getTotalPages: () => total,
    flipNext,
    flipPrev,
  }), [resetTocover, currentPage, total, flipNext, flipPrev]);

  const setSwapped = (index: number, value: boolean) => {
    setZIndexSwapped((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };


  return (
    <motion.div
      className="relative mx-auto"
      style={{ 
        height: pageHeight,
        width: containerWidth,
        perspective: '2000px',
        perspectiveOrigin: 'center center',
        transformStyle: 'preserve-3d',
        WebkitTransformStyle: 'preserve-3d',
        touchAction: 'pan-y', // Allow vertical scroll but enable touch on pages
      }}
      animate={{
        width: containerWidth,
        // translateX:
        //   currentPage === 0
        //     ? 0
        //     : currentPage === total
        //     ? pageWidth
        //     : pageWidth / 2,
      }}
      transition={{
        duration: 0.25,
        ease: [0.215, 0.61, 0.355, 1], // ease-out-cubic per animation rules
      }}
    >
      {pages.map((page, index) => {
        const isFlipped = index < currentPage;
        const hasSwapped = zIndexSwapped[index];

        // ------- Z-INDEX based on hasSwapped (not isFlipped!) -------
        // Only move to left stack z-index after halfway point
        // Use large offset to ensure proper stacking on mobile
        // For LEFT stack (flipped): higher index = flipped more recently = should be on TOP
        // For RIGHT stack (unflipped): lower index = top of stack
        const zIndex = hasSwapped
          ? 1000 + index * 10     // left stack: 1000, 1010, 1020... (more recent = higher)
          : 2000 + (total - index) * 10; // right stack: top of unflipped stack has highest z

        return (
          <motion.div
            key={index}
            className="absolute top-0 left-0 w-full h-full cursor-pointer origin-left rounded-l-lg rounded-r-2xl"
            style={{ 
              zIndex,
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
              touchAction: 'manipulation', // Allow taps but prevent double-tap zoom
              pointerEvents: 'auto',
            }}
            animate={{
              rotateY: isFlipped ? -180 : 0,
              translateX:
                currentPage === 0
                  ? 0
                  : currentPage === total
                  ? pageWidth
                  : pageWidth / 2,
            }}
            transition={{
              duration: 0.4,
              ease: [0.645, 0.045, 0.355, 1],
            }}
            whileHover={canHover && isExpanded && !isResetting && !disableHover ? {
              rotateY: isFlipped ? -165 : -15, // Peek lift in flip direction
              transition: { duration: 0.3, ease: "easeOut" },
            } : undefined}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOpen || !isExpanded || isResetting) return;
              if (isFlipped) {
                beginUnflip(index);
              } else {
                beginFlip(index);
              }
            }}
            onUpdate={(latest) => {
              const rotateY =
                typeof latest.rotateY === "string"
                  ? parseFloat(latest.rotateY)
                  : (latest.rotateY as number);
              
              // Forward flip: swap at -90° (going from 0 to -180)
              if (isFlipped && !hasSwapped && rotateY <= -90) {
                setSwapped(index, true);
              }
              // Reverse flip: swap back at -90° (going from -180 to 0)
              if (!isFlipped && hasSwapped && rotateY >= -90) {
                setSwapped(index, false);
              }
            }}
          >
            {/* FRONT (right side) */}
            <div 
              className="absolute inset-0 rounded-l-lg rounded-r-2xl overflow-hidden shadow-md shadow-black/5 select-none font-handwriting pointer-events-none"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg) translateZ(0.1px)',
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                willChange: 'transform',
              }}
            >
              {page.front}
            </div>

            {/* BACK (left side) */}
            <div 
              className="absolute inset-0 rounded-l-2xl rounded-r-lg overflow-hidden shadow-md shadow-black/[0.02] select-none font-handwriting pointer-events-none"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg) translateZ(0.1px)',
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                willChange: 'transform',
              }}
            >
              {page.back}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
});

export default Book;
