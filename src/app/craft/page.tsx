"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

export default function Craft() {
  // Using underscore prefix to indicate it's intentionally unused but kept for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _router = useRouter();

  const gridVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
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
    <div className="min-h-screen flex justify-center">
      <main className="w-full md:max-w-[800px] max-w-[361px] flex flex-col gap-12">

        <div className="flex flex-col gap-6 items-start border border-slate-200 md:p-8 p-4 md:pb-24 pb-24 h-[100vh] overflow-y-auto scrollbar-hide">
          {/* Page header */}
         <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="isolate relative min-h-14 flex w-full bg-slate-800 border-3 border-slate-800 rounded-full items-center gap-4 overflow-hidden"
        
        >

          <div className="absolute inset-x-1 top-0.5 h-1/2 bg-gradient-to-b from-slate-50/40 to-slate-50/5 rounded-t-[24px] rounded-b-[6px] z-10"></div>
          <div className="flex items-center w-full h-full">
            <h1 className="text-[24px] font-bold text-slate-50 w-full px-6 py-2">
            Craft
           </h1>
           <div className="flex w-full h-full bg-[url('/images/Banners/Banner-Craft.png')] bg-cover bg-[50%_61%] [mask-image:radial-gradient(50%_400%_at_0%_50%,transparent_10%,rgba(0,0,0,0.7)_100%)] [mask-type:alpha]">
            
           </div>
          </div>
          
         </motion.div>
        
        {/* Craft sections */}
        <motion.div className="grid md:grid-cols-2 grid-cols-1 gap-6 h-auto w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible">
          
            <motion.div className="relative col-span-1 row-span-4 aspect-[3/4] w-full h-full rounded-3xl border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"
              variants={gridVariants}>
                <video src="/videos/ItinerAIbuild-1.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className='absolute inset-0 w-full h-full object-cover rounded-3xl -z-10'></video>
            </motion.div>
            <motion.div className="relative col-span-1 row-span-2 aspect-4/3 w-full h-full rounded-3xl border border-slate-200 bg-[url('/images/Craft/BuiLD09.png')] bg-cover bg-center shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"
              variants={gridVariants}>
            </motion.div>
            
            <motion.div className="relative col-span-1 row-span-2 aspect-4/3 w-full h-full rounded-3xl border border-slate-200 bg-[url('/images/Craft/BuiLD11.png')] bg-cover bg-center shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"
              variants={gridVariants}>
            </motion.div>
            <motion.div className="relative col-span-1 row-span-2 aspect-square w-full h-full rounded-3xl border border-slate-200 bg-[url('/images/Craft/BuiLD08.png')] bg-cover bg-center shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"
              variants={gridVariants}>
            </motion.div>
          

          
            <motion.div className="relative col-span-1 row-span-1 aspect-16/9 w-full h-full rounded-3xl border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"
              variants={gridVariants}>
              <video src="/images/Craft/pplx-mindlab-1.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className='absolute inset-0 w-full h-full object-cover rounded-3xl -z-10'></video>
            </motion.div>
            <motion.div className="relative col-span-1 row-span-2 aspect-4/3 w-full h-full rounded-3xl border border-slate-200 bg-[url('/images/Craft/BuiLD04.png')] bg-cover bg-center shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"
              variants={gridVariants}>
            </motion.div>
            <motion.div className="relative col-span-1 row-span-2 aspect-4/3 w-full h-full rounded-3xl border border-slate-200 bg-[url('/images/Craft/BuiLD10.png')] bg-cover bg-center shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"
              variants={gridVariants}>
            </motion.div>
            <motion.div className="relative col-span-1 row-span-1 aspect-16/9 w-full h-full rounded-3xl border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"
              variants={gridVariants}>
                <video src="/images/Craft/Modals.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className='absolute inset-0 w-full h-full object-cover rounded-3xl -z-10'></video>
            </motion.div>
            <motion.div className="relative col-span-1 row-span-2 aspect-square w-full h-full rounded-3xl border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]"
              variants={gridVariants}>
                <video src="/images/Craft/Whop-Modal.mp4" autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" className='absolute inset-0 w-full h-full object-cover rounded-3xl -z-10'></video>
            </motion.div>
            
          
        </motion.div>

          <div className="w-full">
            <Footer />
          </div>
        
        <div className="fixed flex items-center justify-center left-0 right-0 bottom-8 z-10">
          <Navbar />
        </div>

        </div>
      </main>
    </div>
  );
} 