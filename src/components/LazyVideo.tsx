"use client";

import { useRef, useEffect, useState } from "react";

interface LazyVideoProps {
  src: string;
  className?: string;
}

export default function LazyVideo({ src, className }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={isVisible ? src : undefined}
      autoPlay={isVisible}
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
