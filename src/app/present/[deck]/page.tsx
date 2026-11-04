import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import SarvamDeck from '@/components/present/decks/sarvam';

/**
 * Each deck lives at a slug with a random tail, so the address is the only way in.
 * To add a deck for another company, add its slug here.
 */
const DECKS: Record<string, { title: string; Deck: ComponentType }> = {
  'sarvam-1y1q2fu58p': { title: 'Portfolio for Sarvam', Deck: SarvamDeck },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(DECKS).map((deck) => ({ deck }));
}

export async function generateMetadata({ params }: { params: Promise<{ deck: string }> }): Promise<Metadata> {
  const { deck } = await params;
  return { title: DECKS[deck]?.title };
}

export default async function PresentPage({ params }: { params: Promise<{ deck: string }> }) {
  const { deck } = await params;
  const entry = DECKS[deck];
  if (!entry) notFound();
  const { Deck } = entry;
  return <Deck />;
}
