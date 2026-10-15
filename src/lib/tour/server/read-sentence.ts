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
import { projectsData } from '@/data/projectsData';
import { TOPICS, type TopicId } from '@/lib/tour/suggestions';

const SYSTEMONE = 'https://api.typesafe.ai/v1/systemone';
/**
 * Pinned, not `jev-latest`: that alias moves to 1.14 on TypeSafe's schedule,
 * and on 1.14 the old photo question showed nearly twice as many wrong photos.
 * A new version gets tried against the same sentences before it is let in.
 */
const MODEL = 'jev-1.13.0';

/** Photos per parallel request. */
const SLICE = 8;
/** A photo needs at least this to count as mentioned. */
const THRESHOLD = 0.5;
/** More than this per sentence stops being illustration and becomes a slideshow. */
const MAX_PHOTOS = 3;
/**
 * What a photo after the first needs. The best match is the sentence's photo;
 * another only rides along when the sentence names it as plainly — a list,
 * "hiking, kayaking, even scuba diving". In the eval every wrong extra scored
 * 0.51–0.70 and every real list item 0.87 or more, so this sits between.
 */
const EXTRA_THRESHOLD = 0.8;

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

/**
 * The question asks whether the photo would illustrate the sentence, and the
 * criteria draw the line, since that line is where it went wrong. Asked
 * whether a sentence mentioned "the same place, event, person, or thing", Jev
 * took a shared setting as enough: "he worked as a TA at RIT" brought up his
 * graduation and the northern lights, because they too were at RIT. And
 * Shreyas is in most of the photos, so "person" alone made "he's originally
 * from India" a match for any photo of him.
 */
const photoQuestion = (description: string) => ({
  type: 'noul',
  instructions:
    `Photo: "${description}". The state gives the visitor's question and one sentence the guide just spoke. ` +
    'Would this photo illustrate what THIS SENTENCE is talking about?',
  criteria: {
    true:
      'The sentence names or describes what this photo shows: its event, activity, place, landmark, scene or the ' +
      'other people in it, even in passing or as one item in a list. ' +
      "Also true when the visitor's question asks about the place or event in this photo and the sentence answers it.",
    false:
      'The sentence is about something else. Shreyas appearing in the photo does not count, since he is in most of ' +
      'them; nor does sharing a setting, such as the same school, city or event, while the sentence talks about ' +
      'another thing that happened there; nor a loose or only thematic link; nor a sentence about the tour itself or ' +
      'what it covers ("his path, the places he has lived, what he loves") that names no particular place or event.',
  },
});

/**
 * Whether the sentence calls for a card (TourHandout) — one of the site's
 * own projects, or the way to reach him. A choice rather than a yes/no per
 * card: only one card is ever handed over at a time, and `none` sharing the
 * mass is the point here, since most sentences call for nothing.
 *
 * The card names are the site's project titles and `contact`, which is all
 * the stage knows how to show; a card is never something the model wrote.
 */
const CARD_INSTRUCTIONS = [
  "The state gives the visitor's question and one sentence the guide just spoke.",
  'Should the guide hand the visitor a card right now, so they can open it?',
  'A project card only when THIS SENTENCE is about that particular project of his — what it is, how it was made, ' +
    'what came of it — or singles it out, as when it answers the visitor by recommending or picking that one project. ' +
    'A passing mention in a list of projects is none.',
  'The contact card only when the sentence is about getting in touch with him — emailing him, hiring him, working ' +
    'with him, finding him online, or being handed on to him for what the guide cannot answer.',
  'Prefer none over a weak guess.',
].join(' ');

const CARDS: Record<string, string> = {
  none: 'No card. The default: most sentences call for nothing to open.',
  contact: 'The contact card: his email, X and LinkedIn, and a way to write to him from here.',
  ...Object.fromEntries(
    projectsData.map((p) => [p.title, `The case study for ${p.title}, one of his projects: ${p.description[0]}`]),
  ),
};
/** A card is clickable and takes the centre, so it needs a clearer yes than a photo does. */
const CARD_THRESHOLD = 0.6;

/**
 * Which part of his life the sentence is about, so the chips can follow the
 * conversation (suggestions.ts). A choice with `none` sharing the mass, as for
 * cards: a deflection, a greeting or a line about the tour is about nothing in
 * particular, and should leave the chips where they were.
 */
const TOPIC_INSTRUCTIONS = [
  "The state gives the visitor's question and one sentence the guide just spoke about Shreyas.",
  'Which part of his life is THIS SENTENCE about?',
  'None when it is about nothing in particular: a greeting, a line about what the tour covers, turning down a ' +
    'question, his work or projects, or anything not about his life.',
].join(' ');

