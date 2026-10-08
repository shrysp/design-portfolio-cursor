// Renders every journal page side to a texture for the 3D journal.
//
// The pages are authored as JSX in src/components/journal/journalPages.tsx.
// This script screenshots each side from the dev-only /journal-capture route
// and writes the textures plus a manifest of clickable regions. Each texture's
// alpha channel marks where the stickers are, so the 3D journal can make them shine.
//
// Usage: start the dev server, then `npm run journal:capture`
//   JOURNAL_CAPTURE_URL  dev server origin (default http://localhost:3000)
//   CHROME_PATH          Chrome binary (default: macOS Google Chrome)

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = process.env.JOURNAL_CAPTURE_URL ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const PAGE_WIDTH = 420;
const PAGE_HEIGHT = 560;
const PIXEL_RATIO = 2;
// Alpha is 255 on bare paper and drops to this on a sticker. It never reaches
// zero, where lossy WebP would be free to discard the colour underneath.
const GLOSS_ALPHA = 160;

// Reduces a page to white sticker silhouettes on black.
const GLOSS_MASK_CSS = `
  [data-journal-page] { background: #000 !important; }
  [data-journal-page] * {
    color: transparent !important;
    background: none !important;
    box-shadow: none !important;
    text-decoration-color: transparent !important;
    transition: none !important;
  }
  [data-journal-page] img { filter: brightness(0) invert(1) !important; mix-blend-mode: normal !important; opacity: 1 !important; }
  [data-journal-page] img[src*="Paper-Texture"] { display: none !important; }
`;

const TEXTURE_DIR = path.join(ROOT, "public/images/journal/pages");
const MANIFEST_PATH = path.join(ROOT, "src/components/journal/journalManifest.json");

await mkdir(TEXTURE_DIR, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });

try {
  const page = await browser.newPage();
  await page.setViewport({ width: PAGE_WIDTH, height: PAGE_HEIGHT, deviceScaleFactor: PIXEL_RATIO });

  // Screenshots whatever the capture route is showing into a texture, with the
  // sticker silhouettes packed into its alpha channel.
  async function writeTexture(file) {
    const clip = { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT };
    const png = await page.screenshot({ clip });
    await page.addStyleTag({ content: GLOSS_MASK_CSS });
    const mask = await page.screenshot({ clip });
    // sharp doesn't run operations in call order, so build the channels as raw buffers first.
    const size = { width: PAGE_WIDTH * PIXEL_RATIO, height: PAGE_HEIGHT * PIXEL_RATIO };
    const colour = await sharp(png).removeAlpha().raw().toBuffer();
    const gloss = await sharp(mask).removeAlpha().greyscale().raw().toBuffer();
    const alpha = Buffer.from(gloss.map((value) => 255 - Math.round((value / 255) * (255 - GLOSS_ALPHA))));
    await sharp(colour, { raw: { ...size, channels: 3 } })
      .joinChannel(alpha, { raw: { ...size, channels: 1 } })
      .webp({ quality: 88, alphaQuality: 100 })
      .toFile(path.join(TEXTURE_DIR, file));
    return `/images/journal/pages/${file}`;
  }

  async function openSide(side, single = false) {
    await page.goto(`${ORIGIN}/journal-capture?side=${side}${single ? "&single=1" : ""}`, { waitUntil: "load" });
    // The route flags itself ready once its fonts and images are in. Waiting for
    // the network to go idle would hang on the dev toolbar's open connection.
    return page.waitForSelector('[data-journal-capture][data-ready="true"]', { timeout: 30_000 });
  }

  const sides = [];
  const hotspots = [];
  let layout = { sideCount: 1, singleCount: 0, singleOverrides: [] };
  for (let side = 0; side < layout.sideCount; side++) {
    const capture = await openSide(side);
    layout = await capture.evaluate((el) => ({
      sideCount: Number(el.dataset.sideCount),
      singleCount: Number(el.dataset.singleCount),
      singleOverrides: el.dataset.singleOverrides.split(",").filter(Boolean).map(Number),
    }));

    // Links and buttons can't be clicked once the page is a texture, so record
    // where they are and let the 3D journal hit-test against these rectangles.
    hotspots.push(...await page.evaluate((side) => {
      const bounds = document.querySelector("[data-journal-page]").getBoundingClientRect();
      return Array.from(document.querySelectorAll("[data-journal-page] a[href], [data-journal-page] [data-journal-action]")).map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          side,
          x: (rect.left - bounds.left) / bounds.width,
          y: (rect.top - bounds.top) / bounds.height,
          width: rect.width / bounds.width,
          height: rect.height / bounds.height,
          href: el.getAttribute("href") ?? undefined,
          action: el.dataset.journalAction,
        };
      });
    }, side));

    sides.push(await writeTexture(`${String(side).padStart(2, "0")}.webp`));
    console.log(`captured side ${side + 1}/${layout.sideCount}`);
  }

  // The one-page-at-a-time journal reuses the same textures, apart from the
  // sides that are laid out differently for it.
  const singleSides = sides.slice(0, layout.singleCount);
  for (const side of layout.singleOverrides) {
    await openSide(side, true);
    singleSides[side] = await writeTexture(`single-${String(side).padStart(2, "0")}.webp`);
    console.log(`captured single-page side ${side + 1}`);
  }

  // Bust browser caches whenever the textures are regenerated.
  const version = Date.now().toString(36);
  // The cover is also captured without its name sticker, which the 3D journal
  // sticks on as it arrives. Record where the sticker goes so the two line up.
  await openSide(0);
  const coverSticker = await page.evaluate(() => {
    const img = document.querySelector('[data-journal-page] img[src*="Name-Sticker"]');
    const bounds = document.querySelector("[data-journal-page]").getBoundingClientRect();
    const box = img.getBoundingClientRect();
    const aspect = img.naturalWidth / img.naturalHeight;
    const rotation = parseFloat(getComputedStyle(img.parentElement).rotate) || 0;
    img.parentElement.style.visibility = "hidden";
    return {
      src: new URL(img.src).pathname,
      // Centre of the sticker and its drawn width, as fractions of the page
      x: (box.left + box.width / 2 - bounds.left) / bounds.width,
      y: (box.top + box.height / 2 - bounds.top) / bounds.height,
      width: Math.min(img.offsetWidth, img.offsetHeight * aspect) / bounds.width,
      aspect,
      rotation,
    };
  });
  const coverBare = await writeTexture("cover-bare.webp");
  console.log("captured cover without its sticker");

  const manifest = { pageWidth: PAGE_WIDTH, pageHeight: PAGE_HEIGHT, glossAlpha: GLOSS_ALPHA, version, sides, singleSides, singleBackCover: sides[sides.length - 1], coverBare, coverSticker, hotspots };
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`wrote ${path.relative(ROOT, MANIFEST_PATH)}`);
} finally {
  await browser.close();
}
