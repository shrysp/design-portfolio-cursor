"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { IconXmark } from "nucleo-micro-bold-essential";
import { useKeyFlash } from "@/lib/useKeyFlash";

export interface StagedPiece {
  title: string;
  /** Width / height of the stage's frame: the same shape as the piece's tile */
  ratio: number;
  /** The still the tile shows. The frame opens and closes on it, so the morph
      is one picture changing size and never two different things blending. */
  poster?: string;
  /** A built prototype, which looks nothing like the still: it fades in once
      the frame has landed and fades out before the frame leaves */
  settles?: boolean;
  content: ReactNode;
}

interface CraftStageProps {
  piece: StagedPiece | null;
  /** Called to close. The caller runs the morph back into the tile. */
  onClose: () => void;
}

// How long Esc shows on its button before the stage starts to close
const CLOSE_KEY_DELAY = 120;
// How long the frame takes to land, and a prototype to fade in or out over its still
const LAND_MS = 380;
const SETTLE_MS = 180;

// A craft piece opened up to use or watch at full size. It has no open or
// close animation of its own: its tile on the wall morphs into the frame and
// back (see startZoomTransition). Its layers sit above 9990 so the dock steps aside.
export default function CraftStage({ piece, onClose }: CraftStageProps) {
  const [pressedKey, flashKey] = useKeyFlash<"close">();
  const isClosing = useRef(false);
  const ratio = piece?.ratio ?? 4 / 3;

  // Whether the content is showing over the still
  const [isRevealed, setIsRevealed] = useState(false);
  const settles = piece?.settles ?? false;
  useEffect(() => {
    if (!piece) return;
    if (!settles) {
      setIsRevealed(true);
      return;
    }
    const timer = setTimeout(() => setIsRevealed(true), LAND_MS);
    return () => clearTimeout(timer);
  }, [piece, settles]);

  // Closes once: a prototype first fades back to its still, so what shrinks
  // into the tile is the same picture the tile shows
  const requestClose = (afterKey = false) => {
    if (isClosing.current) return;
    isClosing.current = true;
    if (settles) setIsRevealed(false);
    setTimeout(
      () => {
        isClosing.current = false;
        setIsRevealed(false);
        onClose();
      },
      Math.max(settles ? SETTLE_MS : 0, afterKey ? CLOSE_KEY_DELAY : 0)
    );
  };

  return (
    <Dialog.Root
      open={piece !== null}
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-stone-950/75 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus();
          }}
          // Esc dips its button first, then closes
          onEscapeKeyDown={(event) => {
            event.preventDefault();
            flashKey("close");
            requestClose(true);
          }}
          onClick={() => requestClose()}
          className="fixed inset-0 z-[9999] flex flex-col items-center gap-4 p-4 pt-16 md:px-16 md:pb-8 md:pt-20 cursor-collapse outline-none"
        >
          <Dialog.Title className="absolute top-4 left-4 md:top-6 md:left-6 h-8 flex items-center font-sans text-sm font-medium tracking-normal text-white/80">
            {piece?.title}
          </Dialog.Title>
          <Dialog.Close
            // The backdrop behind it also closes on click; one close is enough
            onClick={(event) => event.stopPropagation()}
            className={`aqua aqua-to-amber absolute top-4 right-4 md:top-6 md:right-6 h-8 pl-2 pr-2.5 gap-1 text-sm font-medium ${pressedKey === "close" ? "aqua-pressed" : ""}`}
          >
            <IconXmark size={14} />
            Esc
          </Dialog.Close>

          <div className="relative w-full flex-1 min-h-0 flex items-center justify-center [container-type:size]">
            {piece && (
              <div
                data-zoom-active="frame"
                // Clicks inside the piece are for the piece, not for closing
                onClick={(event) => event.stopPropagation()}
                className="relative overflow-hidden rounded-2xl bg-white bg-cover bg-center cursor-auto shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_30px_80px_-20px_rgba(0,0,0,0.6)]"
                style={{
                  aspectRatio: ratio,
                  width: `min(100cqw, calc(100cqh * ${ratio}))`,
                  backgroundImage: piece.poster ? `url("${piece.poster}")` : undefined,
                }}
              >
                <div
                  className="absolute inset-0 overflow-auto bg-white transition-opacity ease-out"
                  style={{ opacity: isRevealed ? 1 : 0, transitionDuration: `${SETTLE_MS}ms` }}
                >
                  {piece.content}
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
