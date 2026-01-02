"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SpinnerGap } from '@phosphor-icons/react';
import Image from 'next/image';
import ProjectHeader from '@/components/ProjectHeader';
// Import the project data
import { projectsData } from '@/data/projectsData';
import MediaCard from '@/components/MediaCard';

export default function ItinerAIProject() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Get the ItinerAI project data
  const project = projectsData[1]; // ItinerAI is now the second project in the array

  return (
    <div className="min-h-screen flex justify-center bg-stone-50">
      <main className="w-full max-w-[800px] flex flex-col gap-12">
        <div className="flex flex-col gap-12 items-start  md:pt-24 pt-8 md:px-0 p-4 md:pb-24 pb-24">
          {/* Back button and header */}
          <ProjectHeader 
            title={project.title}
           
          />

          {/* Project content */}
          <div className="w-full">
            {/* Main image display */}
            <div className="w-full flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full aspect-[4/3] rounded-3xl border border-slate-200 overflow-hidden mb-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]"
            >
              <Image
                src={project.images[selectedImageIndex]}
                alt={`${project.title} - main image`}
                className="w-full h-full object-cover bg-slate-100"
                width={1200}
                height={800}
                priority={selectedImageIndex === 0}
              />
            </motion.div>

            {/* Image thumbnails */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex flex-wrap gap-4 mb-6 overflow-x-auto p-2"
            >
              {project.images.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`md:w-20 md:h-20 w-12 h-12 rounded-lg bg-slate-100 overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedImageIndex === index
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : 'opacity-70 hover:opacity-100 border border-slate-200'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${project.title} - thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={80}
                    height={80}
                  />
                </div>
              ))}
            </motion.div>
            </div>


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className=""
            >
              <div className="flex flex-col gap-4">
                <h2 className="text-header text-gradient-primary">ItinerAI: A Smarter, More Human Travel Companion</h2>
                <p className="text-body">ItinerAI is an experimental travel assistant where multiple AI agents, each with a distinct personality and focus area, collaborate to help you plan and coordinate trips effortlessly. From surfacing the best flight options to optimizing your itinerary around your schedule, these agents communicate with each other and with you, just like a well-aligned team.</p>
                <p className="text-body">In this prototype, I&apos;m exploring what it looks like when agents aren&apos;t just tools, but task owners with roles, opinions, and shared context. They discuss, divide responsibilities, and guide you through the planning process in a way that feels natural, helpful, and even delightful.</p>
              </div>
            </motion.div>

            <MediaCard
                  caption='Early Prototype Created in Play to convey the concept of the product'
                  className="my-8"
                  mediaType="video"
                  src='/videos/Walk-Through-Video.mp4'
                  aspectClass="aspect-4/3"
                  videoAttributes={{
                    autoPlay: true,
                    muted: true,
                    loop: true,
                    playsInline: true
                  }}
                />

                <MediaCard
                  caption='Testing the concept to see if models can categorize video based on the context of the video'
                  className="my-8"
                  mediaType="video"
                  src='/videos/ItinerAIbuild-1-Horizontal.mp4'
                  aspectClass="aspect-4/3"
                  videoAttributes={{
                    autoPlay: true,
                    muted: true,
                    loop: true,
                    playsInline: true
                  }}
                />


            {/* Quote */}
            <div className='relative col-span-2 w-full rounded-xl border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset] mt-8'>
                      
                      <div className=' flex items-center justify-start p-[1px] pb-0.5 border-dashed border-b border-slate-200'>
                        <div className='relative flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700  shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset]  border border-blue-500'>
                        <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60  to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                        <SpinnerGap size={16} weight="bold" className='text-white mt-[1px] mx-1' />
                        </div>
                        <div className='absolute inset-y-0 left-[31px] border-dashed border-l border-slate-200'></div>
                        <div className='absolute inset-y-0 right-[31px] border-dashed border-l border-slate-200'></div>
                      </div>

                      <div className='flex flex-col gap-2 px-11 pb-11 pt-5 items-center justify-center'>
                        <p className='text-slate-600 font-serif italic font-medium text-2xl'>Case Study Coming Soon</p>
                        
                        <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                      </div>
            </div>

            

            

            

            
          </div>

        </div>

        
      </main>
    </div>
  );
} 