"use client";

import { useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Image from 'next/image';
import ProjectHeader from '@/components/ProjectHeader';
import dynamic from 'next/dynamic';
import { startLayoutTransition, startZoomTransition } from '@/lib/routeTransition';
import LazyVideo from '@/components/LazyVideo';
import ImageToolbar from '@/components/craft/ImageToolbar';
import TurfWaitlist from '@/components/craft/TurfWaitlist';
import CraftStage from '@/components/craft/CraftStage';
import VideoPlayer from '@/components/craft/VideoPlayer';
import { IconArrowsExpandDiagonal3, IconArrowUpRight } from 'nucleo-micro-bold-essential';

// Built prototypes stay out of the page until someone opens one
const ModalGrid = dynamic(() => import('@/components/ModalGrid'), { ssr: false });
// Cameo draws itself in the browser, and its package stays out of the page's first load
const CameoFaces = dynamic(() => import('@/components/craft/CameoFaces'), { ssr: false });
// The shapes tile is a drawing that plays by itself; the playground it opens loads when asked for
const CameoShapeBlueprint = dynamic(() => import('@/components/craft/CameoShapeBlueprint'), { ssr: false });
const CameoShape = dynamic(() => import('@/components/craft/CameoShape'), { ssr: false });

// A craft piece is one of three kinds of card on the same frame:
//   look: a still or a short loop. Nothing to do but look.
//   play: a small live piece, used right there in the tile.
//   open: something bigger. The tile shows a loop or a still, and its button
//         opens the piece on a stage at full size.
type Media =
  | { media: 'video'; src: string; poster: string }
  | { media: 'image'; src: string }
  | { media: 'live'; render: () => React.ReactNode };

type Piece = { title: string; ratio: number } & Media & {
    /** Makes this an "open" card: the button's label, and what the stage shows */
    open?: { label: string; render?: () => React.ReactNode; /** Fetches what `render` needs ahead of time */ preload?: () => void };
    /** Somewhere the piece lives outside the portfolio: its docs, its site */
    link?: { label: string; href: string };
  };

const video = (title: string, file: string, ratio: number, folder = '/videos'): Piece => ({
  media: 'video',
  title,
  ratio,
  src: `${folder}/${file}.mp4`,
  poster: `/videos/posters/${file}.jpg`,
});

const image = (title: string, file: string): Piece => ({
  media: 'image',
  title,
  ratio: 4 / 3,
  src: `/images/Craft/${file}.png`,
});

// A recording long enough to be worth watching at full size
const walkthrough = (piece: Piece): Piece => ({ ...piece, open: { label: 'Watch walkthrough' } });

// Every craft piece, in reading order. `ratio` is width / height of the media.
const pieces: Piece[] = [
  { media: 'live', title: 'Turf waitlist', ratio: 2740 / 2160, render: () => <TurfWaitlist /> },
  { media: 'live', title: 'Image toolbar', ratio: 1496 / 1080, render: () => <ImageToolbar /> },
  {
    media: 'live',
    title: 'Cameo',
    ratio: 4 / 3,
    render: () => <CameoFaces />,
    link: { label: 'Visit the Cameo site', href: 'https://usecameo.vercel.app/' },
  },
  {
    media: 'live',
    title: 'Cameo shapes',
    ratio: 4 / 3,
    render: () => <CameoShapeBlueprint />,
    open: { label: 'Open the shape playground', render: () => <CameoShape />, preload: () => void import('@/components/craft/CameoShape') },
    link: { label: 'Make your own on the Cameo site', href: 'https://usecameo.vercel.app/' },
  },
  video('Bento portfolio', 'Bento-Portfolio', 2862 / 2160),
  walkthrough(video('Themed navbar', 'Navbar-themes', 3096 / 2160)),
  video('Mobile tab bar', 'Mobile-Navbar', 1040 / 1000),
  walkthrough(video('iPad × Figma', 'iPadxFigma', 2880 / 2160)),
  walkthrough(video('Image answer engine', 'Image-Answer-Engine-Prototype', 1996 / 1080)),
  video('Aero', 'aero_recording', 3 / 4),
  walkthrough(video('ItinerAI build', 'ItinerAIbuild-1', 808 / 1080)),
  image('Delay plugin', 'BuiLD09'),
  image('Instagram.exe', 'BuiLD11'),
  image('Field recorder', 'BuiLD08'),
  walkthrough(video('Perplexity Mindlab', 'pplx-mindlab-1', 16 / 9, '/images/Craft')),
  image('Mail client', 'BuiLD04'),
  image('Pocket synth', 'BuiLD10'),
  {
    ...video('Dashworks modal suite', 'Modals', 16 / 9, '/images/Craft'),
    // The real thing, built: it loads only when it's opened
    open: { label: 'View prototype', render: () => <ModalGrid />, preload: () => void import('@/components/ModalGrid') },
  },
  video('Whop join modal', 'Whop-Modal', 1, '/images/Craft'),
];

/** How many pieces are on the wall, for the section's title */
export const craftCount = pieces.length;

const slugOf = (piece: Piece) => piece.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// A tile on the wall is never narrower than this; wider screens get more columns
const MIN_TILE_WIDTH = 360;

// The space between tiles, across and down, and at the screen's edges
const WALL_GAP = 8;
// Columns are counted as if the gap were this, so the tight gap makes the
// tiles bigger rather than squeezing in another column
const COLUMN_FIT_GAP = 24;
// A caption's height in units of a column's width, for balancing the columns
const CAPTION_HEIGHT = 0.12;

// One craft piece in its frame, with its name beneath. The name it carries for
// page transitions is the same wherever the piece appears, so it can travel
// between the home page and the wall, and between one arrangement and another.
// What a piece is, in a word
const kindOf = (piece: Piece) =>
  piece.open?.render ? 'Prototype' : piece.media === 'live' ? 'Live' : piece.media === 'video' ? 'Motion' : 'Visual';

function CraftTile({ piece, sizes, onOpen }: { piece: Piece; sizes: string; onOpen: (piece: Piece) => void }) {
  const label = piece.open?.label;
  const openIt = () => onOpen(piece);

  return (
    <figure
      className="surface bg-stone-100"
      style={{ viewTransitionName: `craft-${slugOf(piece)}` }}
      // A prototype is fetched as the pointer arrives, so it's there to show as the tile opens
      onPointerEnter={piece.open?.preload}
      onFocus={piece.open?.preload}
    >
      <div
        data-craft-media={slugOf(piece)}
        className="isolate relative overflow-hidden rounded-[calc(var(--surface-radius)-1px)] bg-white outline outline-stone-200"
        style={{ aspectRatio: piece.ratio }}
      >
        {piece.media === 'video' && (
          <LazyVideo src={piece.src} poster={piece.poster} className="absolute inset-0 w-full h-full object-cover" />
        )}
        {piece.media === 'image' && <Image src={piece.src} alt={piece.title} fill sizes={sizes} className="object-cover" />}
        {piece.media === 'live' && piece.render()}
        {/* The whole picture opens the piece, as well as its button */}
        {label && <button type="button" tabIndex={-1} aria-hidden onClick={openIt} className="absolute inset-0 z-10 cursor-expand" />}
      </div>

      <figcaption className="flex items-center justify-between gap-3 min-h-11 pl-4 pr-2 py-2 text-sm">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="font-medium text-stone-700">{piece.title}</span>
          <span className="shrink-0 text-stone-400">{kindOf(piece)}</span>
        </span>

        {piece.media === 'live' && !label && (
          <span className={`ml-auto flex shrink-0 items-center gap-1.5 text-stone-500 ${piece.link ? '' : 'pr-2'}`}>
            <span aria-hidden className="size-2 rounded-full bg-blue-500 shadow-[0_0_0_1px_var(--color-blue-700),inset_0_1px_0_rgba(255,255,255,0.6)]" />
            Try it
          </span>
        )}
        {label && (
          <button type="button" onClick={openIt} aria-label={label} title={label} className="aqua aqua-round aqua-to-blue ml-auto shrink-0 size-7">
            <IconArrowsExpandDiagonal3 size={13} />
          </button>
        )}
        {piece.link && (
          <a
            href={piece.link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={piece.link.label}
            title={piece.link.label}
            className="aqua aqua-round aqua-to-blue shrink-0 size-7"
          >
            <IconArrowUpRight size={13} />
          </a>
        )}
      </figcaption>
    </figure>
  );
}

// Deals pieces into columns, always onto the shortest one, so mixed shapes
// pack without gaps and still read roughly left to right
function dealIntoColumns(items: Piece[], count: number) {
  const columns = Array.from({ length: count }, () => ({ items: [] as Piece[], height: 0 }));
  for (const piece of items) {
    const shortest = columns.reduce((best, column) => (column.height < best.height ? column : best));
    shortest.items.push(piece);
    shortest.height += 1 / piece.ratio + CAPTION_HEIGHT;
  }
  return columns.map((column) => column.items);
}

// Every piece, edge to edge across the screen. The number of columns follows
// the screen's width, and the tiles glide to their new places when it changes.
export function CraftWall() {
  const wallRef = useRef<HTMLDivElement>(null);
  // Three columns until the screen has been measured (the server can't know its width)
  const [columnCount, setColumnCount] = useState(3);
  const shownCount = useRef<number | null>(null);
  const [opened, setOpened] = useState<Piece | null>(null);

  // The tile's picture grows into the stage, and shrinks back into it on close
  const mediaOf = (piece: Piece) => document.querySelector<HTMLElement>(`[data-craft-media="${slugOf(piece)}"]`);
  // A prototype looks nothing like its tile's recording, so the two dissolve
  const isPrototype = (piece: Piece) => Boolean(piece.open?.render);
  const open = (piece: Piece) => {
    const media = mediaOf(piece);
    media?.setAttribute('data-zoom-active', 'figure');
    startZoomTransition(() => {
      media?.removeAttribute('data-zoom-active');
      flushSync(() => setOpened(piece));
    }, { dissolve: isPrototype(piece) });
  };
  const close = () => {
    const piece = opened;
    if (!piece) return;
    startZoomTransition(() => {
      flushSync(() => setOpened(null));
      mediaOf(piece)?.setAttribute('data-zoom-active', 'figure');
    }, { dissolve: isPrototype(piece) });
  };

  useLayoutEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;

    const fit = () => {
      const next = Math.max(1, Math.floor((wall.clientWidth - COLUMN_FIT_GAP) / (MIN_TILE_WIDTH + COLUMN_FIT_GAP)));
      if (next === shownCount.current) return;
      // The first fit just sets the columns; later ones are a change worth animating
      const isFirstFit = shownCount.current === null;
      shownCount.current = next;
      if (isFirstFit) setColumnCount(next);
      else startLayoutTransition(() => flushSync(() => setColumnCount(next)));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wall);
    return () => observer.disconnect();
  }, []);

  return (
    // Breaks out of whatever column it sits in to span the whole screen
    <div ref={wallRef} className="relative left-1/2 -translate-x-1/2 w-screen flex" style={{ gap: WALL_GAP, paddingInline: WALL_GAP }}>
      {dealIntoColumns(pieces, columnCount).map((column, index) => (
        <div key={index} className="flex flex-1 min-w-0 flex-col" style={{ gap: WALL_GAP }}>
          {column.map((piece) => (
            <CraftTile key={piece.title} piece={piece} sizes={`${Math.round(100 / columnCount)}vw`} onOpen={open} />
          ))}
        </div>
      ))}
      <CraftStage
        onClose={close}
        piece={
          opened && {
            title: opened.title,
            ratio: opened.ratio,
            settles: Boolean(opened.open?.render),
            poster: opened.media === 'video' ? opened.poster : undefined,
            content: opened.open?.render ? (
              opened.open.render()
            ) : opened.media === 'video' ? (
              <VideoPlayer src={opened.src} poster={opened.poster} />
            ) : null,
          }
        }
      />
    </div>
  );
}

// The craft page: a title and the wall
export function CraftContent() {
  return (
    <div className="min-h-screen flex flex-col items-center gap-12 bg-stone-50 md:pt-24 pt-8 pb-24">
      <div className="w-full max-w-(--column) px-4 md:px-0">
        <ProjectHeader title="Craft" />
      </div>
      <CraftWall />
    </div>
  );
}
