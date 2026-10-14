import { notFound } from 'next/navigation';
import TourControls from './TourControls';

export const metadata = { title: 'Tour controls', robots: { index: false } };

/**
 * Development only: the tour's live control bar, which otherwise only shows
 * during a paid voice session, on the real stage under the real CRT glass.
 * Nothing here connects. `?typing=1`, `?focus=1`, `?low=1`.
 */
export default function TourControlsPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <TourControls />;
}
