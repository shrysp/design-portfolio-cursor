/**
 * An invitation link: /invite/<their code>.
 *
 * Does what typing the code would — checks it, on the server, against the
 * same attempt limit — and then, instead of the code screen, takes them to
 * the way in already unlocked (/projects/cameo/invite), where an invited
 * guest gets the ticket PIP prints for them (their Notion row ticked Invite)
 * and anyone else goes straight in.
 *
 * Their row is read from Notion on the way, briefly, so a box just ticked or a
 * note just written is what they see. A link that does not open anything
 * lands on the case study's own way in, where a code can still be typed.
 *
 * An app drawing the link's preview (iMessage, Slack, WhatsApp…) is not let
 * in: it gets a page of its own, addressed to the guest (invitePreview).
 */

import { NextResponse } from "next/server";
import { isLinkPreviewer } from "@/lib/linkPreview";
import {
  previewInvite,
  refreshVisitor,
  unlock,
} from "@/lib/tour/server/access";
import {
  ACCESS_COOKIE,
  ACCESS_TTL_SECONDS,
  signAccess,
} from "@/lib/tour/server/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const back = NextResponse.redirect(
    new URL("/projects/cameo#tour", request.url),
  );
  if (!code || code.length > 64) return back;

  // Vercel sets x-forwarded-for itself; the first entry is the caller.
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isLinkPreviewer(request))
    return invitePreview(request, code, address, back);
  try {
    const result = await unlock(decodeURIComponent(code), address);
    if (!result.ok) return back;
    await refreshVisitor(result.id, 2500).catch(() => {});
    const res = NextResponse.redirect(
      new URL("/projects/cameo/invite", request.url),
    );
    res.cookies.set(ACCESS_COOKIE, await signAccess(result.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TTL_SECONDS,
    });
    return res;
  } catch (err) {
    console.error("[invite]", err);
    return back;
  }
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * What an invitation link looks like where it is sent, addressed to the
 * guest: their name in the title, and a line under it on what PIP does.
 * Shreyas's note is left to their ticket, since it is written to them alone.
 * Where the app plays video, it plays the invitation opening — PIP waking and
 * printing a ticket (public/og/video/invite.mp4); elsewhere it shows that
 * ticket with their name and note on it (./ticket). Someone with a code but
 * no ticket goes straight into the tour, so theirs previews as the tour.
 *
 * Read without unlocking anything, on a limit of its own (previewInvite); a
 * code that opens nothing previews as the case study it falls back to.
 */
async function invitePreview(
  request: Request,
  code: string,
  address: string,
  back: NextResponse,
) {
  const preview = await previewInvite(decodeURIComponent(code), address).catch(
    () => null,
  );
  if (!preview) return back;
  const { name, ticket } = preview;
  const Name = name.charAt(0).toUpperCase() + name.slice(1);
  // The same lines for everyone: the note is written to one person and stays on their ticket
  const title = Name ? `${Name}, PIP\u2019s been expecting you` : "PIP\u2019s been expecting you";
  const description =
    "Ask about Shreyas and PIP answers with stories and photos from his life.";
  const at = (p: string) => new URL(p, request.url).toString();
  const image = ticket
    ? at(`/invite/${encodeURIComponent(code)}/ticket`)
    : at("/og/cameo.jpg");
  const video = at(ticket ? "/og/video/invite.mp4" : "/og/video/cameo.mp4");
  const meta: [string, string][] = [
    ["og:type", "website"],
    ["og:site_name", "Shreyas Patil"],
    ["og:url", request.url],
    ["og:title", title],
    ["og:description", description],
    ["og:image", image],
    ["og:image:width", "1200"],
    ["og:image:height", "630"],
    ["og:video", video],
    ["og:video:secure_url", video],
    ["og:video:type", "video/mp4"],
    ["og:video:width", "1200"],
    ["og:video:height", "630"],
    ["twitter:card", "summary_large_image"],
    ["twitter:title", title],
    ["twitter:description", description],
    ["twitter:image", image],
  ];
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<meta name="robots" content="noindex, nofollow">
${meta.map(([p, c]) => `<meta property="${p}" content="${escape(c)}">`).join("\n")}
</head><body></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Never kept and handed to a person following the link
      "Cache-Control": "private, no-store",
      Vary: "User-Agent",
    },
  });
}
