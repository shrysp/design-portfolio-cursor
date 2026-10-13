// From Cameo's playground (apps/playground/src/lib/svg.ts), unchanged.

import { traceFrom, type Drawing } from '@shrysp/cameo';

/**
 * Reading an uploaded SVG down to one outline.
 *
 * The browser does the hard part. An SVG file can describe a shape as a path
 * with arcs, a circle, a rounded rectangle, a polygon, any of them under
 * nested transforms — and the browser already knows how to walk along every
 * one. So each shape is rebuilt in a hidden drawing and sampled along its
 * length, which gives plain points whatever it was written as.
 *
 * The file itself is never put in the page. Only geometry is copied out of it,
 * attribute by attribute, into elements made here: an SVG can carry scripts
 * and event handlers, and an uploaded file is not something to trust.
 */

type Pt = { x: number; y: number };

const NS = 'http://www.w3.org/2000/svg';

/** Shapes, and the attributes that define each one's geometry. */
const GEOMETRY: Record<string, string[]> = {
  path: ['d'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  circle: ['cx', 'cy', 'r'],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
  polygon: ['points'],
  polyline: ['points'],
};

/** Containers worth looking inside. Not defs, masks or symbols: those are not drawn as they stand. */
const GROUPS = new Set(['svg', 'g', 'a']);

const MAX_BYTES = 2_000_000;
const MAX_SHAPES = 400;
const SAMPLES_PER_SHAPE = 480;

export class SvgError extends Error {}

function copyGeometry(from: Element, into: SVGElement, shapes: SVGGeometryElement[]) {
  for (const child of Array.from(from.children)) {
    const tag = child.localName;
    const transform = child.getAttribute('transform');
    if (GROUPS.has(tag)) {
      const group = document.createElementNS(NS, 'g');
      // A nested <svg> can also move its contents; that is rare enough to leave.
      if (transform && tag !== 'svg') group.setAttribute('transform', transform);
      into.appendChild(group);
      copyGeometry(child, group, shapes);
    } else if (GEOMETRY[tag] && shapes.length < MAX_SHAPES) {
      const shape = document.createElementNS(NS, tag) as SVGGeometryElement;
      for (const name of GEOMETRY[tag]) {
        const value = child.getAttribute(name);
        if (value != null) shape.setAttribute(name, value);
      }
      if (transform) shape.setAttribute('transform', transform);
      into.appendChild(shape);
      shapes.push(shape);
    }
  }
}

/** Points along a shape, in the drawing's own coordinates, split where the pen lifts. */
function sample(shape: SVGGeometryElement): Pt[][] {
  let total = 0;
  try {
    total = shape.getTotalLength();
  } catch {
    return [];
  }
  if (!(total > 0)) return [];
  const matrix = shape.getCTM();
  const step = total / SAMPLES_PER_SHAPE;
  const outlines: Pt[][] = [];
  let current: Pt[] = [];
  let previous: DOMPoint | null = null;
  for (let i = 0; i < SAMPLES_PER_SHAPE; i++) {
    const p = shape.getPointAtLength(i * step);
    // Walking a path with several pieces, the point jumps from the end of one
    // to the start of the next — much further than a step along a line.
    if (previous && Math.hypot(p.x - previous.x, p.y - previous.y) > step * 4) {
      outlines.push(current);
      current = [];
    }
    previous = p;
    const q = matrix ? p.matrixTransform(matrix) : p;
    current.push({ x: q.x, y: q.y });
  }
  outlines.push(current);
  return outlines;
}

function size(points: Pt[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}

// Just the contents of a path's `d`, which is what copying a single path gives
// in some tools: starts with a moveto, and is only path commands and numbers.
const BARE_PATH = /^[Mm][\sMmLlHhVvCcSsQqTtAaZz\d.,+\-eE]+$/;

/** Whether pasted text is something this can read, as opposed to an ordinary paste. */
export function looksLikeSvg(text: string): boolean {
  const trimmed = text.trim();
  return /<svg[\s>]/i.test(trimmed) || (trimmed.length > 8 && BARE_PATH.test(trimmed));
}

/**
 * The drawing to make a head from: the largest closed shape in the SVG,
 * joined with whatever touches it, and the screen drawn inside it if any.
 * Throws an SvgError, with a message fit to show, if there isn't one.
 */
export function readSvgDrawing(source: string): Drawing {
  if (source.length > MAX_BYTES) throw new SvgError('That is too large. Try an SVG under 2 MB.');
  const trimmed = source.trim();
  // A bare path is given the wrapper it would have had. It holds only path
  // characters, so there is nothing in it to escape.
  const text = BARE_PATH.test(trimmed) ? `<svg xmlns="${NS}"><path d="${trimmed}"/></svg>` : trimmed;
  const parsed = new DOMParser().parseFromString(text, 'image/svg+xml');
  const root = parsed.documentElement;
  if (root.localName !== 'svg' || parsed.querySelector('parsererror')) {
    throw new SvgError('That does not look like SVG.');
  }

  const stage = document.createElementNS(NS, 'svg');
  // Present in the page, since nothing can be measured otherwise, but unseen.
  stage.setAttribute('width', '0');
  stage.setAttribute('height', '0');
  stage.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
  const shapes: SVGGeometryElement[] = [];
  copyGeometry(root, stage, shapes);
  document.body.appendChild(stage);

  try {
    const canvas = root.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
    const outlines = shapes
      .flatMap((shape) =>
        sample(shape).map((points) => ({ points, backdrop: shape.localName === 'rect' })),
      )
      .filter(({ points, backdrop }) => {
        if (points.length < 3) return false;
        // An exported file often starts with a rectangle the size of the whole
        // canvas. It is the largest shape in the file and never the drawing.
        if (!backdrop || canvas?.length !== 4) return true;
        const { width, height } = size(points);
        return width < canvas[2] * 0.98 || height < canvas[3] * 0.98;
      })
      .map(({ points }) => points);
    if (!outlines.length) throw new SvgError('There is no shape in that SVG to use.');
    try {
      return traceFrom(outlines);
    } catch {
      throw new SvgError('There is no closed shape in that SVG to use.');
    }
  } finally {
    stage.remove();
  }
}
