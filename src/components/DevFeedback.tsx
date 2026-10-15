"use client";

import { createElement, useEffect } from "react";
import { createRoot } from "react-dom/client";

/**
 * The feedback toolbar, in development only, in a React root of its own.
 *
 * It re-renders about every frame while anything on the page is animating.
 * Inside the app's own root, each of those renders interrupted whatever the
 * app was rendering in the background — the move into the PIP tour among
 * them, whose render was started over every frame and could sit unfinished
 * until something else, like the browser's Back, forced it through. In its
 * own root it can render as often as it likes.
 */
export default function DevFeedback() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    let live = true;
    import("agentation").then((mod) => {
      // The endpoint sends annotations to the local agentation-mcp server, so the
      // coding agent can read them. Without it they stay in the browser.
      if (live) root.render(createElement(mod.Agentation as React.ComponentType<{ endpoint?: string }>, { endpoint: "http://localhost:4747" }));
    });
    return () => {
      live = false;
      // After this commit, not during it: React will not unmount a root mid-render.
      setTimeout(() => {
        root.unmount();
        host.remove();
      });
    };
  }, []);

  return null;
}
