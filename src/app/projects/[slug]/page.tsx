"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, GithubLogo, Globe } from '@phosphor-icons/react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';

// Import the project data from the separate file
import { projectsData } from '@/data/projectsData';

// Define a flexible Project type that can accommodate different structures
interface Project {
  title: string;
  description: string[];
  images: string[];
  technologies?: string[];
  github?: string;
  live?: string;
  // Additional flexible fields
  process?: string[];
  challenge?: string;
  solution?: string;
  outcome?: string;
  timeline?: string;
  role?: string;
  team?: string[];
  testimonial?: {
    quote: string;
    author: string;
    position?: string;
  };
  // Any other custom fields
  [key: string]: any;
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
    }
  }, [slug]);

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
        {/* Main image display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-full h-[400px] rounded-3xl overflow-hidden mb-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]"
        >
          {project.images && project.images.length > 0 && (
            <img
              src={project.images[selectedImageIndex]}
              alt={`${project.title} - main image`}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        {/* Image thumbnails */}
        {project.images && project.images.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex gap-2 mb-6 overflow-x-auto pb-2"
          >
            {project.images.map((image: string, index: number) => (
              <div
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                  selectedImageIndex === index
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={image}
                  alt={`${project.title} - thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </motion.div>
        )}

        {/* Project overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Overview</h2>
          
        </motion.div>

        {/* Role and Timeline (if available) */}
        {(project.role || project.timeline) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.role && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">My Role</h3>
                  <p className="text-slate-700">{project.role}</p>
                </div>
              )}
              {project.timeline && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Timeline</h3>
                  <p className="text-slate-700">{project.timeline}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Process (if available) */}
        {project.process && project.process.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Process</h2>
            <ol className="space-y-4">
              {project.process.map((step: string, index: number) => (
                <li key={index} className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-slate-700">{step}</p>
                </li>
              ))}
            </ol>
          </motion.div>
        )}

        {/* Challenge and Solution (if available) */}
        {(project.challenge || project.solution) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.45 }}
            className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
          >
            {project.challenge && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Challenge</h3>
                <p className="text-slate-700">{project.challenge}</p>
              </div>
            )}
            {project.solution && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Solution</h3>
                <p className="text-slate-700">{project.solution}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Outcome (if available) */}
        {project.outcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Outcome</h3>
            <p className="text-slate-700">{project.outcome}</p>
          </motion.div>
        )}

        {/* Team (if available) */}
        {project.team && project.team.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.55 }}
            className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Team</h3>
            <ul className="space-y-1">
              {project.team.map((member: string, index: number) => (
                <li key={index} className="text-slate-700">{member}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Testimonial (if available) */}
        {project.testimonial && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
          >
            <div className="relative">
              <div className="text-blue-500 text-4xl absolute -top-2 -left-1">"</div>
              <blockquote className="pl-6 italic text-slate-700">
                {project.testimonial.quote}
              </blockquote>
              <div className="mt-4 pl-6">
                <p className="font-semibold text-slate-800">{project.testimonial.author}</p>
                {project.testimonial.position && (
                  <p className="text-sm text-slate-600">{project.testimonial.position}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Technologies used (if available) */}
        {project.technologies && project.technologies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.65 }}
            className="bg-white rounded-3xl p-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12),inset_0px_1px_2px_0px_rgba(255,255,255,1.00),inset_0px_-1px_1px_0px_rgba(0,0,0,0.12)] border border-slate-200 mb-6"
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Links (if available) */}
        {(project.github || project.live) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 mt-6"
          >
            {project.github && (
              <Button
                className="group text-white font-semibold w-full md:w-[240px] h-[36px] bg-gradient-to-b from-slate-700 via-slate-500 to-slate-300 border border-slate-500 rounded-full shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_8px_8px_-4px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] hover:border-slate-700 active:shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.25),0px_8px_8px_-4px_rgba(0,0,0,0.0),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] transition-all duration-300 relative overflow-hidden active:bg-gradient-to-b active:from-slate-800 active:via-slate-600 active:to-slate-400 cursor-pointer flex items-center justify-center gap-2"
                onClick={() => window.open(project.github, '_blank')}
              >
                <GithubLogo size={20} weight="fill" />
                GitHub Repository
                <div className="absolute inset-2 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 group-active:from-white/30" />
              </Button>
            )}
            {project.live && (
              <Button
                className="group text-white font-semibold w-full md:w-[240px] h-[36px] bg-gradient-to-b from-blue-700 via-blue-500 to-blue-300 border border-blue-500 rounded-full shadow-[0px_2px_2px_-1px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.0),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.25),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] hover:border-blue-700 active:shadow-[0px_4px_4px_-2px_rgba(28,57,142,0.25),0px_8px_8px_-4px_rgba(28,57,142,0.0),0px_4px_8px_1px_rgba(28,57,142,0.25)_inset,0px_-2px_2px_0px_rgba(28,57,142,0.25)_inset] transition-all duration-300 relative overflow-hidden active:bg-gradient-to-b active:from-blue-800 active:via-blue-600 active:to-blue-400 cursor-pointer flex items-center justify-center gap-2"
                onClick={() => window.open(project.live, '_blank')}
              >
                <Globe size={20} weight="fill" />
                Live Demo
                <div className="absolute inset-2 top-0.5 h-1/2 rounded-t-[12px] rounded-b-[4px] bg-gradient-to-b from-white/70 group-active:from-white/30" />
              </Button>
            )}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-slate-50 to-white">
      <main className="w-full max-w-[800px] flex flex-col gap-12 py-6">
        <div className="flex flex-col gap-12 items-start border border-slate-200 p-8 h-[94vh] overflow-y-auto scrollbar-hide rounded-4xl">
          {/* Back button and header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex w-full items-center gap-4 border-b border-slate-200 pb-4"
          >
            <motion.div
              onClick={() => router.back()}
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

          {/* Navigation */}
          <div className="fixed flex items-center justify-center mx-auto left-1/2 -translate-x-1/2 bottom-10 z-10 pointer-events-none">
            <Navbar />
          </div>
        </div>
      </main>
    </div>
  );
} 