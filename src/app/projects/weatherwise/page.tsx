"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Quotes, ChartBar, ImageSquare, RedditLogo } from '@phosphor-icons/react';
import Image from 'next/image';
import MediaCard from '@/components/MediaCard';
import ProjectHeader from '@/components/ProjectHeader';
import Footer from '@/components/Footer';

// Import the project data
import { projectsData } from '@/data/projectsData';

export default function WeatherWiseProject() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Get the WeatherWise project data
  const project = projectsData[3]; // WeatherWise is now the fourth project in the array

  return (
    <div className="min-h-screen flex justify-center bg-gray-50">
      <main className="w-full max-w-[800px] flex flex-col gap-12">
        <div className="flex flex-col gap-12 items-start md:pt-24 pt-8 md:px-0 p-4 md:pb-24 pb-24">
          {/* Back button and header */}
            <ProjectHeader title={project.title} />

          {/* Project content */}
          <div className="w-full flex flex-col gap-16">
            {/* Main image display */}
            <div className="w-full flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full aspect-[4/3] rounded-3xl border border-stone-200 overflow-hidden mb-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]"
            >
              <Image
                src={project.images[selectedImageIndex + 1]}
                alt={`${project.title} - main image`}
                className="w-full h-full object-cover bg-stone-100"
                width={1200}
                height={800}
                priority={selectedImageIndex === 0}
                quality={90}
                sizes="(max-width: 768px) 100vw, 800px"
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
                    loading="lazy"
                    quality={75}
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
                <div>
                  <h2 className="text-subheader mb-1">My Role</h2>
                  <p className="text-body">Product Designer</p>
                </div>
                <div>
                  <h2 className="text-subheader mb-1">Timeline</h2>
                  <p className="text-body">16th Jan 2024</p>
                </div>
                <div>
                  <h2 className="text-subheader mb-1 ">Project Setup</h2>
                  <p className="text-body">24hr Sprint</p>
                </div>
              </div>
            </motion.div>
            </div>

            {/* Project overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col gap-2"
            >
              
              <h2 className="text-header text-gradient-primary text-pretty">Improving Navigational Safety with Weather-Adaptive Routing in Google Maps</h2>
              <p className="text-body">Over a 24 hr period, I undertook a design exercise to integrate real-time weather data into Google Maps. This project was a straightforward attempt to enhance route planning by adding weather alerts and alternative route suggestions, aimed at subtly improving user safety.</p>
                
            </motion.div>

            {/* Inspiration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col gap-2"
            >
              <h2 className="text-header text-gradient-primary">A Personal Alarm and A Common Struggle</h2>
              <div className='text-body'>The project kicked off because of an accident my friend had, which was a big wake-up call for me. But there was more to it. Imagine trying to drive in the Northeast during the cold months. The roads can be really unpredictable because of the weather - like sudden snow or ice. It&apos;s pretty stressful not knowing what you&apos;ll face. So, I thought, why not create something that helps drivers know the weather ahead of time? This way, they can be better prepared or choose a safer route.</div>
              <MediaCard
                mediaType="image"
                src="/images/projects/Weatherwise/Car_accident.jpg"
                aspectClass="aspect-4/3"
                caption="The project kicked off because of an accident my friend had, which was a big wake-up call for me."
                className=""
              />
               

             
            </motion.div>

            {/* Quick Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col gap-6"
            >
              <h2 className="text-header text-gradient-primary">Quick Statistics</h2>

              <div className="flex flex-col gap-2">
                <div className='relative col-span-1 w-full my-3 bg-white rounded-xl outline outline-stone-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.07)]'>
                  <div className='flex items-center justify-start p-[1px] pb-0.5 border-dashed border-b border-stone-100 top-0 left-0 right-0'>
                    <div className='relative flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ChartBar size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-y-0 left-[30px] border-dashed border-l border-stone-100'></div>
                    <div className='absolute inset-y-0 right-[30px] border-dashed border-l border-stone-100'></div>
                  </div>
                  
                  <div className='px-11 pb-11 mt-2 space-y-2'>
                    <div className='flex text-stone-800 font-semibold mt-4'>Annual Fatality Comparison</div>
                    <div className='text-body'>The data reveals that weather-related car crashes cause approximately 15 times more fatalities annually than all major weather disasters combined in the United States.</div>
                    <div className='isolate relative flex items-center justify-start p-4 md:text-lg text-sm font-semibold text-white w-full h-16 bg-gradient-to-b from-blue-500 to-blue-700 border border-blue-500 mt-3 mb-5 rounded-2xl overflow-hidden'>
                      <div className='absolute bg-[url(/svgs/diagonal-stripes.svg)] opacity-40 inset-0 bg-repeat -z-10'></div>
                      <div className='absolute inset-x-1 top-0.5 h-1/2 sm bg-gradient-to-b from-white/40 to-white/20 rounded-t-xl rounded-b-md'></div>
                      5,376-5,900 due to Weather-Related Car Crashes
                    </div>
                    <div className='isolate relative flex items-center justify-start h-16 my-3'>
                      <div className='isolate absolute flex items-center justify-start text-lg font-semibold p-4 text-white w-[7%] h-16 bg-gradient-to-b from-blue-500 to-blue-700 border border-blue-500 rounded-2xl overflow-hidden'>
                        <div className='absolute bg-[url(/svgs/diagonal-stripes.svg)] opacity-40 inset-0 bg-repeat -z-10'></div>
                        <div className='absolute inset-x-1 top-0.5 h-1/2 bg-gradient-to-b from-white/40 to-white/20 rounded-t-xl rounded-b-md'></div>
                        <div className='absolute w-20 md:text-lg text-sm left-4 top-1/2 -translate-y-1/2'>375-379</div>
                      </div>
                      <div className='absolute md:text-lg text-sm font-semibold w-fit left-4 top-1/2 -translate-y-1/2 text-blue-500 -z-10'>375-379 due to Large-Scale Weather Disasters</div>
                    </div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-stone-100'></div>
                  </div>
                </div>

                <div className='relative col-span-1 w-full my-3 bg-white rounded-xl outline outline-stone-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.07)]'>
                  <div className='flex items-center justify-start p-[1px] pb-0.5 border-dashed border-b border-stone-100 top-0 left-0 right-0'>
                    <div className='relative flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ChartBar size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-y-0 left-[30px] border-dashed border-l border-stone-100'></div>
                    <div className='absolute inset-y-0 right-[30px] border-dashed border-l border-stone-100'></div>
                  </div>
                  
                  <div className='px-11 pb-11 mt-2 space-y-2'>
                    <div className='flex text-stone-800 font-semibold mt-4'>Significance of Rain and Snowy Conditions</div>
                    <div className='text-body'>Weather conditions significantly impact road safety, with a substantial portion of crashes occurring during adverse weather.</div>
                    <div className='md:grid md:grid-cols-2 flex flex-col gap-4 mt-8'>
                      <div className='text-body'>
                        <p className='text-3xl font-semibold text-blue-500 mb-2'>21%</p>
                        <p>of the car crashes are weather-related.</p>
                      </div>
                      <div className='text-body'>
                        <p className='text-3xl font-semibold text-blue-500 mb-2'>418,000</p>
                        <p>people are injured in crashes that occurred in snowy or icy conditions, Annually.</p>
                      </div>
                    </div>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-stone-100'></div>
                  </div>
                </div>
              </div>

              {/* Problem Statement */}
              <div className="flex flex-col gap-2">
                <h2 className="text-important">Problem Statement</h2>
                <p className="text-body">Despite technological advancements, unpredictable weather still surprises us on the road, creating a clear disconnect.</p>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-important">Key takeaway from Secondary Research</h2>
                <p className="text-body">Drivers often face sudden weather changes that turn routine trips into risky journeys, yet many Reddit users highlight the lack of real-time weather alerts in navigation apps, emphasizing the need for safer, weather-aware routing.</p>
              </div>

              <div className="flex flex-col gap-2">
              <h2 className='text-important'>A Shared Concern of Unpredictable Weather on the Road on Reddit</h2>
              <div className='md:grid md:grid-cols-2 flex flex-col gap-6 my-3'>

                {/* reddit post 1 */}
                <div className='relative col-span-1 w-full rounded-xl border border-stone-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.07),0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]'>
                  
                  <div className=' flex items-center justify-start p-[1px] pb-0.5 border-dashed border-b border-stone-200'>
                    <div className='relative flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-orange-300 via-orange-500 to-orange-700  shadow-[0px_2px_2px_-1px_rgba(203,97,0,0.25),0px_4px_8px_1px_rgba(203,97,0,0.15)_inset,0px_-2px_2px_0px_rgba(203,97,0,0.15)_inset]  border border-orange-500'>
                    <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60  to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                    <RedditLogo size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-y-0 left-[30px] border-dashed border-l border-stone-200'></div>
                    <div className='absolute inset-y-0 right-[30px] border-dashed border-l border-stone-200'></div>
                  </div>
                  <div className='px-11 pb-11 mt-2 space-y-2'>
                    <h2 className='font-sans font-semibold text-stone-800 leading-8'>Weather Warnings missing from Waze</h2>
                    <p className='text-body'>I vividly remember the day I narrowly avoided driving straight into a severe thunderstorm, thanks to a quick check on my weather app. It struck me then how invaluable it would be to have these alerts directly in our navigation systems.</p>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-stone-200'></div>
                  </div>
                </div>

                {/* reddit post 2 */}
                <div className='relative col-span-1 w-full rounded-xl border border-stone-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.07),0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]'>
                  
                  <div className=' flex items-center justify-start p-[1px] pb-0.5 border-dashed border-b border-stone-200'>
                    <div className='relative flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-orange-300 via-orange-500 to-orange-700  shadow-[0px_2px_2px_-1px_rgba(203,97,0,0.25),0px_4px_8px_1px_rgba(203,97,0,0.15)_inset,0px_-2px_2px_0px_rgba(203,97,0,0.15)_inset]  border border-orange-500'>
                    <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60  to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                    <RedditLogo size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-y-0 left-[30px] border-dashed border-l border-stone-200'></div>
                    <div className='absolute inset-y-0 right-[30px] border-dashed border-l border-stone-200'></div>
                  </div>

                  <div className='px-11 pb-11 mt-2 space-y-2'>
                    <h2 className='font-sans font-semibold text-stone-800 leading-8'>Weather along the route?</h2>
                    <p className='text-body'>Hi, I don&apos;t think Google Maps can show you the weather along your planned router like where it is snowing, where it&apos;s raining, etc. I&apos;m trying to plan 26-hour trip and need to see the weather of all the cities on my route as I travel. Is there any other navigation app which can help me in this regards?</p>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-stone-200'></div>
                  </div>
                </div>

                {/* reddit post 3 */}
                <div className='relative md:col-span-2 w-full rounded-xl border border-stone-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.07),0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]'>
                  
                  <div className=' flex items-center justify-start p-[1px] pb-0.5 border-dashed border-b border-stone-200'>
                    <div className='relative flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-orange-300 via-orange-500 to-orange-700  shadow-[0px_2px_2px_-1px_rgba(203,97,0,0.25),0px_4px_8px_1px_rgba(203,97,0,0.15)_inset,0px_-2px_2px_0px_rgba(203,97,0,0.15)_inset]  border border-orange-500'>
                    <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60  to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                    <RedditLogo size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-y-0 left-[30px] border-dashed border-l border-stone-200'></div>
                    <div className='absolute inset-y-0 right-[30px] border-dashed border-l border-stone-200'></div>
                  </div>

                  <div className='px-11 pb-11 mt-2 space-y-2'>
                    <h2 className='font-sans font-semibold text-stone-800 leading-8'>Real time weather</h2>
                    <p className='text-body'>I have always wondered why an integrated weather alert system couldn&apos;t be applied. For example, last summer I was on a long road trip driving west across Tennessee. The clouds ahead were very dark so I asked my son to check the weather app. Sure enough we were under a severe thunderstorm earning with high wind and hail. We pulled over to a safe location. Had we not looked, we would have been in the middle of it. I get the community reported weather, but if it knows my route and there is a warning issued for something, it would be very helpful to be warned.</p>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-stone-200'></div>
                  </div>
                </div>

                  
              </div>

              </div>

              <div className='flex flex-col gap-1'>

              <h2 className='text-important'>How People deal with this currently</h2>
              <p className='text-body'>During my NYC trip, I utilized a weather app and maps to find safer routes, a simple yet effective approach. I noticed this pattern among other users as well. However, this method is not foolproof, as weather is not static but continually changes.  It&apos;s a band-aid solution that many have adopted, yet it&apos;s far from ideal.</p> 
              <div className='grid grid-cols-2 gap-6 my-3'>
                {/* reddit post */}
                <div className='relative col-span-2 w-full rounded-xl border border-stone-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.07),0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]'>
                  
                  <div className=' flex items-center justify-start p-[1px] pb-0.5 border-dashed border-b border-stone-200'>
                    <div className='relative flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-orange-300 via-orange-500 to-orange-700  shadow-[0px_2px_2px_-1px_rgba(203,97,0,0.25),0px_4px_8px_1px_rgba(203,97,0,0.15)_inset,0px_-2px_2px_0px_rgba(203,97,0,0.15)_inset]  border border-orange-500'>
                    <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60  to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                    <RedditLogo size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    <div className='absolute inset-y-0 left-[30px] border-dashed border-l border-stone-200'></div>
                    <div className='absolute inset-y-0 right-[30px] border-dashed border-l border-stone-200'></div>
                  </div>

                  <div className='px-11 pb-11 mt-2 space-y-2'>
                    <h2 className='font-sans font-semibold text-stone-800 leading-8'>Checking Hourly Forecasts</h2>
                    <p className='text-body'>I would screenshot the hourly forecast for the areas you&apos;ll pass through showing the time you expect to pass through, and I would do it the day before you leave.</p>
                    <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-stone-200'></div>
                  </div>
                </div>
                
              </div>

              </div>
 
            </motion.div>

            

            

            


            {/* Crafting Intuitive Weather-Aware Routing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col gap-6"
            >

              <div className="flex flex-col gap-2">
                <h2 className="text-header text-gradient-primary">Crafting Intuitive Weather-Aware Routing</h2>
                <p className="text-body">Throughout the development of this weather-informed routing feature, I engaged in a dynamic design process that unfolded across three pivotal stages. Each stage brought us closer to a design that not only delivers critical information but does so in a way that feels intuitive and reassuring to users.</p>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-important">Weather Condition Alerts on Map</h2>
                <div className='text-body'>Notifying users of any adverse weather conditions along their planned route. The map visually distinguishes these areas with clear highlighting and warning icons, ensuring that users are aware of potential risks before they encounter them.</div>

                {/* Iteration 1 */}
                <div className='flex flex-col gap-2 my-3'>
                  <h2 className="text-subheader">Iteration 1</h2>
                  <h2 className="text-important">Navigating Visual Clutter</h2>
                  <div className='text-body'>My first attempt was to signal weather conditions with a circular overlay. Though well-intentioned, this cluttered the interface, especially on smaller screens.</div>
                  <div className='isolate relative flex rounded-xl bg-white overflow-hidden my-3 outline outline-stone-200'>
                    <div className='w-full h-full aspect-square relative'>
                      <Image
                        src="/images/projects/Weatherwise/Circular-overlay-focused.png"
                        alt="Circular overlay design iteration"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        loading="lazy"
                        quality={85}
                      />
                    </div>
                    <div className='w-full h-full aspect-square relative'>
                      <Image
                        src="/images/projects/Weatherwise/cloud-overaly-focused.png"
                        alt="Cloud overlay design iteration"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        loading="lazy"
                        quality={85}
                      />
                    </div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    
                  </div>
                </div>

                {/* Iteration 2 */}
                <div className='flex flex-col gap-2 my-3'>
                  <h2 className="text-subheader">Iteration 2</h2>
                  <h2 className="text-important">Mixing Traffic and Weather Alerts Caused Confusion</h2>
                  <div className='text-body'>Next, I tried color codes for traffic and badges for weather. This led to confusion, mixing up weather alerts with traffic info—a valuable lesson in the importance of clear visual language.</div>
                  <div className='isolate relative flex rounded-xl bg-white overflow-hidden my-3 outline outline-stone-200'>
                    <div className='w-full h-full aspect-square relative'>
                      <Image
                        src="/images/projects/Weatherwise/Same-line-traffic.png"
                        alt="Traffic and weather alerts on same line"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        loading="lazy"
                        quality={85}
                      />
                    </div>
                    <div className='w-full h-full aspect-square relative'>
                      <Image
                        src="/images/projects/Weatherwise/Same-line-Weather.png"
                        alt="Weather alerts mixed with traffic"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        loading="lazy"
                        quality={85}
                      />
                    </div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                    
                  </div>
                  {/* Quote */}
                  <div className='relative bg-white col-span-2 w-full rounded-xl border border-stone-100 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.07),0px_4px_4px_-2px_rgba(0,0,0,0.15)] my-3'>
                      
                      <div className=' flex items-center justify-start p-[1px] pb-0.5 border-dashed border-b border-stone-100'>
                        <div className='relative flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700  shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset]  border border-blue-500'>
                        <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60  to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                        <Quotes size={16} weight="fill" className='text-white mt-[1px] mx-1 rotate-180' />
                        </div>
                        <div className='absolute inset-y-0 left-[30px] border-dashed border-l border-stone-100'></div>
                        <div className='absolute inset-y-0 right-[30px] border-dashed border-l border-stone-100'></div>
                      </div>

                      <div className='flex flex-col gap-2 px-11 pb-11 mt-2'>
                        <p className='text-important italic text-2xl font-medium'>I was confused by the color codes, thinking they were traffic alerts.</p>
                        <p className='text-body leading-7 text-lg'>- User</p>
                        <div className='absolute inset-x-0 bottom-8 border-dashed border-b border-stone-100'></div>
                      </div>  
                  </div>
                  
                </div>

                {/* Iteration 3 */}
                <div className='flex flex-col gap-2 my-3'>
                  <h2 className="text-subheader">Iteration 3</h2>
                  <h2 className="text-important">Achieving Clarity Through Wrapping</h2>
                  <div className='text-body'>The breakthrough came with a wrapping design for affected roads, clearly separating weather from traffic info. This balance of clarity and intuition was the key, making navigation safer and more straightforward.</div>
                  <div className='isolate relative flex rounded-xl bg-white overflow-hidden my-3 outline outline-stone-200'>
                    <div className='w-full h-full aspect-square relative'>
                      <Image
                        src="/images/projects/Weatherwise/Wrapping-Traffic.png"
                        alt="Wrapping design for traffic alerts"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        loading="lazy"
                        quality={85}
                      />
                    </div>
                    <div className='w-full h-full aspect-square relative'>
                      <Image
                        src="/images/projects/Weatherwise/Wrapping-weather.png"
                        alt="Wrapping design for weather alerts"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        loading="lazy"
                        quality={85}
                      />
                    </div>
                    <div className='absolute top-[1px] left-[1px] flex items-center justify-center size-7 text-white rounded-tl-[10px] rounded-sm bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(0,0,0,0.15)_inset,0px_-2px_2px_0px_rgba(0,0,0,0.15)_inset] border border-blue-500'>
                      <div className={`absolute flex inset-[1px] top-[1px] h-1/2 items-center justify-center bg-gradient-to-b from-white/60 to-white/10 rounded-tl-[8px] rounded-[2px] z-10`}></div>
                      <ImageSquare size={16} weight="fill" className='text-white mt-[1px] mx-1' />
                    </div>
                  </div>
                </div>

                

              </div>

              {/* Trip Scheduling with Weather Forecasts */}
            <div className="flex flex-col gap-2">
              <h2 className="text-important">Trip Scheduling with Weather Forecasts</h2>
              <p className="text-body">I introduced a proactive planning tool that integrates weather forecasts with trip scheduling. This feature empowers users to plan their journeys based on anticipated weather conditions, fostering a sense of confidence and control over their travel plans, ensuring they feel secure and comfortable.</p>
              <MediaCard
                mediaType="image"
                src="/images/projects/Weatherwise/WeatherWise-Planning.png"
                aspectClass="aspect-4/3"
                caption="Trip scheduling integrates weather forecasts, empowering users to plan journeys with confidence and comfort."
                className="my-3"
              />
            </div>

            {/* In-Car Weather Change Alerts */}
            <div className="flex flex-col gap-2"
            >
              <h2 className="text-important">In-Car Weather Change Alerts</h2>
              <p className="text-body">This feature keeps drivers updated with real-time weather changes directly on their route, adapting quickly as conditions evolve. It&apos;s designed to enhance road safety, ensuring travelers are never caught off guard by sudden weather shifts.</p>
              <MediaCard
                mediaType="image"
                src="/images/projects/Weatherwise/In-Car-Notification-mockup.webp"
                aspectClass="aspect-3/2"
                caption="In-car notifications keep drivers updated with real-time weather changes along their route."
                className="my-3"
              />
            </div>

            {/* Intuitive Route Option Badges */}
            <div className="flex flex-col gap-2">
              <h2 className="text-important">Intuitive Route Option Badges</h2>
              <p className="text-body">The challenge was to present essential route information in a simplified manner. My solution—a system of easily distinguishable badges for the fastest, safest, and weather-impacted routes—balances clarity with subtlety. This approach enables users to make quick, informed choices without feeling overwhelmed by details. The badges, especially those indicating weather conditions, are designed to offer a quick grasp of how weather might affect each route, enhancing user decision-making with safety and ease at the forefront.</p>
              <MediaCard
                mediaType="image"
                src="/images/projects/Weatherwise/Badge-System.png"
                aspectClass="aspect-7/2"
                caption="Route badges help users quickly identify the fastest, safest, and weather-impacted routes."
                className="my-3"
              />
                  
                  
                
            </div>
              
            </motion.div>

            

            


            
          </div>

          

           {/* Footer */}
           <Footer 
            variant="project"
            projectNavigation={{
              previousProject: {
                name: "Dashworks",
                slug: "dashworks"
              },
              nextProject: {
                name: "Shoedog", 
                slug: "shoedog"
              }
            }}
          />
          

        </div>

        
      </main>
    </div>
  );
} 