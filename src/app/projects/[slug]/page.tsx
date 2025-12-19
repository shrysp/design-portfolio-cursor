"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, GithubLogo, Globe } from '@phosphor-icons/react';
import Image from 'next/image';

// Import the project data from the separate file
import { projectsData } from '@/data/projectsData';

// Define a flexible Project type that can accommodate different structures
interface Project {
  title: string;
  description?: string[];
  images: string[];
  technologies?: string[];
  github?: string;
  live?: string;
  // Additional flexible fields
  process?: string[];
  challenge?: string;
  solution?: string;
  outcome?: string[] | string;
  timeline?: string;
  role?: string;
  team?: string[];
  testimonial?: {
    quote: string;
    name?: string;
    author?: string;
    role?: string;
    position?: string;
  }[];
  // Any other custom fields
  [key: string]: unknown;
}

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const slug = params.slug as string;

  useEffect(() => {
    // Find the project that matches the slug
    const foundProject = projectsData.find(
      (p) => p.title.toLowerCase().replace(/\s+/g, '-') === slug
    );
    
    if (foundProject) {
      setProject(foundProject);
    } else {
      // If no project is found, redirect to the home page
      router.push('/');
    }
  }, [slug, router]);

  // Function to handle going back to the home page
  const handleBack = () => {
    router.push('/');
  };

  if (!project) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Loading project...</h1>
        </div>
      </div>
    );
  }

  // Render different sections based on available project data
  const renderProjectContent = () => {
    return (
      <div className="w-full">
        {/* Project image gallery */}
        <div className="w-full">
          {/* Main image display */}
          <div className="w-full aspect-video bg-slate-100 rounded-xl overflow-hidden mb-4 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset]">
            {project.images[selectedImageIndex]?.endsWith('.mp4') ? (
              <video 
                src={project.images[selectedImageIndex]} 
                className="w-full h-full object-cover" 
                autoPlay 
                loop 
                muted 
                playsInline
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
              />
            ) : (
              <Image 
                src={project.images[selectedImageIndex]} 
                alt={`${project.title} - Image ${selectedImageIndex + 1}`} 
                className="w-full h-full object-cover"
                width={1200}
                height={675}
                priority={selectedImageIndex === 0}
              />
            )}
          </div>
          
          {/* Thumbnail gallery */}
          <div className="flex md:flex-row flex-wrap gap-2 overflow-x-auto pb-2">
            {project.images.map((image, index) => (
              <div 
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative md:w-20 w-16 aspect-video rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedImageIndex === index 
                    ? 'border-blue-500 shadow-[0px_0px_0px_2px_rgba(59,130,246,0.5)]' 
                    : 'border-slate-200'
                }`}
              >
                {image.endsWith('.mp4') ? (
                  <video 
                    src={image} 
                    className="w-full h-full object-cover" 
                    muted 
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                  />
                ) : (
                  <Image 
                    src={image} 
                    alt={`Thumbnail ${index + 1}`} 
                    className="w-full h-full object-cover"
                    width={80}
                    height={45}
                  />
                )}
                {selectedImageIndex === index && (
                  <div className="absolute inset-0 bg-blue-500/10"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Project details */}
        <div className="w-full grid md:grid-cols-3 grid-cols-1 gap-6">
          {/* Left column - Project info */}
          <div className="md:col-span-2 col-span-1">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{project.title}</h2>
            
            {/* Project description */}
            {project.description && project.description.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Overview</h3>
                <div className="space-y-2">
                  {project.description.map((paragraph, index) => (
                    <p key={index} className="text-slate-600">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
            
            {/* Challenge and Solution */}
            {project.challenge && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Challenge</h3>
                <p className="text-slate-600">{project.challenge}</p>
              </div>
            )}
            
            {project.solution && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Solution</h3>
                <p className="text-slate-600">{project.solution}</p>
              </div>
            )}
            
            {/* Process */}
            {project.process && project.process.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Process</h3>
                <ul className="list-disc list-inside space-y-1">
                  {project.process.map((step, index) => (
                    <li key={index} className="text-slate-600">{step}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Outcome */}
            {project.outcome && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Outcome</h3>
                {Array.isArray(project.outcome) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {project.outcome.map((result, index) => (
                      <li key={index} className="text-slate-600">{result}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-600">{project.outcome}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Right column - Project metadata */}
          <div className="md:col-span-1 col-span-1">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              {/* Role and Timeline */}
              {project.role && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700">Role</h4>
                  <p className="text-slate-600">{project.role}</p>
                </div>
              )}
              
              {project.timeline && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700">Timeline</h4>
                  <p className="text-slate-600">{project.timeline}</p>
                </div>
              )}
              
              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700">Technologies</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.technologies.map((tech, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-slate-200 text-slate-700 rounded-md text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Team */}
              {project.team && project.team.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700">Team</h4>
                  <ul className="mt-1">
                    {project.team.map((member, index) => (
                      <li key={index} className="text-slate-600 text-sm">{member}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Links */}
              {(project.github || project.live) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.github && (
                    <a 
                      href={project.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-white rounded-md text-sm hover:bg-slate-700 transition-colors"
                    >
                      <GithubLogo size={16} />
                      <span>GitHub</span>
                    </a>
                  )}
                  
                  {project.live && (
                    <a 
                      href={project.live} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-500 transition-colors"
                    >
                      <Globe size={16} />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-slate-50 to-white">
      <main className="w-full md:max-w-[800px] max-w-[361px] flex flex-col gap-12 py-6">
        <div className="flex flex-col gap-6 items-start border border-slate-200 md:p-8 p-4 h-[94vh] overflow-y-auto scrollbar-hide rounded-4xl">
          {/* Back button and header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex w-full items-center gap-4 border-b border-slate-200 pb-4"
          >
            <motion.div
              onClick={handleBack}
              className={`group relative flex items-center justify-center text-white/80 size-[32px] border border-blue-700 bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] rounded-full cursor-pointer
                active:bg-radial-[at_50%_75%] active:from-blue-300 active:via-blue-500 active:to-blue-700 active:border-blue-700 active:text-white/80 active:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset]`}
            >
              <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
              <ArrowLeft size={20} weight="bold" />
            </motion.div>
            <h1 className="text-[24px] font-bold text-slate-800">
              {project.title}
            </h1>
          </motion.div>

          {/* Project content */}
          {renderProjectContent()}
        </div>

      </main>
    </div>
  );
} 