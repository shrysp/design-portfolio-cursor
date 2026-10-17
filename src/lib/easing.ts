// The site's motion curves, for Framer Motion and the Web Animations API. The
// same four are CSS custom properties in globals.css (--curve-*); change both.

type Curve = readonly [number, number, number, number];

/** Things arriving, leaving, or answering a press: fast at once, then settling. */
export const EASE_OUT: Curve = [0.23, 1, 0.32, 1];
/** Long, explanatory moves, where a slower start reads better. */
export const EASE_OUT_GENTLE: Curve = [0.2, 0.8, 0.2, 1];
/** Something moving across the screen, from one place to another. */
export const EASE_IN_OUT: Curve = [0.77, 0, 0.175, 1];
/** A playful pop a little past the mark and back. */
export const EASE_OVERSHOOT: Curve = [0.34, 1.56, 0.64, 1];

/** A curve as a CSS / Web Animations easing string. */
export const css = (curve: Curve) => `cubic-bezier(${curve.join(", ")})`;
