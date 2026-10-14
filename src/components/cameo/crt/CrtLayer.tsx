'use client';

import { useEffect, useRef } from 'react';
import { motion, slowed } from './motion';
import './crt.css';

/**
 * PIP's tube, over whatever is on screen: the way into the tour and the tour
 * itself. One full-screen shader that only draws the glass — scanlines, the
 * phosphor grille, a refresh bar rolling down, flicker, grain, the curve of
 * the bezel — and glitches when told to. A glitch also bends what is behind
 * the glass: elements marked `data-crt-target` take an SVG filter for its
 * length (sheared lines and split colour), which a shader over the page
 * cannot do on its own.
 *
 * The scanline pitch is the one the entrance's own shader used, so the
 * entrance and the tour show one tube, not two.
 *
 * Anything can drive it, with no reference to it: `crtGlitch()` and `crtRoll()`.
 *
 * Controls are not behind the glass. Anything marked `data-crt-clear` — a
 * button, the control bar — is a thing in front of the tube, so the glass is
 * cut away under it: no scanlines, no grille, no interference. Its box is read
 * every frame, so it can move and resize freely.
 */

const GLITCH = 'crt:glitch';
/** Must match MAX_HOLES in the shader. */
const MAX_HOLES = 24;
const ROLL = 'crt:roll';

