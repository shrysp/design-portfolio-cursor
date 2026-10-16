"use client";

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { IconArrowsExpandDiagonal3, IconCursorDefaultFilled } from 'nucleo-micro-bold-essential';

// Built prototypes stay out of the page until someone opens one
const ModalGrid = dynamic(() => import('@/components/ModalGrid'), { ssr: false });
// Cameo draws itself in the browser, and its package stays out of the page's first load
const CameoFaces = dynamic(() => import('@/components/craft/CameoFaces'), { ssr: false });
// The shapes tile is a drawing that plays by itself; the playground it opens loads when asked for
const CameoShapeBlueprint = dynamic(() => import('@/components/craft/CameoShapeBlueprint'), { ssr: false });
const CameoShape = dynamic(() => import('@/components/craft/CameoShape'), { ssr: false });

// A craft piece is one of four kinds of card on the same frame:
//   try:       a small live piece, used right there in the tile.
//   prototype: something built, bigger than its tile. The tile shows a loop or
//              a drawing, and its button opens the real thing on a stage.
//   watch:     a recording long enough to be worth watching at full size.
//   look:      a still or a short loop. Nothing to do but look.
type Media =
  | { media: 'video'; src: string; poster: string; /** A lighter, silent cut for the tile; `src` is what opens */ preview?: string }
  | { media: 'image'; src: string }
  | { media: 'live'; render: () => React.ReactNode };

type Piece = { title: string; ratio: number } & Media & {
    /** Makes this an "open" card: the button's label, and what the stage shows */
    open?: { label: string; render?: () => React.ReactNode; /** Fetches what `render` needs ahead of time */ preload?: () => void };
    /** What it is, when the media's kind doesn't say it */
    kind?: string;
    /** The recording switches between light and dark, and its title follows it */
    followsTheme?: boolean;
  };

const video = (title: string, file: string, ratio: number, folder = '/videos', preview?: string): Piece => ({
  media: 'video',
  title,
  ratio,
  src: `${folder}/${file}.mp4`,
  poster: `/videos/posters/${file}.jpg`,
  preview,
});

const image = (title: string, file: string): Piece => ({
  media: 'image',
  title,
  ratio: 4 / 3,
  src: `/images/Craft/${file}.png`,
});

// A recording long enough to be worth watching at full size
const walkthrough = (piece: Piece): Piece => ({ ...piece, open: { label: 'Watch walkthrough' } });

// Every craft piece. `ratio` is width / height of the media. The wall shows them
// sorted by what you can do with them (see sortedPieces).
const pieces: Piece[] = [
  { media: 'live', title: 'Turf waitlist', ratio: 2740 / 2160, render: () => <TurfWaitlist /> },
  { media: 'live', title: 'Image toolbar', ratio: 1496 / 1080, render: () => <ImageToolbar /> },
  {
    media: 'live',
    title: 'Cameo',
    ratio: 4 / 3,
    render: () => <CameoFaces />,
  },
  {
    media: 'live',
    title: 'Cameo shapes',
    ratio: 4 / 3,
    render: () => <CameoShapeBlueprint />,
    open: { label: 'Open the shape playground', render: () => <CameoShape />, preload: () => void import('@/components/craft/CameoShape') },
  },
  video('Bento portfolio', 'Bento-Portfolio', 2862 / 2160),
  walkthrough(video('Themed navbar', 'Navbar-themes', 3096 / 2160)),
  video('Mobile tab bar', 'Mobile-Navbar', 1040 / 1000),
  walkthrough(video('iPad × Figma', 'iPadxFigma', 2880 / 2160)),
  // The tile loops a silent 7 MB cut; the full recording, with PIP's voice, opens on the stage
  walkthrough(video('Portfolio tour', 'Portfolio-Tour-Demo', 1712 / 1080, '/videos', '/videos/Portfolio-Tour-Demo-preview.mp4')),
  { ...video('Aero', 'aero_recording', 3 / 4), kind: 'AR prototype using Aero' },
  walkthrough(video('ItinerAI build', 'ItinerAIbuild-1', 808 / 1080)),
  image('Delay plugin', 'BuiLD09'),
  image('Instagram.exe', 'BuiLD11'),
  image('Field recorder', 'BuiLD08'),
  walkthrough(video('Perplexity Mindlab', 'pplx-mindlab-1', 16 / 9, '/images/Craft')),
  image('Mail client', 'BuiLD04'),
  image('Pocket synth', 'BuiLD10'),
  {
    ...video('Dashworks modal suite', 'Modals', 16 / 9, '/images/Craft'),
    // Its recording flips the theme toggle partway through
    followsTheme: true,
    // The real thing, built: it loads only when it's opened
    open: { label: 'View prototype', render: () => <ModalGrid />, preload: () => void import('@/components/ModalGrid') },
  },
  video('Whop join modal', 'Whop-Modal', 1, '/images/Craft'),
];

