/**
 * An invitation's share picture: the invitation as it ends — PIP smiling over
 * the slot — with this visitor's own ticket hanging from it, where the clip
 * (public/og/video/invite.mp4) shows one that reads YOU. For the apps that
 * show a picture rather than play the clip: Slack, WhatsApp, LinkedIn, X.
 *
 * Drawn on a still of that scene with the ticket taken out (both made by
 * `npm run og:videos`), at the scene's size, so it is the same ticket, only
 * theirs. A long ticket runs off the bottom, as paper hanging out of a
 * printer would; the whole note is in the preview's text.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { previewInvite } from "@/lib/tour/server/access";
import plate from "@/lib/invite-plate.json";

// The ticket's own paper and print (components/cameo/entrance/ticket.css)
const PAPER_LIT = "#dfe4d2";
const PAPER = "#d6d4c8";
const PAPER_SHADE = "#c9c7bb";
const STUB = "#b3b1a6";
const PRINT = "#26261f";
const INK = "#233a7e";

/** The ticket's sizes on the page, in px, made as much larger as the scene is. */
const px = (n: number) => Math.round(n * plate.scale);

const read = (...parts: string[]) =>
  readFile(path.join(process.cwd(), ...parts));

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const preview =
    code.length <= 64
      ? await previewInvite(decodeURIComponent(code), address).catch(() => null)
      : null;
  const ticket = preview?.ticket;
  // No ticket to print: the case study's own picture, which is where the link goes
  if (!ticket)
    return NextResponse.redirect(new URL("/og/cameo.jpg", request.url));

  const [scene, doto, kalam] = await Promise.all([
    read("public/og/invite-plate.jpg"),
    read("assets/og/Doto.woff"),
    read("assets/og/Kalam.woff"),
  ]);
  const number =
    ticket.number > 0 ? `No. ${String(ticket.number).padStart(2, "0")}` : "";
  const dots = { fontFamily: "Doto", fontWeight: 900, lineHeight: 1 } as const;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/jpeg;base64,${scene.toString("base64")}`}
        width={1200}
        height={630}
        style={{ position: "absolute", inset: 0 }}
        alt=""
      />
      <div
        style={{
          position: "absolute",
          top: plate.top - 2,
          left: plate.center - plate.width / 2,
          width: plate.width,
          display: "flex",
          flexDirection: "column",
          color: PRINT,
          boxShadow: "0 16px 24px rgba(0, 0, 0, 0.55)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: `${px(20)}px ${px(20)}px ${px(16)}px`,
            // Lit at the top by PIP, darker as it hangs away
            backgroundImage: `linear-gradient(to bottom, ${PAPER_LIT}, ${PAPER} 55%, ${PAPER_SHADE})`,
          }}
        >
          <div
            style={{
              ...dots,
              fontSize: px(11),
              letterSpacing: "0.04em",
              opacity: 0.6,
            }}
          >
            PIP · AN INTERACTIVE TOUR
          </div>
          <div
            style={{
              ...dots,
              fontSize: px(15),
              marginTop: px(16),
              opacity: 0.75,
            }}
          >
            ADMIT ONE
          </div>
          <div style={{ ...dots, fontSize: px(36), marginTop: px(6) }}>
            {ticket.name.toUpperCase()}
          </div>
          <div
            style={{
              ...dots,
              display: "flex",
              justifyContent: "space-between",
              fontSize: px(12),
              marginTop: px(12),
              opacity: 0.7,
            }}
          >
            <span>GUEST OF SHREYAS</span>
            <span>{number}</span>
          </div>
          {ticket.note && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: px(18),
                fontFamily: "Kalam",
                fontSize: px(19),
                lineHeight: 1.25,
                color: INK,
              }}
            >
              <span>{ticket.note}</span>
              <span style={{ marginTop: px(6), alignSelf: "flex-end" }}>
                — Shreyas
              </span>
            </div>
          )}
        </div>
        {/* The stub, under its perforation */}
        <div
          style={{
            ...dots,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: px(54),
            fontSize: px(13),
            backgroundColor: STUB,
            borderTop: `${px(2)}px dashed rgba(0, 0, 0, 0.28)`,
            opacity: 0.95,
          }}
        >
          Pull down to tear ↓
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Doto", data: doto, weight: 900, style: "normal" },
        { name: "Kalam", data: kalam, weight: 400, style: "normal" },
      ],
      // Theirs: not kept anywhere shared for long, so an edited note shows soon
      headers: { "Cache-Control": "private, max-age=300" },
    },
  );
}
