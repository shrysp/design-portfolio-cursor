"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ImageSquare } from '@phosphor-icons/react';
import EmailCopyButton from '@/components/EmailCopyButton';
import { LinkedinLogo, XLogo } from '@phosphor-icons/react';
import Image from 'next/image';

// Import the project data
import { projectsData } from '@/data/projectsData';

export default function FractionsProject() {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Get the Fractions project data
  const project = projectsData[4]; // Fractions is the fourth project in the array

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-slate-50 to-white">
      <main className="w-full max-w-[800px] flex flex-col gap-12">
        <div className="flex flex-col gap-12 items-start border-x border-slate-200 md:p-8 p-4 md:pb-24 pb-24 overflow-y-auto scrollbar-hide">
          {/* Back button and header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex w-full items-center gap-4 border-b border-slate-200 pb-4"
          >
            

            <button
                      key="back-button"
                      onClick={() => router.push('/projects')}
                      className="group relative rounded-full p-1 text-slate-500 border border-slate-400 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-amber-900 transition-colors cursor-pointer active:scale-95 hover:bg-[radial-gradient(at_50%_75%,theme(colors.amber.300),theme(colors.amber.500),theme(colors.amber.400))] active:scale-95 transition-all duration-300 hover:shadow-[0px_2px_2px_-1px_rgba(193,0,7,0.25),0px_4px_8px_1px_rgba(193,0,7,0.25)_inset,0px_-2px_2px_0px_rgba(193,0,7,0.25)_inset] hover:border-amber-700 transition-all duration-300"
                      aria-label="Back"
                    >
                      <div className="absolute bg-gradient-to-b from-white/90 to-white/5 rounded-b-[4px] rounded-t-[12px] group-hover:from-slate-100/70 group-hover:to-slate-100/20 inset-x-[3px] top-0.5 h-1/2 transition-all duration-300"></div>
                      <ArrowLeft size={20} weight="bold" />
            </button>

            <h1 className="text-[24px] font-bold text-slate-800">
              {project.title}
            </h1>
          </motion.div>

          {/* Project content */}
          <div className="w-full flex flex-col gap-24">


            <div className="w-full flex flex-col gap-2">
              {/* Main image display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full aspect-[4/3] rounded-3xl border border-slate-200 overflow-hidden mb-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]"
              >
                <Image
                  src={project.images[selectedImageIndex + 1]}
                  alt={`${project.title} - main image`}
                  className="w-full h-full object-cover bg-slate-100"
                  width={1200}
                  height={800}
                  priority={selectedImageIndex === 0}
                />
              </motion.div>

              {/* Image thumbnails */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex flex-wrap gap-4 mb-6 overflow-x-auto p-2"
              >
                {project.images.slice(1).map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`md:w-20 md:h-20 w-12 h-12 rounded-lg bg-slate-100 overflow-hidden cursor-pointer transition-all duration-200 ${
                      selectedImageIndex === index
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : 'opacity-70 hover:opacity-100 border border-slate-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${project.title} - thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      width={80}
                      height={80}
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            

            {/* Challenge Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className=""
            >
              <div className="">
                <h2 className="text-base font-semibold text-slate-800 mb-2">Challenge</h2>
                <h3 className="text-base font-semibold text-slate-800 mt-8 mb-2">
                  Addressing Instagram&apos;s addictive design to preserve productivity and social connections without mindless browsing.
                </h3>
                <p className="text-slate-600 leading-7">
                  The social media era has proven to be both a blessing and a curse. Algorithms are causing people to become addicted. Additionally, studies have indicated that users&apos; attention spans are getting shorter. The productivity of the population is being impacted by these factors. This project&apos;s source of inspiration is a personal experience. I wanted to break the cycle and be productive after seeing how much time I squander aimlessly browsing around Instagram and feeling bad for having &quot;wasted&quot; the day. Naturally, I uninstalled the app, but I quickly realized that this was not a workable solution because Instagram is the medium where I keep in touch with the majority of my friends. I needed a way to maintain contact with my pals while also avoiding mindless Instagram surfing. I made the decision to conduct some user interviews in order to learn more about this issue before designing a solution.
                </p>
              </div>
            </motion.div>

            {/* Research Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className=""
            >
              <div className="">
                <h2 className="text-slate-800 font-semibold mb-4">User Research</h2>
                
                <h3 className="text-base font-semibold text-slate-800 mt-8 mb-2">
                  Insights on Instagram Usage
                </h3>
                <p className="text-slate-600 leading-7">
                  I started my research by conducting user interviews with 6 participants. The interviews were to understand how peoples instagram, how it affects their productivity and what people do about improving their productivity. All the interviews were telephonic interviews. The Interviewees&apos; age ranged from 19-23.
                </p>
                <ul className="text-slate-600 leading-7 list-disc pl-5 space-y-2">
                    <li>Nearly all participants admitted that they had uninstalled Instagram at some point in the past in order to increase productivity.</li>
                    <li>Most participants have at some point looked for an alternative to Instagram that restricts its use.</li>
                    <li>Participants claimed that Instagram Direct Messages is the only platform they use to keep in touch with friends.</li>
                    <li>On Instagram DMs, the most frequent interactions are sending and liking posts.</li>
                    <li>Stories are posted by participants more frequently than posts. Stories play a crucial role in keeping connected.</li>
                  </ul>

              </div>

              
            </motion.div>


            {/* */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className=""
            >
              
              <div className="mt-2">
                  <h2 className="text-slate-800 font-semibold mb-4 mt-4">Brainstorming</h2>
                  
                  {/* Online Shoppers Subsection */}
                  <h3 className="text-base font-semibold text-slate-800 mt-8 mb-2">
                  Getting Stared With Pen and Paper
                  </h3>
                  
                  <div className="isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Row 1 */}
                      <div className="aspect-square  rounded-lg overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-1.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      
                      {/* Row 2 */}
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-2.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-3.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      
                      {/* Row 3 */}
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-4.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-5.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      
                      {/* Row 4 */}
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-6.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-7.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      
                      {/* Row 5 */}
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-8.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-9.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                    </div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                  </div>
                  
                  
                  
              </div>
            </motion.div>


            {/* User Journey Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className=""
            >
              
              <div className="mt-2">
                  <h2 className="text-slate-800 font-semibold mb-4 mt-4">Finding feasibility for some UI Ideas                  </h2>
                  
                  {/* Online Shoppers Subsection */}
                  <h3 className="text-base font-semibold text-slate-800 mt-8 mb-2">
                    Revamping Chat Interface Components
                  </h3>
                  <p className="text-slate-600 leading-7">
                  Implementing some of the ideas generated during brainstorming sessions It was required to rearrange the chat box. Every section contains a few crucial components, each of which serves a certain function.Some of the earliest experiments made for the design of chat boxes are shown in the image below.
                  </p>
                  
                  <div className="isolate relative rounded-xl p-12 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                  <div className='w-full h-full aspect-7/5 p-8 bg-[url("/images/projects/Fraction/Ideation-1.png")] bg-cover bg-center'></div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                  </div>
                  
                  
                  <p className="text-slate-600 leading-7 mt-8 mb-2">
                  How can we rearrange this section?
                  </p>
                  
                  <div className="isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                  <div className='w-full h-full aspect-square p-8 bg-[url("/images/projects/Fraction/Ideation-2.png")] bg-cover bg-center'></div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                  </div>
                  
                 
                  <p className="text-slate-600 leading- mt-8 mb-2">
                    After doing some initial exploration, I created several low-fidelity cards to see how the cards&apos; structure affected readability at various sizes.
                  </p>
                  
                  <div className="isolate relative rounded-xl p-12 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                    <div className='w-full h-full aspect-7/10 bg-[url("/images/projects/Fraction/Compare-sizes.png")] bg-cover bg-center'></div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                  </div>

                  <p className="text-slate-600 leading- mt-8 mb-2">
                  As seen in the image above the square box with center aligned elements give better results in terms of readability compared to other. It provides more space for information as the size reduces, while center alignment gives reduces the wastage of space.
                  </p>
                  
                  <div className="isolate relative rounded-xl p-12 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                    <div className='w-full h-full aspect-5/2 bg-[url("/images/projects/Fraction/Cards.png")] bg-cover bg-center'></div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                  </div>

                  <p className="text-slate-600 leading- mt-8 mb-2">
                    The the final structure of the card is rounded square. It contains all the necessary information. When there is unread message card will have a border and indicator on top left corner. The Boarder around the profile picture indicates that user has posted a story.
                  </p>
                  
                  <div className="isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                    <div className='w-full h-full aspect-4/3 bg-white p-4'>
                      <div className='h-[90%] bg-[url("/images/projects/Fraction/Fractions-Mockup.png")] bg-contain bg-center bg-no-repeat'></div>
                    </div>
                    
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                  </div>

                  <p className="text-slate-600 leading- mt-8 mb-2">
                    In the chat screen chats are arrange in order in which they are received, newest first. The size of the box indicates the frequency of the chat with that user. That way more important and frequently replied messages will be highlighted. This screen only shows messages from close friends. Other chats are hidden in drawer below, these chat won&apos;t be notified.
                  </p>
                  
                  <div className="isolate relative rounded-xl p-8 bg-slate-100 overflow-hidden mt-8 border border-slate-200">
                    <div className='w-full h-full aspect-4/3 bg-white p-4'>
                      <div className='h-[90%] bg-[url("/images/projects/Fraction/Fractions-Thumbnail.png")] bg-contain bg-center bg-no-repeat'></div>
                    </div>
                    
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white  to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-x-0 top-8 border-dashed border-b border-slate-200'></div>
                    <div className='absolute inset-y-0 left-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-y-0 right-8 border-dashed border-l border-slate-200'></div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-slate-200'></div>
                  </div>
                  
              </div>
            </motion.div>



            

            {/* Links */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mt-6"
            >
              <Button
                className="group text-white font-semibold w-full md:w-[240px] h-[36px] bg-gradient-to-b from-slate-700 via-slate-500 to-slate-300 border border-slate-500 rounded-full shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_8px_8px_-4px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-slate-700 active:shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_8px_8px_-4px_rgba(0,0,0,0.0),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] transition-all duration-300 relative overflow-hidden active:bg-gradient-to-b active:from-slate-800 active:via-slate-600 active:to-slate-400 cursor-pointer flex items-center justify-center gap-2"
                onClick={() => window.open(project.github, '_blank')}
              >
                <GithubLogo size={20} weight="fill" />
                GitHub Repository
                <div className="absolute inset-2 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 group-active:from-white/30" />
              </Button>
              <Button
                className="group text-white font-semibold w-full md:w-[240px] h-[36px] bg-gradient-to-b from-blue-700 via-blue-500 to-blue-300 border border-blue-500 rounded-full shadow-[0px_2px_2px_-1px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.0),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.25),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:border-blue-700 active:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.0),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] transition-all duration-300 relative overflow-hidden active:bg-gradient-to-b active:from-blue-800 active:via-blue-600 active:to-blue-400 cursor-pointer flex items-center justify-center gap-2"
                onClick={() => window.open(project.live, '_blank')}
              >
                <Globe size={20} weight="fill" />
                Live Demo
                <div className="absolute inset-2 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 group-active:from-white/30" />
              </Button>
            </motion.div> */}
          </div>

           {/* Footer */}
           <div className="isolate relative flex flex-col-reverse w-full md:col-span-7 col-span-1 h-fit border border-slate-200 rounded-2xl md:p-6 p-4 items-center justify-center gap-2.5">
            <div className='flex flex-col md:flex-row w-full items-start md:items-center gap-3 md:gap-2 md:justify-between'>
              <p className='text-slate-500 text-sm'>© 2025 Shreyas Patil</p>
              <div className='text font-medium text-slate-500 flex items-center'>Made with &nbsp; <span className='text-xs'> ❤️ </span> &nbsp; and &nbsp; <Image src="/images/About/Cursor-Icon.png" alt="Cursor" width={20} height={20} className="h-5 inline-block" /> </div>
            </div>
      

            <div className="flex w-full items-center justify-start gap-3 pb-2.5 border-b border-slate-200">
        
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
            </div>

            <div className='w-full text-slate-500 text-sm flex items-center justify-between mb-6'>

              <div className='flex items-center gap-2'>
              <button
                      key="prev-project-button"
                      onClick={() => router.push('/projects/shoedog')}
                      
                      className="group relative rounded-full p-0.5 text-slate-500 border border-slate-400 bg-[radial-gradient(at_50%_75%,theme(colors.slate.100),theme(colors.slate.200),theme(colors.slate.300))] shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:text-white cursor-pointer hover:bg-[radial-gradient(at_50%_75%,theme(colors.blue.300),theme(colors.blue.500),theme(colors.blue.400))] active:scale-95 hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-blue-700 transition-all duration-300"
                      aria-label="Previous Project"
                    >
                      <div className="absolute bg-gradient-to-b from-white/90 to-white/5 rounded-b-[4px] rounded-t-[12px] group-hover:from-slate-100/70 group-hover:to-slate-100/20 inset-x-[3px] top-0.5 h-1/2 transition-all duration-300"></div>
                      <ArrowLeft size={14} weight="bold" />
              </button>
                <div className='text-xl font-medium'>Shoedog</div>
              </div>


             

              

            </div>
          </div>
          

        </div>

        
      </main>
    </div>
  );
} 