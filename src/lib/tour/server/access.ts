/**
 * Access codes and what each one has spent.
 *
 * One code per person. A code is stored only as its SHA-256, under
 * `tour:code:<hash>`, with a label, a budget in seconds of voice session, and
 * the seconds used so far. `scripts/tour-codes.mjs` adds, lists and revokes
 * them; nothing in the site can create one.
 *
 * People can also be written in Notion — one row each, see notion.ts. A row
 * becomes a record here the first time its code is entered, and the record is
 * then a copy of the row: refreshed when its owner comes back, so an edit or
 * an unticked Active box takes effect, and good enough to run on if Notion
 * cannot be reached. What a code has spent is never Notion's: it lives here.
 *
 * Voice time is the cost that matters ($0.05 a minute, billed while connected),
 * so that is what the budget counts. A session's whole allowance is charged
 * when it starts and the unused part handed back when it ends, measured by
 * this server's clock rather than anything the browser reports — a session
 * that never says goodbye simply keeps what it reserved.
 */

import { MIN_CODE_LENGTH, type NotionVisitor, appendExchange, getVisitor, listVisitors, notionConfigured, reportUsage } from './notion';
import { type ResponsesUsage, backendMicros, voiceMicros } from './costs';
import { getStore, hasRealStore, toRecord } from './store';

/** The longest one session may run. */
export const SESSION_CAP_SECONDS = 5 * 60;
/** What a new code gets unless the script says otherwise: 20 minutes in all. */
export const DEFAULT_BUDGET_SECONDS = 20 * 60;
/** Less than this left is not worth opening a session for. */
export const MIN_SESSION_SECONDS = 20;

/** Wrong codes allowed per address before it has to wait out the window. */
const UNLOCK_ATTEMPTS = 8;
const UNLOCK_WINDOW_SECONDS = 10 * 60;

/** How old a copy of a Notion row may be before it is looked at again. */
const SYNC_AFTER_MS = 60_000;
/** Most of a person's context that PIP is given. Longer costs more on every answer and is read less well. */
const MAX_CONTEXT = 1500;
const MAX_NOTE = 300;

const codeKey = (id: string) => `tour:code:${id}`;

export async function hashCode(code: string): Promise<string> {
  // Codes are typed by people: case and stray spaces or dashes must not matter.
  const normal = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normal));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * A development server without a store has nowhere to keep codes between
 * restarts, so it takes one from TOUR_DEV_CODE. Never in production, and
 * never into a real store: a development server pointed at the live one would
 * otherwise write its test code where the live site would honour it.
 */
async function seedDevCode() {
  const code = process.env.TOUR_DEV_CODE;
  if (process.env.NODE_ENV === 'production' || !code || hasRealStore()) return;
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
  /** Who they are and what to bring out for them — for PIP to know, not to recite. */
  context?: string;
};

/** Copies a Notion row into this code's record. Never touches what the code has spent. */
async function saveFromNotion(id: string, row: NotionVisitor) {
  await getStore().cmd(
    'HSET', codeKey(id),
    'label', row.label,
    'budget', Math.round((row.minutes ?? DEFAULT_BUDGET_SECONDS / 60) * 60),
    'name', row.name,
    'note', row.note.slice(0, MAX_NOTE),
    'context', row.context.slice(0, MAX_CONTEXT),
    'photos', row.photos.join(','),
    'page', row.page,
    'revoked', row.active ? '0' : '1',
    'invite', row.invite ? '1' : '0',
    'inviteNo', row.inviteNo ?? '',
    'inviteNote', row.inviteNote.slice(0, MAX_INVITE_NOTE),
    'synced', Date.now(),
  );
}

/** Long enough for a few lines in his hand on the ticket; no longer, or it is a letter. */
const MAX_INVITE_NOTE = 280;

/** An invitation, as its ticket shows it. */
export type Invitation = { name: string; number: number; note?: string };

/**
 * The ticket for a code whose Notion row is ticked Invite, from the saved
 * copy of that row; null for a code without one. The name is what PIP calls
 * them, or the row's own title when that is empty.
 */