/** How many pieces are on the wall, for the section's title */
export const craftCount = pieces.length;

const slugOf = (piece: Piece) => piece.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// A tile on the wall is never narrower than this; wider screens get more columns, up to three
const MIN_TILE_WIDTH = 360;
const MAX_COLUMNS = 3;
// The wall stops growing here; until then a wider screen gets bigger tiles, not more of them
const WALL_MAX_WIDTH = 1920;

// The space between tiles, across and down, and at the screen's edges
const WALL_GAP = 8;
// Columns are counted as if the gap were this, so the tight gap makes the
// tiles bigger rather than squeezing in another column
const COLUMN_FIT_GAP = 24;

// What a piece is, in a word or two, for the top right of its tile
const kindOf = (piece: Piece) =>
  piece.kind ?? (piece.open?.render ? 'Prototype' : piece.media === 'live' ? 'Live' : piece.media === 'video' ? 'Motion' : 'Visual');

// What someone does with a piece
type Role = 'try' | 'prototype' | 'watch' | 'look';
const roleOf = (piece: Piece): Role =>
  piece.open?.render ? 'prototype' : piece.media === 'live' ? 'try' : piece.open ? 'watch' : 'look';

// The wall leads with the pieces you use, then prototypes, then walkthroughs,
// then everything else, so what can be tried is the first thing seen
const roleOrder: Role[] = ['try', 'prototype', 'watch', 'look'];
// The walkthroughs to lead with, in order
const leadWalkthroughs = ['Portfolio tour', 'ItinerAI build'];
const leadRank = (piece: Piece) => (leadWalkthroughs.includes(piece.title) ? leadWalkthroughs.indexOf(piece.title) : leadWalkthroughs.length);
const sortedPieces = [...pieces].sort(
  (x, y) => roleOrder.indexOf(roleOf(x)) - roleOrder.indexOf(roleOf(y)) || leadRank(x) - leadRank(y),
);

// Pieces whose top edge is dark or busy, where the title reads in white
const darkTops = new Set(['Themed navbar', 'Mobile tab bar', 'Portfolio tour', 'Aero', 'ItinerAI build', 'Instagram.exe', 'Perplexity Mindlab', 'Mail client', 'Whop join modal']);

const PlayGlyph = () => (
  <svg width={9} height={9} viewBox="0 0 10 10" aria-hidden>
    <path d="M2 1.2v7.6a.6.6 0 0 0 .9.5l6.2-3.8a.6.6 0 0 0 0-1L2.9.7a.6.6 0 0 0-.9.5z" fill="currentColor" />
  </svg>
);

// What a piece does, said in words in its tile's bottom right corner. Stills get
// none. Buttons are grey gel that lights blue. "Try it" opens nothing, so it's a
// flat tag rather than a button, and hovering it outlines the tile it means.
function Action({ role, onOpen, onFrame }: { role: Role; onOpen: () => void; onFrame: (on: boolean) => void }) {
  const base = 'absolute bottom-2.5 right-2.5 z-20 flex h-7 items-center gap-1.5 px-3 text-xs font-medium';
  if (role === 'look') return null;
  if (role === 'try') {
    return (
      <span
        onPointerEnter={() => onFrame(true)}
        onPointerLeave={() => onFrame(false)}
        className={`${base} select-none cursor-default rounded-full border border-stone-300 bg-stone-200 text-stone-600`}
      >
        <IconCursorDefaultFilled size={11} />
        Try it
      </span>
    );
  }
  return (
    <button type="button" onClick={onOpen} className={`aqua aqua-to-blue ${base}`}>
      {role === 'prototype' ? <IconArrowsExpandDiagonal3 size={11} /> : <PlayGlyph />}
      {role === 'prototype' ? 'Open prototype' : 'Watch'}
    </button>
  );
}

// Whether a playing video is showing a dark frame right now, read a few times a
// second from a tiny copy of it. Lets a title follow a recording that switches
// theme partway, rather than guessing one ink for the whole loop.
function useVideoIsDark(mediaRef: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 9;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const timer = setInterval(() => {
      const video = mediaRef.current?.querySelector('video');
      if (!context || !video || video.paused || video.readyState < 2) return;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let light = 0;
      for (let i = 0; i < pixels.length; i += 4) light += 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
      setDark(light / (pixels.length / 4) < 110);
    }, 250);
    return () => clearInterval(timer);
  }, [mediaRef, enabled]);

  return dark;
}

