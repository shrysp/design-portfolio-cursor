"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { motion, useAnimationControls } from "framer-motion";

// What counts as an email: something, an @, something, a dot, something
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// How long the thanks stays in the field before it asks for an email again
const THANKS_MS = 2200;

// How the prompt travels: unhurried, and easing to a stop
const travel = { duration: 0.45, ease: [0.22, 1, 0.36, 1] } as const;
const soft = { duration: 0.25, ease: "easeOut" } as const;

// Where typing begins, from the field's inner edge, and the room the envelope
// takes beside the words (itself and the gap after it)
const TEXT_START = 19;
const ENVELOPE_ROOM = 24;

// The Turf waitlist form, built rather than recorded. At rest the field shows
// an envelope and "Enter your email" in its middle. Taking focus blurs the
// envelope away and slides the words to where typing begins, with an orange
// outline; left empty, it settles back. Joining with something that isn't an
// email turns the outline red and gives the field one soft sway, which clears
// as soon as the typing starts again. A real one is thanked in the field
// itself, by the same move run the other way: the words start where the email
// was and slide to the middle as a tick comes into focus beside them. Then the
// field goes back to how it began.
//
// Everything that moves is moved by transform, opacity or filter alone (Framer
// Motion), which the browser can do without laying the tile out again: on a
// wall with this much else in motion, anything heavier stutters.
export default function TurfWaitlist() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLSpanElement>(null);
  const thanksRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const shake = useAnimationControls();
  const thanksTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(thanksTimer.current), []);

  // How far the words sit from where typing begins while they rest in the
  // middle. Measured, since it depends on the field's width and the font.
  const [restX, setRestX] = useState<number | null>(null);
  // And the same for the thanks, which is a different length
  const [thanksX, setThanksX] = useState(0);
  useLayoutEffect(() => {
    const field = fieldRef.current;
    const words = wordsRef.current;
    const thanks = thanksRef.current;
    if (!field || !words || !thanks) return;
    const middleFor = (width: number) => (field.clientWidth - (ENVELOPE_ROOM + width)) / 2 + ENVELOPE_ROOM - TEXT_START;
    const measure = () => {
      setRestX(middleFor(words.offsetWidth));
      setThanksX(middleFor(thanks.offsetWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(field);
    observer.observe(words);
    observer.observe(thanks);
    return () => observer.disconnect();
  }, []);

  // The prompt sits in the middle only while the field is empty and untouched
  const isResting = !isFocused && value === "";

  const join = (event: FormEvent) => {
    event.preventDefault();
    if (hasJoined) return;
    if (!EMAIL.test(value.trim())) {
      setHasError(true);
      // The field keeps the focus, so the mistake is ready to be typed over
      inputRef.current?.focus();
      // One soft sway, four pixels each way, and it comes to rest
      shake.start({ x: [0, -4, 4, -2, 0], transition: { duration: 0.45, ease: "easeInOut" } });
      return;
    }
    setHasError(false);
    setHasJoined(true);
    setValue("");
    inputRef.current?.blur();
    thanksTimer.current = setTimeout(() => setHasJoined(false), THANKS_MS);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#f2f4f5] [container-type:inline-size] font-[Helvetica,Arial,sans-serif]">
      <form onSubmit={join} noValidate className="flex w-[min(78cqw,340px)] flex-col gap-3">
        <motion.div
          ref={fieldRef}
          animate={shake}
          // A hairline border at rest. Focus is an outline drawn over it (orange,
          // or red after a mistake), in the colours of the recording this was built from.
          className={`relative h-11 rounded-full border border-[#d1d5db] bg-[#f6f9fc] outline-2 -outline-offset-1 transition-[outline-color] duration-200 ease-out ${hasError ? "outline-[#eb2f3a]" : "outline-transparent focus-within:outline-[#f48816]"}`}
        >
          {/* The prompt, drawn over the field so it can travel: the browser's own
              placeholder can only sit where the text does. It is placed where
              typing begins and carried to the middle, so the trip is a slide. */}
          <motion.span
            aria-hidden
            initial={false}
            animate={{ x: isResting ? (restX ?? 0) : 0, opacity: hasJoined ? 0 : 1, filter: hasJoined ? "blur(4px)" : "blur(0px)" }}
            transition={{ x: travel, opacity: soft, filter: soft }}
            className="pointer-events-none absolute inset-y-0 flex items-center whitespace-nowrap text-[15px] text-[#6e7476] will-change-transform"
            // Gone the moment there is something typed, and back the moment
            // there isn't, as a placeholder is: nothing eases in or out
            style={{ left: TEXT_START, visibility: restX === null || value !== "" ? "hidden" : undefined }}
          >
            {/* The envelope hangs off the front of the words, and blurs away as it fades */}
            <motion.span
              initial={false}
              animate={{ opacity: isResting ? 1 : 0, filter: isResting ? "blur(0px)" : "blur(4px)" }}
              transition={travel}
              className="absolute right-full mr-[7px] flex items-center"
            >
              <svg width="17" height="13" viewBox="0 0 17 13" fill="none">
                <rect x="0.75" y="0.75" width="15.5" height="11.5" rx="1.25" stroke="currentColor" strokeWidth="1.3" />
                <path d="M1 1.2 8.5 7 16 1.2M1 11.8 6.3 6M16 11.8 10.7 6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            </motion.span>
            <span ref={wordsRef}>Enter your email</span>
          </motion.span>

          {/* The thanks, in the prompt's own hand: the same type, and the same
              move run the other way. The words appear where the email was and
              slide to the middle as the tick comes into focus beside them. It
              is always here, unseen, so that it is in place to begin from. */}
          <motion.span
            role="status"
            aria-hidden={!hasJoined}
            initial={false}
            animate={{ x: hasJoined ? thanksX : 0, opacity: hasJoined ? 1 : 0, filter: hasJoined ? "blur(0px)" : "blur(4px)" }}
            transition={
              hasJoined
                ? { x: travel, opacity: { duration: 0 }, filter: { duration: 0 } }
                : // Fades where it stands, and only then goes back to its start
                  { x: { duration: 0, delay: soft.duration }, opacity: soft, filter: soft }
            }
            className="pointer-events-none absolute inset-y-0 flex items-center whitespace-nowrap text-[15px] text-[#1f2328] will-change-transform"
            style={{ left: TEXT_START }}
          >
            <motion.span
              initial={false}
              animate={{ opacity: hasJoined ? 1 : 0, filter: hasJoined ? "blur(0px)" : "blur(4px)" }}
              transition={hasJoined ? travel : { duration: 0, delay: soft.duration }}
              className="absolute right-full mr-[7px] flex items-center text-[#18893f]"
            >
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden>
                <circle cx="8.5" cy="8.5" r="7.6" stroke="currentColor" strokeWidth="1.3" />
                <path d="m5.2 8.8 2.3 2.3 4.4-4.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
            <span ref={thanksRef}>You&apos;re on the list</span>
          </motion.span>

          <input
            ref={inputRef}
            type="email"
            inputMode="email"
            autoComplete="off"
            aria-label="Email"
            aria-invalid={hasError}
            // Nothing to type while it is saying thanks
            readOnly={hasJoined}
            tabIndex={hasJoined ? -1 : undefined}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              // Typing again is a fresh start
              setHasError(false);
            }}
            onFocus={() => !hasJoined && setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              // An empty field goes back to how it began, without the mistake
              if (value === "") setHasError(false);
            }}
            className={`absolute inset-0 w-full rounded-full bg-transparent text-[15px] text-[#1f2328] outline-none ${hasJoined ? "pointer-events-none" : ""}`}
            style={{ paddingInline: TEXT_START }}
          />
        </motion.div>

        <button
          type="submit"
          // Pressing it leaves the field's focus where it is. Otherwise the
          // field would be left for a moment, and the prompt would start for
          // the middle and turn back.
          onPointerDown={(event) => event.preventDefault()}
          onMouseDown={(event) => event.preventDefault()}
          className="relative h-11 overflow-hidden rounded-full border border-[#d9660c] bg-linear-to-b from-[#ff9d44] via-[#fc7e00] to-[#fb7410] text-[15px] font-bold text-white shadow-[inset_0_-3px_4px_rgba(255,170,100,0.55),inset_0_1px_0_rgba(255,255,255,0.35),0_4px_10px_-3px_rgba(240,110,10,0.45)] [text-shadow:0_1px_1px_rgba(160,70,0,0.35)] transition-[scale,filter] duration-150 ease-out hover:brightness-105 active:scale-[0.98] cursor-pointer"
        >
          Join the waitlist
        </button>
      </form>
    </div>
  );
}
