'use client';

import LazyVideo from '@/components/LazyVideo';

/**
 * Cameo's thumbnail, made the way the other projects' are: a painting with the
 * product on it. The product is PIP giving the tour of this site, recorded,
 * in a browser window drawn in the site's own materials: the milky glass and
 * white rim of a card's hover, the stone gel of the aqua pills for its three
 * dots, and a recessed stone field for the address.
 */
export default function TourThumbnail() {
  return (
    <div className="absolute inset-0 bg-[url('/images/projects/thumbnails/Cameo-Thumbnail.webp')] bg-cover bg-center">
      {/* 616px wide in the 672px column, and the same share of a narrower one; its height follows the recording’s */}
      <div className="absolute left-1/2 top-1/2 w-[min(616px,92%)] -translate-x-1/2 -translate-y-1/2 rounded-[14px] border border-white bg-linear-to-b from-white/90 to-white/70 p-1 pt-0 backdrop-blur-md shadow-[inset_0_1px_0_0_rgb(255_255_255/0.95),0_0_0_1px_rgb(0_0_0/0.05),0_2px_4px_-2px_rgb(0_0_0/0.12),0_24px_48px_-16px_rgb(0_0_0/0.35)]">
        <div className="relative flex h-7 items-center gap-1.5 px-2">
          {[0, 1, 2].map((dot) => <span key={dot} aria-hidden className="aqua pointer-events-none size-2.5" />)}
          <span className="absolute left-1/2 -translate-x-1/2 rounded-full bg-stone-100 px-8 py-0.5 text-[9px] text-stone-500 shadow-[inset_0_1px_2px_rgb(0_0_0/0.1)]">
            shreyaspatil.design
          </span>
        </div>
        {/* The recording, cut to the tour page alone: no desktop around it */}
        <div className="relative overflow-hidden rounded-[10px] bg-stone-900 shadow-[0_0_0_1px_rgb(0_0_0/0.08)]" style={{ aspectRatio: 1104 / 628 }}>
          <LazyVideo src="/videos/Portfolio-Tour-Thumbnail.mp4" poster="/videos/posters/Portfolio-Tour-Thumbnail.jpg" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}
