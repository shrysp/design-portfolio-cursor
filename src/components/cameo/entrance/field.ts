/**
 * The light behind the way into the tour: one full-screen fragment shader, in
 * one of two looks (picked in the DialKit "Tour entrance" panel).
 *
 * - `screen`: PIP's own display. The case study collapses to a line and a dot
 *   as a tube switches off, then the tube powers on into the tour's dark room:
 *   a line opening to full height, a phosphor flash, and green light warming
 *   where PIP will wake. The glass itself — scanlines, grille, bezel, glitches —
 *   is CrtLayer, over this and over the tour, so it carries on across the two.
 *   On the way in the photos rush past (LibraryDive) and the room settles on
 *   the stage colour.
 * - `aurora`: an opening grown from the button with a living edge, slow
 *   domain-warped light, and a pulse from PIP on the way in.
 *
 * Both end on the tour's own background, so the route change that follows
 * lands on the same colour and cannot be seen. Plain WebGL 1, no library.
 */

/** The tour stage's dark room (`.tour-stage--dark` in tour.css). */
import { motion } from '../crt/motion';

export const STAGE_BG = '#0b0d10';

export const THEMES = ['screen', 'aurora'] as const;
export type Theme = (typeof THEMES)[number];

export type FieldUniforms = {
  /** aurora: 0 closed → 1 the whole window, grown from `origin`. */
  reveal: number;
  /** aurora: 0 → 1 as the room fills: how bright the aurora is. */
  build: number;
  /** Both: 0 → 1 as light gathers where PIP will appear. */
  wake: number;
  /** Both: 0 → 1 on the way in; ends on the flat stage colour. */
  bloom: number;
  /** Both: a wrong code; set to 1 and it decays by itself. */
  error: number;
  /** screen: 0 → 1 the page collapses to a line (to 0.72), then to a dot. */
  off: number;
  /** screen: how bright the line and dot burn. */
  glow: number;
  /** screen: 0 → 1 the tube opens from a line to the full window. */
  on: number;
  /** screen: the overexposure as it lights; decays when set. */
  flash: number;
  /** CSS pixels from the top-left. */
  origin: [number, number];
  focus: [number, number];
  pointer: [number, number];
};

/** Where the collapse switches from squeezing the height to the width; shared with the page's own squeeze. */
export const OFF_SPLIT = 0.72;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const COMMON = `
precision highp float;
uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform float uWake;
uniform float uBloom;
uniform float uError;
uniform vec2 uFocus;
uniform vec2 uPointer;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
const vec3 BASE = vec3(0.043, 0.051, 0.063);
const vec3 TEAL = vec3(0.129, 0.733, 0.671);
const vec3 GREEN = vec3(0.494, 0.745, 0.314);
`;

