"use client";

import * as React from "react";
import { Dots, IsoFigure, Line, Solid } from "@/components/iso/react/draw";
import { spring, useInView, useLoop, type Spring } from "@/components/iso/react/live";
import FigureCard from "../FigureCard";
import { ANSWER_LIFT, ARRIVE, ASK_ART, BENCH_ART, DROP, HEIGHT, RANKS, RANK_ART, SOURCE_ART, TAG_AT, WIDTH, raise } from "./geometry";
import { CAPTION, LAST, QUESTION, SOURCES, TRUSTED, spokenOf, statusOf, type Stage } from "./model";
import "./answer.css";
import { moveTag } from "../moveTag";

// ── Motion ──
// Cards rise on a spring with a little overshoot
const RISE_STIFFNESS = 110;
const RISE_DAMPING = 15;
// The search, in seconds from its start: the queries go out one after another,
// the sources wake, then the documents come back and land in the box
const QUERY_EVERY = 0.12;
const QUERIES_FOR = 1.5;
const WAKE_AT = 0.5;
const RETURN_AT = 1.6;
const RETURN_EVERY = 0.2;
const LAND_AFTER = 0.7;
// Left alone, the bench plays through its steps: how long it rests, then holds each
const HOLD = [1.2, 2.4, 5.2, 3.2, 4.4];
// How long after a visitor's last touch the tour picks up again
const TOUR_BACK = 10000;

const rest = (at: number): Spring => ({ at, rate: 0 });
const eased = (value: number) => value * value * (3 - 2 * value);
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const shown = (opacity: number) => Math.round(opacity * 100) / 100;

const STATUS_AT_REST = statusOf({ stage: 1, back: 0, ranked: false, answered: false });

const LABEL =
  "A bench that turns a question into an answer. Front left, a question card stands in a slot beside a reader. Along the back, five drums stand for five connected apps: Notion, Slack, Linear, Gmail and GitHub, all on one shared line. Front right, a box collects the document each app sends back, the two ranked highest rise as sources of truth, and a printer issues the answer with two reference marks.";

const BENCH = (
  <g>
    <path className="iso-halo" d={BENCH_ART.halo} />
    {BENCH_ART.feet.map((parts, index) => (
      <g key={index}>
        {parts.map((paths, part) => (
          <Solid key={part} paths={paths} tone={part ? "mid" : "lo"} />
        ))}
      </g>
    ))}
    <Solid paths={BENCH_ART.slab} tone="mid" />
    <Line d={BENCH_ART.groove} tone="lo" />
    <Line d={BENCH_ART.screwRings} tone="lo" />
    <Dots points={BENCH_ART.screws} size={0.5} />
    <Line d={BENCH_ART.wiring} tone="mid" className="aw-wire" />
  </g>
);

