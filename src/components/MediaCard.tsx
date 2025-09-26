import React from 'react';
import { ImageSquare, PlayCircle } from '@phosphor-icons/react';
import Image from 'next/image';

interface MediaCardProps {
  mediaType: 'image' | 'video';
  src: string; // image URL or video URL depending on mediaType
  aspectClass?: string; // e.g. 'aspect-4/3', 'aspect-[16/9]'
  caption?: string; // if provided, renders the caption bar
  rightIcon?: React.ReactNode; // optional right-side icon/content in caption bar
  badgeIcon?: React.ReactNode; // optional override for the top-left badge icon
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
  badgeIcon,
  className,
  posterSrc,
  videoAttributes
}: MediaCardProps) {
  const renderBadgeIcon = () => {
    if (badgeIcon) return badgeIcon;
    if (mediaType === 'video') {
      return <PlayCircle size={14} weight="fill" className='text-white ' />;
    }
    return <ImageSquare size={14} weight="fill" className='text-white mt-[1px]' />;
  };


  return (
    <div className={`isolate relative w-full bg-stone-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_4px_-0.5px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_32px_-2px_rgba(0,0,0,0.08)] rounded-2xl -space-y-2 my-3 ${className || ''}`}>
      <div className='isolate relative rounded-xl bg-white overflow-hidden outline outline-stone-200'>
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

        <div className='absolute top-[2px] left-[2px] flex items-center justify-center size-6 text-white rounded-full bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] outline-1 outline-blue-500/15'>
          <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-t-[18px] rounded-b-[3px] z-10`}></div>
          {renderBadgeIcon()}
        </div>
      </div>

      {typeof caption === 'string' && caption.length > 0 && (
        <div className='w-full flex items-center justify-between px-4 py-3  rounded-b-2xl pt-4'>
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


