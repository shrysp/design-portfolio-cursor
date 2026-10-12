import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, verifyAccess } from '@/lib/tour/server/auth';
import CameoCaseStudy from './CameoCaseStudy';

export const metadata: Metadata = {
  title: 'Cameo | Shreyas Patil',
  description: 'An expressive little face for AI interfaces, published as an npm package.',
};

export default async function CameoProject() {
  // Only decides which button to show; the tour checks the cookie itself.
  const unlocked = !!(await verifyAccess((await cookies()).get(ACCESS_COOKIE)?.value));
  return <CameoCaseStudy unlocked={unlocked} />;
}
