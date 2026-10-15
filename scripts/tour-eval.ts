/**
 * How well Jev reads PIP's sentences: which photos it shows, which card it
 * hands over, and which face it puts on. Runs the real readSentence against
 * sentences whose right answers are written down here, and counts what it got
 * wrong.
 *
 *   npm run tour:eval                        every sentence, failures only
 *   npm run tour:eval -- --all               …and the ones it got right
 *   npm run tour:eval -- --model jev-1.14.0  try another Jev before pinning it
 *
 * Run it before and after changing a question, a caption or the model, and
 * compare. A change that fixes one sentence often breaks two others.
 *
 * The sentences are made up, written the way PIP talks. They are test inputs,
 * not facts about Shreyas: where one says something about his life, it is only
 * there to see which photo it brings up. Keep them to what the photos and
 * projects actually show, so none of them reads as a claim.
 *
 * Each costs about 10k Jev tokens, so a full run is well under a cent.
 * Reads TYPESAFE_API_KEY from the environment or .env.local.
 */

import fs from 'node:fs';
import { readSentence, type SentenceReading } from '@/lib/tour/server/read-sentence';
import { TOUR_IMAGES } from '@/data/tour-images';

function typesafeKey(): string {
  if (process.env.TYPESAFE_API_KEY) return process.env.TYPESAFE_API_KEY;
  const env = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
  const key = env.match(/^TYPESAFE_API_KEY=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '');
  if (!key) throw new Error('TYPESAFE_API_KEY is not set, here or in .env.local');
  return key;
}

const ids = (re: RegExp) => TOUR_IMAGES.map((p) => p.id).filter((id) => re.test(id));
const RIT = ids(/^(rit-|northern-lights|snow-covered|beautiful-sky2)/);
const ROCHESTER = ids(/^(sunset|fall|frozen|snow-storm|winter-sun|spring|boardwalk|beautiful-sky1|rit-)/);
const CONFIG = ids(/^config/);
const SNOW = ['frozen-tree', 'snow-covered-rit', 'snow-covered', 'winter-sun-shadows', 'snow-storm', 'rit-winter-with-ritchie', 'rit-waterway-winter'];
const MISSION_PEAK = ids(/^mission-peak/);
const AURORA = ids(/^northern-lights/);
const SUNSETS = ids(/^sunset/);
const GRADUATION = ['rit-graduation-with-mascot', 'rit-graduation-cap-throw'];
const BAY_AREA = ['golden-gate-bridge', 'san-francisco-piers', 'california-sunset', ...MISSION_PEAK];

type Case = {
  /** What the visitor asked, when it matters to the reading. */
  q?: string;
  /** One sentence PIP says. */
  s: string;
  /**
   * Photos it may show, and whether it must show at least one of them.
   * Left out: it should show none. `min`: a list, which should bring up at least that many.
   */
  photos?: { ok: string[]; need: boolean; min?: number };
  /**
   * The card it should hand over — a project's title, or `contact`. More than
   * one when either is fair. Left out: no card.
   */
  card?: string[];
  /** Moods that would be a fair reading. Left out: mood is not scored. */
  mood?: string[];
};

