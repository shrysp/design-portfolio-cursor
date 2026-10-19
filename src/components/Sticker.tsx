"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/lib/easing";

// A sticker slapped down: it drops in a touch large, askew and out of focus,
// then settles flat. Each comes in at its own slight angle, taken from its picture so the
// server and the browser agree on it.

/** Seconds a sticker takes to land */
export const STICKER_ARRIVE = 0.3;

// Where a sticker ends up once it has landed
const LANDED = { scale: 1, rotate: 0, opacity: 1, y: 0, filter: "blur(0px)" };
// How quickly it gets there when told to stop taking its time
const FINISH_NOW = { duration: 0.15, ease: "easeOut" as const };

// Up to 4 degrees either way
function tiltFor(src: string) {
  let hash = 0;
  for (let i = 0; i < src.length; i++) hash = (Math.imul(hash, 31) + src.charCodeAt(i)) | 0;
  return ((Math.abs(hash) % 81) - 40) / 10;
}

interface StickerProps {
  src: string;
  alt: string;
  /** Sizing classes for the image, as they would go on a plain <img> */
  imgClassName: string;
  /** Seconds to wait before it lands, counted from when its image has loaded */
  delay?: number;
  /** Already down: no animation. Made instant partway through (the visitor
      scrolled away), it finishes straight away instead of waiting its turn. */
  instant?: boolean;
}

export default function Sticker({ src, alt, imgClassName, delay = 0, instant = false }: StickerProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const reduceMotion = useReducedMotion();
  const entrance = useAnimationControls();

  // The image may have finished loading before React attached onLoad
  useEffect(() => {
    if (imageRef.current?.complete) setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (instant) entrance.start(LANDED, FINISH_NOW);
    else if (isLoaded)
      entrance.start(LANDED, {
        duration: STICKER_ARRIVE,
        ease: EASE_OUT,
        delay,
        // With reduced motion it only fades in, already flat
        ...(reduceMotion && { scale: { duration: 0 }, rotate: { duration: 0 }, y: { duration: 0 } }),
      });
  }, [isLoaded, instant, delay, reduceMotion, entrance]);

  return (
    <motion.div
      className="relative"
      // A slight blur, the same the page's sections come in with, so it comes into focus as it lands
      initial={instant ? LANDED : { scale: 1.06, rotate: tiltFor(src), opacity: 0, y: -12, filter: "blur(4px)" }}
      animate={entrance}
    >
      <img ref={imageRef} src={src} alt={alt} onLoad={() => setIsLoaded(true)} className={imgClassName} />
    </motion.div>
  );
}
