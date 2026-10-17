"use client";

import { useSitePath } from '@/lib/sitePath';
import React, { useState, useEffect, useRef } from 'react';
import { XLogo } from '@phosphor-icons/react';
import { IconFile, IconArrowUp } from 'nucleo-micro-bold-essential';
import { IconLinkedin  } from 'nucleo-social-media';
import EmailCopyButton, { EMAIL } from './EmailCopyButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Glass, { canRefract } from './Glass';
import { isRouteTransitioning, onRouteTransitionEnd } from '@/lib/routeTransition';
import { DockTooltip, useDockTooltip } from './DockTooltip';
import { EASE_OUT } from '@/lib/easing';

// Project navigation order - defines the sequence of projects
const projectOrder = [
  { slug: 'cameo', name: 'Cameo' },
  { slug: 'quinn', name: 'Quinn' },
  { slug: 'itinerai', name: 'ItinerAI' },
  { slug: 'dashworks', name: 'Dashworks' },
  { slug: 'weatherwise', name: 'WeatherWise' },
  
];

// How often, at most, the dock looks for an overlay covering the page
const CHECK_MS = 150;
// How long the email button says it has copied before it offers to again
const COPIED_MS = 2000;

// The dock's glass, as tuned in the browser
const glass = { blur: 2, saturate: 2, tint: 1, refraction: 26, bezel: 10 };

const dockTips = {
  x: 'Follow on X',
  email: 'Copy email',
  copied: 'Email copied',
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
  // Under /dive, the same page of the review copy
  const { path, to } = useSitePath();
  const isProjectPage = path.startsWith('/projects/') && path !== '/projects';
  const currentSlug = isProjectPage ? path.split('/')[2] : null;

  useEffect(() => {
    const handleScroll = () => {
      // The dock holds its shape while one page morphs into the next, then
      // catches up, so "Top" slides in or out afterwards instead of mid-flight
      if (isRouteTransitioning()) return;
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
    const stopListening = onRouteTransitionEnd(handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      stopListening();
    };
  }, []);

  // Detect overlay visibility
  useEffect(() => {
    const checkOverlay = () => {
      // Check for overlay element - look for fixed positioned elements with high z-index
      // The ExpandableJournal overlay has: fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]
      // A layer covering the screen is under its centre, so only what's stacked
      // there is looked at, not every element on the page. Layers that are hidden
      // or let clicks through aren't hit there at all.
      const allElements = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2);
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

    // At most one look every CHECK_MS, however much is changing: run on each
    // change it would run every frame while anything animated (the tour's dive
    // moves sixty photos a frame), and each look still makes the browser bring
    // layout up to date.
    let queued = 0;
    const checkSoon = () => {
      if (!queued) queued = window.setTimeout(() => {
        queued = 0;
        checkOverlay();
      }, CHECK_MS);
    };

    // Use MutationObserver to watch for overlay changes
    const observer = new MutationObserver(checkSoon);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // Also check periodically as a fallback
    const interval = setInterval(checkSoon, CHECK_MS);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      window.clearTimeout(queued);
    };
  }, []);


  // During a page transition the dock is drawn as a picture of itself, which
  // can't blur what's behind it. The picture's frame is given the same
  // backdrop instead (see ::view-transition-group(dock) in globals.css).
  useEffect(() => {
    const lens = canRefract() && glass.refraction > 0 ? 'url(#dock-lens) ' : '';
    document.documentElement.style.setProperty('--dock-backdrop', `${lens}blur(${glass.blur}px) saturate(${glass.saturate})`);
  }, []);

  const dockRef = useRef<HTMLDivElement>(null);
  const { tip, tipFor, relabel } = useDockTooltip(dockRef);

  // The email button: copies, says so on its icon and its tooltip, then goes back
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(copiedTimer.current), []);
  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAIL).catch(() => {});
    setCopied(true);
    relabel(dockTips.email, dockTips.copied);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => {
      setCopied(false);
      relabel(dockTips.copied, dockTips.email);
    }, COPIED_MS);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showProjectNav = isProjectPage && isNearBottom;

  // The tour and an invitation are the whole screen from the first frame: no
  // dock to show and then slide away from under them.
  if (pathname === '/projects/cameo/tour' || pathname === '/projects/cameo/invite') return null;

  return (
      <motion.div
        data-site-dock
        className="sticky bottom-0 w-full flex flex-col items-center gap-3 px-4 pt-6 pb-4 z-50 pointer-events-none will-change-transform"
        initial={{ y: 0 }}
        animate={{ 
          y: isOverlayVisible ? '100%' : 0,
        }}
        transition={{ 
          duration: 0.3, 
          ease: EASE_OUT
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
                    onClick={() => router.push(to(`/projects/${project.slug}`))}
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
          {/* The page-transition name goes on the glass itself. On a wrapper it
              would wall the glass off from the page it's meant to blur. */}
          <Glass {...glass} filterId="dock-lens" data-dock style={{ viewTransitionName: 'dock' }} className="flex items-center p-1.5">
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
              <button
                type="button"
                aria-label={copied ? dockTips.copied : dockTips.email}
                onClick={copyEmail}
                {...tipFor(copied ? dockTips.copied : dockTips.email)}
                className="aqua aqua-round size-8"
              >
                <span aria-hidden className="absolute -inset-2" />
                <EmailCopyButton copied={copied} />
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
