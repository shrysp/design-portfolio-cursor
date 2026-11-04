'use client';

import { useEffect, useRef } from 'react';

/**
 * Runs a timed script once per `run` value: each step fires at its time in milliseconds from the
 * start. Changing `run` (a replay) cancels what is left of the last one and starts again, and a
 * slide that is left mid-script cancels it too.
 */
export function useScript(steps: [number, () => void][], run: number | false) {
  const latest = useRef(steps);
  useEffect(() => {
    latest.current = steps;
  });
  useEffect(() => {
    if (run === false) return;
    const ids = latest.current.map(([at, step], i) => setTimeout(() => (latest.current[i]?.[1] ?? step)(), at));
    return () => ids.forEach(clearTimeout);
  }, [run]);
}

/** The steps of typing a phrase one character at a time, starting at `from` ms */
export function typing(text: string, from: number, set: (value: string) => void, perChar = 55): [number, () => void][] {
  return Array.from(text, (_, i) => [from + i * perChar, () => set(text.slice(0, i + 1))] as [number, () => void]);
}
