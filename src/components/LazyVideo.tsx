"use client";

import { useRef, useEffect, useState } from "react";

interface LazyVideoProps {
  src: string;
  /** Still frame shown until the video has loaded */
  poster?: string;
  className?: string;
}

// Loads the video shortly before it scrolls into view and only plays it while
// it's on screen, so a page of clips isn't decoding all of them at once.
export default function LazyVideo({ src, poster, className }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const loader = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          loader.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    const viewer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });

    loader.observe(el);
    viewer.observe(el);
    return () => {
      loader.disconnect();
      viewer.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !shouldLoad) return;
    if (inView) el.play().catch(() => {});
    else el.pause();
  }, [shouldLoad, inView]);

  return (
    <video
      ref={ref}
      src={shouldLoad ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      disablePictureInPicture
      controlsList="nodownload nofullscreen noremoteplayback"
      preload="none"
      className={className}
    />
  );
}