function Bench() {
  const anchor = React.useRef<HTMLDivElement>(null);
  const tag = React.useRef<HTMLDivElement>(null);
  const said = React.useRef(STATUS_AT_REST);
  const names = React.useRef<(SVGTextElement | null)[]>([]);
  const out = React.useRef<(SVGPathElement | null)[]>([]);
  const back = React.useRef<(SVGPathElement | null)[]>([]);
  const apps = React.useRef<(SVGTextElement | null)[]>([]);
  const docs = React.useRef<(SVGGElement | null)[]>([]);
  const question = React.useRef<SVGGElement>(null);
  const answer = React.useRef<SVGGElement>(null);
  const lamp = React.useRef<SVGGElement>(null);

  // The pose the figure first appears in: the question has just dropped in
  const state = React.useRef({
    stage: 1 as Stage,
    since: 10,
    left: HOLD[1],
    touring: true,
    // How far the question hangs over its slot: 1 is up and out of sight
    hang: rest(0),
    // Each document: how far it has arrived in the box, and how far it has risen in the ranking
    arrived: SOURCES.map(() => rest(0)),
    ranked: SOURCES.map(() => rest(0)),
    answer: rest(0),
  });
  const away = React.useRef<number | undefined>(undefined);
  const visible = useInView(anchor);

  const go = (stage: Stage) => {
    const s = state.current;
    s.stage = stage;
    s.since = 0;
    s.left = HOLD[stage];
    anchor.current?.setAttribute("aria-label", `${spokenOf(stage)} Press for the next step.`);
  };

  const kick = useLoop((dt, calm) => {
    const s = state.current;
    if (s.touring && !calm) {
      s.left -= dt;
      if (s.left <= 0) go((s.stage === LAST ? 0 : s.stage + 1) as Stage);
    }
    s.since += dt;
    const after = (seconds: number) => calm || s.since > seconds;
    const within = (from: number, to: number) => !calm && s.since > from && s.since < to;
    const rise = (value: Spring, up: boolean) => spring(value, up ? 1 : 0, dt, RISE_STIFFNESS, RISE_DAMPING, calm);
    let settled = true;

    settled = rise(s.hang, s.stage === 0) && settled;
    const searching = s.stage === 2;
    SOURCES.forEach((_, index) => {
      // The document lands a moment after it starts back along the line
      const landed = s.stage > 2 || (searching && after(RETURN_AT + index * RETURN_EVERY + LAND_AFTER));
      settled = rise(s.arrived[index], landed) && settled;
      settled = rise(s.ranked[index], s.stage >= 3 && (s.stage > 3 || after(0.35 + index * 0.1))) && settled;
    });
    settled = rise(s.answer, s.stage === 4 && after(0.7)) && settled;

    // Write the pose
    const up = clamp(s.hang.at);
    question.current?.setAttribute("transform", raise(up * DROP));
    question.current?.setAttribute("opacity", `${shown(1 - eased(up))}`);
    SOURCES.forEach((_, index) => {
      const arrived = s.arrived[index].at;
      const ranked = s.ranked[index].at;
      const node = docs.current[index];
      node?.setAttribute("transform", raise((clamp(arrived) - 1) * ARRIVE + ranked * RANKS[index]));
      node?.setAttribute("opacity", `${shown(eased(clamp(arrived * 1.6)))}`);
      // The sources of truth light once they stand clear of the rest
      node?.firstElementChild?.toggleAttribute("data-lit", index < TRUSTED && ranked > 0.5);
      out.current[index]?.toggleAttribute("data-flow", searching && within(index * QUERY_EVERY, QUERIES_FOR));
      const returning = RETURN_AT + index * RETURN_EVERY;
      back.current[index]?.toggleAttribute("data-flow", searching && within(returning, returning + LAND_AFTER + 0.5));
      apps.current[index]?.toggleAttribute("data-on", searching && after(WAKE_AT + index * QUERY_EVERY));
    });
    answer.current?.setAttribute("transform", raise(s.answer.at * ANSWER_LIFT));
    answer.current?.firstElementChild?.toggleAttribute("data-lit", s.answer.at > 0.3);
    lamp.current?.toggleAttribute("data-on", s.stage === 1 && after(0.4));
    names.current[0]?.toggleAttribute("data-on", s.stage === 1);
    names.current[1]?.toggleAttribute("data-on", s.stage >= 3);

    // The tag floats over the part in play, and says what has just happened there
    const status = statusOf({
      stage: s.stage,
      back: s.arrived.filter((value) => value.at > 0.5).length,
      ranked: s.ranked[0].at > 0.9,
      answered: s.answer.at > 0.9,
    });
    if (tag.current && status !== said.current) {
      said.current = status;
      if (status) tag.current.textContent = status;
      tag.current.toggleAttribute("data-off", !status);
    }
    if (tag.current && s.stage) {
      moveTag(tag.current, TAG_AT[s.stage - 1]);
    }
    const flowing = searching && !calm && s.since < RETURN_AT + SOURCES.length * RETURN_EVERY + LAND_AFTER + 0.6;
    return (s.touring && !calm) || !settled || flowing || (!calm && s.since < 1.2);
  }, visible);

  React.useEffect(() => () => window.clearTimeout(away.current), []);

  // A visitor's step stops the tour; it picks up again once they've been away a while
  const choose = (stage: Stage) => {
    const s = state.current;
    s.touring = false;
    go(stage);
    window.clearTimeout(away.current);
    away.current = window.setTimeout(() => {
      s.touring = true;
      kick();
    }, TOUR_BACK);
    kick();
  };

  const onward = () => (state.current.stage === LAST ? 1 : state.current.stage + 1) as Stage;

  const onKeyDown = (event: React.KeyboardEvent) => {
    const stage = state.current.stage;
    let to: number | null = null;
    if (event.key === " " || event.key === "Enter" || event.key === "ArrowRight") to = onward();
    if (event.key === "ArrowLeft") to = Math.max(stage - 1, 1);
    if (event.key === "Home") to = 1;
    if (event.key === "End") to = LAST;
    if (/^[1-4]$/.test(event.key)) to = Number(event.key);
    if (to === null) return;
    event.preventDefault();
    choose(to as Stage);
  };

  return (
    <div
      ref={anchor}
      className="fig-stage"
      tabIndex={0}
      role="button"
      aria-label={`${spokenOf(1)} Press for the next step.`}
      onClick={() => choose(onward())}
      onKeyDown={onKeyDown}
    >
      <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
        {BENCH}
        {/* Each source's own path along the line, shown only while something is travelling on it */}
        {BENCH_ART.out.map((d, index) => (
          <path
            key={`out-${index}`}
            ref={(node) => {
              out.current[index] = node;
            }}
            className="iso-line aw-flow"
            data-tone="lit"
            d={d}
          />
        ))}
        {BENCH_ART.back.map((d, index) => (
          <path
            key={`back-${index}`}
            ref={(node) => {
              back.current[index] = node;
            }}
            className="iso-line aw-flow"
            data-tone="lit"
            d={d}
          />
        ))}
        <Dots points={BENCH_ART.joints} size={1} tone="mid" />
        <Solid paths={BENCH_ART.gland} tone="mid" crease="none" />
        {["QUESTION", "ANSWER"].map((name, index) => (
          <text
            key={name}
            ref={(node) => {
              names.current[index] = node;
            }}
            className="iso-face-text aw-name"
            data-on={index === 0 ? "" : undefined}
            transform={BENCH_ART.names[index]}
            fontSize={7.4}
            textAnchor="middle"
          >
            {name}
          </text>
        ))}

        {/* The sources */}
        {SOURCE_ART.map((source, index) => (
          <g key={SOURCES[index]}>
            <Solid paths={source.flange} tone="lo" />
            <Solid paths={source.drum} tone="mid" inner={<Line d={source.bands} tone="faint" />} />
            <Line d={source.rim} tone="lo" />
            <text
              ref={(node) => {
                apps.current[index] = node;
              }}
              className="iso-face-text aw-app"
              transform={source.name}
              fontSize={4.3}
              textAnchor="middle"
            >
              {SOURCES[index]}
            </text>
            <Solid paths={source.port} tone="mid" crease="none" />
          </g>
        ))}

        {/* The question station */}
        <Solid paths={ASK_ART.base} tone="mid" inner={<Line d={ASK_ART.seam} tone="faint" />} />
        <Solid paths={ASK_ART.reader} tone="mid" inner={<Line d={ASK_ART.readerSeam} tone="faint" />} />
        <Line d={ASK_ART.vents} tone="lo" />
        <g ref={lamp} className="aw-lamp" data-on="">
          <Solid paths={ASK_ART.lamp} tone="mid" />
          <Dots points={ASK_ART.lampDot} size={0.9} tone="hi" />
        </g>
        <Solid paths={ASK_ART.skirt} tone="mid" />
        <Solid paths={ASK_ART.knob} tone="hi" crease="lo" />
        <Line d={ASK_ART.knurl} tone="lo" />
        <Line d={ASK_ART.cap} tone="lo" />
        <Line d={ASK_ART.pointer} tone="hi" />
        <Dots points={ASK_ART.capDot} size={0.7} tone="hi" />
        <Solid paths={ASK_ART.slotBack} tone="mid" />
        <g ref={question}>
          <Solid paths={ASK_ART.question} tone="hi" lit />
          <Line d={ASK_ART.questionBand} tone="lit" />
          <text className="iso-face-text aw-slip" transform={ASK_ART.questionText} fontSize={5.2} textAnchor="middle">
            {QUESTION}
          </text>
        </g>
        <Solid paths={ASK_ART.slotFront} tone="mid" />
        <Dots points={ASK_ART.slotScrews} size={0.4} />

        {/* The ranking box and the answer printer */}
        <Solid paths={RANK_ART.base} tone="mid" inner={<Line d={RANK_ART.seam} tone="faint" />} />
        <Solid paths={RANK_ART.boxBack} tone="mid" />
        <Solid paths={RANK_ART.boxLeft} tone="mid" />
        {RANK_ART.docs.map((doc, index) => (
          <g
            key={index}
            ref={(node) => {
              docs.current[index] = node;
            }}
            opacity={0}
          >
            <Solid paths={doc.slab} tone="hi" crease="lo" />
            <Line d={doc.title} tone="hi" free />
            <Line d={doc.text} tone="lo" free />
          </g>
        ))}
        <Solid paths={RANK_ART.boxRight} tone="mid" />
        <Solid paths={RANK_ART.boxFront} tone="mid" />
        <Dots points={RANK_ART.rivets} size={0.45} />
        <Solid paths={RANK_ART.printerBack} tone="mid" />
        <Line d={RANK_ART.vents} tone="lo" />
        <Dots points={RANK_ART.printerScrews} size={0.45} />
        <g ref={answer}>
          <Solid paths={RANK_ART.answer} tone="hi" crease="lo" />
          <Line d={RANK_ART.answerText} tone="mid" free />
          <g className="aw-refs">
            <Dots points={RANK_ART.answerRefs} size={1.1} tone="hi" />
          </g>
        </g>
        <Solid paths={RANK_ART.printerFront} tone="mid" />
        <Line d={RANK_ART.printerLine} tone="faint" />
        <Solid paths={RANK_ART.button} tone="mid" />
        <Dots points={RANK_ART.buttonDot} size={0.6} tone="hi" />
      </IsoFigure>
      <div ref={tag} className="fig-tag" style={TAG_AT[0]} aria-hidden="true">
        {STATUS_AT_REST}
      </div>
    </div>
  );
}

/** How Dashworks answers a question: read it, search the connected apps, rank what comes back, write the answer. */
export default function AnswerFigure() {
  return (
    <FigureCard className="answer" ratio={WIDTH / HEIGHT} caption={CAPTION}>
      <Bench />
    </FigureCard>
  );
}
