import { notFound } from "next/navigation";
import SoundBoard from "./SoundBoard";

export const metadata = { title: "Tour sounds", robots: { index: false } };

/**
 * Development only: every place the tour could make a sound, in the order a
 * visitor meets them, with a few candidates for each to audition through the
 * same synth and limiter the tour uses — over PIP's voice if wanted.
 */
export default function TourSoundsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <SoundBoard />;
}
