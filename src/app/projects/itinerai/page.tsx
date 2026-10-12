"use client";

import React from 'react';

import MediaCard from '@/components/MediaCard';
import { CaseStudy, Hero, Section } from '@/components/case-study/CaseStudy';

// Import the project data
import { projectsData } from '@/data/projectsData';

export default function ItinerAIProject() {
  const project = projectsData[1];

  return (
    <CaseStudy title={project.title}>
      <Hero
        slug="itinerai"
        src="/images/projects/ItinerAI/ItinerAI-Thumbnail.png"
        background="/images/projects/thumbnails/ItinearAI-Thumbnail-Background.webp"
        alt={`${project.title} - main image`}
      />

      <Section id="overview" nav="Overview" title="ItinerAI: A Smarter, More Human Travel Companion">
        <p className="text-body">ItinerAI is an experimental travel assistant where multiple AI agents, each with a distinct personality and focus area, collaborate to help you plan and coordinate trips effortlessly. From surfacing the best flight options to optimizing your itinerary around your schedule, these agents communicate with each other and with you, just like a well-aligned team.</p>
        <p className="text-body">In this prototype, I&apos;m exploring what it looks like when agents aren&apos;t just tools, but task owners with roles, opinions, and shared context. They discuss, divide responsibilities, and guide you through the planning process in a way that feels natural, helpful, and even delightful.</p>
        <MediaCard mediaType="image" src="/images/projects/ItinerAI/ItinerAI-Chat-3-Hand.png" aspectClass="aspect-4/3" />
      </Section>

      <Section id="prototypes" nav="Prototypes" title="Prototypes">
        <MediaCard
          caption="Early Prototype Created in Play to convey the concept of the product"
          mediaType="video"
          src="/videos/Walk-Through-Video.mp4"
          aspectClass="aspect-4/3"
          videoAttributes={{ autoPlay: true, muted: true, loop: true, playsInline: true }}
        />
        <MediaCard
          caption="Testing the concept to see if models can categorize video based on the context of the video"
          mediaType="video"
          src="/videos/ItinerAIbuild-1-horizontal.mp4"
          aspectClass="aspect-4/3"
          videoAttributes={{ autoPlay: true, muted: true, loop: true, playsInline: true }}
        />
      </Section>
    </CaseStudy>
  );
}