const CASES: Case[] = [
  // Photos
  { q: 'What was RIT like?', s: "He did his master's in HCI at RIT, in Rochester.", photos: { ok: [...RIT, ...ROCHESTER], need: true } },
  { s: "He graduated from RIT with a master's in HCI.", photos: { ok: GRADUATION, need: true } },
  { s: 'On graduation day he threw his cap in the air.', photos: { ok: GRADUATION, need: true } },
  { s: 'One night the northern lights came all the way down over campus.', photos: { ok: AURORA, need: true }, mood: ['excited', 'calm', 'neutral'] },
  { q: 'Did he ever see the aurora?', s: 'Yes, once, and it was pink and green right above the trees.', photos: { ok: AURORA, need: true } },
  { s: 'He shot the northern lights on his phone.', photos: { ok: AURORA, need: true } },
  { s: 'At Config he got to hang out with the Figma team that built Figma AI.', photos: { ok: ['config-2024-design-team', 'config-2024-tejas'], need: true } },
  { s: 'At Config he finally met Tejas in person.', photos: { ok: ['config-2024-tejas', 'config-2024-design-team'], need: true } },
  { s: 'Config 2024 was held at the Moscone Center in San Francisco.', photos: { ok: CONFIG, need: true } },
  { s: 'He met so many people at Config, from Marco to Miggi.', photos: { ok: ['config-2024-marco', 'config-2024-miggi'], need: true } },
  { s: 'He went to Config in 2024, the year Figma AI launched.', photos: { ok: CONFIG, need: true } },
  { s: 'Rochester winters were brutal, snow everywhere for months.', photos: { ok: SNOW, need: true } },
  { s: 'His first winter in Rochester, it snowed so much the roads disappeared.', photos: { ok: SNOW, need: true } },
  { s: 'But spring made up for it, with tulips everywhere.', photos: { ok: ['spring-tulips-dog'], need: true } },
  { s: 'His friend has the cutest little poodle.', photos: { ok: ['spring-tulips-dog'], need: true } },
  { s: 'Fall in Rochester was stunning, all reds and oranges.', photos: { ok: ['fall-colors'], need: true } },
  { s: "Rochester had some of the best sunsets he's ever seen.", photos: { ok: SUNSETS, need: true } },
  { s: "RIT has a big bronze statue of Ritchie the Tiger, the school's mascot.", photos: { ok: ['rit-winter-with-ritchie', 'rit-graduation-with-mascot'], need: true } },
  { s: "There's a lake on campus with swans he'd walk past.", photos: { ok: ['rit-lake-swans'], need: true } },
  { s: 'He loved how quiet the canal by campus got in winter.', photos: { ok: ['rit-waterway-winter'], need: true } },
  { s: 'On weekends he likes to hike Mission Peak.', photos: { ok: MISSION_PEAK, need: true } },
  { s: 'The view from the top of Mission Peak is worth the climb.', photos: { ok: MISSION_PEAK, need: true } },
  { s: "He's into the outdoors: hiking, kayaking, even scuba diving once.", photos: { ok: ['kayaking-adventure', 'scuba-diving-adventure', 'post-hike-reflection', ...MISSION_PEAK], need: true, min: 2 } },
  { s: 'He kayaked through the reeds with a couple of friends.', photos: { ok: ['kayaking-adventure'], need: true } },
  { s: 'He went scuba diving once, back in 2019.', photos: { ok: ['scuba-diving-adventure'], need: true } },
  { q: 'What does he do for fun?', s: 'He hikes, kayaks, and chases sunsets.', photos: { ok: ['kayaking-adventure', 'post-hike-reflection', 'california-sunset', ...MISSION_PEAK, ...SUNSETS], need: true } },
  { s: 'Config, the northern lights over campus and the Golden Gate Bridge were the highlights of his year.', photos: { ok: [...CONFIG, ...AURORA, 'golden-gate-bridge'], need: true, min: 2 } },
  { s: 'From the snowy winters to the spring tulips, Rochester had it all.', photos: { ok: [...SNOW, 'spring-tulips-dog'], need: true, min: 2 } },
  { s: 'He once watched the sun set into the Pacific from the cliffs.', photos: { ok: ['california-sunset'], need: true } },
  { s: 'On a trip to San Francisco he walked across the Golden Gate Bridge.', photos: { ok: ['golden-gate-bridge', 'san-francisco-piers'], need: true } },
  { q: 'Where was that headshot taken?', s: "That one's from Central Park in New York, one winter.", photos: { ok: ['headshot-winter'], need: true } },
  // Photos that may or may not come up, but nothing else should.
  { s: 'These days he lives in the Bay Area.', photos: { ok: BAY_AREA, need: false } },
  { s: 'He moved to California after finishing at RIT.', photos: { ok: BAY_AREA, need: false } },
  { s: "Sometimes he'd just stop and look up at the sky.", photos: { ok: ['beautiful-sky1', ...SUNSETS, ...AURORA], need: false } },
  { s: 'Working with the Figma team taught him a lot about AI in design tools.', photos: { ok: ['config-2024-design-team', 'config-2024-tejas'], need: false } },
  { q: 'Tell me about Rochester', s: "Rochester's a small city in upstate New York, right by Lake Ontario.", photos: { ok: [...ROCHESTER, ...RIT], need: false } },
  { s: 'RIT is where he learned to love the snow.', photos: { ok: SNOW, need: false } },
  { s: 'He has a soft spot for dogs.', photos: { ok: ['spring-tulips-dog'], need: false } },
  // Sharing a setting with a photo, but about something no photo shows.
  { s: 'Back at RIT he spent a lot of late nights in the design studio.' },
  { s: 'He took a class on accessibility at RIT.' },
  { s: 'Figma is the tool he spends most of his day in.' },
  { s: 'He loves designing tools that feel calm and quiet.', mood: ['calm', 'neutral', 'excited'] },
  { s: 'He cares a lot about simple, thoughtful interfaces.' },

  // Cards
  { s: 'Cameo is a little face for AI interfaces that blinks and follows your cursor.', card: ['Cameo'] },
  { s: "The face you're looking at right now is Cameo, and he published it as an npm package.", card: ['Cameo'] },
  { q: "What's his best project?", s: "I'd say Cameo, since it's the one you're talking to.", card: ['Cameo'] },
  { s: "I'd say Cameo is his best project.", card: ['Cameo'] },
  { q: 'Which project should I look at first?', s: 'Start with Quinn, it shows how he thinks best.', card: ['Quinn'] },
  { q: 'Which project should I look at first?', s: 'Any of them, really; Quinn, ItinerAI and DashWorks are all good places to start.', card: ['none', 'Quinn'] },
  { s: 'Quinn helps executives keep track of the people in their professional network.', card: ['Quinn'] },
  { s: 'The hardest part of Quinn was keeping it uncluttered for leaders with no time to spare.', card: ['Quinn'] },
  { s: 'ItinerAI makes planning a trip feel like having a team of helpful friends.', card: ['ItinerAI'] },
  { s: 'DashWorks is an AI assistant that pulls a company’s scattered knowledge into one place.', card: ['DashWorks'] },
  { s: 'WeatherWise was about making Google Maps routes safer in bad weather.', card: ['WeatherWise'] },
  { q: "What's the travel app?", s: "That's ItinerAI, where planning a trip feels like a team of friends helping out.", card: ['ItinerAI'] },
  { q: 'Did he do anything with Google Maps?', s: 'Yes, WeatherWise, which made routes safer when the weather turns.', card: ['WeatherWise'] },
  { q: 'What is the face on this page?', s: "That's Cameo, a little face for AI products that he published as a package.", card: ['Cameo'] },
  { s: "He's worked on five projects, from Cameo to WeatherWise.", card: ['none'] },
  // Shoe Dog is a book he loves, not one of his projects: never a card.
  { q: "What's his favourite book?", s: "His favourite book is Shoe Dog, Phil Knight's memoir about building Nike." },
  { q: 'Tell me about Shoe Dog', s: 'Shoe Dog is the story of how Phil Knight built Nike, and he loves how honest it is.' },
  { s: 'He keeps coming back to Shoe Dog for how messy building something real can be.' },
  { q: 'Can I see the maps project?', s: 'Sure, that one is WeatherWise.', card: ['WeatherWise'] },
  { s: "He's worked on ItinerAI, DashWorks and Quinn, among others." },
  { s: 'His work spans AI products, maps and online shopping.' },
  { s: 'If you would like to work with him, you can email him directly.', card: ['contact'] },
  { s: "That's a question for Shreyas himself, and you can reach him on LinkedIn.", card: ['contact'] },
  { s: "I don't know that one, but he'd be happy to tell you if you write to him.", card: ['contact'] },
  { q: 'How do I get in touch?', s: 'The easiest way is email, and he usually replies quickly.', card: ['contact'] },
  { s: "He's open to new roles right now.", card: ['contact', 'none'] },
  // The way context.ts tells PIP to offer a card.
  { q: 'How can I contact him?', s: "I'll hand you his contact card: his email, LinkedIn and X, and a way to write to him from right here.", card: ['contact'] },
  { q: 'What salary is he looking for?', s: "That one's for Shreyas himself, so I'll hand you his contact card.", card: ['contact'] },
  { q: 'Is he open to relocating?', s: "That's a question only he can answer, and I'll hand you his contact card so you can ask him.", card: ['contact'] },
  { q: 'Tell me about Quinn', s: "That's Quinn, and I'll hand you its case study to open.", card: ['Quinn'] },
  { q: 'What is ItinerAI?', s: "ItinerAI is one of his projects, and I'll hand you its case study.", card: ['ItinerAI'] },
  { q: 'Show me WeatherWise', s: "Here's WeatherWise; I'll hand you its case study to open.", card: ['WeatherWise'] },
  { q: 'Tell me about Cameo', s: "That's Cameo, and I'll hand you its case study to open.", card: ['Cameo'] },
  { q: 'Tell me about DashWorks', s: "That's DashWorks, and I'll hand you its case study to open.", card: ['DashWorks'] },
  { q: 'What was DashWorks?', s: "DashWorks is one of his projects; I'll hand you its case study.", card: ['DashWorks'] },
  { s: "Hi, I'm PIP, and I'll be your guide today.", mood: ['excited', 'calm', 'neutral'] },
  { s: "That's a lot like what he did in DashWorks, actually.", card: ['none', 'DashWorks'] },
  { s: 'You can read the whole ItinerAI case study on his site.', card: ['ItinerAI'] },
  { s: 'Want me to tell you about Quinn?', card: ['Quinn', 'none'], mood: ['curious', 'excited', 'calm', 'neutral'] },
  { s: 'He designed the weather-aware routing for WeatherWise himself.', card: ['WeatherWise'] },
  { s: "He'd love to hear from you.", card: ['contact'] },
  { s: 'Figma AI launched at Config that year.', photos: { ok: CONFIG, need: false } },
  { s: 'Cameo started as a side project and grew from there.', card: ['Cameo'] },

  // Mood
  { s: "Oh wow, that's a great question!", mood: ['excited', 'surprised'] },
  { s: 'He was thrilled when that design finally shipped!', mood: ['excited'] },
  { s: 'What kind of work do you do?', mood: ['curious'] },
  { s: "I wonder whether you're more into the research or the visuals?", mood: ['curious'] },
  { s: 'Should we look at Quinn or ItinerAI next? I’m trying to decide.', mood: ['curious', 'neutral'] },
  { s: "Oh! I didn't expect anyone to ask about that.", mood: ['surprised'] },
  { s: "Sorry, I couldn't load that case study just now.", mood: ['error'] },
  { s: 'Hmm, something went wrong on my end, let me try that again.', mood: ['error'] },
  { s: "I'm afraid I can't answer that one.", mood: ['error', 'neutral', 'calm', 'sad'] },
  { s: 'Honestly, the old tool was so slow it drove everyone up the wall.', mood: ['frustrated'] },
  { s: 'Ugh, that bug kept coming back no matter what they tried.', mood: ['frustrated'] },
  { s: 'Sadly, that project was shelved before it ever launched.', mood: ['sad'] },
  { s: 'Leaving the team he had grown with was hard for him.', mood: ['sad'] },
  { s: 'Sure, happy to walk you through it.', mood: ['calm', 'neutral', 'excited'] },
  { s: 'Got it.', mood: ['calm', 'neutral'] },
  { s: "Let's take a slow look at this one together.", mood: ['calm'] },
  { s: 'WeatherWise was a class project at RIT.', card: ['WeatherWise', 'none'], mood: ['neutral', 'calm'] },
  { s: 'The project took about four months from research to handoff.', mood: ['neutral', 'calm'] },
  { s: "Ha, that's a fun one.", mood: ['excited', 'calm', 'neutral'] },
  { s: "Wait, really? You've been to Rochester too?", photos: { ok: [...ROCHESTER, ...RIT], need: false }, mood: ['surprised', 'curious', 'excited'] },
  { s: 'That was a tough year for him.', mood: ['sad'] },
  { s: "Unfortunately that page isn't public yet.", mood: ['sad', 'error', 'neutral'] },
  { s: 'No rush, take your time.', mood: ['calm'] },
  { s: 'Hmm, let me think about that for a second.', mood: ['curious', 'calm', 'neutral'] },
  { s: "That's not something I can share.", mood: ['neutral', 'calm', 'error'] },
  { s: 'They kept changing the brief every single week, which was maddening.', mood: ['frustrated'] },
  { s: 'Honestly, I think that was the best thing he ever made.', mood: ['excited'] },
];

