"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  playRecipe,
  playVocal,
  setSoundVolume,
  type Recipe,
} from "@shrysp/cameo/sound";
import {
  CODE_OK,
  CODE_WRONG,
  DIVE,
  PHOTO_POP,
  POWER_PRESS,
  SESSION_LIVE,
  THINKING,
  TICKET_FEED,
  TICKET_TEAR,
  TUBE_OFF,
  TUBE_ON,
} from "@/lib/tour/tour-sounds";

/**
 * Candidates. The picked ones live in lib/tour/tour-sounds.ts and are the
 * tour's own; the rest are here to compare against. All of them are one
 * family with the photo bloop: sines and lowpassed noise, rounded onsets,
 * nothing bright, through the shared limiter.
 */
const R: Record<string, Recipe> = {
  // The tube switching off: the picture snaps to a line, the line dies to a dot.
  offSoft: TUBE_OFF,
  offWhine: {
    masterGain: 0.169,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 90, attack: 0.004, decay: 0.22, peak: 0.8 },
      { kind: "tone", waveform: "sine", frequency: 2200, glideTo: 500, glideTime: 0.9, attack: 0.01, decay: 0.9, peak: 0.12, filter: { type: "lowpass", frequency: 2600 } },
    ],
  },
  offSnap: {
    masterGain: 0.254,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 1600, filterQ: 0.8, attack: 0.002, decay: 0.05, peak: 0.5 },
      { kind: "tone", waveform: "sine", frequency: 120, attack: 0.003, decay: 0.12, peak: 0.6 },
    ],
  },
  // The tube coming on: a thunk as it catches, then the hum of it warming.
  onThunk: TUBE_ON,
  onDegauss: {
    masterGain: 0.044,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 62, attack: 0.02, hold: 0.2, decay: 0.5, peak: 0.8, vibrato: { rate: 28, depth: 45 } },
      { kind: "noise", filterType: "lowpass", filterFrequency: 600, attack: 0.1, decay: 0.5, peak: 0.14 },
    ],
  },
  onRise: {
    masterGain: 0.117,
    shimmer: { delay: 0.11, feedback: 0.25, wet: 0.25, lowpass: 1400 },
    layers: [
      { kind: "tone", waveform: "sine", frequency: 300, glideTo: 880, glideTime: 0.7, attack: 0.3, decay: 0.5, peak: 0.35, filter: { type: "lowpass", frequency: 1500 } },
    ],
  },
  // The light pooling where PIP will appear.
  swell: {
    masterGain: 0.202,
    layers: [
      { kind: "noise", filterType: "lowpass", filterFrequency: 900, attack: 1.0, hold: 0.15, decay: 0.6, peak: 0.16 },
      { kind: "tone", waveform: "sine", frequency: 220, attack: 1.0, decay: 0.6, peak: 0.1, detune: 6 },
    ],
  },
  // The dot-matrix LCD.
  dotTick: {
    masterGain: 0.111,
    jitter: 80,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 1800, attack: 0.001, decay: 0.025, peak: 0.5, filter: { type: "lowpass", frequency: 3000 } },
    ],
  },
  softBlip: {
    masterGain: 0.105,
    jitter: 60,
    layers: [
      { kind: "tone", waveform: "square", frequency: 900, attack: 0.002, decay: 0.03, peak: 0.5, filter: { type: "lowpass", frequency: 1500 } },
    ],
  },
  chirp2: CODE_OK,
  chirpRise: {
    masterGain: 0.263,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 880, glideTo: 1320, glideTime: 0.08, attack: 0.004, decay: 0.16, peak: 0.6 },
    ],
  },
  // A wrong code: the glitch, 360ms.
  buzz: CODE_WRONG,
  // The ticket: the printer feeding it out (1.7s), and the stub torn off.
  feed: TICKET_FEED,
  whir: {
    masterGain: 0.143,
    layers: [
      { kind: "tone", waveform: "sawtooth", frequency: 180, attack: 0.06, hold: 1.45, decay: 0.15, peak: 0.18, vibrato: { rate: 40, depth: 30 }, filter: { type: "lowpass", frequency: 700 } },
      { kind: "noise", filterType: "lowpass", filterFrequency: 2000, attack: 0.06, hold: 1.45, decay: 0.15, peak: 0.08 },
    ],
  },
  rip: TICKET_TEAR,
  ripShort: {
    masterGain: 0.254,
    layers: [
      { kind: "noise", filterType: "highpass", filterFrequency: 1500, attack: 0.004, decay: 0.12, peak: 0.6 },
      { kind: "noise", filterType: "bandpass", filterFrequency: 4000, attack: 0.004, decay: 0.08, peak: 0.3, offset: 0.04 },
    ],
  },
  // The dive: building to the stream's cruising speed over 1.1s, carried on through the route change.
  rush: DIVE,
  whoosh: {
    masterGain: 0.374,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 600, filterQ: 1.2, attack: 0.9, decay: 0.5, peak: 0.3 },
      { kind: "noise", filterType: "bandpass", filterFrequency: 1500, filterQ: 1.2, attack: 0.7, decay: 0.9, peak: 0.25, offset: 0.4 },
    ],
  },
  // In the tour.
  openChime: SESSION_LIVE,
  tick: THINKING,
  setDown: {
    masterGain: 0.221,
    jitter: 80,
    layers: [
      { kind: "noise", filterType: "lowpass", filterFrequency: 500, attack: 0.003, decay: 0.07, peak: 0.5 },
      { kind: "tone", waveform: "sine", frequency: 160, attack: 0.003, decay: 0.08, peak: 0.4 },
    ],
  },
  slide: {
    masterGain: 0.042,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 1200, attack: 0.06, decay: 0.18, peak: 0.22 },
      { kind: "noise", filterType: "lowpass", filterFrequency: 500, attack: 0.003, decay: 0.07, peak: 0.45, offset: 0.2 },
      { kind: "tone", waveform: "sine", frequency: 160, attack: 0.003, decay: 0.08, peak: 0.35, offset: 0.2 },
    ],
  },
  watch: {
    masterGain: 0.029,
    layers: [
      { kind: "tone", waveform: "square", frequency: 2100, attack: 0.002, decay: 0.04, peak: 0.5, filter: { type: "lowpass", frequency: 3500 } },
      { kind: "tone", waveform: "square", frequency: 2100, attack: 0.002, decay: 0.04, peak: 0.5, offset: 0.09, filter: { type: "lowpass", frequency: 3500 } },
    ],
  },
  watchSine: {
    masterGain: 0.029,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 2000, attack: 0.002, decay: 0.05, peak: 0.6 },
      { kind: "tone", waveform: "sine", frequency: 2000, attack: 0.002, decay: 0.05, peak: 0.6, offset: 0.1 },
    ],
  },
};

