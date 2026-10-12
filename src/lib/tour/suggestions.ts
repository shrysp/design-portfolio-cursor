/**
 * Things worth asking, for a visitor who is not sure where to start. Shown as
 * chips before the tour and again whenever it goes quiet (see TourStage).
 *
 * Each one is a question the story on the Notion page answers well — one that
 * came back with "he hasn't shared that" would teach a visitor not to trust
 * the rest. The server answers these by their place in this list and nothing
 * else (see api/tour/ask), so the list is also the limit of what a click can
 * ask for.
 */
export const SUGGESTIONS = [
  'How did he get into design?',
  'What is he building for fun?',
  'Tell me the Mission Peak story.',
  'What did he love about San Francisco?',
  'How does he work with engineers?',
  'What are his favourite films and books?',
];
