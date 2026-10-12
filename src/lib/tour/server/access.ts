/**
 * Access codes and what each one has spent.
 *
 * One code per person. A code is stored only as its SHA-256, under
 * `tour:code:<hash>`, with a label, a budget in seconds of voice session, and
 * the seconds used so far. `scripts/tour-codes.mjs` adds, lists and revokes
 * them; nothing in the site can create one.
 *
 * Voice time is the cost that matters ($0.05 a minute, billed while connected),
 * so that is what the budget counts. A session's whole allowance is charged
 * when it starts and the unused part handed back when it ends, measured by
 * this server's clock rather than anything the browser reports — a session
 * that never says goodbye simply keeps what it reserved.
 */

import { getStore, toRecord } from './store';

/** The longest one session may run. */
export const SESSION_CAP_SECONDS = 5 * 60;
/** What a new code gets unless the script says otherwise: 20 minutes in all. */
export const DEFAULT_BUDGET_SECONDS = 20 * 60;
/** Less than this left is not worth opening a session for. */
const MIN_SESSION_SECONDS = 20;

/** Wrong codes allowed per address before it has to wait out the window. */
const UNLOCK_ATTEMPTS = 8;
const UNLOCK_WINDOW_SECONDS = 10 * 60;

const codeKey = (id: string) => `tour:code:${id}`;

export async function hashCode(code: string): Promise<string> {
  // Codes are typed by people: case and stray spaces or dashes must not matter.
  const normal = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normal));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * A development server without a store has nowhere to keep codes between
 * restarts, so it takes one from TOUR_DEV_CODE. Never in production: there the
 * store is required and this does nothing.
 */
async function seedDevCode() {
  const code = process.env.TOUR_DEV_CODE;
  if (process.env.NODE_ENV === 'production' || !code) return;
  const key = codeKey(await hashCode(code));
  const rec = toRecord(await getStore().cmd<string[]>('HGETALL', key));
  if (rec.label) return;
  await getStore().cmd(
    'HSET', key, 'label', 'dev', 'budget', DEFAULT_BUDGET_SECONDS, 'used', 0,
    'name', process.env.TOUR_DEV_NAME ?? '',
    'note', process.env.TOUR_DEV_NOTE ?? '',
    'photos', process.env.TOUR_DEV_PHOTOS ?? '',
  );
}

/**
 * Who a code was made for, as far as its owner chose to say. Every code is
 * one person's, so the tour can greet them as themselves — see
 * visitorInstructions in context.ts. All of it is optional and all of it is
 * written by the site's owner (scripts/tour-codes.mjs), never by the visitor.
 */
export type Visitor = {
  /** What PIP should call them. */
  name?: string;
  /** Something true about them and Shreyas, for PIP to bring up once. */
  note?: string;
  /** Ids from the photo library to bring to the centre as PIP says hello. */
  photos: string[];
};

export type UnlockResult = { ok: true; id: string } | { ok: false; status: 401 | 429 };

export async function unlock(code: string, address: string): Promise<UnlockResult> {
  await seedDevCode();
  const store = getStore();
  const attempts = `tour:unlock:${address}`;
  const n = await store.cmd<number>('INCR', attempts);
  if (n === 1) await store.cmd('EXPIRE', attempts, UNLOCK_WINDOW_SECONDS);
  if (n > UNLOCK_ATTEMPTS) return { ok: false, status: 429 };

  const id = await hashCode(code);
  const rec = toRecord(await store.cmd<string[]>('HGETALL', codeKey(id)));
  if (!rec.label || rec.revoked === '1') return { ok: false, status: 401 };
  return { ok: true, id };
}

export type StartResult =
  | { ok: true; maxSeconds: number; visitor: Visitor }
  | { ok: false; status: 401 | 402; error: string };

/** Charges a session's allowance up front and says how long it may run. */
export async function startSession(id: string): Promise<StartResult> {
  await seedDevCode();
  const store = getStore();
  const key = codeKey(id);
  const rec = toRecord(await store.cmd<string[]>('HGETALL', key));
  if (!rec.label || rec.revoked === '1') {
    return { ok: false, status: 401, error: 'This access code is no longer valid.' };
  }

  // A session still marked open was never ended properly — a closed tab, or a
  // client that chose not to say so. It keeps everything it reserved.
  if (rec.openAt) await store.cmd('HDEL', key, 'openAt', 'openReserve');

  const reserve = Math.min(SESSION_CAP_SECONDS, Number(rec.budget ?? 0) - Number(rec.used ?? 0));
  if (reserve < MIN_SESSION_SECONDS) {
    return { ok: false, status: 402, error: 'This access code has used all of its tour time.' };
  }

  // Reserve first, check after: two tabs starting at once cannot both squeeze
  // in under the budget, because the increment is the atomic step.
  const used = await store.cmd<number>('HINCRBY', key, 'used', reserve);
  if (used > Number(rec.budget ?? 0)) {
    await store.cmd('HINCRBY', key, 'used', -reserve);
    return { ok: false, status: 402, error: 'This access code has used all of its tour time.' };
  }
  await store.cmd('HSET', key, 'openAt', Date.now(), 'openReserve', reserve, 'lastUsed', Date.now());
  return {
    ok: true,
    maxSeconds: reserve,
    visitor: {
      name: rec.name || undefined,
      note: rec.note || undefined,
      photos: (rec.photos ?? '').split(',').map((p) => p.trim()).filter(Boolean),
    },
  };
}

/**
 * Hands back what an ended session did not use. `refundAll` is for a session
 * that never opened — the model refused it — and so cost nothing.
 */
export async function endSession(id: string, refundAll = false): Promise<void> {
  const store = getStore();
  const key = codeKey(id);
  const rec = toRecord(await store.cmd<string[]>('HGETALL', key));
  if (!rec.openAt) return;
  // Whoever deletes the marker does the refund; a second call finds nothing.
  if ((await store.cmd<number>('HDEL', key, 'openAt')) !== 1) return;
  await store.cmd('HDEL', key, 'openReserve');

  const reserve = Number(rec.openReserve ?? 0);
  const elapsed = refundAll ? 0 : Math.ceil((Date.now() - Number(rec.openAt)) / 1000);
  const refund = Math.max(0, reserve - elapsed);
  if (refund > 0) await store.cmd('HINCRBY', key, 'used', -refund);
}
