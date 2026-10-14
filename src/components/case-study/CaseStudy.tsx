"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import ProjectHeader from "@/components/ProjectHeader";
import CaseStudyEnd from "./CaseStudyEnd";

/* The pieces a case study is written with. A page is a <CaseStudy> holding
   <Section>s; inside a section go plain paragraphs, <SubSection>, <Points>,
   <PullQuote> and MediaCard figures. */

interface CaseStudyProps {
  title: string;
  children: ReactNode;
}

export function CaseStudy({ title, children }: CaseStudyProps) {
  return (
    <div data-case-study className="min-h-screen flex justify-center bg-stone-50">
      <SectionRail title={title} />
      <main className="w-full max-w-(--column) flex flex-col gap-16 md:pt-24 pt-8 md:px-0 px-4 pb-24">
        <ProjectHeader title={title} />
        {children}
        <CaseStudyEnd />
      </main>
    </div>
  );
}

interface HeroProps {
  /** The project's slug, shared with its card on the home page */
  slug: string;
  src?: string;
  /** The backdrop behind the image, as on the home page card */
  background?: string;
  alt?: string;
  /** Something live in place of the image, for a project that is better shown running */
  media?: ReactNode;
  caption?: string;
  children?: ReactNode;
}

// The opening image, framed exactly like the project's card on the home page
// so that card can morph into it. Nothing here animates in: it has to be on
// screen the moment the page arrives. Children (the Meta row) sit beneath it.
export function Hero({ slug, src, background, alt = "", media, caption, children }: HeroProps) {
  return (
    <figure className="w-full flex flex-col gap-6">
      <div
        className="relative w-full aspect-[4/3] surface bg-stone-100 bg-cover bg-center"
        style={{ backgroundImage: background && `url("${background}")`, viewTransitionName: `project-${slug}` }}
      >
        {src && <Image src={src} alt={alt} fill priority sizes="(min-width: 672px) 672px, 100vw" className="object-cover" />}
        {media}
      </div>
      {caption && <figcaption className="text-caption -mt-2">{caption}</figcaption>}
      {children}
    </figure>
  );
}

interface SectionProps {
  id: string;
  title: string;
  /** Short name for the side rail. Sections without one are left off it. */
  nav?: string;
  children: ReactNode;
}

// A chapter of the case study. It fades up the first time it scrolls into view.
export function Section({ id, title, nav, children }: SectionProps) {
  return (
    <motion.section
      id={id}
      data-nav={nav}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col gap-4 scroll-mt-24"
    >
      <h2 className="text-header text-gradient-primary">{title}</h2>
      {children}
    </motion.section>
  );
}

export function SubSection({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-header-2 pt-4">{title}</h3>
      {children}
    </div>
  );
}

// A bulleted list with gel beads for bullets
export function Points({ children }: { children: ReactNode }) {
  return <ul className="gel-list text-body text-pretty">{children}</ul>;
}

// A line worth stopping on, set on a pane of glass with a gel bar down its side
export function PullQuote({ children, by }: { children: ReactNode; by?: string }) {
  return (
    <blockquote className="glass-pane relative mt-3 py-5 pl-9 pr-6 text-important text-pretty italic w-full">
      <span
        aria-hidden
        className="absolute left-4 top-5 bottom-5 w-1.5 rounded-full bg-linear-to-b from-stone-200 to-stone-400 shadow-[0_0_0_1px_var(--color-stone-400),inset_1px_0_0.5px_rgba(255,255,255,0.85)]"
      />
      {children}
      {by && <footer className="mt-2 text-sm not-italic text-stone-500">{by}</footer>}
    </blockquote>
  );
}

// A small label above a heading, like "Iteration 2"
export function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-subheader pt-4 -mb-3">{children}</p>;
}

interface CalloutProps {
  /** A short tag for what this is: "Statistic", "Reddit" */
  label?: string;
  /** A small icon for the tag, shown on a gel badge */
  icon?: ReactNode;
  /** The badge's colour */
  tone?: "blue" | "orange" | "stone";
  title?: string;
  children: ReactNode;
  className?: string;
}

const badgeTones = { blue: "aqua-blue", orange: "aqua-orange", stone: "" };

