// Cuts the short loops that play in a link's preview (og:video), at the same
// 1200 × 630 as the share images: silent, a few seconds long, small enough to
// load before the preview gives up on them. The clips are listed in
// src/lib/og-videos.json; this writes public/og/video/<name>.mp4.
//
// `invite`, `home-journal` and `home-work` are not cut from footage: they are
// recorded from the site's own pages (RECORDINGS below), so the dev server has
// to be running for them. Without one they are skipped.
//
// Usage: `npm run og:videos`             every clip
//        `npm run og:videos -- cameo`    just the ones named
//   OG_VIDEO_URL  dev server origin (default http://localhost:3000)
//   CHROME_PATH   Chrome binary (default: macOS Google Chrome)
//
// Needs ffmpeg on the PATH.

import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const OUT_DIR = path.join(PUBLIC, "og", "video");
const ORIGIN = process.env.OG_VIDEO_URL ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const WIDTH = 1200;
const HEIGHT = 630;
const FPS = 30;

// H.264 in an mp4 with its index up front, the one kind every app that plays
// these will play; no audio track, since a preview never has sound.
const ENCODE = ["-an", "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-crf", "26", "-preset", "slow", "-movflags", "+faststart"];

const clips = JSON.parse(await readFile(path.join(ROOT, "src/lib/og-videos.json"), "utf8"));
delete clips.$comment;
const wanted = process.argv.slice(2);
const names = [...Object.keys(clips), "invite", "home-journal", "home-work"].filter((n) => wanted.length === 0 || wanted.includes(n));

await mkdir(OUT_DIR, { recursive: true });
const ffmpeg = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

/**
 * One stretch of footage as a filter chain, ending in the label `out`. `at` is
 * its input's index; a contain clip's backdrop is the input after it.
 */
function shot({ fit }, i, at, out) {
  const v = `[${at}:v]`;
  const timing = `fps=${FPS},setpts=PTS-STARTPTS`;
  if (fit === "cover") {
    return `${v}${timing},scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},setsar=1[${out}]`;
  }
  // The whole picture at full height, over its backdrop, as the share images are composed
  const b = `[${at + 1}:v]`;
  return [
    `${b}scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},setsar=1,format=yuv420p[bg${i}]`,
    `${v}${timing},scale=-2:${HEIGHT},setsar=1[fg${i}]`,
    `[bg${i}][fg${i}]overlay=(W-w)/2:(H-h)/2:shortest=1[${out}]`,
  ].join(";");
}

async function cut(name, list) {
  const inputs = list.flatMap(({ src, start, length, fit, backdrop }) => {
    const footage = ["-ss", String(start), "-t", String(length), "-i", path.join(PUBLIC, src)];
    if (fit !== "contain") return footage;
    if (!backdrop) throw new Error(`${name}: a contain clip needs a backdrop`);
    // A colour ("#ffffff") for footage that has a flat ground of its own, or a picture
    if (backdrop.startsWith("#")) {
      return [...footage, "-f", "lavfi", "-t", String(length), "-i", `color=c=${backdrop}:s=${WIDTH}x${HEIGHT}:r=${FPS}`];
    }
    return [...footage, "-loop", "1", "-t", String(length), "-i", path.join(PUBLIC, backdrop)];
  });
  let at = 0;
  const shots = list.map((clip, i) => {
    const chain = shot(clip, i, at, `s${i}`);
    at += clip.fit === "contain" ? 2 : 1;
    return chain;
  });
  const joined = list.length === 1 ? "[s0]null[v]" : `${list.map((_, i) => `[s${i}]`).join("")}concat=n=${list.length}:v=1:a=0[v]`;
  ffmpeg([...inputs, "-filter_complex", [...shots, joined].join(";"), "-map", "[v]", ...ENCODE, path.join(OUT_DIR, `${name}.mp4`)]);
}

// What no recording wants: the dev tools a development page carries.
const DEV_CSS = `nextjs-portal, [class*="dialkit"], [data-agentation-theme] { display: none !important; }`;

/** How long the invitation takes from its switch to PIP smiling over a printed ticket. */
const INVITE_MS = 7600;
/**
 * What of the invitation the clip shows: PIP, the line under it and the
 * ticket, enlarged to fill the frame so YOU can be read in a preview a few
 * inches wide. In page pixels; recorded at twice that, so it stays sharp.
 */
const INVITE_CROP = { x: 133, y: 60, width: 934, height: 490 };

/** Plays a share scene (src/app/dev/og-scenes) to its end. */
const playScene = (page) => page.evaluate(() => window.ogScene.play());

/**
 * The loops recorded from the site's own pages rather than cut from footage.
 *
 * `invite`: the invitation, PIP waking and printing a ticket that reads YOU.
 * Its chrome is hidden — back button, the notice, the greeting ("Good
 * afternoon, You") — and its pauses shortened (`maxFrame`), since what is a
 * breath on a laptop is dead air in a preview. It leaves behind the plate a
 * personal invitation's still is drawn on (capturePlate).
 *
 * `home-*`: the home link's two candidates, scenes made for it. Each ends on
 * the picture the preview shows where video doesn't play, kept as
 * public/og/<name>.jpg; linkPreview.ts says which one the site uses.
 */