/** A burst of interference, 0..1 strong, for `ms`. */
export function crtGlitch(amount = 0.6, ms = 220) {
  window.dispatchEvent(new CustomEvent(GLITCH, { detail: { amount, ms } }));
}
/** Set the scanlines rolling (1 is a fast roll), easing to `to` over `ms`. */
export function crtRoll(to: number, ms = 400) {
  window.dispatchEvent(new CustomEvent(ROLL, { detail: { to, ms } }));
}

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform float uGlitch;
uniform float uSeed;
uniform float uStrength;
// Rounded boxes the glass leaves out: centre and half size, and a corner radius each.
const int MAX_HOLES = 24;
uniform vec4 uHoles[MAX_HOLES];
uniform float uHoleR[MAX_HOLES];
uniform int uHoleCount;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 res = uRes;
  float s = uStrength;

  // Scanlines (the entrance's pitch), and the phosphor grille between them.
  float scan = 0.5 + 0.5 * sin((px.y + uScroll) * 2.1);
  float dark = (1.0 - scan) * 0.15 * s;
  dark += (0.5 - 0.5 * sin(px.x * 2.094)) * 0.035 * s;

  // The bezel: a curved face, darker toward its rounded corners.
  vec2 q = (px / res - 0.5) * 2.0;
  dark += pow(length(q * vec2(0.92, 1.0)) / 1.42, 4.0) * 0.55 * s;
  // Past a 22px radius in each corner is the bezel itself.
  vec2 corner = max(abs(px - res * 0.5) - (res * 0.5 - 22.0), 0.0);
  dark = max(dark, smoothstep(21.0, 23.0, length(corner)) * min(1.0, s));

  // A refresh bar rolling slowly down the glass, and a little flicker.
  float barY = mod(uTime * 70.0, res.y + 500.0) - 250.0;
  float bar = exp(-pow((px.y - barY) / 90.0, 2.0)) * 0.04 * s;
  float flick = (hash(vec2(floor(uTime * 24.0), 3.0)) - 0.5) * 0.025 * s;
  float grain = (hash(px + fract(uTime) * 91.0) - 0.5) * 0.05 * s;

  vec3 light = vec3(0.75, 1.0, 0.8) * max(0.0, bar + grain);
  dark = max(0.0, dark + flick - min(0.0, grain));

  // Interference: torn bands, some lit, some dropped out, fringed teal and red.
  if (uGlitch > 0.001) {
    float rows = 6.0 + 40.0 * hash(vec2(uSeed, 1.0));
    float row = floor(px.y / rows);
    float pick = hash(vec2(row, uSeed));
    float hit = step(1.0 - 0.45 * uGlitch, pick);
    float edge = fract(px.y / rows);
    vec3 fringe = mix(vec3(0.13, 0.73, 0.67), vec3(0.95, 0.25, 0.3), step(0.5, hash(vec2(row, uSeed + 7.0))));
    light += hit * (fringe * 0.22 + vec3(0.12)) * uGlitch * step(0.5, hash(vec2(row, uSeed + 3.0)));
    dark += hit * 0.35 * uGlitch * step(hash(vec2(row, uSeed + 3.0)), 0.5);
    light += fringe * 0.25 * uGlitch * hit * (step(edge, 0.08) + step(0.92, edge));
  }

  // Whatever is in front of the glass, cut out with a half-pixel soft edge.
  float clear = 0.0;
  for (int i = 0; i < MAX_HOLES; i++) {
    if (i >= uHoleCount) break;
    vec4 h = uHoles[i];
    float r = uHoleR[i];
    vec2 d = abs(px - h.xy) - (h.zw - r);
    float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
    clear = max(clear, 1.0 - smoothstep(-0.5, 0.5, dist));
  }

  float a = clamp(dark, 0.0, 1.0) * (1.0 - clear);
  gl_FragColor = vec4(light * (1.0 - clear), a);
}
`;

/**
 * `appear`: ms for the glass to come up over what was there (the entrance,
 * over the case study). Read when it mounts: one glass stays up from the
 * entrance right through the tour (EntranceHost), and must not restart.
 */
export default function CrtLayer({ appear = 0 }: { appear?: number }) {
  const appearAt = useRef(appear);
  const canvas = useRef<HTMLCanvasElement>(null);
  const turbulence = useRef<SVGFETurbulenceElement>(null);
  const displace = useRef<SVGFEDisplacementMapElement>(null);
  const redShift = useRef<SVGFEOffsetElement>(null);
  const cyanShift = useRef<SVGFEOffsetElement>(null);

  /** Settled: the glass on, at full strength (it was the CRT panel's to change). */
  const settings = useRef({ on: true, strength: 1 });

  useEffect(() => {
    const el = canvas.current;
    const gl = el?.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!el || !gl) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error('[crt]', gl.getShaderInfoLog(sh));
      return sh;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(program, n);
    const uRes = u('uRes'), uTime = u('uTime'), uScroll = u('uScroll'), uGlitch = u('uGlitch'), uSeed = u('uSeed'), uStrength = u('uStrength');
    const uHoles = u('uHoles'), uHoleR = u('uHoleR'), uHoleCount = u('uHoleCount');
    const holes = new Float32Array(MAX_HOLES * 4);
    const holeR = new Float32Array(MAX_HOLES);
    // A box's corner radius barely changes, so it is read from its style once.
    const radii = new WeakMap<Element, number>();
    const radiusOf = (c: Element) => {
      let r = radii.get(c);
      if (r === undefined) {
        r = parseFloat(getComputedStyle(c).borderTopLeftRadius) || 0;
        radii.set(c, r);
      }
      return r;
    };
    /** The boxes marked `data-crt-clear` that can be seen, in the glass's own pixels. */
    const readHoles = () => {
      const box = el.getBoundingClientRect();
      let n = 0;
      for (const c of document.querySelectorAll('[data-crt-clear]')) {
        if (n === MAX_HOLES) break;
        // Faded out or hidden counts as not there, or the glass would show a gap where nothing is.
        if (c.checkVisibility && !c.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
        const r = c.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        holes[n * 4] = r.left - box.left + r.width / 2;
        holes[n * 4 + 1] = r.top - box.top + r.height / 2;
        holes[n * 4 + 2] = r.width / 2;
        holes[n * 4 + 3] = r.height / 2;
        holeR[n] = Math.min(radiusOf(c), r.width / 2, r.height / 2);
        n++;
      }
      return n;
    };

    // One device pixel per CSS pixel: scanlines are a CSS-pixel pitch, and this
    // shader is cheap enough not to need less.
    const resize = () => {
      el.width = el.clientWidth;
      el.height = el.clientHeight;
      gl.viewport(0, 0, el.width, el.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // Interference and roll, each eased toward where the last event asked.
    let glitch = 0;
    let glitchUntil = 0;
    let glitchPeak = 0;
    const appear = appearAt.current;
    let roll = 0;
    let rollFrom = roll;
    let rollTo = 0;
    let rollStart = performance.now();
    let rollMs = 1;
    let scroll = 0;
    let seed = 1;

    const targets = () => document.querySelectorAll<HTMLElement>('[data-crt-target]');
    const onGlitch = (e: Event) => {
      if (reduced) return;
      const { amount, ms } = (e as CustomEvent<{ amount: number; ms: number }>).detail;
      glitchPeak = Math.max(glitch, amount);
      glitchUntil = performance.now() + slowed(ms);
      targets().forEach((t) => t.setAttribute('data-crt-glitch', ''));
    };
    const onRoll = (e: Event) => {
      if (reduced) return;
      const { to, ms } = (e as CustomEvent<{ to: number; ms: number }>).detail;
      rollFrom = roll;
      rollTo = to;
      rollStart = performance.now();
      rollMs = Math.max(1, slowed(ms));
    };
    window.addEventListener(GLITCH, onGlitch);
    window.addEventListener(ROLL, onRoll);

    let raf = 0;
    const start = performance.now();
    let last = start;
    let wasGlitching = false;
    let clock = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) * motion();
      last = now;
      clock += dt;
      const k = Math.min(1, (now - rollStart) / rollMs);
      roll = rollFrom + (rollTo - rollFrom) * (1 - (1 - k) ** 3);
      scroll += roll * 700 * dt;
      if (now < glitchUntil) {
        glitch = glitchPeak * (0.6 + 0.4 * Math.random());
        seed = Math.floor(now / 45);
      } else glitch = Math.max(0, glitch - dt * 8);
      const glitching = glitch > 0.02;
      // What is behind the glass bends while the interference lasts.
      if (glitching) {
        turbulence.current?.setAttribute('seed', String(seed % 97));
        displace.current?.setAttribute('scale', String(Math.round(10 + 50 * glitch)));
        // A small glitch fringes; only a strong one splits the picture apart.
        redShift.current?.setAttribute('dx', (0.5 + 4 * glitch * glitch).toFixed(1));
        cyanShift.current?.setAttribute('dx', (-(0.5 + 3 * glitch * glitch)).toFixed(1));
      } else if (wasGlitching) {
        targets().forEach((t) => t.removeAttribute('data-crt-glitch'));
      }
      wasGlitching = glitching;

      const s = settings.current;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (s.on) {
        gl.uniform2f(uRes, el.width, el.height);
        gl.uniform1f(uTime, reduced ? 0 : clock);
        gl.uniform1f(uScroll, scroll);
        gl.uniform1f(uGlitch, glitch);
        gl.uniform1f(uSeed, seed);
        gl.uniform1f(uStrength, s.strength * (appear > 0 ? Math.min(1, (now - start) / slowed(appear)) : 1));
        const n = readHoles();
        gl.uniform1i(uHoleCount, n);
        if (n > 0) {
          gl.uniform4fv(uHoles, holes);
          gl.uniform1fv(uHoleR, holeR);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener(GLITCH, onGlitch);
      window.removeEventListener(ROLL, onRoll);
      targets().forEach((t) => t.removeAttribute('data-crt-glitch'));
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} className="crt-glass" aria-hidden="true" />
      {/* Sheared lines and split colour, for what is behind the glass. */}
      <svg className="crt-defs" aria-hidden="true" width="0" height="0">
        <filter id="crt-glitch" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence ref={turbulence} type="fractalNoise" baseFrequency="0 0.045" numOctaves="1" seed="1" result="noise" />
          {/* Sideways only: the green channel, which drives the vertical shift, is held at the midpoint. */}
          <feComponentTransfer in="noise" result="bands">
            <feFuncR type="discrete" tableValues="0 0.25 0.5 0.5 0.5 0.75 1" />
            <feFuncG type="table" tableValues="0.5 0.5" />
          </feComponentTransfer>
          <feDisplacementMap ref={displace} in="SourceGraphic" in2="bands" scale="30" xChannelSelector="R" yChannelSelector="G" result="sheared" />
          <feColorMatrix in="sheared" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
          <feOffset ref={redShift} in="red" dx="4" result="redShift" />
          <feColorMatrix in="sheared" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan" />
          <feOffset ref={cyanShift} in="cyan" dx="-3" result="cyanShift" />
          <feBlend in="redShift" in2="cyanShift" mode="screen" />
        </filter>
      </svg>
    </>
  );
}
