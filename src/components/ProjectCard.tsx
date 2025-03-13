"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';

interface ProjectCardProps {
  title: string;
  description: string[];
  images?: string[]; // Array of image/video URLs
  autoSlideInterval?: number; // Time in ms between auto slides for images
  expanded?: boolean;
}

export function ProjectCard({ 
  title, 
  description, 
  images = [], 
  autoSlideInterval = 5000, // Default 5 seconds
  expanded,
}: ProjectCardProps) {
  console.log(`[${title}] Component initializing`);
  
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const progressIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const debugRef = useRef({ lastProgress: 0 });
  const renderCountRef = useRef(0);
  const lastProgressUpdateRef = useRef<{time: number, value: number}>({ time: Date.now(), value: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideoPlayingRef = useRef<boolean>(false);
  
  // State to track description visibility for each slide (from backend)
  
  // Helper function to check if the current item is a video
  const isVideo = (url: string) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.mp4') || url.toLowerCase().includes('video/');
  };

  // Check if current slide is a video
  const currentItemIsVideo = images.length > 0 && selectedIndex < images.length && isVideo(images[selectedIndex]);
  
  // Log every render with more detail
  console.log(`[${title}] Render #${++renderCountRef.current}`, {
    progress,
    mounted: isMounted,
    selectedIndex,
    hasInterval: !!progressIntervalRef.current,
    timeSinceLastUpdate: Date.now() - lastProgressUpdateRef.current.time,
    lastProgressValue: lastProgressUpdateRef.current.value,
    isVideo: currentItemIsVideo
  });

  // Track progress updates
  useEffect(() => {
    lastProgressUpdateRef.current = { time: Date.now(), value: progress };
  }, [progress, title]);
  
  // Handle mounting
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, [title]);
  
  // Handle video timeupdate event to update progress
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      const currentTime = videoRef.current.currentTime;
      
      if (videoDuration > 0) {
        const videoProgress = (currentTime / videoDuration) * 100;
        setProgress(videoProgress);
        
        // We'll let the onEnded event handle this instead to avoid duplicate triggers
        // Removed the slide change logic from here
      }
    }
  };
  
  // Auto-advance slides
  useEffect(() => {
    if (images.length <= 1) return;
    
    // Reset progress when slide changes
    setProgress(0);
    
    // Start auto-slide timer
    const interval = setInterval(() => {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % description.length);
    }, autoSlideInterval);
    
    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [autoSlideInterval, images.length, description.length]);
  
  // Handle auto-sliding and progress
  useEffect(() => {
    if (!isMounted || expanded) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProgress(0);
      return;
    }

    // If current item is a video, let the video timeupdate event handle progress
    if (currentItemIsVideo) {
      // Always make sure to clear any existing interval when switching to a video
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Reset progress when switching to a video
      setProgress(0);
      isVideoPlayingRef.current = true;
      
      return;
    }
    
    // For images, use the timer-based progress
    isVideoPlayingRef.current = false;

    // Clear any existing intervals first
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setProgress(0);
    debugRef.current.lastProgress = 0;
    startTimeRef.current = Date.now();
    
    const progressInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / autoSlideInterval) * 100, 100);
      
      // Only log significant changes
      if (Math.abs(newProgress - debugRef.current.lastProgress) > 1) {
        debugRef.current.lastProgress = newProgress;
      }
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        setSelectedIndex(prev => (prev + 1) % (images.length || description.length));
      }
    }, 16);
    
    progressIntervalRef.current = progressInterval;
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isMounted, selectedIndex, autoSlideInterval, images.length, expanded, title, currentItemIsVideo, description.length]);
  
  // Handle slide change (both manual and automatic)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleSlideChange = (index: number) => {
    // Prevent changing to the same slide
    if (index === selectedIndex) return;
    
    setSelectedIndex(index);
    setProgress(0);
    startTimeRef.current = Date.now();
    
    // Reset video if we're switching away from a video
    if (isVideoPlayingRef.current && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      isVideoPlayingRef.current = false;
    }
  };

  // Navigate to project detail page
  const navigateToProjectDetail = () => {
    // Map project titles to their dedicated page routes
    const projectRoutes: Record<string, string> = {
      'ItinerAI': '/projects/itinerai',
      'WeatherWise': '/projects/weatherwise',
      'ShoeDog': '/projects/shoedog',
      'Fractions': '/projects/fractions'
    };
    
    // Use the mapping if it exists, otherwise fallback to the slug approach
    const route = projectRoutes[title] || `/projects/${title.toLowerCase().replace(/\s+/g, '-')}`;
    router.push(route);
  };

  // Progress bar component - using underscore prefix to indicate it's intentionally unused but kept for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ProgressBar = ({ value }: { value: number }) => (
    <div className="relative md:h-3 h-2 md:w-12 w-8 rounded-full overflow-hidden shadow-[0px_1px_2px_0px_rgba(0,0,0,0.15),inset_0px_1px_1px_0px_rgba(255,255,255,0.5)]">
      {/* Background (gray part) */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 border border-[#62748E]/30 rounded-full">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent rounded-t-full" />
      </div>
      
      {/* Progress (blue part) */}
      <div 
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-100 ease-linear"
        style={{ 
          width: isMounted ? `${value}%` : '0%',
          opacity: isMounted ? 1 : 0,
          transition: 'width 100ms linear, opacity 150ms ease-in'
        }}
      >
        <div className="absolute inset-x-[1px] top-[1px] h-1/2 bg-gradient-to-b from-white/80 to-transparent rounded-t-full" />
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Card container */}
      <div 
        className="w-full max-w-full relative bg-gradient-to-br from-slate-800 to-slate-950 rounded-3xl shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),0px_2px_0px_0px_rgba(0,0,0,0.12)] border-3 border-slate-800 overflow-hidden">
        {/* Content container */}
          <div className="flex flex-col justify-top items-start">
          

          {/* Main content area */}
          <div className="relative w-full h-full md:min-h-[504px] min-h-[280px] bg-slate-950 rounded-2xl flex flex-col justify-top items-start overflow-hidden [mask-image:radial-gradient(120%_70%_at_50%_37%,black_60%,rgba(0,0,0,0.4)_80%,transparent_90%)] [mask-type:alpha]">
            {/* Image/Video carousel */}
            {images.length > 0 && (
              <div className="absolute inset-0 w-full h-full">
                {currentItemIsVideo ? (
                  <video 
                    ref={videoRef}
                    src={images[selectedIndex]} 
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    onTimeUpdate={handleVideoTimeUpdate}
                    onEnded={() => {
                      // Only change slide if we're still on this video
                      // This prevents race conditions with manual slide changes
                      if (isVideoPlayingRef.current) {
                        if (images.length === 1) {
                          // For single video case, restart the video
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                            videoRef.current.play();
                            // Reset progress
                            setProgress(0);
                          }
                        } else {
                          // For multiple items, advance to next slide
                          setSelectedIndex(prev => (prev + 1) % (images.length || description.length));
                        }
                      }
                    }}
                  />
                ) : (
                  <Image 
                    src={images[selectedIndex]} 
                    alt={`${title} - slide ${selectedIndex + 1}`} 
                    className="w-full h-full object-cover"
                    width={600}
                    height={400}
                    priority={selectedIndex === 0}
                  />
                )}
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
                {description[selectedIndex]}
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