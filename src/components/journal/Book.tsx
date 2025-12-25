"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from "react";



type BookPage = {
    front: React.ReactNode;
    back: React.ReactNode;
  };

export interface BookHandle {
  resetTocover: () => Promise<void>;
  getCurrentPage: () => number;
}

interface BookProps {
  pages: BookPage[];
  pageWidth?: number;
  pageHeight?: number;
  isOpen?: boolean;
  isExpanded?: boolean; // Controls whether page flipping is allowed
  onPageChange?: (page: number) => void;
}

const Book = forwardRef<BookHandle, BookProps>(function Book({
  pages,
  pageWidth = 360,
  pageHeight = 480,
  isOpen = true,
  isExpanded = true,
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

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    resetTocover,
    getCurrentPage: () => currentPage,
  }), [resetTocover, currentPage]);

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
        transformStyle: 'preserve-3d'
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
        const zIndex = hasSwapped
          ? index               // left stack: low z -> high
          : total - index;      // right stack: high z -> low

        return (
          <motion.div
            key={index}
            className="absolute top-0 left-0 w-full h-full cursor-pointer origin-left rounded-l-lg rounded-r-2xl"
            style={{ 
              zIndex,
              transformStyle: 'preserve-3d'
            }}
            animate={{
              rotateY: isFlipped ? -180 : 0,
              translateX:
                currentPage === 0
                  ? 0
                  : currentPage === total
                  ? pageWidth
                  : pageWidth / 2,
                    transition: {
                      duration: 0.4,
                      ease: [0.645, 0.045, 0.355, 1],
                    },
            }}
            whileHover={isExpanded && !isResetting ? {
              rotateY: isFlipped ? -170 : -10, // Peek lift in flip direction
              transition: { duration: 0.3, ease: "easeOut" },
            } : {}}
            onClick={() => {
              if (!isOpen || !isExpanded || isResetting) return;
              if (isFlipped) {
                // Flipped page clicked → flip it back
                beginUnflip(index);
              } else {
                // Unflipped page clicked → flip it forward
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
              className="absolute inset-0 rounded-l-lg rounded-r-2xl overflow-hidden shadow-md shadow-black/5 select-none font-handwriting"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg) translateZ(0.1px)',
                transformStyle: 'preserve-3d',
                willChange: 'transform'
              }}
            >
              {page.front}
            </div>

            {/* BACK (left side) */}
            <div 
              className="absolute inset-0 rounded-l-2xl rounded-r-lg overflow-hidden shadow-md shadow-black/[0.02] select-none font-handwriting"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg) translateZ(0.1px)',
                transformStyle: 'preserve-3d',
                willChange: 'transform'
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
