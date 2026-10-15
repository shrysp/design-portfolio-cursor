"use client";

import React, { useEffect, useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import ProjectThumbnailCard from '@/components/ProjectThumbnailCard';
import { CraftWall, craftCount } from '@/components/CraftContent';
import CameoCharacters from '@/components/cameo/CameoCharacters';
import StickOnSticker, { STICK_ON_DEFAULTS } from '@/components/StickOnSticker';
import HandNote from '@/components/HandNote';
import SectionTitle from '@/components/SectionTitle';
import { ExpandableJournal } from '@/components/journal/ExpandableJournal';
import { clearReturningFrom, peekReturningFrom } from '@/lib/routeTransition';
import { useSitePath } from '@/lib/sitePath';


// ── Animation timeline ──
// Stickers are stuck on one by one, `stagger` apart. The journal appears as the
// last of them goes down, then the name, then the content. Everything after the
// stickers is timed from them, so slowing the stickers slows the whole sequence.

const slideIn = (delay: number) => ({
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, delay, ease: "easeOut" as const }
  }
});

// The stickers in the hero, counting the "Click to know more" note in its slot
const STICKER_SLOTS = 5;
// Seconds between one sticker going on and the next
const STICKER_STAGGER = 0.22;
// How fast the handwritten notes write themselves; 1 is the font's natural pace
const NOTE_SPEED = 6;

// Where a project card's top sits after coming back to it: level with the
// title on the project page, so the title barely has to move
const RETURN_OFFSET = 88;

