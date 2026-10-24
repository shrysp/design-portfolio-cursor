import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_COOKIE, verifyAccess } from '@/lib/tour/server/auth';
import { HARD_REFRESH_COOKIE } from '@/lib/tour/hardRefresh';

/**
 * The tour's front door, and every page's note of a hard refresh.
 *
 * Under the tour's paths nothing is served — not the page, not a model call —
 * to a browser without a valid access cookie. Each route checks again for
 * itself; this is the first of two locks, not the only one.
 */
export const config = {
  matcher: ['/projects/cameo/tour/:path*', '/api/tour/:path*', '/((?!_next/|api/|.*\\..*).*)'],
};

const isTour = (pathname: string) => pathname.startsWith('/projects/cameo/tour') || pathname.startsWith('/api/tour');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isTour(pathname)) return noteHardRefresh(request);
  // The one tour route a locked-out browser must be able to reach.
  if (pathname === '/api/tour/unlock') return NextResponse.next();

  if (await verifyAccess(request.cookies.get(ACCESS_COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'An access code is required.' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/projects/cameo#tour', request.url));
}

/**
 * A page can't tell a hard refresh from a normal reload — both are a
 * "reload" to it — but the request can: a hard refresh asks for the page
 * fresh (Cache-Control: no-cache), a normal reload only revalidates
 * (max-age=0). Noted in a cookie for a few seconds, for the dock's tour
 * invitation (DockInvite), which comes out on a hard refresh but not a reload.
 */
function noteHardRefresh(request: NextRequest) {
  const response = NextResponse.next();
  const page = request.headers.get('sec-fetch-dest') === 'document';
  const fresh = /no-cache/.test(`${request.headers.get('cache-control')} ${request.headers.get('pragma')}`);
  if (page && fresh) response.cookies.set(HARD_REFRESH_COOKIE, '1', { maxAge: 30, path: '/', sameSite: 'lax' });
  return response;
}
