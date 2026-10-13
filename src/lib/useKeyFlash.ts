"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Lets a keyboard shortcut show on its on-screen button: `flash(name)` marks
// that button as pressed for a moment, the way a click would.
export function useKeyFlash<Name extends string>(holdMs = 180) {
  const [pressed, setPressed] = useState<Name | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flash = useCallback(
    (name: Name) => {
      clearTimeout(timer.current);
      setPressed(name);
      timer.current = setTimeout(() => setPressed(null), holdMs);
    },
    [holdMs]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return [pressed, flash] as const;
}