const rec = (r: Recipe, timeScale?: number) => () => playRecipe(r, timeScale ? { timeScale } : undefined);
const voc = (pose: string, volume?: number) => () => playVocal(pose, volume ? { volume } : undefined);
/** The photos landing: the bloop as the tour fires it, 38 of them 60ms apart. */
const POPS = 38;
const POP_EVERY = 60;

type Candidate = { label: string; note: string; play: (after: (fn: () => void, ms: number) => void) => void };
type Verdict = "yes" | "maybe" | "skip" | "have";
type Slot = {
  id: string;
  name: string;
  when: string;
  verdict: Verdict;
  why: string;
  candidates: Candidate[];
};

const one = (label: string, note: string, fn: () => void): Candidate => ({ label, note, play: () => fn() });

const SECTIONS: { title: string; blurb: string; slots: Slot[] }[] = [
  {
    title: "The way in",
    blurb:
      "Clicking the card or the toast plays the same takeover: the page switches off like a tube, a breath of dark, the tube comes on, light pools, PIP appears asleep and wakes. PIP hasn't spoken yet, so this is the one stretch where its own little vocal cues belong.",
    slots: [
      {
        id: "tube-off",
        name: "Tube switches off",
        when: "0 ms · 1000 ms — on the click, the page drops to a line, then a dot",
        verdict: "yes",
        why: "This is the click's sound; the button itself gets none. It also plays for Escape and when the takeover closes.",
        candidates: [
          one("Soft power-off", "A low falling tone with a tiny snap on top", rec(R.offSoft)),
          one("Line collapse", "A thump, then a faint high line dying away, like a real tube", rec(R.offWhine)),
          one("Just the snap", "The shortest one: a soft click and a low tap", rec(R.offSnap)),
        ],
      },
      {
        id: "dark",
        name: "The dark breath",
        when: "1000 → 1250 ms",
        verdict: "skip",
        why: "Silence on purpose. The beat of nothing is what makes the tube coming on land.",
        candidates: [],
      },
      {
        id: "tube-on",
        name: "Tube comes on",
        when: "1250 ms · 800 ms — opens from a line",
        verdict: "yes",
        why: "Pairs with the switch-off. Low and short, so it reads as a machine warming, not an alert.",
        candidates: [
          one("Thunk + hum", "Catches with a low thunk, then a brief warm hum", rec(R.onThunk)),
          one("Degauss", "The wobbling low 'bwum' old monitors made", rec(R.onDegauss)),
          one("Rising line", "A soft rise with a short echo: prettier, less physical", rec(R.onRise)),
        ],
      },
      {
        id: "gather",
        name: "Light pools where PIP will be",
        when: "2050 ms · 1400 ms",
        verdict: "maybe",
        why: "A swell under the glow. Only worth it if the tube-on is short; two sounds back to back can feel like one too many.",
        candidates: [one("Phosphor swell", "Very quiet air and a soft tone rising together", rec(R.swell))],
      },
      {
        id: "asleep",
        name: "PIP appears, asleep",
        when: "2350 ms",
        verdict: "maybe",
        why: "PIP's own sleeping cue, ducked. Charming once; leave it out if the wake below already says enough.",
        candidates: [one("PIP · sleeping", "From PIP's own vocal set, at half volume", voc("sleeping", 0.5))],
      },
      {
        id: "wake",
        name: "PIP wakes",
        when: "3850 ms — wakes, curious",
        verdict: "yes",
        why: "The moment the character becomes someone. PIP's own vocal, since its real voice hasn't started yet.",
        candidates: [
          one("PIP · curious", "A small questioning 'hm?'", voc("curious")),
          one("PIP · happy", "Glad to see you", voc("happy")),
          one("PIP · listening", "Ears up", voc("listening")),
        ],
      },
    ],
  },
  {
    title: "The code",
    blurb: "From 5100 ms the LCD asks for the 8-character code.",
    slots: [
      {
        id: "key",
        name: "A character lights on the LCD",
        when: "each keystroke; a paste lights them 35 ms apart",
        verdict: "maybe",
        why: "Very quiet if at all: the visitor is typing, and a sound per key gets old by the fourth character. Plays as a run of 8 here.",
        candidates: [
          { label: "Dot tick", note: "A tiny high tick", play: (after) => { for (let i = 0; i < 8; i++) after(() => playRecipe(R.dotTick), i * 120); } },
          { label: "Soft blip", note: "A duller blip, more like a calculator", play: (after) => { for (let i = 0; i < 8; i++) after(() => playRecipe(R.softBlip), i * 120); } },
          { label: "Dot tick · paste", note: "The same, pasted: 35 ms apart", play: (after) => { for (let i = 0; i < 8; i++) after(() => playRecipe(R.dotTick), i * 35); } },
        ],
      },
      {
        id: "accept",
        name: "Code accepted",
        when: "on the server's yes, before the dive",
        verdict: "yes",
        why: "Short confirmation that you're in. The dive follows straight after, so it should be done in under 200 ms.",
        candidates: [
          one("Two-note chirp", "Like a digital watch confirming", rec(R.chirp2)),
          one("Single rise", "One rising note", rec(R.chirpRise)),
          one("PIP · happy", "PIP itself, pleased", voc("happy")),
        ],
      },
      {
        id: "wrong",
        name: "Wrong code",
        when: "the glitch, 360 ms",
        verdict: "yes",
        why: "Low and dull, never a harsh error buzzer. PIP's error cue makes it the character's reaction instead of the machine's.",
        candidates: [
          one("Crushed buzz", "Low and grainy, the length of the glitch", rec(R.buzz)),
          one("PIP · error", "PIP's own 'uh-oh'", voc("error")),
          one("PIP · suspicious", "PIP squinting at it", voc("suspicious")),
        ],
      },
    ],
  },
  {
    title: "The invitation",
    blurb:
      "An invitation link opens on the switched-off screen and its power switch: that press is what lets the browser play the rest. Then the tube comes on, PIP wakes, and PIP prints them a ticket instead of asking for a code; they tear its stub to go in.",
    slots: [
      {
        id: "power",
        name: "The power switch",
        when: "on the press; the tube answers about 400 ms after",
        verdict: "yes",
        why: "A dry click as the switch goes down, so the tube's thunk that answers it is the bigger sound.",
        candidates: [
          one("Switch click", "Click, knock, then the latch catching", rec(POWER_PRESS)),
          { label: "Click, then the tube", note: "As it plays: the switch, and the tube coming on", play: (after) => { playRecipe(POWER_PRESS); after(() => playRecipe(TUBE_ON), 400); } },
        ],
      },
      {
        id: "print",
        name: "The ticket prints",
        when: "1700 ms feed",
        verdict: "yes",
        why: "The most physical moment in the tour, and nothing is talking over it. A real thermal-printer recording will beat these.",
        candidates: [
          one("Thermal feed", "Paper and a chattering stepper motor", rec(R.feed)),
          one("Motor whir", "More motor, less paper", rec(R.whir)),
        ],
      },
      {
        id: "tear",
        name: "The stub tears",
        when: "on the tear",
        verdict: "yes",
        why: "The visitor's own action, so it can be a touch louder. Again, a real paper rip will beat these.",
        candidates: [one("Rip", "A crackling tear", rec(R.rip)), one("Short rip", "Quicker and cleaner", rec(R.ripShort))],
      },
    ],
  },
  {
    title: "Into the tour",
    blurb: "After the glitch: the dive builds to cruising speed through the photo stream, the route changes underneath, and the photos land around PIP.",
    slots: [
      {
        id: "dive",
        name: "The dive",
        when: "1100 ms build, carried through the route change",
        verdict: "yes",
        why: "Air rushing as you fly through the photos. It has to fade out into the landing, not stop.",
        candidates: [
          one("Rush", "Rising air with a low swell under it", rec(R.rush)),
          one("Whoosh", "Two waves of air, lighter", rec(R.whoosh)),
        ],
      },
      {
        id: "land",
        name: "Photos land",
        when: "38 photos, 60 ms apart",
        verdict: "have",
        why: "Already in the tour: PHOTO_POP. It should follow the Sound off switch.",
        candidates: [{ label: "Bloop stream", note: "As the tour plays it now", play: (after) => { for (let i = 0; i < POPS; i++) after(() => playRecipe(PHOTO_POP), i * POP_EVERY); } }],
      },
    ],
  },
  {
    title: "In the tour",
    blurb: "PIP's real voice is on from here. Turn on 'PIP's voice' above and try these under it: anything that fights the voice is out.",
    slots: [
      {
        id: "live",
        name: "Session is live",
        when: "Start talking → the mic opens",
        verdict: "yes",
        why: "The one cue voice products agree on: 'you can talk now'. Once per session.",
        candidates: [
          one("Open chime", "Two soft notes with a short echo", rec(R.openChime)),
          one("PIP · listening", "PIP's own cue; its last before the real voice takes over", voc("listening")),
        ],
      },
      {
        id: "thinking",
        name: "PIP is thinking, and it's taking a while",
        when: "only if no answer within ~700 ms",
        verdict: "yes",
        why: "So a long pause doesn't feel broken. Neutral rather than PIP's vocal: a synth voice next to its real one sounds like two characters.",
        candidates: [one("Soft tick", "One quiet, low tick", rec(R.tick)), one("PIP · thinking", "At half volume, for comparison", voc("thinking", 0.5))],
      },
      {
        id: "card",
        name: "PIP hands over a card",
        when: "while PIP is talking",
        verdict: "maybe",
        why: "It lands mid-sentence, so it has to sit well under the voice or not be there.",
        candidates: [one("Set down", "A card placed on a table", rec(R.setDown)), one("Slide + set down", "Slid across, then placed", rec(R.slide))],
      },
      {
        id: "focus",
        name: "A photo comes forward",
        when: "while PIP is talking about it",
        verdict: "skip",
        why: "Happens often and always under the voice. The motion is enough.",
        candidates: [],
      },
      {
        id: "low",
        name: "Time running low",
        when: "once, at about 30 s left",
        verdict: "maybe",
        why: "One watch chirp, never a countdown. Suits the LCD.",
        candidates: [one("Watch chirp", "The Casio double beep, filtered", rec(R.watch)), one("Soft double", "Rounder, a little louder", rec(R.watchSine))],
      },
      {
        id: "notices",
        name: "Notices (mic blocked, time's up…)",
        when: "as they happen",
        verdict: "have",
        why: "Already PIP's recorded lines. Nothing to add on top.",
        candidates: [],
      },
    ],
  },
  {
    title: "Leaving",
    blurb: "End, or Back to the case study: the tour switches off to a dot (400 ms), holds (120 ms), and the case study opens out of it (600 ms).",
    slots: [
      {
        id: "end",
        name: "Session ends",
        when: "End, or time's up",
        verdict: "yes",
        why: "PIP nodding off, then the tube going: the opening, played backwards.",
        candidates: [
          one("PIP · sleeping", "Just PIP", voc("sleeping")),
          { label: "Sleeping, then off", note: "PIP, then the switch-off a beat later", play: (after) => { playVocal("sleeping"); after(() => playRecipe(R.offSoft), 700); } },
        ],
      },
      {
        id: "exit",
        name: "Back to the case study",
        when: "off 400 · hold 120 · on 600",
        verdict: "yes",
        why: "The same pair as the way in, sped up to fit the shorter animation.",
        candidates: [
          { label: "Off + on, quick", note: "Soft power-off and thunk, at 0.45×", play: (after) => { playRecipe(R.offSoft, { timeScale: 0.45 }); after(() => playRecipe(R.onThunk, { timeScale: 0.6 }), 520); } },
          { label: "Snap + on", note: "Shortest", play: (after) => { playRecipe(R.offSnap); after(() => playRecipe(R.onThunk, { timeScale: 0.6 }), 520); } },
        ],
      },
      {
        id: "toast",
        name: "The toast appearing",
        when: "1200 ms after any page loads",
        verdict: "skip",
        why: "A sound nobody asked for on a page they came to read. Browsers block it before a click anyway.",
        candidates: [],
      },
    ],
  },
];

