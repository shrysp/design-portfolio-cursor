/**
 * What PIP knows about Shreyas, as he wrote it in Notion.
 *
 * His story is not in the code: a new anecdote would be a change and a push,
 * to a repository that is public. The words on the page NOTION_STORY_PAGE
 * names are the story: everything on it is what PIP knows, and nothing else
 * is. Without one the tour does not open (see api/tour/session) — a guide
 * with nothing to go on is worse than no guide.
 *
 * As with visitors (access.ts), the tour runs on a copy kept in the store.
 * The copy is refreshed when someone opens the tour and it is more than a few
 * minutes old, so an edit is live within minutes, a session never waits on
 * Notion, and Notion being down changes nothing.
 *
 * There is no review step between an edit and a visitor hearing it, which is
 * the price of not needing one. Two things stand in for it: a page that comes
 * back nearly empty is ignored (a half-deleted draft must not leave PIP
 * knowing nothing), and the bench at /dev/tour-bench reads the same page, so
 * a change can be put through the test questions before it is trusted.
 */

import { getStory, storyConfigured } from './notion';
import { getStore, toRecord } from './store';

const KEY = 'tour:story';
const SYNC_AFTER_MS = 5 * 60_000;
/** Shorter than this is not a story; the page was probably emptied by accident. */
const MIN_LENGTH = 400;
/**
 * The whole story is sent with every answer, so its length is paid for each
 * time and a model reads a long brief less carefully than a short one. Room
 * for about five thousand tokens, nearly all of them cached after a session's
 * first question. What does not fit is cut from the end of the page.
 */
export const MAX_LENGTH = 20_000;

export async function refreshStory(timeoutMs?: number): Promise<void> {
  if (!storyConfigured()) return;
  const store = getStore();
  const rec = toRecord(await store.cmd<string[]>('HGETALL', KEY));
  if (Date.now() - Number(rec.synced ?? 0) < SYNC_AFTER_MS) return;
  try {
    const text = await getStory(process.env.NOTION_STORY_PAGE!, timeoutMs);
    if (text.length < MIN_LENGTH) {
      console.error(`[tour] The Notion story page has only ${text.length} characters; keeping what was there.`);
      await store.cmd('HSET', KEY, 'synced', Date.now());
      return;
    }
    if (text.length > MAX_LENGTH) {
      console.error(`[tour] The Notion story is ${text.length} characters; only the first ${MAX_LENGTH} are used.`);
    }
    await store.cmd('HSET', KEY, 'text', text.slice(0, MAX_LENGTH), 'synced', Date.now());
  } catch (err) {
    console.error('[tour] The Notion story could not be read; using the saved copy.', err);
  }
}

/** The story as last read from Notion, or nothing — in which case there is no tour to give. */
export async function currentStory(): Promise<string | undefined> {
  if (!storyConfigured()) return undefined;
  return toRecord(await getStore().cmd<string[]>('HGETALL', KEY)).text || undefined;
}