const RECORDINGS = {
  invite: {
    path: "/dev/tour-invite?name=You&no=0&note=",
    css: `.entrance-back, .entrance-notice, .entrance-title { display: none !important; }`,
    // The power switch: the one button on the page until it is pressed
    run: async (page) => {
      await page.click("button");
      await new Promise((r) => setTimeout(r, INVITE_MS));
    },
    // A beat into the dark, so the first frame is the CRT's line rather than black
    skip: 0.3,
    maxFrame: 0.18,
    crop: INVITE_CROP,
    after: capturePlate,
  },
  "home-journal": { path: "/dev/og-scenes/journal?record", run: playScene, after: (page) => keepStill(page, "home-journal") },
  "home-work": { path: "/dev/og-scenes/work?record", run: playScene, after: (page) => keepStill(page, "home-work") },
};
/** Held on the last frame, so the loop rests on it before it starts again. */
const HOLD = 1.2;

async function record(name, { path: route, css = "", run, skip = 0, maxFrame = Infinity, crop, after }) {
  const url = `${ORIGIN}${route}`;
  try {
    await fetch(url);
  } catch {
    console.log(`skipped ${name}: no dev server at ${ORIGIN} (npm run dev, or set OG_VIDEO_URL)`);
    return;
  }
  const dir = await mkdtemp(path.join(os.tmpdir(), `og-${name}-`));
  const browser = await puppeteer.launch({ executablePath: CHROME });
  // Chrome sends a frame only when the screen changes, each with the time it
  // was drawn; they are kept with those times so the stills between them last
  // as long as they did on screen.
  const frames = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.addStyleTag({ content: DEV_CSS + css });
    // A scene says when its pictures are in
    await page.evaluate(() => window.ogScene?.ready);
    const cdp = await page.createCDPSession();
    cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
      frames.push({ data, at: metadata.timestamp });
      cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
    });
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: WIDTH * 2, maxHeight: HEIGHT * 2 });
    const started = Date.now() / 1000;
    await run(page);
    const ended = Date.now() / 1000;
    await cdp.send("Page.stopScreencast");
    const from = started + skip;
    const kept = frames.filter((f, i) => f.at >= from || frames[i + 1]?.at > from);
    let list = "";
    for (const [i, f] of kept.entries()) {
      const file = path.join(dir, `${String(i).padStart(4, "0")}.jpg`);
      await writeFile(file, Buffer.from(f.data, "base64"));
      const next = kept[i + 1]?.at ?? ended;
      const length = i === kept.length - 1 ? HOLD : Math.min(maxFrame, next - Math.max(f.at, from));
      list += `file '${file}'\nduration ${length.toFixed(4)}\n`;
    }
    // The concat demuxer drops the last entry's duration unless it is listed again
    list += `file '${path.join(dir, `${String(kept.length - 1).padStart(4, "0")}.jpg`)}'\n`;
    await writeFile(path.join(dir, "frames.txt"), list);
    await after?.(page);
  } finally {
    await browser.close();
  }
  const c = crop ?? { x: 0, y: 0, width: WIDTH, height: HEIGHT };
  const frame = `scale=${WIDTH * 2}:${HEIGHT * 2},crop=${c.width * 2}:${c.height * 2}:${c.x * 2}:${c.y * 2},scale=${WIDTH}:${HEIGHT},setsar=1`;
  ffmpeg(["-f", "concat", "-safe", "0", "-i", path.join(dir, "frames.txt"), "-vf", `fps=${FPS},${frame}`, ...ENCODE, path.join(OUT_DIR, `${name}.mp4`)]);
  await rm(dir, { recursive: true, force: true });
}

/** A scene's last frame, as the share picture of the link it is for. */
async function keepStill(page, name) {
  const shot = await page.screenshot({ type: "png" });
  await sharp(shot).resize(WIDTH, HEIGHT).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(PUBLIC, "og", `${name}.jpg`));
  console.log(`wrote public/og/${name}.jpg`);
}

/**
 * The clip's last frame without its ticket: what a personal invitation's still
 * (src/app/invite/[code]/ticket) draws that visitor's own ticket on, so the
 * still and the clip are one scene. Written with where the ticket goes, in the
 * still's pixels, to src/lib/invite-plate.json.
 */
async function capturePlate(page) {
  const c = INVITE_CROP;
  const k = WIDTH / c.width;
  const at = await page.evaluate(() => {
    const slot = document.querySelector(".ticket-slot").getBoundingClientRect();
    const paper = document.querySelector(".ticket-paper").getBoundingClientRect();
    return { slotBottom: slot.bottom, center: slot.left + slot.width / 2, width: paper.width };
  });
  await page.addStyleTag({ content: ".ticket-feed { visibility: hidden !important; }" });
  const shot = await page.screenshot({ clip: c, type: "png" });
  await sharp(shot).resize(WIDTH, HEIGHT).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(PUBLIC, "og", "invite-plate.jpg"));
  const plate = {
    $comment: "Written by `npm run og:videos` with public/og/invite-plate.jpg: where the ticket hangs in that picture, in its pixels, and how much larger than on the page everything in it is.",
    top: Math.round((at.slotBottom - c.y) * k),
    center: Math.round((at.center - c.x) * k),
    width: Math.round(at.width * k),
    scale: Number(k.toFixed(4)),
  };
  await writeFile(path.join(ROOT, "src/lib/invite-plate.json"), JSON.stringify(plate, null, 2) + "\n");
  console.log("wrote public/og/invite-plate.jpg");
}

for (const name of names) {
  if (RECORDINGS[name]) await record(name, RECORDINGS[name]);
  else await cut(name, clips[name]);
  const out = path.join(OUT_DIR, `${name}.mp4`);
  try {
    const size = (await readFile(out)).length;
    console.log(`wrote public/og/video/${name}.mp4 (${(size / 1024).toFixed(0)} KB)`);
  } catch {}
}
