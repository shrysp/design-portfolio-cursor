"use client";

import { motion } from 'framer-motion';
import { ProjectCard } from '@/components/ProjectCard';
// Import project data from separate file
import { projectsData } from '@/data/projectsData';

export default function Projects() {
  return (
    <div className="min-h-screen flex justify-center bg-gray-50">
      <main className="w-full md:max-w-[800px] max-w-[361px] flex flex-col gap-12">
        <div className="flex flex-col gap-12 items-start  md:pt-16 pt-8 md:px-0 p-4 md:pb-24 pb-24 ">
        {/* Page header */}
         <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)", scale: 0.95 }}
          animate={{ opacity: 1, y: 0 , filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 0.4 }}
          className="isolate relative min-h-14 flex w-full bg-slate-800 border-3 border-slate-800 rounded-full items-center gap-4 overflow-hidden"
        
        >

          <div className="absolute inset-x-1 top-0.5 h-1/2 bg-gradient-to-b from-slate-50/40 to-slate-50/5 rounded-t-[24px] rounded-b-[6px] z-10"></div>
          <div className="flex items-center w-full h-full">
            <h1 className="md:text-[24px] text-[16px] font-bold text-slate-50 w-full px-6 py-2">
            Projects
           </h1>
           <div className="flex w-full h-full bg-[url('/images/Banners/Banner-Projects.png')] bg-cover bg-center [mask-image:radial-gradient(50%_400%_at_0%_50%,transparent_10%,black_100%)] [mask-type:alpha]">
            
           </div>
          </div>
          
         </motion.div>
        
        {/* Project grid */}
            <div className="grid grid-cols-1 gap-10 w-full">
          {projectsData.map((project, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)", scale: 0.95 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              transition={{ delay: 0.2 + index * 0.2, duration: 0.4 }}
            >
              <ProjectCard 
                title={project.title}
                description={project.description || []}
                images={project.images || []}
              />
            </motion.div>
          ))}


            </div>

        </div>
        
          
        
      </main>
    </div>
  );
} 