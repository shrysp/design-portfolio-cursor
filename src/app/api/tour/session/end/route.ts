/**
 * Says a session is over, so the time it did not use goes back to its code.
 * How long it ran is measured here, from when it started — not taken from the
 * browser. Sent with sendBeacon as a tab closes.
 *
 * The body, when there is one, lists the answers the backend model wrote this
 * session, so they can be charged to the code (see chargeResponses). Only
 * their ids: what each cost is asked of OpenAI.
 *
 * It also carries the session's conversation (`exchange`), which is saved to
 * the visitor's page in Notion (saveExchange) — after the answer, like the
 * rest, so nobody waits on Notion.
 */

import { after } from 'next/server';
import { chargeResponses, endSession, reportVisit, saveExchange } from '@/lib/tour/server/access';
import { accessFrom } from '@/lib/tour/server/auth';

export async function POST(request: Request) {
  const id = await accessFrom(request);
  if (!id) return Response.json({ error: 'An access code is required.' }, { status: 401 });
  const { responses, exchange } = await request.json().catch(() => ({}));
  try {
    await endSession(id);
    after(async () => {
      await chargeResponses(id, responses).catch((err) => console.error('[tour/session/end]', err));
      await reportVisit(id);
      await saveExchange(id, exchange);
    });
  } catch (err) {
    console.error('[tour/session/end]', err);
  }
  return Response.json({ ok: true });
}
