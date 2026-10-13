"use client";

import React from 'react';
import MediaCard from '@/components/MediaCard';
import FrameworkFigure from '@/components/figures/framework/FrameworkFigure';
import QScoreFigure from '@/components/figures/qscore/QScoreFigure';
import { CaseStudy, Hero, Section, Points, PullQuote, Meta } from '@/components/case-study/CaseStudy';

// Import the project data
import { projectsData } from '@/data/projectsData';

export default function QuinnProject() {
  // Get the Quinn project data (first in array)
  const project = projectsData[0];

  return (
    <CaseStudy title={project.title}>
      <Hero
        slug="quinn"
        src="/images/projects/Quinn/Masterlist.webp"
        background="/images/projects/thumbnails/HalftoneDots.webp"
        alt={`${project.title} - main image`}
        caption="Enterprise-scale relationship management with strength indicators, recent activity, and intelligent context"
      >
        <Meta
          items={[
            { label: 'My Role', value: project.role },
            { label: 'Timeline', value: project.timeline },
          ]}
        />
      </Hero>

      <Section id="what" nav="Overview" title="What is Quinn?">
        <p className="text-body">Quinn is an AI-native relationship intelligence platform that transforms how executives and business leaders manage their professional networks. The product bridges the gap between traditional CRM systems and intelligent relationship management.</p>
      </Section>

      {/* Project overview */}
      <Section id="overview" title="Project overview">
        <p className="text-body">
          I worked with a founder (former chief of staff) to transform his idea for relationship management into a comprehensive product vision. My role was to translate stakeholder pain points into scalable product architecture, design progressive complexity framework, and validate market positioning through strategic design decisions.
        </p>
      </Section>

      {/* The Solution: From Spreadsheets to Strategic Intelligence */}
      <Section id="solution" nav="Solution" title="From Spreadsheets to Strategic Intelligence">
        <div className="flex flex-col gap-4">
          <MediaCard
            caption='Natural language relationship queries: "founders in SF who raised Series A" '
            className="my-4"
            mediaType="image"
            src='/images/projects/Quinn/Groups.jpg'
            aspectClass="aspect-4/3"
          />
        </div>
        

        {/* What This Enables */}
        <div className="w-full flex flex-col gap-4">
          <h3 className="text-header-2 ">What This Enables</h3>
          <Points>
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
          </Points>
        </div>
      </Section>

      {/* The Problem: When Networks Become Liabilities */}
      <Section id="problem" nav="Problem" title="The Problem: When Networks Become Liabilities">
        
        <div className="space-y-4">
          <h3 className="text-header-2 mt-8">The Founder&apos;s Experience</h3>
          <p className="text-body">
            The startup founder I worked with came from a chief of staff role where he&apos;d witnessed this problem firsthand. His CEO maintained relationships with 30 million followers across platforms, an enormous business asset that was essentially unusable because it existed in fragmented silos.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-header-2 mt-4">The Core Problems</h3>
          <Points>
            <li>Relationships scattered across LinkedIn, email, X, Instagram with no connection</li>
            <li>Critical opportunities missed during job changes, funding announcements, acquisitions</li>
            <li>No strategic querying – impossible to ask &ldquo;Who do I know at Series A startups?&rdquo;</li>
            <li>Manual maintenance that executives couldn&apos;t scale</li>
          </Points>
          <MediaCard
            caption='Manual spreadsheet tracking'
            className="my-8"
            mediaType="image"
            src='/images/projects/Quinn/Email.png'
            aspectClass="aspect-4/3"
          />
          <p className="text-body">An investor I spoke with illustrated the same pain: manually maintaining curated spreadsheets of SF-based designers, updating availability, companies, and seniority every few months. This static approach meant constantly outdated information and missed connection opportunities.</p>
        </div>
        <PullQuote>In relationship-driven business, your network is competitive advantage, but only if you can systematically leverage it.</PullQuote>
        
      </Section>

      {/* What is Quinn? */}
      <Section id="vision" nav="Vision" title="From Concept to Vision">
        <div className="space-y-4">
          <p className="text-body text-pretty">We began with the core insight that people needed queryable relationship graphs, not static contact databases. The question was: how do you enable executives to ask strategic questions of their network and get intelligent answers?</p>
          <h3 className="text-header-2 pt-4">The Relationship Graph Concept</h3>
          <MediaCard
            caption='Early relationship graph capabilities'
            className="my-8"
            mediaType="image"
            src='/images/projects/Quinn/Relationship-Graph.png'
            aspectClass="aspect-4/3"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-header-2 pt-4">First Direction: Chief of Staff for Everyone</h3>
          <p className="text-body text-pretty">I explored a personal chief of staff approach, imagining mobile AI that could handle scheduling, reminders, and relationship management.</p>
          <MediaCard
            caption='Early mockups of a personal chief of staff approach'
            className="my-8"
            mediaType="image"
            src='/images/projects/Quinn/Contextual-Cards.png'
            aspectClass="aspect-[2.1/5]"
          />
          <p className="text-body text-pretty">But when I presented this direction, the founder&apos;s feedback was clear and redirective: &ldquo;Strictly for business use cases. This needs to solve a specific business intelligence problem.&rdquo;</p>
        </div>

        <div className="flex flex-col gap-4">
        <h3 className="text-header-2 pt-4">Brainstorming</h3>
        <p className="text-body text-pretty">With business focus clarified, I conducted a feature brainstorm. Everything from &ldquo;Dead to Me&rdquo; functionality to &ldquo;Tinder Queue&rdquo; relationship maintenance.</p>
        <MediaCard
          caption='Everything we could build vs. what actually enables relationship intelligence'
          className="my-4"
          mediaType="image"
          src='/images/projects/Quinn/Pantry.png'
          aspectClass="aspect-4/3"
        />
        <p className="text-body text-pretty">The Focus Question: What specifically enables people to query their relationship database, get intelligent answers, and take strategic business action?</p>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-header-2 pt-4">Progressive Complexity Framework</h3>
        <FrameworkFigure />
        <Points>
          <li>
            <span className="font-semibold">Search</span> &rarr; Natural language queries creating temporary contact tables
          </li>
          <li>
            <span className="font-semibold">Groups</span> &rarr; Save valuable queries as persistent, auto-updating collections
          </li>
          <li>
            <span className="font-semibold">Playbooks</span> &rarr; Goal-oriented workflows optimizing relationships for specific outcomes
          </li>
        </Points>
        
        <p className="text-body text-pretty mt-1">Each layer solved a core business problem while building toward sophistication without overwhelming users.</p>
      </div>

        

      </Section>

      

      
      

      <Section id="execution" nav="Execution" title="Design Execution: The Three Layers">
        <div className="flex flex-col gap-4">
          <h3 className="text-header-2 pt-4">Layer 1: Queryable Relationships + Natural Language Intelligence</h3>
          <MediaCard
            mediaType="image"
            src="/images/projects/Quinn/Masterlist.jpg"
            caption="Master table interface detail"
            className="my-4"
          />
        </div>
        
        <div className="flex flex-col gap-4">
          <h3 className="text-header-2 pt-4">Strategic Design Decisions</h3>
          <Points>
            <li>Table format over cards so executives can scan relationship depth quickly</li>
            <li>Color-coded strength indicators transform communication data into intuitive assessment</li>
            <li>Recent activity context keeps timing relevant for strategic outreach decisions</li>
            <li>Information density prioritizes business context over consumer simplification</li>
          </Points>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-header-2 pt-4">AI Integration</h3>
          <p className="text-body text-pretty">Progressive complexity moves from simple name searches to sophisticated business questions like &ldquo;founders who raised Series A in the last 6 months.&rdquo; Bounded AI that feels predictable builds trust more than open-ended capabilities.</p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-header-2 pt-4">Layer 2: From Search to Strategic Collections</h3>
          <MediaCard
            mediaType="image"
            src="/images/projects/Quinn/Save-Group.png"
            caption="Save as group workflow"
            className="my-4"
          />
          <p className="text-body text-pretty">When executives run useful relationship queries, they want to reuse and share them. The &ldquo;Save as a Group&rdquo; function converts any filtered search into a persistent collection.</p>
          
          <MediaCard
            mediaType="image"
            src="/images/projects/Quinn/auto-update.png"
            caption="AI research adding context"
            className="my-4"
          />
          <p className="text-body text-pretty">Groups grow and stay current through periodic AI research. The system discovers new people who match the criteria and adds them automatically - in this case, finding additional founders who raised Series A and adding their funding context.</p>
        </div>

        <div className="flex flex-col gap-4">
        <h3 className="text-header-2 pt-4">Layer 3: Goal-Oriented Relationship Strategy</h3>
        <MediaCard
          mediaType="image"
          src="/images/projects/Quinn/Playbooks.png"
          caption="Q-score dashboard"
          className="my-4"
        />
        <p className="text-body text-pretty">Daily relationship updates surface relevant contacts based on recent activity, with suggested actions that match your current priorities. &ldquo;Send Email&rdquo; for hiring, &ldquo;Source Introductions&rdquo; for partnerships.</p>
          
        </div>

        <div className="flex flex-col gap-4">
        <h3 className="text-header-2 pt-4">Contextual Q-Scores</h3>
          <p className="text-body text-pretty">The same person gets different Q-scores based on your current business objective. Sambhav Anand shows &ldquo;High Q-Score&rdquo; for hiring contexts because Fulcrum recently posted engineering roles, but &ldquo;Low Q-Score&rdquo; for fundraising contexts since they just completed their Series A.</p>
          <QScoreFigure />
          <MediaCard
            mediaType="image"
            src="/images/projects/Quinn/Q-Score.png"
            caption="Suggested actions interface"
            className="my-4"
          />
          <p className="text-body text-pretty">AI recommends relationship strategies based on context, timing, and business objectives.</p>
        </div>

      </Section>

      

      
      <Section id="process" nav="Process" title="Design Process: Learning from Platform Success">
        <div className="flex flex-col gap-4">
          <h3 className="text-header-2 pt-4">iTunes & Spotify Pattern Applied to Relationships</h3>
          <p className="text-body text-pretty">Both platforms started with comprehensive databases providing immediate utility, then progressively layered intelligence on top.</p>
          <MediaCard
            mediaType="image"
            src="/images/projects/Quinn/Inspirations.png"
            caption="Inspirations for the product"
            className="my-4"
          />
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-header-2 pt-4">Quinn&apos;s Application</h3>
          <p className="text-body text-pretty">Each layer builds naturally on previous understanding without disrupting learned behaviors.</p>
          <Points>
            <li>Master relationship database → immediate contact utility</li>
            <li>Smart filtering → query capabilities</li>
            <li>Dynamic groups → persistent intelligence</li>
            <li>AI playbooks → strategic automation</li>
          </Points>
        </div>
        
      </Section>

     
      <Section id="learnings" nav="Learnings" title="What I Learned">
        <div className="flex flex-col gap-4">
          <h3 className="text-header-2 pt-4">Focus on the Golden Path</h3>
          <p className="text-body text-pretty">Rather than designing for every edge case, I learned the value of identifying the core 80% use case and making that experience exceptional. For Quinn, this meant prioritizing executive relationship querying over casual networking features. This discipline helped me avoid feature creep during the &ldquo;Pantry&rdquo; brainstorming phase.</p>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-header-2 pt-4">Strong Opinions, Loosely Held</h3>
          <p className="text-body text-pretty">I realized the importance of designing with a strong, opinionated hypothesis. My initial &ldquo;chief of staff for everyone&rdquo; concept was strongly held but wrong. When founder feedback provided the &ldquo;business only&rdquo; constraint, I pivoted quickly. Clear direction creates momentum even when it needs to evolve.</p>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-header-2 pt-4">Design for Coherent Systems that Evolve</h3>
          <p className="text-body text-pretty">I learned to think beyond individual features and design within a theory of the system. Quinn&apos;s search, groups, and scoring needed to work together cohesively while building toward future AI capabilities. The table interface became foundation for progressive complexity rather than just a contact list.</p>
        </div>
      </Section>
    </CaseStudy>
  );
}
