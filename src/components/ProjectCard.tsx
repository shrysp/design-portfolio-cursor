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
      'Quinn': '/projects/quinn',
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
        className="w-full max-w-full relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_4px_-0.5px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_32px_-2px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Content container */}
          <div className="flex flex-col justify-top items-start">
          
          {/* Main content area */}
          <div className="relative w-full h-full md:min-h-[524px] min-h-[280px] bg-transparent rounded-sm flex flex-col justify-top items-start overflow-hidden ">
            {/* Only show first image as thumbnail */}
            {images.length > 0 && (
              <div className="absolute inset-0 w-full h-full">
                <Image 
                  src={images[0]} 
                  alt={`${title} thumbnail`} 
                  className="w-full h-full object-cover aspect-[3/4]"
                  width={600}
                  height={400}
                  priority
                />
                {/* Overlay gradient for better text readability */}
               
              </div>
            )}

            {/* Fallback background when no images */}
            {!images.length && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/10 rounded-xl" />
            )}
            
          </div>

          {/* Bottom controls */}
          <div className="flex w-full bg-transparent justify-between gap-12 items-end text-slate-950 md:p-6 p-4">

            {/* Title section */}
            <div className=" flex flex-col items-start gap-2 md:w-3/4 ">
              <div className="text-slate-950 md:text-2xl text-xl font-semibold">
                {title}
              </div>
              <div className="text-slate-950/70 md:text-base text-xs text-pretty  ">
                {description[0]}
              </div>
            </div>
            
            {/* Read More button */}
            <Button 
              variant="primary"
              size="project"
              showHighlight={true}
              onClick={navigateToProjectDetail}
            >
              Read More
            </Button> 
          </div>
        </div>
      </div>
    </div>
  );
} 