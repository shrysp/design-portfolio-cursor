"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconEnvelopeFilled, IconEnvelopeOpenHeart } from 'nucleo-micro-bold-essential';

export default function EmailCopyButton() {
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText('shreyaspatil.design@gmail.com');
    setCopied(true);
  };

  return (
    <div 
      onClick={handleCopy}
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
            <IconEnvelopeOpenHeart size={18}/>
          </motion.span>
        ) : (
          <motion.span
            key="at"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            
            <IconEnvelopeFilled size={18} />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
} 