#!/usr/bin/env node
/**
 * The Notion table of who may take the PIP tour.
 *
 *   npm run tour:notion -- setup <page>   make the table inside a Notion page (its link or id)
 *   npm run tour:notion -- story <page>   make the page PIP's story is written on, with its headings
 *   npm run tour:notion -- check          read the table the way the site does, and say what is wrong
 *
 * Needs NOTION_TOKEN (and, for check, NOTION_VISITORS_DB) in the environment
 * or .env.local. The page given to setup must be shared with the integration
 * the token belongs to: in Notion, the page's ••• menu, Connections.
 *
 * After setup, people are added in Notion and nowhere else: a row with a Code
 * is a person who can get in. The columns are described in
 * src/lib/tour/server/notion.ts.
 */

import { existsSync, readFileSync } from 'node:fs';

if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const API = process.env.NOTION_API_URL ?? 'https://api.notion.com';
const MIN_CODE_LENGTH = 8;

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function notion(path, method = 'GET', body) {
  if (!process.env.NOTION_TOKEN) fail('NOTION_TOKEN is not set. Put it in .env.local.');
  const res = await fetch(`${API}/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) fail(`Notion said ${res.status}: ${json.message ?? 'no message'}`);
  return json;
}

/** A Notion link ends in the page's 32-character id; a bare id is taken as it is. */
function pageId(input) {
  const hex = (input ?? '').split('?')[0].replace(/-/g, '').match(/[0-9a-f]{32}$/i);
  if (!hex) fail('Give the Notion page to put the table in: its link, or its id.');
  return hex[0];
}

const text = (content) => ({ rich_text: [{ text: { content } }] });

async function setup(where) {
  const parent = pageId(where);
  const db = await notion('databases', 'POST', {
    parent: { type: 'page_id', page_id: parent },
    title: [{ text: { content: 'Tour visitors' } }],
    properties: {
      Person: { title: {} },
      Code: { rich_text: {} },
      'Greet as': { rich_text: {} },
      'Greeting note': { rich_text: {} },
      Context: { rich_text: {} },
      Minutes: { number: { format: 'number' } },
      'Welcome photos': { multi_select: { options: [] } },
      Active: { checkbox: {} },
      'Minutes used': { number: { format: 'number' } },
      'Last visit': { date: {} },
    },
  });
  // A row to copy from. Not active, and its code is not one anyone should use.
  await notion('pages', 'POST', {
    parent: { database_id: db.id },
    properties: {
      Person: { title: [{ text: { content: 'Example — Jordan at Figma' } }] },
      Code: text('CHANGE-THIS-CODE-7Q2K'),
      'Greet as': text('Jordan'),
      'Greeting note': text('He and Shreyas met at Config 2024.'),
      Context: text(
        'Design lead on an AI product team. Cares about craft in small interactions and about designers who work closely with engineering.',
      ),
      Minutes: { number: 20 },
      'Welcome photos': { multi_select: [{ name: 'config-2024-design-team' }] },
      Active: { checkbox: false },
    },
  });
  console.log(`Made the table "Tour visitors".\n\nAdd this to .env.local, and to the site's environment on Vercel:\n\n  NOTION_VISITORS_DB=${db.id}\n`);
}

async function check() {
  const db = process.env.NOTION_VISITORS_DB;
  if (!db) fail('NOTION_VISITORS_DB is not set. Put it in .env.local.');
  const { results } = await notion(`databases/${db}/query`, 'POST', { page_size: 100 });
  const plain = (p) => (p?.rich_text ?? p?.title ?? []).map((t) => t.plain_text ?? '').join('').trim();
  const known = new Set(
    [...readFileSync('src/data/tour-images.ts', 'utf8').matchAll(/\{ id: '([^']+)'/g)].map((m) => m[1]),
  );
  const seen = new Map();
  let ready = 0;
  for (const page of results) {
    const p = page.properties;
    const label = plain(Object.values(p).find((x) => x.type === 'title')) || 'Unnamed';
    const code = plain(p.Code).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const problems = [];
    if (!code) problems.push('no Code, so nobody can use this row');
    else if (code.length < MIN_CODE_LENGTH) problems.push(`Code is shorter than ${MIN_CODE_LENGTH} letters and digits, so it is ignored`);
    else if (seen.has(code)) problems.push(`same Code as "${seen.get(code)}" — only one of them will work`);
    else seen.set(code, label);
    const photos = p['Welcome photos']?.multi_select?.map((o) => o.name) ?? plain(p['Welcome photos']).split(',');
    for (const id of photos.map((x) => x.trim()).filter(Boolean)) {
      if (!known.has(id)) problems.push(`no photo called "${id}"`);
    }
    if (plain(p.Context).length > 1500) problems.push('Context is over 1,500 characters; the rest is not used');
    const active = p.Active?.type === 'checkbox' ? p.Active.checkbox : true;
    if (!problems.length && active) ready++;
    console.log(`${problems.length ? '✗' : active ? '✓' : '–'} ${label}${active ? '' : '  (not active)'}`);
    for (const problem of problems) console.log(`    ${problem}`);
  }
  console.log(`\n${results.length} rows, ${ready} ready to use.`);
}

const heading = (content) => ({ object: 'block', type: 'heading_2', heading_2: { rich_text: [{ text: { content } }] } });
// Callouts are notes to the writer: the site does not read them (see getStory in notion.ts).
const note = (content) => ({ object: 'block', type: 'callout', callout: { rich_text: [{ text: { content } }], icon: { type: 'emoji', emoji: '✏️' } } });

const SECTIONS = [
  ['In one breath', 'Two or three sentences on who you are. This is the answer to "tell me about him."'],
  ['The path', 'Short chapters in order, each with a place and rough years.'],
  ['Work so far', 'Each role as plain facts: where, when, what you did, who you worked with.'],
  ['Stories', 'One story per entry, six to ten in all: what happened in three to five sentences, then one line on what it shows.'],
  ['How he works', 'Process, working with engineers, giving and taking feedback, tools. Point to a story where you can.'],
  ['What he believes about design', 'Three to five opinions, each with one example.'],
  ['Now and next', 'What you are looking for and what kind of team. Only what you are happy for PIP to say aloud.'],
  ['Outside work', 'Sport, travel, places. Most of the photos belong here.'],
  ['Quick facts', 'A list: where you live, education, years of experience, tools, languages. One fact in one place only.'],
  ['Ask him directly', 'Topics PIP should hand to you. Salary, relocation, availability and visa status already are.'],
];

async function story(where) {
  const page = await notion('pages', 'POST', {
    parent: { type: 'page_id', page_id: pageId(where) },
    properties: { title: { title: [{ text: { content: "PIP's story" } }] } },
    children: [
      note(
        'Everything on this page is what PIP knows about Shreyas, and nothing else is. Boxes like this one are notes to yourself: PIP does not read them, and a heading with nothing under it is skipped. Write facts rather than praise. Edits reach the tour within about five minutes. Images and tables are ignored.',
      ),
      ...SECTIONS.flatMap(([name, prompt]) => [heading(name), note(prompt)]),
    ],
  });
  console.log(`Made the page "PIP's story". The tour does not open until something is written on it.\n\nAdd this to .env.local, and to the site's environment on Vercel:\n\n  NOTION_STORY_PAGE=${page.id}\n`);
}

const [command, arg] = process.argv.slice(2);
if (command === 'setup') await setup(arg);
else if (command === 'check') await check();
else if (command === 'story') await story(arg);
else fail('Usage: npm run tour:notion -- setup <page>  |  story <page>  |  check');
