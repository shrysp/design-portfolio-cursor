"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Star } from '@phosphor-icons/react';

interface AnimatedCardProps {
  title: string;
  description: string;
  delay?: number;
}

export default function AnimatedCard({ title, description, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="p-6 rounded-xl bg-white shadow-lg border border-zinc-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <Star size={24} weight="fill" className="text-yellow-500" />
      </div>
      
      <p className="text-zinc-600 mb-4">{description}</p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        Learn more
        <ArrowRight size={16} weight="bold" />
      </motion.button>
    </motion.div>
  );
} 