"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen flex justify-center">
      <main className="w-full max-w-[800px] px-4">
        {/* Hero section */}
        <motion.div 
          className="mt-12 mb-8 space-y-1 border-b border-slate-200 pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-500">
            Shreyas Patil
          </h1>
          <p className="text-[24px] text-blue-500/70 font-semibold">
            Product Designer
          </p>
          
        </motion.div>
        
        
        <div className="fixed flex items-center justify-center left-0 right-0 bottom-8 z-10">
          <Navbar />
        </div>
      </main>
    </div>
  );
}
