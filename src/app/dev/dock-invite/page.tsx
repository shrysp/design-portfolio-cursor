import { notFound } from 'next/navigation';
import Bench from './Bench';

export const metadata = { title: 'Tour invitation in the dock', robots: { index: false } };

/**
 * Development only: ways to fold the tour's toast into the dock, so that
 * putting it away leaves it somewhere to be found again. One at a time, in
 * the dock's own place, over a page long enough to scroll. `#rise`, `#island`…
 */
export default function DockInvitePage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <Bench />;
}
