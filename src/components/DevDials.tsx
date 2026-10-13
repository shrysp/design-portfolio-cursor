"use client";

import { DialRoot } from "dialkit";
import "dialkit/styles.css";

// The DialKit panel, for tuning values live while something is being designed.
// Development only; components read their defaults without it.
export default function DevDials() {
  if (process.env.NODE_ENV !== "development") return null;
  return <DialRoot position="top-right" />;
}
