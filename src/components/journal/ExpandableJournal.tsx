"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useOnClickOutside } from "usehooks-ts";
import { motion, AnimatePresence } from "framer-motion";
import Book, { BookHandle } from "./Book";

// Hook to get responsive scale and center position
// The book always renders at desktop dimensions, but scales down on mobile
function useResponsiveJournalScale(
  desktopWidth: number,
  desktopHeight: number,
  mobileMargin: number = 16
) {
  const [state, setState] = useState({ 
    scale: 1,
    centerX: 0,
    centerY: 0,
  });

  useEffect(() => {
    function calculate() {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // The spread (2 pages) width at full scale
      const spreadWidth = desktopWidth * 2;
      
      // Calculate scale factor - scale down if spread doesn't fit
      // Available width for spread = screen - margin
      const availableWidth = screenWidth - mobileMargin;
      const scale = Math.min(1, availableWidth / spreadWidth);
      
      // Also check height constraint
      const availableHeight = screenHeight - mobileMargin;
      const heightScale = Math.min(1, availableHeight / desktopHeight);
      
      // Use the smaller scale to ensure it fits both dimensions
      const finalScale = Math.min(scale, heightScale);
      
      // Visual height after scaling (for vertical centering)
      const visualHeight = desktopHeight * finalScale;
      
      // Center position - account for the fact that when open,
      // the spread extends from -pageWidth/2 to +pageWidth*1.5 relative to origin
      // So center of spread is at pageWidth/2 from container origin
      // We want the spread center at screen center
      const spreadCenterOffset = (desktopWidth / 2) * finalScale;
      const centerX = (screenWidth / 2) - spreadCenterOffset;
      const centerY = Math.max(mobileMargin / 2, (screenHeight - visualHeight) / 2);
      
      setState({ scale: finalScale, centerX, centerY });
    }

    calculate();
    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, [desktopWidth, desktopHeight, mobileMargin]);

  return state;
}

// Sticker slap animation - mimics real physics of slapping a sticker on a surface
function SlapSticker() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for page to fully load before starting animation
    const handleLoad = () => {
      // Add small delay after load for smoother experience
      setTimeout(() => setIsReady(true), 100);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return (
    <motion.div
      className="z-[1] absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2"
      initial={{ 
        scale: 1.8, 
        rotate: -20,
        opacity: 0,
        y: -80,
      }}
      animate={isReady ? { 
        scale: 1,
        rotate: 3,
        opacity: 1,
        y: 0,
      } : {}}
      transition={{
        type: "easeOut",
        duration: 0.1,
        delay: 0.3,
      }}
    >
      {/* Impact shadow - grows quickly then settles */}
      <motion.div
        className="absolute inset-0 bg-black/25 rounded-full blur-sm scale-75 translate-y-3"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={isReady ? { 
          opacity: [0, 0.5, 0.35],
          scale: [0.3, 0.9, 0.75],
        } : {}}
        transition={{
          duration: 0.35,
          delay: 0.15,
          times: [0, 0.6, 1],
          ease: "easeOut",
        }}
      />
      <img 
        src="/images/About/Name-Sticker.webp" 
        alt="Hello, my name is Shreyas" 
        className="size-60 object-contain relative z-10"
      />
    </motion.div>
  );
}

interface ExpandableJournalProps {
  // Size when collapsed (in header)
  collapsedWidth?: number;
  collapsedHeight?: number;
  // Size when expanded (centered)
  expandedWidth?: number;
  expandedHeight?: number;
}

export function ExpandableJournal({
  collapsedWidth = 210,
  collapsedHeight = 280,
  expandedWidth: desktopExpandedWidth = 420,
  expandedHeight: desktopExpandedHeight = 560,
}: ExpandableJournalProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false); // Track exit animation
  const [isMounted, setIsMounted] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const bookRef = useRef<BookHandle>(null);
  const expandedContainerRef = useRef<HTMLDivElement>(null);
  const collapsedRef = useRef<HTMLDivElement>(null);
  
  // Get responsive scale and center position
  // Book always renders at desktop dimensions, but we scale the container on mobile
  const { scale, centerX, centerY } = useResponsiveJournalScale(
    desktopExpandedWidth,
    desktopExpandedHeight
  );
  
  // Book dimensions stay at desktop size - scaling handles responsive
  const expandedWidth = desktopExpandedWidth;
  const expandedHeight = desktopExpandedHeight;

  // The collapsed element should be hidden if expanded OR if exit animation is in progress
  const shouldHideCollapsed = isExpanded || isAnimatingOut;

  // For portal rendering - only after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close handler - defined first so it can be used in effects
  const handleClose = useCallback(async () => {
    if (!isExpanded) return;
    
    // First reset pages to cover if needed
    if (bookRef.current && bookRef.current.getCurrentPage() > 0) {
      await bookRef.current.resetTocover();
    }
    
    // Start exit animation - keep collapsed hidden during animation
    setIsAnimatingOut(true);
    setIsExpanded(false);
  }, [isExpanded]);

  // Called when AnimatePresence exit animation completes
  const handleExitComplete = useCallback(() => {
    setIsAnimatingOut(false);
  }, []);

  // Handle click outside when expanded
  useOnClickOutside(expandedContainerRef as React.RefObject<HTMLElement>, handleClose);

  // Handle Escape key
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isExpanded) {
        handleClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isExpanded, handleClose]);

  const handleExpand = () => {
    if (!isExpanded && collapsedRef.current) {
      // Capture the position of the collapsed element before expanding
      const rect = collapsedRef.current.getBoundingClientRect();
      setOriginRect(rect);
      setIsExpanded(true);
    }
  };

  const pages = [
    {
      front: <div className="relative isolate text-center h-full bg-linear-to-bl from-stone-700 to-stone-900 rounded-lg shadow-[inset_-2px_2px_2px_rgba(255,255,255,0.1)] overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-y-0 z-10 w-0.5 bg-black/80 blur-[2px]"></div>
        <div className="absolute inset-y-0 z-10 left-1 w-0.5 bg-linear-to-l from-white/50 to-black blur-xs"></div>
        <div className="absolute right-0 bottom-0 z-10 size-10 bg-linear-to-br from-transparent via-transparent via-50% to-white/20 blur-xs"></div>
        <div className="relative z-20 h-full flex flex-col p-4 font-black text-4xl items-center justify-center text-white/80 rotate-3">
          <img 
            src="/images/About/Name-Sticker.webp" 
            alt="Hello, my name is Shreyas" 
            className="z-[1] size-56 absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 object-contain"
          />
          <div className="text-white absolute top-5/7 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-handwriting">Product Designer</div>
          <div className="z-0 absolute inset-0"></div>
        </div>
      </div>,
      back: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-100 shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1)] rounded-r-lg rounded-l-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0">
          <img 
            src="/images/About/Gojo-meme-sticker.webp"
            alt="Shreyas Patil"
            className=" z-[1]  absolute top-1/2 -translate-y-1/2 -right-1/2 object-contain"
          />
        </div>
      </div>,
    },
    {
      front: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-100 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_-2px_2px_2px_rgba(255,255,255,1)] rounded-l-lg rounded-r-2xl overflow-hidden" >
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0">
          <img 
            src="/images/About/Gojo-meme-sticker.webp"
            alt="Shreyas Patil"
            className=" z-[1]  absolute top-1/2 -translate-y-1/2 -left-1/2 object-contain"
          />
        </div>
      </div>,
      back: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-200 shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1)] rounded-r-lg rounded-l-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0 p-6 flex items-center justify-center w-full h-full">
          <div className="-space-y-20">
            <div className="">Standards were high on this team!</div>
            <img 
              src="/images/About/Team Sticker.webp"
              alt="Shreyas Patil"
              className=" z-[1] size-96 object-contain"
            />
          </div>
        </div>
      </div>,
    },
    {
      front: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-100 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_-2px_2px_2px_rgba(255,255,255,1)] rounded-l-lg rounded-r-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-bottom justify-center ">
          <img 
            src="/images/About/Cricket Sticker.webp"
            alt="Shreyas Patil"
            className=" z-[1]  object-contain rotate-2"
          />
          <div className="-mt-10">I liked pushing myself here when no one was looking.</div>
        </div>
      </div>,
      back: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-200 shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1)] rounded-r-lg rounded-l-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0 p-6">
          <div className=" text-left  text-stone-500 underline underline-offset-4 decoration-stone-300 absolute top-10 left-1/4 -rotate-18">Iron Man 1</div>
          <img
            src="/images/About/Jarvis Sticker.webp"
            alt="Shreyas Patil"
            className=" z-[1]  object-contain -rotate-2"
          />
          <div className=" text-left  text-stone-500  ">This was the first time I wondered what it might feel like to collaborate with a computer. </div>
        </div>
      </div>,
    },
    {
      front: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-100 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_-2px_2px_2px_rgba(255,255,255,1)] rounded-l-lg rounded-r-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0 p-6 -space-y-10">
          <div className=" text-left  text-stone-500 w-3/4">I studied engineering and machine learning to get closer to that future. </div>
          <img
            src="/images/About/MLResearch Sticker.webp"
            alt="Shreyas Patil"
            className=" z-[1] w-90 object-contain -rotate-2 ml-20"
          />
          <div className=" text-stone-500 w-3/4 text-left ml-auto">I learned how systems worked.I wanted to shape how they felt.</div>
        </div>
      </div>,
      back: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-200 shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1)] rounded-r-lg rounded-l-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0">
          <div className="absolute w-75 top-8 flex items-center">
            <img
              src="/images/About/RIT Ritchie Sticker.webp"
              alt="Shreyas Patil"
              className=" z-[1]  object-contain -rotate-2"
            />
            <div className="absolute text-left  text-stone-500 w-1/3 -right-1/4 top-4 ">A reminder of where I was and what I was becoming</div>
          </div>
          <img
            src="/images/About/Flight Ticket Sticker.webp"
            alt="Shreyas Patil"
            className=" z-[1] absolute h-140 right-0 bottom-1/4 translate-y-1/2 object-contain -rotate-89"
          />
        </div>
      </div>,
    },
    {
      front: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-100 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_-2px_2px_2px_rgba(255,255,255,1)] rounded-l-lg rounded-r-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0">
          <div className="absolute right-5 top-5 flex items-center">
            <div className="text-stone-500 text-left leading-6 p-4">studying Human–Computer Interaction to focus on how technology feels, not just how it works.</div>
            <img
              src="/images/About/RIT ID Sticker.webp"
              alt="Shreyas Patil"
              className=" z-[1] w-50 object-contain -rotate-2"
            />
          </div>
          <div className="absolute -left-[242px] bottom-1/4 translate-y-1/2 flex items-center">
            <img
              src="/images/About/Flight Ticket Sticker.webp"
              alt="Shreyas Patil"
              className=" z-[1]  h-140  object-contain -rotate-89"
            />
            <div className="text-stone-500 text-left leading-6 p-4 ml-35 w-1/2">First time leaving home this far</div>
          </div>
        </div>
      </div>,
      back: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-200 shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1)] rounded-r-lg rounded-l-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0">
          <div className="text-left text-2xl px-6 pt-6">I think best when my body is moving</div>
          <div className="relative -space-y-2 mb-4">
            <div className="relative flex">
              <div className="-space-y-10 items-center ml-3">
                <div className="text-sm text-stone-500  p-2">Mission Peak</div>
                <img
                  src="/images/About/Mission Peak Sticker.webp"
                  alt="Shreyas Patil"
                  className=" z-[1]  w-50  object-contain -rotate-2"
                />
              </div>
              <div className=" items-center right-1/10 absolute">
                <img
                  src="/images/About/Lechworth Sticker.webp"
                  alt="Shreyas Patil"
                  className=" z-[1]  w-40   object-contain -rotate-1"
                />
                <div className="text-sm text-stone-500  p-2">Lechworth State Park</div>
              </div>
            </div>
            <div className="text-stone-500">Long hikes is how I slowed my thoughts down.</div>
          </div>
          <div className="relative -space-y-2">
            <div className="text-stone-500 text-left px-4">Forts in the Sahyadri mountains <br /> Growing up in Pune, surrounded by hills.</div>
            <div className="relative flex gap-6">
              <div className="items-center ml-3">
                <img
                  src="/images/About/Hike-2-Sticker.webp"
                  alt="Shreyas Patil"
                  className=" z-[1]  w-45  object-contain -rotate-2"
                />
              </div>
              <div className=" items-center">
                <img
                  src="/images/About/Hike-1-Sticker.webp"
                  alt="Shreyas Patil"
                  className=" z-[1]  w-40   object-contain -rotate-1"
                />
              </div>
            </div>
          </div>
          <img
            src="/images/About/Scuba Sticker.webp"
            alt="Shreyas Patil"
            className=" z-[1] absolute left-9/10 top-5 object-contain -rotate-2"
          />
        </div>
      </div>,
    },
    {
      front: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-100 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_-2px_2px_2px_rgba(255,255,255,1)] rounded-l-lg rounded-r-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0">
          <div className="text-stone-500 text-left absolute top-5/8 left-1/2 text-lg ">Different mediums. <br /> Same rhythm.</div>
          <img
            src="/images/About/Scuba Sticker.webp"
            alt="Shreyas Patil"
            className=" z-[1] absolute right-1/10 top-5 object-contain -rotate-2"
          />
          <img
            src="/images/About/Bike Sticker.webp"
            alt="Shreyas Patil"
            className=" z-[2] absolute h-60  bottom-1/4 translate-y-1/2 object-contain "
          />
          <img
            src="/images/About/Kayaking Stickers.webp"
            alt="Shreyas Patil"
            className=" z-[1] absolute h-50 right-0  bottom-1/6 translate-y-1/2 object-contain "
          />
        </div>
      </div>,
      back: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-200 shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1)] rounded-r-lg rounded-l-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0 -space-y-6 p-4 ">
          <div className="text-left mb-2 text-2xl p-2">None of them started as &quot;the best.&quot;</div>
          <div className="flex items-center">
            <div className=" w-40 relative">
              <img
                src="/images/About/CR7 Sticker.webp"
                alt="Shreyas Patil"
                className=" z-[1]  size-50 top-0 right-0 object-cover"
              />
            </div>
            <div className="text-left w-full text-stone-600">
              <div className="text-left text-xl leading-8">Cristiano Ronaldo</div>
              <div className="text-left text-xl leading-8">Relentless self-reinvention</div>
              <div className="text-left text-sm leading-6 text-stone-500">When talent opened the door, discipline kept pushing the ceiling higher.</div>
              <div className="text-left text-sm leading-6 text-stone-500">Showing up every day turned potential into dominance.</div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-left w-full text-stone-600 pl-2">
              <div className="text-left text-xl leading-8">Virat Kohli</div>
              <div className="text-left text-xl leading-8">Total commitment to improvement</div>
              <div className="text-left text-sm leading-6 text-stone-500">When he decided to take the game seriously, everything else reorganized around that decision.</div>
              <div className="text-left text-sm leading-6 text-stone-500">Greatness followed consistency, not hype.</div>
            </div>
            <div className=" w-40 relative overflow-visible">
              <img
                src="/images/About/Virat Kohli Sticker.webp"
                alt="Shreyas Patil"
                className=" z-[1] object-cover"
              />
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex w-40">
              <img
                src="/images/About/Rahul Dravid Sticker.webp"
                alt="Shreyas Patil"
                className=" z-[1] object-cover"
              />
            </div>
            <div className="text-left w-full text-stone-600">
              <div className="text-left text-xl leading-8">Rahul Dravid</div>
              <div className="text-left text-xl leading-8">Reliability under pressure</div>
              <div className="text-left text-sm text-stone-500">When the stakes were highest, he delivered the most consistent, unflappable performances.</div>
              <div className="text-left text-sm text-stone-500">His calm demeanor and rock-solid technique never wavered, even in high-pressure moments.</div>
            </div>
          </div>
        </div>
      </div>,
    },
    {
      front: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-100 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_-2px_2px_2px_rgba(255,255,255,1)] rounded-l-lg rounded-r-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0 -space-y-6 p-4 ">
          <div className="text-left mb-2 text-2xl p-2">None of them stopped at the interface.</div>
          <div className="flex items-center gap-2">
            <div className="-ml-10 w-80 relative">
              <img
                src="/images/About/Jordan Singer Sticker.webp"
                alt="Shreyas Patil"
                className=" z-[1] top-0 right-0 object-cover"
              />
            </div>
            <div className="text-left w-full text-stone-600">
              <div className="text-left text-xl leading-8">Jordan Singer</div>
              <div className="text-left text-xl leading-8">End-to-end ownership</div>
              <div className="text-left text-sm leading-6 text-stone-500">Designing ideas and building them, refusing to separate Design from execution.</div>
              <div className="text-left text-sm leading-6 text-stone-500">Craft doesn&apos;t stop at the mockup.</div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-left w-full text-stone-600 pl-4">
              <div className="text-left text-xl leading-8">Soleio</div>
              <div className="text-left text-xl leading-8">Seeing farther than the interface</div>
              <div className="text-left text-sm leading-6 text-stone-500">Thinking in systems, leverage, and second-order effects — not just screens.</div>
              <div className="text-left text-sm leading-6 text-stone-500">Great products are worn, not just used.</div>
            </div>
            <div className=" w-40 relative overflow-visible">
              <img
                src="/images/About/Soleio Sticker.webp"
                alt="Shreyas Patil"
                className=" z-[1] object-cover"
              />
            </div>
          </div>
        </div>
      </div>,
      back: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-200 shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1)] rounded-r-lg rounded-l-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0 p-4 space-y-4 ">
          <div className="text-left mb-2 text-2xl p-2">Readings that stayed with me</div>
          <div className="flex items-center">
            <div className="  relative">
              <img
                src="/images/About/Agent Cloud Sticker.webp"
                alt="Shreyas Patil"
                className=" z-[1] top-0 right-0 object-cover w-50"
              />
            </div>
            <div className="text-left w-full text-stone-600">
              <div className="text-left text-xl leading-8">Agent Cloud</div>
              <div className="text-left text-sm leading-6 text-stone-500">Made me rethink software as something you collaborate with — not something you operate.</div>
            </div>
          </div>
          <div className="flex items-center ml-2">
            <div className="text-left w-full text-stone-600">
              <div className="text-left text-xl leading-8">Invisible Details of Interaction Design — Rauno</div>
              <div className="text-left text-sm leading-6 text-stone-500">A reminder that the best interactions disappear because they respect the user&apos;s attention.</div>
            </div>
            <div className=" w-40 relative overflow-visible">
              <img
                src="/images/About/Interaction Sticker.webp"
                alt="Shreyas Patil"
                className=" z-[1] object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col items-start">
            <div className="flex h-44">
              <img
                src="/images/About/Apple Sticker.webp"
                alt="Shreyas Patil"
                className=" z-[1] object-cover h-44"
              />
            </div>
            <div className="text-left w-full text-stone-600 ml-2">
              <div className="text-left text-xl leading-8">Early Apple UI (Lisa / Apple II / Macintosh)</div>
              <div className="text-left text-sm leading-6 text-stone-500">Designing interactions before patterns existed — solving human problems, not UI problems.</div>
            </div>
          </div>
        </div>
      </div>,
    },
    {
      front: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-100 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_-2px_2px_2px_rgba(255,255,255,1)] rounded-l-lg rounded-r-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0 px-4 ">
          <div className="flex items-center gap-2">
            <div className="-ml-5 w-100 relative">
              <img
                src="/images/About/Spiderverse Sticker.webp"
                alt="Shreyas Patil"
                className=" z-[1] top-0 right-0 object-cover w-50"
              />
            </div>
            <div className="text-left w-full text-stone-600">
              <div className="text-left text-xl leading-8">Spider-Verse</div>
              <div className="text-left text-sm leading-6 text-stone-500">Reminded me that progress often starts before certainty — with a leap, not a plan.</div>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <div className="flex w-full">
              <img
                src="/images/About/Shoe Dog Sticker.webp"
                alt="Shreyas Patil"
                className=" z-[1] object-cover"
              />
            </div>
            <div className="text-left w-full text-stone-600 pl-4">
              <div className="text-left text-xl leading-8">Shoe Dog — Phil Knight</div>
              <div className="text-left text-sm leading-6 text-stone-500">Building something meaningful is messy, unglamorous, and worth doing anyway.</div>
            </div>
          </div>
        </div>
      </div>,
      back: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-200 shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1)] rounded-r-lg rounded-l-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0 p-4 ">
          <div className="text-left mb-2 text-2xl p-2">Things I remember cities by </div>
          <div className=" absolute top-16 left-1/3 -translate-x-1/2">
            <div className="absolute text-left  text-stone-500 -right-8 top-6 rotate-15">SpicyMoon - New York</div>
            <img
              src="/images/About/SpicyMoon Sticker.webp"
              alt="Shreyas Patil"
              className=" z-[1] w-50  object-contain rotate-90"
            />
          </div>
          <div className=" absolute bottom-4">
            <div className="absolute text-left  text-stone-500 -right-4 top-4 rotate-30">Feels Like Home</div>
            <div className="absolute text-left  text-stone-500 -right-4 bottom-5 -rotate-30">Surmai - Sunnyvale</div>
            <img
              src="/images/About/Surmai Sticker.webp"
              alt="Shreyas Patil"
              className=" z-[1] w-70  object-contain -rotate-2"
            />
          </div>
          <div className=" absolute w-60  left-3/4 top-2/3 -translate-y-1/2">
            <div className="absolute text-left  text-stone-500 left-0 top-0 -rotate-35">Shabree - Pune</div>
            <img
              src="/images/About/Shabree Sticker.webp"
              alt="Shreyas Patil"
              className=" z-[1]  object-contain -rotate-2"
            />
          </div>
          <div className="absolute w-[448px] left-9/12 top-3">
            <img
              src="/images/About/Veniros Sticker.webp"
              alt="Shreyas Patil"
              className=" z-[1]  object-contain "
            />
          </div>
        </div>
      </div>,
    },
    {
      front: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-100 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_-2px_2px_2px_rgba(255,255,255,1)] rounded-l-lg rounded-r-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0">
          <div className="absolute w-120 right-2/12 top-3">
            <img
              src="/images/About/Veniros Sticker.webp"
              alt="Shreyas Patil"
              className=" z-[1] "
            />
            <div className="absolute text-left  text-stone-500 -right-4 bottom-2 ">Veniros Cafe - New York</div>
          </div>
          <div className=" absolute w-60  -left-1/4 top-2/3 -translate-y-1/2">
            <img
              src="/images/About/Shabree Sticker.webp"
              alt="Shreyas Patil"
              className="z-[1]  object-contain -rotate-2 "
            />
            <div className="absolute text-left  text-stone-500 -right-4 bottom-5 -rotate-30">Post Hike Rituals</div>
          </div>
          <div className=" absolute  w-70 -right-5  bottom-0">
            <div className="absolute text-left  text-stone-500 right-8 top-4 rotate-30">Dumpling Story - SF</div>
            <img
              src="/images/About/Dumpling Story Sticker.webp"
              alt="Shreyas Patil"
              className=" z-[1]  object-contain "
            />
          </div>
        </div>
      </div>,
      back: <div className="relative text-center h-full w-full bg-linear-to-bl p-12 from-stone-50 to-stone-200 shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1)] rounded-r-lg rounded-l-2xl ">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="p-12 bg-white w-[744px] h-full">
          <div className="text-left mb-2 text-lg leading-9 font-handwriting">Making it feel right <br />
            I&apos;ve always cared about how things feel, not just how they work. The products I admire most don&apos;t demand attention — they earn it quietly, through rhythm, restraint, and care.
            For me, design is about showing up in the details. The moments most people don&apos;t notice. The timing of an animation. The weight of a transition. The absence of friction.
            I believe great experiences come from deep understanding — of people, systems, and context — and from taking responsibility end-to-end, not stopping at the interface.
            I&apos;m drawn to work that blends discipline with intuition, practicality with emotion. Work that feels inevitable once it exists.
            If something feels right, it&apos;s usually because someone pushed themselves further than necessary — even when no one was watching.
          </div>
        </div>
      </div>,
    },
    {
      front: <div className="relative text-center h-full w-full bg-linear-to-bl p-12  from-stone-50 to-stone-100 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_-2px_2px_2px_rgba(255,255,255,1)] rounded-l-lg rounded-r-2xl">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="relative h-full">
          <div className="p-12 bg-white w-[744px] h-full right-1.5 absolute">
            <div className="text-left mb-2 text-lg leading-9 font-handwriting">Making it feel right <br />
              I&apos;ve always cared about how things feel, not just how they work. The products I admire most don&apos;t demand attention — they earn it quietly, through rhythm, restraint, and care.
              For me, design is about showing up in the details. The moments most people don&apos;t notice. The timing of an animation. The weight of a transition. The absence of friction.
              I believe great experiences come from deep understanding — of people, systems, and context — and from taking responsibility end-to-end, not stopping at the interface.
              I&apos;m drawn to work that blends discipline with intuition, practicality with emotion. Work that feels inevitable once it exists.
              If something feels right, it&apos;s usually because someone pushed themselves further than necessary — even when no one was watching.
            </div>
          </div>
        </div>
      </div>,
      back: <div className="relative text-center h-full w-full bg-linear-to-bl p-12 from-stone-50 to-stone-200 shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1)] rounded-r-lg rounded-l-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="">
          <div className="text-left mb-2 font-handwriting">
            <div className="text-left text-2xl text-stone-600 leading-loose">Say hi,</div>
            <div className="text-left text-lg text-stone-600 leading-loose">I&apos;m always happy to talk about design, and the small details that make things feel right.<br />I&apos;m at a point where I&apos;m excited to take on my next full-time product design role. If you think my approach could be useful, I&apos;d love to talk.</div>
          </div>
          <div className="text-left text-stone-600 leading-loose mt-8">
            <div>shreyaspatil.design@gmail.com</div>
            <a 
              href="https://x.com/ShreyasPatil_" 
              target="_blank" 
              rel="noopener noreferrer"
              className=" hover:underline hover:underline-offset-6 text-stone-600 decoration-stone-400"
            >
              Twitter/X: @ShreyasPatil_
            </a>
            <div>LinkedIn</div>
          </div>
        </div>
      </div>,
    },
    {
      front: <div className="relative text-center h-full w-full bg-linear-to-bl p-12  from-stone-50 to-stone-100 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_-2px_2px_2px_rgba(255,255,255,1)] rounded-l-lg rounded-r-2xl overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
      </div>,
      back: <div className="relative isolate text-center h-full bg-linear-to-bl from-stone-700 to-stone-900 rounded-lg shadow-[inset_-2px_2px_4px_rgba(255,255,255,0.1)] overflow-hidden">
        <img 
          src="/images/About/Paper-Texture.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none opacity-50"
        />
        <div className="absolute inset-0 z-10 bg-linear-to-bl from-white/0 from-0% via-white/10 via-30%  to-stone-900/20 rounded-lg opacity-50" ></div>
        <div className="absolute inset-y-0 z-10 w-0.5 bg-black/80 blur-[2px]"></div>
        <div className="absolute inset-y-0 z-10 left-1 w-0.5 bg-linear-to-l from-white/50 to-black blur-xs"></div>
      </div>,
    },
  ];

  // Calculate initial position from origin rect (FLIP animation)
  // Use originRect for POSITION only, use known props for SCALE to avoid measurement discrepancies
  const initialX = originRect ? originRect.left : centerX;
  const initialY = originRect ? originRect.top : centerY;
  // Use the prop values for scale to ensure exact match with collapsed element
  const initialScaleX = collapsedWidth / expandedWidth;
  const initialScaleY = collapsedHeight / expandedHeight;

  // We need to render the AnimatePresence outside the portal conditional
  // to properly handle exit animations
  const portalWrapper = isMounted ? createPortal(
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isExpanded && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={handleClose}
          />

          {/* Expanded state - animates from collapsed position to center, scales on mobile */}
          <motion.div
            key="expanded-journal"
            ref={expandedContainerRef}
            className="fixed z-[9999] pointer-events-auto origin-top-left"
            style={{
              width: expandedWidth,
              height: expandedHeight,
              borderRadius: 12,
            }}
            initial={{ 
              left: initialX,
              top: initialY,
              rotate: 3,
              scaleX: initialScaleX,
              scaleY: initialScaleY,
            }}
            animate={{ 
              left: centerX,
              top: centerY,
              scaleX: scale,
              scaleY: scale,
              rotate: 0,
            }}
            exit={{ 
              left: initialX + 9,
              top: initialY - 1,
              scaleX: initialScaleX,
              scaleY: initialScaleY,
              rotate: 3,
            }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 30,
            }}
          >
            <Book 
              ref={bookRef}
              pageWidth={expandedWidth}
              pageHeight={expandedHeight}
              pages={pages}
              isExpanded={isExpanded}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <>
      {portalWrapper}

      {/* Collapsed state - in header position */}
      <motion.div
        ref={collapsedRef}
        className={`cursor-pointer relative group ${shouldHideCollapsed ? 'invisible' : ''}`}
        role="button"
        aria-label="Open journal"
        tabIndex={shouldHideCollapsed ? -1 : 0}
        style={{ 
          rotate: 3,
          width: collapsedWidth,
          height: collapsedHeight,
          borderRadius: 12,
        }}
        onClick={handleExpand}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleExpand();
          }
        }}
        whileHover={{ 
          rotate: -3,
          transition: { duration: 0.2 }
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        
        
        {/* Collapsed cover - uses expanded content scaled down by same factor as animation */}
        <div className="w-full h-full rounded-l-sm rounded-r-lg overflow-hidden shadow-lg -ml-2">
          {/* Inner wrapper at expanded dimensions, scaled down to match animation end state */}
          <div 
            className="origin-top-left"
            style={{
              width: expandedWidth,
              height: expandedHeight,
              transform: `scale(${collapsedWidth / expandedWidth}, ${collapsedHeight / expandedHeight})`,
            }}
          >
            {/* Exact same content as expanded front cover */}
            <div className="relative isolate text-center h-full bg-linear-to-bl from-stone-700 to-stone-900 rounded-lg shadow-[inset_-2px_2px_2px_rgba(255,255,255,0.1)] overflow-hidden">
              <img 
                src="/images/About/Paper-Texture.webp" 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none"
              />
              <div className="absolute inset-y-0 z-10 w-0.5 bg-black/80 blur-[2px]"></div>
              <div className="absolute inset-y-0 z-10 left-2 w-0.5 bg-linear-to-l from-white/50 to-black blur-xs "></div>
              <div className="absolute right-0 bottom-0 z-10 size-10 bg-linear-to-br from-transparent via-transparent via-50% to-white/20 blur-xs"></div>
              <div className="relative z-20 h-full flex flex-col p-4 font-black text-4xl items-center justify-center text-white/80 ">
                <SlapSticker />
                <div className="text-white absolute top-5/7 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-handwriting rotate-3 -ml-2">Product Designer</div>
                <div className="z-0 absolute inset-0"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
