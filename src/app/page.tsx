"use client";

import { motion } from 'framer-motion';
import { ArrowSquareOut, XLogo, LinkedinLogo } from '@phosphor-icons/react';
import React, { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import EmailCopyButton from '@/components/EmailCopyButton';
import router from 'next/router';
import ModalGrid from '@/components/ModalGrid';

function BayAreaTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const options = {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    
    hour12: true,
  };

  const timeString = new Intl.DateTimeFormat('en-US', options).format(currentTime);

  return <div className='w-full flex justify-end text-slate-100 font-mono font-medium'>{timeString}</div>;
}

const gridVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.4
    }
  }
};

export default function Home() {


  return (
    <div className="min-h-screen flex justify-center">
      <main className="relative w-full md:max-w-[800px] max-w-[361px]">

        <div className="relative flex flex-col gap-6 items-start border-x border-slate-200 md:p-8 p-4 md:pb-24 pb-24 h-[100vh] overflow-y-auto scrollbar-hide">
        {/* Hero section */}
          {/* Page header */}
         <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="isolate relative min-h-[276px] flex w-full bg-slate-800 border-3 border-slate-800 rounded-3xl items-center gap-4 overflow-hidden shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_2px_0px_0px_rgba(0,0,0,0.15),0px_1px_1px_0px_rgba(255,255,255,0.07)_inset]"
        
        >

          <div className="absolute inset-x-[2px] top-0.5 h-1/3 bg-gradient-to-b from-slate-50/20 to-slate-50/0 rounded-t-[21px] rounded-b-[6px] z-10 pointer-events-none"></div>
          <div className="absolute inset-x-[2px] bottom-0.5 h-1/4 bg-gradient-to-t from-slate-50/10 to-slate-50/0 rounded-t-[6px] rounded-b-[21px] z-10 pointer-events-none"></div>
          <div className="items-center w-full h-full grid grid-cols-5">

            {/* Left side */}
            <div className='flex flex-col h-full items-start justify-between gap-0.5 p-6 col-span-2'>
              {/* top */}
              <div className='flex flex-col gap-0'>
                <h1 className="text-[24px] font-bold text-slate-50 w-full ">
                  Shreyas Patil
                </h1>

                <p className="text-[16px] text-slate-300 font-medium">
                  Product Designer
                </p>
              </div>

              {/* bottom */}
              <div className='flex flex-col gap-3 items-start'>

                <div className='relative isolate flex items-center justify-center gap-2'>

                  <div className='absolute isolate left-0 flex items-center justify-center size-2 bg-radial-[at_50%_75%] from-green-500 via-green-600 to-green-700 rounded-full -z-10 animate-[ping_3s_ease-in-out_infinite]'></div>

                  <div className='relative isolate flex items-center justify-center size-2 bg-radial-[at_50%_75%] from-green-500 via-green-600 to-green-700 rounded-full'>
                    <div className='absolute inset-[1px] top-[0.5px] h-1/2 bg-gradient-to-b from-white/70 to-white/20 rounded-t-[24px] rounded-b-[6px]'></div>
                  </div>
                  <p className="text-base text-slate-300 font-medium">
                    Looking for new opportunities!
                  </p>

                </div>

                <div className="flex items-center justify-center gap-3">
        
                  <a 
                    href="https://x.com/ShreyasPatil_" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-slate-400 via-slate-600 to-slate-800 hover:from-slate-500 hover:via-slate-700 hover:to-slate-900 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset]  cursor-pointer transition-all duration-300'
                  >                  
                    <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                    <XLogo size={18} weight="fill" />
                  </a>

        

                  <button className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-red-400 via-red-600 to-red-800 hover:from-red-500 hover:via-red-700 hover:to-red-900 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] cursor-pointer transition-all duration-300'>                  
                    <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10 pointer-events-none`}></div>
                    <EmailCopyButton />
                  </button>

                  <a 
                    href="https://www.linkedin.com/in/shreyastpatil/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 hover:from-blue-400 hover:via-blue-600 hover:to-blue-800 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] cursor-pointer transition-all duration-300'
                   >                  
                    <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                    <LinkedinLogo size={18} weight="fill" />
                  </a>
                </div>

              </div>

            </div>

            {/* Right side */}
            <div className='isolate relative w-full h-full col-span-3 justify-between'>
              <div className='relative w-full h-full p-6 flex flex-col justify-between z-10'>
                <BayAreaTimeDisplay />
                <div className='w-full flex justify-end text-slate-200 font-mono font-medium'>Bay Area, CA</div>
              </div>
              <div className="absolute inset-0  w-full h-full bg-[url('/images/About/About-1.jpeg')] bg-cover bg-[50%_60%] [mask-image:radial-gradient(50%_400%_at_0%_50%,transparent_10%,rgba(0,0,0,0.7)_100%)] [mask-type:alpha]"></div>
            </div>
          </div>
          
         </motion.div>

          {/* Main section */}
          <motion.div className="grid md:grid-cols-6 grid-cols-1 auto-rows-auto pb-1.5 pt-2 md:gap-x-6 md:gap-y-12 gap-y-6 w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible">

            

            
            {/* What I Do Best section */}
            <motion.div className="isolate flex flex-col md:col-span-6 col-span-1 gap-6 bg-slate-50 rounded-3xl md:p-6 p-4 items-center justify-top border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"
              variants={gridVariants}>
                
              {/* Prototyping section */}
              <div className='flex flex-col w-full gap-2 items-start'>

                <div className="w-full text-[24px] font-semibold text-slate-800 pb-2 border-b border-slate-200"> 
                  What I Do Best
                </div>

                <div className="w-full text-base font-semibold text-slate-600 mt-8"> 
                  Turning Ideas into Interactive Prototypes

                </div>
                <div className="text-sm leading-6 font-light text-slate-600">I quickly translate concepts into prototypes to test usability early and refine experiences.</div>
              </div>

              <div className="relative w-full h-fit  grid grid-cols-4 gap-4 gap-x-6">
                
                    <div className='col-span-4 h-fit  space-y-1 row-start-2 sticky top-0'>
                      <div className="w-full text-sm font-semibold text-slate-600"> ItinerAI</div>
                      <div className="text-sm leading-6 font-light text-slate-600">My capstone project, where I designed the full experience and built an interactive prototype using Play. Later, I developed an MVP in SwiftUI using Cursor to test feasibility.</div>
                    </div>
                    <div  className="relative w-full col-span-2 aspect-3/4 border border-slate-200  bg-white  rounded-2xl overflow-hidden">
                        
                        <div className="relative h-full w-full overflow-hidden">
                          <video src="/videos/Walk-Through-Video.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className="w-full h-full object-cover rounded-xl bg-white"></video>   
                        </div>                 
                    </div>
                    <div  className="relative h-full col-span-2  aspect-3/4 border border-slate-200  bg-white  rounded-2xl overflow-hidden">
                        
                        <div className="relative h-full w-full overflow-hidden">
                          <video src="/videos/ItinerAIbuild-1.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className="w-full h-full object-cover rounded-xl bg-white"></video>                    
                        </div>
                    </div>   
                
              </div>

              <div className="relative w-full h-fit  grid grid-cols-4 gap-4 gap-x-6">
                
                    <div className='col-span-4 h-fit flex flex-col gap-2 sticky top-0'>
                      <div className="w-full text-sm font-semibold text-slate-600"> Mindlab</div>
                      <div className="text-sm leading-6 font-light text-slate-600">A way to train your thinking muscle with Perplexity.
                        Perplexity makes knowledge accessible, but it&apos;s easy to offload thinking to LLMs. I challenged this by building Mindlab using V0, a prototype that guides thinking instead of spoon-feeding answers, helping users arrive at insights without losing context.</div>
                     </div>
                     <div  className="relative h-full aspect-16/9 col-span-4 row-start-1 border border-slate-200  bg-white  rounded-2xl overflow-hidden">
                     <video src="/images/Craft/pplx-mindlab-1.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className="relative w-full h-full object-cover rounded-xl bg-white"></video>                    
                    </div>

                      
                
              </div>


              {/* Design System section */}
              <div className='flex flex-col gap-2 mt-8'>
                  <div className="w-full text-base font-semibold text-slate-600"> 
                    Building Scalable Design Systems
                  </div>
                  <div className="text-sm leading-6 font-light text-slate-600">At Dashworks, I built a design system that balances flexibility and usability for various workflows. To demonstrate my ability to bring designs to life with precision, I developed select modals using Tailwind below.</div>
              </div>

              <div className="relative w-full  rounded-2xl overflow-hidden border border-slate-200">
                <ModalGrid />
              </div>

            </motion.div>

            
            


            {/* Projects section */}
            <motion.div className="flex flex-col md:col-span-3 col-span-1 row-span-2 bg-slate-50 rounded-3xl md:p-6 p-4 items-center justify-top gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"
              variants={gridVariants}>
              <div className="w-full font-semibold text-slate-800 pb-2 border-b border-slate-200">Projects</div>
              <div className='flex flex-col w-full h-max max-h-[448px] overflow-y-auto scrollbar-hide gap-4 rounded-md'>
                  
                  <div className='flex flex-col-reverse gap-2 bg-white p-1 pb-2 rounded-lg border border-slate-200 '>
                    <div className='relative w-full flex items-center justify-between p-2 px-2.5 gap-3 h-8 text-slate-500'>
                 
                    <div className='font-medium'>ItinerAI</div>

                    <button
                      onClick={() => router.push('/projects')}
                      
                      className="group relative rounded-full p-1 text-slate-500 border border-slate-400 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-blue-50 cursor-pointer hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.700))] active:scale-95 hover:shadow-[0px_2px_2px_-1px_rgba(28,57,142,0.25),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:border-blue-700 transition-all duration-300"
                      aria-label="Open Project"
                    >
                      <div className="absolute bg-gradient-to-b from-white/90 to-white/5 rounded-b-[4px] rounded-t-[12px] group-hover:from-slate-100/70 group-hover:to-slate-100/20 inset-x-[2px] top-0.5 h-1/2 transition-all duration-300"></div>
                      <ArrowSquareOut size={14} weight="fill" />
                    </button>
                    
                      
                    </div>
                    <div className='w-full h-full bg-slate-200 bg-[url("/images/projects/thumbnails/ItinerAI-Thumbnail.png")] bg-cover bg-center aspect-4/3 rounded-md [mask-image:radial-gradient(120%_70%_at_50%_37%,black_60%,rgba(0,0,0,0.4)_80%,transparent_90%)] [mask-type:alpha]'></div>
                  </div>

                  <div className='flex flex-col-reverse gap-2 bg-white p-1 rounded-lg border border-slate-200'>
                    <div className='relative w-full flex items-center justify-between p-2 px-2.5 gap-3 h-8 text-slate-500 '>
                 
                    <div className='font-medium'>Dashworks</div>

                    <button
                      onClick={() => router.push('/projects')}
                      
                      className="group relative rounded-full p-1 text-slate-500 border border-slate-400 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-blue-50 cursor-pointer hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.700))] active:scale-95 hover:shadow-[0px_2px_2px_-1px_rgba(28,57,142,0.25),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:border-blue-700 transition-all duration-300"
                      aria-label="Open Project"
                    >
                      <div className="absolute bg-gradient-to-b from-white/90 to-white/5 rounded-b-[4px] rounded-t-[12px] group-hover:from-slate-100/70 group-hover:to-slate-100/20 inset-x-[2px] top-0.5 h-1/2 transition-all duration-300"></div>
                      <ArrowSquareOut size={14} weight="fill" />
                    </button>
                    
                      
                    </div>
                    <div className='w-full h-full bg-slate-200 bg-[url("/images/projects/thumbnails/Dashworks-Thumbnail.webp")] bg-cover bg-center aspect-4/3 rounded-md [mask-image:radial-gradient(120%_70%_at_50%_37%,black_60%,rgba(0,0,0,0.4)_80%,transparent_90%)] [mask-type:alpha]'></div>
                  </div>

                  <div className='flex flex-col-reverse gap-2 bg-white p-1 rounded-lg border border-slate-200'>
                    <div className='relative w-full flex items-center justify-between p-2 px-2.5 gap-3 h-8 text-slate-500 '>
                 
                    <div className='font-medium'>WeatherWise</div>

                    <button
                      onClick={() => router.push('/projects')}
                      
                      className="group relative rounded-full p-1 text-slate-500 border border-slate-400 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-blue-50 cursor-pointer hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.700))] active:scale-95 hover:shadow-[0px_2px_2px_-1px_rgba(28,57,142,0.25),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:border-blue-700 transition-all duration-300"
                      aria-label="Open Project"
                    >
                      <div className="absolute bg-gradient-to-b from-white/90 to-white/5 rounded-b-[4px] rounded-t-[12px] group-hover:from-slate-100/70 group-hover:to-slate-100/20 inset-x-[2px] top-0.5 h-1/2 transition-all duration-300"></div>
                      <ArrowSquareOut size={14} weight="fill" />
                    </button>
                    
                      
                    </div>
                    <div className='w-full h-full bg-slate-200 bg-[url("/images/projects/thumbnails/WeatherWise-Thumbnail.webp")] bg-cover bg-center aspect-4/3 rounded-md [mask-image:radial-gradient(120%_70%_at_50%_37%,black_60%,rgba(0,0,0,0.7)_70%,transparent_90%)] [mask-type:alpha]'></div>
                  </div>

                  

                  

                 

                  
                  
                </div>
            </motion.div>
            



            <motion.div className="flex flex-col md:col-span-3 md:row-span-2 col-span-1 bg-slate-50 rounded-3xl md:p-6 p-4 items-start justify-top gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"
              variants={gridVariants}>
              <div className="w-full font-semibold text-slate-800 pb-2 border-b border-slate-200"> 
                Journey
              </div>
              
              <div className='w-full h-full flex gap-4'>
                <div className='h-full border-r border-slate-200'></div>
                <div className='w-full flex flex-col gap-6'>

                  <div className="w-full relative bg-radial-[at_50%_75%] from-emerald-50 via-emerald-50 to-emerald-100 border border-emerald-200 rounded-md p-2 flex flex-col shadow-[0px_2px_2px_-1px_rgba(0,96,69,0.25),0px_4px_8px_1px_rgba(0,96,69,0.12)_inset,0px_-2px_2px_0px_rgba(0,96,69,0.12)_inset]">
                    <div className="absolute inset-0.5 h-1/2 bg-gradient-to-b from-emerald-50/50 via-white/20 to-white/30 rounded"></div>
                    <div className="text-sm font-semibold text-emerald-900">Moved to Bay Area</div>
                    <div className="text-sm leading-6 font-medium text-emerald-800">Looking for new opportunities in Product Design!</div>
                    
                    <div className='absolute size-[9px] bg-radial-[at_50%_75%] from-emerald-300 via-emerald-500 to-emerald-700 rounded-full -left-[22px] top-1/2 -translate-y-1/2 shadow-[0px_2px_2px_-1px_rgba(0,96,69,0.25),0px_4px_8px_1px_rgba(0,96,69,0.12)_inset,0px_-2px_2px_0px_rgba(0,96,69,0.12)_inset]'>
                      <div className='absolute size-[7px] left-1/2 -translate-x-1/2 top-[1px] bg-gradient-to-b from-emerald-300/50 via-white/20 to-white/0 to-70% rounded-full'></div>
                    </div>
                    
                  </div>


                  <div className="relative w-full flex flex-col px-2">
                    <div className="w-full flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-800">Graduated from RIT</div>
                      {/* <div className="text-sm font-light text-slate-600">Dec 2024</div> */}
                    </div>
                    <div className='absolute size-[9px] bg-radial-[at_50%_75%] from-emerald-300 via-emerald-500 to-emerald-700 rounded-full -left-[21px] top-2 shadow-[0px_2px_2px_-1px_rgba(0,96,69,0.25),0px_4px_8px_1px_rgba(0,96,69,0.12)_inset,0px_-2px_2px_0px_rgba(0,96,69,0.12)_inset]'>
                      <div className='absolute size-[7px] left-1/2 -translate-x-1/2 top-[1px] bg-gradient-to-b from-emerald-300/50 via-white/20 to-white/0 to-70% rounded-full'></div>
                    </div>

                    <div className="text-sm font-light text-slate-600">MS - Human Computer Interaction</div>
                    
                  </div>

                  <div className="relative w-full flex flex-col px-2">
                    <div className="w-full flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-800">Interned at Dashworks</div>
                      {/* <div className="text-sm font-light text-slate-600">Jan - Apr 2024</div> */}
                    </div>
                    <div className='absolute size-[9px] bg-radial-[at_50%_75%] from-emerald-300 via-emerald-500 to-emerald-700 rounded-full -left-[21px] top-2 shadow-[0px_2px_2px_-1px_rgba(0,96,69,0.25),0px_4px_8px_1px_rgba(0,96,69,0.12)_inset,0px_-2px_2px_0px_rgba(0,96,69,0.12)_inset]'>
                      <div className='absolute size-[7px] left-1/2 -translate-x-1/2 top-[1px] bg-gradient-to-b from-emerald-300/50 via-white/20 to-white/0 to-70% rounded-full'></div>
                    </div>
                    <div className="text-sm font-light text-slate-600">Product Design Intern</div>
                  </div>

                  <div className="relative w-full flex flex-col px-2">
                    <div className="w-full flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-800">Moved to USA</div>
                      {/* <div className="text-sm font-light text-slate-600">Jan - Apr 2024</div> */}
                    </div>
                    <div className='absolute size-[9px] bg-radial-[at_50%_75%] from-emerald-300 via-emerald-500 to-emerald-700 rounded-full -left-[21px] top-2 shadow-[0px_2px_2px_-1px_rgba(0,96,69,0.25),0px_4px_8px_1px_rgba(0,96,69,0.12)_inset,0px_-2px_2px_0px_rgba(0,96,69,0.12)_inset]'>
                      <div className='absolute size-[7px] left-1/2 -translate-x-1/2 top-[1px] bg-gradient-to-b from-emerald-300/50 via-white/20 to-white/0 to-70% rounded-full'></div>
                    </div>

                    <div className="text-sm font-light text-slate-600">Started my Masters</div>
                  </div>

                  <div className="relative w-full flex flex-col px-2">
                    <div className="w-full flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-800">Graduated</div>
                      {/* <div className="text-sm font-light text-slate-600">Jan - Apr 2024</div> */}
                    </div>
                    <div className='absolute size-[9px] bg-radial-[at_50%_75%] from-emerald-300 via-emerald-500 to-emerald-700 rounded-full -left-[21px] top-2 shadow-[0px_2px_2px_-1px_rgba(0,96,69,0.25),0px_4px_8px_1px_rgba(0,96,69,0.12)_inset,0px_-2px_2px_0px_rgba(0,96,69,0.12)_inset]'>
                      <div className='absolute size-[7px] left-1/2 -translate-x-1/2 top-[1px] bg-gradient-to-b from-emerald-300/50 via-white/20 to-white/0 to-70% rounded-full'></div>
                    </div>

                    <div className="text-sm font-light text-slate-600">Electronics Engineering | Minor in Machine Learning</div>
                  </div>

                  <div className="relative w-full flex flex-col px-2">
                    <div className="w-full flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-800">AI Research Intern</div>
                      {/* <div className="text-sm font-light text-slate-600">Jan - Apr 2024</div> */}
                    </div>
                    <div className='absolute size-[9px] bg-radial-[at_50%_75%] from-emerald-300 via-emerald-500 to-emerald-700 rounded-full -left-[21px] top-2 shadow-[0px_2px_2px_-1px_rgba(0,96,69,0.25),0px_4px_8px_1px_rgba(0,96,69,0.12)_inset,0px_-2px_2px_0px_rgba(0,96,69,0.12)_inset]'>
                      <div className='absolute size-[7px] left-1/2 -translate-x-1/2 top-[1px] bg-gradient-to-b from-emerald-300/50 via-white/20 to-white/0 to-70% rounded-full'></div>
                    </div>

                    <div className="text-sm font-light text-slate-600">building auto-encoders to turn 2D images into 3D models and exploring generative AI.</div>
                  </div>

                  {/* <div className="w-full relative bg-slate-100 border border-dashed border-slate-300 rounded-lg p-2 flex flex-col">
                    
                    <div className="text-xs leading-5 font-light text-slate-600">Before design, I worked on AI research, building auto-encoders to turn 2D images into 3D models and exploring generative AI.</div>
                  </div> */}

                </div>
              </div>

              
            </motion.div>


            {/* Based out of Bay Area
            <TimeDisplay /> */}



            

            
            

          </motion.div>

          

          <div className="w-full">
            <Footer />
          </div>


            
        </div>
        
        
        
        
        
        
      </main>
    </div>
  );
}
