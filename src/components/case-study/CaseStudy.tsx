"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import ProjectHeader from "@/components/ProjectHeader";

/* The pieces a case study is written with. A page is a <CaseStudy> holding
   <Section>s; inside a section go plain paragraphs, <SubSection>, <Points>,
   <PullQuote> and MediaCard figures. */

interface CaseStudyProps {
  title: string;
  children: ReactNode;
}

export function CaseStudy({ title, children }: CaseStudyProps) {
  return (
    <div className="min-h-screen flex justify-center bg-stone-50">
      <SectionRail />
      <main className="w-full max-w-(--column) flex flex-col gap-16 md:pt-24 pt-8 md:px-0 px-4 pb-24">
        <ProjectHeader title={title} />
        {children}
      </main>
    </div>
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
export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="glass-pane relative mt-3 py-5 pl-9 pr-6 text-important text-pretty italic w-full">
      <span
        aria-hidden
        className="absolute left-4 top-5 bottom-5 w-1.5 rounded-full bg-linear-to-b from-stone-200 to-stone-400 shadow-[0_0_0_1px_var(--color-stone-400),inset_1px_0_0.5px_rgba(255,255,255,0.85)]"
      />
      {children}
    </blockquote>
  );
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
// section that has a `nav` name and marks the one being read.
function SectionRail() {
  const [items, setItems] = useState<RailItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-nav]"));
    setItems(sections.map((section) => ({ id: section.id, label: section.dataset.nav as string })));

    // A section is "being read" while it crosses a band a third of the way down the screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Sections"
      className="hidden xl:flex fixed top-1/2 -translate-y-1/2 left-[max(1.5rem,calc(50%-var(--column)/2-13rem))] w-40 flex-col gap-0.5"
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
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
