#!/usr/bin/env node
/**
 * Access codes for the PIP tour — one per person.
 *
 *   npm run tour:codes -- add "Jordan at Figma"        a new code, 20 minutes
 *   npm run tour:codes -- add "Jordan at Figma" 40     …or another number of minutes
 *   npm run tour:codes -- add "Jordan at Figma" 20 --name Jordan \
 *       --note "He and Shreyas met at Config 2024." --photos config-2024-design-team
 *                                                      …and PIP greets them as themselves
 *   npm run tour:codes -- set "Jordan at Figma" --note "…"   change who a code is for
 *   npm run tour:codes -- list                         who has one, and what they've used
 *   npm run tour:codes -- revoke "Jordan at Figma"     stop a code working, at once
 *
 * Talks to the same Upstash store the site reads (UPSTASH_REDIS_REST_URL and
 * _TOKEN, from the environment or .env.local). A code is shown once, when it
 * is made: only its hash is stored, so it cannot be looked up again.
 *
 * --name is what PIP calls them. --note is one true thing about them and
 * Shreyas, which PIP brings up once — write it as something you are happy to
 * hear said aloud to them. --photos are ids from src/data/tour-images.ts
 * (comma-separated, up to three) that come to the centre as PIP says hello.
 */

import { createHash, randomInt } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
if (!url || !token) {
  console.error('Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (in .env.local or the environment).');
  process.exit(1);
}

async function cmd(...args) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const body = await res.json();
  if (!res.ok || body.error) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body.result;
}

/** Every id ever issued, so `list` has something to walk. */
const INDEX = 'tour:codes';
const codeKey = (id) => `tour:code:${id}`;
// Must match hashCode in src/lib/tour/server/access.ts.
const hash = (code) =>
  createHash('sha256').update(code.toUpperCase().replace(/[^A-Z0-9]/g, '')).digest('hex');

// No 0/O or 1/I/L: these get read aloud and typed by hand.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode = () =>
  Array.from({ length: 3 }, () =>
    Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join(''),
  ).join('-');

const record = (flat) => Object.fromEntries(flat.flatMap((v, i) => (i % 2 ? [] : [[v, flat[i + 1]]])));

async function all() {
  const ids = await cmd('SMEMBERS', INDEX);
  return Promise.all(ids.map(async (id) => ({ id, ...record(await cmd('HGETALL', codeKey(id))) })));
}

const argv = process.argv.slice(2);
/** --name, --note and --photos, wherever they appear; everything else is positional. */
const who = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const flag = argv[i].match(/^--(name|note|photos)$/)?.[1];
  if (flag) who[flag] = (argv[++i] ?? '').trim().slice(0, flag === 'note' ? 400 : 120);
  else positional.push(argv[i]);
}
const [action, label, minutes] = positional;
const whoFields = Object.entries(who).flat();

if (action === 'add' && label) {
  const budget = Math.round(Number(minutes ?? 20) * 60);
  if (!(budget > 0)) throw new Error('Minutes must be a positive number.');
  const code = newCode();
  const id = hash(code);
  await cmd('HSET', codeKey(id), 'label', label, 'budget', budget, 'used', 0, 'created', Date.now(), ...whoFields);
  await cmd('SADD', INDEX, id);
  console.log(`\n  ${code}\n\n  for ${label} — ${budget / 60} minutes of tour. It is not shown again.\n`);
} else if (action === 'set' && label && whoFields.length) {
  const hits = (await all()).filter((r) => r.label === label);
  if (!hits.length) throw new Error(`No code labelled "${label}".`);
  for (const r of hits) await cmd('HSET', codeKey(r.id), ...whoFields);
  console.log(`Updated ${label}. It applies from their next session.`);
} else if (action === 'list') {
  const rows = await all();
  if (!rows.length) console.log('No codes yet.');
  for (const r of rows) {
    const used = (Number(r.used ?? 0) / 60).toFixed(1);
    const of = (Number(r.budget ?? 0) / 60).toFixed(0);
    const last = r.lastUsed ? new Date(Number(r.lastUsed)).toISOString().slice(0, 10) : 'never used';
    console.log(`${r.revoked === '1' ? 'revoked ' : '        '}${(r.label ?? '?').padEnd(32)} ${used} of ${of} min   ${last}`);
    for (const f of ['name', 'note', 'photos']) if (r[f]) console.log(`          ${f}: ${r[f]}`);
  }
} else if (action === 'revoke' && label) {
  const hits = (await all()).filter((r) => r.label === label);
  if (!hits.length) throw new Error(`No code labelled "${label}".`);
  for (const r of hits) await cmd('HSET', codeKey(r.id), 'revoked', 1);
  console.log(`Revoked ${hits.length} code(s) for ${label}. A tour already in progress runs out its session.`);
} else {
  console.log('Usage: tour-codes add "<label>" [minutes] [--name … --note … --photos id,id] | set "<label>" --… | list | revoke "<label>"');
  process.exit(1);
}
