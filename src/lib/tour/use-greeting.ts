'use client';

import { useEffect, useState } from 'react';
import { type DayPart, dayPartNow } from './day-part';

/** "Good evening", once mounted, by the visitor's clock (day-part.ts); "Hello" before, and on the server. */
export function useGreeting(): string {
  const [part, setPart] = useState<DayPart | null>(null);
  useEffect(() => setPart(dayPartNow()), []);
  return part ? `Good ${part}` : 'Hello';
}
