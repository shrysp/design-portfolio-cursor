'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { IconArrowLeft } from 'nucleo-micro-bold-essential';
import { Button } from '@/components/ui/button';

interface ProjectHeaderProps {
  title: string;
  className?: string;
  titleClassName?: string;
}

export default function ProjectHeader({ 
  title, 
  className = "", 
  titleClassName = "" 
}: ProjectHeaderProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full items-center gap-4 ${className}`}
    >
      <Button
        variant="iconPrimary"
        size="icon"
        onClick={() => router.push('/')}
        className="relative size-8 transition-all duration-200 group-hover:hover group-hover:text-white group-hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] group-hover:border-blue-700 group-hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset]"
      >
        <div className="absolute inset-1.5 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 to-white/20 z-10" />
        <IconArrowLeft size={16} />
      </Button>

      <h1 className={`text-header text-stone-700 ${titleClassName}`}>
        {title}
      </h1>
    </motion.div>
  );
}
