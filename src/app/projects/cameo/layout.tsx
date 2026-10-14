import EntranceHost from '@/components/cameo/entrance/EntranceHost';

/**
 * Shared by the case study and the tour, so the way in — the takeover and its
 * stream of photos, and the CRT glass — stays up across the route change
 * between them instead of being handed from one page to the next.
 */
export default function CameoLayout({ children }: { children: React.ReactNode }) {
  return <EntranceHost>{children}</EntranceHost>;
}
