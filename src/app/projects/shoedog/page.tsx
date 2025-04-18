"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  ImageSquare, 
  XLogo, 
  LinkedinLogo,
  Notepad 
} from '@phosphor-icons/react';
import EmailCopyButton from '@/components/EmailCopyButton';
import Image from 'next/image';

// Import the project data
import { projectsData } from '@/data/projectsData';

export default function ShoedogProject() {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Get the Shoedog project data (Assuming it's index 3 based on original file)
  const project = projectsData[3]; // Make sure this index is correct for Shoedog

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-slate-50 to-white">
      <main className="w-full max-w-[800px] flex flex-col gap-12">
        <div className="flex flex-col gap-12 items-start border-x border-slate-200 md:p-8 p-4 md:pb-24 pb-24 overflow-y-auto scrollbar-hide">
          {/* Back button and header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex w-full items-center gap-4 border-b border-slate-200 pb-4"
          >
            

            <button
                      key="back-button"
                      onClick={() => router.push('/projects')}
                      className="group relative rounded-full p-1 text-slate-500 border border-slate-400 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-amber-900 transition-colors cursor-pointer active:scale-95 hover:bg-[radial-gradient(at_50%_75%,theme(colors.amber.300),theme(colors.amber.500),theme(colors.amber.400))] active:scale-95 transition-all duration-300 hover:shadow-[0px_2px_2px_-1px_rgba(193,0,7,0.25),0px_4px_8px_1px_rgba(193,0,7,0.25)_inset,0px_-2px_2px_0px_rgba(193,0,7,0.25)_inset] hover:border-amber-700 transition-all duration-300"
                      aria-label="Back"
                    >
                      <div className="absolute bg-gradient-to-b from-white/90 to-white/5 rounded-b-[4px] rounded-t-[12px] group-hover:from-slate-100/70 group-hover:to-slate-100/20 inset-x-[3px] top-0.5 h-1/2 transition-all duration-300"></div>
                      <ArrowLeft size={20} weight="bold" />
            </button>

            <h1 className="text-[24px] font-bold text-slate-800">
              {project.title}
            </h1>
          </motion.div>

          {/* Project content */}
          <div className="w-full flex flex-col gap-24">


            <div className="w-full flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full aspect-[4/3] rounded-3xl border border-slate-200 overflow-hidden mb-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]"
            >
              <Image
                src={project.images[selectedImageIndex + 1]}
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
              {project.images.slice(1).map((image, index) => (
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

            {/* Role and Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className=""
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-800 mb-1">My Role</h2>
                  <p className="text-slate-600 leading-relaxed">Product Designer</p>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800 mb-1">Timeline</h2>
                  <p className="text-slate-600 leading-relaxed">16th Jan 2024</p>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800 mb-1 ">Project Setup</h2>
                  <p className="text-slate-600 leading-relaxed">24hr Sprint</p>
                </div>
              </div>
            </motion.div>
            </div>

            

            {/* Challenge Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className=""
            >
              <div className="">
                <h2 className="text-base font-semibold text-slate-800 mb-2">Challenge</h2>
                <p className="text-slate-600 leading-7">
                  The majority of shoe shoppers still prefer brick and mortar stores, but how do we bring them into the digital age?
                </p>
              </div>
            </motion.div>

            {/* Research Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className=""
            >
              <div className="">
                <h2 className="text-slate-800 font-semibold mb-4">Research: Understanding Trust Barriers</h2>
                <div className="">
                  <ul className="text-slate-600 leading-7 list-disc pl-5 space-y-2">
                    <li><strong>Objective:</strong> Understanding Trust Barriers</li>
                    <li><strong>Method:</strong> Survey followed by interviews</li>
                    <li><strong>Survey Participants:</strong> 23</li>
                    <li><strong>Interview Participants:</strong> 5 offline shoppers</li>
                    <li><strong>Age Range:</strong> 19-25</li>
                  </ul>
                  
                </div>
              </div>

              {/* Research Finding - Quote Style */}
               <div className='relative col-span-2 w-full rounded-xl border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset] mt-8'>
                   <div className=' flex items-center justify-start p-[1px] pb-0.5 border-dashed border-b border-slate-200'>
                     <div className='relative flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700  shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset]  border border-blue-500'>
                     <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60  to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                     <Notepad size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                     </div>
                     <div className='absolute inset-y-0 left-[31px] border-dashed border-l border-slate-200'></div>
                     <div className='absolute inset-y-0 right-[31px] border-dashed border-l border-slate-200'></div>
                   </div>
                   <div className='flex flex-col gap-2 px-11 pb-11 mt-2'>
                    <h2 className="text-slate-800 font-semibold mb-2 mt-4">Key Finding</h2>
                     <p className='text-slate-600 font-serif italic font-medium text-xl leading-relaxed'>
                       Offline shoppers harbor trust issues with online shoe purchases, primarily fearing incorrect fit and subpar quality.
                     </p>
                     <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                   </div>
               </div>
            </motion.div>


            {/* User Journey Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className=""
            >
              
              <div className="mt-2">
                  <h2 className="text-slate-800 font-semibold mb-4 mt-4">User Journey: Navigating Shopper Emotions</h2>
                  
                  {/* Online Shoppers Subsection */}
                  <h3 className="text-base font-semibold text-slate-800 mt-8 mb-2">
                    Online shoppers: Browsing Buzz vs. Arrival Anticlimax
                  </h3>
                  <p className="text-slate-600 leading-7">
                    Online shoppers often feel a lack of excitement when receiving their shoes as compared to offline shoppers. The high of the journey often comes during browsing of the shoe.
                  </p>
                  
                  <div className="isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                    <div className='w-full h-full aspect-4/3 bg-[url("/images/projects/ShoeDog/Online-User-Journey.webp")] bg-cover bg-center'></div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                  </div>
                  
                  {/* Offline Shoppers Subsection */}
                  <h3 className="text-base font-semibold text-slate-800 mt-8 mb-2">
                    Offline shoppers: The Joy of Discovery
                  </h3>
                  <p className="text-slate-600 leading-7">
                    Offline shoppers have a difficult time finding the perfect pair. But the joy of finding a perfect pair is high point of the journey.
                  </p>
                  
                  <div className="isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                  <div className='w-full h-full aspect-4/3 bg-[url("/images/projects/ShoeDog/Offline-User-Journey.webp")] bg-cover bg-center'></div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                  </div>
                  
                  {/* Psychology Principles Subsection */}
                  <h3 className="text-base font-semibold text-slate-800 mt-8 mb-2">
                    Psychology Principles
                  </h3>
                  <p className="text-slate-600 leading-7">
                    Offline shoe shoppers just love that feeling of finding the perfect pair in person, making it tough to get them to switch to online shopping. But by using psychology tricks like the peak-end rule and the mere exposure effect, a shoe shopping app can create a similar emotional experience and make online shopping more appealing.
                  </p>
                  
                  <div className="isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                    <div className='w-full h-full aspect-4/3 bg-[url("/images/projects/ShoeDog/Valley.webp")] bg-cover bg-center'></div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                  </div>
                  
              </div>
            </motion.div>


            {/* Solution Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className=""
            >
               
              <div className="mt-2">
                <h2 className="text-slate-800 font-semibold mb-4 mt-4">Solution: Try, Triumph, and Take Home</h2>
                <p className="text-slate-600 leading-7 py-3">
                  Say goodbye to the hassle of searching for shoes in store after store! With this app, you can have up to 3 pairs delivered right to your nearest store, so you can try them on and find the perfect fit. No more endless searching, just the joy of finding your dream shoes in person.
                </p>
                
                {/* New User Journey Subsection */}
                <h3 className="text-base font-semibold text-slate-800 mt-8 mb-2">
                  New User Journey
                </h3>
                
                <div className="isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                    <div className='w-full h-full aspect-4/3 bg-[url("/images/projects/ShoeDog/New-User-Journey.webp")] bg-cover bg-center'></div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                  </div>
                
              </div>
            </motion.div>

            {/* Visual Design Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.55 }}
              className=""
            >
              
              <div className="mt-2">
                 <h2 className="text-slate-800 font-semibold mb-4 mt-4">Visual Design</h2>
                
                {/* Wireframes Subsection */}
                <h3 className="text-base font-semibold text-slate-800 mt-8 mb-2">
                  Wireframes
                </h3>
                <p className="text-slate-600 leading-7">
                  This level was about adapting designs to different contexts and environments, particularly for theming in light and dark modes for both the products. It was a step towards making design not just visually appealing, but also responsive and user-centric.
                </p>
                
                <div className= "isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                    <div className='w-full h-full aspect-3/4 bg-[url("/images/projects/ShoeDog/Wireframes.webp")] bg-cover bg-center'></div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                </div>
                
                 {/* Moodboard Subsection */}
                <h3 className="text-base font-semibold text-slate-800 mt-8 mb-2">
                  Moodboard
                </h3>
                <p className="text-slate-600 leading-7">
                  The transparent Air Max shoes are so cool because you can see all the tech inside, and those glowing Nike Adapt shoes are like something out of a sci-fi movie! I wanted to capture that same futuristic vibe in the visual design of my project. To make a mood board that really pops, I used AI image generation to find all kinds of awesome pictures that have that same edgy, high-tech feel. The end result is a look that&apos;s totally fresh and exciting, just like those iconic Nike designs.
                </p>
                
                <div className="isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                    <div className='w-full h-full aspect-7/2 bg-[url("/images/projects/ShoeDog/Moodboard.png")] bg-cover bg-center'></div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                  </div>
                
                 {/* Mockups Subsection */}
                <h3 className="text-base font-semibold text-slate-800 mt-8 mb-2">
                  Mockups
                </h3>
                
                <div className="isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                    <div className='w-full h-full aspect-4/3 bg-[url("/images/projects/ShoeDog/Shoedog-Mockup.webp")] bg-cover bg-center'></div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                  </div>
                
              </div>

              
            </motion.div>

            {/* Links */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mt-6"
            >
              <Button
                className="group text-white font-semibold w-full md:w-[240px] h-[36px] bg-gradient-to-b from-slate-700 via-slate-500 to-slate-300 border border-slate-500 rounded-full shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_8px_8px_-4px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-slate-700 active:shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_8px_8px_-4px_rgba(0,0,0,0.0),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] transition-all duration-300 relative overflow-hidden active:bg-gradient-to-b active:from-slate-800 active:via-slate-600 active:to-slate-400 cursor-pointer flex items-center justify-center gap-2"
                onClick={() => window.open(project.github, '_blank')}
              >
                <GithubLogo size={20} weight="fill" />
                GitHub Repository
                <div className="absolute inset-2 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 group-active:from-white/30" />
              </Button>
              <Button
                className="group text-white font-semibold w-full md:w-[240px] h-[36px] bg-gradient-to-b from-blue-700 via-blue-500 to-blue-300 border border-blue-500 rounded-full shadow-[0px_2px_2px_-1px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.0),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.25),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:border-blue-700 active:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.0),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] transition-all duration-300 relative overflow-hidden active:bg-gradient-to-b active:from-blue-800 active:via-blue-600 active:to-blue-400 cursor-pointer flex items-center justify-center gap-2"
                onClick={() => window.open(project.live, '_blank')}
              >
                <Globe size={20} weight="fill" />
                Live Demo
                <div className="absolute inset-2 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 group-active:from-white/30" />
              </Button>
            </motion.div> */}
          </div>

           {/* Footer */}
           <div className="isolate relative flex flex-col-reverse w-full md:col-span-7 col-span-1 h-fit border border-slate-200 rounded-2xl md:p-6 p-4 items-center justify-center gap-2.5">
            <div className='flex flex-col md:flex-row w-full items-start md:items-center gap-3 md:gap-2 md:justify-between'>
        <p className='text-slate-500 text-sm'>© 2025 Shreyas Patil</p>
        <div className='text font-medium text-slate-500 flex items-center'>Made with &nbsp; <span className='text-xs'> ❤️ </span> &nbsp; and &nbsp; <Image src="/images/About/Cursor-Icon.png" alt="Cursor" width={20} height={20} className="h-5 inline-block" /> </div>
            </div>
      

            <div className="flex w-full items-center justify-start gap-3 pb-2.5 border-b border-slate-200">
        
        <a 
          href="https://x.com/ShreyasPatil_" 
          target="_blank" 
          rel="noopener noreferrer" 
          className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-slate-400 via-slate-600 to-slate-800 hover:from-slate-500 hover:via-slate-700 hover:to-slate-900 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-slate-700 cursor-pointer transition-all duration-300'
        >                  
          <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
          <XLogo size={18} weight="fill" />
        </a>

        

        <button className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-red-400 via-red-600 to-red-800 hover:from-red-500 hover:via-red-700 hover:to-red-900 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-red-700 cursor-pointer transition-all duration-300'>                  
          <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10 pointer-events-none`}></div>
          <EmailCopyButton />
        </button>

        <a 
          href="https://www.linkedin.com/in/shreyastpatil/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 hover:from-blue-400 hover:via-blue-600 hover:to-blue-800 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-blue-700 cursor-pointer transition-all duration-300'
        >                  
          <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
          <LinkedinLogo size={18} weight="fill" />
        </a>
            </div>

            <div className='w-full text-slate-500 text-sm flex items-center justify-between mb-6'>

              <div className='flex items-center gap-2'>
              <button
                      key="prev-project-button"
                      onClick={() => router.push('/projects/weatherwise')}
                      
                      className="group relative rounded-full p-0.5 text-slate-500 border border-slate-400 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-white cursor-pointer hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] active:scale-95 hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-blue-700 transition-all duration-300"
                      aria-label="Previous Project"
                    >
                      <div className="absolute bg-gradient-to-b from-white/90 to-white/5 rounded-b-[4px] rounded-t-[12px] group-hover:from-slate-100/70 group-hover:to-slate-100/20 inset-x-[3px] top-0.5 h-1/2 transition-all duration-300"></div>
                      <ArrowLeft size={14} weight="bold" />
              </button>
                <div className='text-xl font-medium'>Weatherwise</div>
              </div>


              <div className='flex items-center gap-2'>
                <div className='text-slate-500 text-xl'>Fractions</div>
                <button
                      key="next-project-button"
                      onClick={() => router.push('/projects/fractions')}
                      
                      className="group relative rounded-full p-0.5 text-slate-500 border border-slate-400 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-white cursor-pointer hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] active:scale-95 hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-blue-700 transition-all duration-300"
                      aria-label="Next Project"
                    >
                      <div className="absolute bg-gradient-to-b from-white/90 to-white/5 rounded-b-[4px] rounded-t-[12px] group-hover:from-slate-100/70 group-hover:to-slate-100/20 inset-x-[3px] top-0.5 h-1/2 transition-all duration-300"></div>
                      <ArrowRight size={14} weight="bold" />
              </button>
              </div>

              

            </div>
          </div>
          

        </div>

        
      </main>
    </div>
  );
} 