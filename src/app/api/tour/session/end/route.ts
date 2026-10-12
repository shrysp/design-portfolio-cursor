/**
 * Says a session is over, so the time it did not use goes back to its code.
 * How long it ran is measured here, from when it started — not taken from the
 * browser. Sent with sendBeacon as a tab closes, hence no body to read.
 */

import { after } from 'next/server';
import { endSession, reportVisit } from '@/lib/tour/server/access';
import { accessFrom } from '@/lib/tour/server/auth';

export async function POST(request: Request) {
  const id = await accessFrom(request);
  if (!id) return Response.json({ error: 'An access code is required.' }, { status: 401 });
  try {
    await endSession(id);
    after(() => reportVisit(id));
  } catch (err) {
    console.error('[tour/session/end]', err);
  }
  return Response.json({ ok: true });
}
