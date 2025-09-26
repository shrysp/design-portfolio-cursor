"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import ProjectHeader from '@/components/ProjectHeader';
import Footer from '@/components/Footer';
// import MediaCard from '@/components/MediaCard';

// Import the project data
import { projectsData } from '@/data/projectsData';
import MediaCard from '@/components/MediaCard';

export default function QuinnProject() {
  const selectedImageIndex = 0;
  
  // Get the Quinn project data (first in array after we add it)
  const project = projectsData[0]; // Quinn will be the first project in the array

  return (
    <div className="min-h-screen flex justify-center bg-gray-50">
      <main className="w-full max-w-[800px] flex flex-col gap-12">
        <div className="flex flex-col gap-16 items-start md:pt-24 pt-8 md:px-0 p-4 md:pb-24 pb-24">
          {/* Back button and header */}
            <ProjectHeader 
              title={project.title}
              
            />

          {/* Project content */}
          <div className="w-full flex flex-col gap-16">
            {/* Main image display */}
            <div className="w-full flex flex-col gap-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full aspect-[4/3] rounded-3xl border border-slate-200 overflow-hidden mb-6 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]"
              >
                <Image
                  src={project.images[selectedImageIndex + 1]}
                  alt={`${project.title} - main image`}
                  className="w-full h-full object-cover bg-stone-100"
                  width={1200}
                  height={800}
                  priority={selectedImageIndex === 0}
                />
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
                    <h2 className="text-subheader font-bold text-gray-800 mb-1">My Role</h2>
                    <p className="text-gray-600 leading-relaxed">{project.role}</p>
                  </div>
                  <div>
                    <h2 className="text-subheader font-bold text-gray-800 mb-1">Timeline</h2>
                    <p className="text-gray-600 leading-relaxed">{project.timeline}</p>
                  </div>
                  
                </div>
              </motion.div>
            </div>

            {/* What is Quinn? */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter:"blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter:"blur(0px)" }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col gap-2"
            >
              <h2 className="text-header text-gradient-primary ">What is Quinn?</h2>
              <p className="text-body">Quinn is an AI-native relationship intelligence platform that transforms how executives and business leaders manage their professional networks. The product bridges the gap between traditional CRM systems and intelligent relationship management.</p>
            </motion.div>

             {/* Project overview */}
             <motion.div
              initial={{ opacity: 0, y: 20, filter:"blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter:"blur(0px)" }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col gap-2"
            >
              <h2 className="text-header text-gradient-primary ">Project overview</h2>
              <p className="text-body">
                I worked with a founder (former chief of staff) to transform his idea for relationship management into a comprehensive product vision. My role was to translate stakeholder pain points into scalable product architecture, design progressive complexity framework, and validate market positioning through strategic design decisions.
              </p>
            </motion.div>

            {/* The Solution: From Spreadsheets to Strategic Intelligence */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter:"blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter:"blur(0px)" }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-header text-gradient-primary ">From Spreadsheets to Strategic Intelligence</h2>
                
                <MediaCard
                  caption="Enterprise-scale relationship management with strength indicators, recent activity, and intelligent context"
                  className=""
                  mediaType="image"
                  src='/images/projects/Quinn/Masterlist.jpg'
                  aspectClass="aspect-4/3"
                />
                <MediaCard
                  caption='Natural language relationship queries: "founders in SF who raised Series A" '
                  className=""
                  mediaType="image"
                  src='/images/projects/Quinn/groups.jpg'
                  aspectClass="aspect-4/3"
                />
              </div>
              

              {/* What This Enables */}
              <div className="w-full flex flex-col gap-1 mt-3">
                <h3 className="text-important ">What This Enables</h3>
                <ul className="text-body space-y-2 list-decimal list-inside">
                  <li>
                    <span className="">Queryable relationship database</span> – Ask business questions of your network in natural language
                  </li>
                  <li>
                    <span className="">Dynamic intelligence</span> – Groups auto-update as relationships and context evolve
                  </li>
                  <li>
                    <span className="">Strategic prioritization</span> – Q-scores adapt to specific goals (recruiting vs fundraising)
                  </li>
                  <li>
                    <span className="">Enterprise scale</span> – Handle thousands of relationships with intelligent organization
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* The Problem: When Networks Become Liabilities */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter:"blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter:"blur(0px)" }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col gap-6"
            >
              
              <div className="space-y-2">
              <h2 className="text-header text-gradient-primary ">The Problem: When Networks Become Liabilities</h2>
                <h3 className="text-important">The Founder&apos;s Experience</h3>
                <p className="text-body">
                  The startup founder I worked with came from a chief of staff role where he&apos;d witnessed this problem firsthand. His CEO maintained relationships with 30 million followers across platforms, an enormous business asset that was essentially unusable because it existed in fragmented silos.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-important">The Core Problems</h3>
                <ul className="text-body space-y-2 list-decimal list-inside">
                  <li>Relationships scattered across LinkedIn, email, X, Instagram with no connection</li>
                  <li>Critical opportunities missed during job changes, funding announcements, acquisitions</li>
                  <li>No strategic querying – impossible to ask &ldquo;Who do I know at Series A startups?&rdquo;</li>
                  <li>Manual maintenance that executives couldn&apos;t scale</li>
                </ul>
              
              <MediaCard
                caption='Manual spreadsheet tracking'
                className=""
                mediaType="image"
                src='/images/projects/Quinn/Email.png'
                aspectClass="aspect-4/3"
              />
              <p className="text-body">An investor I spoke with illustrated the same pain: manually maintaining curated spreadsheets of SF-based designers, updating availability, companies, and seniority every few months. This static approach meant constantly outdated information and missed connection opportunities.</p>
              </div>
              <h3 className="text-important mt-3 italic">In relationship-driven business, your network is competitive advantage, but only if you can systematically leverage it.</h3>
              
            </motion.div>

            {/* What is Quinn? */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter:"blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter:"blur(0px)" }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="space-y-2">
                <h2 className="text-header text-gradient-primary ">From Concept to Vision</h2>
                <p className="text-body text-pretty">We began with the core insight that people needed queryable relationship graphs, not static contact databases. The question was: how do you enable executives to ask strategic questions of their network and get intelligent answers?</p>
                <h3 className="text-important mt-3">The Relationship Graph Concept</h3>
                <MediaCard
                  caption='Early relationship graph capabilities'
                  className=""
                  mediaType="image"
                  src='/images/projects/Quinn/Relationship-Graph.png'
                  aspectClass="aspect-4/3"
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-important">First Direction: Chief of Staff for Everyone</h2>
                <p className="text-body text-pretty">I explored a personal chief of staff approach, imagining mobile AI that could handle scheduling, reminders, and relationship management.</p>
                <MediaCard
                  caption='Early mockups of a personal chief of staff approach'
                  className=""
                  mediaType="image"
                  src='/images/projects/Quinn/Contextual-Cards.png'
                  aspectClass="aspect-[2.1/5]"
                />
                <p className="text-body text-pretty">But when I presented this direction, the founder&apos;s feedback was clear and redirective: &ldquo;Strictly for business use cases. This needs to solve a specific business intelligence problem.&rdquo;</p>
              </div>

              <div className="flex flex-col gap-2">
              <h2 className="text-important">Brainstorming</h2>
              <p className="text-body text-pretty">With business focus clarified, I conducted a feature brainstorm. Everything from &ldquo;Dead to Me&rdquo; functionality to &ldquo;Tinder Queue&rdquo; relationship maintenance.</p>
              <MediaCard
                caption='Everything we could build vs. what actually enables relationship intelligence'
                className=""
                mediaType="image"
                src='/images/projects/Quinn/Pantry.png'
                aspectClass="aspect-4/3"
              />
              <p className="text-body text-pretty">The Focus Question: What specifically enables people to query their relationship database, get intelligent answers, and take strategic business action?</p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-important">Progressive Complexity Framework</h2>
              <ul className="text-body text-pretty list-decimal list-inside space-y-2">
                <li>
                  <span className="font-semibold">Search</span> &rarr; Natural language queries creating temporary contact tables
                </li>
                <li>
                  <span className="font-semibold">Groups</span> &rarr; Save valuable queries as persistent, auto-updating collections
                </li>
                <li>
                  <span className="font-semibold">Playbooks</span> &rarr; Goal-oriented workflows optimizing relationships for specific outcomes
                </li>
              </ul>
              
              <p className="text-body text-pretty mt-1">Each layer solved a core business problem while building toward sophistication without overwhelming users.</p>
            </div>

              

            </motion.div>

            



            
            

            <motion.div
              initial={{ opacity: 0, y: 20, filter:"blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter:"blur(0px)" }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-header text-gradient-primary">Design Execution: Progressive Complexity Framework</h2>
                <h3 className="text-important">Layer 1: Queryable Relationships + Natural Language Intelligence</h3>
                <MediaCard
                  mediaType="image"
                  src="/images/projects/Quinn/Masterlist.jpg"
                  caption="Master table interface detail"
                  className=""
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-important">Strategic Design Decisions</h3>
                <ul className="text-body space-y-2 list-decimal list-inside">
                  <li>Table format over cards so executives can scan relationship depth quickly</li>
                  <li>Color-coded strength indicators transform communication data into intuitive assessment</li>
                  <li>Recent activity context keeps timing relevant for strategic outreach decisions</li>
                  <li>Information density prioritizes business context over consumer simplification</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-important">AI Integration</h3>
                <p className="text-body text-pretty">Progressive complexity moves from simple name searches to sophisticated business questions like &ldquo;founders who raised Series A in the last 6 months.&rdquo; Bounded AI that feels predictable builds trust more than open-ended capabilities.</p>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-important  ">Layer 2: From Search to Strategic Collections</h2>
                <MediaCard
                  mediaType="image"
                  src="/images/projects/Quinn/Save-Group.png"
                  caption="Save as group workflow"
                  className="mt-3"
                />
                <p className="text-body text-pretty">When executives run useful relationship queries, they want to reuse and share them. The &ldquo;Save as a Group&rdquo; function converts any filtered search into a persistent collection.</p>
                
                <MediaCard
                  mediaType="image"
                  src="/images/projects/Quinn/auto-update.png"
                  caption="AI research adding context"
                  className="mt-3"
                />
                <p className="text-body text-pretty">Groups grow and stay current through periodic AI research. The system discovers new people who match the criteria and adds them automatically - in this case, finding additional founders who raised Series A and adding their funding context.</p>
              </div>

              <div className="flex flex-col gap-2">
              <h2 className="text-important">Layer 3: Goal-Oriented Relationship Strategy</h2>
              <MediaCard
                mediaType="image"
                src="/images/projects/Quinn/Playbooks.png"
                caption="Q-score dashboard"
                className=""
              />
              <p className="text-body text-pretty">Daily relationship updates surface relevant contacts based on recent activity, with suggested actions that match your current priorities. &ldquo;Send Email&rdquo; for hiring, &ldquo;Source Introductions&rdquo; for partnerships.</p>
                
              </div>

              <div className="flex flex-col gap-2">
              <h3 className="text-important">Contextual Q-Scores</h3>
                <p className="text-body text-pretty">The same person gets different Q-scores based on your current business objective. Sambhav Anand shows &ldquo;High Q-Score&rdquo; for hiring contexts because Fulcrum recently posted engineering roles, but &ldquo;Low Q-Score&rdquo; for fundraising contexts since they just completed their Series A.</p>
                <MediaCard
                  mediaType="image"
                  src="/images/projects/Quinn/Q-Score.png"
                  caption="Suggested actions interface"
                  className=""
                />
                <p className="text-body text-pretty">AI recommends relationship strategies based on context, timing, and business objectives.</p>
              </div>

            </motion.div>


            

            
            <motion.div
              initial={{ opacity: 0, y: 20, filter:"blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter:"blur(0px)" }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-header text-gradient-primary">Design Process: Learning from Platform Success</h2>
                <h3 className="text-important">iTunes & Spotify Pattern Applied to Relationships</h3>
                <p className="text-body text-pretty">Both platforms started with comprehensive databases providing immediate utility, then progressively layered intelligence on top.</p>
                <MediaCard
                  mediaType="image"
                  src="/images/projects/Quinn/Inspirations.png"
                  caption="Inspirations for the product"
                  className="mt-3"
                />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-important">Quinn&apos;s Application</h3>
                <p className="text-body text-pretty">Each layer builds naturally on previous understanding without disrupting learned behaviors.</p>
                <ul className="text-body space-y-1">
                  <li>Master relationship database → immediate contact utility</li>
                  <li>Smart filtering → query capabilities</li>
                  <li>Dynamic groups → persistent intelligence</li>
                  <li>AI playbooks → strategic automation</li>
                </ul>
              </div>
              
            </motion.div>

           
            <motion.div
              initial={{ opacity: 0, y: 20, filter:"blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter:"blur(0px)" }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col gap-6"
            >
              <h2 className="text-header text-gradient-primary">What I Learned</h2>
              <div className="flex flex-col gap-2">
                <h3 className="text-important">Focus on the Golden Path</h3>
                <p className="text-body text-pretty">Rather than designing for every edge case, I learned the value of identifying the core 80% use case and making that experience exceptional. For Quinn, this meant prioritizing executive relationship querying over casual networking features. This discipline helped me avoid feature creep during the &ldquo;Pantry&rdquo; brainstorming phase.</p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-important">Strong Opinions, Loosely Held</h3>
                <p className="text-body text-pretty">I realized the importance of designing with a strong, opinionated hypothesis. My initial &ldquo;chief of staff for everyone&rdquo; concept was strongly held but wrong. When founder feedback provided the &ldquo;business only&rdquo; constraint, I pivoted quickly. Clear direction creates momentum even when it needs to evolve.</p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-important">Design for Coherent Systems that Evolve</h3>
                <p className="text-body text-pretty">I learned to think beyond individual features and design within a theory of the system. Quinn&apos;s search, groups, and scoring needed to work together cohesively while building toward future AI capabilities. The table interface became foundation for progressive complexity rather than just a contact list.</p>
              </div>
            </motion.div>

           

            


          </div>

          {/* Footer */}
          <Footer 
            variant="project"
            projectNavigation={{
              nextProject: {
                name: "ItinerAI",
                slug: "itinerai"
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}
