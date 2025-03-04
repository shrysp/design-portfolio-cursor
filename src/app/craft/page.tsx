"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Palette } from '@phosphor-icons/react';

export default function Craft() {
  return (
    <div className="min-h-screen flex justify-center">
      <main className="w-full max-w-[800px] flex flex-col gap-12 py-12 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4 "
        >

            <motion.div      
              className={`group relative flex items-center justify-center text-white/80 size-[44px] border border-blue-700 bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] rounded-full pointer-cursor
                                active:bg-radial-[at_50%_75%] active:from-blue-300 active:via-blue-500 active:to-blue-700 active:border-blue-700 active:text-white/80 active:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset]`}
            > 
            <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
            <Palette size={28} weight="fill" />
            
          </motion.div>
          <h1 className="text-[40px] font-bold ">
            Craft
          </h1>
          
        </motion.div>
        
        {/* Craft sections */}
        <div className="space-y-12 mb-24">
          {/* Design Philosophy */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-semibold mb-3 text-blue-600">Design Philosophy</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <p className="text-gray-700">
                I believe in creating designs that are not only visually appealing but also functional and user-centered. 
                My approach combines aesthetic sensibility with practical considerations to deliver experiences that delight users.
              </p>
            </div>
          </motion.section>
          
          {/* Design Process */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mb-3 text-blue-600">Design Process</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Research & Discovery</li>
                <li>Ideation & Sketching</li>
                <li>Wireframing & Prototyping</li>
                <li>Visual Design</li>
                <li>Testing & Iteration</li>
                <li>Implementation & Delivery</li>
              </ol>
            </div>
          </motion.section>
          
          {/* Tools & Technologies */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold mb-3 text-blue-600">Tools & Technologies</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Figma</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Adobe Creative Suite</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Sketch</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>React</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Next.js</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Tailwind CSS</span>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
        
        <div className="fixed flex items-center justify-center left-0 right-0 bottom-8 z-10">
          <Navbar />
        </div>
      </main>
    </div>
  );
} 