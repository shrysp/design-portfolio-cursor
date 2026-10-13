"use client";

import * as React from "react";
import "@/components/iso/iso.css";
import "./figure.css";

interface FigureCardProps {
  className: string; // the figure's own class, for its scoped styles
  ratio: number; // the drawing's width over its height, to hold its place before it is drawn
  caption?: React.ReactNode; // if provided, renders the caption bar
  children: React.ReactNode;
}

const subscribe = () => () => {};

/**
 * The frame an isometric figure sits in: the same card and caption bar as MediaCard.
 *
 * The drawing is made in the browser only. Its coordinates come out of sines
 * and cosines rounded to a tenth, and Node and the browser disagree on the
 * last digit often enough that a server-drawn figure fails to hydrate.
 */
export default function FigureCard({ className, ratio, caption, children }: FigureCardProps) {
  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <figure className={`iso fig ${className} isolate relative w-full surface bg-stone-100 -space-y-2 my-3`} data-theme="light">
      <div className="isolate relative rounded-[calc(var(--surface-radius)-1px)] bg-white overflow-hidden outline outline-stone-200 px-2 py-5 md:px-5 md:py-7">
        <div style={{ aspectRatio: ratio }}>{mounted ? children : null}</div>
      </div>
      {caption ? (
        <figcaption className="w-full flex items-center justify-between px-4 py-3 pt-4">
          <div className="relative text-sm text-stone-600 mt-1 flex-1">{caption}</div>
        </figcaption>
      ) : null}
    </figure>
  );
}
