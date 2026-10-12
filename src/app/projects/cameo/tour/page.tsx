import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
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
  if (!(await verifyAccess(token))) redirect('/projects/cameo#tour');
  return <TourStage />;
}
