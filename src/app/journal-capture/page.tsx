import { notFound } from "next/navigation";
import JournalCapture from "@/components/journal/JournalCapture";

// Dev-only: scripts/capture-journal-pages.mjs screenshots this route to build
// the page textures for the 3D journal.
export default async function JournalCapturePage({
  searchParams,
}: {
  searchParams: Promise<{ side?: string; single?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();

  const { side, single } = await searchParams;
  return <JournalCapture side={Number(side ?? 0)} single={single === "1"} />;
}
