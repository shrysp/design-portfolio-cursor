"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function DevFeedback() {
  const [Component, setComponent] = useState<React.ComponentType<{ endpoint?: string }> | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    import("agentation").then((mod) => setComponent(() => mod.Agentation));
  }, []);

  if (!Component) return null;
  // The endpoint sends annotations to the local agentation-mcp server, so the
  // coding agent can read them. Without it they stay in the browser.
  return createPortal(<Component endpoint="http://localhost:4747" />, document.body);
}
