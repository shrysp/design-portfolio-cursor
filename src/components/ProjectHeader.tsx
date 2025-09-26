'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
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
        variant="back"
        size="iconSm"
        showHighlight={true}
        onClick={() => router.push('/projects')}
        aria-label="Back"
      >
        <ArrowLeft size={16} weight="bold" />
      </Button>

      <h1 className={`text-page-header text-stone-700 ${titleClassName}`}>
        {title}
      </h1>
    </motion.div>
  );
}
