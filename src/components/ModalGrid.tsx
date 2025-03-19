"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowSquareOut, Code, Play, PencilLine, X, Info } from '@phosphor-icons/react';
import Image from 'next/image';

// Tab data structure
interface TabData {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabData[] = [
  {
    id: 'new-workflow',
    label: 'New Workflow',
    icon: <PencilLine weight="fill" size={16} />
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: <Play weight="fill" size={16} />
  },
  {
    id: 'api',
    label: 'API',
    icon: <Code weight="fill" size={16} />
  }
];

// Moving Background component
const MovingBackground = ({ selectedButton }: { selectedButton: HTMLButtonElement | null }) => (
  <motion.div
    className="absolute h-full rounded-full"
    animate={{
      x: selectedButton?.offsetLeft ?? 0,
      y: selectedButton?.offsetTop ?? 0,
      width: selectedButton?.offsetWidth ?? 0,
      height: selectedButton?.offsetHeight ?? 0,
    }}
    transition={{ type: "spring", stiffness: 600, damping: 40 }}
  >
    <div className="flex items-center justify-between size-fit px-[1px] rounded-full bg-radial-[at_50%_75%] from-blue-400 via-blue-500 to-blue-700 border border-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] h-full w-full">
      <div className="absolute flex inset-2 top-0.5 h-1/2 items-center justify-center bg-gradient-to-b from-white/50 to-white/5 rounded-t-[60px] rounded-b-[16px] z-10"></div>
    </div>
  </motion.div>
);

// Main component
export default function ModalGrid() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [selectedButton, setSelectedButton] = useState<HTMLButtonElement | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleTabChange = (tabId: string) => {
    const newIndex = tabs.findIndex(tab => tab.id === tabId);
    setDirection(newIndex > activeTabIndex ? 1 : -1);
    setActiveTabIndex(newIndex);
    setActiveTab(tabId);
    setSelectedButton(buttonRefs.current[newIndex]);
  };

  useEffect(() => {
    setSelectedButton(buttonRefs.current[activeTabIndex]);
  }, [activeTabIndex]);

