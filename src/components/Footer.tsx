"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkedinLogo, XLogo, Clipboard, At } from '@phosphor-icons/react';

export default function Footer() {
  return (
    <div className="isolate relative flex flex-col-reverse w-full md:col-span-7 col-span-1 h-fit border border-slate-200 rounded-2xl md:p-6 p-4 items-center justify-center gap-2.5">
      
      <div className='text font-medium text-slate-500 flex items-center'>Made with &nbsp; <span className='text-xs'> ❤️ </span> &nbsp; and &nbsp; <img src="/images/About/Cursor-Icon.png" alt="Cursor" className="h-5 inline-block" /> </div>

      <div className="flex items-center justify-center gap-3 pb-2.5 border-b border-slate-200">
        
        <a 
          href="https://x.com/ShreyasPatil_" 
          target="_blank" 
          rel="noopener noreferrer" 
          className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-slate-400 via-slate-600 to-slate-800 hover:from-slate-500 hover:via-slate-700 hover:to-slate-900 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-slate-700 cursor-pointer transition-all duration-300'
        >                  
          <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
          <XLogo size={18} weight="fill" />
        </a>

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

        <a 
          href="https://www.linkedin.com/in/shreyastpatil/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className='relative flex items-center justify-center size-8 text-white rounded-full bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 hover:from-blue-400 hover:via-blue-600 hover:to-blue-800 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-blue-700 cursor-pointer transition-all duration-300'
        >                  
          <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
          <LinkedinLogo size={18} weight="fill" />
        </a>
      </div>
    </div>
  );
} 