export async function invitationFor(id: string): Promise<Invitation | null> {
  const rec = toRecord(await getStore().cmd<string[]>('HGETALL', codeKey(id)));
  if (rec.invite !== '1' || rec.revoked === '1') return null;
  const name = (rec.name || rec.label || '').trim().split(/\s+/)[0];
  if (!name) return null;
  return { name, number: Number(rec.inviteNo) || 0, note: rec.inviteNote?.trim() || undefined };
}

/** Whether a Notion row is the one this code id was made from. */
async function isRowFor(id: string, row: NotionVisitor) {
  const letters = row.code.replace(/[^a-z0-9]/gi, '');
  return letters.length >= MIN_CODE_LENGTH && (await hashCode(row.code)) === id;
}

/**
 * Brings a code's record up to date with its Notion row, if it has one and
 * the copy is old enough to be worth checking. A row that is gone, switched
 * off, or has had its code changed stops the old code working. Notion being
 * unreachable changes nothing: the copy stands.
 */
export async function refreshVisitor(id: string, timeoutMs?: number): Promise<void> {
  if (!notionConfigured()) return;
  const store = getStore();
  const rec = toRecord(await store.cmd<string[]>('HGETALL', codeKey(id)));
  if (!rec.page || Date.now() - Number(rec.synced ?? 0) < SYNC_AFTER_MS) return;
  try {
    const row = await getVisitor(rec.page, timeoutMs);
    if (row && (await isRowFor(id, row))) await saveFromNotion(id, row);
    else await store.cmd('HSET', codeKey(id), 'revoked', '1', 'synced', Date.now());
  } catch (err) {
    console.error('[tour] Notion could not be read; using the saved copy.', err);
  }
}

/**
 * The visitor's first name, for the tour's welcome — from the saved copy of
 * their Notion row, so it costs no call to Notion. Empty when there is none.
 */
export async function visitorFirstName(id: string): Promise<string> {
  try {
    const rec = toRecord(await getStore().cmd<string[]>('HGETALL', codeKey(id)));
    return (rec.name ?? '').trim().split(/\s+/)[0] ?? '';
  } catch {
    return '';
  }
}

/** Adds the price of a token-billed call made for this code to what it has cost. */
export async function chargeApi(id: string, micros: number): Promise<void> {
  if (micros > 0) await getStore().cmd('HINCRBY', codeKey(id), 'apiMicros', micros);
}

const RESPONSES = 'https://api.openai.com/v1/responses';
/** More answers than one session could hold is not a session's list. */
const MAX_RESPONSES = 60;
const RESPONSE_ID = /^resp_[A-Za-z0-9]{8,120}$/;
/** Seen response ids, so none is charged twice. */
const CHARGED = 'tour:charged';

/**
 * Charges the answers the backend model wrote during a session. The browser
 * sees their ids go past and hands them in when the session ends; what each
 * one cost is then asked of OpenAI, not taken from the browser. An id is
 * charged once, to whoever hands it in first, and one that is not this
 * account's simply is not found.
 */
