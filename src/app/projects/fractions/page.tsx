"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import EmailCopyButton from '@/components/EmailCopyButton';
import { LinkedinLogo, XLogo } from '@phosphor-icons/react';
import Image from 'next/image';

// Import the project data
import { projectsData } from '@/data/projectsData';

export default function FractionsProject() {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Get the Fractions project data
  const project = projectsData[3]; // Fractions is the fourth project in the array

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
            <motion.div
              onClick={() => router.push('/projects')}
              className={`group relative flex items-center justify-center text-white/80 size-[32px] border border-blue-700 bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] rounded-full cursor-pointer
                active:bg-radial-[at_50%_75%] active:from-blue-300 active:via-blue-500 active:to-blue-700 active:border-blue-700 active:text-white/80 active:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset]`}
            >
              <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
              <ArrowLeft size={20} weight="bold" />
            </motion.div>
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

            {/* Project overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
            >
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Overview</h2>
                <ul className="space-y-2">
                  {project.description?.map((desc, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                      <p className="text-slate-700">{desc}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Role and Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">My Role</h3>
                  <p className="text-slate-700">{project.role}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Timeline</h3>
                  <p className="text-slate-700">{project.timeline}</p>
                </div>
              </div>
            </motion.div>

            {/* Challenge and Solution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Challenge</h3>
                  <p className="text-slate-700">{project.challenge}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Solution</h3>
                  <p className="text-slate-700">{project.solution}</p>
                </div>
              </div>
            </motion.div>

            {/* Outcomes - Main focus for this project */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Outcomes</h2>
              <div className="space-y-4">
                {project.outcome && Array.isArray(project.outcome) && project.outcome.map((result: string, index: number) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-medium">
                        {index + 1}
                      </div>
                      <h3 className="text-md font-semibold text-blue-800">
                        {result.split(':')[0]}
                      </h3>
                    </div>
                    <p className="text-slate-700 pl-8">
                      {result.split(':').slice(1).join(':').trim()}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Testimonials - Main focus for this project */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Testimonials</h2>
              <div className="space-y-6">
                {project.testimonial && Array.isArray(project.testimonial) && project.testimonial.map((item: { quote: string; name: string; role: string }, index: number) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                    <p className="text-slate-700 italic mb-4">&quot;{item.quote}&quot;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold">
                        {item.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Technologies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.55 }}
              className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies?.map((tech, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
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