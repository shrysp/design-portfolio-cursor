"use client";

import React from 'react';
import { ChartBar, RedditLogo } from '@phosphor-icons/react';

import MediaCard from '@/components/MediaCard';
import { CaseStudy, Hero, Meta, Section, SubSection, Kicker, Callout, FigureRow, PullQuote } from '@/components/case-study/CaseStudy';

// Import the project data
import { projectsData } from '@/data/projectsData';

export default function WeatherWiseProject() {
  const project = projectsData[3];

  return (
    <CaseStudy title={project.title}>
      <Hero
        slug="weatherwise"
        src="/images/projects/Weatherwise/WeatherWise-Thumbnail.webp"
        background="/images/projects/thumbnails/WeatherWiseThumbnail-Background.webp"
        alt={`${project.title} - main image`}
      >
        <Meta
          items={[
            { label: 'My Role', value: 'Product Designer' },
            { label: 'Timeline', value: '16th Jan 2024' },
            { label: 'Project Setup', value: '24hr Sprint' },
          ]}
        />
      </Hero>

      <Section id="overview" nav="Overview" title="Improving Navigational Safety with Weather-Adaptive Routing in Google Maps">
        <p className="text-body">Over a 24 hr period, I undertook a design exercise to integrate real-time weather data into Google Maps. This project was a straightforward attempt to enhance route planning by adding weather alerts and alternative route suggestions, aimed at subtly improving user safety.</p>
      </Section>

      <Section id="inspiration" nav="Inspiration" title="A Personal Alarm and A Common Struggle">
        <p className="text-body">The project kicked off because of an accident my friend had, which was a big wake-up call for me. But there was more to it. Imagine trying to drive in the Northeast during the cold months. The roads can be really unpredictable because of the weather - like sudden snow or ice. It&apos;s pretty stressful not knowing what you&apos;ll face. So, I thought, why not create something that helps drivers know the weather ahead of time? This way, they can be better prepared or choose a safer route.</p>
        <MediaCard
          mediaType="image"
          src="/images/projects/Weatherwise/Car_accident.jpg"
          aspectClass="aspect-4/3"
          caption="The project kicked off because of an accident my friend had, which was a big wake-up call for me."
        />
      </Section>

      <Section id="research" nav="Research" title="Quick Statistics">
        <Callout label="Statistic" icon={<ChartBar size={14} weight="fill" />} title="Annual Fatality Comparison">
          <p className="text-body mx-0">The data reveals that weather-related car crashes cause approximately 15 times more fatalities annually than all major weather disasters combined in the United States.</p>
          {/* The two figures as bars, drawn to scale */}
          <div className="isolate relative flex items-center justify-start p-4 md:text-lg text-sm font-semibold text-white w-full h-16 bg-gradient-to-b from-blue-500 to-blue-700 border border-blue-500 mt-3 rounded-2xl overflow-hidden">
            <div className="absolute bg-[url(/svgs/diagonal-stripes.svg)] opacity-40 inset-0 bg-repeat -z-10" />
            <div className="absolute inset-x-1 top-0.5 h-1/2 bg-gradient-to-b from-white/40 to-white/20 rounded-t-xl rounded-b-md" />
            5,376-5,900 due to Weather-Related Car Crashes
          </div>
          <div className="isolate relative flex items-center justify-start h-16 mt-1">
            <div className="isolate absolute w-[7%] h-16 bg-gradient-to-b from-blue-500 to-blue-700 border border-blue-500 rounded-2xl overflow-hidden">
              <div className="absolute bg-[url(/svgs/diagonal-stripes.svg)] opacity-40 inset-0 bg-repeat -z-10" />
              <div className="absolute inset-x-1 top-0.5 h-1/2 bg-gradient-to-b from-white/40 to-white/20 rounded-t-xl rounded-b-md" />
            </div>
            <div className="md:text-lg text-sm font-semibold pl-[calc(7%+0.75rem)] text-blue-500">375-379 due to Large-Scale Weather Disasters</div>
          </div>
        </Callout>

        <Callout label="Statistic" icon={<ChartBar size={14} weight="fill" />} title="Significance of Rain and Snowy Conditions">
          <p className="text-body mx-0">Weather conditions significantly impact road safety, with a substantial portion of crashes occurring during adverse weather.</p>
          <div className="md:grid md:grid-cols-2 flex flex-col gap-4 mt-4">
            <div>
              <p className="text-3xl font-semibold text-blue-500 mb-2">21%</p>
              <p className="text-body mx-0">of the car crashes are weather-related.</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-blue-500 mb-2">418,000</p>
              <p className="text-body mx-0">people are injured in crashes that occurred in snowy or icy conditions, Annually.</p>
            </div>
          </div>
        </Callout>

        <SubSection title="Problem Statement">
          <p className="text-body">Despite technological advancements, unpredictable weather still surprises us on the road, creating a clear disconnect.</p>
        </SubSection>

        <SubSection title="Key takeaway from Secondary Research">
          <p className="text-body">Drivers often face sudden weather changes that turn routine trips into risky journeys, yet many Reddit users highlight the lack of real-time weather alerts in navigation apps, emphasizing the need for safer, weather-aware routing.</p>
        </SubSection>

        <SubSection title="A Shared Concern of Unpredictable Weather on the Road on Reddit">
          <div className="md:grid md:grid-cols-2 flex flex-col gap-4">
            <Callout label="Reddit" tone="orange" icon={<RedditLogo size={15} weight="fill" />} title="Weather Warnings missing from Waze">
            <p className="text-body mx-0">I vividly remember the day I narrowly avoided driving straight into a severe thunderstorm, thanks to a quick check on my weather app. It struck me then how invaluable it would be to have these alerts directly in our navigation systems.</p>
          </Callout>
            <Callout label="Reddit" tone="orange" icon={<RedditLogo size={15} weight="fill" />} title="Weather along the route?">
            <p className="text-body mx-0">Hi, I don&apos;t think Google Maps can show you the weather along your planned router like where it is snowing, where it&apos;s raining, etc. I&apos;m trying to plan 26-hour trip and need to see the weather of all the cities on my route as I travel. Is there any other navigation app which can help me in this regards?</p>
          </Callout>
            <Callout label="Reddit" tone="orange" icon={<RedditLogo size={15} weight="fill" />} title="Real time weather" className="md:col-span-2">
            <p className="text-body mx-0">I have always wondered why an integrated weather alert system couldn&apos;t be applied. For example, last summer I was on a long road trip driving west across Tennessee. The clouds ahead were very dark so I asked my son to check the weather app. Sure enough we were under a severe thunderstorm earning with high wind and hail. We pulled over to a safe location. Had we not looked, we would have been in the middle of it. I get the community reported weather, but if it knows my route and there is a warning issued for something, it would be very helpful to be warned.</p>
          </Callout>
          </div>
        </SubSection>

        <SubSection title="How People deal with this currently">
          <p className="text-body">During my NYC trip, I utilized a weather app and maps to find safer routes, a simple yet effective approach. I noticed this pattern among other users as well. However, this method is not foolproof, as weather is not static but continually changes. It&apos;s a band-aid solution that many have adopted, yet it&apos;s far from ideal.</p>
          <Callout label="Reddit" tone="orange" icon={<RedditLogo size={15} weight="fill" />} title="Checking Hourly Forecasts">
            <p className="text-body mx-0">I would screenshot the hourly forecast for the areas you&apos;ll pass through showing the time you expect to pass through, and I would do it the day before you leave.</p>
          </Callout>
        </SubSection>
      </Section>

      <Section id="design" nav="Design" title="Crafting Intuitive Weather-Aware Routing">
        <p className="text-body">Throughout the development of this weather-informed routing feature, I engaged in a dynamic design process that unfolded across three pivotal stages. Each stage brought us closer to a design that not only delivers critical information but does so in a way that feels intuitive and reassuring to users.</p>

        <SubSection title="Weather Condition Alerts on Map">
          <p className="text-body">Notifying users of any adverse weather conditions along their planned route. The map visually distinguishes these areas with clear highlighting and warning icons, ensuring that users are aware of potential risks before they encounter them.</p>

          <Kicker>Iteration 1</Kicker>
          <h4 className="text-header-2">Navigating Visual Clutter</h4>
          <p className="text-body">My first attempt was to signal weather conditions with a circular overlay. Though well-intentioned, this cluttered the interface, especially on smaller screens.</p>
          <FigureRow>
            <MediaCard mediaType="image" src="/images/projects/Weatherwise/Circular-overlay-focused.png" aspectClass="aspect-square" alt="Circular overlay design iteration" />
            <MediaCard mediaType="image" src="/images/projects/Weatherwise/cloud-overaly-focused.png" aspectClass="aspect-square" alt="Cloud overlay design iteration" />
          </FigureRow>

          <Kicker>Iteration 2</Kicker>
          <h4 className="text-header-2">Mixing Traffic and Weather Alerts Caused Confusion</h4>
          <p className="text-body">Next, I tried color codes for traffic and badges for weather. This led to confusion, mixing up weather alerts with traffic info—a valuable lesson in the importance of clear visual language.</p>
          <FigureRow>
            <MediaCard mediaType="image" src="/images/projects/Weatherwise/Same-line-traffic.png" aspectClass="aspect-square" alt="Traffic and weather alerts on same line" />
            <MediaCard mediaType="image" src="/images/projects/Weatherwise/Same-line-Weather.png" aspectClass="aspect-square" alt="Weather alerts mixed with traffic" />
          </FigureRow>
          <PullQuote by="User">I was confused by the color codes, thinking they were traffic alerts.</PullQuote>

          <Kicker>Iteration 3</Kicker>
          <h4 className="text-header-2">Achieving Clarity Through Wrapping</h4>
          <p className="text-body">The breakthrough came with a wrapping design for affected roads, clearly separating weather from traffic info. This balance of clarity and intuition was the key, making navigation safer and more straightforward.</p>
          <FigureRow>
            <MediaCard mediaType="image" src="/images/projects/Weatherwise/Wrapping-Traffic.png" aspectClass="aspect-square" alt="Wrapping design for traffic alerts" />
            <MediaCard mediaType="image" src="/images/projects/Weatherwise/Wrapping-weather.png" aspectClass="aspect-square" alt="Wrapping design for weather alerts" />
          </FigureRow>
          <MediaCard mediaType="image" src="/images/projects/Weatherwise/Weather-Wise-Warning.png" aspectClass="aspect-4/3" />
        </SubSection>

        <SubSection title="Trip Scheduling with Weather Forecasts">
          <p className="text-body">I introduced a proactive planning tool that integrates weather forecasts with trip scheduling. This feature empowers users to plan their journeys based on anticipated weather conditions, fostering a sense of confidence and control over their travel plans, ensuring they feel secure and comfortable.</p>
          <MediaCard mediaType="image" src="/images/projects/Weatherwise/WeatherWise-Planning.png" aspectClass="aspect-4/3" caption="Trip scheduling integrates weather forecasts, empowering users to plan journeys with confidence and comfort." />
        </SubSection>

        <SubSection title="In-Car Weather Change Alerts">
          <p className="text-body">This feature keeps drivers updated with real-time weather changes directly on their route, adapting quickly as conditions evolve. It&apos;s designed to enhance road safety, ensuring travelers are never caught off guard by sudden weather shifts.</p>
          <MediaCard mediaType="image" src="/images/projects/Weatherwise/In-Car-Notification-mockup.webp" aspectClass="aspect-3/2" caption="In-car notifications keep drivers updated with real-time weather changes along their route." />
        </SubSection>

        <SubSection title="Intuitive Route Option Badges">
          <p className="text-body">The challenge was to present essential route information in a simplified manner. My solution—a system of easily distinguishable badges for the fastest, safest, and weather-impacted routes—balances clarity with subtlety. This approach enables users to make quick, informed choices without feeling overwhelmed by details. The badges, especially those indicating weather conditions, are designed to offer a quick grasp of how weather might affect each route, enhancing user decision-making with safety and ease at the forefront.</p>
          <MediaCard mediaType="image" src="/images/projects/Weatherwise/Badge-System.png" aspectClass="aspect-7/2" caption="Route badges help users quickly identify the fastest, safest, and weather-impacted routes." />
          <MediaCard mediaType="image" src="/images/projects/Weatherwise/Weather-Wise-Safer-Route.png" aspectClass="aspect-4/3" />
        </SubSection>
      </Section>
    </CaseStudy>
  );
}
