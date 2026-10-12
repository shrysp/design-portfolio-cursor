/**
 * The cookie that says "this browser entered a valid access code".
 *
 * A signed token, not a session id: the middleware runs before every tour
 * request and must be able to check it without a round trip to the store. It
 * carries only the code's hash and an expiry, and it is httpOnly, so page
 * script — the visitor's own or anyone else's — can neither read nor forge it.
 * Being signed is not the same as being current: whether the code has since
 * been revoked or spent is checked against the store when a session starts.
 *
 * Web Crypto only, so the same file runs in middleware and in route handlers.
 */

export const ACCESS_COOKIE = 'tour_access';
/** How long an entered code keeps a browser unlocked. */
export const ACCESS_TTL_SECONDS = 7 * 24 * 60 * 60;

const encoder = new TextEncoder();

async function key(): Promise<CryptoKey | null> {
  const secret = process.env.TOUR_SESSION_SECRET;
  // Too short to be a real secret is treated as none: nothing verifies.
  if (!secret || secret.length < 32) return null;
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function signAccess(codeId: string): Promise<string> {
  const k = await key();
  if (!k) throw new Error('TOUR_SESSION_SECRET is not set (32 characters or more).');
  const exp = Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS;
  const payload = toBase64Url(encoder.encode(JSON.stringify({ id: codeId, exp })));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, encoder.encode(payload)));
  return `${payload}.${toBase64Url(sig)}`;
}

/** The code's id if the token is ours and unexpired; null for anything else. */
export async function verifyAccess(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const [payload, sig, extra] = token.split('.');
  if (!payload || !sig || extra !== undefined) return null;
  try {
    const k = await key();
    if (!k) return null;
    const ok = await crypto.subtle.verify('HMAC', k, fromBase64Url(sig), encoder.encode(payload));
    if (!ok) return null;
    const { id, exp } = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (typeof id !== 'string' || typeof exp !== 'number' || exp < Date.now() / 1000) return null;
    return id;
  } catch {
    return null;
  }
}

/** For route handlers: the code id behind a request's cookie, or null. */
export function accessFrom(request: Request): Promise<string | null> {
  const match = request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${ACCESS_COOKIE}=([^;]+)`));
  return verifyAccess(match?.[1]);
}
