import React from 'react';
import Image from 'next/image';

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


  return (
    <div className={`isolate relative w-full surface bg-stone-100 -space-y-2 my-3 ${className || ''}`}>
      <div className='isolate relative rounded-[calc(var(--surface-radius)-1px)] bg-white overflow-hidden outline outline-stone-200'>
        {mediaType === 'image' ? (
          <div className={`w-full h-full ${aspectClass} relative bg-white`}>
            <Image
              src={src}
              alt="Project image"
              fill
              className="object-cover"
              sizes=""
              loading="lazy"
              quality={85}
            />
          </div>
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
        <div className='w-full flex items-center justify-between px-4 py-3  pt-4'>
          <div className="relative text-sm text-stone-600 mt-1 flex-1 pr-3">{caption}</div>
          {rightIcon && (
            <div className="relative flex items-center justify-center flex-shrink-0">
              {rightIcon}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


