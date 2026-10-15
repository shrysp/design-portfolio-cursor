import { headers } from 'next/headers';
import { userAgent } from 'next/server';

/**
 * Whether this request comes from a phone, for the tour's "best on a laptop"
 * screen. Read from the user agent on the server, so a phone never gets the
 * tour first and the screen after. Tablets count as big enough: an iPad
 * reports itself as a Mac, and an Android tablet as a tablet.
 */
export async function onPhone() {
  return userAgent({ headers: await headers() }).device.type === 'mobile';
}
