import { notFound } from 'next/navigation';
import Bench from './Bench';

export const metadata = { title: 'Tour bench', robots: { index: false } };

/** Development only — see api/dev/tour-bench/route.ts for why. */
export default function TourBenchPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <Bench />;
}
