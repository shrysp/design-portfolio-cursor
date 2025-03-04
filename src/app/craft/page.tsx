"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Palette } from '@phosphor-icons/react';

export default function Craft() {
  return (
    <div className="min-h-screen flex justify-center">
      <main className="w-full max-w-[800px] flex flex-col gap-12 py-6">

        <div className="flex flex-col gap-12 items-start border border-slate-200 p-8 h-[94vh] overflow-y-auto scrollbar-hide rounded-4xl">
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
        <div className="grid grid-cols-2 gap-4 h-auto w-full">
          <div className="col-span-1 flex flex-col gap-4 w-full h-fit">
            <div className="aspect-square w-full h-full rounded-2xl border border-slate-200"></div>
            <div className="aspect-16/9 w-full h-full rounded-2xl border border-slate-200"></div>
          </div>
          <div className="col-span-1 flex flex-col gap-4 w-full h-fit">
            <div className="aspect-16/9 w-full h-full rounded-2xl border border-slate-200"></div>
            <div className="aspect-4/3 w-full h-full rounded-2xl border border-slate-200"></div>
            <div className="aspect-square w-full h-full rounded-2xl border border-slate-200"></div>
          </div>
        </div>
        
        <div className="fixed flex items-center justify-center left-0 right-0 bottom-8 z-10">
          <Navbar />
        </div>

        </div>
      </main>
    </div>
  );
} 