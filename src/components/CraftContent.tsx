"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import LazyVideo from '@/components/LazyVideo';
import ImageToolbar from '@/components/craft/ImageToolbar';

type Piece = { title: string; ratio: number } & (
  | { kind: 'video'; src: string; poster: string }
  | { kind: 'image'; src: string }
  | { kind: 'live'; render: () => React.ReactNode }
);

const video = (title: string, file: string, ratio: number, folder = '/videos'): Piece => ({
  kind: 'video',
  title,
  ratio,
  src: `${folder}/${file}.mp4`,
  poster: `/videos/posters/${file}.jpg`,
});

const image = (title: string, file: string): Piece => ({
  kind: 'image',
  title,
  ratio: 4 / 3,
  src: `/images/Craft/${file}.png`,
});

// Every craft piece, in reading order. `ratio` is width / height of the media.
const pieces: Piece[] = [
  video('Turf waitlist', 'Turf-Waitlist-animation', 2740 / 2160),
  { kind: 'live', title: 'Image toolbar', ratio: 1496 / 1080, render: () => <ImageToolbar /> },
  video('Bento portfolio', 'Bento-Portfolio', 2862 / 2160),
  video('Themed navbar', 'Navbar-themes', 3096 / 2160),
  video('Mobile tab bar', 'Mobile-Navbar', 1040 / 1000),
  video('iPad × Figma', 'iPadxFigma', 2880 / 2160),
  video('Image answer engine', 'Image-Answer-Engine-Prototype', 1996 / 1080),
  video('Aero', 'aero_recording', 3 / 4),
  video('ItinerAI build', 'ItinerAIbuild-1', 808 / 1080),
  image('Delay plugin', 'BuiLD09'),
  image('Instagram.exe', 'BuiLD11'),
  image('Field recorder', 'BuiLD08'),
  video('Perplexity Mindlab', 'pplx-mindlab-1', 16 / 9, '/images/Craft'),
  image('Mail client', 'BuiLD04'),
  image('Pocket synth', 'BuiLD10'),
  video('Dashworks modal suite', 'Modals', 16 / 9, '/images/Craft'),
  video('Whop join modal', 'Whop-Modal', 1, '/images/Craft'),
];

const kindLabels: Record<Piece['kind'], string> = {
  video: 'Motion',
  image: 'Visual',
  live: 'Live · try it',
};

// Deals the pieces into two columns, always onto the shorter one, so mixed
// shapes pack without gaps. Heights are in units of a column's width.
const CAPTION_HEIGHT = 0.12;
const columns = pieces.reduce<{ items: Piece[]; height: number }[]>(
  (cols, piece) => {
    const shorter = cols[0].height <= cols[1].height ? cols[0] : cols[1];
    shorter.items.push(piece);
    shorter.height += 1 / piece.ratio + CAPTION_HEIGHT;
    return cols;
  },
  [{ items: [], height: 0 }, { items: [], height: 0 }]
).map((column) => column.items);

interface CraftContentProps {
  hideHeader?: boolean;
  hideBackground?: boolean;
}

export function CraftContent({ hideHeader = false, hideBackground = false }: CraftContentProps) {
  const gridVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)", scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: { duration: 0.4 }
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className={`min-h-screen flex justify-center ${hideBackground ? '' : ''}`}>
      <main className="w-full md:max-w-[800px] max-w-[361px] flex flex-col gap-12">
        <div className="flex flex-col gap-12 items-start  px-0">
         
          {!hideHeader && (
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(4px)", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.3 }}
            className="isolate relative min-h-14 flex w-full bg-slate-800 border-3 border-slate-800 rounded-full items-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-x-1 top-0.5 h-1/2 bg-gradient-to-b from-slate-50/40 to-slate-50/5 rounded-t-[24px] rounded-b-[6px] z-10"></div>
            <div className="flex items-center w-full h-full">
              <h1 className="md:text-[24px] text-[16px] font-bold text-slate-50 w-full px-6 py-2">
                Craft
              </h1>
              
              <div className="flex w-full h-full bg-[url('/images/Banners/Banner-Craft.png')] bg-cover bg-[50%_61%] [mask-image:radial-gradient(50%_400%_at_0%_50%,transparent_10%,rgba(0,0,0,0.7)_100%)] [mask-type:alpha]"></div>
            </div>
          </motion.div>
          )}


          {/* Craft pieces, dealt into two columns on wide screens */}
          <motion.div
            className="flex flex-col md:flex-row gap-6 w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {columns.map((column, index) => (
              // On a phone the columns dissolve and `order` puts the pieces back in reading order
              <div key={index} className="max-md:contents flex flex-1 min-w-0 flex-col gap-6">
                {column.map((piece) => (
                  <motion.figure
                    key={piece.title}
                    variants={gridVariants}
                    className="surface bg-stone-100"
                    style={{ order: pieces.indexOf(piece) }}
                  >
                    <div
                      className="isolate relative overflow-hidden rounded-[calc(var(--surface-radius)-1px)] bg-white outline outline-stone-200"
                      style={{ aspectRatio: piece.ratio }}
                    >
                      {piece.kind === 'video' && (
                        <LazyVideo src={piece.src} poster={piece.poster} className="absolute inset-0 w-full h-full object-cover" />
                      )}
                      {piece.kind === 'image' && (
                        <Image src={piece.src} alt={piece.title} fill sizes="(min-width: 768px) 400px, 100vw" className="object-cover" />
                      )}
                      {piece.kind === 'live' && piece.render()}
                    </div>
                    <figcaption className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                      <span className="font-medium text-stone-700">{piece.title}</span>
                      <span className="shrink-0 text-stone-400">{kindLabels[piece.kind]}</span>
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
            ))}
          </motion.div>

        </div>
      </main>
    </div>
  );
}
