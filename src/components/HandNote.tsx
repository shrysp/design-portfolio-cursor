"use client";

import { useEffect, useState } from "react";
import { TegakiRenderer } from "tegaki/react";
import indieFlower from "@/fonts/indie-flower-tegaki/bundle";

interface HandNoteProps {
  children: string;
  /** Seconds to wait before the pen starts */
  delay?: number;
  /** Playback speed; 1 is the font's natural writing pace */
  speed?: number;
  /** Already written: no animation */
  instant?: boolean;
  className?: string;
}

// A note that writes itself out stroke by stroke (Tegaki). It draws on a canvas
// over real text, so it only mounts in the browser.
export default function HandNote({ children, delay = 0, speed = 1, instant = false, className }: HandNoteProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) {
    // Holds the note's place, and keeps the words there for search engines and screen readers
    return <span className={`${className ?? ""} invisible`}>{children}</span>;
  }

  return (
    <TegakiRenderer
      font={indieFlower}
      className={className}
      time={instant ? "100%" : { mode: "uncontrolled", delay, speed }}
      reducedMotion="user"
    >
      {children}
    </TegakiRenderer>
  );
}
