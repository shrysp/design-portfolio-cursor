"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, GithubLogo, Globe, SplitHorizontal } from '@phosphor-icons/react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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
      <main className="w-full max-w-[800px] flex flex-col gap-12 py-6">
        <div className="flex flex-col gap-8 items-start border border-slate-200 p-8 h-[94vh] overflow-y-auto scrollbar-hide rounded-4xl">
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
                      
                      className="group relative rounded-full p-1 text-slate-500 border border-slate-400 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-amber-900 cursor-pointer hover:bg-[radial-gradient(at_50%_75%,theme(colors.amber.300),theme(colors.amber.500),theme(colors.amber.400))] active:scale-95 hover:shadow-[0px_2px_2px_-1px_rgba(193,0,7,0.25),0px_4px_8px_1px_rgba(193,0,7,0.25)_inset,0px_-2px_2px_0px_rgba(193,0,7,0.25)_inset] hover:border-amber-700 transition-all duration-300"
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
          <div className="w-full flex flex-col gap-24">
            {/* Main image display */}
            <div className="w-full flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full aspect-[4/3] rounded-3xl overflow-hidden mb-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]"
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
              className="flex gap-2 mb-6 overflow-x-auto p-2"
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
                  <p className="text-slate-600 leading-relaxed">Product Designer Intern</p>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800 mb-1">Timeline</h2>
                  <p className="text-slate-600 leading-relaxed">Jan 2024 - Aug 2024</p>
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
                    <div className='aspect-4/3 rounded-3xl bg-slate-100 bg-[url("/images/projects/Dashworks/Audit.png")] bg-cover bg-center overflow-hidden mt-8'></div>
                    <div className='aspect-4/3 rounded-3xl bg-slate-100 bg-[url("/images/projects/Dashworks/How-Dashworks-works.png")] bg-cover bg-center overflow-hidden mt-8'></div>
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
                    <div className='aspect-4/3 rounded-3xl bg-slate-100 bg-[url("/images/projects/Dashworks/Dashworks-Design-System.png")] bg-cover bg-center overflow-hidden mt-8'></div>

                    
                    
                    {/* Image comparison slider - React implementation */}
                    <div 
                        className='relative rounded-3xl overflow-hidden mt-8 aspect-4/3' 
                        ref={containerRef}
                    >
                        {/* Light image (background) */}
                        <div className='absolute inset-0 rounded-3xl bg-slate-100 bg-[url("/images/projects/Dashworks/Light.png")] bg-cover bg-center'></div>
                        
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

                    <div className="relative mt-8 w-full bg-slate-100 rounded-3xl overflow-hidden">
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
                    <div className='aspect-4/3 rounded-3xl bg-slate-200 overflow-hidden mt-8'></div>
                    <div className='aspect-4/3 rounded-3xl bg-slate-200 overflow-hidden mt-8'></div>
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
                    <div className='aspect-4/3 rounded-3xl bg-slate-200 overflow-hidden mt-8'></div>
                    <div className='aspect-4/3 rounded-3xl bg-slate-200 overflow-hidden mt-8'></div>
                </div>
            </motion.div>

            {/* Process */}
            {project.process && Array.isArray(project.process) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
              >
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Process</h2>
                <div className="space-y-4">
                  {project.process.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-slate-700">
                          <span className="font-semibold">{step.split(':')[0]}</span>
                          {step.includes(':') ? ': ' + step.split(':').slice(1).join(':').trim() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.55 }}
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

            {/* Team */}
            {project.team && Array.isArray(project.team) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
              >
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.team.map((member, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-sm">
                        {member.split('(')[0].trim()[0]}
                      </div>
                      <p className="text-slate-700">{member}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Technologies */}
            {project.technologies && Array.isArray(project.technologies) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.65 }}
                className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
              >
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Links */}
            {(project.github || project.live) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 mt-6"
              >
                {project.github && (
                  <Button
                    className="group text-white font-semibold w-full md:w-[240px] h-[36px] bg-gradient-to-b from-slate-700 via-slate-500 to-slate-300 border border-slate-500 rounded-full shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_8px_8px_-4px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-slate-700 active:shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_8px_8px_-4px_rgba(0,0,0,0.0),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] transition-all duration-300 relative overflow-hidden active:bg-gradient-to-b active:from-slate-800 active:via-slate-600 active:to-slate-400 cursor-pointer flex items-center justify-center gap-2"
                    onClick={() => window.open(project.github, '_blank')}
                  >
                    <GithubLogo size={20} weight="fill" />
                    GitHub Repository
                    <div className="absolute inset-2 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 group-active:from-white/30" />
                  </Button>
                )}
                {project.live && (
                  <Button
                    className="group text-white font-semibold w-full md:w-[240px] h-[36px] bg-gradient-to-b from-blue-700 via-blue-500 to-blue-300 border border-blue-500 rounded-full shadow-[0px_2px_2px_-1px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.0),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.25),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:border-blue-700 active:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.0),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] transition-all duration-300 relative overflow-hidden active:bg-gradient-to-b active:from-blue-800 active:via-blue-600 active:to-blue-400 cursor-pointer flex items-center justify-center gap-2"
                    onClick={() => window.open(project.live, '_blank')}
                  >
                    <Globe size={20} weight="fill" />
                    Live Demo
                    <div className="absolute inset-2 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 group-active:from-white/30" />
                  </Button>
                )}
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <div className="fixed flex items-center justify-center mx-auto left-1/2 -translate-x-1/2 bottom-8 z-10">
            <Navbar />
          </div>
        </div>

        
      </main>
    </div>
  );
} 