'use client';

import { motion } from 'framer-motion';
import ProjectHeader from '@/components/ProjectHeader';
import CameoCharacters from '@/components/cameo/CameoCharacters';
import TourAccess from '@/components/cameo/TourAccess';

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.3, delay },
});

const frame =
  'w-full rounded-3xl border border-slate-200 overflow-hidden shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]';

export default function CameoCaseStudy({ unlocked }: { unlocked: boolean }) {
  return (
    <div className="min-h-screen flex justify-center bg-stone-50">
      <main className="w-full max-w-[800px] flex flex-col gap-12">
        <div className="flex flex-col gap-16 items-start md:pt-24 pt-8 md:px-0 p-4 md:pb-24 pb-24">
          <ProjectHeader title="Cameo" />

          <div className="w-full flex flex-col gap-16">
            <div className="w-full flex flex-col gap-2">
              <motion.div {...rise(0.1)} className={`${frame} aspect-[4/3] mb-6 bg-stone-100 p-6`}>
                <CameoCharacters names={['JADE', 'NOVA', 'PIP', 'TIDE']} size={150} />
              </motion.div>

              <motion.div {...rise(0.35)}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h2 className="text-subheader font-bold text-gray-800 mb-1">My Role</h2>
                    <p className="text-gray-600 leading-relaxed">Design and engineering</p>
                  </div>
                  <div>
                    <h2 className="text-subheader font-bold text-gray-800 mb-1">Timeline</h2>
                    <p className="text-gray-600 leading-relaxed">2026</p>
                  </div>
                  <div>
                    <h2 className="text-subheader font-bold text-gray-800 mb-1">Links</h2>
                    <p className="text-gray-600 leading-relaxed">
                      <a className="underline" href="https://usecameo.vercel.app" target="_blank" rel="noreferrer">
                        Playground
                      </a>
                      {' · '}
                      <a
                        className="underline"
                        href="https://www.npmjs.com/package/@shrysp/cameo"
                        target="_blank"
                        rel="noreferrer"
                      >
                        npm
                      </a>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div {...rise(0.3)} className="flex flex-col gap-4">
              <h2 className="text-header text-gradient-primary">What is Cameo?</h2>
              <p className="text-body">
                Cameo is a small, expressive face for AI interfaces, published as an npm package. It blinks,
                breathes and follows the cursor, notices when someone types or copies, and can listen, think and
                speak along with whatever the product around it is doing. The four above are the real thing, not
                a recording: move the cursor near them.
              </p>
            </motion.div>

            <motion.div {...rise(0.3)} className="flex flex-col gap-4">
              <h2 className="text-header text-gradient-primary">A face that already knows how to behave</h2>
              <p className="text-body">
                A complete character is one line of code. Out of the box it tracks the cursor, flinches if the
                cursor rushes its face, listens while a text field has focus, winks when something is copied and
                dozes off when left alone. A product tells it what is happening in plain words — listening,
                thinking, speaking, an error — and the face eases from one state to the next.
              </p>
              <ul className="text-body space-y-2 list-disc list-inside">
                <li>Driven by real audio: the mouth moves with a voice, the eyes react to a microphone</li>
                <li>Four characters ship with it, and any closed shape, such as a logo, can become a head</li>
                <li>The viewer&apos;s reduced-motion setting is honoured automatically</li>
              </ul>
            </motion.div>

            <motion.div {...rise(0.3)} className="flex flex-col gap-4">
              <h2 className="text-header text-gradient-primary">How it is built</h2>
              <p className="text-body">
                The engine is a pure function of time: ask it for any moment and it returns the frame to draw.
                Nothing advances frame by frame, so drawing can pause and resume without losing its place, and
                the same steps always give the same frames. A director sits above it, turning events and held
                states into poses and running the arc of attention from alert to asleep. The engine has no
                framework in it; a React component wraps it for the common case.
              </p>
            </motion.div>

            <motion.div {...rise(0.3)} id="tour" className="flex flex-col gap-4 scroll-mt-24">
              <h2 className="text-header text-gradient-primary">In use: PIP gives a tour</h2>
              <p className="text-body">
                To see what the character adds to a real conversation, I built a spoken tour of my own
                background. PIP, one of the four characters, answers questions out loud. Its face follows its
                own voice and the mood of each sentence, and when it mentions a real moment, the photo of that
                moment comes to the centre of the stage. Point at a photo and it tells you the story behind it.
              </p>

              {/* The walkthrough video goes here: swap this block for a MediaCard with mediaType="video". */}
              <div
                className={`${frame} aspect-video flex items-center justify-center bg-stone-100 text-stone-400 text-sm`}
              >
                Walkthrough video coming soon
              </div>

              <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6">
                <h3 className="text-header-2">Try it yourself</h3>
                <p className="text-body">
                  The live tour runs on voice models that are billed by the minute, so it is open by invitation.
                  If you have an access code, enter it here. You will need a microphone.
                </p>
                <TourAccess unlocked={unlocked} />
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
