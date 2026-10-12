"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";

// A sticker being stuck down, the way the name sticker goes onto the journal:
// it drops in held by one edge with the rest curled up off the surface, then
// is pressed flat across. The picture is cut into thin strips hinged to one
// another so it can curl. Each sticker curls a little differently: every strip
// bends by its own amount, and the edge it's held by sits at its own angle.
export const STICK_ON_DEFAULTS = {
  arrive: 0.2,
  press: 0.9,
  strips: 24,
  // The most a strip bends up from the one before it, in degrees
  curlPerStrip: 7,
  // Each strip bends by a random share of that, between these two
  curlMin: 0.4,
  curlMax: 0.6,
  // The held edge is turned by up to this many degrees either way
  angleRange: 20,
};

// A small seeded generator, so the server and the browser draw the same sticker
function seededRandom(seed: string) {
  let state = 2166136261;
  for (let i = 0; i < seed.length; i++) state = Math.imul(state ^ seed.charCodeAt(i), 16777619);
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

interface Curl {
  src: string;
  /** How far each strip bends up from the one before it, in degrees */
  bends: number[];
  /** The angle of the held edge, in degrees */
  angle: number;
  /** The picture's size as a share of the tilted stage the strips are cut from */
  pictureWidth: number;
  pictureHeight: number;
}

// How far strip `index` is still lifted (1) or pressed down (0). Strips go
// down one after another, like a thumb running along the sticker.
function stripLift(index: number, progress: number, strips: number) {
  return Math.min(Math.max(index + 1 - progress * (strips + 1), 0), 1);
}

function Strip({ index, progress, curl }: { index: number; progress: MotionValue<number>; curl: Curl }) {
  const strips = curl.bends.length;
  const rotateY = useTransform(progress, (value) => -stripLift(index, value, strips) * curl.bends[index]);
  // A strip darkens the further it has curled away from the light
  const filter = useTransform(progress, (value) => {
    let angle = 0;
    for (let strip = 0; strip <= index; strip++) angle += stripLift(strip, value, strips) * curl.bends[strip];
    return `brightness(${1 - 0.35 * Math.sin((Math.min(angle, 90) * Math.PI) / 180)})`;
  });
  const isLast = index === strips - 1;

  return (
    <motion.div
      className="absolute top-0 h-full"
      style={{
        // The first strip is a slice of the stage; each later one matches the strip it hangs off
        left: index === 0 ? 0 : "100%",
        width: index === 0 ? `${100 / strips}%` : "100%",
        transformOrigin: "left center",
        transformStyle: "preserve-3d",
        rotateY,
      }}
    >
      {/* A window onto the picture, a pixel wider than the strip so no gap
          shows before the next one */}
      <motion.div className="absolute inset-y-0 left-0 overflow-hidden" style={{ right: isLast ? 0 : -1, filter }}>
        {/* The whole stage, slid so this strip's slice sits in the window */}
        <div className="absolute inset-y-0" style={{ left: `${-index * 100}%`, width: `${strips * 100}%` }}>
          {/* The picture, turned back upright within the tilted stage */}
          <div
            className="absolute left-1/2 top-1/2 bg-no-repeat"
            style={{
              width: `${curl.pictureWidth * 100}%`,
              height: `${curl.pictureHeight * 100}%`,
              transform: `translate(-50%, -50%) rotate(${-curl.angle}deg)`,
              backgroundImage: `url("${curl.src}")`,
              backgroundSize: "100% 100%",
            }}
          />
        </div>
      </motion.div>
      {!isLast && <Strip index={index + 1} progress={progress} curl={curl} />}
    </motion.div>
  );
}

interface StickOnStickerProps {
  src: string;
  alt: string;
  /** Width / height of the image file */
  aspect: number;
  /** Sizing classes for the image, as they would go on a plain <img> */
  imgClassName: string;
  /** Seconds to wait before it goes on, counted from when its image has loaded */
  delay?: number;
  /** Already stuck down: no animation */
  instant?: boolean;
  /** Seconds it takes to drop in */
  arrive?: number;
  /** Seconds it takes to be pressed flat */
  press?: number;
  strips?: number;
  curlPerStrip?: number;
  curlMin?: number;
  curlMax?: number;
  angleRange?: number;
  /** Changes the random curl and angle; the same seed always gives the same sticker */
  seed?: string | number;
}

export default function StickOnSticker({
  src,
  alt,
  aspect,
  imgClassName,
  delay = 0,
  instant = false,
  arrive = STICK_ON_DEFAULTS.arrive,
  press = STICK_ON_DEFAULTS.press,
  strips = STICK_ON_DEFAULTS.strips,
  curlPerStrip = STICK_ON_DEFAULTS.curlPerStrip,
  curlMin = STICK_ON_DEFAULTS.curlMin,
  curlMax = STICK_ON_DEFAULTS.curlMax,
  angleRange = STICK_ON_DEFAULTS.angleRange,
  seed = 0,
}: StickOnStickerProps) {
  // This sticker's own curl and angle, drawn from its seed
  const curl = useMemo<Curl & { tilt: number }>(() => {
    const random = seededRandom(`${src}:${seed}`);
    const angle = (random() * 2 - 1) * angleRange;
    const tilt = (random() * 2 - 1) * 4;
    const bends = Array.from({ length: strips }, () => curlPerStrip * (curlMin + random() * (curlMax - curlMin)));
    // The strips are cut from a stage turned to that angle, just big enough to hold the picture
    const cos = Math.abs(Math.cos((angle * Math.PI) / 180));
    const sin = Math.abs(Math.sin((angle * Math.PI) / 180));
    return { src, bends, angle, tilt, pictureWidth: 1 / (cos + sin / aspect), pictureHeight: 1 / (sin * aspect + cos) };
  }, [src, seed, aspect, strips, curlPerStrip, curlMin, curlMax, angleRange]);

  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasLanded, setHasLanded] = useState(instant);
  // 0 = held by its left edge with the rest curled up, 1 = pressed flat
  const progress = useMotionValue(instant ? 1 : 0);

  // The image may have finished loading before React attached onLoad
  useEffect(() => {
    if (imageRef.current?.complete) setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || instant) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      progress.set(1);
      setHasLanded(true);
      return;
    }
    const controls = animate(progress, 1, {
      duration: press,
      delay: delay + arrive * 0.5,
      ease: [0.3, 0, 0.2, 1],
      onComplete: () => setHasLanded(true),
    });
    return () => controls.stop();
  }, [isLoaded, instant, delay, arrive, press, progress]);

  return (
    <motion.div
      className="relative"
      initial={instant ? false : { scale: 1.08, rotate: curl.tilt, opacity: 0, y: -14 }}
      animate={isLoaded || instant ? { scale: 1, rotate: 0, opacity: 1, y: 0 } : {}}
      transition={{ type: "tween", ease: "easeOut", duration: arrive, delay }}
    >
      {/* Always present so the sticker keeps its size; hidden while the strips stand in for it */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`${imgClassName} ${hasLanded ? "" : "opacity-0"}`}
      />
      {/* The strips are drawn in the browser only, once the image is in: the
          server has nothing to show yet, and rendering them there made the
          two disagree over how the same numbers are written out */}
      {isLoaded && !hasLanded && (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          {/* The picture's own rectangle inside the image box (it is object-contain) */}
          <div
            className="relative max-w-full max-h-full"
            style={{ aspectRatio: aspect, perspective: 900, ...(aspect >= 1 ? { width: "100%" } : { height: "100%" }) }}
          >
            {/* The stage the strips are cut from, turned to this sticker's angle */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: `${100 / curl.pictureWidth}%`,
                height: `${100 / curl.pictureHeight}%`,
                transform: `translate(-50%, -50%) rotate(${curl.angle}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <Strip index={0} progress={progress} curl={curl} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
