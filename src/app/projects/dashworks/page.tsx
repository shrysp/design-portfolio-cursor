"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, SplitHorizontal, ArrowRight, ImageSquare } from '@phosphor-icons/react';
import Image from 'next/image';
import EmailCopyButton from '@/components/EmailCopyButton';
import { LinkedinLogo, XLogo } from '@phosphor-icons/react';

// Import the project data
import { projectsData } from '@/data/projectsData';
import ModalGrid from '@/components/ModalGrid';

export default function DashworksProject() {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Get the Dashworks project data
  const project = projectsData[1]; // Dashworks is the second project in the array

  // References and state for image comparison slider
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  // Initialize image comparison slider
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      let clientX;
      
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = e.clientX;
      }
      
      const position = {
        x: clientX - containerRect.left,
        width: containerRect.width
      };
      
      let percentage = (position.x / position.width) * 100;
      percentage = Math.max(0, Math.min(percentage, 100));
      
      setSliderPosition(percentage);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-slate-50 to-white">
      <main className="w-full max-w-[800px] flex flex-col gap-12">
        <div className="flex flex-col gap-8 items-start border-x border-slate-200 md:p-8 p-4 md:pb-24 pb-24 overflow-y-auto scrollbar-hide">
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
            {/* Main image display */}
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
              className="flex flex-wrap md:gap-4 gap-3 mb-6 overflow-x-auto p-2"
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
                  <p className="text-slate-600 leading-relaxed">Product Design Intern</p>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800 mb-1">Timeline</h2>
                  <p className="text-slate-600 leading-relaxed">Jan 2024 - Apr 2024</p>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800 mb-1 ">Team</h2>
                  <p className="text-slate-600 leading-relaxed">Aahel Iyer </p>
                </div>
              </div>
            </motion.div>
            </div>

            

            {/* Project overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className=""
            >
              <div className="">
                <h2 className="text-base font-semibold text-slate-800 mb-2">What is Dashworks?</h2>
                <p className="text-slate-600 leading-7">Dashworks is an AI-powered knowledge assistant that helps companies centralize their knowledge scattered across various apps. It provides accurate answers to employee questions by searching across the company&apos;s connected applications.</p>
                <p className="text-slate-600 leading-7">Dashworks integrates with over 50 apps, including Slack, Jira, Confluence, and Google Drive, to create a unified knowledge base.</p>
              </div>
            </motion.div>


            {/* Challenge and Solution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className=""
            >
              <div className="">
                <div>
                  <h3 className="text-base font-semibold text-slate-800 mb-2">Challenges</h3>
                  <ul className="text-slate-600 leading-7 list-disc pl-5 space-y-4">
                    <li><strong>Speeding Up Product Development:</strong> Improving processes and design velocity to improve the frequency and impact of product updates.</li>
                    <li><strong>Simplifying Onboarding for Quick Value:</strong> Redesigning onboarding to minimize setup time and help teams quickly grasp and benefit from the product.</li>
                  </ul>
                </div>
                
              </div>
            </motion.div>

            {/* Outcomes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className=""
            >
                
                <h2 className="text-base font-semibold text-slate-800 mb-2">Gaining technical knowledge to drive impactful design decisions</h2>
                <div className='flex flex-col gap-2'>
                    <div className='text-base text-slate-600 leading-7'>Designing for complex enterprise tools requires a deep understanding of both the product and its technical foundation. During my internship at Dashworks, I conducted a comprehensive product audit, analyzing its entire ecosystem to identify areas for improvement. This process helped bridge the gap between design and engineering, ensuring that our solutions were both user-friendly and technically feasible.</div>
                    <div className='isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200'>
                      <div className='w-full h-full aspect-4/3 bg-white bg-[url("/images/projects/Dashworks/Audit.png")] bg-cover bg-center'></div>
                      <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                        <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                        <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                      </div>
                      <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                      <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                      <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                      <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                    </div>
                    <div className='isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200'>
                      <div className='w-full h-full aspect-4/3 bg-white bg-[url("/images/projects/Dashworks/How-Dashworks-works.png")] bg-cover bg-center'></div>
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className=""
            >
                
                <h2 className="text-base font-semibold text-slate-800 mb-2">Design System</h2>
                <div className='flex flex-col gap-2'>
                    <div className='text-base text-slate-600 leading-7'>Our team set a goal to deliver our product faster to meet customer demands and stand out in a competitive market. To reach this goal, we needed a design system for better quality and speed.</div>
                    <div className='isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200'>
                      <div className='w-full h-full aspect-4/3 bg-white bg-[url("/images/projects/Dashworks/Dashworks-Design-System.png")] bg-cover bg-center'></div>
                      <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                        <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                        <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                      </div>
                      <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                      <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                      <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                      <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                    </div>

                    
                    
                    {/* Image comparison slider - React implementation */}
                    <div 
                        className='isolate relative rounded-xl overflow-hidden mt-8 p-8 bg-slate-100 border border-slate-200' 
                        ref={containerRef}
                    >

                        <div className='relative w-full h-full bg-white  aspect-4/3'>
                          {/* Light image (background) */}
                          <div className='absolute inset-0 rounded-3xl bg-clear bg-[url("/images/projects/Dashworks/Light.png")] bg-cover bg-center'></div>
                        
                          {/* Dark image (overlay) */}
                          <div 
                            className='absolute inset-0 overflow-hidden rounded-3xl'
                            ref={overlayRef}
                            style={{
                                width: `${sliderPosition}%`
                            }}
                        >
                            <div 
                                className='absolute inset-0 bg-[url("/images/projects/Dashworks/Dark.png")] bg-cover bg-center'
                                style={{
                                    width: `${100 / (sliderPosition / 100)}%`,
                                    height: '100%'
                                }}
                            ></div>
                          </div>
                        
                          {/* Slider handle */}
                          <div 
                            className='absolute top-0 bottom-0 w-[2px] bg-linear-to-r from-slate-800/50 to-slate-100/50 cursor-ew-resize flex items-center justify-center z-10'
                            ref={sliderRef}
                            style={{
                                left: `${sliderPosition}%`,
                                transform: 'translateX(-50%)'
                            }}
                            onMouseDown={handleMouseDown}
                            onTouchStart={handleMouseDown}
                        >
                            <div className='rounded-full md:w-[24px] flex items-center justify-center isolate group relative text-slate-500 hover:text-slate-600 md:px-3 px-2 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] hover:bg-[radial-gradient(at_50%_75%,theme(colors.slate.200),theme(colors.slate.300),theme(colors.slate.400))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.25)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.25)_inset] border border-slate-500 hover:shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_8px_8px_-4px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.25)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.25)_inset] active:shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_8px_8px_-4px_rgba(0,0,0,0.0),0px_4px_8px_1px_rgba(0,0,0,0.25)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.25)_inset] active:bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] cursor-pointer  transition-all duration-300 overflow-hidden '>
                                <div className="absolute inset-0.5 top-[1px] h-1/2 rounded-t-[16px] rounded-b-[4px] bg-gradient-to-b from-white/70 to-white/20 group-active:from-white/50 z-10" />
                                <div className='size-6 flex items-center justify-center text-xs p-1'>
                                    <SplitHorizontal size={16} weight="bold" />
                                </div>
                            </div>
                          </div>
                        </div>

                        
                        {/* Image icon in top-left corner */}
                        <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                            <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                            <SplitHorizontal size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                        </div>
                        
                        {/* Dashed borders */}
                        <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                        <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                        <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                        <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                    </div>

                    <div className="relative w-full mt-8 rounded-3xl overflow-hidden border border-slate-100 md:block hidden">
                      <ModalGrid />
                    </div>

                </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className=""
            >
                
                <h2 className="text-base font-semibold text-slate-800 mb-2">New Website</h2>
                <div className='flex flex-col gap-2'>
                    <div className='text-base text-slate-600 leading-7'>I led a comprehensive redesign of our website and social media presence. Managing a team of freelance developers and designers, we crafted a fresh look with branded graphics and collateral. This effort resulted in a substantial increase in website traffic, reaching a significantly larger audience.</div>
                    <div className='isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200'>
                      <div className='w-full h-full aspect-4/3 bg-white bg-[url("/images/projects/Dashworks/Dashworks-Website-1.png")] bg-cover bg-center'></div>
                      <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                        <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                        <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                      </div>
                      <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                      <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                      <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                      <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                    </div>
                    <div className='isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200'>
                      <div className='w-full h-full aspect-4/3 bg-white bg-[url("/images/projects/Dashworks/Dashworks-Website-2.png")] bg-cover bg-center'></div>
                      <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                        <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                        <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                      </div>
                      <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                      <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                      <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                      <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                    </div>
                    <div className='isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200'>
                      <div className='w-full h-full aspect-4/3 bg-white bg-[url("/images/projects/Dashworks/Dashworks-Website-3.png")] bg-cover bg-center'></div>
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className=""
            >
                
                <h2 className="text-base font-semibold text-slate-800 mb-2">Onboarding</h2>
                <div className='flex flex-col gap-2'>
                    <div className='text-base text-slate-600 leading-7'>Redesigning onboarding to minimize setup time and help teams quickly grasp and benefit from the product.</div>
                    <div className='isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200'>
                      <div className='w-full h-full aspect-4/3 bg-white bg-[url("/images/projects/Dashworks/Dashworks-Onboarding-1.png")] bg-cover bg-center'></div>
                      <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                        <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                        <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                      </div>
                      <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                      <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                      <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                      <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                    </div>
                    <div className='isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200'>
                      <div className='w-full h-full aspect-4/3 bg-white bg-[url("/images/projects/Dashworks/Dashworks-Onboarding-2.png")] bg-cover bg-center'></div>
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