/**
 * What the tour tells a visitor when it cannot carry on.
 *
 * Each notice is a card in the centre of the stage and a line PIP says aloud.
 * PIP cannot say these live: every one of them is a moment with no session to
 * speak through. So the lines are recorded in PIP's own voice (GPT-Live's)
 * and kept in public/audio/tour/, one clip per notice, named by its id. The
 * clip's words and `line` must match: the caption shows `line` while it plays.
 *
 * Running low on time is not here. PIP is still connected then, and says it
 * in its own words (see TIME_WARN_SECONDS in TourStage).
 */

export type NoticeId = 'over' | 'mic-blocked' | 'mic-missing' | 'unavailable' | 'lost' | 'code-invalid';

export type NoticeAction = 'retry' | 'carry-on' | 'email' | 'type';

export type Notice = {
  title: string;
  body: string;
  /** The first is the primary button. */
  actions: NoticeAction[];
  /** What PIP says, word for word as recorded. */
  line: string;
  /** The face PIP pulls as it says it — a pose from MOOD_REACTIONS or the library. */
  face: 'sad' | 'error' | 'curious';
};

export const NOTICES: Record<NoticeId, Notice> = {
  over: {
    title: 'That’s the tour',
    body: 'PIP has used all the time it was given for this visit. Shreyas would be glad to carry on the conversation himself.',
    actions: ['email'],
    line: 'That’s all the time we have. Thank you for spending it with me. Shreyas would love to keep the conversation going, so his email is right here.',
    face: 'sad',
  },
  'mic-blocked': {
    title: 'PIP can’t hear you',
    body: 'Your browser is blocking the microphone. Allow it from the icon in the address bar, then try again.',
    actions: ['retry', 'type'],
    line: 'I can’t hear you. Your browser is blocking the microphone. Allow it, then try again.',
    face: 'curious',
  },
  'mic-missing': {
    title: 'No microphone found',
    body: 'Connect a microphone, or check that yours is switched on, then try again.',
    actions: ['retry', 'type'],
    line: 'I can’t find a microphone. Plug one in, then try again.',
    face: 'curious',
  },
  unavailable: {
    title: 'PIP couldn’t start',
    body: 'Something went wrong on the way in. None of your time was used. Try again in a moment.',
    actions: ['retry'],
    line: 'Hmm, I couldn’t get going just then. Give it a moment, and try again.',
    face: 'error',
  },
  lost: {
    title: 'The connection dropped',
    body: 'PIP remembers what you were talking about, so you can carry on where you left off.',
    actions: ['carry-on'],
    line: 'Oops, we lost each other for a second. Try again, and I’ll pick up where we left off.',
    face: 'error',
  },
  'code-invalid': {
    title: 'This code no longer works',
    body: 'Your access code has been switched off or replaced. Shreyas can send you a new one.',
    actions: ['email'],
    line: 'This access code doesn’t open the tour anymore. Shreyas can send you a new one.',
    face: 'sad',
  },
};

export const noticeClip = (id: NoticeId) => `/audio/tour/notice-${id}.m4a`;

/** Which notice a failed start is, from what was thrown. */
export function noticeFor(err: unknown): NoticeId {
  const name = (err as { name?: unknown } | null)?.name;
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'mic-blocked';
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'NotReadableError') return 'mic-missing';
  const message = String((err as { message?: unknown } | null)?.message ?? err);
  if (/access code|HTTP 401/i.test(message)) return 'code-invalid';
  return 'unavailable';
}
