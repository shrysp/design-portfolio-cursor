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

// The transition on screen now. A click mid-transition starts a new one, which
// cuts the old one short; only the newest may tidy up when it ends.
let current: ViewTransition | null = null;

export function startRouteTransition(navigate: () => void) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("startViewTransition" in document) || reduceMotion) {
    navigate();
    return;
  }

  // The one being cut short stops waiting for its page, rather than holding
  // on until its timeout and ending in the middle of this one
  routeSettled();

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

  current = transition;

  // A transition cut short rejects `ready`; that's expected, not an error
  transition.ready.catch(() => {});
  transition.finished.catch(() => {}).finally(() => {
    if (current !== transition) return;
    current = null;
    active = false;
    delete document.documentElement.dataset.vt;
    endListeners.forEach((listener) => listener());
  });
}

// Matches the zoom-image group's duration in globals.css
const ZOOM_DURATION = 380;

// The corner radius an element is seen with: its own, or that of a wrapper of
// the same size that clips it (a figure's picture is square, its card rounds it)
function visibleRadius(element: Element | null) {
  for (let node = element, depth = 0; node && depth < 3; node = node.parentElement, depth++) {
    const radius = parseFloat(getComputedStyle(node).borderTopLeftRadius) || 0;
    if (radius > 0) return radius;
    const box = node.getBoundingClientRect();
    const outer = node.parentElement?.getBoundingClientRect();
    if (!outer || Math.abs(outer.width - box.width) > 2 || Math.abs(outer.height - box.height) > 2) break;
  }
  return 0;
}

/**
 * Morphs one element into another across a state change on the same page:
 * a figure into its enlarged view and back. Whichever element carries
 * `data-zoom-active` before `update` runs becomes the one carrying it after.
 * `update` must apply its change synchronously (flushSync).
 *
 * `dissolve` is for two ends that aren't the same picture (a tile's recording
 * and the prototype it opens): each blurs as it fades, so one melts into the
 * other instead of the two showing through each other.
 */
export function startZoomTransition(update: () => void, { dissolve = false } = {}) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // A morph already under way is left to finish: starting another would cut it
  // short, and the picture would snap into place
  const isBusy = active || document.documentElement.dataset.vt !== undefined;
  if (!("startViewTransition" in document) || reduceMotion || isBusy) {
    update();
    return;
  }

  const root = document.documentElement;
  root.dataset.vt = "zoom";
  const from = document.querySelector("[data-zoom-active]");
  // Lets the stylesheet slide the dock away as a figure opens. On the way back
  // the dock slides up by itself once the enlarged view is gone.
  if (from?.getAttribute("data-zoom-active") === "figure") root.dataset.vtZoom = "open";
  if (dissolve) root.dataset.vtDissolve = "";
  const fromRadius = visibleRadius(from);
  let toRadius = fromRadius;
  const transition = document.startViewTransition(() => {
    update();
    toRadius = visibleRadius(document.querySelector("[data-zoom-active]"));
  });
  // If the browser can't run the morph it still applies the change; there's
  // nothing to report
  transition.ready
    .then(() => {
      // When one end is rounded and the other square, the moving frame eases
      // its corners from one to the other rather than snapping at the start
      if (fromRadius === toRadius || (fromRadius > 0 && toRadius > 0)) return;
      root.animate(
        { clipPath: [`inset(0 round ${fromRadius}px)`, `inset(0 round ${toRadius}px)`] },
        { duration: ZOOM_DURATION, easing: "ease", fill: "both", pseudoElement: "::view-transition-group(zoom-image)" }
      );
    })
    .catch(() => {});
  transition.finished.catch(() => {}).finally(() => {
    // A page change started meanwhile owns the flag now
    if (root.dataset.vt === "zoom") delete root.dataset.vt;
    delete root.dataset.vtZoom;
    delete root.dataset.vtDissolve;
    document.querySelectorAll("[data-zoom-active='figure']").forEach((el) => el.removeAttribute("data-zoom-active"));
  });
}

/**
 * Morphs the page from one arrangement into another: a layout switching, or a
 * grid changing how many columns it has. Every named piece travels to its new
 * place. `update` must apply its change synchronously (flushSync).
 */
export function startLayoutTransition(update: () => void) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("startViewTransition" in document) || reduceMotion || active || document.documentElement.dataset.vt) {
    update();
    return;
  }

  const transition = document.startViewTransition(update);
  transition.ready.catch(() => {});
  transition.finished.catch(() => {});
}
