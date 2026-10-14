import { notFound } from 'next/navigation';
import Sketches from './Sketches';

export const metadata = { title: 'Cameo figure sketches', robots: { index: false } };

/** Development only: still layouts for the Cameo case study's figures, to settle a direction before any of them moves. */
export default function CameoSketchesPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <Sketches />;
}
