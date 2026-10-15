import { cookies } from 'next/headers';
import { ACCESS_COOKIE, verifyAccess } from '@/lib/tour/server/auth';
import { projectMetadata } from '@/lib/projectMeta';
import { onPhone } from '@/lib/tour/server/phone';
import CameoCaseStudy from './CameoCaseStudy';

export const metadata = projectMetadata('cameo');

export default async function CameoProject() {
  // Only decides which button to show; the tour checks the cookie itself.
  const unlocked = !!(await verifyAccess((await cookies()).get(ACCESS_COOKIE)?.value));
  return <CameoCaseStudy unlocked={unlocked} phone={await onPhone()} />;
}