const SLOTS = SECTIONS.flatMap((s) => s.slots);

/** The way in, as the screen look times it (SCREEN in TourEntrance.tsx), with typing, the yes, the dive and the landing after. */
const WAY_IN: { at: number; slot: string }[] = [
  { at: 0, slot: "tube-off" },
  { at: 1250, slot: "tube-on" },
  { at: 2050, slot: "gather" },
  { at: 2350, slot: "asleep" },
  { at: 3850, slot: "wake" },
  { at: 6000, slot: "key" },
  { at: 7300, slot: "accept" },
  { at: 7660, slot: "dive" },
  { at: 8900, slot: "land" },
];
const INVITED: { at: number; slot: string }[] = [
  // Switched on rather than clicked through: no page to switch off, and the tube answers at once.
  { at: 0, slot: "power" },
  { at: 400, slot: "tube-on" },
  ...WAY_IN.slice(2, 5),
  { at: 5100, slot: "print" },
  { at: 7800, slot: "tear" },
  { at: 8160, slot: "dive" },
  { at: 9400, slot: "land" },
];
const SEQUENCES = [
  { id: "code", name: "Way in · with a code", events: WAY_IN },
  { id: "invite", name: "Way in · invited", events: INVITED },
  { id: "leave", name: "Session ends, back to the case study", events: [{ at: 0, slot: "end" }, { at: 1600, slot: "exit" }] },
];

