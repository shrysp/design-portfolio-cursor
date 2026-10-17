"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { IconEnvelopeFilled, IconEnvelopeOpenHeart } from 'nucleo-micro-bold-essential';
import { EASE_OUT } from '@/lib/easing';

export const EMAIL = 'shreyaspatil.design@gmail.com';

// The dock's email icon. The button around it does the copying, so the whole
// button and its tap area copy, by pointer or keyboard; this only shows it.
export default function EmailCopyButton({ copied }: { copied: boolean }) {
  return (
    // The two icons cross in place: the new one grows the last tenth into view
    // while the old one shrinks out, both over a small blur so the moment they
    // overlap doesn't read as two icons
    <span className="relative grid size-[18px] place-items-center">
      <AnimatePresence initial={false}>
        <motion.span
          key={copied ? "copied" : "at"}
          className="absolute inset-0 grid place-items-center"
          initial={{ opacity: 0, scale: 0.9, filter: "blur(2px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(2px)" }}
          transition={{ duration: 0.15, ease: EASE_OUT }}
        >
          {copied ? <IconEnvelopeOpenHeart size={18} /> : <IconEnvelopeFilled size={18} />}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
