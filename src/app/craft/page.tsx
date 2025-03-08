"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Palette } from '@phosphor-icons/react';
import Footer from '@/components/Footer';

export default function Craft() {
  return (
    <div className="min-h-screen flex justify-center">
      <main className="w-full md:max-w-[800px] max-w-[361px] flex flex-col gap-12 py-6 ">

        <div className="flex flex-col gap-6 items-start border border-slate-200 md:p-8 p-4 md:pb-24 pb-24 h-[94vh] overflow-y-auto rounded-4xl scrollbar-hide">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex w-full items-center gap-4 border-b border-slate-200 pb-4"
        >

          

            <motion.div      
              className={`group relative flex items-center justify-center text-white/80 size-[32px] border border-blue-700 bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] rounded-full pointer-cursor
                                active:bg-radial-[at_50%_75%] active:from-blue-300 active:via-blue-500 active:to-blue-700 active:border-blue-700 active:text-white/80 active:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset]`}
            > 
            <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
            <Palette size={20} weight="fill" />
            
          </motion.div>
          <h1 className="text-[24px] font-bold text-slate-800 ">
            Craft
          </h1>
          
        </motion.div>
        
        {/* Craft sections */}
        <div className="grid md:grid-cols-2 grid-cols-1 gap-6 h-auto w-full">
          <div className="md:col-span-1 col-span-1 flex flex-col gap-6.5 w-full h-fit">
            <div className="relative aspect-[3/4] w-full h-full rounded-3xl border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
                <video src="/videos/ItinerAIbuild-1.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className='absolute inset-0 w-full h-full object-cover rounded-3xl -z-10'></video>
            </div>
            <div className="relative aspect-4/3 w-full h-full rounded-3xl border border-slate-200 bg-[url('/images/Craft/BuiLD09.png')] bg-cover bg-center shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"></div>
            
            <div className="aspect-4/3 w-full h-full rounded-3xl border border-slate-200 bg-[url('/images/Craft/BuiLD11.png')] bg-cover bg-center shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"></div>
            <div className="aspect-square w-full h-full rounded-3xl border border-slate-200 bg-[url('/images/Craft/BuiLD08.png')] bg-cover bg-center shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"></div>
          </div>
          <div className="md:col-span-1 col-span-1 flex flex-col gap-6.5 w-full h-fit">
            <div className="relative aspect-16/9 w-full h-full rounded-3xl border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
              <video src="/images/Craft/pplx-mindlab-1.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className='absolute inset-0 w-full h-full object-cover rounded-3xl -z-10'></video>
            </div>
            <div className="aspect-4/3 w-full h-full rounded-3xl border border-slate-200 bg-[url('/images/Craft/BuiLD04.png')] bg-cover bg-center shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"></div>
            <div className="aspect-4/3 w-full h-full rounded-3xl border border-slate-200 bg-[url('/images/Craft/BuiLD10.png')] bg-cover bg-center shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"></div>
            <div className="relative aspect-16/9 w-full h-full rounded-3xl border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
                <video src="/images/Craft/Modals.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className='absolute inset-0 w-full h-full object-cover rounded-3xl -z-10'></video>
            </div>
            <div className="relative aspect-square w-full h-full rounded-3xl border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
                <video src="/images/Craft/Whop-Modal.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className='absolute inset-0 w-full h-full object-cover rounded-3xl -z-10'></video>
            </div>
            
          </div>
        </div>

          <div className="w-full">
            <Footer />
          </div>
        
        <div className="fixed flex items-center justify-center left-0 right-0 bottom-10 z-10">
          <Navbar />
        </div>

        </div>
      </main>
    </div>
  );
} 