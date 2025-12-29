"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import ProjectThumbnailCard from '@/components/ProjectThumbnailCard';
import { CraftContent } from '@/components/CraftContent';
import { ExpandableJournal } from '@/components/journal/ExpandableJournal';
import { IconArrowDown } from 'nucleo-micro-bold-essential';



//adding a comment
// Main page container variants for staggered loading
const pageContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

// Individual section variants with blur
const sectionVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { 
      duration: 0.4,
      ease: "easeOut" as const
    }
  }
};


export default function Home() {

  return (
    <div className="min-h-screen flex justify-center">
      <main className="relative w-full md:max-w-[800px] max-w-[377px]">

        <motion.div 
          className="relative flex flex-col gap-16 items-start md:pt-32 pt-16 md:px-0 px-4 md:pb-24 pb-24"
          variants={pageContainerVariants}
          initial="hidden"
          animate="visible"
        >

          
          
          <motion.div
            variants={sectionVariants}
            // On desktop: flex-row with Journal left, text right. On mobile: flex-col, text first, Journal below.
            className="w-full relative mb-0 md:gap-8 gap-12 items-center flex flex-col "
          >
            {/* Header text: occupies full width on mobile, right side on desktop */}
            <div className="flex flex-col gap-4 text-stone-600 w-full">
              <div className="text-page-header text-gradient-primary">
                Hey, I'm Shreyas
              </div>
              <p className="text-important text-pretty text-stone-600!">
                I&apos;m a Product Designer based in the Bay Area, I think about interaction, systems, and the details people feel before they notice.
              </p>
              {/* You can uncomment the media grid if needed here */}
            </div>
            
            {/* Expandable Journal: below text on mobile, left on desktop */}
            <div className="relative z-10 group w-full h-80 flex items-center justify-center ">
            <img 
            src="/images/About/Golden-Gate-Bridge-sticker.webp" 
            alt="Hello, my name is Shreyas" 
            className="z-[1] size-32 absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 object-contain"
          />
              <ExpandableJournal 
                collapsedWidth={180}
                collapsedHeight={240}
                expandedWidth={420}
                expandedHeight={560}
              />
            </div>
          </motion.div>

          {/* Projects section */}
          <motion.div 
            className="flex flex-col gap-4 w-full mt-16"
            variants={sectionVariants}
          >
            <div className="text-subheader text-pretty flex items-center gap-1 text-stone-400!"><span>Selected Work</span> <IconArrowDown size={14} /></div>
            <div className="w-full flex flex-col gap-20 items-start">
                  
              <ProjectThumbnailCard name="Quinn" link="/projects/quinn">
                <div className="text-body text-pretty">AI-native relationship intelligence product focused on how executives manage and maintain their professional networks. I led the 10–12 month product vision, shaping the system&apos;s foundations, long-term evolution, and growth direction.</div>
                <div className="relative w-full aspect-4/3 mt-4 bg-[url('/images/projects/thumbnails/Quinn-Thumbnail-Background.webp')] bg-cover bg-center rounded-2xl border border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.05),0_4px_4px_-2px_rgba(0,0,0,0.07)] overflow-hidden">
                  <Image src="/images/projects/Quinn/Masterlist.webp" alt="Quinn" fill className="object-cover object-center" />
                </div>
              </ProjectThumbnailCard>

              <ProjectThumbnailCard name="ItinerAI" link="/projects/itinerai">
                <div className="text-body text-pretty">ItinerAI is an experimental travel assistant where multiple AI agents, each with a distinct personality and focus area, collaborate to help you plan and coordinate trips effortlessly. From surfacing the best flight options to optimizing your itinerary around your schedule, these agents communicate with each other and with you, just like a well-aligned team.</div>
                <div className="relative w-full aspect-4/3 mt-4 bg-[url('/images/projects/thumbnails/ItinearAI-Thumbnail-Background.webp')] bg-cover bg-center rounded-2xl border border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.05),0_4px_4px_-2px_rgba(0,0,0,0.07)] overflow-hidden">
                  <Image src="/images/projects/ItinerAI/ItinerAI-Thumbnail.png" alt="ItinerAI" fill className="object-cover object-center" />
                </div>
              </ProjectThumbnailCard>

              <ProjectThumbnailCard name="Dashworks" link="/projects/dashworks">
                <div className="text-body text-pretty">Dashworks is an AI-powered knowledge assistant that helps companies centralize their knowledge scattered across various apps. It provides accurate answers to employee questions by searching across the company&apos;s connected applications.</div>
                <div className="relative w-full aspect-4/3 mt-4 bg-[url('/images/projects/thumbnails/Dashworks-Thumbnail-Background.webp')] bg-cover bg-center rounded-2xl border border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.05),0_4px_4px_-2px_rgba(0,0,0,0.07)] overflow-hidden">
                  <Image src="/images/projects/Dashworks/Dashworks-Onboarding-1.png" alt="Dashworks" fill className="object-cover object-center" />
                </div>
              </ProjectThumbnailCard>

              <ProjectThumbnailCard name="WeatherWise" link="/projects/weatherwise">
                <div className="text-body text-pretty">Improving Navigational Safety with Weather-Adaptive Routing in Google Maps.</div>
                <div className="relative w-full aspect-4/3 mt-4 bg-[url('/images/projects/thumbnails/WeatherWise-Thumbnail-Background.webp')] bg-cover bg-center rounded-2xl border border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.05),0_4px_4px_-2px_rgba(0,0,0,0.07)] overflow-hidden">
                  <Image src="/images/projects/Weatherwise/WeatherWise-Thumbnail.webp" alt="WeatherWise" fill className="object-cover object-center" />
                </div>
              </ProjectThumbnailCard>                  
              
            </div>
          </motion.div>

          {/* Craft section */}
          <motion.div
            className="flex flex-col gap-6 w-full mt-16"
            variants={sectionVariants}
          >
            <div className="text-subheader text-pretty flex items-center gap-1 text-stone-400!"><span>Craft</span> <IconArrowDown size={14} /></div>
            <CraftContent hideHeader hideBackground />
          </motion.div>

        </motion.div>
        
      </main>
    </div>
  );
}