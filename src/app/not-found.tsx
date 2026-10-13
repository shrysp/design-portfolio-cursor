import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowLeft } from "nucleo-micro-bold-essential";
import HandNote from "@/components/HandNote";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page isn't in the journal.",
};

// The page for an address that leads nowhere: a loose leaf from the journal,
// with a note that writes itself out and a way home.
export default function NotFound() {
  return (
    // Exactly one screen tall, with the dock put away (see `data-not-found` in
    // globals.css): the only thing to do here is go home
    <main data-not-found className="h-dvh flex flex-col items-center justify-center gap-10 px-4 bg-stone-50">
      {/* A blank page, the journal's paper, lying a little askew */}
      <div className="relative w-60 aspect-3/4 -rotate-3 bg-linear-to-bl from-stone-50 to-stone-100 rounded-r-lg rounded-l-2xl overflow-hidden shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.08),0_16px_32px_-16px_rgba(0,0,0,0.25)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/About/Paper-Texture.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="relative h-full flex flex-col justify-between p-6 text-stone-600">
          <p className="font-handwriting text-5xl text-stone-300" aria-hidden>
            404
          </p>
          <h1 className="text-left tracking-normal">
            <HandNote className="font-normal text-[1.35rem] leading-[1.3]" delay={0.3} speed={8}>
              This page isn&apos;t in the journal.
            </HandNote>
          </h1>
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 text-center">
        <p className="text-body text-pretty max-w-[34ch]">
          It may have moved, or it was never written. The work is all on the home page.
        </p>
        <Link href="/" className="aqua aqua-to-blue h-9 pl-3 pr-4 gap-1.5 text-sm font-medium">
          <IconArrowLeft size={14} />
          Back home
        </Link>
      </div>
    </main>
  );
}
