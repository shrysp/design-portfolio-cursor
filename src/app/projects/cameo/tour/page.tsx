import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { refreshVisitor } from '@/lib/tour/server/access';
import { refreshStory } from '@/lib/tour/server/story';
import { ACCESS_COOKIE, verifyAccess } from '@/lib/tour/server/auth';
import TourStage from './TourStage';

export const metadata: Metadata = {
  title: 'PIP — an interactive tour',
  robots: { index: false, follow: false },
};

/**
 * Checked here as well as in middleware: the page is rendered per request,
 * for a browser holding a valid access cookie, or not at all.
 */
export default async function TourPage() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const id = await verifyAccess(token);
  if (!id) redirect('/projects/cameo#tour');
  // Opening the tour is when Notion is read again — this person's row, and
  // the story if it is due — so the session they are about to start has the
  // latest of both and does not have to wait for either. Briefly, and never
  // fatally.
  await Promise.all([refreshVisitor(id, 2500), refreshStory(2500)]).catch((err) => console.error('[tour]', err));
  return <TourStage />;
}
