"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CrtLayer from "@/components/cameo/crt/CrtLayer";
import TourStage, { TourBar } from "@/app/projects/cameo/tour/TourStage";
import {
  HANDOUT_PROJECTS,
  type Handout,
  TourHandout,
} from "@/app/projects/cameo/tour/TourHandout";

/**
 * The stage as it is before a session, with the live layout forced on: the
 * bar where it goes, PIP down on its line, and a line of caption over it.
 */
const SAMPLE_LINES = [
  { who: "you" as const, text: "How did Shreyas get into design?" },
  {
    who: "pip" as const,
    text: "He started in architecture, then found his way into product design through building things for fun.",
  },
  { who: "you" as const, text: "What was the first thing he built?" },
  {
    who: "pip" as const,
    text: "A small tool for planning hikes around Mission Peak. That photo on the right is from one of them.",
  },
];

export default function TourControls() {
  const [typing, setTyping] = useState(false);
  const [focus, setFocus] = useState(false);
  const [low, setLow] = useState(false);
  const [history, setHistory] = useState(false);
  // ?card=project|contact: one of PIP's cards, in the centre.
  const [card, setCard] = useState<Handout | null>(null);
  // ?turn=talking|you|thinking: whose turn the Talk switch's waveform shows (listening by default).
  const [turn, setTurn] = useState<
    "listening" | "you" | "thinking" | "talking"
  >("listening");
  // ?chips=1: the suggestions, where the tour shows them once PIP goes quiet.
  const [chips, setChips] = useState(false);
  const [dock, setDock] = useState<HTMLElement | null>(null);
  // ?start=1: the start screen as it is, nothing forced.
  const [start, setStart] = useState(false);
  const [muted, setMuted] = useState(false);
  const [silent, setSilent] = useState(false);
  const [typed, setTyped] = useState("");
  const [stage, setStage] = useState<HTMLElement | null>(null);
  const [caption, setCaption] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setTyping(q.get("typing") === "1");
    setFocus(q.get("focus") === "1");
    setLow(q.get("low") === "1");
    setHistory(q.get("transcript") === "1");
    const c = q.get("card");
    if (c === "project")
      setCard({ kind: "project", project: HANDOUT_PROJECTS[0] });
    if (c === "contact") setCard({ kind: "contact" });
    setChips(q.get("chips") === "1");
    const tq = q.get("turn");
    if (tq === "talking" || tq === "you" || tq === "thinking") setTurn(tq);
    setStart(q.get("start") === "1");
    const t = setInterval(() => {
      const el = document.querySelector<HTMLElement>(".tour-stage");
      const cap = document.querySelector<HTMLElement>(".tour-caption");
      if (el && cap) {
        setDock(el.querySelector<HTMLElement>(".tour-dock"));
        setStage(el);
        setCaption(cap);
        clearInterval(t);
      }
    }, 50);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!stage || start) return;
    stage.setAttribute("data-live", "");
    if (typing) stage.setAttribute("data-field", "");
    else stage.removeAttribute("data-field");
    if (history) stage.setAttribute("data-transcript", "");
    else stage.removeAttribute("data-transcript");
    if (focus) stage.setAttribute("data-focus", "");
    else stage.removeAttribute("data-focus");
    stage.querySelector(".tour-dock")?.classList.remove("tour-dock--intro");
    caption?.classList.remove("tour-caption--closed");
  }, [stage, caption, focus, start, typing, history]);

  return (
    <>
      <TourStage visitor="Shreyas" />
      <CrtLayer />
      {!start && (
        <>
          <style>{`.tour-start, .tour-controls:not(.preview-bar) { display: none !important; }`}</style>
          {dock &&
            chips &&
            createPortal(
              <div className="tour-chips tour-chips--dock">
                {[
                  "What is Cameo?",
                  "Where did he study?",
                  "What does he do for fun?",
                ].map((q) => (
                  <button key={q} className="tour-chip" data-crt-clear>
                    {q}
                  </button>
                ))}
              </div>,
              dock,
            )}
          {stage &&
            card &&
            createPortal(
              <TourHandout
                handout={card}
                leaving={false}
                onClose={() => setCard(null)}
              />,
              stage,
            )}
          {caption &&
            !start &&
            createPortal(
              <p className="tour-caption-text">
                I started in architecture, then found my way into product design
                through building things for fun.
              </p>,
              caption,
            )}
          {stage &&
            createPortal(
              <div className="tour-controls preview-bar">
                <TourBar
                  typing={typing}
                  typed={typed}
                  setTyped={setTyped}
                  onSubmit={(e) => e.preventDefault()}
                  onTalk={() => setTyping(false)}
                  onType={() => setTyping(true)}
                  muted={muted}
                  setMuted={setMuted}
                  silent={silent}
                  setSilent={setSilent}
                  timeLeft={low ? 48 : 222}
                  session
                  resume={null}
                  turn={turn}
                  lines={SAMPLE_LINES}
                  history={history}
                  setHistory={setHistory}
                  onEnd={() => {}}
                />
              </div>,
              stage,
            )}
        </>
      )}
    </>
  );
}