  // Animation variants based on direction
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 1,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 1,
    })
  };

  const transition = {
    delay: 0.1,
    duration: 0.5,
    ease: [0.9, -0.5, 0.64, 1], // Custom cubic-bezier for smoother end
  };

  const renderContent = (tabId: string) => {
    switch (tabId) {
      case 'new-workflow':
        return <NewWorkflowTab />;
      case 'preview':
        return <PreviewTab />;
      case 'api':
        return <ApiTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full p-4 bg-slate-100 rounded-2xl text-[#111827]">
      {/* Tabs Navigation */}
      <div className="relative w-fit flex rounded-full bg-white">
          <MovingBackground selectedButton={selectedButton} />

          {/* Tab buttons */}
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => { buttonRefs.current[index] = el; }}
              className={`relative z-10 flex items-center justify-center gap-2 py-1.5 px-5 rounded-full text-sm font-medium cursor-pointer ${
                activeTab === tab.id 
                  ? 'text-white' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
              onClick={() => handleTabChange(tab.id)}
            >
              <span className="drop-shadow-[0_0.5px_0px_rgba(255,255,255,1)]">
                {tab.label}
              </span>
            </button>
          ))}
      </div>

      {/* Tab content area */}
      <div className="relative flex-1 min-h-[600px] overflow-hidden rounded-lg">
        <div className="w-full h-full relative">
          <AnimatePresence
            mode="wait"
            initial={false}
            custom={direction}
          >
            <motion.div
              key={activeTab}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="absolute inset-0 w-full h-full p-4"
            >
              {renderContent(activeTab)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Tab content components
function NewWorkflowTab() {
  const gridVariants = {
    hidden: { },
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
        delay: 0.1,
        duration: 0.3,
        ease: [0.9, -0.5, 0.64, 1],
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        delay: 0.1,
        duration: 0.3,
        ease: [0.9, -0.5, 0.64, 1],
      },
    },
  };

  return (
    <motion.div 
      className="flex items-center justify-center p-4 h-full"
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="w-[480px] border rounded-lg shadow-[0px_24px_24px_-12px] shadow-black/10 bg-white text-[#111827] border-[#D1D5DB]">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <PencilLine size={20} weight="bold" />
            <span className="text-xl font-semibold">New Workflow</span>
          </div>
          {/* Close button */}
          <button className="p-1 rounded-full hover:bg-opacity-10 hover:bg-gray-500">
            <ArrowSquareOut size={16} weight="bold" className="text-[#6B7280]" />
          </button>
        </div>
        {/* Modal body */}
        <div className="flex flex-col p-6 gap-6">
          {/* Title input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1 text-[#4B5563]">
              Title
            </label>
            <input
              type="text"
              id="title"
              className="w-full px-3 py-2 rounded-md border text-sm outline-none transition-all duration-200 ease-in-out bg-white text-[#111827] border-[#D1D5DB] focus:border-[#4F0D52] focus:ring-1 focus:ring-[#972AA1]"
              placeholder="Enter workflow title"
            />
          </div>
          {/* Structure input */}
          <div>
            <label htmlFor="structure" className="block text-sm font-medium mb-1 text-[#4B5563]">
                Description
            </label>
            <input
              type="text"
              id="structure"
              className="w-full px-3 py-2 rounded-md border text-sm outline-none transition-all duration-200 ease-in-out bg-white text-[#111827] border-[#D1D5DB] focus:border-[#4F0D52] focus:ring-1 focus:ring-[#972AA1]"
              placeholder="Enter workflow Description"
            />
          </div>

          {/* Toggle */}
          <div className="flex gap-8">
            {/* Visibility toggle */}
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-[#4B5563]">Visibility</div>
              <div className="flex items-center rounded p-1 bg-[#F9FAFB] border-[#D1D5DB] border">
                <div className="py-1.5 px-3 rounded-sm text-sm border bg-[#FFFFFF] text-[#4F0D52] border-[#D1D5DB]">
                  Private
                </div>
                <div className="py-1.5 px-3 rounded-sm text-sm text-[#4B5563]">
                  Company
                </div>
              </div>
            </div>

            {/* Sources toggle */}
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-[#4B5563]">Sources</div>
              <div className="flex items-center rounded p-1 bg-[#F9FAFB] border-[#D1D5DB] border">
                <div className="py-1.5 pr-2 pl-3 rounded-sm border bg-[#FFFFFF] text-[#4F0D52] border-[#D1D5DB]">
                  <div className="flex items-center gap-1 text-sm">
                    <div>Apps</div>
                    <div className="w-1 h-full bg-[#F9FAFB]"></div>
                    <ArrowSquareOut size={16} weight="bold"/>
                  </div>
                </div>
                <div className="py-1.5 px-3 rounded-sm text-sm text-[#4B5563]">
                  Web
                </div>
              </div>
            </div>
          </div>

          {/* Description textarea */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1 text-[#4B5563]">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full px-3 py-2 rounded-md border text-sm outline-none transition-all duration-200 ease-in-out bg-white text-[#111827] border-[#D1D5DB] focus:border-[#4F0D52] focus:ring-1 focus:ring-[#972AA1]"
              placeholder="Enter workflow description"
            ></textarea>
            <div className="text-[10px] leading-[14px] text-[#4B5563]">Tip: Change specific keywords into generic keywords for ease of use. Eg. Pizza &gt; Food Name</div>
          </div>
        </div>
        {/* Modal footer */}
        <div className="flex justify-end px-6 pb-4 pt-2 gap-3">
          {/* Cancel button */}
          <button className="px-[14px] py-1 text-[14px] leading-[24px] border rounded-md bg-[#FFFFFF] border-[#D1D5DB] text-[#4B5563] active:bg-[#E5E7EB]">
            Cancel
          </button>
          {/* Save button */}
          <button className="px-[14px] py-1 text-[14px] leading-[24px] rounded-md bg-[#4F0D52] text-white hover:bg-[#3D0A3F]">
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function PreviewTab() {
  const contentVariants = {
    hidden: { },
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
        delay: 0.1,
        duration: 0.3,
        ease: [0.9, -0.5, 0.64, 1],
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        delay: 0.1,
        duration: 0.3,
        ease: [0.9, -0.5, 0.64, 1],
      },
    },
  };

  return (
    <motion.div 
      className="flex items-center justify-center p-4 h-full"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div className="w-[480px] border rounded-lg shadow-[0px_24px_24px_-12px] shadow-black/10 bg-white text-[#111827] border-[#D1D5DB]">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 3L4 14H13L11 21L20 10H11L13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-semibold">Workflow Preview</span>
          </div>
          <button className="p-1 rounded-full hover:bg-opacity-10 hover:bg-gray-500">
            <X size={16} weight="bold" className="text-[#6B7280]" />
          </button>
        </div>
        
        {/* Modal body */}
        <div className="flex flex-col p-6 gap-6">
          {/* Title */}
          <motion.div>
            <div className="text-sm font-medium mb-1 text-[#4B5563]">
              Title
            </div>
            <div className="text-base leading-6 text-[#111827]">
              Draft a Blog
            </div>
          </motion.div>
          
          {/* Description */}
          <motion.div>
            <div className="text-sm font-medium mb-1 text-[#4B5563]">
              Description
            </div>
            <div className="text-base leading-6 text-[#111827]">
              Write a blog post for a social media post about product launches
            </div>
          </motion.div>
          
          {/* Prompt */}
          <motion.div>
            <div className="text-sm font-medium mb-1 text-[#4B5563]">
              Prompt
            </div>
            <div className="text-base leading-6 text-[#111827]">
              Write a concise and engaging blog post (300 words) about our new product launch. 
              Highlight key features, benefits, and include a call-to-action. Use an exciting 
              yet professional tone. Suggest relevant hashtags for social media sharing.
            </div>
          </motion.div>

          {/* Created By and Sources */}
          <motion.div className="flex justify-between">
            <div className="flex flex-col items-start w-1/2">
              <div className="text-sm font-medium mb-1 text-[#4B5563]">
                Created By
              </div>
              <div className="flex items-center gap-2">
                <Image 
                  src="/images/projects/Dashworks/profile.jpeg" 
                  alt="User" 
                  width={24} 
                  height={24}
                  className="rounded-full object-cover"
                />
                <span className="text-base leading-6 text-[#111827]">You</span>
              </div>
            </div>
            <div className="flex flex-col items-start w-1/2">
              <div className="text-sm font-medium mb-1 text-[#4B5563]">
                Sources
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.6504 12.5435C15.248 12.5435 13.3007 14.4908 13.3007 16.8931C13.3007 19.2955 15.248 21.2429 17.6504 21.2429C20.0526 21.2429 22 19.2955 22 16.8931C22 14.4908 20.0526 12.5435 17.6504 12.5435ZM6.34963 12.5438C3.94747 12.5438 2 14.4908 2 16.8933C2 19.2955 3.94747 21.2429 6.34963 21.2429C8.75195 21.2429 10.6995 19.2955 10.6995 16.8933C10.6995 14.4908 8.75195 12.5438 6.34963 12.5438ZM16.3495 7.10639C16.3495 9.50863 14.4023 11.4564 12.0001 11.4564C9.59772 11.4564 7.65041 9.50863 7.65041 7.10639C7.65041 4.7043 9.59772 2.75684 12.0001 2.75684C14.4023 2.75684 16.3495 4.7043 16.3495 7.10639Z" fill="url(#paint0_radial_2_106134)"/>
                    <defs>
                      <radialGradient id="paint0_radial_2_106134" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12 12.8599) scale(13.2527 12.2495)">
                        <stop stopColor="#FFB900"/>
                        <stop offset="0.6" stopColor="#F95D8F"/>
                        <stop offset="0.9991" stopColor="#F95353"/>
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
                <div className="w-6 h-6 rounded-full">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.0002 8.28564L19.6192 9.59517L17.2383 11.8571V19.619H20.5716C21.3607 19.619 22.0002 18.9795 22.0002 18.1904V8.28564Z" fill="#4CAF50"/>
                    <path d="M2 8.28564L3.72095 9.09993L6.7619 11.8571V19.619H3.42857C2.63952 19.619 2 18.9795 2 18.1904V8.28564Z" fill="#1E88E5"/>
                    <path d="M17.238 5.90479L11.9999 9.83336L6.76184 5.90479L6.28564 8.66669L6.76184 11.8572L11.9999 15.7857L17.238 11.8572L17.7142 8.66669L17.238 5.90479Z" fill="#E53935"/>
                    <path d="M2 6.42753V8.28562L6.7619 11.8571V5.90467L5.27429 4.78991C4.92 4.52419 4.48952 4.38086 4.04667 4.38086C2.91619 4.38086 2 5.29705 2 6.42753Z" fill="#C62828"/>
                    <path d="M22.0002 6.42753V8.28562L17.2383 11.8571V5.90467L18.7259 4.78991C19.0802 4.52419 19.5107 4.38086 19.9535 4.38086C21.084 4.38086 22.0002 5.29705 22.0002 6.42753Z" fill="#FBC02D"/>
                  </svg>
                </div>
                <div className="w-6 h-6 rounded-full">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.3306 21.8782L2.12207 13.6694C2.82326 17.8654 6.13494 21.1768 10.3306 21.8782Z" fill="#4D55AE"/>
                    <path d="M2 11.4504L12.5494 22C13.1754 21.9657 13.786 21.8737 14.3758 21.7297L2.27034 9.62402C2.12618 10.2141 2.03434 10.8244 2 11.4504Z" fill="#4D55AE"/>
                    <path d="M2.79639 8.05335L15.9467 21.2037C16.4252 20.9977 16.8841 20.7556 17.3205 20.4808L3.51945 6.67969C3.24451 7.11602 3.00233 7.57504 2.79639 8.05335Z" fill="#4D55AE"/>
                    <path d="M4.41113 5.47467C6.24633 3.34687 8.9622 2 11.9923 2C17.5195 2 22.0001 6.48057 22.0001 12.0076C22.0001 15.0381 20.6531 17.7539 18.5254 19.5891L4.41113 5.47467Z" fill="#4D55AE"/>
                  </svg>
                </div>
                <div className="w-6 h-6 rounded-full">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 1.95068C6.47514 1.95068 2 6.42582 2 11.9507C2 16.3706 4.86679 20.1152 8.83855 21.4412C9.33579 21.5332 9.51995 21.2263 9.51995 20.9562C9.51995 20.7168 9.51381 20.0906 9.50767 19.2558C6.72683 19.8574 6.13751 17.9175 6.13751 17.9175C5.68324 16.7635 5.0264 16.4504 5.0264 16.4504C4.11786 15.8304 5.09392 15.8426 5.09392 15.8426C6.09454 15.9163 6.62861 16.8739 6.62861 16.8739C7.51872 18.4025 8.96746 17.9605 9.53837 17.7027C9.63045 17.0581 9.88827 16.6161 10.1707 16.3644C7.95457 16.1189 5.62185 15.2595 5.62185 11.4289C5.62185 10.3362 6.00859 9.44608 6.65316 8.74626C6.5488 8.48844 6.20503 7.47555 6.74524 6.10047C6.74524 6.10047 7.58625 5.83036 9.4954 7.12564C10.2934 6.90464 11.1467 6.79415 12 6.78801C12.8471 6.79415 13.7066 6.90464 14.5046 7.12564C16.4137 5.83036 17.2548 6.10047 17.2548 6.10047C17.8011 7.47555 17.4573 8.49458 17.353 8.74626C17.9914 9.44608 18.3781 10.3362 18.3781 11.4289C18.3781 15.2717 16.0393 16.1127 13.8109 16.3644C14.167 16.6714 14.4923 17.2852 14.4923 18.2183C14.4923 19.5566 14.48 20.6309 14.48 20.9623C14.48 21.2325 14.6581 21.5394 15.1676 21.4412C19.1393 20.1152 22 16.3706 22 11.9568C22 6.42582 17.5249 1.95068 12 1.95068Z" fill="#111827"/>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Modal footer */}
        <motion.div className="flex justify-end px-6 pb-4 pt-2 gap-3">
          {/* Cancel button */}
          <button className="px-[14px] py-1 text-[14px] leading-[24px] border rounded-md bg-[#FFFFFF] border-[#D1D5DB] text-[#4B5563] active:bg-[#E5E7EB]">
            Cancel
          </button>
          {/* Use button */}
          <button className="px-[14px] py-1 text-[14px] leading-[24px] rounded-md bg-[#4F0D52] text-white hover:bg-[#3D0A3F]">
            Use
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ApiTab() {
  const contentVariants = {
    hidden: { },
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
        delay: 0.1,
        duration: 0.3,
        ease: [0.9, -0.5, 0.64, 1],
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        delay: 0.1,
        duration: 0.3,
        ease: [0.9, -0.5, 0.64, 1],
      },
    },
  };

  return (
    <motion.div 
      className="flex items-center justify-center p-4 h-full"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="w-[480px] border rounded-lg shadow-[0px_24px_24px_-12px] shadow-black/10 bg-white text-[#111827] border-[#D1D5DB]">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 2.5L16 1.5L22 5.5V21.5L5.5 22L2.5 2.5Z" fill="white"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M14.9774 1.05017L2.76757 1.94864C1.78307 2.03385 1.43994 2.67567 1.43994 3.44508V16.7898C1.43994 17.3894 1.65378 17.9019 2.16814 18.5868L5.03833 22.308C5.50979 22.9072 5.93821 23.0353 6.83845 22.9924L21.0177 22.1369C22.2169 22.0517 22.5599 21.4953 22.5599 20.5543V5.54117C22.5599 5.05475 22.3674 4.91424 21.7996 4.50005C21.7684 4.47732 21.736 4.45371 21.7025 4.42914L17.8049 1.69181C16.8625 1.00774 16.4768 0.921665 14.9774 1.05017ZM7.15994 5.29491C6.0023 5.37301 5.73925 5.39076 5.08182 4.85704L3.41004 3.53117C3.23954 3.35972 3.32505 3.14588 3.75317 3.10342L15.4916 2.24791C16.4766 2.16219 16.9906 2.50495 17.3763 2.80415L19.3897 4.25857C19.4754 4.30117 19.6892 4.55747 19.4321 4.55747L7.30939 5.28487L7.15994 5.29491ZM5.80965 20.4258V7.68015C5.80965 7.12421 5.98103 6.8674 6.49481 6.82421L20.4173 6.01182C20.8896 5.96907 21.1034 6.26871 21.1034 6.82421V19.4844C21.1034 20.0409 21.0174 20.5119 20.2461 20.5543L6.92329 21.3247C6.15227 21.3671 5.80965 21.1108 5.80965 20.4258ZM18.9619 8.36384C19.0473 8.7492 18.9619 9.13413 18.5756 9.17747L17.9336 9.30529V18.7149C17.3763 19.0143 16.8624 19.1854 16.4341 19.1854C15.7484 19.1854 15.5767 18.9714 15.0631 18.3301L10.8642 11.7433V18.1163L12.1929 18.4159C12.1929 18.4159 12.1929 19.1854 11.121 19.1854L8.16578 19.3567C8.07991 19.1854 8.16578 18.758 8.46549 18.6724L9.23667 18.4588V10.0326L8.16593 9.94689C8.08005 9.56159 8.29389 9.00602 8.89413 8.9629L12.0644 8.74935L16.4341 15.4219V9.51913L15.32 9.39139C15.2345 8.92029 15.5767 8.57827 16.0052 8.53581L18.9619 8.36384Z" fill="black"/>
            </svg>
            <span className="text-xl font-semibold">Connect Notion</span>
          </div>
          <button className="p-1 rounded-full hover:bg-opacity-10 hover:bg-gray-500">
            <X size={16} weight="bold" className="text-[#6B7280]" />
          </button>
        </div>
        
        {/* Modal body */}
        <div className="flex flex-col px-6 py-4 gap-6">
          {/* Info box */}
          <div className="flex items-start gap-3 py-4 px-3 rounded-md border border-[#D1D5DB]">
            <div className="flex p-1 items-center justify-center size-7">
              <Info size={20} className="text-[#4B5563]" />
            </div>
            <p className="text-[14px] leading-[21px] text-[#4B5563]">
              Dashworks will only show each user content they already have access to in
              Notion. Users will not see anyone else&apos;s private content.
            </p>
          </div>
          
          <p className="text-[14px] leading-[21px] text-[#111827]">
            Follow the set-up process in order to connect Notion to Dashworks. If you run into
            difficulty reach out to <a href="#" className="text-[#972AA1] hover:underline">Support</a>.
          </p>

          {/* Install Dashworks Extension */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#D1D5DB] text-[#4B5563]">
                1
              </div>
              <h3 className="text-base leading-6 font-semibold text-[#111827]">Install Dashworks Extension</h3>
            </div>
            <p className="mt-3 text-[14px] leading-[21px] text-[#4B5563]">
              Notion connection requires the Dashworks browser extension. Please contact support if
              you have questions.
            </p>
            <button className="mt-3 px-4 py-2 rounded-md text-[14px] leading-[21px] border bg-[#FFFFFF] border-[#D1D5DB] text-[#4B5563] active:bg-[#E5E7EB]">
              Install Extension
            </button>
          </div>

          {/* Grant Notion access */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#D1D5DB] text-[#4B5563]">
                2
              </div>
              <h3 className="text-base leading-6 font-semibold text-[#111827]">Grant Notion access</h3>
            </div>
            <p className="mt-3 text-[14px] leading-[21px] text-[#4B5563]">
              Click Connect and select the pages Dash works can search. We recommend selecting all
              top-level pages for complete results.
            </p>
          </div>
        </div>
        
        {/* Modal footer */}
        <div className="flex justify-end items-center px-6 pb-4 pt-2 gap-3">
          <button className="px-[14px] py-1 text-[14px] leading-[24px] border rounded-md bg-[#FFFFFF] border-[#D1D5DB] text-[#4B5563] active:bg-[#E5E7EB]">
            Cancel
          </button>
          <button className="px-[14px] py-1 text-[14px] leading-[24px] rounded-md bg-[#4F0D52] text-white hover:bg-[#3D0A3F]">
            Connect
          </button>
        </div>
      </div>
    </motion.div>
  );
} 