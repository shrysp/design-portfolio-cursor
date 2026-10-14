import type { Mood } from './moods';

export type Recording = {
  name: string;
  src: string;
  sentences: {
    /** Seconds into the clip at which the sentence starts being heard. */
    from: number;
    /** Seconds into the clip at which its reading came back, and the face reacted. */
    readAt: number;
    text: string;
    /** The mood the reading chose. */
    mood: Mood;
    /** Every mood's share of the reading, 0..1. Moods given none are left out. */
    moods: Partial<Record<Mood, number>>;
  }[];
};

/**
 * PIP speaking, recorded from the live voice model the tour talks with.
 *
 * The five moods were recorded in one session on 14 October 2026, with each
 * sentence sent for a reading the moment the live transcript completed it, as
 * the tour does. `readAt` is when that reading actually came back: usually
 * before the sentence has finished being heard, because the transcript runs
 * about a second ahead of the voice. The introduction is the playground's
 * recording, made without readings, so its `readAt` is set the same distance
 * before each sentence ends.
 *
 * The shares are Jev's own, from reading each sentence with the tour's moods
 * (lib/tour/server/read-sentence.ts) after they were widened to eight.
 */
export const RECORDINGS: Recording[] = [
  {
    name: 'introduction',
    src: '/audio/cameo/pip-intro.m4a',
    sentences: [
      { from: 0, readAt: 0.19, text: 'Hi, I’m Pip!', mood: 'neutral', moods: { excited: 0.21, calm: 0.11, neutral: 0.68 } },
      { from: 0.89, readAt: 2.34, text: 'I’m a little face for your AI.', mood: 'neutral', moods: { excited: 0.16, surprised: 0.02, error: 0.02, frustrated: 0.01, calm: 0.15, neutral: 0.64 } },
      { from: 3.04, readAt: 5.58, text: 'I blink, I look around, and I listen when you talk.', mood: 'neutral', moods: { surprised: 0.01, error: 0.01, frustrated: 0.1, calm: 0.4, neutral: 0.48 } },
      { from: 6.28, readAt: 8.68, text: 'Pick a mood, or make a version of me that’s yours.', mood: 'curious', moods: { excited: 0.07, curious: 0.47, calm: 0.17, neutral: 0.29 } },
    ],
  },
  {
    name: 'error',
    src: '/audio/cameo/mood-error.m4a',
    sentences: [
      { from: 0.15, readAt: 1.96, text: 'Oh no, something went wrong.', mood: 'error', moods: { surprised: 0.02, error: 0.97, sad: 0.01 } },
      { from: 2.41, readAt: 4.78, text: 'I couldn’t save your changes, and I’m really sorry about that.', mood: 'error', moods: { error: 0.99, sad: 0.01 } },
      { from: 5.32, readAt: 6.08, text: 'Let’s try that again.', mood: 'neutral', moods: { error: 0.19, frustrated: 0.09, calm: 0.2, neutral: 0.52 } },
    ],
  },
  {
    name: 'angry',
    src: '/audio/cameo/mood-angry.m4a',
    sentences: [
      { from: 0.15, readAt: 1.2, text: 'No, that is not okay.', mood: 'neutral', moods: { frustrated: 0.3, calm: 0.11, neutral: 0.59 } },
      { from: 1.75, readAt: 4.68, text: 'This is the third time it has crashed today, and I am fed up with it.', mood: 'frustrated', moods: { frustrated: 1 } },
      { from: 5.85, readAt: 7.11, text: 'Somebody needs to fix this right now.', mood: 'frustrated', moods: { frustrated: 1 } },
    ],
  },
  {
    name: 'excited',
    src: '/audio/cameo/mood-excited.m4a',
    sentences: [
      { from: 0.15, readAt: 0.43, text: 'Wait, it worked!', mood: 'excited', moods: { excited: 0.85, surprised: 0.15 } },
      { from: 0.36, readAt: 2.53, text: 'I can’t believe it worked on the first try.', mood: 'excited', moods: { excited: 0.75, surprised: 0.25 } },
      { from: 3.21, readAt: 4.34, text: 'This is the best thing I’ve seen all week!', mood: 'excited', moods: { excited: 1 } },
    ],
  },
  {
    name: 'curious',
    src: '/audio/cameo/mood-curious.m4a',
    sentences: [
      { from: 0.15, readAt: 0.91, text: 'Hmm, that’s strange.', mood: 'surprised', moods: { curious: 0.08, surprised: 0.9, neutral: 0.02 } },
      { from: 0.59, readAt: 3.21, text: 'Why would the total be different from yesterday?', mood: 'curious', moods: { curious: 0.89, surprised: 0.05, frustrated: 0.04, neutral: 0.02 } },
      { from: 3.86, readAt: 4.79, text: 'I wonder what changed overnight.', mood: 'curious', moods: { curious: 0.99, surprised: 0.01 } },
    ],
  },
  {
    name: 'sad',
    src: '/audio/cameo/mood-sad.m4a',
    sentences: [
      { from: 0.15, readAt: 1.38, text: 'I’m sorry to say the project was cancelled.', mood: 'sad', moods: { error: 0.48, sad: 0.52 } },
      { from: 2.11, readAt: 4.3, text: 'We put so much into it, and it hurts to let it go.', mood: 'sad', moods: { sad: 1 } },
    ],
  },
];
