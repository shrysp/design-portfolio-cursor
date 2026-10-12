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
        className="size-8"
      >
        <IconArrowLeft size={16} />
      </Button>

      <h1 className={`text-header text-stone-700 ${titleClassName}`}>
        {title}
      </h1>
    </motion.div>
  );
}
