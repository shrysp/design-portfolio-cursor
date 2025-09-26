"use client";

import { motion } from 'framer-motion';
import Footer from '@/components/Footer';
import ModalGrid from '@/components/ModalGrid';
import Image from 'next/image';
import MediaCard from '@/components/MediaCard';



//adding a comment
// Main page container variants for staggered loading
const pageContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

// Individual section variants with blur
const sectionVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { 
      duration: 0.4,
      ease: "easeOut" as const
    }
  }
};

// Three images stagger variants
const imagesContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const imageVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 0.5,
      ease: "easeOut" as const
    }
  }
};

export default function Home() {

  return (
    <div className="min-h-screen flex justify-center">
      <main className="relative w-full md:max-w-[800px] max-w-[361px]">

        <motion.div 
          className="relative flex flex-col gap-16 items-start md:pt-16 pt-8 md:px-0 px-4 md:pb-24 pb-24"
          variants={pageContainerVariants}
          initial="hidden"
          animate="visible"
        >
          
          <motion.div
            variants={sectionVariants}
            className=""
          >
            {/* top */}
            <div className='flex flex-col gap-4 text-gray-800'>
                  <div className="space-y-0">
                    <span className="text-page-header text-gradient-primary ">Shreyas Patil</span>
                    <div className="text-caption">Product Designer</div>
                  </div>

                  <p className="text-important">Exploring how humans and computers connect and building the interfaces in between. Based in the Bay Area</p>

                  <motion.div 
                    className='w-full grid grid-cols-3 gap-4'
                    variants={imagesContainerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={imageVariants}>
                      <MediaCard
                        mediaType="image"
                        src="/images/About/About-1.jpeg"
                        aspectClass="aspect-square"
                        rightIcon={<Image src="/logos/Create with Play Logo.png" alt="Create with Play Logo" width={20} height={20} className="object-contain" />}
                      />  
                    </motion.div>

                    <motion.div variants={imageVariants}>
                      <MediaCard
                        mediaType="image"
                        src="/images/About/About-2.jpeg"
                        aspectClass="aspect-square"
                        rightIcon={<Image src="/logos/Swift Icon.svg" alt="Swift Icon" width={20} height={20} className="object-contain" />}
                      />
                    </motion.div>

                    <motion.div variants={imageVariants} className="">
                      <MediaCard
                        mediaType="image"
                        src="/images/About/About-3.jpeg"
                        aspectClass="aspect-square"
                        rightIcon={<Image src="/logos/Create with Play Logo.png" alt="Create with Play Logo" width={20} height={20} className="object-contain " />}
                      />
                    </motion.div>

                  </motion.div>
                  
                
            </div>        
          </motion.div>

          {/* Main section */}
          <motion.div 
            className="flex flex-col gap-4 w-full"
            variants={sectionVariants}
          >

              {/* Section heading */}
              <h1 className="text-subheader "> 
                What I Do Best
              </h1>
              

              {/* Content grid */}
              <div className='w-full flex flex-col gap-4'>
                  <div className="w-full flex flex-col gap-1 items-start">
                    <h2 className="text-header text-gradient-primary ">Turning Ideas into Interactive Prototypes</h2>
                    <div className="text-body text-pretty">I quickly translate concepts into prototypes to test usability early and refine experiences.</div>
                  </div>
                  
                  {/* Prototyping section */}
                  <div className="w-full flex flex-col gap-16">
                    

                    {/* ItinerAI Prototypes */}
                    <div className="relative w-full h-fit flex flex-col gap-1">
                      <div className='w-full h-fit space-y-1'>
                        <h2 className="w-full text-important">ItinerAI</h2>
                        
                      </div>
                      
                      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                        <MediaCard
                          mediaType="video"
                          src="/videos/Walk-Through-Video.mp4"
                          aspectClass="aspect-3/4"
                          caption="Early ItinerAI Prototype built with Play"
                          rightIcon={<Image src="/logos/Create with Play Logo.png" alt="Create with Play Logo" width={20} height={20} className="object-contain" />}
                          className="w-full"
                          videoAttributes={{ autoPlay: true, muted: true, loop: true, playsInline: true, disablePictureInPicture: true, controlsList: 'nodownload nofullscreen noremoteplayback' }}
                        />

                        <MediaCard
                          mediaType="video"
                          src="/videos/ItinerAIbuild-1.mp4"
                          aspectClass="aspect-3/4"
                          caption="Sorting shared posts with AI - SwiftUI"
                          rightIcon={<Image src="/logos/Swift Icon.svg" alt="Swift Icon" width={20} height={20} className="object-contain" />}
                          className="w-full"
                          videoAttributes={{ autoPlay: true, muted: true, loop: true, playsInline: true, disablePictureInPicture: true, controlsList: 'nodownload nofullscreen noremoteplayback' }}
                        />
                      </div>
                      <div className="text-body text-pretty">My capstone project, where I designed the full experience and built an interactive prototype using Play. Later, I developed an MVP in SwiftUI using Cursor to test feasibility.</div>
                    </div>

                    {/* Mindlab section */}
                    <div className="relative w-full h-fit flex flex-col gap-1">
                      <div className='w-full h-fit flex flex-col gap-1'>
                        <h2 className="w-full text-important">Mindlab</h2>
                        
                      </div>
                      
                      <MediaCard
                        mediaType="video"
                        src="/images/Craft/pplx-mindlab-1.mp4"
                        aspectClass="aspect-16/9"
                        caption="Guided thinking with AI - V0 prototype"
                        rightIcon={
                          <div className="relative h-6 rounded-md flex items-center justify-center">
                            <Image src="/logos/V0-logo.svg" alt="V0 Logo" width={20} height={20} className="object-contain" />
                            <span className="text-gray-600 text-sm font-medium px-2">+</span>
                            <Image src="/images/About/Cursor-Icon.png" alt="Cursor Icon" width={16} height={16} className="object-contain" />
                          </div>
                        }
                        className="w-full"
                        videoAttributes={{ autoPlay: true, muted: true, loop: true, playsInline: true, disablePictureInPicture: true, controlsList: 'nodownload nofullscreen noremoteplayback' }}
                      />
                      <div className="text-body">A way to train your thinking muscle with Perplexity. Perplexity makes knowledge accessible, but it&apos;s easy to offload thinking to LLMs. I challenged this by building Mindlab using V0, a prototype that guides thinking instead of spoon-feeding answers, helping users arrive at insights without losing context.</div>
                    </div>

                    {/* AR Navigation section */}
                    <div className="relative w-full h-fit flex flex-col gap-1">
                      <div className='w-full h-fit space-y-1'>
                        <h2 className="w-full text-important">Indoor AR navigation prototype</h2>
                        
                      </div>
                      
                      <div className="w-full md:w-3/4">
                        <MediaCard
                          mediaType="video"
                          src="/videos/aero_recording.mp4"
                          aspectClass="aspect-square"
                          caption="AR prototype used to study indoor navigation challenges"
                          rightIcon={<Image src="/logos/Adobe Aero SVG Icon.svg" alt="Adobe Aero Icon" width={24} height={24} className="object-contain" />}
                          className="w-full"
                          videoAttributes={{ autoPlay: true, muted: true, loop: true, playsInline: true, disablePictureInPicture: true, controlsList: 'nodownload nofullscreen noremoteplayback' }}
                        />
                      </div>

                      <div className="md:w-3/4 text-body text-pretty">Built in under 3 hours for a user research study exploring the challenges of indoor navigation and how AR wayfinding can support spatial memory.</div>
                    </div>


                    {/* Image Answer Engine section */}
                    <div className="relative w-full h-fit flex flex-col gap-1">
                      <div className='w-full h-fit space-y-1'>
                        <h2 className="w-full text-important">Image Answer Engine Prototype</h2>
                        
                      </div>
                      
                      <div className="w-full ">
                        <MediaCard
                          mediaType="video"
                          src="/videos/Image-Answer-Engine-Prototype.mp4"
                          aspectClass="aspect-video"
                          caption="Takes a question, finds relevant images, and answers with voice + images."
                          rightIcon={
                            <Image
                              src="/images/About/Cursor-Icon.png"
                              alt="Cursor Icon"
                              width={16}
                              height={16}
                              className="object-contain"
                            />
                          }
                          className="w-full"
                          videoAttributes={{
                            autoPlay: true,
                            muted: true,
                            loop: true,
                            playsInline: true,
                            disablePictureInPicture: true,
                            controlsList: 'nodownload nofullscreen noremoteplayback'
                          }}
                        />
                      </div>

                      <div className=" text-body text-pretty">Inspired by Wall-E&apos;s interface and the voice bot showcased in @sbgriffi’s portfolio. The experience focuses on translating user queries into relevant image-based answers with an orchestrated workflow. This initial version tackles core challenges in answer quality, multi-step orchestration, and interface responsiveness.</div>
                    </div>
                  </div>

                  

              </div>

              {/* Design System section */}
              <div className="relative w-full h-fit flex flex-col gap-4 mt-20">
                    <div className='w-full flex flex-col gap-1'>
                      <h2 className="w-full text-header text-gradient-primary ">Building Scalable Design Systems</h2>
                      
                    </div>
                    
                    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200">
                      <div className="hidden md:block">
                        <ModalGrid />
                      </div>
                      <div className="md:hidden w-full h-full aspect-4/3 bg-[url('/images/projects/Dashworks/Dashworks-Design-System.png')] bg-cover bg-center"></div>
                    </div>
                  </div>
                  <div className=" text-body text-pretty">At Dashworks, I built a design system that balances flexibility and usability for various workflows. To demonstrate my ability to bring designs to life with precision, I developed select modals using Tailwind below.</div>

          </motion.div>

          <motion.div 
            className="w-full"
            variants={sectionVariants}
          >
            <Footer />
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}