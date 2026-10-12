"use client";

import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Image from 'next/image';
import Lightbox, { type LightboxItem } from '@/components/Lightbox';
import { startZoomTransition } from '@/lib/routeTransition';

interface MediaCardProps {
  mediaType: 'image' | 'video';
  src: string; // image URL or video URL depending on mediaType
  aspectClass?: string; // e.g. 'aspect-4/3', 'aspect-[16/9]'
  caption?: string; // if provided, renders the caption bar
  rightIcon?: React.ReactNode; // optional right-side icon/content in caption bar
  className?: string; // optional extra classes for outer wrapper
  posterSrc?: string; // optional poster for video
  videoAttributes?: React.VideoHTMLAttributes<HTMLVideoElement> & {
    controlsList?: string;
    disablePictureInPicture?: boolean;
  };
}

export default function MediaCard({
  mediaType,
  src,
  aspectClass = 'aspect-4/3',
  caption,
  rightIcon,
  className,
  posterSrc,
  videoAttributes
}: MediaCardProps) {
  // The enlarged view steps through every figure on the page, so each card
  // gathers them from the page in reading order when it's opened.
  const [gallery, setGallery] = useState<LightboxItem[]>([]);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  const openZoom = (trigger: HTMLElement) => {
    const figures = Array.from(document.querySelectorAll<HTMLElement>('[data-zoom-src]'));
    const items = figures.map((figure) => {
      // The picture already on the page gives the enlarged view its shape, and
      // something to show while the full-size file loads
      const image = figure.querySelector('img');
      return {
        src: figure.dataset.zoomSrc as string,
        caption: figure.dataset.zoomCaption,
        ratio: image?.naturalWidth ? image.naturalWidth / image.naturalHeight : undefined,
        preview: image?.currentSrc || undefined,
      };
    });

    trigger.setAttribute('data-zoom-active', 'figure');
    startZoomTransition(() => {
      trigger.removeAttribute('data-zoom-active');
      flushSync(() => {
        setGallery(items);
        setZoomedIndex(Math.max(0, figures.indexOf(trigger)));
      });
    });
  };
  const alt = caption || 'Project image';

  return (
    <div className={`isolate relative w-full surface bg-stone-100 -space-y-2 my-3 ${className || ''}`}>
      <div className='isolate relative rounded-[calc(var(--surface-radius)-1px)] bg-white overflow-hidden outline outline-stone-200'>
        {mediaType === 'image' ? (
          <button
            type="button"
            onClick={(event) => openZoom(event.currentTarget)}
            data-zoom-src={src}
            data-zoom-caption={caption}
            aria-label={`Enlarge image: ${alt}`}
            className={`block w-full ${aspectClass} relative bg-white cursor-zoom-in`}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
              sizes="(min-width: 800px) 800px, 100vw"
              loading="lazy"
              quality={85}
            />
          </button>
        ) : (
          <div className={`w-full h-full ${aspectClass} bg-black`}> 
            <video
              className='w-full h-full object-cover'
              src={src}
              poster={posterSrc ?? (videoAttributes?.poster as string | undefined)}
              {...videoAttributes}
            />
          </div>
        )}

       
      </div>

      {typeof caption === 'string' && caption.length > 0 && (
        <div className='w-full flex items-center justify-between px-4 py-3 pt-4'>
          <div className="relative text-sm text-stone-600 mt-1 flex-1 pr-3">{caption}</div>
          {rightIcon && (
            <div className="relative flex items-center justify-center flex-shrink-0">
              {rightIcon}
            </div>
          )}
        </div>
      )}

      {mediaType === 'image' && (
        <Lightbox items={gallery} index={zoomedIndex} onIndexChange={setZoomedIndex} />
      )}
    </div>
  );
}
