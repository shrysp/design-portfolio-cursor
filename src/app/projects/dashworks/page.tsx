"use client";

import React from 'react';
import ModalGrid from '@/components/ModalGrid';
import CompareSlider from '@/components/case-study/CompareSlider';
import MediaCard from '@/components/MediaCard';
import AnswerFigure from '@/components/figures/dashworks/AnswerFigure';
import { CaseStudy, Hero, Meta, Section, Points } from '@/components/case-study/CaseStudy';

// Import the project data
import { projectsData } from '@/data/projectsData';

export default function DashworksProject() {
  const project = projectsData[2];

  return (
    <CaseStudy title={project.title}>
      <Hero
        slug="dashworks"
        src="/images/projects/Dashworks/Dashworks-Onboarding-1.png"
        background="/images/projects/thumbnails/Dashworks-Thumbnail-Background.webp"
        alt={`${project.title} - main image`}
      >
        <Meta
          items={[
            { label: 'My Role', value: 'Product Design Intern' },
            { label: 'Timeline', value: 'Jan 2024 - Apr 2024' },
            { label: 'Team', value: 'Aahel Iyer' },
          ]}
        />
      </Hero>

      <Section id="overview" nav="Overview" title="What is Dashworks?">
        <p className="text-body">Dashworks is an AI-powered knowledge assistant that helps companies centralize their knowledge scattered across various apps. It provides accurate answers to employee questions by searching across the company&apos;s connected applications.</p>
        <p className="text-body">Dashworks integrates with over 50 apps, including Slack, Jira, Confluence, and Google Drive, to create a unified knowledge base.</p>
      </Section>

      <Section id="challenges" nav="Challenges" title="Challenges">
        <Points>
          <li>
            <span className="font-semibold">Speeding Up Product Development:</span> Improving processes and design velocity to improve the frequency and impact of product updates.
          </li>
          <li>
            <span className="font-semibold">Simplifying Onboarding for Quick Value:</span> Redesigning onboarding to minimize setup time and help teams quickly grasp and benefit from the product.
          </li>
        </Points>
      </Section>

      <Section id="research" nav="Research" title="Gaining technical knowledge to drive impactful design decisions">
        <p className="text-body">Designing for complex enterprise tools requires a deep understanding of both the product and its technical foundation. During my internship at Dashworks, I conducted a comprehensive product audit, analyzing its entire ecosystem to identify areas for improvement. This process helped bridge the gap between design and engineering, ensuring that our solutions were both user-friendly and technically feasible.</p>
        <MediaCard mediaType="image" src="/images/projects/Dashworks/Audit.png" aspectClass="aspect-4/3" />
        <AnswerFigure />
      </Section>

      <Section id="design-system" nav="Design system" title="Design System">
        <p className="text-body">Our team set a goal to deliver our product faster to meet customer demands and stand out in a competitive market. To reach this goal, we needed a design system for better quality and speed.</p>
        <MediaCard mediaType="image" src="/images/projects/Dashworks/Dashworks-Design-System.png" aspectClass="aspect-4/3" />
        <CompareSlider
          before={{ src: '/images/projects/Dashworks/Dark.png', alt: 'Dark theme design system' }}
          after={{ src: '/images/projects/Dashworks/Light.png', alt: 'Light theme design system' }}
        />
        {/* The modal suite, live. It needs room, so it sits out on phones. */}
        <div className="relative w-full my-3 md:block hidden">
          <ModalGrid />
        </div>
      </Section>

      <Section id="website" nav="Website" title="New Website">
        <p className="text-body">I led a comprehensive redesign of our website and social media presence. Managing a team of freelance developers and designers, we crafted a fresh look with branded graphics and collateral. This effort resulted in a substantial increase in website traffic, reaching a significantly larger audience.</p>
        <MediaCard mediaType="image" src="/images/projects/Dashworks/Dashworks-Website-1.png" aspectClass="aspect-4/3" />
        <MediaCard mediaType="image" src="/images/projects/Dashworks/Dashworks-Website-2.png" aspectClass="aspect-4/3" />
        <MediaCard mediaType="image" src="/images/projects/Dashworks/Dashworks-Website-3.png" aspectClass="aspect-4/3" />
      </Section>

      <Section id="onboarding" nav="Onboarding" title="Onboarding">
        <p className="text-body">Redesigning onboarding to minimize setup time and help teams quickly grasp and benefit from the product.</p>
        <MediaCard mediaType="image" src="/images/projects/Dashworks/Dashworks-Onboarding-1.png" aspectClass="aspect-4/3" />
        <MediaCard mediaType="image" src="/images/projects/Dashworks/Dashworks-Onboarding-2.png" aspectClass="aspect-4/3" />
      </Section>
    </CaseStudy>
  );
}
