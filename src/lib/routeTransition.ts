// Runs a navigation inside a browser view transition, so elements that share a
// view-transition-name on both pages morph into each other. Browsers without
// the API, and visitors who prefer reduced motion, just navigate.

let settle: (() => void) | null = null;

// The project the visitor is coming back from, for the home page to pick up
let returningFrom: string | null = null;

/** Called by a project page just before it navigates home. */
export function markReturningFrom(slug: string) {
  returningFrom = slug;
}

/** The project being returned from, if the home page is being reached that way. */
export function peekReturningFrom() {
  return returningFrom;
}

export function clearReturningFrom() {
  returningFrom = null;
}

// Whether a transition is on screen, and who wants to know when it's over
let active = false;
const endListeners = new Set<() => void>();

export function isRouteTransitioning() {
  return active;
}

/** Runs `listener` each time a page transition finishes. Returns an unsubscribe. */
export function onRouteTransitionEnd(listener: () => void) {
  endListeners.add(listener);
  return () => {
    endListeners.delete(listener);
  };
}

// How long the old page is held while the next one gets ready
const MAX_WAIT = 1500;

/** Called once the new route is on screen. See RouteTransitionSettler. */
export function routeSettled() {
  settle?.();
  settle = null;
}

export function startRouteTransition(navigate: () => void) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("startViewTransition" in document) || reduceMotion) {
    navigate();
    return;
  }

  active = true;
  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, MAX_WAIT);
        settle = () => {
          clearTimeout(timeout);
          resolve();
        };
        navigate();
      })
  );

  transition.finished.finally(() => {
    active = false;
    endListeners.forEach((listener) => listener());
  });
}
