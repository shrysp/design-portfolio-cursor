import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { refreshVisitor, visitorFirstName } from '@/lib/tour/server/access';
import { refreshStory } from '@/lib/tour/server/story';
import { ACCESS_COOKIE, verifyAccess } from '@/lib/tour/server/auth';
import { onPhone } from '@/lib/tour/server/phone';
import LaptopOnly from '@/components/cameo/entrance/LaptopOnly';
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
  // Before Notion is read: a phone gets the laptop screen, not a session.
  if (await onPhone()) return <LaptopOnly />;
  // Opening the tour is when Notion is read again — this person's row, and
  // the story if it is due — so the session they are about to start has the
  // latest of both. After the page is sent, not before: nothing on it is
  // drawn from them, and the visitor is a click and a microphone prompt away
  // from a session, which is time enough. Briefly, and never fatally.
  after(() => Promise.all([refreshVisitor(id, 2500), refreshStory(2500)]).catch((err) => console.error('[tour]', err)));
  // One read of the saved copy, for the welcome by name.
  return <TourStage visitor={await visitorFirstName(id)} />;
}
