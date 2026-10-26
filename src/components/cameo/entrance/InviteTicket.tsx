"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Doto } from "next/font/google";
import "./ticket.css";
import { EASE_OVERSHOOT, css } from "@/lib/easing";
import { playRecipe } from "@shrysp/cameo/sound";
import { TICKET_FEED, TICKET_TEAR } from "@/lib/tour/tour-sounds";

/** The code screen's dot-matrix, loaded here too: the ticket is drawn outside that screen (see the layer below). */
const dots = Doto({
  subsets: ["latin"],
  axes: ["ROND"],
  variable: "--font-dot",
  display: "block",
});

/**
 * Who an invitation is for: what PIP calls them, which invitation of the run
 * it is, and a line in Shreyas's own hand. From their row in Notion.
 */
export type Invite = {
  name: string;
  number: number;
  note?: string;
};

/** Screen left under the stub for a pull to tear it (TEAR_AT), with some to spare. */
const PULL_ROOM = 100;
/** As small as a long note may make the ticket: below this the hand gets hard to read. */
const MIN_SCALE = 0.7;
/** How long the ticket takes to feed out of the slot (ticket.css, ticket-print). */
const PRINT_MS = 1700;
/** How long the torn stub takes to fall away, before the way in carries on. */
const FALL_MS = 680;
/** How far the hand has to pull before the stub gives, in px. */
const TEAR_AT = 55;
/** A flick tears it short of TEAR_AT: down at least FLICK_AT px, averaging over TEAR_SPEED px per ms. */
const FLICK_AT = 12;
const TEAR_SPEED = 0.11;
/** How quickly the stub catches up with the hand, per frame: under 1 is mass. */
const FOLLOW = 0.28;
/** The stub at rest: curled a little further than the paper (ticket.css). */
const REST = "rotateX(12deg)";

/**
 * How far the stub actually moves for a pull of `dy`: heavily — about a third
 * of the hand's travel, the paper holding on — until it gives at TEAR_AT and
 * comes away on its own. No long drag after that: the rip is the release.
 */
const give = (dy: number) => dy * 0.32;

/**
 * Which end of the stub is pulled: -1 the left, 1 the right — the half it was
 * grabbed by. That end drops and tears away first; the stub hinges on the
 * other corner (HINGE).
 */
type Side = -1 | 1;
/** The corner the stub turns on, for a pull at that side: the far one. */
const HINGE: Record<Side, string> = { [-1]: "90% 0", 1: "10% 0" };

/**
 * Where a pull puts the stub: it gives (above), and turns on its far corner so
 * the pulled end drops — a turn toward that side; the other way would lift it
 * up over the ticket — and the perforation opens from that end first, as
 * paper starts to tear.
 */
function pulled(dx: number, dy: number, side: Side = -1) {
  const g = give(dy);
  const k = Math.min(1, dy / TEAR_AT);
  return `${REST} translate(${(dx * 0.12).toFixed(1)}px, ${(g * 0.2).toFixed(1)}px) rotateZ(${(side * k * 9 + dx * 0.015).toFixed(2)}deg)`;
}
/** The rest of the ticket, dragged down a little by the pull: the tension in it. */
const tugged = (dy: number) =>
  `translateY(${(give(dy) * 0.3).toFixed(2)}px) rotateX(${(give(dy) * 0.12).toFixed(2)}deg)`;

/**
 * An invitation, in place of the code: PIP prints a ticket for them. It feeds
 * out of a slot under PIP in bursts, as a receipt printer's does, everything
 * on it already — the print in dots, Shreyas's note in his hand — and its
 * stub is pulled off to go in.
 *
 * Torn by dragging the stub down, and made to feel like paper: it trails the
 * hand a little (mass), holds on heavily at first (resistance), drags the
 * ticket down with it (tension), and is ripped along a ragged line from the
 * moment the pull starts. Past TEAR_AT it gives: the stub snaps loose and
 * falls the way it was pulled, and the ticket springs back up and wobbles.
 * Let go short of that and it springs back. A click tugs it, to show it
 * pulls; Enter tears it, for the keyboard.
 *
 * Thermal paper rather than the tour's plastic: the one thing on the way in
 * that is theirs to keep.
 *
 * Drawn in a layer of its own over the CRT glass, not under it with a hole
 * cut in the glass: a hole is a rectangle, and the paper is not — it feeds
 * out, curls, sways and tears — so anything but the paper itself covering the
 * glass shows as a pale box or a scanlined edge.
 */
