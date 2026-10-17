// Moves a figure's status tag to its next stop. The stop is a percentage of the
// figure, so the tag is placed there at once, then slid in from where it was
// drawn with a transform: one layout per move, not one per frame of the glide.
// A move that comes mid-glide starts from wherever the tag is on screen.

const GLIDE = { duration: 500, easing: "cubic-bezier(0.32, 0.72, 0, 1)" };

export function moveTag(tag: HTMLElement, place: { left: string; top: string }) {
  if (tag.style.left === place.left && tag.style.top === place.top) return;
  const before = tag.getBoundingClientRect();
  tag.getAnimations().forEach((animation) => animation.cancel());
  tag.style.left = place.left;
  tag.style.top = place.top;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const after = tag.getBoundingClientRect();
  const dx = before.left - after.left;
  const dy = before.top - after.top;
  if (!dx && !dy) return;
  tag.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], GLIDE);
}
