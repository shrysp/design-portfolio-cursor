"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IconArrowsOppositeDirectionX } from "nucleo-micro-bold-essential";

interface CompareSliderProps {
  /** Shown on the left of the handle */
  before: { src: string; alt: string };
  /** Shown on the right of the handle */
  after: { src: string; alt: string };
}

// Two versions of the same picture with a handle to drag between them
export default function CompareSlider({ before, after }: CompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(50);

  useEffect(() => {
    if (!isDragging) return;

    const move = (event: MouseEvent | TouchEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const box = container.getBoundingClientRect();
      const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
      setPosition(Math.max(0, Math.min(((clientX - box.left) / box.width) * 100, 100)));
    };
    const stop = () => setIsDragging(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
    };
  }, [isDragging]);

  const startDrag = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  return (
    <div ref={containerRef} className="isolate relative surface bg-stone-100 my-3">
      <div className="relative w-full bg-white aspect-4/3">
        <Image src={after.src} alt={after.alt} fill className="object-cover" sizes="(min-width: 672px) 672px, 100vw" quality={90} />

        {/* The "before" picture, clipped to the left of the handle */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <Image src={before.src} alt={before.alt} fill className="object-cover" sizes="(min-width: 672px) 672px, 100vw" quality={90} />
        </div>

        <div
          className="absolute top-0 bottom-0 w-[2px] bg-linear-to-r from-slate-800/50 to-slate-100/50 cursor-ew-resize flex items-center justify-center z-10"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <div className="aqua md:w-[24px] md:px-3 px-2">
            <div className="size-6 flex items-center justify-center p-1">
              <IconArrowsOppositeDirectionX size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
