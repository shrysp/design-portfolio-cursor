import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_COOKIE, verifyAccess } from '@/lib/tour/server/auth';

/**
 * The tour's front door. Nothing under these paths is served — not the page,
 * not a model call — to a browser without a valid access cookie. Each route
 * checks again for itself; this is the first of two locks, not the only one.
 */
export const config = {
  matcher: ['/projects/cameo/tour/:path*', '/api/tour/:path*'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // The one tour route a locked-out browser must be able to reach.
  if (pathname === '/api/tour/unlock') return NextResponse.next();

  if (await verifyAccess(request.cookies.get(ACCESS_COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'An access code is required.' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/projects/cameo#tour', request.url));
}