// The title top left and what it is top right, over the picture, on a soft shade
// that matches the ink. `dark` is what's behind the title right now, for a piece
// that follows its video's theme; otherwise it's the hand-picked list.
function TileHeader({ piece, dark }: { piece: Piece; dark: boolean }) {
  const ink = dark ? 'text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.35)]' : 'text-stone-800';
  const text = `rounded-full px-1.5 py-1 transition-colors duration-300 ${ink}`;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-2.5 text-sm">
      {/* A gradient can't be transitioned, so the light and dark shades cross-fade */}
      <span aria-hidden className={`absolute inset-x-0 top-0 -z-10 h-20 bg-gradient-to-b from-white/70 to-transparent transition-opacity duration-300 ${dark ? 'opacity-0' : ''}`} />
      <span aria-hidden className={`absolute inset-x-0 top-0 -z-10 h-20 bg-gradient-to-b from-black/30 to-transparent transition-opacity duration-300 ${dark ? '' : 'opacity-0'}`} />
      <span className={`${text} min-w-0 font-medium`}>{piece.title}</span>
      <span className={`${text} shrink-0`}>
        <span className="opacity-60">{kindOf(piece)}</span>
      </span>
    </div>
  );
}

// One craft piece in its frame, with everything about it on the picture. The
// name it carries for page transitions is the same wherever the piece appears,
// so it can travel between the home page and the wall, and between one
// arrangement and another.
function CraftTile({ piece, sizes, onOpen }: { piece: Piece; sizes: string; onOpen: (piece: Piece) => void }) {
  const openIt = () => onOpen(piece);
  const [framed, setFramed] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoDark = useVideoIsDark(mediaRef, Boolean(piece.followsTheme));

  return (
    <figure
      className="surface bg-stone-100"
      style={{ viewTransitionName: `craft-${slugOf(piece)}` }}
      // A prototype is fetched as the pointer arrives, so it's there to show as the tile opens
      onPointerEnter={piece.open?.preload}
      onFocus={piece.open?.preload}
    >
      <div
        ref={mediaRef}
        data-craft-media={slugOf(piece)}
        className="isolate relative overflow-hidden rounded-[calc(var(--surface-radius)-1px)] bg-white outline outline-stone-200"
        style={{ aspectRatio: piece.ratio }}
      >
        {piece.media === 'video' && (
          <LazyVideo src={piece.preview ?? piece.src} poster={piece.poster} className="absolute inset-0 w-full h-full object-cover" />
        )}
        {piece.media === 'image' && <Image src={piece.src} alt={piece.title} fill sizes={sizes} className="object-cover" />}
        {piece.media === 'live' && piece.render()}
        {/* The whole picture opens the piece, as well as its button */}
        {piece.open && <button type="button" tabIndex={-1} aria-hidden onClick={openIt} className="absolute inset-0 z-10 cursor-expand" />}
        <TileHeader piece={piece} dark={piece.followsTheme ? videoDark : darkTops.has(piece.title)} />
        <Action role={roleOf(piece)} onOpen={openIt} onFrame={setFramed} />
        {framed && <span aria-hidden className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] shadow-[inset_0_0_0_3px_var(--color-blue-400)]" />}
      </div>
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
    shortest.height += 1 / piece.ratio;
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
      const next = Math.min(MAX_COLUMNS, Math.max(1, Math.floor((wall.clientWidth - COLUMN_FIT_GAP) / (MIN_TILE_WIDTH + COLUMN_FIT_GAP))));
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
    // Breaks out of whatever column it sits in to span the screen, up to its widest
    <div
      ref={wallRef}
      className="relative flex"
      style={{
        width: `min(100vw, ${WALL_MAX_WIDTH}px)`,
        // Centred on its column, however narrow, by equal margins that run past its edges
        marginInline: `calc(50% - min(50vw, ${WALL_MAX_WIDTH / 2}px))`,
        gap: WALL_GAP,
        paddingInline: WALL_GAP,
      }}
    >
      {dealIntoColumns(sortedPieces, columnCount).map((column, index) => (
        <div key={index} className="flex flex-1 min-w-0 flex-col" style={{ gap: WALL_GAP }}>
          {column.map((piece) => (
            <CraftTile key={piece.title} piece={piece} sizes={`(min-width: ${WALL_MAX_WIDTH}px) ${Math.round(WALL_MAX_WIDTH / columnCount)}px, ${Math.round(100 / columnCount)}vw`} onOpen={open} />
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
