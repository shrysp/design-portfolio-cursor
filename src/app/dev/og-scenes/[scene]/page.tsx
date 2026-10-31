import { notFound } from "next/navigation";
import Scene, { type SceneName } from "./Scene";

const SCENES: SceneName[] = ["work", "journal"];

export const metadata = { title: "Share scenes", robots: { index: false } };

/**
 * Development only: the home link's share scenes, 1200 × 630 — what
 * `npm run og:videos` records as the preview's loop and whose last frame it
 * keeps as the preview's picture, so the two are one scene. `/dev/og-scenes/work`,
 * `/dev/og-scenes/journal`. Plays on load.
 */
export default async function OgScenePage({ params }: { params: Promise<{ scene: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { scene } = await params;
  if (!SCENES.includes(scene as SceneName)) notFound();
  return <Scene name={scene as SceneName} />;
}
