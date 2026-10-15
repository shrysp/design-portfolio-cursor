'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IconArrowRight } from 'nucleo-micro-bold-essential';
import { startRouteTransition } from '@/lib/routeTransition';
import { useSitePath } from '@/lib/sitePath';

interface ProjectThumbnailCardProps {
  name: string;
  link: string;
  children: React.ReactNode;
}

export default function ProjectThumbnailCard({ name, link, children }: ProjectThumbnailCardProps) {
  const router = useRouter();
  // Under /dive the card opens the review copy of the project
  const href = useSitePath().to(link);

  // A plain click morphs the thumbnail into the project's hero. Anything
  // else (new tab, new window) is left to the link.
  const openWithTransition = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    startRouteTransition(() => router.push(href));
  };

  return (
    <Link href={href} onClick={openWithTransition} className="isolate group w-full flex flex-col gap-4 cursor-pointer relative active:scale-[0.98] md:active:scale-100 transition-transform duration-100">
      {/* Header */}
      <div className="column flex justify-between items-center">
        {/* Shares a name with the title on the project page, so one becomes the other */}
        <h2
          className="text-header mx-0 w-auto text-gradient-primary"
          style={{ viewTransitionName: `project-title-${link.split('/').filter(Boolean).pop()}` }}
        >
          {name}
        </h2>
        <Button
          variant="iconPrimary"
          size="icon"
          className="size-8 max-md:aqua-lit md:group-hover:aqua-lit"
        >
          <IconArrowRight className=" transition-transform duration-200" size={16} />
        </Button>
      </div>
      
      {/* Content (description + image passed as children) */}
      {children}
      
      {/* Hover background - covers entire card. The glass of the case study
          callouts without its shadows: the milky fill, the rim light and a
          hairline edge. It fades in, since a gradient can't be eased from
          nothing the way a flat colour can. */}
      <div className="bg-linear-to-b from-white/80 to-white/40 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.95),inset_0_0_0_1px_rgb(255_255_255/0.5),0_0_0_1px_rgb(0_0_0/0.05)] absolute -inset-2 md:-inset-4 scale-100 md:scale-97 md:opacity-0 transition-[scale,opacity] duration-200 ease-out md:group-hover:scale-100 md:group-hover:opacity-100 md:group-active:scale-y-99 md:group-active:scale-x-[0.99] md:rounded-3xl rounded-t-xl rounded-b-3xl -z-10"></div>
    </Link>
  );
}

