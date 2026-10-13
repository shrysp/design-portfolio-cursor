// Composes each case study's share image: its hero picture over its backdrop,
// the same pairing as its card on the home page, at the 1200 × 630 that link
// previews expect. Projects are read from src/lib/projectMeta.ts.
//
// Usage: `npm run og:generate`

import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const OUT_DIR = path.join(PUBLIC, "og");
const WIDTH = 1200;
const HEIGHT = 630;

// The slug, hero and backdrop of each entry, read straight from the source so
// the list lives in one place
const source = await readFile(path.join(ROOT, "src/lib/projectMeta.ts"), "utf8");
const projects = [...source.matchAll(/^  (\w+): \{[\s\S]*?hero: "([^"]+)",\s*background: "([^"]+)"/gm)].map(
  ([, slug, hero, background]) => ({ slug, hero, background })
);
if (projects.length === 0) throw new Error("No projects found in src/lib/projectMeta.ts");

await mkdir(OUT_DIR, { recursive: true });

for (const { slug, hero, background } of projects) {
  // The hero keeps its 4:3 shape at full height; the backdrop fills the rest
  const picture = await sharp(path.join(PUBLIC, hero)).resize({ height: HEIGHT, fit: "inside" }).toBuffer();
  await sharp(path.join(PUBLIC, background))
    .resize(WIDTH, HEIGHT, { fit: "cover" })
    .composite([{ input: picture, gravity: "centre" }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(OUT_DIR, `${slug}.jpg`));
  console.log(`wrote public/og/${slug}.jpg`);
}
