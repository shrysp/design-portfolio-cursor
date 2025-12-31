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
            <div className="md:hidden flex flex-col gap-4 text-stone-600 w-full">
              <div className="text-page-header text-gradient-primary">
                Hey, I&apos;m Shreyas
              </div>
              <p className="text-important text-pretty text-stone-600!">
                I&apos;m a Product Designer based in the Bay Area, I think about interaction, systems, and the details people feel before they notice.
              </p>
              
            </div>
            
            {/* Expandable Journal: below text on mobile, left on desktop */}
            <div className="isolate relative z-10 group w-full h-80 flex items-center justify-center ">
              <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 flex gap-2 ">
                <img 
                    src="/images/About/Mission Peak Sticker.webp" 
                    alt="Hello, my name is Shreyas" 
                    className="z-[0] size-100 object-contain mask-r-from-0% mask-r-to-100% opacity-70"
                  />
                  <div className="absolute text-stone-500 text-sm font-handwriting text-left left-1/5  top-20">Mission Peak</div>
                </div>
                
                <div className="z-[0] absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 flex gap-2 ">
                  <div className="absolute text-stone-500 text-sm font-handwriting text-left w-30  -rotate-60 top-8 left-1/5">Based in Bay Area</div>
                  <img 
                    src="/images/About/Golden-Gate-Bridge-sticker.webp" 
                    alt="Hello, my name is Shreyas" 
                    className=" size-100 object-contain mask-r-from-0% mask-r-to-100% opacity-50"
                  />
                </div>
              <ExpandableJournal 
                collapsedWidth={240}
                collapsedHeight={320}
                expandedWidth={420}
                expandedHeight={560}
              />
              <div className="absolute -top-10 left-2/3 flex gap-2 items-center ">
                <svg width="42" height="15" viewBox="0 0 42 15" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleY(-1)" }}>
                  <path d="M2.54828 0.0432179C2.2963 -0.0697398 2.00045 0.0429621 1.8875 0.294945L0.0467438 4.40124C-0.0662139 4.65322 0.046488 4.94906 0.298471 5.06202C0.550453 5.17498 0.846295 5.06227 0.959253 4.81029L2.59548 1.16026L6.24551 2.79648C6.4975 2.90944 6.79334 2.79673 6.9063 2.54475C7.01925 2.29277 6.90655 1.99693 6.65457 1.88397L2.54828 0.0432179ZM15.8438 10.5177L15.6714 10.0483L15.8438 10.5177ZM21.6997 7.17961L21.383 6.79267L21.6997 7.17961ZM2.34375 0.499473L1.87651 0.67747C2.52271 2.37374 3.55684 5.86028 5.64221 8.44332C6.69551 9.748 8.03834 10.8537 9.76489 11.3934C11.4959 11.9345 13.5582 11.8896 16.0161 10.987L15.8438 10.5177L15.6714 10.0483C13.3793 10.89 11.5458 10.9024 10.0632 10.439C8.57624 9.97417 7.38782 9.01359 6.42029 7.81516C4.46399 5.39199 3.49813 2.1252 2.81099 0.321475L2.34375 0.499473ZM15.8438 10.5177L16.0161 10.987C18.472 10.0852 20.4356 8.86022 22.0163 7.56655L21.6997 7.17961L21.383 6.79267C19.8787 8.02376 18.0112 9.18915 15.6714 10.0483L15.8438 10.5177ZM35.7867 6.65666L35.3794 6.94664C36.5667 8.61438 37.379 10.209 38.2294 11.583C39.0476 12.9049 39.9199 14.0528 41.1856 14.4747L41.3438 14.0004L41.5019 13.526C40.6123 13.2295 39.9028 12.3865 39.0797 11.0567C38.2888 9.77893 37.4002 8.06095 36.194 6.36669L35.7867 6.65666ZM21.6997 7.17961L22.0163 7.56655C24.4719 5.55691 26.972 4.18862 29.2665 3.92831C31.5095 3.67384 33.616 4.4697 35.3794 6.94664L35.7867 6.65666L36.194 6.36669C34.2334 3.61268 31.781 2.63663 29.1538 2.93469C26.578 3.22691 23.8966 4.73556 21.383 6.79267L21.6997 7.17961Z" fill="#A6A09B"/>
                </svg>
                <div className="text-stone-500 text-sm font-handwriting text-left w-30">Flip to know 
                More About me</div>
              </div>
              
              <div className="absolute -z-[1] top-2/3 right-1/5 translate-x-1/2 -translate-y-1/2">
                <div className="absolute text-stone-500 text-sm font-handwriting text-left w-30 mt-2 left-1/2 bottom-1/5">MS in HCI @ RIT</div>
                <img 
                    src="/images/About/RIT Ritchie Sticker.webp" 
                    alt="Hello, my name is Shreyas" 
                    className=" size-140 object-contain mask-l-from-0% opacity-50"
                  />
                </div>
                <img 
                  src="/images/About/Cricket Sticker.webp" 
                  alt="Hello, my name is Shreyas" 
                  className="-z-[2] h-120 absolute top-1/2 -right-15 translate-x-1/2 -translate-y-1/2 object-contain mask-l-from-0% opacity-70"
                />
                
            </div>
          </motion.div>

          {/* Projects section */}
          <motion.div 
            className="flex flex-col gap-4 w-full mt-8"
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