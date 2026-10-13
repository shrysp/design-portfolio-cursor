/**
 * One call per sentence of PIP's own answer, asking what mood it carries
 * (drives the face) and which real
 * photos, if any, it mentions (drives the spotlight).
 *
 * Photos are one independent yes/no (`noul`) per photo, not a single
 * `choice` among all of them. A choice forces every photo to share one
 * probability mass with `none`, so the richer a sentence was, the more it
 * lost: "snowy winters, spring tulips, fall reflections, the Northern Lights"
 * split its mass across ten fair matches and `none` won outright. Asked one
 * at a time, each photo gets its own answer, and a sentence that names four
 * things can show four photos.
 *
 * 38 questions in one request is slow, so the library is asked in slices
 * fired in parallel, with mood riding along in the first.
 */

import type { Mood } from '@/components/cameo/moods';
import { TOUR_IMAGES, type TourImage } from '@/data/tour-images';

const SYSTEMONE = 'https://api.typesafe.ai/v1/systemone';
const MODEL = 'jev-latest';

/** Photos per parallel request. */
const SLICE = 8;
/** A photo needs at least this to count as mentioned. */
const THRESHOLD = 0.5;
/** More than this per sentence stops being illustration and becomes a slideshow. */
const MAX_PHOTOS = 3;

/**
 * What each mood means, for the reader. The names are the ones the page has a
 * face for (components/cameo/moods.ts), so a mood added there needs its
 * meaning written here.
 *
 * Error, frustrated and sad were one mood, "concerned", until the three were
 * found to be read apart reliably: an apology, a complaint and a loss are
 * different things to say and deserve different faces.
 */
const MOODS: Record<Mood, string> = {
  excited:
    'Delighted, enthusiastic or impressed. Something landed well or is cause for celebration.',
  curious:
    'Asking, wondering, probing or thinking out loud towards a question. Wants to know something. ' +
    'Also fits weighing options or comparing choices toward a decision — that is open-minded ' +
    'interest, not distress.',
  surprised:
    'Caught off guard by something unexpected, without yet judging it good or bad.',
  error:
    'Reporting that something failed, broke or could not be done, including apologising for that ' +
    'failure.',
  frustrated:
    'Annoyed, angry or fed up. Complaining, or demanding that something be fixed. Does NOT include ' +
    'ordinary deliberation — weighing options, comparing choices or thinking aloud toward a ' +
    'decision is neutral or curious, even with hesitant filler like "um" or "trying to decide".',
  sad:
    'Sorrow, loss, regret or disappointment. Bad news that cannot be put right.',
  calm:
    'Settled and unhurried. Acknowledging, agreeing, confirming, or narrating without urgency.',
  neutral:
    'A plain statement with no particular colour to it. The default when nothing else clearly fits.',
};

/**
 * `state` carries only the one sentence, so the criteria have to supply
 * whatever context a lone sentence lacks — the image criteria explicitly ask
 * Jev to use the visitor's question, and mood keeps the same "judge the
 * speaker" framing as the live page.
 */
const MOOD_INSTRUCTIONS = [
  'This is one sentence from a spoken tour-guide answer.',
  'Choose the mood of the SPEAKER (the guide) as a listener would read it from delivery and word choice.',
  'Prefer neutral over a weak guess.',
].join(' ');

const PHOTO_INSTRUCTIONS = (description: string) =>
  `Photo: "${description}". The state gives the visitor's question and one sentence the guide just ` +
  'spoke. Does THIS SENTENCE specifically mention something this photo shows — the same place, event, ' +
  'person, or thing? A loose or merely thematic connection is no. A sentence that lists several things, ' +
  'one of which this photo shows, is yes.';

type Answers = Record<string, { choice?: string; noul?: number; probabilities?: Record<string, number> }>;

async function ask(key: string, state: string, questions: Record<string, unknown>): Promise<Answers> {
  const res = await fetch(SYSTEMONE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, state, questions }),
    // A sentence-boundary call that outlives the sentence after it is dead weight.
    signal: AbortSignal.timeout(4000),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`[tour] TypeSafe ${res.status}:`, body.slice(0, 1500));
    throw new Error(`TypeSafe returned ${res.status}`);
  }
  return JSON.parse(body)?.answers ?? {};
}

export type SentenceReading = {
  mood: string;
  moodP: number;
  images: { id: string; p: number }[];
};

/** The cutoffs are arguments so the bench can try others; the tour uses the defaults. */
export async function readSentence(
  key: string,
  text: string,
  question: string | undefined,
  { threshold = THRESHOLD, maxPhotos = MAX_PHOTOS } = {},
): Promise<SentenceReading> {
  const state = typeof question === 'string' && question.trim()
    ? `Visitor asked: "${question.trim()}"\nGuide just said: "${text.trim()}"`
    : `Guide just said: "${text.trim()}"`;

  const slices: TourImage[][] = [];
  for (let i = 0; i < TOUR_IMAGES.length; i += SLICE) slices.push(TOUR_IMAGES.slice(i, i + SLICE));

  const answers = await Promise.all(
    slices.map((slice, i) => {
      const questions: Record<string, unknown> = {};
      if (i === 0) questions.mood = { type: 'choice', instructions: MOOD_INSTRUCTIONS, criteria: MOODS };
      for (const img of slice) questions[img.id] = { type: 'noul', instructions: PHOTO_INSTRUCTIONS(img.description) };
      return ask(key, state, questions);
    }),
  );

  const moodAnswer = answers[0].mood;
  const mood = moodAnswer?.choice;
  if (typeof mood !== 'string' || !(mood in MOODS)) {
    throw new Error(`Unexpected mood answer: ${JSON.stringify(moodAnswer).slice(0, 500)}`);
  }

  // Best first; then only the best of each near-duplicate group, capped.
  const merged = Object.assign({}, ...answers) as Answers;
  const seenGroups = new Set<string>();
  const images: { id: string; p: number }[] = [];
  const ranked = TOUR_IMAGES.map((img) => ({ img, p: merged[img.id]?.noul ?? 0 }))
    .filter((r) => r.p >= threshold)
    .sort((a, b) => b.p - a.p);
  for (const { img, p } of ranked) {
    if (img.group) {
      if (seenGroups.has(img.group)) continue;
      seenGroups.add(img.group);
    }
    images.push({ id: img.id, p });
    if (images.length === maxPhotos) break;
  }

  return {
    mood,
    moodP: moodAnswer?.probabilities?.[mood] ?? 1,
    // Best first. Empty is a real, common answer — most sentences name nothing photographed.
    images,
  };
}
