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
  const handleSlideChange = (index: number) => {
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

  // Progress bar component
  const ProgressBar = ({ value }: { value: number }) => (
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
        className="w-full max-w-full relative bg-gradient-to-br from-white to-neutral-50 rounded-3xl shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden">
        {/* Content container */}
        <div className="md:p-6 p-4 flex flex-col justify-top items-start gap-4">
          {/* Title section */}
          <div className=" flex justify-between items-center gap-2 self-stretch">
            <div className="text-slate-800 md:text-2xl text-xl font-semibold ml-2">
              {title}
            </div>
            
          </div>

          {/* Main content area */}
          <div className="relative w-full h-full md:min-h-[500px] min-h-[280px] mb-2 bg-gradient-to-b from-white to-slate-50 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_4px_0px_rgba(28,57,142,0.25)] rounded-2xl border border-slate-200 flex flex-col justify-top items-start overflow-hidden" >
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
                <div className="absolute inset-1 top-0.5 h-1/3 rounded-t-xl bg-gradient-to-b from-white/70 via-transparent to-transparent"></div>
              </div>
            )}

            {/* Fallback background when no images */}
            {!images.length && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-slate-100 rounded-xl" />
            )}
            
          </div>

          {/* Bottom controls */}
          <div className="self-stretch flex justify-between items-center">
            {/* Pagination and progress indicator */}
            <div className="flex md:gap-4 gap-2 px-3 items-center">
                {(images.length > 0 ? images : description).length === 1 ? (
                  // Special case for single item
                  <>
                    {currentItemIsVideo ? (
                      // Show progress bar for single video
                      <div className="relative md:h-3 h-2.5 flex items-center justify-center">
                        <ProgressBar value={progress} />
                      </div>
                    ) : (
                      // Show blue dot for single image
                      <div className="relative md:size-3 size-2.5 flex items-center justify-center">
                        <div className="md:size-3 size-2.5 rounded-full bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.700))] border border-[#2B7FFF] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.15),inset_0px_1px_1px_0px_rgba(255,255,255,0.5)]">
                          <div className="absolute inset-[1px] h-1/2 bg-gradient-to-b from-white/80 to-transparent rounded-t-full" />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Original pagination for multiple items
                  (images.length > 0 ? images : description).map((_, index) => {
                    // Determine what type of indicator to show
                    if (index < selectedIndex) {
                      // Already seen - blue dot
                      return (
                        <button
                          key={index}
                          onClick={() => handleSlideChange(index)}
                          className="relative md:size-3 size-2.5 flex items-center justify-center cursor-pointer"
                        >
                          <div className="md:size-3 size-2.5 rounded-full bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.700))] border border-[#2B7FFF] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.15),inset_0px_1px_1px_0px_rgba(255,255,255,0.5)]">
                            <div className="absolute inset-[1px] h-1/2 bg-gradient-to-b from-white/80 to-transparent rounded-t-full" />
                          </div>
                        </button>
                      );
                    } else if (index === selectedIndex) {
                      // Current - pill with progress
                      return (
                        <button
                          key={index}
                          onClick={() => handleSlideChange(index)}
                          className="relative md:h-3 h-2.5 flex items-center justify-center"
                        >
                          <ProgressBar value={progress} />
                        </button>
                      );
                    } else {
                      // Yet to be seen - gray dot
                      return (
                        <button
                          key={index}
                          onClick={() => handleSlideChange(index)}
                          className="relative md:size-3 size-2.5 flex items-center justify-center cursor-pointer"
                        >
                          <div className="md:size-3 size-2.5 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 border border-[#62748E]/30 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.15),inset_0px_1px_1px_0px_rgba(255,255,255,0.5)]">
                            <div className="absolute inset-[1px] h-1/2 bg-gradient-to-b from-white/80 to-transparent rounded-t-full" />
                          </div>
                        </button>
                      );
                    }
                  })
                )}
              </div>

            {/* Read More button */}
            <Button 
              className="group text-white font-semibold md:w-[240px] w-fit h-[36px] md:px-6 px-6 bg-gradient-to-b from-blue-700 via-blue-500 to-blue-300 border border-blue-500 rounded-full shadow-[0px_2px_2px_-1px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.0),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.25),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:border-blue-700 active:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.0),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] transition-all duration-300 relative overflow-hidden active:bg-gradient-to-b active:from-blue-800 active:via-blue-600 active:to-blue-400 cursor-pointer"
              onClick={navigateToProjectDetail}
            >
                Read More
              
              <div className="absolute inset-2 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 group-active:from-white/30" />
            </Button> 
          </div>
        </div>
      </div>
    </div>
  );
} 