const AURORA = `${COMMON}
uniform float uReveal;
uniform float uBuild;
uniform vec2 uOrigin;

void main() {
  // Work in CSS pixels, y down, so the uniforms match the page.
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 res = uRes / uDpr;
  float m = min(res.x, res.y);
  vec2 uv = px / m;
  float t = uTime * 0.045;

  // Slow domain-warped light.
  vec2 q = vec2(fbm(uv * 1.5 + t), fbm(uv * 1.5 - t + 4.1));
  float f = fbm(uv * 1.3 + 1.9 * q + vec2(t * 0.7, -t * 0.4));
  float band = smoothstep(0.42, 0.95, f);

  float dF = length(px - uFocus) / m;
  float pool = exp(-dF * dF * 6.5) * uWake;
  float dP = length(px - uPointer) / m;
  float hover = exp(-dP * dP * 14.0) * 0.18;

  vec3 aur = mix(TEAL, GREEN, smoothstep(0.3, 0.8, q.x));
  vec3 col = BASE + aur * band * (0.11 * uBuild + 0.42 * pool + hover * uBuild);
  col += GREEN * pool * 0.08;

  col *= 0.95 + 0.05 * sin(px.y * 2.1);
  vec2 c = px / res - 0.5;
  col *= 1.0 - dot(c, c) * 0.85;

  col += vec3(0.75, 0.25, 0.12) * uError * 0.22 * exp(-dF * dF * 3.0) * (0.7 + 0.3 * sin(uTime * 40.0));

  float maxR = length(res) * 1.05;
  if (uBloom > 0.0) {
    float dw = length(px - uFocus) - uBloom * maxR;
    float wave = exp(-dw * dw / 3200.0) * (1.0 - uBloom);
    col += (TEAL * 0.55 + GREEN * 0.2) * wave;
  }
  col = mix(col, BASE, smoothstep(0.4, 1.0, uBloom));

  // The opening: a circle from the button with a living edge. Noise on the
  // direction, not the angle: an angle wraps at ±π and leaves a seam.
  float d = length(px - uOrigin);
  vec2 dir = (px - uOrigin) / max(d, 1.0);
  float wobble = (fbm(dir * 1.8 + vec2(3.0, uTime * 0.35)) - 0.5) * 90.0 * (1.0 - uReveal * 0.7);
  float de = d - uReveal * maxR - wobble;
  float inside = 1.0 - smoothstep(-2.0, 2.0, de);
  float rim = exp(-abs(de) / 16.0) * (1.0 - smoothstep(0.8, 1.0, uReveal));
  col += TEAL * rim * 0.9;

  col += (hash(px + fract(uTime)) - 0.5) * 0.012;

  // The page shows faintly through until the way in, then nothing does.
  float alpha = max(inside * mix(0.95, 1.0, uBloom), rim * 0.85);
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

const SCREEN = `${COMMON}
uniform float uOff;
uniform float uGlow;
uniform float uOn;
uniform float uFlash;

