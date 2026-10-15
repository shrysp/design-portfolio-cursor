'use client';

import { IconClipboard, IconCode, IconCursorDefault, IconKeyboard, IconMicrophone, IconVolumeUp } from 'nucleo-micro-bold-essential';
import CameoCharacters from '@/components/cameo/CameoCharacters';
import { Face, Step, Term } from '@/components/cameo/Inline';
import TankFigure from '@/components/figures/tank/TankFigure';
import ControlsFigure from '@/components/figures/controls/ControlsFigure';
import TapeFigure from '@/components/figures/tape/TapeFigure';
import DiscFigure from '@/components/figures/disc/DiscFigure';
import TourEntrance from '@/components/cameo/entrance/TourEntrance';
import { CaseStudy, Hero, Meta, Section, SubSection, Points, Callout } from '@/components/case-study/CaseStudy';

// Import the project data
import { projectsData } from '@/data/projectsData';

const link = 'underline underline-offset-4 hover:text-stone-800';

export default function CameoCaseStudy({ unlocked, phone }: { unlocked: boolean; phone: boolean }) {
  const project = projectsData.find((p) => p.title === 'Cameo')!; // by title, so the list can be reordered

  return (
    <CaseStudy title={project.title}>
      {/* The hero is the package itself, running, in place of a picture of it */}
      <Hero
        slug="cameo"
        media={<CameoCharacters names={['JADE', 'NOVA', 'PIP', 'TIDE']} size={124} />}
        caption="The four characters that ship with the package, live. Move the cursor near them."
      >
        <Meta
          items={[
            { label: 'My Role', value: project.role },
            { label: 'Timeline', value: project.timeline },
            {
              label: 'Links',
              value: (
                <>
                  <a className={link} href="https://usecameo.vercel.app" target="_blank" rel="noreferrer">
                    Playground
                  </a>
                  {' · '}
                  <a className={link} href="https://www.npmjs.com/package/@shrysp/cameo" target="_blank" rel="noreferrer">
                    npm
                  </a>
                </>
              ),
            },
          ]}
        />
      </Hero>

      <Section id="origin" nav="Origin" title="Where it started">
        <p className="text-body">
          About a year ago, talking to an AI felt like reading a wall of text. I thought it could have
          far more personality than that, and I kept coming back to the robots in WALL-E, who show who
          they are with little more than a pair of eyes.
        </p>
        <p className="text-body">
          I designed a character along those lines in Figma, and there it sat for a long time. What got
          it moving was a post from Benji Taylor, who had animated a character for Grok entirely in
          code. It was only a circle with eyes, but it expressed everything the product needed. That
          was the push to build mine the same way.
        </p>
        <p className="text-body">
          The goal was a system, not a mascot: one face that can show everything an AI product now
          shows with spinners, icons and text, and with enough personality that it is not boring. The
          four at the top of this page are the real thing running, not a recording.
        </p>
      </Section>

      <Section id="vocabulary" nav="Vocabulary" title="Three ways to direct it">
        <p className="text-body">
          A product should not have to animate a face. It only says what is happening, and the character
          works out how to show it. There are three things a product can say.
        </p>
        <Points>
          <li>
            <span className="font-semibold">A state</span> is what the product is doing right now. It
            stays until the product changes it: <Face pose="thinking">thinking</Face> for as long as a
            request takes, <Face pose="speaking">speaking</Face> while the answer plays.
          </li>
          <li>
            <span className="font-semibold">A gesture</span> is one movement that plays once and ends by
            itself, like a <Face pose="nod">nod</Face> or a <Face pose="wink">wink</Face>.
          </li>
          <li>
            <span className="font-semibold">An event</span> is something that just happened, such as a
            success or an error. The face reacts for a moment, <Face pose="happy" /> and then goes back
            to the state it was in.
          </li>
        </Points>
        <p className="text-body">
          Try each one below. The lever is a state, the keys are gestures, and the lamps at the back are
          events. The paper strip along the front draws what the face did, which shows the difference
          at a glance: a step that stays up, a short spike, and a bump that comes back down.
        </p>
        <ControlsFigure />
        <div className="text-body">
          Emotions such as <Face pose="love">love</Face> or <Face pose="surprised">surprise</Face> exist too,
          but they work better as short reactions than as states. A face that stays delighted stops
          meaning anything.
        </div>
      </Section>

      <Section id="senses" nav="Senses" title="What it notices by itself">
        <div className="text-body">
          Some behaviour needs no code at all, because the character watches the page it sits on. It
          follows the <Term icon={<IconCursorDefault size={14} />}>cursor</Term>, listens while someone
          is <Term icon={<IconKeyboard size={14} />}>typing</Term>, winks <Face pose="wink" /> when
          something is <Term icon={<IconClipboard size={14} />}>copied</Term>, and falls asleep{' '}
          <Face pose="sleeping" /> when nothing happens.
        </div>
        <div className="text-body">
          All of that runs on one number: attention. Anything that happens nearby raises it, and time
          lowers it. How high it is decides how awake the character looks: <Face pose="listening">attentive</Face>, <Face pose="idle">idle</Face>, <Face pose="drowsy">drowsy</Face> or{' '}
          <Face pose="sleeping">asleep</Face>.
        </div>
        <p className="text-body">
          The tank below is that number. Press an event to fill it, then leave it alone and watch it
          drain.
        </p>
        <TankFigure />
        <p className="text-body">
          Two details here are deliberate. An event fills the tank to its own mark and no higher, so a
          hundred clicks cannot make the character more alert than one. And it falls asleep slowly but
          wakes at once, which is what makes it seem eager.
        </p>
      </Section>

      <Section id="voice" nav="Voice" title="It reacts to what is being said">
        <div className="text-body">
          When the character speaks, its face follows the real{' '}
          <Term icon={<IconVolumeUp size={14} />}>sound</Term>. The eyes move with how loud the voice
          is, and the head dips on the words that are stressed. Given a{' '}
          <Term icon={<IconMicrophone size={14} />}>microphone</Term>, it starts listening when someone
          actually speaks and relaxes when they stop.
        </div>
        <div className="text-body">
          It also reacts to what is being said. In the tour, every sentence goes to Jev, a fast model
          from TypeSafe that reads its mood: <Face pose="starstruck">excited</Face>, <Face pose="curious">curious</Face>, <Face pose="surprised">surprised</Face>, <Face pose="error">an error</Face>,{' '}
          <Face pose="angry">frustrated</Face> or <Face pose="sad">sad</Face>.
        </div>
        <div className="text-body">
          The surprising part is the timing: the face changes while the sentence is still being spoken.
          The tape deck below shows why, in three numbered steps. The words are written <Step n={1} />,
          their mood is read <Step n={2} /> a third of a second later, and only after that does the
          voice finish saying them <Step n={3} />.
        </div>
        <TapeFigure />
        <SubSection title="How a mood is picked up">
          <ol className="text-body flex flex-col gap-3">
            <li className="flex gap-3">
              <span className="pt-0.5">
                <Step n={1} />
              </span>
              <span>
                <span className="font-semibold">The words are written.</span> The voice model sends a
                transcript of what it is saying, about a second ahead of the sound. On the deck, that
                is the tape reaching the reading head.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="pt-0.5">
                <Step n={2} />
              </span>
              <span>
                <span className="font-semibold">The sentence is read, and the face changes.</span> Each
                finished sentence goes to Jev, and its mood comes back in about a third of a second.
                The strongest mood picks the face, and how sure the reading is sets how big the
                reaction is.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="pt-0.5">
                <Step n={3} />
              </span>
              <span>
                <span className="font-semibold">The voice finishes the sentence.</span> By then the
                face has already changed, usually more than half a second earlier. That gap is the
                tape still travelling to the playing head.
              </span>
            </li>
          </ol>
        </SubSection>
        <p className="text-body">
          The tape is PIP&apos;s real voice from a live session, and every lamp lights at the moment its
          reading came back. In the tour the same reading also picks which photos come to the centre.
          The reactions are short and silent on purpose: a guide should look attentive, not like a
          puppet show.
        </p>
      </Section>

      <Section id="motion" nav="Motion" title="How it moves">
        <p className="text-body">
          Most animation moves forward one frame at a time. Cameo&apos;s engine works differently: give it
          any moment in time and it works out the face for that moment directly. So it can pause, skip
          ahead or run backwards without losing its place, and a face scrolled off the page costs
          nothing.
        </p>
        <p className="text-body">
          The disc below is one change of expression, cut like a groove in a record. Drag the slider to
          any moment. Then switch off one of the five details that make the change feel alive, and
          watch its groove go flat:
        </p>
        <Points>
          <li>
            <span className="font-semibold">Anticipation.</span> The eyes squint for a moment before
            they open wide.
          </li>
          <li>
            <span className="font-semibold">Eyes lead.</span> The eyes move first and the body follows.
          </li>
          <li>
            <span className="font-semibold">Blink.</span> A quick blink as the change begins.
          </li>
          <li>
            <span className="font-semibold">Settle.</span> The eyes go slightly too far, then come back.
          </li>
          <li>
            <span className="font-semibold">Head arc.</span> The head travels in a curve, not a straight
            line.
          </li>
        </Points>
        <DiscFigure />
        <p className="text-body">
          Those five are how a change is carried. A second set of controls covers what the character
          does without being asked: blinking, glancing around, breathing, and how long its attention
          lasts. And if a visitor has asked their device for reduced motion, the character respects
          that, always.
        </p>
      </Section>

      <Section id="characters" nav="Characters" title="One family, many faces">
        <div className="text-body">
          Four characters ship with the package: <Face preset="JADE">Jade</Face>, <Face preset="NOVA">Nova</Face>, <Face preset="PIP">Pip</Face> and <Face preset="TIDE">Tide</Face>. Each has its own head shape,
          eyes and colour, and all share the same cream shell and recessed screen, so they read as one
          family. Any closed outline, such as a logo, can become a head, with the screen and eyes fitted
          inside.
        </div>
        <div className="text-body">
          Colour carries meaning, which sets a limit. An error turns the face red <Face pose="error" />{' '}
          on every character, so a character that is already red would show it less clearly.
        </div>
      </Section>

      <Section id="builders" nav="Builders" title="Designed for the people building with it">
        <div className="text-body">
          A package is used through its <Term icon={<IconCode size={14} />}>code</Term>, so that was
          designed too. A complete character is one line. State names are typed, so an editor suggests
          them. Sound is off until someone asks for it. The documentation has recipes for a chat
          assistant, a voice assistant and a corner avatar, and a plain-text version written for coding
          agents.
        </div>
      </Section>

      {/* The tour's own pages send visitors without a code back to #tour */}
      <Section id="tour" nav="Tour" title="In use: PIP gives a tour">
        <p className="text-body">
          To see what the character adds to a real conversation, I built a spoken tour of my own
          background. PIP, one of the four characters, answers questions out loud. Its face follows its
          own voice and the mood of each sentence, and when it mentions a real moment, the photo of that
          moment comes to the centre of the stage. Point at a photo and it tells you the story behind it.
        </p>

        {/* The walkthrough video goes here: swap this block for a MediaCard with mediaType="video". */}
        <div className="column my-3 aspect-video surface bg-stone-100 flex items-center justify-center text-sm text-stone-400">
          Walkthrough video coming soon
        </div>

        <Callout title="Try it yourself">
          <p className="text-body mx-0">
            The live tour runs on voice models that are billed by the minute, so it is open by invitation.
            If you have an access code, start the tour and PIP will ask for it. You will need a microphone.
          </p>
          <div className="pt-2">
            <TourEntrance unlocked={unlocked} phone={phone} />
          </div>
        </Callout>
      </Section>
    </CaseStudy>
  );
}
