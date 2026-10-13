"use client";

import * as React from "react";
import { Dots, FaceText, IsoFigure, Line, Solid } from "@/components/iso/react/draw";
import { spring, useInView, useLoop, type Spring } from "@/components/iso/react/live";
import FigureCard from "../FigureCard";
import { BASE_ART, HEIGHT, HOLDER_ART, METERS, REST, TRAY_ART, WIDTH, arcAt, needleAt } from "./geometry";
import { CAPTION, GOALS, SPOKEN } from "./model";
import "./qscore.css";

// ── Motion ──
// When the bench first comes into view, both needles swing up from zero and
// settle, the way a meter movement does. After that nothing moves: the two
// readings are the picture.
const NEEDLE_STIFFNESS = 38;
const NEEDLE_DAMPING = 7.4;
// The second meter starts a beat after the first
const SECOND_AFTER = 0.25;
// Left alone, the bench points out one goal's reason at a time
const TOUR_FIRST = 2200;
const TOUR_EVERY = 2800;
// How long after a visitor's last touch the tour picks up again
const TOUR_BACK = 6000;

const LABEL =
  "A bench with one contact card clamped in a holder, wired to two meters. The card carries two flags: hiring engineers, and just raised. The meter engraved Hiring reads 92; the meter engraved Fundraising reads 35. Pointing at a meter lights the flag on the card that drives its score.";

const BASE = (
  <g>
    <path className="iso-halo" d={BASE_ART.halo} />
    {BASE_ART.feet.map((parts, index) => (
      <g key={index}>
        {parts.map((paths, part) => (
          <Solid key={part} paths={paths} tone={part ? "mid" : "lo"} />
        ))}
      </g>
    ))}
    <Solid paths={BASE_ART.slab} tone="mid" />
    <Line d={BASE_ART.groove} tone="lo" />
    <Line d={BASE_ART.screwRings} tone="lo" />
    <Dots points={BASE_ART.screws} size={0.5} />
    <Solid paths={BASE_ART.label} tone="lo" crease="none" />
    <Line d={BASE_ART.labelLine} tone="faint" />
    <Line d={BASE_ART.labelRule} tone="lo" free />
    <Dots points={BASE_ART.labelScrews} size={0.45} />
  </g>
);

const TRAY = (
  <g>
    <Solid paths={TRAY_ART.block} tone="mid" />
    <Line d={TRAY_ART.groove} tone="faint" />
    {TRAY_ART.cards.map((paths, index) => (
      <Solid key={index} paths={paths} tone="mid" crease="none" />
    ))}
    <Line d={TRAY_ART.portrait} tone="lo" />
    <Line d={TRAY_ART.rules} tone="lo" free />
    <Solid paths={TRAY_ART.lip} tone="mid" />
  </g>
);

