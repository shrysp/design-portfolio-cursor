'use client';

import Link from 'next/link';
import { PIP } from '@shrysp/cameo';
import { Character } from '@shrysp/cameo/react';
import '@shrysp/cameo/styles.css';
import './entrance.css';

/**
 * What a phone gets instead of the tour. PIP talks while photos gather
 * around it, and on a phone there is no room around it for them. It is the
 * tour's dark room, with PIP awake in it, so the visitor sees what they are
 * coming back for — and an invited guest is told their link still works.
 */
export default function LaptopOnly({ name }: { name?: string }) {
  const hello = name ? `Hi ${name.charAt(0).toUpperCase() + name.slice(1)}. ` : '';
  return (
    <div className="entrance flex flex-col items-center justify-center gap-6 bg-[var(--entrance-bg)] px-6 text-center">
      <Character preset={PIP} size={132} state="curious" />
      <div className="flex max-w-[22rem] flex-col gap-3">
        <h1 className="entrance-title leading-tight">{hello}PIP&rsquo;s tour is best on a laptop</h1>
        <p className="entrance-body">
          PIP talks while photos gather around it, and a phone has no room for them.{' '}
          {name
            ? 'Open the same invitation link on a laptop and PIP will be waiting for you.'
            : 'Open this page on a laptop, with a microphone, to take the tour.'}
        </p>
      </div>
      <Link href="/projects/cameo" className="entrance-btn">
        Read the case study
      </Link>
    </div>
  );
}
