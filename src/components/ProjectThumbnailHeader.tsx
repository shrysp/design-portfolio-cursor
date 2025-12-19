'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@phosphor-icons/react';

interface ProjectThumbnailHeaderProps {
  name: string;
  link: string;
}

export default function ProjectThumbnailHeader({ name, link }: ProjectThumbnailHeaderProps) {
  return (
    <Link href={link} className="isolate group w-full flex justify-between items-center cursor-pointer relative">
      <h2 className="text-header text-gradient-primary">{name}</h2>
      <Button
        variant="iconPrimary"
        size="icon"
        className="relative size-8 transition-all duration-200 group-hover:hover group-hover:text-white group-hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] group-hover:border-blue-700 group-hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset]"
      >
        <div className="absolute inset-1.5 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 to-white/20 z-10" />
        <ArrowRightIcon className="-rotate-45 group-hover:rotate-0 transition-all duration-200" size={16} weight="bold" />
      </Button>
      <div className="absolute -inset-2 scale-97 transition-all duration-200 group-hover:scale-100 group-hover:bg-stone-200 group-active:scale-y-95 group-active:scale-x-[0.995] rounded-xl -z-10"></div>
    </Link>
  );
}
