"use client";

import { forwardRef, type ReactNode, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: ReactNode;
  /** Backdrop blur in px */
  blur?: number;
  /** Backdrop saturation, 1 = unchanged */
  saturate?: number;
  /** How milky the glass is, 0 to 1 */
  tint?: number;
  /** How far the rim bends the page behind it, in px. 0 switches bending off. */
  refraction?: number;
  /** Width of the bending rim in px */
  bezel?: number;
  /** A fixed id for the bending filter, for when CSS elsewhere has to point at it */
  filterId?: string;
}

// Bending the backdrop needs an SVG filter inside backdrop-filter, which only
// Chromium draws. Everywhere else the glass keeps its blur and rim light.
export const canRefract = () => typeof navigator !== "undefined" && /Chrome\//.test(navigator.userAgent);

// A displacement map for a capsule lens: red pushes along x, green along y, and
// the flat middle is neutral so only the rim bends.
function lensMap(width: number, height: number, bezel: number) {
  const radius = Math.max(0, Math.min(width, height) / 2 - bezel);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
<linearGradient id="x" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#f00"/><stop offset="1" stop-color="#000"/></linearGradient>
<linearGradient id="y" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0f0"/><stop offset="1" stop-color="#000"/></linearGradient>
<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${bezel / 2}"/></filter>
</defs>
<rect width="${width}" height="${height}" fill="#000"/>
<rect width="${width}" height="${height}" fill="url(#x)"/>
<rect width="${width}" height="${height}" fill="url(#y)" style="mix-blend-mode:screen"/>
<rect x="${bezel}" y="${bezel}" width="${Math.max(0, width - bezel * 2)}" height="${Math.max(0, height - bezel * 2)}" rx="${radius}" fill="#808000" filter="url(#soft)"/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const Glass = forwardRef<HTMLDivElement, GlassProps>(function Glass(
  { blur = 10, saturate = 1.6, tint = 0.5, refraction = 28, bezel = 10, filterId: fixedFilterId, className, style, children, ...props },
  forwardedRef
) {
  const ref = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);

  const generatedId = `glass-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const filterId = fixedFilterId ?? generatedId;
  const [map, setMap] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || refraction === 0 || !canRefract()) {
      setMap(null);
      return;
    }

    // The map is stretched to the capsule while it resizes and redrawn once it settles
    let timer: ReturnType<typeof setTimeout>;
    const draw = () => setMap(lensMap(Math.round(el.offsetWidth), Math.round(el.offsetHeight), bezel));
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(draw, 120);
    });
    draw();
    observer.observe(el);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [refraction, bezel]);

  return (
    <motion.div
      ref={ref}
      className={cn("glass", className)}
      style={{
        "--glass-blur": `${blur}px`,
        "--glass-saturate": saturate,
        "--glass-tint": tint,
        ...(map ? { "--glass-refract": `url(#${filterId})` } : null),
        ...style,
      } as GlassProps["style"]}
      {...props}
    >
      {map && (
        <svg aria-hidden width="0" height="0" className="absolute pointer-events-none">
          <filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feImage href={map} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={refraction} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      {children}
    </motion.div>
  );
});

export default Glass;
