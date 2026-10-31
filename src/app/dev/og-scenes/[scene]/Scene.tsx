"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import * as THREE from "three";
import {
  STICKER as STICK_ON,
  createJournalScene,
  curlSticker,
  stickOnProgress,
  stickerShape,
  type JournalScene,
} from "@/components/journal/journalScene";
import manifest from "@/components/journal/journalManifest.json";

export type SceneName = "work" | "journal";

/**
 * How the recorder drives a scene (scripts/generate-og-videos.mjs): it waits
 * for `ready`, starts recording, calls `play`, and keeps the frame on screen
 * when that resolves as the preview's picture. Opened by hand (no `?record`),
 * a scene plays by itself.
 */
declare global {
  interface Window {
    ogScene?: { ready: Promise<void>; play: () => Promise<void> };
  }
}

const W = 1200;
const H = 630;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The name sticker from the journal's cover and the About page. */
const NAME_STICKER = "/images/About/Name-Sticker.webp";

export default function Scene({ name }: { name: SceneName }) {
  return (
    // Over everything the site's layout puts on a page: the scene is the whole screen
    <div className="fixed inset-0 z-[2147483000] overflow-hidden bg-[#FAFAF9]" style={{ width: W, height: H }}>
      {name === "work" ? <Work /> : <Journal />}
    </div>
  );
}

/** Registers a scene with the recorder; plays it at once when opened by hand. */
function useScene(ready: Promise<void>, play: () => Promise<void>) {
  useEffect(() => {
    window.ogScene = { ready, play };
    if (!new URLSearchParams(location.search).has("record")) void ready.then(play);
    return () => {
      delete window.ogScene;
    };
  }, [ready, play]);
}

// ── Deal the cards ──────────────────────────────────────────────────────────

/** The case studies' share pictures, dealt back to front, where they come to rest (Paper: "D · The work"). */
const CARDS = [
  { slug: "weatherwise", left: 60, top: 220, width: 520, rotate: -9 },
  { slug: "dashworks", left: 660, top: 220, width: 520, rotate: 9 },
  { slug: "itinerai", left: 240, top: 160, width: 560, rotate: -3 },
  { slug: "quinn", left: 450, top: 180, width: 580, rotate: 3 },
];
const STICKER = { left: 60, top: 30, width: 300, rotate: -8 };
const STICKER_SHADOW = "drop-shadow(0 16px 22px rgba(28, 25, 23, 0.25))";

/**
 * The name sticker stuck on as the homepage's journal sticks it onto its cover
 * (journalScene's stickOn, whose curl and timing this shares): it arrives a
 * little big and turned, curled up off its bottom-left corner, and a press
 * runs across it to the top-right until it lies flat, light catching the bend.
 * Drawn in 3D on `canvas`, the whole scene's size, at `at` (CSS pixels, CSS rotation).
 */
