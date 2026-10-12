'use client';

import { useRouter, usePathname } from 'next/navigation';
import { IconArrowLeft } from 'nucleo-micro-bold-essential';
import { Button } from '@/components/ui/button';
import { markReturningFrom, startRouteTransition } from '@/lib/routeTransition';

interface ProjectHeaderProps {
  title: string;
  className?: string;
  titleClassName?: string;
}

// The project's title, with the way back to the home page. On wide screens the
// back button lives in the left margin, at the head of the side rail, and stays
// there while the page scrolls. That leaves the title on the same edge as on
// the home page card, so the two can morph into each other.
// Nothing here animates in: it has to be on screen the moment the page arrives.
export default function ProjectHeader({ 
  title, 
  className = "", 
  titleClassName = "" 
}: ProjectHeaderProps) {
  const router = useRouter();
  const slug = usePathname()?.split('/').filter(Boolean).pop();

  return (
    <div className={`column flex items-center gap-4 ${className}`}>
      <Button
        variant="iconPrimary"
        size="icon"
        aria-label="Back to home"
        onClick={() => {
          // The home page lands on this project's card, so the hero and
          // title can morph back into it
          if (slug) markReturningFrom(slug);
          startRouteTransition(() => router.push('/', { scroll: false }));
        }}
        className="size-8 shrink-0 xl:fixed xl:z-40 xl:top-24 xl:left-[max(1.5rem,calc(50%-var(--column)/2-13rem))]"
      >
        <IconArrowLeft size={16} />
      </Button>

      <h1
        className={`text-header mx-0 w-auto text-stone-700 ${titleClassName}`}
        style={{ viewTransitionName: `project-title-${slug}` }}
      >
        {title}
      </h1>
    </div>
  );
}