function Bench() {
  const anchor = React.useRef<HTMLDivElement>(null);
  const needles = React.useRef<(SVGPathElement | null)[]>([]);
  const arcs = React.useRef<(SVGPathElement | null)[]>([]);
  // Which goal's reason is pointed out, if any
  const [active, setActive] = React.useState<number | null>(null);
  const [touring, setTouring] = React.useState(true);
  const back = React.useRef<number | undefined>(undefined);
  const visible = useInView(anchor);

  // The needles' one sweep, the first time the bench is seen
  const sweep = React.useRef({ begun: false, clock: 0, readings: GOALS.map((): Spring => ({ at: 0, rate: 0 })) });
  const kick = useLoop((dt, calm) => {
    const s = sweep.current;
    s.clock += dt;
    let settled = true;
    s.readings.forEach((reading, index) => {
      const due = calm || s.clock > index * SECOND_AFTER;
      settled = spring(reading, due ? GOALS[index].score : 0, dt, NEEDLE_STIFFNESS, NEEDLE_DAMPING, calm) && due && settled;
      needles.current[index]?.setAttribute("d", needleAt(index, reading.at));
      arcs.current[index]?.setAttribute("d", arcAt(index, reading.at));
    });
    return !settled;
  }, false);
  React.useEffect(() => {
    if (!visible || sweep.current.begun) return;
    sweep.current.begun = true;
    kick();
  }, [visible, kick]);

  // The tour: one goal's reason, then the other's, while nobody is pointing
  React.useEffect(() => {
    if (!visible || !touring || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let next = 0;
    let timer = window.setTimeout(function step() {
      setActive(next);
      next = 1 - next;
      timer = window.setTimeout(step, TOUR_EVERY);
    }, TOUR_FIRST);
    return () => window.clearTimeout(timer);
  }, [visible, touring]);
  React.useEffect(() => () => window.clearTimeout(back.current), []);

  // A visitor pointing at a meter takes over from the tour, which picks up again once they've gone
  const point = (goal: number | null, stay = false) => {
    setTouring(false);
    setActive(goal);
    window.clearTimeout(back.current);
    if (goal === null || !stay) back.current = window.setTimeout(() => setTouring(true), TOUR_BACK);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    let to: number | null | undefined;
    if (event.key === "ArrowLeft" || event.key === "Home") to = 0;
    if (event.key === "ArrowRight" || event.key === "End") to = 1;
    if (event.key === " " || event.key === "Enter") to = active === 0 ? 1 : 0;
    if (event.key === "Escape") to = null;
    if (to === undefined) return;
    event.preventDefault();
    point(to);
  };

  return (
    <div
      ref={anchor}
      className="fig-stage qs-stage"
      data-active={active ?? undefined}
      tabIndex={0}
      role="group"
      aria-label={`${SPOKEN} Arrow keys point out the reason for each.`}
      onKeyDown={onKeyDown}
      onPointerLeave={() => point(null)}
    >
      <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
        {BASE}
        {/* A lead from the card to each meter; the one being pointed out lights */}
        {HOLDER_ART.leads.map((d, index) => (
          <path key={index} className="iso-line qs-lead" data-goal={index} data-tone="mid" d={d} />
        ))}
        {HOLDER_ART.clips.map((paths, index) => (
          <Solid key={index} paths={paths} tone="mid" crease="none" />
        ))}

        {/* The contact, and what is true of them right now */}
        <Solid paths={HOLDER_ART.block} tone="mid" inner={<Line d={HOLDER_ART.seam} tone="faint" />} />
        <Line d={HOLDER_ART.groove} tone="faint" />
        <Dots points={HOLDER_ART.screws} size={0.45} />
        {HOLDER_ART.glands.map((paths, index) => (
          <Solid key={index} paths={paths} tone="mid" crease="none" />
        ))}
        <Solid paths={HOLDER_ART.jaws[0]} tone="mid" />
        <Dots points={HOLDER_ART.jawScrew} size={0.45} />
        <Solid paths={HOLDER_ART.card} tone="hi" crease="lo" />
        <Line d={HOLDER_ART.divider} tone="faint" />
        <Line d={HOLDER_ART.portrait} tone="mid" />
        <Line d={HOLDER_ART.head} tone="mid" />
        <Line d={HOLDER_ART.shoulders} tone="mid" />
        <Line d={HOLDER_ART.name} tone="hi" free className="qs-name" />
        <Line d={HOLDER_ART.role} tone="mid" free />
        {HOLDER_ART.signals.map((signal, index) => (
          <g key={index} className="qs-signal" data-goal={index}>
            <path className="iso-line qs-flag" data-tone="mid" d={signal.flag} />
            <text className="iso-face-text qs-signal-text" transform={signal.text} fontSize={4.7}>
              {GOALS[index].signal}
            </text>
          </g>
        ))}
        <Solid paths={HOLDER_ART.jaws[1]} tone="mid" />
        <Solid paths={HOLDER_ART.thumb} tone="mid" />
        <Line d={HOLDER_ART.thumbKnurl} tone="lo" />

        {TRAY}

        {/* The two meters. Each is its own target, so pointing at one picks its goal. */}
        {METERS.map((meter, index) => (
          <g
            key={GOALS[index].key}
            className="qs-meter"
            data-goal={index}
            onPointerEnter={(event) => event.pointerType === "mouse" && point(index, true)}
            onClick={() => point(index)}
          >
            <Solid paths={meter.housing} tone="mid" inner={<Line d={meter.seam} tone="faint" />} />
            <Line d={meter.screwRings} tone="lo" />
            <Dots points={meter.screws} size={0.5} />
            <text className="iso-face-text qs-goal" transform={meter.name} fontSize={5.4}>
              {GOALS[index].label.toUpperCase()}
            </text>
            <Line d={meter.window} tone="lo" />
            <text className="iso-face-text qs-score" transform={meter.score} fontSize={8} textAnchor="middle">
              {GOALS[index].score}
            </text>
            <Solid paths={meter.bezel} tone="hi" crease="lo" />
            <Line d={meter.knurl} tone="lo" />
            <Line d={meter.band} tone="faint" />
            <Line d={meter.rim} tone="lo" />
            <Line d={meter.minor} tone="lo" />
            <Line d={meter.major} tone="mid" />
            <Line d={meter.stops} tone="mid" />
            <Line d={meter.track} tone="faint" className="qs-track" />
            {meter.numerals.map((numeral) => (
              <FaceText key={numeral.text} transform={numeral.transform} size={4.4} tone="mid" anchor="middle">
                {numeral.text}
              </FaceText>
            ))}
            <path
              ref={(node) => {
                arcs.current[index] = node;
              }}
              className="iso-line qs-arc"
              data-tone="lit"
              d={REST[index].arc}
            />
            <path
              ref={(node) => {
                needles.current[index] = node;
              }}
              className="iso-line qs-needle"
              data-tone="lit"
              data-free=""
              d={REST[index].needle}
            />
            <Solid paths={meter.hub} tone="hi" crease="lo" />
            <Dots points={meter.hubDot} size={0.9} tone="hi" />
          </g>
        ))}
      </IsoFigure>
    </div>
  );
}

/** Quinn's contextual Q-score as a bench: one contact card, two meters, two readings at once. */
export default function QScoreFigure() {
  return (
    <FigureCard className="qscore" ratio={WIDTH / HEIGHT} caption={CAPTION}>
      <Bench />
    </FigureCard>
  );
}