export default function InviteTicket({
  invite,
  show,
  onTear,
  top,
}: {
  invite: Invite;
  show: boolean;
  onTear: () => void;
  /** Where the slot is, from the top of the screen: under the greeting (TourEntrance). */
  top?: string;
}) {
  const [phase, setPhase] = useState<"idle" | "printing" | "ready" | "torn">(
    "idle",
  );
  const [ripped, setRipped] = useState(false);
  const ticket = useRef<HTMLDivElement>(null);
  const stub = useRef<HTMLButtonElement>(null);
  const tug = useRef<HTMLDivElement>(null);
  /** The hand (target) and where the stub has got to (at), while a pull lasts. */
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    target: { dx: number; dy: number };
    at: { dx: number; dy: number };
    raf: number;
    /** When it was grabbed, to tell a flick from a slow pull. */
    since: number;
  } | null>(null);
  /** The pulled end: set by where the stub is grabbed. */
  const side = useRef<Side>(-1);
  // Set when a pull is let go short of the tear, so the click that follows the
  // release doesn't start a tug over the spring back.
  const pulledJustNow = useRef(false);
  /** Whether this pull's rip has been heard: it sounds as the paper starts to go, not when it lets go. */
  const ripHeard = useRef(false);
  // A row with no number gets none printed, rather than "No. 00".
  const number =
    invite.number > 0 ? `No. ${String(invite.number).padStart(2, "0")}` : "";
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!show) {
      setPhase("idle");
      return;
    }
    setPhase("printing");
    // A tick later, and only for the mount that stays: Strict Mode's first
    // pass would otherwise print it twice over, and twice as loud.
    const sound = reduced() ? 0 : window.setTimeout(() => playRecipe(TICKET_FEED));
    const done = window.setTimeout(
      () => setPhase("ready"),
      reduced() ? 0 : PRINT_MS + 100,
    );
    return () => {
      window.clearTimeout(sound);
      window.clearTimeout(done);
    };
  }, [show]);

  // Ready to be torn: the stub has the keyboard, so Enter goes in.
  useEffect(() => {
    if (phase === "ready") stub.current?.focus({ preventScroll: true });
  }, [phase]);
  useEffect(() => () => cancelAnimationFrame(drag.current?.raf ?? 0), []);

  /** The stub and the ticket, written straight from a pull, frame by frame. */
  const pose = (dx: number, dy: number) => {
    if (stub.current)
      stub.current.style.transform = pulled(dx, dy, side.current);
    if (tug.current) tug.current.style.transform = tugged(dy);
  };

  /**
   * It gives. The stub snaps loose — a sharp drop as the tension goes — and
   * falls on the way it was pulled, under its weight; the ticket, let go,
   * springs back up past where it hung and wobbles to rest.
   */
  const tear = (dx: number, dy: number) => {
    if (phase !== "ready") return;
    const d = drag.current;
    if (d) cancelAnimationFrame(d.raf);
    drag.current = null;
    setRipped(true);
    setPhase("torn");
    // Torn with no pull to start it (Enter): the rip is heard now.
    if (!ripHeard.current) playRecipe(TICKET_TEAR);
    ripHeard.current = true;
    const el = stub.current;
    const t = tug.current;
    if (el) delete el.dataset.pulling;
    if (!reduced()) {
      const from = pulled(dx, dy, side.current);
      // It goes the way it was pulled: the dropped end leads the fall.
      const way = side.current;
      if (el) {
        el.style.transform = "";
        el.animate(
          [
            {
              transform: from,
              opacity: 1,
              offset: 0,
              easing: "cubic-bezier(0.2, 0.8, 0.3, 1)",
            },
            {
              transform: `${from} translateY(14px) rotateZ(${way * 4}deg)`,
              opacity: 1,
              offset: 0.14,
              easing: "cubic-bezier(0.5, 0, 1, 0.6)",
            },
            {
              transform: `rotateX(-55deg) rotateZ(${way * 24}deg) translate3d(${way * 40 + dx * 0.4}px, 230px, 40px)`,
              opacity: 0,
              offset: 1,
            },
          ],
          { duration: FALL_MS, fill: "forwards" },
        );
      }
      if (t) {
        const held = tugged(dy);
        t.style.transform = "";
        t.animate(
          [
            { transform: held },
            { transform: "translateY(-5px) rotateX(-2.5deg)", offset: 0.25 },
            { transform: "translateY(2px) rotateX(1.4deg)", offset: 0.55 },
            { transform: "translateY(-0.6px) rotateX(-0.4deg)", offset: 0.8 },
            { transform: "none" },
          ],
          { duration: 760, easing: "ease-out" },
        );
      }
      // A short buzz where a phone can: the snap, felt.
      navigator.vibrate?.(12);
    } else {
      if (el) el.style.transform = "";
      if (t) t.style.transform = "";
    }
    window.setTimeout(onTear, reduced() ? 0 : FALL_MS);
  };

  /** Back where it hangs, from wherever it is, with a little overshoot: paper springs. */
  const settle = (dx: number, dy: number) => {
    const el = stub.current;
    const t = tug.current;
    if (el) el.style.transform = "";
    if (t) t.style.transform = "";
    if (reduced()) {
      setRipped(false);
      return;
    }
    const spring = {
      duration: 420,
      easing: css(EASE_OVERSHOOT),
    };
    el?.animate(
      [{ transform: pulled(dx, dy, side.current) }, { transform: REST }],
      spring,
    );
    t?.animate([{ transform: tugged(dy) }, { transform: "none" }], spring);
    // Not torn after all: once it is back in place, the perforation again, not a rip.
    window.setTimeout(() => {
      if (drag.current) return;
      setRipped(false);
      if (stub.current) stub.current.style.transformOrigin = "";
    }, spring.duration);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (phase !== "ready" || e.button !== 0) return;
    pulledJustNow.current = false;
    ripHeard.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.dataset.pulling = "";
    // Grabbed on the left half, the left end is pulled; on the right, the right.
    const box = e.currentTarget.getBoundingClientRect();
    side.current = e.clientX < box.left + box.width / 2 ? -1 : 1;
    e.currentTarget.style.transformOrigin = HINGE[side.current];
    const d = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      target: { dx: 0, dy: 0 },
      at: { dx: 0, dy: 0 },
      raf: 0,
      since: performance.now(),
    };
    drag.current = d;
    // The stub follows the hand, catching up a share of the way each frame:
    // a thing with mass, not a sticker on the pointer.
    const step = () => {
      const now = drag.current;
      if (now !== d) return;
      d.at.dx += (d.target.dx - d.at.dx) * FOLLOW;
      d.at.dy += (d.target.dy - d.at.dy) * FOLLOW;
      pose(d.at.dx, d.at.dy);
      if (d.at.dy >= TEAR_AT) {
        tear(d.at.dx, d.at.dy);
        return;
      }
      d.raf = requestAnimationFrame(step);
    };
    d.raf = requestAnimationFrame(step);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.target.dx = e.clientX - d.x;
    d.target.dy = Math.max(0, e.clientY - d.y);
    // The rip starts with the pull: ragged from here on, open where the stub has come away.
    if (d.target.dy > 4 && !ripped) setRipped(true);
    // And sounds as it starts, once a pull.
    if (d.target.dy > 4 && !ripHeard.current) {
      ripHeard.current = true;
      playRecipe(TICKET_TEAR);
    }
  };
  const onPointerEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    cancelAnimationFrame(d.raf);
    drag.current = null;
    delete e.currentTarget.dataset.pulling;
    // Snatched down and let go: torn, though the stub hadn't caught up to the line.
    const speed = d.target.dy / Math.max(1, performance.now() - d.since);
    if (e.type === "pointerup" && d.target.dy > FLICK_AT && speed > TEAR_SPEED) {
      pulledJustNow.current = true;
      tear(d.at.dx, d.at.dy);
      return;
    }
    if (d.at.dy > 1) {
      pulledJustNow.current = true;
      settle(d.at.dx, d.at.dy);
    }
  };
  // Enter or Space (no pointer: detail is 0) tears it; a click without a pull tugs it, to show it pulls.
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (phase !== "ready") return;
    if (e.detail === 0) {
      tear(0, 0);
      return;
    }
    if (pulledJustNow.current) {
      pulledJustNow.current = false;
      return;
    }
    if (reduced() || drag.current) return;
    stub.current?.animate(
      [
        { transform: REST },
        { transform: pulled(0, 26, side.current) },
        { transform: REST },
      ],
      {
        duration: 460,
        easing: css(EASE_OVERSHOOT),
      },
    );
  };

  // In the document only: the layer is portalled to the body.
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);

  // A long note makes a long ticket, and hung from under the greeting its stub
  // went off the foot of a laptop screen, with no room to pull it down (the
  // Sarvam and Cardboard notes). Smaller than ticket.css makes it, then, until
  // the stub and a pull fit, as far as MIN_SCALE.
  useEffect(() => {
    const el = ticket.current;
    if (!el) return;
    const fit = () => {
      el.style.scale = "";
      // ticket.css's own scale for this screen height; "none" is 1.
      const base = Number(getComputedStyle(el).scale) || 1;
      const room = window.innerHeight - el.offsetTop - PULL_ROOM;
      const s = Math.min(base, Math.max(MIN_SCALE, room / el.offsetHeight));
      if (s < base) {
        el.style.transformOrigin = "50% 0";
        el.style.scale = String(s);
      }
    };
    fit();
    // The note's hand is a web font: the ticket is its true length once it has loaded.
    void document.fonts.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [host, invite.note, top]);
  if (!host) return null;

  return createPortal(
    <div className={`ticket-layer ${dots.variable}`}>
      <div
        ref={ticket}
        className="ticket"
        data-show={show}
        data-phase={phase}
        data-ripped={ripped ? "" : undefined}
        style={
          {
            "--print-ms": `${PRINT_MS}ms`,
            ...(top ? { top } : {}),
          } as CSSProperties
        }
      >
        {/* The printer's mouth, set into the glass under PIP. */}
        <div className="ticket-slot" aria-hidden="true" />
        <div className="ticket-feed">
          {/* The whole ticket, as the pull drags it down and lets it spring back. */}
          <div ref={tug} className="ticket-tug">
            <div
              className="ticket-paper"
              role="group"
              aria-label={`An invitation for ${invite.name}, guest of Shreyas${number ? `, ${number}` : ""}`}
            >
              <div className="ticket-body">
                <p className="ticket-head" aria-hidden="true">
                  PIP · AN INTERACTIVE TOUR
                </p>
                <p className="ticket-admit" aria-hidden="true">
                  ADMIT ONE
                </p>
                <p className="ticket-name" aria-hidden="true">
                  {invite.name.toUpperCase()}
                </p>
                <p className="ticket-meta" aria-hidden="true">
                  <span>GUEST OF SHREYAS</span>
                  <span>{number}</span>
                </p>
                {invite.note && (
                  <p className="ticket-note">
                    {invite.note}
                    <span className="ticket-sign">— Shreyas</span>
                  </p>
                )}
              </div>
              <button
                ref={stub}
                type="button"
                className="ticket-stub"
                aria-label="Tear off the stub to come in"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
                onClick={onClick}
                disabled={phase === "printing"}
              >
                <span className="ticket-stub-text">Pull down to tear</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M8 3v10M4 9l4 4 4-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    host,
  );
}