async function stickOn(canvas: HTMLCanvasElement, at: { left: number; top: number; width: number; rotate: number }) {
  const texture = await new THREE.TextureLoader().loadAsync(NAME_STICKER);
  texture.colorSpace = THREE.SRGBColorSpace;
  const { naturalWidth, naturalHeight } = texture.image as HTMLImageElement;
  const height = (at.width * naturalHeight) / naturalWidth;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(W, H, false);
  // One unit is a CSS pixel on the scene's surface
  const distance = 1600;
  const camera = new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(2 * Math.atan(H / 2 / distance)), W / H, 1, distance * 2);
  camera.position.z = distance;
  const scene = new THREE.Scene();
  // Lit to its own colours where it lies flat, darker where it curls away
  scene.add(new THREE.AmbientLight("#ffffff", Math.PI * 0.45));
  const sun = new THREE.DirectionalLight("#ffffff", Math.PI * 0.55);
  sun.position.set(0, 0, 1);
  scene.add(sun);

  const shape = stickerShape(at.width, height);
  const shineDirection = { value: new THREE.Vector3(0, 0, 1) };
  const material = new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide, transparent: true, alphaTest: 0.01 });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uShineDirection = shineDirection;
    shader.fragmentShader = "uniform vec3 uShineDirection;\n" + shader.fragmentShader.replace("#include <opaque_fragment>", /* glsl */ `
      float shine = pow(max(dot(normal, uShineDirection), 0.0), ${STICK_ON.shinePower.toFixed(1)});
      outgoingLight += ${STICK_ON.shine.toFixed(3)} * shine * (gl_FrontFacing ? 1.0 : 0.0);
      #include <opaque_fragment>
    `);
  };
  const mesh = new THREE.Mesh(shape.geometry, material);
  scene.add(mesh);
  const home = new THREE.Vector2(at.left + at.width / 2 - W / 2, H / 2 - (at.top + height / 2));
  const turn = -THREE.MathUtils.degToRad(at.rotate);
  // Its rise, as the journal's is to a sticker half its page wide
  const rise = STICK_ON.startRise * 2 * at.width;
  const lean = new THREE.Vector3();

  canvas.style.visibility = "visible";
  const start = performance.now();
  await new Promise<void>((done) => {
    const frame = (now: number) => {
      const { arrived, pressed } = stickOnProgress((now - start) / 1000);
      curlSticker(shape, pressed);
      material.opacity = arrived;
      mesh.scale.setScalar(THREE.MathUtils.lerp(STICK_ON.startScale, 1, arrived));
      mesh.rotation.z = turn + (1 - arrived) * STICK_ON.startTurn;
      mesh.position.set(home.x, home.y + (1 - arrived) * rise, 0);
      // The highlight sits wherever the lifted part has bent through the shine angle
      mesh.updateWorldMatrix(true, false);
      lean.set(-shape.along.x, -shape.along.y, 0).transformDirection(mesh.matrixWorld);
      shineDirection.value.set(0, 0, Math.cos(STICK_ON.shineAngle)).addScaledVector(lean, Math.sin(STICK_ON.shineAngle)).normalize();
      renderer.render(scene, camera);
      if (pressed < 1) requestAnimationFrame(frame);
      else done();
    };
    requestAnimationFrame(frame);
  });
  renderer.dispose();
  shape.geometry.dispose();
  material.dispose();
  texture.dispose();
}

/**
 * Dealt like a hand of cards, one after another, from below; then the name
 * sticker is stuck on over them as it is onto the homepage's journal (stickOn).
 */
const DEAL_MS = 700;
const DEAL_GAP_MS = 420;
const DEAL = "cubic-bezier(0.22, 1, 0.36, 1)";
const HOLD_MS = 500;