export default function Home() {
  // Set when the visitor arrives by the back button on a project page. The
  // page then opens on that project's card with no entrance animation, so the
  // project's hero and title can morph straight back into it.
  const [returnSlug] = useState(peekReturningFrom);
  // The home page is also the review copy's, at /dive, where its cards link under /dive
  const { to } = useSitePath();

  useLayoutEffect(() => {
    if (!returnSlug) return;
    // A project's card, or the section that leads to the page being returned from
    const card = document.querySelector(`a[href="${to(`/projects/${returnSlug}`)}"], [data-return="${returnSlug}"]`);
    if (!card) return;
    window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - RETURN_OFFSET, behavior: 'instant' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnSlug]);

  useEffect(() => clearReturningFrom(), []);

  const stickerDelay = (index: number) => index * STICKER_STAGGER;
  const stickOn = STICK_ON_DEFAULTS;

  // The journal comes in as the last sticker starts going down
  const journalDelay = stickerDelay(STICKER_SLOTS - 1) + 0.2;
  const journalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, delay: journalDelay, ease: "easeOut" as const } },
  };
  const nameVariants = {
    hidden: { opacity: 0, filter: "blur(4px)" },
    visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.4, delay: journalDelay + 0.22, ease: "easeOut" as const } },
  };
  const selectedWorkVariants = slideIn(journalDelay + 0.42);
  const craftVariants = slideIn(journalDelay + 0.57);

  const isReturning = returnSlug !== null;
  const initial = isReturning ? false : "hidden";

  // A sticker's handwritten note writes itself out once the sticker is pressed flat
  const noteDelay = (index: number) => stickerDelay(index) + stickOn.arrive * 0.5 + stickOn.press;
  const note = { instant: isReturning, speed: NOTE_SPEED, className: "font-normal text-[1rem] leading-[1.2]" };

  return (
    <div className="min-h-screen flex justify-center">
      <main className="relative w-full md:max-w-(--column) max-w-[377px]">

        <motion.div
          className="relative flex flex-col gap-16 items-start md:pt-32 pt-16 md:px-0 px-4 md:pb-24 pb-24"
          initial={initial}
          animate="visible"
        >

          <div className="w-full relative mb-0 md:gap-8 gap-12 items-center flex flex-col">

            {/* Expandable Journal area */}
            <div className="isolate relative z-10 group w-full md:w-[800px] h-80 flex items-center justify-center">

              {/* Journal — highest z-index, appears first */}
              <motion.div variants={journalVariants} className="relative z-20">
                <ExpandableJournal collapsedWidth={240} collapsedHeight={320} />
              </motion.div>

              {/* Stickers. Each is stuck down in turn, left edge first, the same
                  way the name sticker goes onto the journal; its note fades in
                  once it's flat. They overhang the section below, so they must
                  not swallow its hovers and clicks. */}
              <div className="contents pointer-events-none">
                <div className="hidden md:flex absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 gap-2">
                  <StickOnSticker
                    src="/images/About/Mission Peak Sticker.webp"
                    alt="Mission Peak sticker"
                    aspect={1148 / 1536}
                    imgClassName="z-[0] size-100 object-contain"
                    delay={stickerDelay(0)}
                    instant={isReturning}
                    {...stickOn}
                  />
                  <div className="absolute text-stone-500 text-left left-[15%] top-20 whitespace-nowrap"><HandNote {...note} delay={noteDelay(0)}>Mission Peak</HandNote></div>
                </div>

                {/* Shaniwar Wada: wide and low, laid over the foot of the Mission Peak sticker, as Ritchie is over the cricket one */}
                <div className="hidden md:flex z-[0] absolute top-[86%] left-[17%] -translate-x-1/2 -translate-y-1/2 gap-2">
                  <div className="absolute z-10 text-stone-500 text-left whitespace-nowrap -rotate-3 -bottom-7 left-[30%]"><HandNote {...note} delay={noteDelay(1)}>Based in Pune</HandNote></div>
                  <StickOnSticker
                    src="/images/About/Pune Sticker.webp"
                    alt="Shaniwar Wada, Pune, sticker"
                    aspect={865 / 440}
                    imgClassName="w-[19rem] h-auto object-contain"
                    delay={stickerDelay(1)}
                    instant={isReturning}
                    {...stickOn}
                  />
                </div>

                <motion.div
                  initial={isReturning ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut", delay: noteDelay(4) }}
                  className="hidden md:flex absolute -top-10 left-2/3 gap-2 items-center"
                >
                  <svg width="42" height="15" viewBox="0 0 42 15" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleY(-1)" }}>
                    <path d="M2.54828 0.0432179C2.2963 -0.0697398 2.00045 0.0429621 1.8875 0.294945L0.0467438 4.40124C-0.0662139 4.65322 0.046488 4.94906 0.298471 5.06202C0.550453 5.17498 0.846295 5.06227 0.959253 4.81029L2.59548 1.16026L6.24551 2.79648C6.4975 2.90944 6.79334 2.79673 6.9063 2.54475C7.01925 2.29277 6.90655 1.99693 6.65457 1.88397L2.54828 0.0432179ZM15.8438 10.5177L15.6714 10.0483L15.8438 10.5177ZM21.6997 7.17961L21.383 6.79267L21.6997 7.17961ZM2.34375 0.499473L1.87651 0.67747C2.52271 2.37374 3.55684 5.86028 5.64221 8.44332C6.69551 9.748 8.03834 10.8537 9.76489 11.3934C11.4959 11.9345 13.5582 11.8896 16.0161 10.987L15.8438 10.5177L15.6714 10.0483C13.3793 10.89 11.5458 10.9024 10.0632 10.439C8.57624 9.97417 7.38782 9.01359 6.42029 7.81516C4.46399 5.39199 3.49813 2.1252 2.81099 0.321475L2.34375 0.499473ZM15.8438 10.5177L16.0161 10.987C18.472 10.0852 20.4356 8.86022 22.0163 7.56655L21.6997 7.17961L21.383 6.79267C19.8787 8.02376 18.0112 9.18915 15.6714 10.0483L15.8438 10.5177ZM35.7867 6.65666L35.3794 6.94664C36.5667 8.61438 37.379 10.209 38.2294 11.583C39.0476 12.9049 39.9199 14.0528 41.1856 14.4747L41.3438 14.0004L41.5019 13.526C40.6123 13.2295 39.9028 12.3865 39.0797 11.0567C38.2888 9.77893 37.4002 8.06095 36.194 6.36669L35.7867 6.65666ZM21.6997 7.17961L22.0163 7.56655C24.4719 5.55691 26.972 4.18862 29.2665 3.92831C31.5095 3.67384 33.616 4.4697 35.3794 6.94664L35.7867 6.65666L36.194 6.36669C34.2334 3.61268 31.781 2.63663 29.1538 2.93469C26.578 3.22691 23.8966 4.73556 21.383 6.79267L21.6997 7.17961Z" fill="#A6A09B"/>
                  </svg>
                  <div className="text-stone-500 text-left w-32"><HandNote {...note} delay={noteDelay(4) + 0.2}>Click to know more about me</HandNote></div>
                </motion.div>

                <div className="hidden md:flex absolute -z-[1] top-2/3 right-1/5 translate-x-1/2 -translate-y-1/2">
                  <div className="absolute z-10 text-stone-500 text-left w-34 mt-2 left-1/2 bottom-1/5"><HandNote {...note} delay={noteDelay(3)}>MS in HCI @ RIT</HandNote></div>
                  <StickOnSticker
                    src="/images/About/RIT Ritchie Sticker.webp"
                    alt="RIT Ritchie sticker"
                    aspect={1536 / 1146}
                    imgClassName="size-140 object-contain"
                    delay={stickerDelay(3)}
                    instant={isReturning}
                    {...stickOn}
                  />
                </div>

                <div className="hidden md:flex -z-[2] absolute top-1/2 -right-15 translate-x-1/2 -translate-y-1/2">
                  <StickOnSticker
                    src="/images/About/Cricket Sticker.webp"
                    alt="Cricket sticker"
                    aspect={1}
                    imgClassName="h-120 w-auto max-w-none object-contain"
                    delay={stickerDelay(4)}
                    instant={isReturning}
                    {...stickOn}
                  />
                </div>
              </div>

            </div>

            {/* Name text — appears after stickers + 300ms hold */}
            <motion.div variants={nameVariants} className="md:hidden flex flex-col gap-4 text-stone-600 w-full">
              <div className="text-page-header text-gradient-primary">
                Hey, I&apos;m Shreyas
              </div>
              <p className="text-important text-pretty text-stone-600!">
                I&apos;m a Product Designer based in Pune, India. I think about interaction, systems, and the details people feel before they notice.
              </p>
            </motion.div>
          </div>

          {/* Projects section */}
          <motion.div
            id="selected-work"
            // The gap clears the pane a card grows on hover, which reaches a rem above it
            className="flex flex-col gap-8 w-full mt-20 scroll-mt-8"
            variants={selectedWorkVariants}
          >
            <SectionTitle count={5}>Selected Work</SectionTitle>
            <div className="w-full flex flex-col gap-20 items-start">
                  
              <ProjectThumbnailCard name="Cameo" link="/projects/cameo">
                <div className="text-body text-pretty">An expressive little face for AI interfaces, published as an npm package. It blinks, follows the cursor, and listens, thinks and speaks along with whatever your product is doing. I designed and built it, and used it to make a spoken tour of my own work.</div>
                <div className="relative w-full aspect-4/3 mt-4 bg-stone-100 surface" style={{ viewTransitionName: 'project-cameo' }}>
                  <CameoCharacters names={['PIP']} size={200} />
                </div>
              </ProjectThumbnailCard>

              <ProjectThumbnailCard name="Quinn" link="/projects/quinn">
                <div className="text-body text-pretty">AI-native relationship intelligence product focused on how executives manage and maintain their professional networks. Over three months, I shaped the product vision for the next 10–12 months: the system&apos;s foundations, long-term evolution, and growth direction.</div>
                <div className="relative w-full aspect-4/3 mt-4 bg-[url('/images/projects/thumbnails/HalftoneDots.webp')] bg-cover bg-center surface" style={{ viewTransitionName: 'project-quinn' }}>
                  <Image src="/images/projects/Quinn/Masterlist.webp" alt="Quinn" fill sizes="(min-width: 768px) 672px, 100vw" className="object-cover object-center" />
                </div>
              </ProjectThumbnailCard>

              <ProjectThumbnailCard name="ItinerAI" link="/projects/itinerai">
                <div className="text-body text-pretty">ItinerAI is an experimental travel assistant where multiple AI agents, each with a distinct personality and focus area, collaborate to help you plan and coordinate trips effortlessly. From surfacing the best flight options to optimizing your itinerary around your schedule, these agents communicate with each other and with you, just like a well-aligned team.</div>
                <div className="relative w-full aspect-4/3 mt-4 bg-[url('/images/projects/thumbnails/ItinearAI-Thumbnail-Background.webp')] bg-cover bg-center surface" style={{ viewTransitionName: 'project-itinerai' }}>
                  <Image src="/images/projects/ItinerAI/ItinerAI-Thumbnail.png" alt="ItinerAI" fill sizes="(min-width: 768px) 672px, 100vw" className="object-cover object-center" />
                </div>
              </ProjectThumbnailCard>

              <ProjectThumbnailCard name="Dashworks" link="/projects/dashworks">
                <div className="text-body text-pretty">Dashworks is an AI-powered knowledge assistant that helps companies centralize their knowledge scattered across various apps. It provides accurate answers to employee questions by searching across the company&apos;s connected applications.</div>
                <div className="relative w-full aspect-4/3 mt-4 bg-[url('/images/projects/thumbnails/Dashworks-Thumbnail-Background.webp')] bg-cover bg-center surface" style={{ viewTransitionName: 'project-dashworks' }}>
                  <Image src="/images/projects/Dashworks/Dashworks-Onboarding-1.png" alt="Dashworks" fill sizes="(min-width: 768px) 672px, 100vw" className="object-cover object-center" />
                </div>
              </ProjectThumbnailCard>

              <ProjectThumbnailCard name="WeatherWise" link="/projects/weatherwise">
                <div className="text-body text-pretty">Improving Navigational Safety with Weather-Adaptive Routing in Google Maps.</div>
                <div className="relative w-full aspect-4/3 mt-4 bg-[url('/images/projects/thumbnails/WeatherWiseThumbnail-Background.webp')] bg-cover bg-center surface" style={{ viewTransitionName: 'project-weatherwise' }}>
                  <Image src="/images/projects/Weatherwise/WeatherWise-Thumbnail.webp" alt="WeatherWise" fill sizes="(min-width: 768px) 672px, 100vw" className="object-cover object-center" />
                </div>
              </ProjectThumbnailCard>                  
              
            </div>
          </motion.div>

          {/* Craft section: the whole wall, edge to edge */}
          <motion.div
            className="flex flex-col gap-8 w-full mt-16"
            variants={craftVariants}
            data-return="craft"
          >
            <SectionTitle count={craftCount} transitionName="project-title-craft">Craft</SectionTitle>
            <CraftWall />
          </motion.div>

        </motion.div>

      </main>
    </div>
  );
}