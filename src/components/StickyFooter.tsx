"use client";

import React, { useState, useEffect, useRef } from 'react';
import { XLogo } from '@phosphor-icons/react';
import { IconFile, IconArrowUp } from 'nucleo-micro-bold-essential';
import { IconLinkedin  } from 'nucleo-social-media';
import EmailCopyButton from './EmailCopyButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useDialKit } from 'dialkit';
import Glass from './Glass';
import { DockTooltip, useDockTooltip } from './DockTooltip';

// Project navigation order - defines the sequence of projects
const projectOrder = [
  { slug: 'quinn', name: 'Quinn' },
  { slug: 'itinerai', name: 'ItinerAI' },
  { slug: 'dashworks', name: 'Dashworks' },
  { slug: 'weatherwise', name: 'WeatherWise' },
  
];

const dockTips = {
  x: 'Follow on X',
  email: 'Copy email',
  linkedin: 'Connect on LinkedIn',
  resume: 'Download resume',
  top: 'Back to top',
};
const dockTipLabels = Object.values(dockTips);

export default function StickyFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

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

  // Detect overlay visibility
  useEffect(() => {
    const checkOverlay = () => {
      // Check for overlay element - look for fixed positioned elements with high z-index
      // The ExpandableJournal overlay has: fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]
      const allElements = document.querySelectorAll('*');
      let hasOverlay = false;
      
      for (const el of allElements) {
        const computedStyle = window.getComputedStyle(el);
        const zIndex = parseInt(computedStyle.zIndex);
        const position = computedStyle.position;
        
        // Check if element is fixed/absolute with high z-index (overlay range).
        // Layers that are hidden, or that let clicks through, aren't covering the page.
        const isCovering = computedStyle.visibility !== 'hidden' && computedStyle.pointerEvents !== 'none';
        if ((position === 'fixed' || position === 'absolute') && zIndex >= 9990 && isCovering) {
          // Additional check: overlay typically covers full viewport
          const rect = el.getBoundingClientRect();
          if (rect.width >= window.innerWidth * 0.9 && rect.height >= window.innerHeight * 0.9) {
            hasOverlay = true;
            break;
          }
        }
      }
      
      setIsOverlayVisible(hasOverlay);
    };

    // Initial check
    checkOverlay();

    // Use MutationObserver to watch for overlay changes
    const observer = new MutationObserver(checkOverlay);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // Also check periodically as a fallback
    const interval = setInterval(checkOverlay, 150);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Tuned live from the DialKit panel in development
  const glass = useDialKit('Glass dock', {
    blur: [2, 0, 40],
    saturate: [2, 1, 3],
    tint: [1, 0, 1],
    refraction: [26, 0, 80],
    bezel: [10, 2, 24],
  });

  const dockRef = useRef<HTMLDivElement>(null);
  const { tip, tipFor } = useDockTooltip(dockRef);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showProjectNav = isProjectPage && isNearBottom;

  return (
      <motion.div
        className="sticky bottom-0 w-full flex flex-col items-center gap-3 px-4 pt-6 pb-4 z-50 pointer-events-none will-change-transform"
        initial={{ y: 0 }}
        animate={{ 
          y: isOverlayVisible ? '100%' : 0,
        }}
        transition={{ 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1] // Custom easing for smooth slide
        }}
      >
        {/* Project navigation - only shows when at bottom on project pages.
            The glass fades itself: fading a parent would leave it nothing to blur. */}
        <AnimatePresence>
          {showProjectNav && (
            <Glass
              {...glass}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-auto flex items-center gap-1.5 p-1.5 max-w-full overflow-x-auto scrollbar-hide"
            >
              {projectOrder.map((project) => {
                const isCurrentProject = project.slug === currentSlug;
                return (
                  <button
                    key={project.slug}
                    onClick={() => router.push(`/projects/${project.slug}`)}
                    disabled={isCurrentProject}
                    className={`aqua shrink-0 h-8 px-2.5 md:px-3 text-[13px] md:text-sm font-medium ${isCurrentProject ? 'aqua-blue' : 'aqua-to-blue [--aqua-ink:var(--color-stone-600)]'}`}
                    aria-label={isCurrentProject ? `Current project: ${project.name}` : `Go to ${project.name}`}
                  >
                    {project.name}
                  </button>
                );
              })}
            </Glass>
          )}
        </AnimatePresence>

        {/* The dock: socials, then resume and back to top */}
        {/* The tooltip sits beside the dock, not inside it: glass can't blur
            the page from within another pane of glass. */}
        <div ref={dockRef} className="relative pointer-events-auto">
          <DockTooltip tip={tip} labels={dockTipLabels} raised={showProjectNav} />
          <Glass {...glass} className="flex items-center p-1.5">
            <div className="flex items-center gap-1.5">
              <a
                href="https://x.com/ShreyasPatil_"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on X"
                {...tipFor(dockTips.x)}
                className="aqua aqua-round size-8"
              >
                {/* A 44px tap area around the 30px pill */}
                <span aria-hidden className="absolute -inset-2" />
                <XLogo size={16} weight="fill" />
              </a>
              <button aria-label="Copy email" {...tipFor(dockTips.email)} className="aqua aqua-round size-8">
                <span aria-hidden className="absolute -inset-2" />
                <EmailCopyButton />
              </button>
              <a
                href="https://www.linkedin.com/in/shreyastpatil/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect on LinkedIn"
                {...tipFor(dockTips.linkedin)}
                className="aqua aqua-round size-8"
              >
                <span aria-hidden className="absolute -inset-2" />
                <IconLinkedin size={16} />
              </a>
            </div>

            {/* A groove in the glass */}
            <div aria-hidden className="mx-2.5 h-5 w-px bg-stone-900/15 shadow-[1px_0_0_rgba(255,255,255,0.7)]" />
            <a
              href="/document/Shreyas-Patil-Resume-2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download
              {...tipFor(dockTips.resume)}
              className="aqua h-8 pl-2 pr-2.5 gap-1 text-sm font-medium"
            >
              <IconFile size={16} />
              Resume
            </a>

            {/* The dock widens to let "Top" in. The wrapper clips while it grows,
                so it carries the gap and enough room for the pill's shadow. */}
            <AnimatePresence initial={false}>
              {showScrollTop && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden -my-1 py-1"
                >
                  <button
                    aria-label="Scroll to top"
                    onClick={scrollToTop}
                    {...tipFor(dockTips.top)}
                    className="aqua ml-1.5 mr-px h-8 pl-2 pr-2.5 gap-1 text-sm font-medium"
                  >
                    <IconArrowUp size={16} />
                    Top
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </Glass>
        </div>
      </motion.div>
  );
}