// Something set apart from the running text on a pane of glass: a statistic,
// a quote from research, a note. With an icon it becomes a pinned card: a gel
// tile sits in the top-left corner saying what kind of thing this is, and
// dashed guides rule off the margins around the content.
export function Callout({ label, icon, tone = "blue", title, children, className = "" }: CalloutProps) {
  const heading = title && <h4 className="text-header-2 mx-0 text-stone-800!">{title}</h4>;

  if (!icon) {
    return (
      <div className={`glass-pane w-full flex flex-col gap-2 p-6 ${className}`}>
        {label && <p className="text-subheader text-stone-400! mx-0">{label}</p>}
        {heading}
        {children}
      </div>
    );
  }

  const guide = "absolute border-dashed border-stone-300/70 pointer-events-none";
  return (
    <div className={`glass-pane relative w-full ${className}`}>
      {/* The top margin, with the tile pinned in its corner. The tile sits 2px
          in from the card's edge, so its corner is the card's radius less 2px:
          the two curves stay parallel. */}
      <div className="relative flex items-center gap-2.5 h-8 p-[2px] border-b border-dashed border-stone-300/70">
        <span
          aria-hidden
          className={`aqua ${badgeTones[tone]} size-7 shrink-0 pointer-events-none rounded-[5px]! rounded-tl-[calc(var(--surface-radius)-2px)]! [--aqua-gloss-radius:calc(var(--surface-radius)-4px)_3px_3px_3px]`}
        >
          {icon}
        </span>
        {label && <p className="text-subheader text-stone-400! mx-0 w-auto pl-2">{label}</p>}
      </div>
      <div aria-hidden className={`${guide} inset-y-0 left-8 border-l`} />
      <div aria-hidden className={`${guide} inset-y-0 right-8 border-l`} />
      <div aria-hidden className={`${guide} inset-x-0 bottom-8 border-b`} />

      <div className="flex flex-col gap-2 px-11 pt-5 pb-12">
        {heading}
        {children}
      </div>
    </div>
  );
}

// Figures shown side by side for comparison
export function FigureRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 [&>*]:my-0">{children}</div>;
}

// The facts under the hero: role, timeline and the like
export function Meta({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="column grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-subheader font-bold text-stone-800 mb-1">{item.label}</dt>
          <dd className="text-stone-600 leading-relaxed">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

interface RailItem {
  id: string;
  label: string;
}

// The table of contents in the left margin on wide screens. It lists every
// section that has a `nav` name and marks the one being read. While the
// project's title is on screen nothing is marked; once it scrolls away the
// title takes its place at the head of the rail.
function SectionRail({ title }: { title: string }) {
  const [items, setItems] = useState<RailItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [titleInView, setTitleInView] = useState(true);
  // Set while the page scrolls to a section picked from the rail, so the
  // sections passing on the way don't take the marker
  const isJumping = useRef(false);

  // Marks the picked section at once and holds it until the scroll settles.
  // A short section can come to rest above the reading band and would
  // otherwise never be marked.
  const jumpTo = (id: string) => {
    setActiveId(id);
    isJumping.current = true;
    const settle = () => {
      isJumping.current = false;
      window.removeEventListener("scrollend", settle);
      clearTimeout(fallback);
    };
    // For browsers without scrollend, and for a jump that doesn't scroll at all
    const fallback = setTimeout(settle, 1000);
    window.addEventListener("scrollend", settle);
  };

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-nav]"));
    setItems(sections.map((section) => ({ id: section.id, label: section.dataset.nav as string })));

    // A section is "being read" while it crosses a band a third of the way down the screen
    const observer = new IntersectionObserver(
      (entries) => {
        if (isJumping.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
          // Scrolling back up until the first section drops below the band
          // leaves nothing being read
          else if (entry.target === sections[0] && entry.boundingClientRect.top > (entry.rootBounds?.bottom ?? 0)) {
            setActiveId((current) => (current === entry.target.id ? null : current));
          }
        });
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    sections.forEach((section) => observer.observe(section));

    const heading = document.querySelector("main h1");
    const titleObserver = new IntersectionObserver(([entry]) => setTitleInView(entry.isIntersecting));
    if (heading) titleObserver.observe(heading);

    return () => {
      observer.disconnect();
      titleObserver.disconnect();
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Sections"
      className="hidden xl:flex fixed top-1/2 -translate-y-1/2 left-[max(1.5rem,calc(50%-var(--column)/2-13rem))] w-40 flex-col gap-0.5"
    >
      {/* Hung above the list rather than in it, so the list stays put as the
          title comes and goes */}
      <AnimatePresence>
        {!titleInView && (
          <motion.a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full left-0 right-0 mb-3 pl-4 text-sm font-medium text-stone-800 text-pretty"
          >
            {title}
          </motion.a>
        )}
      </AnimatePresence>
      {items.map((item) => {
        const isActive = !titleInView && item.id === activeId;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={() => jumpTo(item.id)}
            aria-current={isActive ? "location" : undefined}
            className={`relative py-1 pl-4 text-sm transition-colors duration-200 ${isActive ? "text-stone-800" : "text-stone-400 hover:text-stone-600"}`}
          >
            {isActive && (
              <motion.span
                layoutId="section-rail-marker"
                className="absolute left-0 top-1/2 -mt-[3px] size-1.5 rounded-full bg-blue-500 shadow-[0_0_0_1px_var(--color-blue-700),inset_0_1px_0_rgba(255,255,255,0.6)]"
                transition={{ type: "spring", stiffness: 520, damping: 40, mass: 0.8 }}
              />
            )}
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