const VERDICT: Record<Verdict, { label: string; cls: string }> = {
  yes: { label: "Recommended", cls: "bg-[#8fd16a]/15 text-[#a9e08a]" },
  maybe: { label: "Maybe", cls: "bg-amber-300/10 text-amber-200/90" },
  skip: { label: "Leave silent", cls: "bg-white/5 text-white/45" },
  have: { label: "Already in", cls: "bg-sky-300/10 text-sky-200/90" },
};

/** A slot's pick: the index of a candidate, or -1 for none. */
type Picks = Record<string, number>;
const PICKS_KEY = "tour-sounds.picks";
const defaultPicks = (): Picks =>
  Object.fromEntries(SLOTS.map((s) => [s.id, s.verdict === "yes" || s.verdict === "have" ? 0 : -1]));

const VOICE_CLIP = "/audio/cameo/tour-into-design.m4a";

export default function SoundBoard() {
  const [picks, setPicks] = useState<Picks>(defaultPicks);
  const [volume, setVolume] = useState(0.8);
  const [voice, setVoice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState<{ id: string; started: number; length: number } | null>(null);
  const [lit, setLit] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const audio = useRef<HTMLAudioElement>(null);
  const head = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PICKS_KEY);
      if (saved) setPicks({ ...defaultPicks(), ...JSON.parse(saved) });
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(PICKS_KEY, JSON.stringify(picks));
    } catch {}
  }, [picks]);
  useEffect(() => setSoundVolume(volume), [volume]);
  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    if (voice) void el.play().catch(() => setVoice(false));
    else el.pause();
  }, [voice]);

  const stop = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRunning(null);
    setLit(null);
  }, []);
  useEffect(() => stop, [stop]);

  const after = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const play = (slot: Slot, i: number) => {
    stop();
    setLit(`${slot.id}:${i}`);
    slot.candidates[i].play(after);
    after(() => setLit(null), 900);
  };

  const runSequence = (seq: (typeof SEQUENCES)[number]) => {
    stop();
    const length = Math.max(...seq.events.map((e) => e.at)) + 2600;
    setRunning({ id: seq.id, started: performance.now(), length });
    for (const e of seq.events) {
      const slot = SLOTS.find((s) => s.id === e.slot)!;
      const pick = picks[slot.id] ?? -1;
      if (pick < 0 || !slot.candidates[pick]) continue;
      after(() => {
        setLit(`${slot.id}:${pick}`);
        slot.candidates[pick].play((fn, ms) => after(fn, ms));
      }, e.at);
    }
    after(stop, length);
  };

  // The playhead, moved without re-rendering.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const tick = () => {
      const k = Math.min(1, (performance.now() - running.started) / running.length);
      if (head.current) head.current.style.transform = `scaleX(${k})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const copyPicks = async () => {
    const lines = SECTIONS.flatMap((sec) =>
      sec.slots.map((s) => {
        const p = picks[s.id] ?? -1;
        return `- ${s.name}: ${p >= 0 && s.candidates[p] ? s.candidates[p].label : "none"}`;
      }),
    );
    try {
      await navigator.clipboard.writeText(`Tour sound picks\n${lines.join("\n")}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <main className="min-h-dvh bg-[#0b0f0b] px-4 pb-24 pt-10 text-white/90 sm:px-8">
      <audio ref={audio} src={VOICE_CLIP} loop preload="auto" />
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8fd16a]/80">PIP tour · dev</p>
          <h1 className="text-3xl font-semibold tracking-tight">Sound board</h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-white/60">
            Every moment that could make a sound, in the order a visitor meets it. Each plays through
            PIP&rsquo;s own synth and limiter, the same path the tour uses. Pick one per slot (or none),
            play the full sequences to hear the spacing, then copy your picks back.
          </p>
        </header>

        <section className="sticky top-0 z-10 -mx-4 flex flex-col gap-4 border-b border-white/10 bg-[#0b0f0b]/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="flex items-center gap-3 text-sm text-white/70">
              Volume
              <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-32 accent-[#8fd16a]" />
            </label>
            <button
              type="button"
              onClick={() => setVoice((v) => !v)}
              aria-pressed={voice}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${voice ? "bg-[#8fd16a] text-[#0b0f0b]" : "bg-white/10 text-white/80 hover:bg-white/15"}`}
            >
              {voice ? "PIP’s voice: on" : "PIP’s voice: off"}
            </button>
            <button type="button" onClick={copyPicks} className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/80 hover:bg-white/15">
              {copied ? "Copied" : "Copy picks"}
            </button>
            <button type="button" onClick={() => setPicks(defaultPicks())} className="text-sm text-white/45 hover:text-white/70">
              Reset to recommended
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SEQUENCES.map((seq) => (
              <button
                key={seq.id}
                type="button"
                onClick={() => (running?.id === seq.id ? stop() : runSequence(seq))}
                className={`relative overflow-hidden rounded-lg px-3 py-2 text-left text-sm ${running?.id === seq.id ? "bg-white/15" : "bg-white/[0.06] hover:bg-white/10"}`}
              >
                {running?.id === seq.id && (
                  <div ref={head} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[#8fd16a]" style={{ transform: "scaleX(0)" }} />
                )}
                {running?.id === seq.id ? "■ " : "▶ "}
                {seq.name}
              </button>
            ))}
          </div>
        </section>

        {SECTIONS.map((sec) => (
          <section key={sec.title} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-semibold tracking-tight">{sec.title}</h2>
              <p className="max-w-xl text-sm leading-relaxed text-white/55">{sec.blurb}</p>
            </div>
            <ol className="flex flex-col divide-y divide-white/[0.07] rounded-xl border border-white/[0.08]">
              {sec.slots.map((slot) => (
                <li key={slot.id} className="flex flex-col gap-3 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-[15px] font-medium">{slot.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${VERDICT[slot.verdict].cls}`}>{VERDICT[slot.verdict].label}</span>
                  </div>
                  <p className="font-mono text-xs text-white/40">{slot.when}</p>
                  <p className="text-sm leading-relaxed text-white/65">{slot.why}</p>
                  {slot.candidates.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {slot.candidates.map((c, i) => {
                        const picked = picks[slot.id] === i;
                        return (
                          <div key={c.label} className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${picked ? "bg-[#8fd16a]/[0.08]" : ""}`}>
                            <button
                              type="button"
                              onClick={() => play(slot, i)}
                              aria-label={`Play ${c.label}`}
                              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs transition-colors ${lit === `${slot.id}:${i}` ? "bg-[#8fd16a] text-[#0b0f0b]" : "bg-white/10 hover:bg-white/20"}`}
                            >
                              {"▶"}
                            </button>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span className="text-sm">{c.label}</span>
                              <span className="text-xs text-white/45">{c.note}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPicks((p) => ({ ...p, [slot.id]: picked ? -1 : i }))}
                              className={`w-16 shrink-0 rounded-full py-1 text-xs ${picked ? "bg-[#8fd16a] text-[#0b0f0b]" : "bg-white/[0.06] text-white/60 hover:bg-white/10"}`}
                            >
                              {picked ? "Picked" : "Pick"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}
