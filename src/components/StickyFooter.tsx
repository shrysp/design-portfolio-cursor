"use client";

import React, { useState, useEffect } from 'react';
import { XLogo } from '@phosphor-icons/react';
import { IconFile, IconArrowUp } from 'nucleo-micro-bold-essential';
import { IconLinkedin  } from 'nucleo-social-media';
import EmailCopyButton from './EmailCopyButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Project navigation order - defines the sequence of projects
const projectOrder = [
  { slug: 'quinn', name: 'Quinn' },
  { slug: 'itinerai', name: 'ItinerAI' },
  { slug: 'dashworks', name: 'Dashworks' },
  { slug: 'weatherwise', name: 'WeatherWise' },
  
];

export default function StickyFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);

  // Determine if we're on a project page
  const isProjectPage = pathname?.startsWith('/projects/') && pathname !== '/projects';
  const currentSlug = isProjectPage ? pathname.split('/')[2] : null;

  useEffect(() => {
    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      setShowScrollTop(scrollPosition > viewportHeight / 2);

      // Detect when near bottom of page
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const distanceFromBottom = scrollHeight - scrollPosition - clientHeight;
      setIsNearBottom(distanceFromBottom < 100);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showProjectNav = isProjectPage && isNearBottom;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="sticky bottom-0 w-full flex flex-col bg-gradient-to-t from-background from-20%  to-transparent pt-[calc(var(--padding-pageMargin)*1.5)] pb-4 z-50">
        <div className="w-full container mx-auto max-w-[800px] px-4 md:px-0 flex flex-col gap-8">
          
          {/* Project Navigation Pills - Only shows when at bottom on project pages */}
          <AnimatePresence>
            {showProjectNav && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-center justify-center gap-2 flex-wrap w-full"
              >
                {projectOrder.map((project, index) => {
                  const isCurrentProject = project.slug === currentSlug;
                  return (
                    <motion.button
                      key={project.slug}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        ease: "easeOut",
                        delay: index * 0.05
                      }}
                      onClick={() => {
                        if (!isCurrentProject) {
                          router.push(`/projects/${project.slug}`);
                        }
                      }}
                      disabled={isCurrentProject}
                      className={`
                        group relative px-3 py-1.5 rounded-full text-sm font-medium
                        transition-all duration-200
                        ${isCurrentProject 
                          ? 'bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] text-white border border-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] cursor-default'
                          : 'bg-[radial-gradient(at_50%_75%,theme(colors.stone.100),theme(colors.stone.200),theme(colors.stone.300))] text-stone-600 border border-stone-400 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] hover:text-white hover:border-blue-700 hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] cursor-pointer active:scale-95'
                        }
                      `}
                      aria-label={isCurrentProject ? `Current project: ${project.name}` : `Go to ${project.name}`}
                    >
                      {/* Highlight overlay */}
                      <div className="absolute inset-[2px] top-[2px] h-1/2 rounded-t-full rounded-b-[4px] bg-gradient-to-b from-white/70 to-white/20 pointer-events-none" />
                      <span className="relative z-10">{project.name}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Row - Social on left, Resume + Top on right */}
          <div className="flex items-center justify-between w-full">
            {/* Social Media Buttons - Left */}
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a 
                    href="https://x.com/ShreyasPatil_" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className='group flex items-center justify-center relative rounded-full size-8 text-stone-500 border border-stone-400 bg-[radial-gradient(at_50%_75%,theme(colors.stone.100),theme(colors.stone.200),theme(colors.stone.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:bg-[radial-gradient(at_50%_75%,theme(colors.stone.200),theme(colors.stone.300),theme(colors.stone.400))] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-stone-400 active:scale-95 transition-all duration-300 cursor-pointer'
                  >                  
                    <div className={`absolute items-center justify-center inset-x-[5px] top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 to-white/20 z-10`}></div>
                    <XLogo size={16} weight="fill" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-stone-800 text-white border-stone-700">
                  <p>Follow on X</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className='group relative rounded-full size-8 text-stone-500 border border-stone-400 bg-[radial-gradient(at_50%_75%,theme(colors.stone.100),theme(colors.stone.200),theme(colors.stone.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:bg-[radial-gradient(at_50%_75%,theme(colors.stone.200),theme(colors.stone.300),theme(colors.stone.400))] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-stone-400 active:scale-95 transition-all duration-300 cursor-pointer'>                  
                    <div className={`absolute items-center justify-center inset-x-[5px] top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 to-white/20 z-10 pointer-events-none`}></div>
                    <EmailCopyButton />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-stone-800 text-white border-stone-700">
                  <p>Copy email</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <a 
                    href="https://www.linkedin.com/in/shreyastpatil/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='group flex items-center justify-center relative rounded-full size-8 text-stone-500 border border-stone-400 bg-[radial-gradient(at_50%_75%,theme(colors.stone.100),theme(colors.stone.200),theme(colors.stone.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:bg-[radial-gradient(at_50%_75%,theme(colors.stone.200),theme(colors.stone.300),theme(colors.stone.400))] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-stone-400 active:scale-95 transition-all duration-300 cursor-pointer'
                  >                  
                    <div className={`absolute items-center justify-center inset-x-[5px] top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 to-white/20 z-10`}></div>
                    <IconLinkedin size={16} />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-stone-800 text-white border-stone-700">
                  <p>Connect on LinkedIn</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Resume Button and Scroll to Top - Right */}
            <motion.div  className="flex items-center gap-3">
            <AnimatePresence>
              <motion.div layout>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a 
                      href="/document/Shreyas-Patil-Resume-2025.pdf" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      download
                      className='group flex items-center justify-center relative pl-2 pr-2.5 gap-1 h-8 rounded-full text-stone-500 border border-stone-400 bg-[radial-gradient(at_50%_75%,theme(colors.stone.100),theme(colors.stone.200),theme(colors.stone.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:bg-[radial-gradient(at_50%_75%,theme(colors.stone.200),theme(colors.stone.300),theme(colors.stone.400))] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-stone-400 active:scale-95 transition-all duration-300 cursor-pointer'
                    >                  
                      <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white/70  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                      <IconFile size={16} />
                      <p className=" font-medium">Resume</p>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-stone-800 text-white border-stone-700">
                    <p>Download resume</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
              </AnimatePresence>
              
                {showScrollTop && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeIn", delay: 0.15 }}
                    
                    aria-label="Scroll to top"
                    onClick={scrollToTop}
                    title="Scroll to top"
                    className='group flex items-center justify-center relative pl-2 pr-2.5 gap-1 h-8 rounded-full text-stone-500 border border-stone-400 bg-[radial-gradient(at_50%_75%,theme(colors.stone.100),theme(colors.stone.200),theme(colors.stone.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:bg-[radial-gradient(at_50%_75%,theme(colors.stone.200),theme(colors.stone.300),theme(colors.stone.400))] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-stone-400 active:scale-95 transition-all duration-300 cursor-pointer'
                  >                  
                    <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white/70  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                    <IconArrowUp size={16} />
                    <span className="text-base font-medium">Top</span>
                  </motion.button>
                )}
              
            </motion.div>
          </div>

        </div>
      </div>
    </TooltipProvider>
  );
}