export async function chargeResponses(id: string, ids: unknown): Promise<void> {
  const key = process.env.OPENAI_API_KEY;
  if (!key || !Array.isArray(ids)) return;
  const store = getStore();
  const fresh: string[] = [];
  for (const r of ids.slice(0, MAX_RESPONSES)) {
    if (typeof r !== 'string' || !RESPONSE_ID.test(r)) continue;
    if ((await store.cmd<number>('HINCRBY', CHARGED, r, 1)) === 1) fresh.push(r);
  }
  const costs = await Promise.all(
    fresh.map(async (r) => {
      try {
        const res = await fetch(`${RESPONSES}/${r}`, {
          headers: { Authorization: `Bearer ${key}` },
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return 0;
        return backendMicros(((await res.json()) as { usage?: ResponsesUsage }).usage);
      } catch {
        return 0;
      }
    }),
  );
  await chargeApi(id, costs.reduce((a, b) => a + b, 0));
}

/** Tells the person's Notion row what they have used. Best effort: the tour does not depend on it. */
export async function reportVisit(id: string): Promise<void> {
  if (!notionConfigured()) return;
  const rec = toRecord(await getStore().cmd<string[]>('HGETALL', codeKey(id)));
  if (!rec.page) return;
  const used = Number(rec.used ?? 0);
  const cost = (voiceMicros(used) + Number(rec.apiMicros ?? 0)) / 1e6;
  try {
    await reportUsage(rec.page, {
      minutesUsed: Math.round((used / 60) * 10) / 10,
      lastVisit: new Date(Number(rec.lastUsed) || Date.now()),
      cost: Math.round(cost * 100) / 100,
    });
  } catch (err) {
    console.error('[tour] Could not write usage back to Notion.', err);
  }
}

/** What a session's conversation may be, as the browser reports it: kept to a sane size. */
const MAX_EXCHANGE_LINES = 200;
const MAX_EXCHANGE_LINE = 2000;

/**
 * Saves a session's conversation to the visitor's page in Notion (see
 * appendExchange). Reported by their own browser at the session's end — the
 * voice runs between the browser and the model, so the server never hears
 * it — and only for a code that has a page. A session where the visitor said
 * nothing is not saved.
 */
export async function saveExchange(id: string, raw: unknown): Promise<void> {
  if (!notionConfigured() || !Array.isArray(raw)) return;
  const lines = raw
    .filter((l): l is { who: 'you' | 'pip'; text: string } => (l?.who === 'you' || l?.who === 'pip') && typeof l?.text === 'string')
    .map((l) => ({ who: l.who, text: l.text.trim().slice(0, MAX_EXCHANGE_LINE) }))
    .filter((l) => l.text)
    .slice(0, MAX_EXCHANGE_LINES);
  if (!lines.some((l) => l.who === 'you')) return;
  const rec = toRecord(await getStore().cmd<string[]>('HGETALL', codeKey(id)));
  if (!rec.page) return;
  try {
    await appendExchange(rec.page, lines, new Date());
  } catch (err) {
    console.error('[tour] Could not save the conversation to Notion.', err);
  }
}

export type UnlockResult = { ok: true; id: string } | { ok: false; status: 401 | 429 };

export async function unlock(code: string, address: string): Promise<UnlockResult> {
  await seedDevCode();
  const store = getStore();
  const attempts = `tour:unlock:${address}`;
  const n = await store.cmd<number>('INCR', attempts);
  if (n === 1) await store.cmd('EXPIRE', attempts, UNLOCK_WINDOW_SECONDS);
  if (n > UNLOCK_ATTEMPTS) return { ok: false, status: 429 };

  const id = await hashCode(code);
  let rec = toRecord(await store.cmd<string[]>('HGETALL', codeKey(id)));
  if (notionConfigured()) {
    // Someone coming back is let in on the saved copy, not kept waiting on
    // Notion: the tour page refreshes their row from Notion as soon as it has
    // been sent (refreshVisitor, page.tsx), and a session will not start for a
    // row that has since been switched off (startSession).
    if (!rec.label) {
      // A code this store has not seen. It may be a row added in Notion since
      // — the one moment the whole table is read, and it is behind the
      // attempt limit above.
      for (const row of await listVisitors()) {
        if (!(await isRowFor(id, row))) continue;
        await saveFromNotion(id, row);
        break;
      }
    }
    rec = toRecord(await store.cmd<string[]>('HGETALL', codeKey(id)));
  }
  if (!rec.label || rec.revoked === '1') return { ok: false, status: 401 };
  return { ok: true, id };
}

export type StartResult =
  | { ok: true; maxSeconds: number; remaining: number; visitor: Visitor }
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
    // What the code will have left once this session has run its full length.
    remaining: Number(rec.budget ?? 0) - used,
    visitor: {
      name: rec.name || undefined,
      note: rec.note || undefined,
      photos: (rec.photos ?? '').split(',').map((p) => p.trim()).filter(Boolean),
      context: rec.context || undefined,
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
