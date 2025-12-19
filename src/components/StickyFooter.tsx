"use client";

import React, { useState, useEffect } from 'react';
import { LinkedinLogo, XLogo, ReadCvLogo, ArrowUp } from '@phosphor-icons/react';
import EmailCopyButton from './EmailCopyButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function StickyFooter() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      setShowScrollTop(scrollPosition > viewportHeight / 2);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="sticky bottom-0 w-full flex items-center justify-around gap-6 bg-gradient-to-t from-background/100 from-20% to-background/0 pt-[calc(var(--padding-pageMargin)*1.5)] pb-4 md:justify-between md:gap-12 z-50">
        <div className="w-full container mx-auto max-w-[800px] px-4 md:px-0 flex items-center justify-around gap-6 md:justify-between md:gap-12">
          {/* Social Media Buttons */}
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href="https://x.com/ShreyasPatil_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-slate-400 via-slate-600 to-slate-800 hover:from-slate-500 hover:via-slate-700 hover:to-slate-900 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-slate-700 cursor-pointer transition-all duration-300'
                >                  
                  <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                  <XLogo size={18} weight="fill" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-stone-800 text-white border-stone-700">
                <p>Follow on X</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-red-400 via-red-600 to-red-800 hover:from-red-500 hover:via-red-700 hover:to-red-900 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-red-700 cursor-pointer transition-all duration-300'>                  
                  <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10 pointer-events-none`}></div>
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
                  className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 hover:from-blue-400 hover:via-blue-600 hover:to-blue-800 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-blue-700 cursor-pointer transition-all duration-300'
                >                  
                  <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                  <LinkedinLogo size={18} weight="fill" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-stone-800 text-white border-stone-700">
                <p>Connect on LinkedIn</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Resume Button and Scroll to Top */}
          <motion.div 
            className="flex items-center gap-3"
            
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.a 
                
                  href="/document/Shreyas-Patil-Resume-2025.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  download
                  className='relative flex items-center justify-center size-8 text-stone-500 rounded-full bg-radial-[at_50%_75%] from-stone-100 via-stone-200 to-stone-300 hover:from-stone-200 hover:via-stone-300 hover:to-stone-400 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-stone-400 cursor-pointer transition-all duration-300'
                >                  
                  <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white/70  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                  <ReadCvLogo size={18} weight="fill" />
                </motion.a>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-stone-800 text-white border-stone-700">
                <p>Download resume</p>
              </TooltipContent>
            </Tooltip>

            {showScrollTop && (
              <motion.button
                
                aria-label="Scroll to top"
                onClick={scrollToTop}
                title="Scroll to top"
                className='relative flex items-center justify-center gap-1 px-2.5 py-1 text-stone-500 rounded-full bg-radial-[at_50%_75%] from-stone-100 via-stone-200 to-stone-300 hover:from-stone-200 hover:via-stone-300 hover:to-stone-400 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-stone-400 cursor-pointer transition-all duration-300'
              >                  
                <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white/70  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                <ArrowUp size={14} weight="bold" />
                <span className="text-sm font-medium">Top</span>
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
