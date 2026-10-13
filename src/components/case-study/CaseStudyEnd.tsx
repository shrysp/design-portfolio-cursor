"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import ProjectThumbnailCard from "@/components/ProjectThumbnailCard";
import SectionTitle from "@/components/SectionTitle";
import CameoCharacters from "@/components/cameo/CameoCharacters";
import { projectMeta, type ProjectSlug } from "@/lib/projectMeta";

const slugs = Object.keys(projectMeta) as ProjectSlug[];

// The picture's height as a share of its width: the top of the 4:3 thumbnail
const PICTURE_HEIGHT = 0.32;

// Projects shown running in place of their picture, as in their own hero
const liveHeroes: Partial<Record<ProjectSlug, React.ReactNode>> = {
  cameo: <CameoCharacters names={["JADE", "NOVA", "PIP", "TIDE"]} size={96} />,
};

// How a case study ends: the next project as a card, the same one as on the
// home page, which opens with the same morph. The dock's row of project
// buttons stays alongside it for jumping anywhere else.
export default function CaseStudyEnd() {
  const slug = usePathname()?.split("/").filter(Boolean).pop() as ProjectSlug | undefined;
  const index = slug ? slugs.indexOf(slug) : -1;
  if (index === -1) return null;

  // After the last project the run starts again
  const nextIndex = (index + 1) % slugs.length;
  const nextSlug = slugs[nextIndex];
  const next = projectMeta[nextSlug];
  const live = liveHeroes[nextSlug];

  return (
    <nav aria-label="Next project" className="column flex flex-col gap-8 mt-8">
      <SectionTitle count={nextIndex + 1} total={slugs.length}>
        Next project
      </SectionTitle>
      <ProjectThumbnailCard name={next.title} link={`/projects/${nextSlug}`}>
        {/* The top of the project's thumbnail, peeking: it opens into the full hero */}
        <div
          className="relative w-full mt-4 bg-cover bg-top surface"
          style={{
            aspectRatio: `1 / ${PICTURE_HEIGHT}`,
            backgroundImage: `url("${next.background}")`,
            viewTransitionName: `project-${nextSlug}`,
          }}
        >
          {live ?? <Image src={next.hero} alt={next.title} fill sizes="(min-width: 672px) 672px, 100vw" className="object-cover object-top" />}
        </div>
      </ProjectThumbnailCard>
    </nav>
  );
}
