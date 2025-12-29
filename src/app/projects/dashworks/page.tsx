"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SplitHorizontal } from '@phosphor-icons/react';
import Image from 'next/image';
import MediaCard from '@/components/MediaCard';
import ProjectHeader from '@/components/ProjectHeader';
// Import the project data
import { projectsData } from '@/data/projectsData';
import ModalGrid from '@/components/ModalGrid';

export default function DashworksProject() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Get the Dashworks project data
  const project = projectsData[2]; // Dashworks is now the third project in the array

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
    <div className="min-h-screen flex justify-center bg-stone-50">
      <main className="w-full max-w-[800px] flex flex-col gap-12">
        <div className="flex flex-col gap-12 items-start  md:pt-24 pt-8 md:px-0 p-4 md:pb-24 pb-24 ">
          {/* Back button and header */}
            <ProjectHeader title={project.title} />

          {/* Project content */}
          <div className="w-full flex flex-col gap-16">
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
                quality={90}
                sizes="(max-width: 768px) 100vw, 800px"
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
                    loading="lazy"
                    quality={75}
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
                  <h2 className="text-subheader mb-1">My Role</h2>
                  <p className="text-body">Product Design Intern</p>
                </div>
                <div>
                  <h2 className="text-subheader mb-1">Timeline</h2>
                  <p className="text-body">Jan 2024 - Apr 2024</p>
                </div>
                <div>
                  <h2 className="text-subheader mb-1 ">Team</h2>
                  <p className="text-body">Aahel Iyer </p>
                </div>
              </div>
            </motion.div>
            </div>

            

            {/* Project overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className=" flex flex-col gap-4"
            >
              <div className="flex flex-col gap-4">
                <h2 className="text-header text-gradient-primary">What is Dashworks?</h2>
                <p className="text-body">Dashworks is an AI-powered knowledge assistant that helps companies centralize their knowledge scattered across various apps. It provides accurate answers to employee questions by searching across the company&apos;s connected applications.</p>
                <p className="text-body">Dashworks integrates with over 50 apps, including Slack, Jira, Confluence, and Google Drive, to create a unified knowledge base.</p>
              </div>
            </motion.div>


            {/* Challenge and Solution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className=" flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                
                  <h3 className="text-header text-gradient-primary">Challenges</h3>
                  <ul className="text-body list-disc list-outside space-y-2 pl-4">
                    <li>
                      <span className="font-semibold">Speeding Up Product Development:</span> Improving processes and design velocity to improve the frequency and impact of product updates.
                    </li>
                    <li>
                      <span className="font-semibold">Simplifying Onboarding for Quick Value:</span> Redesigning onboarding to minimize setup time and help teams quickly grasp and benefit from the product.
                    </li>
                  </ul>
                
                
              </div>
            </motion.div>

            {/* Outcomes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className="flex flex-col gap-4"
            >
                
                <h2 className="text-header text-gradient-primary">Gaining technical knowledge to drive impactful design decisions</h2>
                <div className='text-body text-pretty'>Designing for complex enterprise tools requires a deep understanding of both the product and its technical foundation. During my internship at Dashworks, I conducted a comprehensive product audit, analyzing its entire ecosystem to identify areas for improvement. This process helped bridge the gap between design and engineering, ensuring that our solutions were both user-friendly and technically feasible.</div>
                <MediaCard 
                  mediaType='image'
                  src='/images/projects/Dashworks/Audit.png'
                  aspectClass='aspect-4/3'
                  className='my-4'
                  
                  rightIcon={<Image src="/logos/Create with Play Logo.png" alt="Create with Play Logo" width={20} height={20} className="object-contain" />}
                />
                <MediaCard 
                  mediaType='image'
                  src='/images/projects/Dashworks/How-Dashworks-works.png'
                  aspectClass='aspect-4/3'
                  className='my-4'
                />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className="flex flex-col gap-4"
            >
                
                <h2 className="text-header text-gradient-primary">Design System</h2>
                <div className='flex flex-col gap-4'>
                    <div className='text-body text-pretty'>Our team set a goal to deliver our product faster to meet customer demands and stand out in a competitive market. To reach this goal, we needed a design system for better quality and speed.</div>
                    <MediaCard 
                      mediaType='image'
                      src='/images/projects/Dashworks/Dashworks-Design-System.png'
                      aspectClass='aspect-4/3'
                      className='my-4'
                    />
  
                    {/* Image comparison slider - React implementation */}
                    <div 
                        className='isolate relative rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_4px_-0.5px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_32px_-2px_rgba(0,0,0,0.08)] bg-stone-100 my-4' 
                        ref={containerRef}
                    >

                        <div className='relative w-full h-full bg-white aspect-4/3'>
                          {/* Light image (background) */}
                          <div className='absolute inset-0 rounded-3xl overflow-hidden'>
                            <Image
                              src="/images/projects/Dashworks/Light.png"
                              alt="Light theme design system"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              priority
                              quality={90}
                            />
                          </div>
                        
                          {/* Dark image (overlay) */}
                          <div 
                            className='absolute inset-0 overflow-hidden rounded-3xl'
                            ref={overlayRef}
                            style={{
                                width: `${sliderPosition}%`
                            }}
                        >
                            <div 
                                className='absolute inset-0 overflow-hidden'
                                style={{
                                    width: `${100 / (sliderPosition / 100)}%`,
                                    height: '100%'
                                }}
                            >
                              <Image
                                src="/images/projects/Dashworks/Dark.png"
                                alt="Dark theme design system"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                                quality={90}
                              />
                            </div>
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
                        
                       
                    </div>

                    <div className="relative w-full my-4 rounded-2xl   md:block hidden">
                      <ModalGrid />
                    </div>

                </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className="flex flex-col gap-4"
            >
                
              <h2 className="text-header text-gradient-primary">New Website</h2>
              <div className='text-body'>I led a comprehensive redesign of our website and social media presence. Managing a team of freelance developers and designers, we crafted a fresh look with branded graphics and collateral. This effort resulted in a substantial increase in website traffic, reaching a significantly larger audience.</div>
              <MediaCard 
                mediaType='image'
                src='/images/projects/Dashworks/Dashworks-Website-1.png'
                aspectClass='aspect-4/3'
                className='my-4'
              />
              <MediaCard 
                mediaType='image'
                src='/images/projects/Dashworks/Dashworks-Website-2.png'
                aspectClass='aspect-4/3'
                className='my-4'
              />
              <MediaCard 
                mediaType='image'
                src='/images/projects/Dashworks/Dashworks-Website-3.png'
                aspectClass='aspect-4/3'
                className='my-4'
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className="flex flex-col gap-4"
            >
                
                <h2 className="text-header text-gradient-primary">Onboarding</h2>
                <div className='text-body text-pretty'>Redesigning onboarding to minimize setup time and help teams quickly grasp and benefit from the product.</div>
                <MediaCard 
                  mediaType='image'
                  src='/images/projects/Dashworks/Dashworks-Onboarding-1.png'
                  aspectClass='aspect-4/3'
                  className='my-4'
                />
                <MediaCard 
                  mediaType='image'
                  src='/images/projects/Dashworks/Dashworks-Onboarding-2.png'
                  aspectClass='aspect-4/3'
                  className='my-4'
                />
            </motion.div>

            
          </div>

        </div>

        
      </main>
    </div>
  );
} 