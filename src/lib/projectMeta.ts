import type { Metadata } from "next";

// What a case study is called in a browser tab and how it reads when its link
// is shared. The share images are composed from each project's hero by
// `npm run og:generate` (scripts/generate-og-images.mjs), which reads `hero`
// and `background` from here.
export const projectMeta = {
  quinn: {
    title: "Quinn",
    description:
      "An AI-native relationship intelligence product for how executives manage their professional networks. I led the product vision, from foundations to growth direction.",
    hero: "/images/projects/Quinn/Masterlist.webp",
    background: "/images/projects/thumbnails/HalftoneDots.webp",
  },
  itinerai: {
    title: "ItinerAI",
    description:
      "An experimental travel assistant where AI agents, each with its own personality and focus, plan and coordinate trips together like a well-aligned team.",
    hero: "/images/projects/ItinerAI/ItinerAI-Thumbnail.png",
    background: "/images/projects/thumbnails/ItinearAI-Thumbnail-Background.webp",
  },
  dashworks: {
    title: "Dashworks",
    description:
      "An AI-powered knowledge assistant that answers employee questions by searching across a company's connected apps. Design system, website and onboarding.",
    hero: "/images/projects/Dashworks/Dashworks-Onboarding-1.png",
    background: "/images/projects/thumbnails/Dashworks-Thumbnail-Background.webp",
  },
  weatherwise: {
    title: "WeatherWise",
    description: "Improving navigational safety with weather-adaptive routing in Google Maps.",
    hero: "/images/projects/Weatherwise/WeatherWise-Thumbnail.webp",
    background: "/images/projects/thumbnails/WeatherWiseThumbnail-Background.webp",
  },
} as const;

export type ProjectSlug = keyof typeof projectMeta;

/** The metadata for one case study's page. Used by each project folder's layout. */
export function projectMetadata(slug: ProjectSlug): Metadata {
  const { title, description } = projectMeta[slug];
  const image = { url: `/og/${slug}.jpg`, width: 1200, height: 630, alt: `${title}, a case study by Shreyas Patil` };

  return {
    title,
    description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: `${title} | Shreyas Patil`,
      description,
      type: "article",
      url: `/projects/${slug}`,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Shreyas Patil`,
      description,
      images: [image.url],
      creator: "@ShreyasPatil_",
    },
  };
}
