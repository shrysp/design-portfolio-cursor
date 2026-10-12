/**
 * Who the tour's visitors are, as written in Notion.
 *
 * One row of a Notion database per person: a code to give them, what PIP
 * should call them, what it should know about them. Adding a row is all it
 * takes to let someone in — no change to this repository, which is public
 * and is no place for a list of who is being shown what.
 *
 * Notion is where this is written, not where the tour reads it from while it
 * runs. access.ts keeps a copy of each person's row in the store beside their
 * time budget and refreshes it now and then, so starting a session never
 * waits on Notion and still works when Notion does not.
 *
 * The properties, by name (the title column can be called anything):
 *
 *   Code            text      what they type in. At least MIN_CODE_LENGTH letters and digits.
 *   Greet as        text      what PIP calls them
 *   Greeting note   text      one true thing PIP may say aloud when it says hello
 *   Context         text      who they are and what to bring out for them — not said aloud as such
 *   Minutes         number    their time budget; empty means the default
 *   Welcome photos  multi-select or text   ids from src/data/tour-images.ts, shown during the hello
 *   Active          checkbox  untick to stop the code working; a table without the column is all active
 *   Minutes used    number    written back by the site
 *   Last visit      date      written back by the site
 */

const API = process.env.NOTION_API_URL ?? 'https://api.notion.com';
const VERSION = '2022-06-28';

/** A code shorter than this could be guessed inside the wrong-code allowance, so its row is ignored. */
export const MIN_CODE_LENGTH = 8;

export type NotionVisitor = {
  /** The row's page id. */
  page: string;
  label: string;
  code: string;
  name: string;
  note: string;
  context: string;
  minutes: number | null;
  photos: string[];
  active: boolean;
};

export const notionConfigured = () => Boolean(process.env.NOTION_TOKEN && process.env.NOTION_VISITORS_DB);
/** The story page is its own switch: the tour can take its visitors from Notion without its story, or the reverse. */
export const storyConfigured = () => Boolean(process.env.NOTION_TOKEN && process.env.NOTION_STORY_PAGE);

async function notion(path: string, init: { method?: string; body?: unknown; timeoutMs?: number } = {}) {
  const res = await fetch(`${API}/v1/${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': VERSION,
      'Content-Type': 'application/json',
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
    signal: AbortSignal.timeout(init.timeoutMs ?? 4000),
  });
  return res;
}

type Property = {
  type?: string;
  title?: { plain_text?: string }[];
  rich_text?: { plain_text?: string }[];
  number?: number | null;
  checkbox?: boolean;
  multi_select?: { name?: string }[];
};
type Page = { id: string; archived?: boolean; in_trash?: boolean; properties?: Record<string, Property> };

const text = (p: Property | undefined) =>
  (p?.rich_text ?? p?.title ?? [])
    .map((t) => t.plain_text ?? '')
    .join('')
    .trim();

function read(page: Page): NotionVisitor {
  const props = page.properties ?? {};
  const title = Object.values(props).find((p) => p.type === 'title');
  const photos = props['Welcome photos'];
  return {
    page: page.id,
    label: text(title) || 'Unnamed',
    code: text(props['Code']),
    name: text(props['Greet as']),
    note: text(props['Greeting note']),
    context: text(props['Context']),
    minutes: typeof props['Minutes']?.number === 'number' ? props['Minutes'].number : null,
    photos: (photos?.multi_select
      ? photos.multi_select.map((o) => o.name ?? '')
      : text(photos).split(',')
    )
      .map((id) => id.trim())
      .filter(Boolean),
    // No Active column at all means nobody has been switched off.
    active: props['Active']?.type === 'checkbox' ? props['Active'].checkbox === true : true,
  };
}

/** Every row of the visitors table. A few dozen people is one request; this stops at a few hundred. */
export async function listVisitors(): Promise<NotionVisitor[]> {
  const out: NotionVisitor[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < 5; i++) {
    const res = await notion(`databases/${process.env.NOTION_VISITORS_DB}/query`, {
      method: 'POST',
      body: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
    });
    if (!res.ok) throw new Error(`Notion ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const body = (await res.json()) as { results: Page[]; has_more?: boolean; next_cursor?: string | null };
    out.push(...body.results.filter((p) => !p.archived && !p.in_trash).map(read));
    if (!body.has_more || !body.next_cursor) break;
    cursor = body.next_cursor;
  }
  return out;
}

/** One person's row as it is now, or null if the row has been deleted. */
export async function getVisitor(page: string, timeoutMs?: number): Promise<NotionVisitor | null> {
  const res = await notion(`pages/${page}`, { timeoutMs });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Notion ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const body = (await res.json()) as Page;
  return body.archived || body.in_trash ? null : read(body);
}

/** Writes what a person has used back to their row, so the table doubles as the record of who came. */
export async function reportUsage(page: string, minutesUsed: number, lastVisit: Date): Promise<void> {
  const res = await notion(`pages/${page}`, {
    method: 'PATCH',
    body: {
      properties: {
        'Minutes used': { number: minutesUsed },
        'Last visit': { date: { start: lastVisit.toISOString() } },
      },
    },
  });
  if (!res.ok) throw new Error(`Notion ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

type Block = {
  type: string;
  has_children?: boolean;
  id: string;
} & Record<string, { rich_text?: { plain_text?: string }[] } | unknown>;

const blockText = (b: Block) =>
  ((b[b.type] as { rich_text?: { plain_text?: string }[] } | undefined)?.rich_text ?? [])
    .map((t) => t.plain_text ?? '')
    .join('')
    .trim();

async function children(id: string, timeoutMs?: number): Promise<Block[]> {
  const out: Block[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < 5; i++) {
    const res = await notion(`blocks/${id}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`, {
      timeoutMs,
    });
    if (!res.ok) throw new Error(`Notion ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const body = (await res.json()) as { results: Block[]; has_more?: boolean; next_cursor?: string | null };
    out.push(...body.results);
    if (!body.has_more || !body.next_cursor) break;
    cursor = body.next_cursor;
  }
  return out;
}

/**
 * A Notion page as the plain text PIP is given: what Shreyas has written
 * about himself, in his own headings and paragraphs. Headings, paragraphs,
 * lists and quotes come through; anything that is not words — an image, a
 * table, an embedded page — is left out rather than guessed at. Callouts are
 * left out on purpose: they are where he can write notes to himself on the
 * page, starting with the one that explains it. Lists and toggles are
 * followed one level down, and a heading with nothing under it is dropped.
 */
export async function getStory(page: string, timeoutMs?: number): Promise<string> {
  const lines: string[] = [];
  const add = async (blocks: Block[], depth: number) => {
    for (const b of blocks) {
      const words = blockText(b);
      if (b.type.startsWith('heading_')) {
        if (words) lines.push('', `## ${words}`);
      } else if (b.type === 'bulleted_list_item' || b.type === 'numbered_list_item' || b.type === 'to_do') {
        if (words) lines.push(`${'  '.repeat(depth)}- ${words}`);
      } else if (['paragraph', 'quote', 'toggle'].includes(b.type)) {
        if (words) lines.push(words);
      } else continue;
      if (b.has_children && depth < 1) await add(await children(b.id, timeoutMs), depth + 1);
    }
  };
  await add(await children(page, timeoutMs), 0);
  // A heading with nothing under it yet — a section still to be written — says
  // nothing, and a bare "Work so far" could be read as there being none.
  const kept = lines.filter((line, i) => {
    if (!line.startsWith('## ')) return true;
    const next = lines.slice(i + 1).find((l) => l !== '');
    return next !== undefined && !next.startsWith('## ');
  });
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
