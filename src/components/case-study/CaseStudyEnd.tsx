"use client";

import { useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useDialKit } from "dialkit";
import ProjectThumbnailCard from "@/components/ProjectThumbnailCard";
import SectionTitle from "@/components/SectionTitle";
import { projectMeta, type ProjectSlug } from "@/lib/projectMeta";

const slugs = Object.keys(projectMeta) as ProjectSlug[];

// PROTOTYPE: how a case study ends, two ways, switched from the DialKit panel.
//   dock: as it is today. The row of project buttons rises above the dock.
//   card: the next project as a card, the same one as on the home page, which
//         opens with the same morph. The dock's row can stay or step aside.
// Once a version is chosen the dials go and the values are written in.
export default function CaseStudyEnd() {
  const slug = usePathname()?.split("/").filter(Boolean).pop() as ProjectSlug | undefined;

  const dial = useDialKit("Case study ending", {
    version: {
      type: "select",
      options: [
        { value: "card", label: "Next project card (proposed)" },
        { value: "dock", label: "Dock buttons (current)" },
      ],
      default: "card",
    },
    card: {
      spaceAbove: [96, 32, 240, 8],
      // The picture's height as a share of its width: 0.75 is the whole 4:3 thumbnail
      pictureHeight: [0.32, 0.15, 0.75, 0.01],
      description: false,
      keepDockButtons: true,
    },
  });

  const showCard = dial.version === "card";
  const hideDockButtons = showCard && !dial.card.keepDockButtons;

  // The dock lives outside the page, so it's told through the stylesheet
  // (see `data-case-end` in globals.css)
  useEffect(() => {
    if (!hideDockButtons) return;
    document.documentElement.dataset.caseEnd = "card";
    return () => {
      delete document.documentElement.dataset.caseEnd;
    };
  }, [hideDockButtons]);

  const index = slug ? slugs.indexOf(slug) : -1;
  if (!showCard || index === -1) return null;

  // After the last project the run starts again
  const nextIndex = (index + 1) % slugs.length;
  const nextSlug = slugs[nextIndex];
  const next = projectMeta[nextSlug];

  return (
    <nav aria-label="Next project" className="column flex flex-col gap-8" style={{ marginTop: dial.card.spaceAbove - 64 }}>
      <SectionTitle count={nextIndex + 1} total={slugs.length}>
        Next project
      </SectionTitle>
      <ProjectThumbnailCard name={next.title} link={`/projects/${nextSlug}`}>
        {dial.card.description && <div className="text-body text-pretty">{next.description}</div>}
        {/* The top of the project's thumbnail, peeking: it opens into the full hero */}
        <div
          className="relative w-full mt-4 bg-cover bg-top surface"
          style={{
            aspectRatio: `1 / ${dial.card.pictureHeight}`,
            backgroundImage: `url("${next.background}")`,
            viewTransitionName: `project-${nextSlug}`,
          }}
        >
          <Image src={next.hero} alt={next.title} fill sizes="(min-width: 672px) 672px, 100vw" className="object-cover object-top" />
        </div>
      </ProjectThumbnailCard>
    </nav>
  );
}
