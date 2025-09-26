"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Notepad 
} from '@phosphor-icons/react';
import Image from 'next/image';
import MediaCard from '@/components/MediaCard';
import ProjectHeader from '@/components/ProjectHeader';
import Footer from '@/components/Footer';

// Import the project data
import { projectsData } from '@/data/projectsData';

export default function ShoedogProject() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Get the Shoedog project data (Assuming it's index 3 based on original file)
  const project = projectsData[4]; // Shoedog is now the fifth project in the array

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full aspect-[4/3] rounded-2xl border border-gray-200 overflow-hidden mb-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.07)]"
            >
              <Image
                src={project.images[selectedImageIndex + 1]}
                alt={`${project.title} - main image`}
                className="w-full h-full object-cover bg-gray-100"
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
                  className={`md:w-20 md:h-20 w-12 h-12 rounded-lg bg-gray-100 overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedImageIndex === index
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : 'opacity-70 hover:opacity-100 border border-gray-200'
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

            {/* Role and Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className=""
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h2 className="text-subheader">My Role</h2>
                  <p className="text-body">Product Designer</p>
                </div>
                <div className="space-y-2">
                  <h2 className="text-subheader">Timeline</h2>
                  <p className="text-body">16th Jan 2024</p>
                </div>
                <div className="space-y-2">
                  <h2 className="text-subheader">Project Setup</h2>
                  <p className="text-body">24hr Sprint</p>
                </div>
              </div>
            </motion.div>
            </div>

            

            {/* Challenge Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className=""
            >
              <div className="space-y-2">
                <h2 className="text-header text-gradient-primary">Challenge</h2>
                <p className="text-body">
                  The majority of shoe shoppers still prefer brick and mortar stores, but how do we bring them into the digital age?
                </p>
              </div>
            </motion.div>

            {/* Research Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="space-y-2"
            >
              <div className="space-y-2">
                <h2 className="text-header text-gradient-primary">Research: Understanding Trust Barriers</h2>
                <div>
                  <ul className="text-body list-none space-y-2">
                    <li><strong>Objective:</strong> Understanding Trust Barriers</li>
                    <li><strong>Method:</strong> Survey followed by interviews</li>
                    <li><strong>Survey Participants:</strong> 23</li>
                    <li><strong>Interview Participants:</strong> 5 offline shoppers</li>
                    <li><strong>Age Range:</strong> 19-25</li>
                  </ul>
                  
                </div>
              </div>

              {/* Research Finding - Quote Style */}
               <div className='relative col-span-2 w-full rounded-2xl border border-gray-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.07)] mb-3 mt-5 bg-gray-100'>
                   <div className=' flex items-center justify-start p-[1px] pb-0.5 border-dashed border-b border-gray-200'>
                     <div className='relative flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700  shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset]  border border-blue-500'>
                     <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60  to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                     <Notepad size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                     </div>
                     <div className='absolute inset-y-0 left-[31px] border-dashed border-l border-gray-200'></div>
                     <div className='absolute inset-y-0 right-[31px] border-dashed border-l border-gray-200'></div>
                   </div>
                   <div className='flex flex-col space-y-2 px-11 pb-11 mt-2'>
                    <h2 className="text-gray-800 font-semibold mt-4">Key Finding</h2>
                     <p className='text-gray-600 font-serif italic font-medium text-xl leading-relaxed'>
                       Offline shoppers harbor trust issues with online shoe purchases, primarily fearing incorrect fit and subpar quality.
                     </p>
                     <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-gray-200'></div>
                   </div>
               </div>
            </motion.div>


            {/* User Journey Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className=" space-y-2"
            >
              
              <div className="space-y-12">
                  <h2 className="text-header text-gradient-primary">User Journey: Navigating Shopper Emotions</h2>
                  
                  {/* Online Shoppers Subsection */}
                  <div className="space-y-2">
                  <h3 className="text-important">
                    Online shoppers: Browsing Buzz vs. Arrival Anticlimax
                  </h3>
                  <p className="text-body">
                    Online shoppers often feel a lack of excitement when receiving their shoes as compared to offline shoppers. The high of the journey often comes during browsing of the shoe.
                  </p>
                  
                  <MediaCard
                    mediaType="image"
                    src="/images/projects/ShoeDog/Online-User-Journey.webp"
                    aspectClass="aspect-4/3"
                    caption="Online shoppers experience high excitement during browsing but feel less excitement upon receiving their shoes"
                    className="my-5"
                  />
                  </div>
                  
                  {/* Offline Shoppers Subsection */}
                  <div className="space-y-2">
                  <h3 className="text-important">
                    Offline shoppers: The Joy of Discovery
                  </h3>
                  <p className="text-body">
                    Offline shoppers have a difficult time finding the perfect pair. But the joy of finding a perfect pair is high point of the journey.
                  </p>
                  
                  <MediaCard
                    mediaType="image"
                    src="/images/projects/ShoeDog/Offline-User-Journey.webp"
                    aspectClass="aspect-4/3"
                    caption="Offline shoppers experience the joy of discovery when finding the perfect pair in person"
                    className="my-5"
                  />
                  </div>
                  
                  {/* Psychology Principles Subsection */}
                  <div className="space-y-2">
                  <h3 className="text-important">
                    Psychology Principles
                  </h3>
                  <p className="text-body">
                    Offline shoe shoppers just love that feeling of finding the perfect pair in person, making it tough to get them to switch to online shopping. But by using psychology tricks like the peak-end rule and the mere exposure effect, a shoe shopping app can create a similar emotional experience and make online shopping more appealing.
                  </p>
                  
                  <MediaCard
                    mediaType="image"
                    src="/images/projects/ShoeDog/Valley.webp"
                    aspectClass="aspect-4/3"
                    caption="Psychology principles: Peak-end rule and mere exposure effect applied to shoe shopping experience"
                    className="my-5"
                  />
                  </div>
                  
              </div>
            </motion.div>


            {/* Solution Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className=""
            >
               
              <div className="space-y-2">
                <h2 className="text-header text-gradient-primary">Solution: Try, Triumph, and Take Home</h2>
                <p className="text-body">
                  Say goodbye to the hassle of searching for shoes in store after store! With this app, you can have up to 3 pairs delivered right to your nearest store, so you can try them on and find the perfect fit. No more endless searching, just the joy of finding your dream shoes in person.
                </p>
                
                {/* New User Journey Subsection */}
                <div className="space-y-2">
                <h3 className="text-important">
                  New User Journey
                </h3>
                
                <MediaCard
                  mediaType="image"
                  src="/images/projects/ShoeDog/New-User-Journey.webp"
                  aspectClass="aspect-4/3"
                  caption="New user journey: Try, Triumph, and Take Home - delivering shoes to store for in-person fitting"
                  className="my-5"
                />
                </div>
                
              </div>
            </motion.div>

            {/* Visual Design Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.55 }}
              className=""
            >
              
              <div className="space-y-2">
                 <h2 className="text-header text-gradient-primary">Visual Design</h2>
                
                {/* Wireframes Subsection */}
                <div className="space-y-2">
                <h3 className="text-important">
                  Wireframes
                </h3>
                <p className="text-body">
                  This level was about adapting designs to different contexts and environments, particularly for theming in light and dark modes for both the products. It was a step towards making design not just visually appealing, but also responsive and user-centric.
                </p>
                
                <MediaCard
                  mediaType="image"
                  src="/images/projects/ShoeDog/Wireframes.webp"
                  aspectClass="aspect-3/4"
                  caption="Wireframes showing the app's structure and layout for different contexts and environments"
                  className="my-5"
                />
                </div>
                
                 {/* Moodboard Subsection */}
                <div className="space-y-2">
                <h3 className="text-important">
                  Moodboard
                </h3>
                <p className="text-body">
                  The transparent Air Max shoes are so cool because you can see all the tech inside, and those glowing Nike Adapt shoes are like something out of a sci-fi movie! I wanted to capture that same futuristic vibe in the visual design of my project. To make a mood board that really pops, I used AI image generation to find all kinds of awesome pictures that have that same edgy, high-tech feel. The end result is a look that&apos;s totally fresh and exciting, just like those iconic Nike designs.
                </p>
                
                <MediaCard
                  mediaType="image"
                  src="/images/projects/ShoeDog/Moodboard.png"
                  aspectClass="aspect-7/2"
                  caption="Moodboard capturing the futuristic vibe inspired by transparent Air Max and glowing Nike Adapt shoes"
                  className="my-5"
                />
                </div>
                
                 {/* Mockups Subsection */}
                <div className="space-y-2">
                <h3 className="text-important">
                  Mockups
                </h3>
                
                <MediaCard
                  mediaType="image"
                  src="/images/projects/ShoeDog/Shoedog-Mockup.webp"
                  aspectClass="aspect-4/3"
                  caption="Final mockups showcasing the Shoedog app's interface and user experience"
                  className="my-5"
                />
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
           <Footer 
            variant="project"
            projectNavigation={{
              previousProject: {
                name: "WeatherWise",
                slug: "weatherwise"
              },
              nextProject: {
                name: "Fractions", 
                slug: "fractions"
              }
            }}
          />
          

        </div>

        
      </main>
    </div>
  );
} 