/**
 * A message to Shreyas, written on the site — the contact card in the tour,
 * and the "no code?" card on the way in — and sent from here, so nobody has
 * to leave the page for a mail app.
 *
 * Sent with Resend (https://resend.com), by its HTTP API, to his own address,
 * with the visitor's address as Reply-To: replying in his inbox answers them.
 * RESEND_API_KEY turns it on; CONTACT_FROM is the sender, which has to be on a
 * domain verified with Resend unless it is Resend's own test sender, and that
 * one can only send to the account's own address (which this always does).
 *
 * Reachable without an access code — a visitor without one is exactly who
 * the way in offers it to — so it is limited per address, and anything that
 * fills the field people cannot see is dropped as a bot.
 */

import { getStore } from '@/lib/tour/server/store';
import { accessFrom } from '@/lib/tour/server/auth';
import { visitorFirstName } from '@/lib/tour/server/access';

const TO = 'shreyaspatil.design@gmail.com';
const FROM = process.env.CONTACT_FROM ?? 'PIP <onboarding@resend.dev>';
/** Messages per address per hour. */
const LIMIT = 5;
const WINDOW_SECONDS = 60 * 60;
const MAX_MESSAGE = 4000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const from = typeof body.from === 'string' ? body.from.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const where = body.where === 'entrance' ? 'the way in (no code)' : 'the tour';

  // The field a person never sees: a bot fills it, and is told it worked.
  if (typeof body.website === 'string' && body.website) return Response.json({ ok: true });
  if (!EMAIL.test(from) || from.length > 200) {
    return Response.json({ error: 'Enter an email address he can reply to.' }, { status: 400 });
  }
  if (!message || message.length > MAX_MESSAGE) {
    return Response.json({ error: 'Write a message first.' }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('[contact] RESEND_API_KEY is not set; the composer falls back to a mail app.');
    return Response.json({ error: 'unavailable' }, { status: 503 });
  }

  // Vercel sets x-forwarded-for itself; the first entry is the caller.
  const address = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  try {
    const store = getStore();
    const counter = `contact:sent:${address}`;
    const n = await store.cmd<number>('INCR', counter);
    if (n === 1) await store.cmd('EXPIRE', counter, WINDOW_SECONDS);
    if (n > LIMIT) {
      return Response.json({ error: 'That’s a lot of messages. Try again in an hour.' }, { status: 429 });
    }
  } catch (err) {
    // A store that cannot be reached does not stop a message to him.
    console.error('[contact]', err);
  }

  // Who it is, if they came in with a code of their own.
  const id = await accessFrom(request);
  const name = id ? await visitorFirstName(id) : '';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: from,
      // From the way in, it is someone asking for a code: say so, so it stands out.
      subject: body.where === 'entrance' ? `${from} asked for a PIP tour code` : `${name || from} wrote from the PIP tour`,
      text: `${message}\n\n—\nFrom ${name ? `${name} <${from}>` : from}, on ${where}. Reply to this email to answer them.`,
    }),
  }).catch((err) => {
    console.error('[contact]', err);
    return null;
  });
  if (!res?.ok) {
    if (res) console.error('[contact] Resend returned', res.status, await res.text().catch(() => ''));
    return Response.json({ error: 'It didn’t send. Try again in a moment.' }, { status: 502 });
  }
  return Response.json({ ok: true });
}