type Result = { c: Case; r?: SentenceReading; error?: string; wrong: string[] };

function score(c: Case, r: SentenceReading): string[] {
  const wrong: string[] = [];
  const ok = c.photos?.ok ?? [];
  const extra = r.images.filter((i) => !ok.includes(i.id)).map((i) => i.id);
  if (extra.length) wrong.push(`photo: showed ${extra.join(', ')}`);
  if (c.photos?.need && !r.images.some((i) => ok.includes(i.id))) wrong.push('photo: missed');
  if (c.photos?.min && r.images.filter((i) => ok.includes(i.id)).length < c.photos.min) {
    wrong.push(`photo: a list, wanted ${c.photos.min} or more`);
  }
  const cards = c.card ?? ['none'];
  const card = r.card?.id ?? 'none';
  if (!cards.includes(card)) wrong.push(`card: ${card}, wanted ${cards.join(' or ')}`);
  if (c.mood && !c.mood.includes(r.mood)) wrong.push(`mood: ${r.mood} (${r.moodP.toFixed(2)}), wanted ${c.mood.join(' or ')}`);
  return wrong;
}

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const model = args.includes('--model') ? args[args.indexOf('--model') + 1] : undefined;
  const key = typesafeKey();

  const results: Result[] = [];
  let next = 0;
  let tokens = 0;
  // A few sentences at a time: each is several requests already.
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (next < CASES.length) {
        const i = next++;
        const c = CASES[i];
        try {
          const r = await readSentence(key, c.s, c.q, model ? { model } : {});
          tokens += r.inputTokens;
          results[i] = { c, r, wrong: score(c, r) };
        } catch (err) {
          results[i] = { c, error: String(err), wrong: ['error'] };
        }
      }
    }),
  );

  const count = (prefix: string) => results.filter((x) => x.wrong.some((w) => w.startsWith(prefix))).length;
  for (const { c, r, error, wrong } of results) {
    if (!wrong.length && !all) continue;
    const got = r
      ? `${r.mood} · ${r.card?.id ?? 'no card'} · ${r.images.map((i) => `${i.id} ${i.p.toFixed(2)}`).join(', ') || 'no photos'}`
      : error;
    console.log(`${wrong.length ? '✗' : '✓'} ${c.q ? `[${c.q}] ` : ''}${c.s}\n    ${got}${wrong.length ? `\n    → ${wrong.join('; ')}` : ''}`);
  }
  console.log(
    `\n${model ?? 'pinned model'} · ${CASES.length} sentences · wrong: photos ${count('photo')}, cards ${count('card')}, ` +
      `mood ${count('mood')} of ${CASES.filter((c) => c.mood).length} scored, errors ${count('error')} · ${tokens} tokens`,
  );
}

main();
