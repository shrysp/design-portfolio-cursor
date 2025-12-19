"use client";

import { motion } from 'framer-motion';
import Footer from '@/components/Footer';
import { ImageSquare, PlayCircle } from '@phosphor-icons/react';
// import Image from 'next/image';
// import ModalGrid from '@/components/ModalGrid';
// import MediaCard from '@/components/MediaCard';

export default function Craft({ hideHeader = false, hideBackground = false }: { hideHeader?: boolean; hideBackground?: boolean }) {

  const gridVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)", scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: { duration: 0.4 }
    }
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

  return (
    <div className={`min-h-screen flex justify-center ${hideBackground ? '' : ''}`}>
      <main className="w-full md:max-w-[800px] max-w-[361px] flex flex-col gap-12">
        <div className="flex flex-col gap-12 items-start  md:px-0 px-4">
         
          {!hideHeader && (
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(4px)", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.3 }}
            className="isolate relative min-h-14 flex w-full bg-slate-800 border-3 border-slate-800 rounded-full items-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-x-1 top-0.5 h-1/2 bg-gradient-to-b from-slate-50/40 to-slate-50/5 rounded-t-[24px] rounded-b-[6px] z-10"></div>
            <div className="flex items-center w-full h-full">
              <h1 className="md:text-[24px] text-[16px] font-bold text-slate-50 w-full px-6 py-2">
                Craft
              </h1>
              
              <div className="flex w-full h-full bg-[url('/images/Banners/Banner-Craft.png')] bg-cover bg-[50%_61%] [mask-image:radial-gradient(50%_400%_at_0%_50%,transparent_10%,rgba(0,0,0,0.7)_100%)] [mask-type:alpha]"></div>
            </div>
          </motion.div>
          )}


          {/* Craft sections */}
          <motion.div 
            className="grid md:grid-cols-2 grid-cols-1 gap-6 h-auto w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            
            <motion.div 
              className="isolate relative w-full h-full aspect-[3/4] bg-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_4px_-0.5px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_32px_-2px_rgba(0,0,0,0.08)] rounded-xl col-span-1 row-span-4"
              variants={gridVariants}
            >
              <video src="/videos/ItinerAIbuild-1.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className='absolute inset-0 w-full h-full object-cover rounded-xl -z-10'></video>
              
            </motion.div>

            <motion.div 
              className="isolate relative w-full h-full bg-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_4px_-0.5px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_32px_-2px_rgba(0,0,0,0.08)] rounded-xl col-span-1 row-span-2"
              variants={gridVariants}
            >
              <div className='isolate relative rounded-xl bg-white overflow-hidden outline outline-gray-200'>
                <div className="w-full h-full aspect-4/3 relative bg-white bg-[url('/images/Craft/BuiLD09.png')] bg-cover bg-center">
                </div>
                
              </div>
            </motion.div>
            
            <motion.div 
              className="isolate relative w-full h-full bg-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_4px_-0.5px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_32px_-2px_rgba(0,0,0,0.08)] rounded-xl col-span-1 row-span-2"
              variants={gridVariants}
            >
              <div className='isolate relative rounded-xl bg-white overflow-hidden outline outline-gray-200'>
                <div className="w-full h-full aspect-4/3 relative bg-white bg-[url('/images/Craft/BuiLD11.png')] bg-cover bg-center">
                </div>
                
              </div>
            </motion.div>

            <motion.div 
              className="isolate relative w-full h-full bg-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_4px_-0.5px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_32px_-2px_rgba(0,0,0,0.08)] rounded-xl col-span-1 row-span-2"
              variants={gridVariants}
            >
              <div className='isolate relative rounded-xl bg-white overflow-hidden outline outline-gray-200'>
                <div className="w-full h-full aspect-square relative bg-white bg-[url('/images/Craft/BuiLD08.png')] bg-cover bg-center">
                </div>
                
              </div>
            </motion.div>
          
            <motion.div 
              className="isolate relative w-full bg-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_4px_-0.5px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_32px_-2px_rgba(0,0,0,0.08)] rounded-2xl col-span-1 row-span-1"
              variants={gridVariants}
            >
              <div className='isolate relative rounded-xl bg-white overflow-hidden outline outline-gray-200'>
                <div className="w-full h-full aspect-16/9 relative bg-black">
                  <video src="/images/Craft/pplx-mindlab-1.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className='w-full h-full object-cover'></video>
                </div>
                
              </div>
            </motion.div>

            <motion.div 
              className="isolate relative w-full bg-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_4px_-0.5px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_32px_-2px_rgba(0,0,0,0.08)] rounded-2xl col-span-1 row-span-2"
              variants={gridVariants}
            >
              <div className='isolate relative rounded-xl bg-white overflow-hidden outline outline-gray-200'>
                <div className="w-full h-full aspect-4/3 relative bg-white bg-[url('/images/Craft/BuiLD04.png')] bg-cover bg-center">
                </div>
               
              </div>
            </motion.div>

            <motion.div 
              className="isolate relative w-full bg-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_4px_-0.5px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_32px_-2px_rgba(0,0,0,0.08)] rounded-2xl col-span-1 row-span-2"
              variants={gridVariants}
            >
              <div className='isolate relative rounded-xl bg-white overflow-hidden outline outline-gray-200'>
                <div className="w-full h-full aspect-4/3 relative bg-white bg-[url('/images/Craft/BuiLD10.png')] bg-cover bg-center">
                </div>
                
              </div>
            </motion.div>

            <motion.div 
              className="isolate relative w-full bg-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_4px_-0.5px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_32px_-2px_rgba(0,0,0,0.08)] rounded-2xl col-span-1 row-span-1"
              variants={gridVariants}
            >
              <div className='isolate relative rounded-xl bg-white overflow-hidden outline outline-gray-200'>
                <div className="w-full h-full aspect-16/9 relative bg-black">
                  <video src="/images/Craft/Modals.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className='w-full h-full object-cover'></video>
                </div>
                
              </div>
            </motion.div>

            <motion.div 
              className="isolate relative w-full bg-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_4px_-0.5px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_32px_-2px_rgba(0,0,0,0.08)] rounded-2xl col-span-1 row-span-2"
              variants={gridVariants}
            >
              <div className='isolate relative rounded-xl bg-white overflow-hidden outline outline-gray-200'>
                <div className="w-full h-full aspect-square relative bg-black">
                  <video src="/images/Craft/Whop-Modal.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className='w-full h-full object-cover'></video>
                </div>
                
              </div>
            </motion.div>
          </motion.div>

          <div className="w-full">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
} 