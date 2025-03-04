"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen flex justify-center">
      <main className="w-full max-w-[800px] py-6">

        <div className="flex flex-col gap-12 items-start border border-slate-200 p-8 h-[94vh] overflow-y-auto scrollbar-hide rounded-4xl">
        {/* Hero section */}
          <motion.div 
          className="w-full border-b space-y-2 border-slate-200 pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-[24px] font-bold text-slate-800">
            Shreyas Patil
          </h1>
          <p className="text-[16px] text-slate-600 font-medium">
            I'm a Product Designer based in Bay Area, CA.
          </p>
          
          </motion.div>
        </div>
        
        <div className="fixed flex items-center justify-center left-0 right-0 bottom-8 z-10">
          <Navbar />
        </div>
      </main>
    </div>
  );
}
