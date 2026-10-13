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
  /** A built prototype, which looks nothing like the still: it comes into
      focus while the frame is still growing, so the tile becomes the prototype
      in one motion rather than landing as a still and then swapping */
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
// How long a recording takes to fade in over its still
const SETTLE_MS = 180;
// How long a prototype takes to come into focus. The frame lands in 380ms
// (see startZoomTransition), so the two finish together.
const EMERGE_MS = 340;

// A craft piece opened up to use or watch at full size. It has no open or
// close animation of its own: its tile on the wall morphs into the frame and
// back (see startZoomTransition). Its layers sit above 9990 so the dock steps aside.
export default function CraftStage({ piece, onClose }: CraftStageProps) {
  const [pressedKey, flashKey] = useKeyFlash<"close">();
  const isClosing = useRef(false);
  const ratio = piece?.ratio ?? 4 / 3;

  // Whether the content is showing over the still
  const [isRevealed, setIsRevealed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const settles = piece?.settles ?? false;
  useEffect(() => {
    if (!piece) return;
    if (!settles) {
      setIsRevealed(true);
      return;
    }
    // A frame on, so the hidden state has been drawn and there is something to
    // ease from; and not before the prototype has loaded, or a blank sheet
    // would fade in ahead of it
    let frame = requestAnimationFrame(function reveal() {
      if (contentRef.current?.childElementCount) setIsRevealed(true);
      else frame = requestAnimationFrame(reveal);
    });
    return () => cancelAnimationFrame(frame);
  }, [piece, settles]);

  // Closes once. The frame shrinks straight back into the tile, the prototype
  // dissolving into the tile's picture on the way.
  const requestClose = (afterKey = false) => {
    if (isClosing.current) return;
    isClosing.current = true;
    setTimeout(
      () => {
        isClosing.current = false;
        setIsRevealed(false);
        onClose();
      },
      afterKey ? CLOSE_KEY_DELAY : 0
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
                  ref={contentRef}
                  className="absolute inset-0 overflow-auto bg-white transition-[opacity,filter] ease-out"
                  style={{
                    opacity: isRevealed ? 1 : 0,
                    filter: settles && !isRevealed ? "blur(8px)" : "blur(0px)",
                    transitionDuration: `${settles ? EMERGE_MS : SETTLE_MS}ms`,
                  }}
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
