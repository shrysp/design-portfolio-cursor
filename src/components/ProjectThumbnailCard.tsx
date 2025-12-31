'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconArrowRight } from 'nucleo-micro-bold-essential';

interface ProjectThumbnailCardProps {
  name: string;
  link: string;
  children: React.ReactNode;
}

export default function ProjectThumbnailCard({ name, link, children }: ProjectThumbnailCardProps) {
  return (
    <Link href={link} className="isolate group w-full flex flex-col gap-4 cursor-pointer relative active:scale-[0.98] md:active:scale-100 transition-transform duration-100">
      {/* Header */}
      <div className="w-full flex justify-between items-center">
        <h2 className="text-header text-gradient-primary">{name}</h2>
        <Button
          variant="iconPrimary"
          size="icon"
          className="relative size-8 transition-all duration-200 text-white bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] border-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] md:text-stone-500 md:bg-[radial-gradient(at_50%_75%,theme(colors.stone.100),theme(colors.stone.200),theme(colors.stone.300))] md:border-stone-400 md:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] md:group-hover:text-white md:group-hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] md:group-hover:border-blue-700 md:group-hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset]"
        >
          <div className="absolute inset-1.5 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 to-white/20 z-10" />
          <IconArrowRight className=" transition-all duration-200" size={16} />
        </Button>
      </div>
      
      {/* Content (description + image passed as children) */}
      {children}
      
      {/* Hover background - covers entire card */}
      <div className="absolute -inset-2 md:-inset-4 scale-100 bg-stone-100 md:scale-97 md:bg-transparent transition-all duration-200 md:group-hover:scale-100 md:group-hover:bg-stone-100 md:group-active:scale-y-99 md:group-active:scale-x-[0.99] md:rounded-3xl rounded-t-xl rounded-b-3xl  -z-10"></div>
    </Link>
  );
}