function Work() {
  const cards = useRef<(HTMLImageElement | null)[]>([]);
  const sticker = useRef<HTMLImageElement>(null);
  const peel = useRef<HTMLCanvasElement>(null);
  const ready = useRef(
    typeof window === "undefined"
      ? Promise.resolve()
      : Promise.all([...CARDS.map((c) => `/og/${c.slug}.jpg`), NAME_STICKER].map(loadImage)).then(() => {}),
  ).current;
  const play = useRef(async () => {
    const els = cards.current.filter(Boolean) as HTMLImageElement[];
    for (const el of [...els, sticker.current]) if (el) el.style.opacity = "0";
    await wait(150);
    els.forEach((el, i) => {
      const { rotate } = CARDS[i];
      el.style.opacity = "1";
      el.animate(
        [
          { transform: `translate(${(i % 2 ? 1 : -1) * 60}px, 520px) rotate(${rotate + (i % 2 ? 14 : -14)}deg)` },
          { transform: `translate(0, 0) rotate(${rotate}deg)` },
        ],
        { duration: DEAL_MS, delay: i * DEAL_GAP_MS, easing: DEAL, fill: "backwards" },
      );
    });
    await wait((els.length - 1) * DEAL_GAP_MS + DEAL_MS * 0.8);
    await stickOn(peel.current!, STICKER);
    // Flat now: the picture of it takes over from the 3D one, exactly where it lies
    sticker.current!.style.opacity = "1";
    peel.current!.style.visibility = "hidden";
    await wait(HOLD_MS);
  }).current;
  useScene(ready, play);

  const card = (i: number): CSSProperties => {
    const c = CARDS[i];
    return {
      position: "absolute",
      left: c.left,
      top: c.top,
      width: c.width,
      height: Math.round((c.width * 630) / 1200),
      objectFit: "cover",
      borderRadius: 14,
      transform: `rotate(${c.rotate}deg)`,
      boxShadow: "0 0 0 6px #FFFFFF, 0 24px 48px rgba(28, 25, 23, 0.2)",
    };
  };
  return (
    <>
      {CARDS.map((c, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={c.slug} ref={(el) => void (cards.current[i] = el)} src={`/og/${c.slug}.jpg`} alt="" style={card(i)} />
      ))}
      <canvas ref={peel} width={W} height={H} style={{ position: "absolute", inset: 0, width: W, height: H, filter: STICKER_SHADOW, visibility: "hidden" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={sticker}
        src={NAME_STICKER}
        alt=""
        style={{
          position: "absolute",
          left: STICKER.left,
          top: STICKER.top,
          width: STICKER.width,
          transform: `rotate(${STICKER.rotate}deg)`,
          filter: STICKER_SHADOW,
        }}
      />
    </>
  );
}

// ── Open the journal ────────────────────────────────────────────────────────

/** The journal and the two stickers either side of it, at rest (Paper: "A · The journal"). */
const BOOK = { left: 432, top: 92, width: 336 };
/** The stage the open book is sized against: journalScene's reference screen height. */
const STAGE_H = 860;
const SIDES = [
  { src: "/images/About/Golden Gate Sticker.webp", left: 50, top: 110, size: 440, rotate: -6 },
  { src: "/images/About/RIT Ritchie Sticker.webp", left: 700, top: 110, size: 560, rotate: 3 },
];

/**
 * The homepage's own 3D journal: its name sticker goes on, it lifts off and
 * opens, two pages turn, and it shuts and flies home between the stickers.
 */
function Journal() {
  const rest = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const book = useRef<JournalScene | null>(null);
  const readyRef = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);
  if (!readyRef.current) {
    let resolve = () => {};
    const promise = new Promise<void>((r) => (resolve = r));
    readyRef.current = { promise, resolve };
  }

  useEffect(() => {
    const scene = createJournalScene({
      restHost: rest.current!,
      stageHost: stage.current!,
      restWidth: BOOK.width,
      layout: "spread",
      sides: manifest.sides.map((src) => `${src}?v=${manifest.version}`),
      coverBare: `${manifest.coverBare}?v=${manifest.version}`,
      coverSticker: manifest.coverSticker,
      hotspots: manifest.hotspots,
      pageWidth: manifest.pageWidth,
      pageHeight: manifest.pageHeight,
      glossAlpha: manifest.glossAlpha,
      reducedMotion: false,
      onReady: () => readyRef.current!.resolve(),
      onError: (error) => console.error("[og-scene]", error),
      onDismiss: () => {},
      onReopen: () => {},
      onHotspot: () => {},
    });
    book.current = scene;
    return () => scene.dispose();
  }, []);

  const play = useRef(async () => {
    const b = book.current!;
    // The page fades behind the book while it is up; the book itself stays in sight until it lands
    const lift = (on: boolean) => {
      if (on) stage.current!.style.visibility = "visible";
      veil.current!.animate([{ opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0 }], { duration: 450, easing: "ease-out", fill: "forwards" });
    };
    await wait(300);
    b.stickOn();
    await wait(1300);
    lift(true);
    b.open();
    await wait(1900);
    b.flipNext();
    await wait(1100);
    b.flipNext();
    await wait(1400);
    // Until it is home; the book settling after that is too slight to keep the loop waiting on
    await Promise.race([b.close(() => lift(false)), wait(2000)]);
  }).current;
  useScene(readyRef.current.promise, play);

  return (
    <>
      {SIDES.map((s) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.src}
          src={s.src}
          alt=""
          style={{ position: "absolute", left: s.left, top: s.top, width: s.size, height: s.size, objectFit: "contain", transform: `rotate(${s.rotate}deg)` }}
        />
      ))}
      <div ref={rest} style={{ position: "absolute", left: BOOK.left, top: BOOK.top, width: BOOK.width, height: (BOOK.width * manifest.pageHeight) / manifest.pageWidth }} />
      {/* The page fades back behind the open book, as on the homepage */}
      <div ref={veil} className="absolute inset-0 bg-[#FAFAF9]/90 backdrop-blur-sm" style={{ opacity: 0 }} />
      {/* As tall as the screen the book is sized for (journalScene's reference height), centred on
          the frame, so the open book fills the picture as it fills a laptop's screen */}
      <div ref={stage} className="absolute inset-x-0" style={{ top: (H - STAGE_H) / 2, height: STAGE_H, visibility: "hidden" }} />
    </>
  );
}

function loadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}
