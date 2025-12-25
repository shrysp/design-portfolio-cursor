"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ProjectThumbnailHeader from '@/components/ProjectThumbnailHeader';
import { CraftContent } from '@/components/CraftContent';
import { ExpandableJournal } from '@/components/journal/ExpandableJournal';



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


// Moving Background for tabs (mirrors ModalGrid)
const MovingBackground = ({ selectedButton }: { selectedButton: HTMLButtonElement | null }) => (
  <motion.div
    className="absolute h-full rounded-full"
    animate={{
      x: selectedButton?.offsetLeft ?? 0,
      y: selectedButton?.offsetTop ?? 0,
      width: selectedButton?.offsetWidth ?? 0,
      height: selectedButton?.offsetHeight ?? 0,
    }}
    transition={{ type: "spring", stiffness: 600, damping: 40 }}
  >
    <div className="flex items-center justify-between size-fit px-[1px] rounded-full bg-radial-[at_50%_75%] from-blue-400 via-blue-500 to-blue-700 border border-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] h-full w-full">
      <div className="absolute flex inset-2 top-0.5 h-1/2 items-center justify-center bg-gradient-to-b from-white/50 to-white/5 rounded-t-[60px] rounded-b-[16px] z-10" />
    </div>
  </motion.div>
);

const tabs = [
  { id: "work" as const, label: "Work" },
  { id: "about" as const, label: "About" },
  { id: "craft" as const, label: "Craft" },
];

