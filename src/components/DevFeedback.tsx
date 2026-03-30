"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function DevFeedback() {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    import("agentation").then((mod) => setComponent(() => mod.Agentation));
  }, []);

  if (!Component) return null;
  return createPortal(<Component />, document.body);
}
