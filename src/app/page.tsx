"use client";

import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Envelope, LinkedinLogo, XLogo, ArrowSquareOut, Clipboard, At } from '@phosphor-icons/react';
import React from 'react';
export default function Home() {
  return (
    <div className="min-h-screen flex justify-center">
      <main className="relative w-full max-w-[800px] py-6">

        <div className="relative flex flex-col gap-8 items-start border border-slate-200 p-8 pb-24 h-[94vh] overflow-y-auto scrollbar-hide rounded-4xl">
        {/* Hero section */}
          <motion.div 
          className="w-full border-b space-y-1 border-slate-200 pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-[24px] font-bold text-slate-800">
            Shreyas Patil
          </h1>
          <p className="text-[16px] text-slate-600 font-medium">
            Product Designer
          </p>
          
          </motion.div>

          <div className="grid grid-cols-7 auto-rows-auto gap-6 w-full">
            
            {/* quick Projects links */}
            <div className="flex flex-col col-span-5 h-32 bg-slate-50 rounded-3xl px-6 p-4 items-center justify-center gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
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
            </div>
            
            {/* Reach out */}
            <div className="flex flex-col col-span-2 h-32 bg-slate-50 rounded-3xl px-6 p-4 items-center justify-center gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
              <div className="w-full font-semibold text-slate-800 pb-2 border-b border-slate-200"> Reach out</div>
              <div className="w-full flex items-center justify-between gap-2">
                
                <div className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-slate-400 via-slate-600 to-slate-800 hover:from-slate-500 hover:via-slate-700 hover:to-slate-900 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-slate-700 cursor-pointer transition-all duration-300'>                  
                  <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                  <XLogo size={18} weight="fill" />
                </div>

                <button className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-red-400 via-red-600 to-red-800 hover:from-red-500 hover:via-red-700 hover:to-red-900 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-red-700 cursor-pointer transition-all duration-300'>                  
                  <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10 pointer-events-none`}></div>
                    {(() => {
                      const [copied, setCopied] = React.useState(false);
                      
                      React.useEffect(() => {
                        if (copied) {
                          const timer = setTimeout(() => {
                            setCopied(false);
                          }, 2000);
                          return () => clearTimeout(timer);
                        }
                      }, [copied]);

                      return (
                        <>
                          <div 
                            onClick={() => {
                              navigator.clipboard.writeText('shreyaspatil.design@gmail.com');
                              setCopied(true);
                            }}
                            className="w-full h-full flex items-center justify-center"
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {copied ? (
                                <motion.span
                                  key="copied"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  transition={{ duration: 0.1 }}
                                >
                                  <Clipboard size={16} weight="fill" />
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="at"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <At size={18} weight="fill" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </>
                      );
                    })()}
                </button>

                <div className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 hover:from-blue-400 hover:via-blue-600 hover:to-blue-800 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-blue-700 cursor-pointer transition-all duration-300'>                  
                  <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                  <LinkedinLogo size={18} weight="fill" />
                </div>
                  

                  
                
              </div>
            </div>

            

            {/* Based out of Bay Area */}
            {(() => {
              const [currentTime, setCurrentTime] = React.useState(() => {
                // Initialize with PST time
                return new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
              });
              
              React.useEffect(() => {
                const timer = setInterval(() => {
                  // Update with PST time every 10 seconds
                  setCurrentTime(new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"})));
                }, 10000); // Update every 10 seconds
                
                return () => clearInterval(timer);
              }, []);
              
              // Determine background image based on time of day
              const hour = currentTime.getHours();
              
              let backgroundImage = 'bay-area-day.png';
              
              if (hour >= 5 && hour < 8) {
                // Early morning (sunrise)
                backgroundImage = 'bay-area-sunset.png';
              } else if (hour >= 8 && hour < 17) {
                // Daytime
                backgroundImage = 'bay-area-day.png';
              } else if (hour >= 17 && hour < 20) {
                // Evening (sunset)
                backgroundImage = 'bay-area-sunset.png';
              } else {
                // Night
                backgroundImage = 'bay-area-night.png';
              }
              
              const dayOfWeek = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
              const month = currentTime.toLocaleDateString('en-US', { month: 'long' });
              const day = currentTime.getDate();
              const daySuffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor(day / 10) === 1) ? 0 : day % 10];
              const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              
              return (
                <div style={{backgroundImage: `url(/images/projects/${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center'}} className="relative flex flex-col col-span-3 h-[276px] bg-slate-50 rounded-3xl p-4 items-center justify-center gap-6 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset] overflow-hidden">
                  
                  <div className={`absolute flex inset-[2px] h-1/3 items-center justify-center bg-gradient-to-b from-white/80  to-white/10 rounded-t-[22px] rounded-b-[12px] z-20 rounded-3xl`}></div>
                  
                  <div className={`absolute flex inset-0 bg-black/20 backdrop-blur-[2px] items-center justify-center z-0 rounded-3xl`}></div>
                    
                    <div className="relative w-full space-y-1">
                      <div className="relative w-full font-medium text-base font-mono text-white"> Based out of</div>
                      <div className="relative w-full font-semibold text-3xl font-mono text-white"> Bay Area, CA</div>
                    </div>

                    <div className="relative w-full space-y-1">
                      <div className="relative w-full font-medium text-base font-mono text-white">
                        {dayOfWeek}, {month} {day}{daySuffix}
                      </div>
                      <div className="relative w-full font-semibold text-3xl font-mono text-white">
                        {formattedTime}
                      </div>
                    </div>
                  
                </div>
              );
            })()}

            {/* Experience */}
            <div className="flex flex-col col-span-4 h-[276px] bg-slate-50 rounded-3xl p-6 items-start justify-top gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
              <div className="w-full font-semibold text-slate-800 pb-2 border-b border-slate-200"> 
                Journey
              </div>

              <div className="w-full flex flex-col">
                <div className="w-full flex items-center justify-between gap-2">
                  <div className="font-semibold text-slate-800">Rochester Institute of Technology</div>
                  <div className="text-sm font-light text-slate-600">Dec 2024</div>
                </div>

                <div className="text-sm font-light text-slate-600">MS - Human Computer Interaction</div>
              </div>

              <div className="w-full flex flex-col">
                <div className="w-full flex items-center justify-between gap-2">
                  <div className="font-semibold text-slate-800">Dashworks</div>
                  <div className="text-sm font-light text-slate-600">Jan - Apr 2024</div>
                </div>

                <div className="text-sm font-light text-slate-600">Product Design Intern</div>
              </div>

              <div className="w-full relative bg-slate-100 border border-dashed border-slate-300 rounded-lg p-2 flex flex-col">
                
                <div className="text-xs leading-5 font-light text-slate-600">Before design, I worked on AI research, building auto-encoders to turn 2D images into 3D models and exploring generative AI.</div>
              </div>

              
            </div>

            {/* infinite scroll */}
            <div className="flex flex-col col-span-7 h-[276px] bg-slate-50 rounded-3xl py-6 items-start justify-top gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
              {/* <div className="w-full font-semibold text-slate-800 pb-2 border-b border-slate-200"> 
                Making it feel right
              </div> */}

              <div className="relative w-full h-full overflow-hidden">

                <div className="absolute backdrop-blur-sm left-0 bg-gradient-to-l from-slate-50/0 via-slate-50/50 to-slate-50/100 w-8 h-full"></div>
                <div className="absolute backdrop-blur-sm right-0 bg-gradient-to-r from-slate-50/0 via-slate-50/50 to-slate-50/100 w-8 h-full"></div>
                <div className="w-full h-full flex gap-6 overflow-x-auto scrollbar-hide snap-x scroll-pl-12 px-8 py-2">
                    
                    <div  className="relative h-full aspect-16/9 bg-white border-4 border-slate-200 rounded-2xl snap-start  shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_-2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_0px_8px_2px_rgba(0,0,0,0.07)_inset]">
                        <div className={`absolute flex inset-[2px] h-1/3 items-center justify-center bg-gradient-to-b from-white/80  to-white/10 rounded-t-[12px] rounded-b-[12px] z-20`}></div>
                        <video src="/images/Craft/pplx-mindlab-1.mp4" autoPlay muted loop className="absolute inset-0 w-full h-full object-cover rounded-xl"></video>                    
                    </div>
                    <div style={{backgroundImage: `url(/images/Craft/Glass-Dock.mp4)`, backgroundSize: 'cover', backgroundPosition: 'center'}} className="relative h-full aspect-16/9 bg-white border-4 border-slate-200 rounded-2xl snap-start shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_-2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_0px_8px_2px_rgba(0,0,0,0.07)_inset]">
                        <div className={`absolute flex inset-[2px] h-1/3 items-center justify-center bg-gradient-to-b from-white/80  to-white/10 rounded-t-[12px] rounded-b-[12px] z-20`}></div>
                        <video src="/images/Craft/Glass-Dock.mp4" autoPlay muted loop className="absolute inset-0 w-full h-full object-cover rounded-xl"></video>                    
                    </div>
                    <div style={{backgroundImage: `url(/images/Craft/Whop-Modal.mp4)`, backgroundSize: 'cover', backgroundPosition: 'center'}} className="relative h-full aspect-square bg-white border-4 border-slate-200 rounded-2xl snap-start shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_-2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_0px_8px_2px_rgba(0,0,0,0.07)_inset]">
                        <div className={`absolute flex inset-[2px] h-1/3 items-center justify-center bg-gradient-to-b from-white/80  to-white/10 rounded-t-[12px] rounded-b-[12px] z-20`}></div>
                        <video src="/images/Craft/Whop-Modal.mp4" autoPlay muted loop className="absolute inset-0 w-full h-full object-cover rounded-xl"></video>                    
                    </div>
                    <div style={{backgroundImage: `url(/images/Craft/Modals.mp4)`, backgroundSize: 'cover', backgroundPosition: 'center'}} className="relative h-full aspect-16/9 bg-white border-4 border-slate-200 rounded-2xl snap-start  shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_-2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_0px_8px_2px_rgba(0,0,0,0.07)_inset]">
                        <div className={`absolute flex inset-[2px] h-1/3 items-center justify-center bg-gradient-to-b from-white/80  to-white/10 rounded-t-[12px] rounded-b-[12px] z-20`}></div>
                        <video src="/images/Craft/Modals.mp4" autoPlay muted loop className="absolute inset-0 w-full h-full object-cover rounded-xl"></video>                    
                    </div>
                    <div style={{backgroundImage: `url(/images/projects/ItinerAI-1.png)`, backgroundSize: 'cover', backgroundPosition: 'center'}} className="relative h-full aspect-3/2 bg-white border-4 border-slate-200 rounded-2xl snap-start shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_-2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_0px_8px_2px_rgba(0,0,0,0.07)_inset]">
                        <div className={`absolute flex inset-[2px] h-1/3 items-center justify-center bg-gradient-to-b from-white/80  to-white/10 rounded-t-[12px] rounded-b-[12px] z-20`}></div>                    
                        <video src="/images/Craft/ItinerAI-1.mp4" autoPlay muted loop className="absolute inset-0 w-full h-full object-cover rounded-xl"></video>                    
                    </div>
                  
                  
                </div>
                
                

              </div>

              
              
            </div>

            

          </div>


            
        </div>
        
        
        <div className="fixed flex items-center justify-center left-0 right-0 bottom-10 z-10">
          <Navbar />
        </div>
      </main>
    </div>
  );
}
