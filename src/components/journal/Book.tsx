"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";



type BookPage = {
    front: React.ReactNode;
    back: React.ReactNode;
  };

interface BookProps {
  pages: BookPage[];
  pageWidth?: number;
  pageHeight?: number;
  isOpen?: boolean;
}

export default function Book({
  pages,
  pageWidth = 300,
  pageHeight = 400,
  isOpen = true,
}: BookProps) {
  // currentPage = how many pages have been flipped (triggers rotation)
  const [currentPage, setCurrentPage] = useState(0);
  
  // Track which pages have passed the halfway point (for z-index swap)
  const [zIndexSwapped, setZIndexSwapped] = useState<boolean[]>(
    () => pages.map(() => false)
  );

  
  const total = pages.length;
  const isCover = currentPage === 0 || currentPage === total;

  // Derive container width based on open/closed state
  const containerWidth = pageWidth;

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
            className="absolute top-0 left-0 w-full h-full cursor-pointer origin-left rounded-l-lg rounded-r-2xl shadow-lg"
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
            whileHover={{
              rotateY: isFlipped ? -170 : -10, // Peek lift in flip direction
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            onClick={() => {
              if (!isOpen) return;
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
              className="absolute inset-0 rounded-l-lg rounded-r-2xl overflow-hidden shadow-xs"
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
              className="absolute inset-0 rounded-l-2xl rounded-r-lg overflow-hidden shadow-xs"
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
}