// Signed distance to a box of half-size b.
float box(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 res = uRes / uDpr;
  float m = min(res.x, res.y);
  vec2 ctr = res * 0.5;
  vec3 phos = vec3(0.66, 1.0, 0.7);
  vec3 dark = vec3(0.008, 0.01, 0.012);

  if (uOn <= 0.0) {
    // Switching off: the page on the glass squeezes to a line, then a dot.
    float v = smoothstep(0.0, ${OFF_SPLIT}, uOff);
    float h = smoothstep(${OFF_SPLIT}, 1.0, uOff);
    vec2 hb = vec2(mix(res.x * 0.5 + 2.0, 1.5, h), mix(res.y * 0.5 + 2.0, 1.0, v));
    float sd = box(px - ctr, hb);
    float inside = 1.0 - smoothstep(-1.0, 1.0, sd);
    // Over the page, the glass tints green as it goes (CrtLayer draws the lines).
    float glaze = uOff * 0.22;
    vec3 lit = GREEN * 0.07 * uOff;
    float g = exp(-max(sd, 0.0) / mix(14.0, 5.0, v)) * uGlow;
    vec3 col = mix(dark, lit, inside) + phos * g;
    float alpha = mix(1.0, glaze, inside);
    gl_FragColor = vec4(col, max(alpha, min(1.0, g)));
    return;
  }

  // Powered on: a line across the middle that opens to the whole window.
  float w = smoothstep(0.0, 0.3, uOn);
  float vv = smoothstep(0.25, 1.0, uOn);
  vec2 hb = vec2(mix(1.5, res.x * 0.5 + 40.0, w), mix(1.0, res.y * 0.5 + 40.0, vv * vv));
  float sd = box(px - ctr, hb);
  float inside = 1.0 - smoothstep(-1.5, 1.5, sd);
  float edge = exp(-abs(sd) / 6.0) * (1.0 - smoothstep(0.85, 1.0, uOn));

  // The stage behind the glass.
  float dF = length(px - uFocus) / m;
  float pool = exp(-dF * dF * 5.0) * uWake;
  float t = uTime * 0.05;
  float f = fbm(px / m * 2.2 + vec2(t, -t * 0.7));
  vec3 stage = BASE + GREEN * pool * (0.1 + 0.07 * f) + TEAL * 0.03 * f * uWake;
  // Phosphor shimmer while the tube warms.
  stage += phos * (hash(px + fract(uTime)) - 0.5) * 0.035 * (1.0 - uWake * 0.6);
  stage += phos * uFlash * 0.4 * max(0.0, 1.0 - dF * 0.9);
  // A wrong code: a warm flicker and a tear in the lines.
  float tear = uError * step(0.92, hash(vec2(floor(px.y / 6.0), floor(uTime * 30.0))));
  stage += vec3(0.75, 0.25, 0.12) * uError * 0.22 * exp(-dF * dF * 3.0) + phos * tear * 0.06;
  stage = mix(stage, BASE, smoothstep(0.55, 1.0, uBloom));

  vec3 col = mix(dark, stage, inside) + phos * edge * 0.9;
  gl_FragColor = vec4(col, 1.0);
}
`;

const FRAGS: Record<Theme, string> = { aurora: AURORA, screen: SCREEN };

export type Field = {
  uniforms: FieldUniforms;
  /** Freeze time (reduced motion): the field is drawn, but does not flow. */
  still: boolean;
  destroy: () => void;
};

/** Starts drawing into `canvas`; returns null where WebGL is unavailable. */
export function createField(canvas: HTMLCanvasElement, theme: Theme, initial: Partial<FieldUniforms> = {}): Field | null {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(`${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'} shader: ${gl.getShaderInfoLog(s) || (gl.isContextLost() ? 'context lost' : 'no log')}`);
    }
    return s;
  };
  let program: WebGLProgram;
  try {
    program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGS[theme]));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link');
  } catch (err) {
    console.error('[entrance]', err);
    return null;
  }
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const field: Field = {
    uniforms: {
      reveal: 0,
      build: 0,
      wake: 0,
      bloom: 0,
      error: 0,
      off: 0,
      glow: 0,
      on: 0,
      flash: 0,
      origin: [0, 0],
      focus: [0, 0],
      pointer: [-9999, -9999],
      ...initial,
    },
    still: false,
    destroy: () => {},
  };

  // A uniform the chosen look does not declare has no location; setting it is a no-op.
  const keys = Object.keys(field.uniforms) as (keyof FieldUniforms)[];
  const locs = new Map(keys.map((k) => [k, gl.getUniformLocation(program, `u${k[0].toUpperCase()}${k.slice(1)}`)]));
  const uRes = gl.getUniformLocation(program, 'uRes');
  const uDpr = gl.getUniformLocation(program, 'uDpr');
  const uTime = gl.getUniformLocation(program, 'uTime');

  // Full-screen fbm is the expensive part; past 1.5x nobody can tell.
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const resize = () => {
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  window.addEventListener('resize', resize);

  let raf = 0;
  let last = performance.now();
  let time = 0;
  const frame = (now: number) => {
    // The Motion dial slows the light along with everything else.
    const dt = Math.min(0.05, (now - last) / 1000) * motion();
    last = now;
    if (!field.still) time += dt;
    const v = field.uniforms;
    v.error = Math.max(0, v.error - dt * 1.6);
    v.flash = Math.max(0, v.flash - dt * 1.2);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uDpr, dpr);
    gl.uniform1f(uTime, time);
    for (const k of keys) {
      const loc = locs.get(k);
      if (!loc) continue;
      const val = v[k];
      if (typeof val === 'number') gl.uniform1f(loc, val);
      else gl.uniform2f(loc, val[0], val[1]);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  // No loseContext() here: a canvas hands back the same context on the next
  // getContext, and a remount on the same canvas (Strict Mode does one) would
  // get it already lost. The context goes when the canvas does.
  field.destroy = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    gl.deleteBuffer(buf);
    gl.deleteProgram(program);
  };
  return field;
}
