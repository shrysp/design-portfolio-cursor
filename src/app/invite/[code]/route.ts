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
 */

import { NextResponse } from "next/server";
import { refreshVisitor, unlock } from "@/lib/tour/server/access";
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