export default function Home() {

  const [activeTab, setActiveTab] = useState<"work" | "about" | "craft">("work");
  const [selectedButton, setSelectedButton] = useState<HTMLButtonElement | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const index = tabs.findIndex((tab) => tab.id === activeTab);
    setSelectedButton(buttonRefs.current[index] ?? null);
  }, [activeTab]);

  return (
    <div className="min-h-screen flex justify-center">
      <main className="relative w-full md:max-w-[800px] max-w-[361px]">

        <motion.div 
          className="relative flex flex-col gap-0 items-start md:pt-32 pt-8 md:px-0 px-4 md:pb-24 pb-24"
          variants={pageContainerVariants}
          initial="hidden"
          animate="visible"
        >

          
          
          <motion.div
            variants={sectionVariants}
            className="flex relative mb-16"
          >
            <div className='flex flex-col gap-4 text-gray-800'>
                  <div className=" text-page-header text-gradient-primary">
                   
                    Shreyas Patil
                  </div>

                  <p className="text-important ">I&apos;m a product designer exploring how humans and computers connect and building the interfaces in between. Based in the Bay Area.</p>

                  {/* <motion.div 
                    className='w-full grid grid-cols-3 gap-4'
                    variants={imagesContainerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={imageVariants}>
                      <MediaCard
                        mediaType="image"
                        src="/images/About/About-1.jpeg"
                        aspectClass="aspect-square"
                      />  
                    </motion.div>

                    <motion.div variants={imageVariants}>
                      <MediaCard
                        mediaType="image"
                        src="/images/About/About-2.jpeg"
                        aspectClass="aspect-square"
                        rightIcon={<Image src="/logos/Swift Icon.svg" alt="Swift Icon" width={20} height={20} className="object-contain" />}
                      />
                    </motion.div>

                    <motion.div variants={imageVariants} className="">
                      <MediaCard
                        mediaType="image"
                        src="/images/About/About-3.jpeg"
                        aspectClass="aspect-square"
                        rightIcon={<Image src="/logos/Create with Play Logo.png" alt="Create with Play Logo" width={20} height={20} className="object-contain " />}
                      />
                    </motion.div>

                  </motion.div> */}
                  
                
            </div> 
            {/* Expandable Journal positioned to the left */}
            <div className=" -z-10 group">
              <ExpandableJournal 
                collapsedWidth={150}
                collapsedHeight={200}
                expandedWidth={420}
                expandedHeight={560}
              />
            </div>
                   
          </motion.div>

          {/* Tabs below intro */}
          <motion.div
            variants={sectionVariants}
            className="w-full flex justify-start"
          >
            <div className="relative w-fit flex rounded-full bg-stone-200">
              <MovingBackground selectedButton={selectedButton} />

              {/* Tab buttons */}
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  className={`relative z-10 flex items-center justify-center gap-2 py-1.5 px-5 rounded-full text-body md:text-body font-medium cursor-pointer ${
                    activeTab === tab.id
                      ? "text-white!"
                      : "text-stone-600! hover:text-stone-800!"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="drop-shadow-[0_0.5px_0px_rgba(255,255,255,1)]">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
          
          {activeTab === "work" && (
            <>
              {/* Projects section */}
              <motion.div 
                className="flex flex-col gap-4 w-full mt-16"
                variants={sectionVariants}
              >

                  
                  

                  <div className="w-full flex flex-col gap-16 items-start">
                        
                    <div className="w-full flex flex-col gap-4">
                      
                          <ProjectThumbnailHeader name="Quinn" link="/projects/quinn" />
                          <div className="text-body text-pretty">Quinn is an AI-native relationship intelligence platform that transforms how executives and business leaders manage their professional networks. The product bridges the gap between traditional CRM systems and intelligent relationship management.</div>
                          <div className="relative w-full aspect-4/3 my-4  bg-[url('/images/projects/thumbnails/Quinn-Thumbnail-Background.webp')] bg-cover bg-center rounded-2xl -z-10 border border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.05),0_4px_4px_-2px_rgba(0,0,0,0.07)] overflow-hidden">
                            <Image src="/images/projects/Dashworks/Dashworks-Onboarding-1.png" alt="Quinn" fill className="object-cover object-center" />
                          </div>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                          <ProjectThumbnailHeader name="ItinerAI" link="/projects/itinerai" />
                          <div className="text-body text-pretty">ItinerAI is an experimental travel assistant where multiple AI agents, each with a distinct personality and focus area, collaborate to help you plan and coordinate trips effortlessly. From surfacing the best flight options to optimizing your itinerary around your schedule, these agents communicate with each other and with you, just like a well-aligned team.</div>
                          <div className="relative w-full aspect-4/3 my-4  bg-[url('/images/projects/thumbnails/ItinearAI-Thumbnail-Background.webp')] bg-cover bg-center rounded-2xl -z-10 border border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.05),0_4px_4px_-2px_rgba(0,0,0,0.07)] overflow-hidden">
                            <Image src="/images/projects/ItinerAI/ItinerAI-Thumbnail.png" alt="ItinerAI" fill className="object-cover object-center" />
                          </div>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                          <ProjectThumbnailHeader name="Dashworks" link="/projects/dashworks" />
                          <div className="text-body text-pretty">Dashworks is an AI-powered knowledge assistant that helps companies centralize their knowledge scattered across various apps. It provides accurate answers to employee questions by searching across the company&apos;s connected applications.</div>
                          <div className="relative w-full aspect-4/3 my-4  bg-[url('/images/projects/thumbnails/Dashworks-Thumbnail-Background.webp')] bg-cover bg-center rounded-2xl -z-10 border border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.05),0_4px_4px_-2px_rgba(0,0,0,0.07)] overflow-hidden">
                            <Image src="/images/projects/Dashworks/Dashworks-Onboarding-1.png" alt="Quinn" fill className="object-cover object-center" />
                          </div>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                          <ProjectThumbnailHeader name="WeatherWise" link="/projects/weatherwise" />
                          <div className="text-body text-pretty">Improving Navigational Safety with Weather-Adaptive Routing in Google Maps.</div>
                          <div className="relative w-full aspect-4/3 my-4  bg-[url('/images/projects/thumbnails/WeatherWise-Thumbnail-Background.webp')] bg-cover bg-center rounded-2xl -z-10 border border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.05),0_4px_4px_-2px_rgba(0,0,0,0.07)] overflow-hidden">
                            
                          </div>
                    </div>                  
                    
                  </div>

              </motion.div>

            </>
          )}

          {activeTab === "about" && (
            <>
              {/* About tab content */}
              <motion.div
                className="flex flex-col gap-6 w-full mt-16"
                variants={sectionVariants}
              >
                <div className="text-body text-pretty">
                  <p className="mb-4">Click the journal on the left to learn more about me. It contains my story, inspirations, and what drives me as a designer.</p>
                  <p className="text-stone-500">The journal is interactive — you can flip through the pages to explore different aspects of my journey.</p>
                </div>
              </motion.div>
            </>
          )}

          {activeTab === "craft" && (
            <>
              {/* Craft tab content */}
              <motion.div
                className="flex flex-col gap-6 w-full mt-16"
                variants={sectionVariants}
              >
                <CraftContent hideHeader hideBackground />
              </motion.div>
            </>
          )}

        </motion.div>
        
      </main>
    </div>
  );
}