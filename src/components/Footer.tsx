"use client";

import React, { useState, useEffect } from 'react';
import { LinkedinLogo, XLogo, ArrowLeft, ArrowRight, ReadCvLogo } from '@phosphor-icons/react';
import EmailCopyButton from './EmailCopyButton';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ProjectNavigation {
  previousProject?: {
    name: string;
    slug: string;
  };
  nextProject?: {
    name: string;
    slug: string;
  };
}

interface FooterProps {
  variant?: 'default' | 'project';
  projectNavigation?: ProjectNavigation;
}

export default function Footer({ variant = 'default', projectNavigation }: FooterProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // Small delay for smoother animation

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`isolate bg-white relative flex flex-col-reverse w-full md:col-span-7 col-span-1 h-fit  rounded-2xl md:p-6 p-4 items-center justify-center gap-2.5 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_4px_-0.5px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_32px_-2px_rgba(0,0,0,0.08)] transform transition-all duration-700 ease-out ${
      isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-8'
    }`}>
      <div className='flex flex-col md:flex-row w-full items-start md:items-center gap-3 md:gap-2 md:justify-between'>
        <p className='text-gray-500 text-sm'>© 2025 Shreyas Patil</p>
        <div className='text-sm text-gray-500 flex items-center'>Made with &nbsp; <span className='text-xs'> ❤️ </span> &nbsp; and &nbsp; <Image src="/images/About/Cursor-Icon.png" alt="Cursor" width={20} height={20} className="h-5 inline-block" /> </div>
      </div>
      

      <div className="flex w-full items-center justify-start gap-3 pb-2.5 border-b border-gray-200">
        
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
          <EmailCopyButton />
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

        <a 
          href="/document/Shreyas-Patil-Resume-2025.pdf" 
          target="_blank" 
          rel="noopener noreferrer" 
          download
          className='relative flex items-center justify-center size-8 text-stone-500 rounded-full bg-radial-[at_50%_75%] from-stone-100 via-stone-200 to-stone-300 hover:from-stone-200 hover:via-stone-300 hover:to-stone-400 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] border border-stone-400 cursor-pointer transition-all duration-300'
        >                  
          <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white/70  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
          <ReadCvLogo size={18} weight="fill" />
        </a>
      </div>

      {/* Project Navigation Section - Only shown for project variant */}
      {variant === 'project' && projectNavigation && (
        <div className="w-full text-gray-500 text-sm flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            {projectNavigation.previousProject ? (
              <div 
                className="flex items-center gap-2.5 cursor-pointer group/nav"
                onClick={() => router.push(`/projects/${projectNavigation.previousProject!.slug}`)}
                role="button"
                tabIndex={0}
                aria-label={`Previous Project: ${projectNavigation.previousProject.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/projects/${projectNavigation.previousProject!.slug}`);
                  }
                }}
              >
                <Button
                  variant="iconPrimary"
                  size="iconXs"
                  showHighlight={true}
                  className="group-hover/nav:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] group-hover/nav:text-white group-hover/nav:border-blue-700 group-active/nav:scale-95 transition-all duration-300 pointer-events-none"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <ArrowLeft size={14} weight="bold" />
                </Button>
                <div className="text-header group-hover/nav:text-gray-700 transition-colors duration-300">{projectNavigation.previousProject.name}</div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 opacity-50">
                <div className="w-6 h-6"></div>
                <div className="text-xl font-medium"></div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {projectNavigation.nextProject ? (
              <div 
                className="flex items-center gap-2.5 cursor-pointer group/nav"
                onClick={() => router.push(`/projects/${projectNavigation.nextProject!.slug}`)}
                role="button"
                tabIndex={0}
                aria-label={`Next Project: ${projectNavigation.nextProject.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/projects/${projectNavigation.nextProject!.slug}`);
                  }
                }}
              >
                <div className="text-header group-hover/nav:text-gray-700 transition-colors duration-300">{projectNavigation.nextProject.name}</div>
                <Button
                  variant="iconPrimary"
                  size="iconXs"
                  showHighlight={true}
                  className="group-hover/nav:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] group-hover/nav:text-white group-hover/nav:border-blue-700 group-active/nav:scale-95 transition-all duration-300 pointer-events-none"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <ArrowRight size={14} weight="bold" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 opacity-50">
                <div className="text-header"></div>
                <div className="w-6 h-6"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 