/**
 * Trades an access code for the cookie that opens the tour.
 *
 * The only tour route reachable without that cookie, so it is the one place
 * guessing can happen: attempts are counted per address (see access.ts), and
 * a wrong code gets the same answer whether it never existed or was revoked.
 */

import { NextResponse } from 'next/server';
import { unlock } from '@/lib/tour/server/access';
import { ACCESS_COOKIE, ACCESS_TTL_SECONDS, signAccess } from '@/lib/tour/server/auth';

export async function POST(request: Request) {
  const { code } = await request.json().catch(() => ({}));
  if (typeof code !== 'string' || !code.trim() || code.length > 64) {
    return NextResponse.json({ error: 'Enter your access code.' }, { status: 400 });
  }

  // Vercel sets x-forwarded-for itself; the first entry is the caller.
  const address = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

  try {
    const result = await unlock(code, address);
    if (!result.ok) {
      return NextResponse.json(
        {
          error:
            result.status === 429
              ? 'Too many attempts. Try again in a few minutes.'
              : 'That code is not valid.',
        },
        { status: result.status },
      );
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ACCESS_COOKIE, await signAccess(result.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TTL_SECONDS,
    });
    return res;
  } catch (err) {
    console.error('[tour/unlock]', err);
    return NextResponse.json({ error: 'The tour is not available right now.' }, { status: 503 });
  }
}

/** Locks this browser again. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ACCESS_COOKIE);
  return res;
}
