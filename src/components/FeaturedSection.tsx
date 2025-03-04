"use client";

import { motion } from 'framer-motion';
import AnimatedCard from './AnimatedCard';

export default function FeaturedSection() {
  const features = [
    {
      title: 'Responsive Design',
      description: 'Create beautiful interfaces that work on any device, from mobile to desktop.',
    },
    {
      title: 'Modern Animations',
      description: 'Smooth, performant animations powered by Framer Motion for a delightful user experience.',
    },
    {
      title: 'Accessible Components',
      description: 'Built with accessibility in mind to ensure your application works for everyone.',
    },
  ];

  return (
    <section className="py-16 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="max-w-[800px] mx-auto"
      >
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Featured Projects
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-600 max-w-2xl mx-auto"
          >
            Explore our latest work showcasing modern web development techniques with Next.js, Tailwind CSS, and Framer Motion.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <AnimatedCard
              key={index}
              title={feature.title}
              description={feature.description}
              delay={0.1 * (index + 1)}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
} 