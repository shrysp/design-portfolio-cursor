/**
 * How the visitor came into the tour, handed from the entrance to the tour
 * page across the route change. Read once: a reload or a later visit lands
 * the ordinary way.
 *
 * For the dive it carries the stream's state — how far it had travelled and
 * how fast — and when, so the tour picks it up where the entrance left it
 * rather than starting a new one.
 */
const KEY = 'tour.arrival';
/** Long enough for the tour page to load, short enough not to outlive the visit. */
const FRESH_MS = 20_000;

/** `seed` is the library's layout (entrance/library.ts): the tour lays its photos out from it so they land where the stream put them. */
export type Arrival = { how: 'dive'; seed: number; travel: number; velocity: number; at: number };

export function markArrival(arrival: Omit<Arrival, 'at'>) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...arrival, at: performance.timeOrigin + performance.now() }));
  } catch {}
}

export function takeArrival(): Arrival | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (!raw) return null;
    const arrival = JSON.parse(raw) as Arrival;
    return Date.now() - arrival.at < FRESH_MS ? arrival : null;
  } catch {
    return null;
  }
}