const TOPIC_CRITERIA: Record<string, string> = { none: 'Not about any one part of his life.', ...TOPICS };
const TOPIC_THRESHOLD = 0.5;

type Answers = Record<string, { choice?: string; noul?: number; probabilities?: Record<string, number> }>;

async function ask(
  key: string,
  model: string,
  state: string,
  questions: Record<string, unknown>,
): Promise<{ answers: Answers; input: number }> {
  const res = await fetch(SYSTEMONE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, state, questions }),
    // A sentence-boundary call that outlives the sentence after it is dead weight.
    signal: AbortSignal.timeout(4000),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`[tour] TypeSafe ${res.status}:`, body.slice(0, 1500));
    throw new Error(`TypeSafe returned ${res.status}`);
  }
  const parsed = JSON.parse(body);
  return { answers: parsed?.answers ?? {}, input: Number(parsed?.usage?.input_tokens) || 0 };
}

export type SentenceReading = {
  mood: string;
  moodP: number;
  images: { id: string; p: number }[];
  /** The card this sentence calls for — a project's title, or `contact` — or null for none. */
  card: { id: string; p: number } | null;
  /** The part of his life it is about (suggestions.ts TOPICS), or null for none or unsure. */
  topic: TopicId | null;
  /** Jev input tokens the reading took, for what it cost (see costs.ts). */
  inputTokens: number;
};

/** The card answer, if it is a known card with a clear enough yes. An odd answer is no card, not a failure. */
function readCard(answer: Answers[string] | undefined): SentenceReading['card'] {
  const id = answer?.choice;
  if (typeof id !== 'string' || id === 'none' || !(id in CARDS)) return null;
  const p = answer?.probabilities?.[id] ?? 1;
  return p >= CARD_THRESHOLD ? { id, p } : null;
}

function readTopic(answer: Answers[string] | undefined): TopicId | null {
  const id = answer?.choice;
  if (typeof id !== 'string' || !(id in TOPICS)) return null;
  return (answer?.probabilities?.[id] ?? 1) >= TOPIC_THRESHOLD ? (id as TopicId) : null;
}

/** The cutoffs and model are arguments so the bench and `npm run tour:eval` can try others; the tour uses the defaults. */
export async function readSentence(
  key: string,
  text: string,
  question: string | undefined,
  { threshold = THRESHOLD, maxPhotos = MAX_PHOTOS, model = MODEL } = {},
): Promise<SentenceReading> {
  const state = typeof question === 'string' && question.trim()
    ? `Visitor asked: "${question.trim()}"\nGuide just said: "${text.trim()}"`
    : `Guide just said: "${text.trim()}"`;

  const slices: TourImage[][] = [];
  for (let i = 0; i < TOUR_IMAGES.length; i += SLICE) slices.push(TOUR_IMAGES.slice(i, i + SLICE));

  const replies = await Promise.all(
    slices.map((slice, i) => {
      const questions: Record<string, unknown> = {};
      if (i === 0) {
        questions.mood = { type: 'choice', instructions: MOOD_INSTRUCTIONS, criteria: MOODS };
        questions.card = { type: 'choice', instructions: CARD_INSTRUCTIONS, criteria: CARDS };
        questions.topic = { type: 'choice', instructions: TOPIC_INSTRUCTIONS, criteria: TOPIC_CRITERIA };
      }
      for (const img of slice) questions[img.id] = photoQuestion(img.description);
      return ask(key, model, state, questions);
    }),
  );
  const answers = replies.map((r) => r.answers);

  const moodAnswer = answers[0].mood;
  const mood = moodAnswer?.choice;
  if (typeof mood !== 'string' || !(mood in MOODS)) {
    throw new Error(`Unexpected mood answer: ${JSON.stringify(moodAnswer).slice(0, 500)}`);
  }

  // Best first; then only the best of each near-duplicate group, extras only past EXTRA_THRESHOLD, capped.
  const merged = Object.assign({}, ...answers) as Answers;
  const seenGroups = new Set<string>();
  const images: { id: string; p: number }[] = [];
  const ranked = TOUR_IMAGES.map((img) => ({ img, p: merged[img.id]?.noul ?? 0 }))
    .filter((r) => r.p >= threshold)
    .sort((a, b) => b.p - a.p);
  for (const { img, p } of ranked) {
    if (images.length > 0 && p < EXTRA_THRESHOLD) break;
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
    card: readCard(answers[0].card),
    topic: readTopic(answers[0].topic),
    inputTokens: replies.reduce((sum, r) => sum + r.input, 0),
  };
}
