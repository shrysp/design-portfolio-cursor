/**
 * Things worth asking, for a visitor who is not sure where to start. Shown as
 * chips whenever the tour goes quiet (see TourStage), chosen from this pool by
 * what the conversation is about.
 *
 * Each one is a question the story on the Notion page answers well — one that
 * came back with "he hasn't shared that" would teach a visitor not to trust
 * the rest. `npm run tour:answers` asks every one of them, so a question added
 * here is checked against the story before anyone clicks it. The server
 * answers these by their place in this list and nothing else (see
 * api/tour/ask), so the list is also the limit of what a click can ask for.
 *
 * Nothing about work: the tour is about his life beyond it.
 */

/**
 * The parts of his life a sentence can be about. Jev reads each of PIP's
 * sentences for one of these (read-sentence.ts), which is how the chips know
 * what is being talked about. The descriptions are what Jev reads.
 */
export const TOPICS = {
  'growing-up': 'His childhood in Pune: school, family, his early dreams of space, and cricket.',
  path: 'How he moved from engineering and machine learning into design and human-computer interaction.',
  rochester: "His time in Rochester and at RIT: the master's, the campus, the seasons, the northern lights, graduation.",
  'bay-area': 'Living in San Francisco and the Bay Area: the city, hikes like Mission Peak, the design community, Config.',
  building: 'What he builds for fun: Cameo, the expressive face for AI, and the guide the visitor is talking to.',
  taste: 'His taste in films, books, anime and apps.',
  outlook: 'What he believes about design, and how he sees technology and the future.',
  places: 'Cities and travel beyond the Bay Area, such as New York, and his favourite places.',
  'little-things': 'Small personal facts: window or aisle, the superpower he would pick, his dream collaborator.',
} as const;

export type TopicId = keyof typeof TOPICS;

export type Suggestion = {
  q: string;
  topic: TopicId;
  /**
   * The broad way into its topic. Once the conversation has been on that
   * topic it is stale — whatever was said probably answered it — and the
   * narrower ones in the topic are offered instead.
   */
  broad?: true;
  /** Offered before anything has been talked about. */
  opener?: true;
};

/** Order matters: within a topic the first unasked one is offered, and topics are tried in this order. */
export const SUGGESTIONS: Suggestion[] = [
  { q: 'How did he get into design?', topic: 'path', broad: true, opener: true },
  { q: 'Tell me the Mission Peak story.', topic: 'bay-area', opener: true },
  { q: 'What is he building for fun?', topic: 'building', broad: true, opener: true },
  { q: 'What was he like as a kid?', topic: 'growing-up', broad: true },
  { q: 'What was life at RIT like?', topic: 'rochester', broad: true },
  { q: 'What did he love about San Francisco?', topic: 'bay-area', broad: true },
  { q: 'What are his favourite films and books?', topic: 'taste', broad: true },
  { q: 'What technology is he most excited about?', topic: 'outlook', broad: true },
  { q: 'Which city does he love most?', topic: 'places', broad: true },
  { q: 'What superpower would he pick?', topic: 'little-things', broad: true },
  { q: 'What did cricket teach him?', topic: 'growing-up' },
  { q: 'What did he dream of becoming as a kid?', topic: 'growing-up' },
  { q: 'Why did he leave machine learning for design?', topic: 'path' },
  { q: 'Did he really see the Northern Lights?', topic: 'rochester' },
  { q: 'What were the seasons like in Rochester?', topic: 'rochester' },
  { q: "What's his favourite hike?", topic: 'bay-area' },
  { q: 'What does he miss about San Francisco?', topic: 'bay-area' },
  { q: 'Where did the idea for PIP come from?', topic: 'building' },
  { q: 'What anime would he recommend?', topic: 'taste' },
  { q: 'Which app does he admire as a designer?', topic: 'taste' },
  { q: 'What does he believe about design?', topic: 'outlook' },
  { q: 'Why does he love New York?', topic: 'places' },
  { q: 'Window seat or aisle?', topic: 'little-things' },
  { q: 'Who is his dream collaborator?', topic: 'little-things' },
];

/**
 * The chips to offer now. One goes deeper on what is being talked about; the
 * rest open topics not yet visited, one each, so the visitor sees somewhere
 * new to go rather than three takes on one thing. Already-visited topics, and
 * then anything left, fill in once the new ones run out.
 *
 * `turn` rotates which new topics come first. Tried in list order, every quiet
 * spell offered the same two (his path into design, Mission Peak) whatever
 * had been said, which is the same steering the prompt was cured of.
 */
export function pickChips(
  asked: string[],
  current: TopicId | null,
  visited: TopicId[],
  count: number,
  turn = 0,
): string[] {
  const open = SUGGESTIONS.filter((s) => !asked.includes(s.q) && !(s.broad && visited.includes(s.topic)));
  if (!current) {
    return [...open.filter((s) => s.opener), ...open.filter((s) => !s.opener)].slice(0, count).map((s) => s.q);
  }
  const picked: Suggestion[] = [];
  const used = new Set<TopicId>();
  const take = (s: Suggestion | undefined) => {
    if (!s || picked.length >= count || picked.includes(s)) return;
    picked.push(s);
    used.add(s.topic);
  };
  take(open.find((s) => s.topic === current));
  used.add(current);
  const fresh = open.filter((s, i) => !visited.includes(s.topic) && open.findIndex((o) => o.topic === s.topic) === i);
  const shift = fresh.length ? ((turn * (count - 1)) % fresh.length) : 0;
  for (const s of [...fresh.slice(shift), ...fresh.slice(0, shift)]) if (!used.has(s.topic)) take(s);
  for (const s of open) if (!used.has(s.topic)) take(s);
  for (const s of open) take(s);
  return picked.map((s) => s.q);
}
