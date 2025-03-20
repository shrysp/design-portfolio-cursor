"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, GithubLogo, Globe, XLogo, LinkedinLogo, } from '@phosphor-icons/react';
import EmailCopyButton from '@/components/EmailCopyButton';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Import the project data
import { projectsData } from '@/data/projectsData';

export default function WeatherWiseProject() {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Get the WeatherWise project data
  const project = projectsData[3]; // WeatherWise is the second project in the array

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-slate-50 to-white">
      <main className="w-full max-w-[800px] flex flex-col gap-12">
        <div className="flex flex-col gap-12 items-start border border-slate-200 md:p-8 p-4 md:pb-24 pb-24 h-[100vh] overflow-y-auto scrollbar-hide">
          {/* Back button and header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex w-full items-center gap-4 border-b border-slate-200 pb-4"
          >
            

            <motion.button
                      key="back-button"
                      layoutId="back-button"
                      layout="position"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3
                      }}
                      onClick={() => router.push('/projects')}
                      
                      className="group relative rounded-full p-1 text-slate-500 border border-slate-400 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-amber-900 transition-colors cursor-pointer active:scale-95 hover:bg-[radial-gradient(at_50%_75%,theme(colors.amber.300),theme(colors.amber.500),theme(colors.amber.400))] active:scale-95 transition-all duration-300 hover:shadow-[0px_2px_2px_-1px_rgba(193,0,7,0.25),0px_4px_8px_1px_rgba(193,0,7,0.25)_inset,0px_-2px_2px_0px_rgba(193,0,7,0.25)_inset] hover:border-amber-700 transition-all duration-300"
                      aria-label="Back"
                    >
                      <div className="absolute bg-gradient-to-b from-white/90 to-white/5 rounded-b-[4px] rounded-t-[12px] group-hover:from-slate-100/70 group-hover:to-slate-100/20 inset-x-[3px] top-0.5 h-1/2 transition-all duration-300"></div>
                      <ArrowLeft size={20} weight="bold" />
                    </motion.button>

            <h1 className="text-[24px] font-bold text-slate-800">
              {project.title}
            </h1>
          </motion.div>

          {/* Project content */}
          <div className="w-full">
            {/* Main image display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full h-[400px] rounded-3xl overflow-hidden mb-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]"
            >
              <Image
                src={project.images[selectedImageIndex]}
                alt={`${project.title} - main image`}
                className="w-full h-full object-cover"
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
              className="flex gap-2 mb-6 overflow-x-auto pb-2"
            >
              {project.images.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedImageIndex === index
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : 'opacity-70 hover:opacity-100'
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

            {/* Project Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className=""
            >
              <div className="">
                <h2 className="text-[40px] font-bold text-slate-800 pb-4">WeatherWise</h2>
                <p className="text-xl text-slate-600 pb-2">Weather-Aware Routing for Safer Travels</p>
              </div>
            </motion.div>

            {/* Challenge Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className=""
            >
              <div className="pt-5">
                <h2 className="text-lg leading-[1.2] font-semibold text-slate-800 pb-2 border-b border-slate-200">Challenge</h2>
                <p className="text leading-8 text-slate-700 py-3">
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
              <div className="pt-5">
                <h2 className="text-lg leading-[1.2] font-semibold text-slate-800 pb-2 border-b border-slate-200">Research: Understanding Trust Barriers</h2>
                <div className="">
                  <ul className="text leading-8 text-slate-700 list-disc pl-5 py-3">
                    <li><strong>Objective:</strong> Understanding Trust Barriers</li>
                    <li><strong>Method:</strong> Survey followed by interviews</li>
                    <li><strong>Survey Participants:</strong> 23</li>
                    <li><strong>Interview Participants:</strong> 5 offline shoppers</li>
                    <li><strong>Age Range:</strong> 19-25</li>
                  </ul>
                </div>
                <p className="text leading-8 text-slate-800 p-3 bg-slate-100 rounded-lg my-3">
                  Through my research, I found that offline shoppers have trust issues when it comes to online shoe shopping. They fear they won&apos;t get the perfect fit or the quality won&apos;t be up to their standards.
                </p>
              </div>
            </motion.div>

            {/* User Journey Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className=""
            >
              <div className="pt-5">
                <h2 className="text-lg leading-[1.2] font-semibold text-slate-800 pb-2 border-b border-slate-200">User Journey: Navigating Shopper Emotions</h2>
                
                <p className="text font-semibold leading-8 text-slate-700 pb-3 pt-5">
                  Online shoppers: Browsing Buzz vs. Arrival Anticlimax
                </p>
                <p className="text leading-8 text-slate-700 pb-3">
                  Online shoppers often feel a lack of excitement when receiving their shoes as compared to offline shoppers. The high of the journey often comes during browsing of the shoe.
                </p>
                
                <div className="w-full h-[672px] bg-[#F5F8F6] rounded-3xl mb-6 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">User Journey Visualization</p>
                </div>
                
                <p className="text font-semibold leading-8 text-slate-700 pb-3 pt-5">
                  Offline shoppers: The Joy of Discovery
                </p>
                <p className="text leading-8 text-slate-700 pb-3">
                  Offline shoppers have a difficult time finding the perfect pair. But the joy of finding a perfect pair is high point of the journey.
                </p>
                
                <div className="w-full h-[672px] bg-[#F5F8F6] rounded-3xl mb-6 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">Offline Shopper Journey Visualization</p>
                </div>
                
                <p className="text leading-8 text-slate-700 pb-3">
                  Offline shoe shoppers just love that feeling of finding the perfect pair in person, making it tough to get them to switch to online shopping. But by using psychology tricks like the peak-end rule and the mere exposure effect, a shoe shopping app can create a similar emotional experience and make online shopping more appealing.
                </p>
                
                <div className="w-full h-[328px] bg-[#F5F8F6] rounded-3xl mb-6 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">Psychology Principles Visualization</p>
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
              <div className="pt-5">
                <h2 className="text-lg leading-[1.2] font-semibold text-slate-800 pb-2 border-b border-slate-200">Solution: Try, Triumph, and Take Home</h2>
                <p className="text leading-8 text-slate-700 py-3">
                  Say goodbye to the hassle of searching for shoes in store after store! With this app, you can have up to 3 pairs delivered right to your nearest store, so you can try them on and find the perfect fit. No more endless searching, just the joy of finding your dream shoes in person.
                </p>
                
                <p className="text-lg leading-[1.2] font-semibold text-slate-800 py-3">
                  New User Journey
                </p>
                
                <div className="w-full h-[672px] bg-[#F5F8F6] rounded-3xl mb-6 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">New User Journey Visualization</p>
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
              <div className="pt-5">
                <h2 className="text-lg leading-[1.2] font-semibold text-slate-800 pb-2 border-b border-slate-200">Visual Design</h2>
                
                <p className="text font-semibold leading-8 text-slate-700 pb-3 pt-5">
                  Wireframes
                </p>
                <p className="text leading-8 text-slate-700 pb-3">
                  This level was about adapting designs to different contexts and environments, particularly for theming in light and dark modes for both the products. It was a step towards making design not just visually appealing, but also responsive and user-centric.
                </p>
                
                <div className="w-full h-[672px] bg-[#F5F8F6] rounded-3xl mb-6 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">Wireframes Visualization</p>
                </div>
                
                <p className="text font-semibold leading-8 text-slate-700 pb-3 pt-5">
                  Moodboard
                </p>
                <p className="text leading-8 text-slate-700 pb-3">
                  The transparent Air Max shoes are so cool because you can see all the tech inside, and those glowing Nike Adapt shoes are like something out of a sci-fi movie! I wanted to capture that same futuristic vibe in the visual design of my project. To make a mood board that really pops, I used AI image generation to find all kinds of awesome pictures that have that same edgy, high-tech feel. The end result is a look that&apos;s totally fresh and exciting, just like those iconic Nike designs.
                </p>
                
                <div className="w-full h-[328px] bg-[#F5F8F6] rounded-3xl mb-6 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">Moodboard Visualization</p>
                </div>
                
                <p className="text font-semibold leading-8 text-slate-700 pb-3 pt-5">
                  Mockups
                </p>
                
                <div className="w-full h-[672px] bg-[#F5F8F6] rounded-3xl mb-6 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">Mockups Visualization</p>
                </div>
              </div>
            </motion.div>

            {/* Links */}
            <motion.div
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
            </motion.div>
          </div>

           {/* Footer */}
           <div className="isolate relative flex flex-col-reverse w-full md:col-span-7 col-span-1 h-fit border border-slate-200 rounded-2xl md:p-6 p-4 items-center justify-center gap-2.5">
            <div className='flex w-full items-center gap-2 justify-between'>
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
                      key="back-button"
                      onClick={() => router.push('/projects/itinerai')}
                      
                      className="group relative rounded-full p-0.5 text-slate-500 border border-slate-400 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-white cursor-pointer hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] active:scale-95 hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-blue-700 transition-all duration-300"
                      aria-label="Previous Project"
                    >
                      <div className="absolute bg-gradient-to-b from-white/90 to-white/5 rounded-b-[4px] rounded-t-[12px] group-hover:from-slate-100/70 group-hover:to-slate-100/20 inset-x-[3px] top-0.5 h-1/2 transition-all duration-300"></div>
                      <ArrowLeft size={14} weight="bold" />
              </button>
                <div className='text-xl font-medium'>Itinerai</div>
              </div>


              <div className='flex items-center gap-2'>
                <div className='text-slate-500 text-xl'>Weatherwise</div>
                <button
                      key="back-button"
                      onClick={() => router.push('/projects/weatherwise')}
                      
                      className="group relative rounded-full p-0.5 text-slate-500 border border-slate-400 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-white cursor-pointer hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] active:scale-95 hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-blue-700 transition-all duration-300"
                      aria-label="Previous Project"
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