import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

interface ProjectCardProps {
  title: string;
  description: string[];
  images?: string[]; // Array of image URLs
  technologies?: string[];
  github?: string;
  live?: string;
  autoSlideInterval?: number; // Time in ms between auto slides
  expanded?: boolean;
  shouldBeExpanded?: boolean;
}

export function ProjectCard({ 
  title, 
  description, 
  images = [], 
  technologies, 
  github, 
  live,
  autoSlideInterval = 5000, // Default 5 seconds
  expanded,
  shouldBeExpanded
}: ProjectCardProps) {
  console.log(`[${title}] Component initializing`);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const progressIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const debugRef = useRef({ lastProgress: 0 });
  const renderCountRef = useRef(0);
  const lastProgressUpdateRef = useRef<{time: number, value: number}>({ time: Date.now(), value: 0 });
  
  // Log every render with more detail
  console.log(`[${title}] Render #${++renderCountRef.current}`, {
    progress,
    mounted: isMounted,
    selectedIndex,
    hasInterval: !!progressIntervalRef.current,
    timeSinceLastUpdate: Date.now() - lastProgressUpdateRef.current.time,
    lastProgressValue: lastProgressUpdateRef.current.value
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
  }, [isMounted, selectedIndex, autoSlideInterval, images.length, description.length, expanded, title]);
  
  // Handle manual slide change
  const handleSlideChange = (index: number) => {
    
    setSelectedIndex(index);
    setProgress(0);
    startTimeRef.current = Date.now();
  };

  // Progress bar component
  const ProgressBar = ({ value }: { value: number }) => (
    <div className="relative h-3 w-12 rounded-full overflow-hidden shadow-[0px_1px_2px_0px_rgba(0,0,0,0.15),inset_0px_1px_1px_0px_rgba(255,255,255,0.5)]">
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
        <div className="p-6 flex flex-col justify-top items-start gap-6">
          {/* Title section */}
          <div className="border-b border-black/10 flex justify-between items-center pb-2 gap-2 self-stretch">
            <div className="text-black text-2xl font-semibold">
              {title}
            </div>
            
          </div>

          {/* Main content area */}
          <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_4px_0px_rgba(28,57,142,0.25)] rounded-2xl border border-slate-200 flex flex-col justify-top items-start overflow-hidden" style={{ minHeight: "500px" }}>
            {/* Image carousel */}
            {images.length > 0 && (
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={images[selectedIndex]} 
                  alt={`${title} - slide ${selectedIndex + 1}`} 
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient for better text readability */}
                <div className="absolute inset-1 top-0.5 h-1/3 rounded-t-xl bg-gradient-to-b from-white/70 via-transparent to-transparent"></div>
              </div>
            )}

            {/* Fallback background when no images */}
            {!images.length && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-slate-100 rounded-xl" />
            )}
            
            {/* Description overlay */}
            <div className="relative z-10 p-6 w-full">
              {/* Show current description point */}
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/90">
                <p className="text-gray-800 font-medium">
                  {description[selectedIndex % description.length]}
                </p>
              </div>
              
              
            </div>
          </div>

          {/* Bottom controls */}
          <div className="self-stretch flex justify-between items-center">
            {/* Pagination and progress indicator */}
            <div className="flex gap-4 px-3 items-center">
                {(images.length > 0 ? images : description).map((_, index) => {
                  // Determine what type of indicator to show
                  if (index < selectedIndex) {
                    // Already seen - blue dot
                    return (
                      <button
                        key={index}
                        onClick={() => handleSlideChange(index)}
                        className="relative size-3 flex items-center justify-center"
                      >
                        <div className="size-3 rounded-full bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.700))] border border-[#2B7FFF] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.15),inset_0px_1px_1px_0px_rgba(255,255,255,0.5)]">
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
                        className="relative h-3 flex items-center justify-center"
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
                        className="relative size-3 flex items-center justify-center"
                      >
                        <div className="size-3 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 border border-[#62748E]/30 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.15),inset_0px_1px_1px_0px_rgba(255,255,255,0.5)]">
                          <div className="absolute inset-[1px] h-1/2 bg-gradient-to-b from-white/80 to-transparent rounded-t-full" />
                        </div>
                      </button>
                    );
                  }
                })}
              </div>

            {/* Read More button */}
            <Button 
              className="group w-full md:w-[240px] h-9 bg-gradient-to-b from-blue-700 via-blue-500 to-blue-300 border border-blue-500 rounded-full shadow-[0px_2px_2px_-1px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.0),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.25),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:border-blue-700 active:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.0),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] transition-all duration-300 relative overflow-hidden active:bg-gradient-to-b active:from-blue-800 active:via-blue-600 active:to-blue-400 cursor-pointer"
            >
              <span className="text-white font-semibold leading-loose">
                Read More
              </span>
              <div className="absolute inset-2 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 group-active:from-white/30" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 