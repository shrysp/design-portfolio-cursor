"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from 'next/image';

interface ProjectCardProps {
  title: string;
  description: string[];
  images?: string[]; // Array of image/video URLs
  
}

export function ProjectCard({ 
  title, 
  description, 
  images = []
}: ProjectCardProps) {
  const router = useRouter();

  // Navigate to project detail page
  const navigateToProjectDetail = () => {
    // Map project titles to their dedicated page routes
    const projectRoutes: Record<string, string> = {
      'ItinerAI': '/projects/itinerai',
      'DashWorks': '/projects/dashworks',
      'WeatherWise': '/projects/weatherwise',
      'ShoeDog': '/projects/shoedog',
      'Fractions': '/projects/fractions'
    };
    
    // Use the mapping if it exists, otherwise fallback to the slug approach
    const route = projectRoutes[title] || `/projects/${title.toLowerCase().replace(/\s+/g, '-')}`;
    router.push(route);
  };

  return (
    <div className="w-full">
      {/* Card container */}
      <div 
        className="w-full max-w-full relative bg-gradient-to-br from-slate-800 to-slate-950 rounded-3xl shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),0px_2px_0px_0px_rgba(0,0,0,0.12)] border-3 border-slate-800 overflow-hidden">
        {/* Content container */}
          <div className="flex flex-col justify-top items-start">
          
          {/* Main content area */}
          <div className="relative w-full h-full md:min-h-[504px] min-h-[280px] bg-slate-950 rounded-2xl flex flex-col justify-top items-start overflow-hidden [mask-image:radial-gradient(120%_70%_at_50%_37%,black_60%,rgba(0,0,0,0.4)_80%,transparent_90%)] [mask-type:alpha]">
            {/* Only show first image as thumbnail */}
            {images.length > 0 && (
              <div className="absolute inset-0 w-full h-full">
                <Image 
                  src={images[0]} 
                  alt={`${title} thumbnail`} 
                  className="w-full h-full object-cover"
                  width={600}
                  height={400}
                  priority
                />
                {/* Overlay gradient for better text readability */}
                <div className="absolute inset-0 h-1/3 rounded-t-2xl bg-gradient-to-b from-white/70 via-transparent to-transparent"></div>
              </div>
            )}

            {/* Fallback background when no images */}
            {!images.length && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-slate-100 rounded-xl" />
            )}
            
          </div>

          {/* Bottom controls */}
          <div className="self-stretch h-[160px] flex flex-col justify-between items-end text-slate-50 md:p-6 md:pt-2 p-4">

            {/* Title section */}
            <div className=" flex flex-col items-start gap-2 self-stretch">
              <div className="text-slate-50 md:text-2xl text-xl font-semibold">
                {title}
              </div>
              <div className="text-slate-50/70 md:text-base text-xs">
                {description[0]}
              </div>
            </div>
            
            {/* Read More button */}
            <Button 
              className="isolate group relative text-slate-800 font-semibold md:w-[240px] w-fit h-[36px] md:px-6 px-6 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] hover:bg-[radial-gradient(at_50%_75%,theme(colors.slate.200),theme(colors.slate.300),theme(colors.slate.400))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.25)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.25)_inset] border border-slate-500 rounded-full hover:shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_8px_8px_-4px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.25)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.25)_inset] active:shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_8px_8px_-4px_rgba(0,0,0,0.0),0px_4px_8px_1px_rgba(0,0,0,0.25)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.25)_inset] active:bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] cursor-pointer  transition-all duration-300 overflow-hidden "
              onClick={navigateToProjectDetail}
            >
                Read More
              
              <div className="absolute inset-2 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 to-white/20 group-active:from-white/50 z-10" />
            </Button> 
          </div>
        </div>
      </div>
    </div>
  );
} 