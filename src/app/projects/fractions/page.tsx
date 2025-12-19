"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageSquare } from '@phosphor-icons/react';
import Image from 'next/image';
import MediaCard from '@/components/MediaCard';
import ProjectHeader from '@/components/ProjectHeader';
// Import the project data
import { projectsData } from '@/data/projectsData';

export default function FractionsProject() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Get the Fractions project data
  const project = projectsData[5]; // Fractions is now the sixth project in the array

  return (
    <div className="min-h-screen flex justify-center bg-gray-50">
      <main className="w-full max-w-[800px] flex flex-col gap-12">
        <div className="flex flex-col gap-12 items-start md:pt-24 pt-8 md:px-0 p-4 md:pb-24 pb-24">
          {/* Back button and header */}
          <ProjectHeader 
            title={project.title}
            
          />

          {/* Project content */}
          <div className="w-full flex flex-col gap-16">


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
              className="space-y-2"
            >
              <div className="space-y-2">
                <h2 className="text-header text-gradient-primary">Challenge</h2>
                <h3 className="text-important">
                  Addressing Instagram&apos;s addictive design to preserve productivity and social connections without mindless browsing.
                </h3>
                <p className="text-body">
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
              <div className="space-y-2">
                <h2 className="text-header text-gradient-primary">User Research</h2>
                
                <h3 className="text-important">
                  Insights on Instagram Usage
                </h3>
                <p className="text-body">
                  I started my research by conducting user interviews with 6 participants. The interviews were to understand how peoples instagram, how it affects their productivity and what people do about improving their productivity. All the interviews were telephonic interviews. The Interviewees&apos; age ranged from 19-23.
                </p>
                <ul className="text-body list-disc pl-5 space-y-2">
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
              
              <div className=" space-y-2">
                  <h2 className="text-header text-gradient-primary">Brainstorming</h2>
                  
                  {/* Online Shoppers Subsection */}
                  <h3 className="text-important">
                  Getting Stared With Pen and Paper
                  </h3>
                  
                  <div className="isolate relative rounded-xl bg-gray-100 overflow-hidden my-5 border border-gray-200">
                    <div className="grid grid-cols-2">
                      {/* Row 1 */}
                      <div className="aspect-square  overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      <div className="aspect-square overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-1.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      
                      {/* Row 2 */}
                      <div className="aspect-square overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-2.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      <div className="aspect-square overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-3.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      
                      {/* Row 3 */}
                      <div className="aspect-square overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-4.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      <div className="aspect-square overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-5.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      
                      {/* Row 4 */}
                      <div className="aspect-square overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-6.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      <div className="aspect-square overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-7.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      
                      {/* Row 5 */}
                      <div className="aspect-square overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-8.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                      <div className="aspect-square overflow-hidden">
                        <Image src="/images/projects/Fraction/Brainstorm-9.png" alt="Brainstorm sketch" width={400} height={400} className="w-full h-full bg-white object-cover" />
                      </div>
                    </div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    
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
              
              <div className="space-y-2">
                  <h2 className="text-header text-gradient-primary">Finding feasibility for some UI Ideas                  </h2>
                  
                  {/* Online Shoppers Subsection */}
                  <h3 className="text-important">
                    Revamping Chat Interface Components
                  </h3>
                  <p className="text-body">
                  Implementing some of the ideas generated during brainstorming sessions It was required to rearrange the chat box. Every section contains a few crucial components, each of which serves a certain function.Some of the earliest experiments made for the design of chat boxes are shown in the image below.
                  </p>
                  
                  <MediaCard
                    mediaType="image"
                    src="/images/projects/Fraction/Ideation-1.png"
                    aspectClass="aspect-[3/2.1]"
                    className="my-5"
                  />
                  
                  
                  <p className="text-body my-5">
                  How can we rearrange this section?
                  </p>
                  
                  <MediaCard
                    mediaType="image"
                    src="/images/projects/Fraction/Ideation-2.png"
                    aspectClass="aspect-square"
                    className="my-5"
                  />
                  
                 
                  <p className="text-body my-5">
                    After doing some initial exploration, I created several low-fidelity cards to see how the cards&apos; structure affected readability at various sizes.
                  </p>
                  
                  <MediaCard
                    mediaType="image"
                    src="/images/projects/Fraction/Compare-sizes.png"
                    aspectClass="aspect-[7/10]"
                    className="my-5"
                  />

                  <p className="text-body my-5">
                  As seen in the image above the square box with center aligned elements give better results in terms of readability compared to other. It provides more space for information as the size reduces, while center alignment gives reduces the wastage of space.
                  </p>
                  
                  <MediaCard
                    mediaType="image"
                    src="/images/projects/Fraction/Cards.png"
                    aspectClass="aspect-[5/2]"
                    className="my-5"
                  />

                  <p className="text-body my-5">
                    The the final structure of the card is rounded square. It contains all the necessary information. When there is unread message card will have a border and indicator on top left corner. The Boarder around the profile picture indicates that user has posted a story.
                  </p>
                  
                  {/* <MediaCard
                    mediaType="image"
                    src="/images/projects/Fraction/Fractions-Mockup.png"
                    aspectClass="aspect-3/4"
                    className="mt-8 content-fit"
                  /> */}

                  <p className="text-body my-5">
                    In the chat screen chats are arrange in order in which they are received, newest first. The size of the box indicates the frequency of the chat with that user. That way more important and frequently replied messages will be highlighted. This screen only shows messages from close friends. Other chats are hidden in drawer below, these chat won&apos;t be notified.
                  </p>
                  
                  <MediaCard
                    mediaType="image"
                    src="/images/projects/Fraction/Fractions-Thumbnail.png"
                    aspectClass="aspect-4/3"
                    className="my-5"
                  />
                  
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

        </div>

        
      </main>
    </div>
  );
} 