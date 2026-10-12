'use client';

import { JADE, NOVA, PIP, TIDE } from '@shrysp/cameo';
import { Character } from '@shrysp/cameo/react';
import '@shrysp/cameo/styles.css';

const PRESETS = { JADE, NOVA, PIP, TIDE };

/**
 * The package's own characters, live — the truest picture of a library whose
 * whole point is how it moves.
 */
export default function CameoCharacters({
  names = ['JADE'],
  size = 160,
}: {
  names?: (keyof typeof PRESETS)[];
  size?: number;
}) {
  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-x-10 gap-y-6">
      {names.map((name) => (
        <Character key={name} preset={PRESETS[name]} size={size} />
      ))}
    </div>
  );
}
