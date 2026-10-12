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
  // Lets the stylesheet tell a page change from an image being enlarged
  document.documentElement.dataset.vt = "route";
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
    delete document.documentElement.dataset.vt;
    endListeners.forEach((listener) => listener());
  });
}

/**
 * Morphs one element into another across a state change on the same page:
 * a figure into its enlarged view and back. Whichever element carries
 * `data-zoom-active` before `update` runs becomes the one carrying it after.
 * `update` must apply its change synchronously (flushSync).
 */
export function startZoomTransition(update: () => void) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("startViewTransition" in document) || reduceMotion || active) {
    update();
    return;
  }

  document.documentElement.dataset.vt = "zoom";
  const transition = document.startViewTransition(update);
  // If the browser can't run the morph it still applies the change; there's
  // nothing to report
  transition.ready.catch(() => {});
  transition.finished.catch(() => {}).finally(() => {
    delete document.documentElement.dataset.vt;
    document.querySelectorAll("[data-zoom-active='figure']").forEach((el) => el.removeAttribute("data-zoom-active"));
  });
}
