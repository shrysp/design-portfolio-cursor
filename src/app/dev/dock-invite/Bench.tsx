'use client';

import dynamic from 'next/dynamic';

// PIP draws itself in the browser, so the bench only renders there
const Playground = dynamic(() => import('./Playground'), { ssr: false });

export default function Bench() {
  return <Playground />;
}
