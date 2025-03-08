"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { ArrowSquareOut } from '@phosphor-icons/react';
import React from 'react';
import Footer from '@/components/Footer';
import TimeDisplay from '@/components/TimeDisplay';

export default function Home() {


  return (
    <div className="min-h-screen flex justify-center">
      <main className="relative w-full md:max-w-[800px] max-w-[361px] py-6">

        <div className="relative flex flex-col gap-6 items-start border border-slate-200 md:p-8 p-4 md:pb-24 pb-24 h-[94vh] overflow-y-auto scrollbar-hide rounded-4xl">
        {/* Hero section */}
          <motion.div 
          className="w-full border-b flex gap-4 items-center border-slate-200 pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} >
            
            <div style={{backgroundImage: `url(/images/About/Profile.jpeg)`, backgroundSize: 'cover', backgroundPosition: 'center'}} className='relative size-14 bg-emerald-500 rounded-full border border-slate-400 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]'>
            <div className='absolute inset-0.5 h-1/2 bg-gradient-to-b from-white/80  to-white/10 rounded-t-[36px] rounded-b-[12px] z-20 rounded-3xl'></div>
            </div>

            <div className='flex flex-col gap-0'>
            <h1 className="text-[24px] font-bold text-slate-800">
            Shreyas Patil
            </h1>
            <p className="text-[16px] text-slate-600 font-medium">
            Product Designer
            </p>
            </div>
          
          </motion.div>

          <div className="grid md:grid-cols-7 grid-cols-1 auto-rows-auto md:gap-x-6 md:gap-y-6.5 gap-y-6 w-full">
            
            {/* quick Projects links */}
            {/* <div className="flex flex-col col-span-5 h-32 bg-slate-50 rounded-3xl px-6 p-4 items-center justify-center gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
              <div className="w-full font-semibold text-slate-800 pb-2 border-b border-slate-200"> See my work here</div>
              <div className="w-full flex items-center justify-between gap-2">
                <div className='flex gap-3'>
                  
                  <div className='relative flex items-center justify-center gap-1.5 h-8 px-4 text-slate-500 rounded-full bg-radial-[at_50%_75%] from-slate-100 via-slate-200 to-slate-300 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-slate-400 hover:bg-radial-[at_50%_75%] hover:from-slate-200 hover:via-slate-300 hover:to-slate-400 transition-all duration-300 cursor-pointer'>
                 
                  <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white/80  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                    <div className='text-sm font-regular'>ItinerAI</div>
                    <ArrowSquareOut size={16} weight="regular" />
                  </div>

                  <div className='relative flex items-center justify-center gap-1.5 h-8 px-4 text-slate-500 rounded-full bg-radial-[at_50%_75%] from-slate-100 via-slate-200 to-slate-300 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-slate-400 hover:bg-radial-[at_50%_75%] hover:from-slate-200 hover:via-slate-300 hover:to-slate-400 transition-all duration-300 cursor-pointer'>
                 
                  <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white/80  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                    <div className='text-sm font-regular'>Dashworks</div>
                    <ArrowSquareOut size={16} weight="regular" />

                  </div>

                  <div className='relative flex items-center justify-center gap-1.5 h-8 px-4 text-slate-500 rounded-full bg-radial-[at_50%_75%] from-slate-100 via-slate-200 to-slate-300 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-slate-400 hover:bg-radial-[at_50%_75%] hover:from-slate-200 hover:via-slate-300 hover:to-slate-400 transition-all duration-300 cursor-pointer'>
                 
                  <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white/80  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                    <div className='text-sm font-regular'>WeatherWise</div>
                    <ArrowSquareOut size={16} weight="regular" />
                  </div>
                  
                </div>
              </div>
            </div> */}

            <div className="flex flex-col md:col-span-3 col-span-1 bg-slate-50 rounded-3xl md:p-6 p-4 items-center justify-center gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
              <div className="w-full font-semibold text-slate-800 pb-2 border-b border-slate-200"> See my work here</div>
              <div className='flex flex-col w-full gap-2'>
                  
                  <div className='relative w-full flex items-center justify-between p-2 px-2.5 gap-3 h-8 text-slate-500 rounded-md bg-slate-100/0 hover:bg-slate-200/50  transition-all duration-300 cursor-pointer'>
                 
                    <div className='font-medium'>ItinerAI</div>
                    
                    <ArrowSquareOut size={16} weight="regular" />
                  </div>

                  <div className='relative w-full flex items-center justify-between p-2 px-3 gap-1.5 h-8 text-slate-500 rounded-md bg-slate-100/0 hover:bg-slate-200/50  transition-all duration-300 cursor-pointer'>
                 
                  
                    <div className='font-medium'>Dashworks</div>
                    <ArrowSquareOut size={16} weight="regular" />

                  </div>

                  <div className='relative w-full flex items-center justify-between p-2 px-3 gap-1.5 h-8 text-slate-500 rounded-md bg-slate-100/0 hover:bg-slate-200/50  transition-all duration-300 cursor-pointer'>
                 
                    <div className='font-medium'>WeatherWise</div>
                    <ArrowSquareOut size={16} weight="regular" />
                  </div>
                  
                </div>
            </div>
            

            {/* Experience
            <div className="flex flex-col col-span-4 h-[276px] bg-slate-50 rounded-3xl p-6 items-start justify-top gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
              <div className="w-full font-semibold text-slate-800 pb-2 border-b border-slate-200"> 
                Journey
              </div>

              <div className="w-full flex flex-col">
                <div className="w-full flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-800">Rochester Institute of Technology</div>
                  <div className="text-sm font-light text-slate-600">Dec 2024</div>
                </div>

                <div className="text-sm font-light text-slate-600">MS - Human Computer Interaction</div>
              </div>

              <div className="w-full flex flex-col">
                <div className="w-full flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-800">Dashworks</div>
                  <div className="text-sm font-light text-slate-600">Jan - Apr 2024</div>
                </div>

                <div className="text-sm font-light text-slate-600">Product Design Intern</div>
              </div>

              <div className="w-full relative bg-slate-100 border border-dashed border-slate-300 rounded-lg p-2 flex flex-col">
                
                <div className="text-xs leading-5 font-light text-slate-600">Before design, I worked on AI research, building auto-encoders to turn 2D images into 3D models and exploring generative AI.</div>
              </div>

              
            </div> */}

            <div className="flex flex-col md:col-span-4 md:row-span-2 col-span-1 bg-slate-50 rounded-3xl md:p-6 p-4 items-start justify-top gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
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

                    <div className="text-sm font-light text-slate-600">Electrical Engineering | Minor in Machine Learning</div>
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

              
            </div>


            {/* Based out of Bay Area */}
            <TimeDisplay />



            {/* infinite scroll */}
            <div className="isolate flex flex-col md:col-span-7 col-span-1 h-[276px] bg-slate-50 rounded-3xl md:py-6 py-4 items-start justify-top gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
              {/* <div className="w-full font-semibold text-slate-800 pb-2 border-b border-slate-200"> 
                Making it feel right
              </div> */}

              <div className="relative w-full h-full overflow-hidden">

                
                <div className="w-full h-full flex gap-6 overflow-x-auto scrollbar-hide snap-x scroll-pl-8 px-8 py-2">
                    
                    <div  className="relative h-full aspect-16/9 bg-white border-4 border-slate-200 rounded-2xl snap-start  shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_-2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_0px_8px_2px_rgba(0,0,0,0.07)_inset]">
                        <div className={`absolute flex inset-[2px] h-1/3 items-center justify-center bg-gradient-to-b from-white/80  to-white/10 rounded-t-[12px] rounded-b-[12px] z-20`}></div>
                        <video src="/images/Craft/pplx-mindlab-1.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className="absolute inset-0 w-full h-full object-cover rounded-xl"></video>                    
                    </div>
                    <div style={{backgroundImage: `url(/images/Craft/Glass-Dock.mp4)`, backgroundSize: 'cover', backgroundPosition: 'center'}} className="relative h-full aspect-16/9 bg-white border-4 border-slate-200 rounded-2xl snap-start shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_-2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_0px_8px_2px_rgba(0,0,0,0.07)_inset]">
                        <div className={`absolute flex inset-[2px] h-1/3 items-center justify-center bg-gradient-to-b from-white/80  to-white/10 rounded-t-[12px] rounded-b-[12px] z-20`}></div>
                        <video src="/images/Craft/Glass-Dock.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className="absolute inset-0 w-full h-full object-cover rounded-xl"></video>                    
                    </div>
                    <div style={{backgroundImage: `url(/images/Craft/Whop-Modal.mp4)`, backgroundSize: 'cover', backgroundPosition: 'center'}} className="relative h-full aspect-square bg-white border-4 border-slate-200 rounded-2xl snap-start shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_-2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_0px_8px_2px_rgba(0,0,0,0.07)_inset]">
                        <div className={`absolute flex inset-[2px] h-1/3 items-center justify-center bg-gradient-to-b from-white/80  to-white/10 rounded-t-[12px] rounded-b-[12px] z-20`}></div>
                        <video src="/images/Craft/Whop-Modal.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className="absolute inset-0 w-full h-full object-cover rounded-xl"></video>                    
                    </div>
                    <div style={{backgroundImage: `url(/images/Craft/Modals.mp4)`, backgroundSize: 'cover', backgroundPosition: 'center'}} className="relative h-full aspect-16/9 bg-white border-4 border-slate-200 rounded-2xl snap-start  shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_-2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_0px_8px_2px_rgba(0,0,0,0.07)_inset]">
                        <div className={`absolute flex inset-[2px] h-1/3 items-center justify-center bg-gradient-to-b from-white/80  to-white/10 rounded-t-[12px] rounded-b-[12px] z-20`}></div>
                        <video src="/images/Craft/Modals.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className="absolute inset-0 w-full h-full object-cover rounded-xl"></video>                    
                    </div>
                    <div style={{backgroundImage: `url(/images/projects/ItinerAI-1.png)`, backgroundSize: 'cover', backgroundPosition: 'center'}} className="relative h-full aspect-3/2 bg-white border-4 border-slate-200 rounded-2xl snap-start shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_-2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_0px_8px_2px_rgba(0,0,0,0.07)_inset]">
                        <div className={`absolute flex inset-[2px] h-1/3 items-center justify-center bg-gradient-to-b from-white/80  to-white/10 rounded-t-[12px] rounded-b-[12px] z-20`}></div>                    
                        <video src="/images/Craft/ItinerAI-1.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className="absolute inset-0 w-full h-full object-cover rounded-xl"></video>                    
                    </div>
                  
                  
                </div>
                
                

              </div>

              
              
            </div>

            
            

          </div>

          <div className="w-full">
            <Footer />
          </div>


            
        </div>
        
        
        <div className="fixed flex items-center justify-center mx-auto left-1/2 -translate-x-1/2 bottom-10 z-10">
          <Navbar />
        </div>
        
        
        
        
        
      </main>
    </div>
  );
}
