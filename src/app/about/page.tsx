"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { LinkedinLogo, XLogo, ReadCvLogo } from '@phosphor-icons/react';
import React from 'react';
import VerticalCarousel from '@/components/VerticalCarousel';
import Footer from '@/components/Footer';
import EmailCopyButton from '@/components/EmailCopyButton';

export default function Home() {
  // Define the images for the carousel
  const hobbyImages = [
    "/images/About/About-1.jpeg",
    "/images/About/About-2.jpeg",
    "/images/About/About-3.jpeg",
    "/images/About/About-4.jpeg",
    "/images/About/About-5.jpeg",
  ];

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-slate-50 to-white">
      <main className="w-full md:max-w-[800px] max-w-[361px] flex flex-col gap-12 py-6">

        <div className="flex flex-col gap-6 items-start border border-slate-200 md:p-8 p-4 md:pb-24 pb-24 h-[94vh] overflow-y-auto scrollbar-hide rounded-4xl ">
        {/* Hero section */}
          <motion.div 
          className="w-full border-b flex gap-4 items-center border-slate-200 pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div style={{backgroundImage: `url(/images/About/Profile.jpeg)`, backgroundSize: 'cover', backgroundPosition: 'center'}} className='relative size-8 bg-emerald-500 rounded-full border border-slate-400 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]'>
          <div className='absolute inset-0.5 h-1/2 bg-gradient-to-b from-white/80  to-white/10 rounded-t-[36px] rounded-b-[12px] z-20 rounded-3xl'></div>
          </div>
          <h1 className="text-[24px] font-bold text-slate-800">
            More about me
          </h1>
          </motion.div>

          <div className="grid md:grid-cols-7 grid-cols-1 auto-rows-auto md:gap-x-6 md:gap-y-6.5 gap-y-6 w-full">

            {/* Making it feel right */}
            <div className="flex flex-col md:col-span-4 col-span-1 bg-slate-50 rounded-3xl md:p-6 p-4 items-start justify-top gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
              <div className="w-full font-semibold text-slate-800 pb-2 border-b border-slate-200 font-mono"> 
                Making it feel right
              </div>

              <p className="text-xs leading-6 text-slate-600 font-mono">
              For me, design is all about the feeling it evokes. Every feature and interaction is crafted to spark joy, comfort, or excitement. I&apos;m passionate about creating standout experiences by deeply understanding users, making every touchpoint not just user-friendly, but truly engaging. I believe it&apos;s the little details, like the smoothness of an animation or the tactile response of a button, that make a product not just functional, but memorable. My philosophy combines emotion with usability, aiming to create products that resonate on a deeper level. Because for me, it&apos;s not just about meeting needs—it&apos;s about creating something people love.
              </p>
              
            </div>

            {/* things i like to do */}
            <div className="relative overflow-hidden flex flex-col md:col-span-3 col-span-1 md:h-full h-[400px] bg-slate-50 rounded-3xl md:px-6 px-4 items-center justify-top gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
              {/* <div className="relative w-full font-semibold text-slate-800 mt-6 pb-2 border-b border-slate-200 z-30"> Things I like to do</div> */}
              {/* <div className="absolute inset-0 bg-radial-[at_50%] from-transparent via-slate-50/10 to-slate-50/50 z-20"></div> */}
              <div className="absolute h-full w-full z-10 overflow-hidden border-4 border-slate-200 rounded-3xl">
                <VerticalCarousel images={hobbyImages} autoScrollInterval={5000} />
              </div>
            </div>

            
            {/* Reach out */}
            <div className="flex flex-col md:col-span-3 md:row-start-3 col-span-1 bg-slate-50 rounded-3xl md:px-6 px-4 p-4 items-center justify-top gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
              <div className="w-full font-semibold text-slate-800 pb-2 border-b border-slate-200"> Reach out</div>
              <div className="w-full flex flex-col items-center justify-between gap-5">
                
                <div className='flex w-full items-center justify-start gap-4 text-base font-semibold'>
                  <a 
                    href="https://x.com/ShreyasPatil_" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-slate-400 via-slate-600 to-slate-800 hover:from-slate-500 hover:via-slate-700 hover:to-slate-900 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-slate-700 cursor-pointer transition-all duration-300'
                  >                  
                    <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                    <XLogo size={18} weight="fill" />
                  </a>
                  <div className='flex flex-col'>
                    <div className='text-sm font-semibold text-slate-800'>Twitter</div>
                    <div className='text-xs font-light text-slate-600'>@ShreyasPatil_</div>
                  </div>
                </div>

                

                <div className='flex w-full items-center justify-start gap-4 text-base font-semibold'>
                <button className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-red-400 via-red-600 to-red-800 hover:from-red-500 hover:via-red-700 hover:to-red-900 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-red-700 cursor-pointer transition-all duration-300'>                  
                  <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10 pointer-events-none`}></div>
                  <EmailCopyButton />
                </button>
                  <div className='flex flex-col'>
                    <div className='text-sm font-semibold text-slate-800'>Email</div>
                    <div className='text-xs font-light text-slate-600'>shreyaspatil.design@gmail.com</div>
                  </div>
                </div>

                <div className='flex w-full items-center justify-start gap-4 text-base font-semibold'>
                <a 
                  href="https://www.linkedin.com/in/shreyastpatil/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 hover:from-blue-400 hover:via-blue-600 hover:to-blue-800 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-blue-700 cursor-pointer transition-all duration-300'
                >                  
                  <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                  <LinkedinLogo size={18} weight="fill" />
                </a>
                  <div className='flex flex-col'>
                    <div className='text-sm font-semibold text-slate-800'>LinkedIn</div>
                    <div className='text-xs font-light text-slate-600'>Shreyas Patil</div>
                  </div>
                </div>

                <div className='flex w-full items-center justify-start gap-4 text-base font-semibold'>
                <a 
                  href="/document/Shreyas-Patil-Resume-2025.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  download
                  className='relative flex items-center justify-center size-8 text-stone-500 rounded-full bg-radial-[at_50%_75%] from-stone-100 via-stone-200 to-stone-300 hover:from-stone-200 hover:via-stone-300 hover:to-stone-400 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-stone-400 cursor-pointer transition-all duration-300'
                >                  
                  <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white/70  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                  <ReadCvLogo size={18} weight="fill" />
                </a>
                  <div className='flex flex-col'>
                    <div className='text-sm font-semibold text-slate-800'>Resume</div>
                    <div className='text-xs font-light text-slate-600'>Download</div>
                  </div>
                </div>
                  
                
              </div>
            </div>

            {/* Reads */}
            <div className="flex flex-col md:col-span-3 md:row-start-2 col-span-1 bg-slate-50 rounded-3xl md:p-6 p-4 items-start justify-top gap-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
              <div className="w-full font-semibold text-slate-800 pb-2 border-b border-slate-200"> 
                Reads
              </div>

              <a 
                href="https://publish.obsidian.md/philippepage/Work/Agent+Clouds" 
                target="_blank" 
                rel="noopener noreferrer" 
                className='group relative flex flex-col gap-1 w-full p-2 bg-stone-50 rounded-lg hover:rounded-tr-2xl border border-stone-200 overflow-hidden transition-all duration-300 cursor-pointer'
              >
                <div className='absolute size-4 -top-4 -right-4 group-hover:-top-[1px] group-hover:-right-[1px] rounded-bl-lg rounded-tr-[26px] bg-stone-100 group-hover:bg-stone-50 border border-stone-200 shadow-sm transition-all duration-300'></div>
                
                  <div className="text-sm font-semibold text-slate-800 truncate pb-0.5 border-b border-stone-100">Agent Cloud</div>
                <div className="text-xs font-light text-slate-600 pb-0.5 border-b border-stone-100">@Philippe Page</div>
              </a>

              <a 
                href="https://rauno.me/craft/interaction-design" 
                target="_blank" 
                rel="noopener noreferrer" 
                className='group relative flex flex-col gap-1 w-full p-2 bg-stone-50 rounded-lg hover:rounded-tr-2xl border border-stone-200 overflow-hidden transition-all duration-300 cursor-pointer'
              >
                <div className='absolute size-4 -top-4 -right-4 group-hover:-top-[1px] group-hover:-right-[1px] rounded-bl-lg rounded-tr-[26px] bg-stone-100 group-hover:bg-stone-50 border border-stone-200 shadow-sm transition-all duration-300'></div>
                
                  <div className="text-sm font-semibold text-slate-800 truncate pb-0.5 border-b border-stone-100">Invisible Details of Interaction Design</div>
                <div className="text-xs font-light text-slate-600 pb-0.5 border-b border-stone-100">@Rauno Freiberg</div>
              </a>

              <a 
                href="https://www.perplexity.ai/search/shoedog-phil-knight-zA.qaPNaSlGnPv8q1W3UvQ#0" 
                target="_blank" 
                rel="noopener noreferrer" 
                className='group relative flex flex-col gap-1 w-full p-2 bg-stone-50 rounded-lg hover:rounded-tr-2xl border border-stone-200 overflow-hidden transition-all duration-300 cursor-pointer'
              >
                <div className='absolute size-4 -top-4 -right-4 group-hover:-top-[1px] group-hover:-right-[1px] rounded-bl-lg rounded-tr-[26px] bg-stone-100 group-hover:bg-stone-50 border border-stone-200 shadow-sm transition-all duration-300'></div>
                
                  <div className="text-sm font-semibold text-slate-800 truncate pb-0.5 border-b border-stone-100">Shoe Dog</div>
                <div className="text-xs font-light text-slate-600 pb-0.5 border-b border-stone-100">@Phil Knight</div>
              </a>
              
            </div>

            {/* Experience */}
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
                    <div className="text-sm leading-6 font-medium text-emerald-800">Looking for new opportunities in product design!</div>
                    
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

              
            </div>

            

            

          </div>
          <div className="w-full">
            <Footer />
          </div>

        </div>
        
        <div className="fixed flex items-center justify-center left-0 right-0 bottom-10 z-10">
          <Navbar />
        </div>

        
      </main>
    </div>
  );
}
