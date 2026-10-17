"use client";

import * as React from "react";
import { Dots, IsoFigure, Line, Solid } from "@/components/iso/react/draw";
import { follow, spring, useInView, useLoop, type Spring } from "@/components/iso/react/live";
import FigureCard from "../FigureCard";
import {
  BENCH_ART,
  DROP,
  GROUPS_ART,
  HEIGHT,
  LIFT,
  PLAYBOOKS_ART,
  RAIL_ART,
  HIGH,
  JOURNEYS,
  SEND,
  SEARCH_ART,
  SLIDE,
  TAG_AT,
  TICKET_LIFT,
  WIDTH,
  carry,
  raise,
  shift,
  type CardArt,
} from "./geometry";
import { GOAL, GROUP, MATCHES, QUERY, STAGES, spokenOf, statusOf, type Stage } from "./model";
import "./framework.css";
import { moveTag } from "../moveTag";

// ── Motion ──
// Cards rise on a spring with a little overshoot; the query glides along the rail
const RISE_STIFFNESS = 110;
const RISE_DAMPING = 15;
const SLIDE_SECONDS = 0.3;
// Cards in a row leave one after another
const STAGGER = 0.07;
// How long a card takes to travel from the deck to the group, and how far apart the cards set off
const CARRY_SECONDS = 1.5;
const CARRY_STAGGER = 0.14;
// The share of that journey spent rising clear of the deck, before the card is carried across
const HANDOVER = 0.25;
// How long after the group fills before it finds one more card for itself
const GROWS_AFTER = 1.1;
// How far apart the emails go out
const SEND_EVERY = 0.42;
// Left alone, the bench plays through its three layers: how long it rests, then holds each
const HOLD = [2.8, 3.2, 5.4, 5.6];
// How long after a visitor's last touch the tour picks up again
const TOUR_BACK = 10000;

const rest = (at: number): Spring => ({ at, rate: 0 });
const eased = (value: number) => value * value * (3 - 2 * value);
const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const shown = (opacity: number) => Math.round(opacity * 100) / 100;

const STATUS_AT_REST = statusOf({ stage: 1, matched: true, saved: false, grown: false, sent: 0 });

const LABEL =
  "A bench with three stations behind one slot rail. At Search, a query card drops into the rail and the four matching contact cards rise out of a deck of twelve. At Groups, those four cards are lifted clear of the deck and carried across into a box of their own, and a feeder adds a fifth by itself. At Playbooks, a goal card reading ask for intro drops in, and an email rises out of the box and leaves for each of the five contacts, after which a printer issues a receipt.";

function Card({ art, tone = "hi", lit = false }: { art: CardArt; tone?: "hi" | "mid"; lit?: boolean }) {
  return (
    <>
      <Solid paths={art.slab} tone={tone} crease="lo" lit={lit} />
      <Line d={art.portrait} tone="mid" />
      <Line d={art.name} tone={tone} free />
      <Line d={art.role} tone="lo" free />
    </>
  );
}

function Box({ box, children }: { box: typeof SEARCH_ART.box; children: React.ReactNode }) {
  return (
    <>
      <Solid paths={box.back} tone="mid" />
      <Solid paths={box.left} tone="mid" />
      {children}
      <Solid paths={box.right} tone="mid" />
      <Solid paths={box.front} tone="mid" />
      <Dots points={box.rivets} size={0.45} />
    </>
  );
}

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
  </g>
);

function Bench() {
  const anchor = React.useRef<HTMLDivElement>(null);
  const tag = React.useRef<HTMLDivElement>(null);
  const said = React.useRef(STATUS_AT_REST);
  const names = React.useRef<(SVGTextElement | null)[]>([]);
  const links = React.useRef<(SVGPathElement | null)[]>([]);
  const found = React.useRef<(SVGGElement | null)[]>([]);
  const kept = React.useRef<(SVGGElement | null)[]>([]);
  const mail = React.useRef<(SVGGElement | null)[]>([]);
  const ticket = React.useRef<SVGGElement>(null);
  const query = React.useRef<SVGGElement>(null);
  const goal = React.useRef<SVGGElement>(null);
  const lamp = React.useRef<SVGGElement>(null);

  // The pose the page is served in: the search has just run
  const state = React.useRef({
    stage: 1 as Stage,
    since: 10,
    left: HOLD[1],
    touring: true,
    // The query card: how far it hangs over the rail (1 is up and out of sight), and how far along it is
    hang: rest(0),
    along: 0,
    // Set when the query has to go back to Search: it lifts out, returns unseen, and drops in again
    returning: false,
    // Each match: how far it has risen out of the deck, and how far along its journey to the group it is
    lift: MATCHES.map(() => rest(1)),
    journey: MATCHES.map(() => 0),
    // How long the group has had all its cards, and the one it then finds for itself
    settledFor: 0,
    extra: rest(0),
    goal: rest(1),
    // How long the playbook has been sending
    sending: 0,
    ticket: rest(0),
  });
  const back = React.useRef<number | undefined>(undefined);
  const visible = useInView(anchor);

  const go = (stage: Stage) => {
    const s = state.current;
    if (stage === 1 && s.along > 0.5) s.returning = true;
    s.stage = stage;
    s.since = 0;
    s.left = HOLD[stage];
    anchor.current?.setAttribute("aria-label", `${spokenOf(stage)} Press for the next step.`);
  };

  const kick = useLoop((dt, calm) => {
    const s = state.current;
    if (s.touring && !calm) {
      s.left -= dt;
      if (s.left <= 0) go(((s.stage + 1) % 4) as Stage);
    }
    s.since += dt;
    const after = (seconds: number) => calm || s.since > seconds;
    const rise = (value: Spring, up: boolean) => spring(value, up ? 1 : 0, dt, RISE_STIFFNESS, RISE_DAMPING, calm);
    let settled = true;

    // The query card
    const seated = s.stage !== 0 && !s.returning;
    settled = rise(s.hang, !seated) && settled;
    if (s.returning && s.hang.at > 0.97) {
      s.along = 0;
      s.returning = false;
      s.since = 0;
    }
    const alongTo = s.stage >= 2 ? 1 : s.stage === 1 && !s.returning ? 0 : s.along;
    if (s.hang.at < 0.5) s.along = follow(s.along, alongTo, dt, SLIDE_SECONDS, calm);
    settled = s.along === alongTo && settled;

    // Search lifts the matches. Groups carries them over, one after another, and
    // they come back the same way when the bench resets.
    const grouped = s.stage >= 2;
    const searching = s.stage === 1 && !s.returning && s.along < 0.03;
    s.journey.forEach((value, index) => {
      const lifted = s.lift[index].at > 0.9;
      const due = after(index * CARRY_STAGGER);
      let next = value;
      if (grouped && lifted && due) next = calm ? 1 : Math.min(value + dt / CARRY_SECONDS, 1);
      if (!grouped && due) next = calm ? 0 : Math.max(value - dt / CARRY_SECONDS, 0);
      s.journey[index] = next;
      settled = next === (grouped ? 1 : 0) && settled;
      settled = rise(s.lift[index], grouped || next > 0 || (searching && after(0.35 + index * STAGGER))) && settled;
    });

    // Once the group has its cards, it finds one more for itself
    const saved = s.journey.every((value) => value === 1);
    s.settledFor = saved ? s.settledFor + dt : 0;
    const growing = saved && !calm && s.settledFor < GROWS_AFTER + 0.2;
    settled = rise(s.extra, saved && (calm || s.settledFor > GROWS_AFTER)) && settled;

    // Playbooks: the goal drops in, and an email goes out to each contact in turn
    const playing = s.stage === 3;
    settled = rise(s.goal, !playing) && settled;
    s.sending = playing && saved ? s.sending + dt : 0;
    // Each email runs from 0 (not written) through 1 (standing in the box) to 2 (sent and gone)
    const emails = PLAYBOOKS_ART.mail.map((_, index) => {
      if (!playing || !saved) return 0;
      if (calm) return 1;
      const from = 0.5 + index * SEND_EVERY;
      return clamp((s.sending - from) / 0.45) + clamp((s.sending - from - 0.9) / 0.7);
    });
    const sent = calm && playing && saved ? GROUP : emails.filter((value) => value > 1.5).length;
    const sendingStill = playing && saved && !calm && emails.some((value) => value < 2);
    settled = rise(s.ticket, sent === GROUP) && settled;

    // Write the pose
    s.lift.forEach((value, index) => {
      const journey = s.journey[index];
      const carried = journey >= HANDOVER;
      // In the deck: rising to the search, then on up clear of the other cards
      const deck = found.current[index];
      deck?.setAttribute("transform", raise(value.at * LIFT + eased(clamp(journey / HANDOVER)) * (HIGH - LIFT)));
      deck?.setAttribute("visibility", carried ? "hidden" : "visible");
      // Over the bench: across to the group, then down into its box
      const across = 1 - eased(clamp((journey - HANDOVER) / 0.5));
      const down = 1 - eased(clamp((journey - HANDOVER - 0.5) / (0.5 - HANDOVER)));
      const [dx, dy] = JOURNEYS[index];
      const flown = kept.current[index + 1];
      flown?.setAttribute("transform", carry([dx * across, dy * across, HIGH * down]));
      flown?.setAttribute("visibility", carried ? "visible" : "hidden");
    });
    // The card the group finds for itself fades in as it comes up, and lights
    const extra = kept.current[0];
    extra?.setAttribute("transform", raise((clamp(s.extra.at) - 1) * 8));
    extra?.setAttribute("opacity", `${shown(eased(clamp(s.extra.at * 1.6)))}`);
    emails.forEach((value, index) => {
      const node = mail.current[index];
      node?.setAttribute("transform", raise(eased(clamp(value)) * LIFT + eased(clamp(value - 1)) * SEND));
      node?.setAttribute("opacity", `${shown(eased(clamp(value * 1.6)) * (1 - eased(clamp(value - 1))))}`);
    });
    ticket.current?.setAttribute("transform", raise(s.ticket.at * TICKET_LIFT));
    const drop = (node: SVGGElement | null, hang: number, along: number) => {
      node?.setAttribute("transform", shift(along * SLIDE, clamp(hang) * DROP));
      node?.setAttribute("opacity", `${shown(1 - eased(clamp(hang)))}`);
    };
    drop(query.current, s.hang.at, s.along);
    drop(goal.current, s.goal.at, 0);
    names.current.forEach((node, index) => node?.toggleAttribute("data-on", s.stage === index + 1));
    links.current[0]?.toggleAttribute("data-flow", grouped && !saved);
    links.current[1]?.toggleAttribute("data-flow", sendingStill);
    lamp.current?.toggleAttribute("data-on", s.extra.at > 0.3 || (growing && s.settledFor > GROWS_AFTER - 0.5));

    // The tag floats over the station in play, and says what has just happened there
    const status = statusOf({
      stage: s.stage,
      matched: s.lift.every((value) => value.at > 0.9) && s.journey.every((value) => value === 0),
      saved,
      grown: s.extra.at > 0.9,
      sent,
    });
    if (tag.current && status !== said.current) {
      said.current = status;
      if (status) tag.current.textContent = status;
      tag.current.toggleAttribute("data-off", !status);
    }
    if (tag.current && s.stage) {
      moveTag(tag.current, TAG_AT[s.stage - 1]);
    }
    return (s.touring && !calm) || !settled || s.returning || growing || sendingStill;
  }, visible);

  React.useEffect(() => () => window.clearTimeout(back.current), []);

  // A visitor's step stops the tour; it picks up again once they've been away a while
  const choose = (stage: Stage) => {
    const s = state.current;
    s.touring = false;
    go(stage);
    window.clearTimeout(back.current);
    back.current = window.setTimeout(() => {
      s.touring = true;
      kick();
    }, TOUR_BACK);
    kick();
  };

  const next = () => choose((state.current.stage === 3 ? 1 : state.current.stage + 1) as Stage);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const stage = state.current.stage;
    let to: number | null = null;
    if (event.key === " " || event.key === "Enter" || event.key === "ArrowRight") to = stage === 3 ? 1 : stage + 1;
    if (event.key === "ArrowLeft") to = Math.max(stage - 1, 1);
    if (event.key === "Home" || event.key === "1") to = 1;
    if (event.key === "2") to = 2;
    if (event.key === "End" || event.key === "3") to = 3;
    if (to === null) return;
    event.preventDefault();
    choose(to as Stage);
  };

  return (
    <div ref={anchor} className="fig-stage" tabIndex={0} role="button" aria-label={`${spokenOf(1)} Press for the next step.`} onClick={next} onKeyDown={onKeyDown}>
      <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
        {BENCH}
        {BENCH_ART.links.map((d, index) => (
          <path
            key={index}
            ref={(node) => {
              links.current[index] = node;
            }}
            className="iso-line fw-link"
            data-tone="mid"
            d={d}
          />
        ))}
        {BENCH_ART.glands.map((paths, index) => (
          <Solid key={index} paths={paths} tone="mid" crease="none" />
        ))}
        {/* The station a visitor is on is the name that lights */}
        {BENCH_ART.names.map((transform, index) => (
          <text
            key={STAGES[index]}
            ref={(node) => {
              names.current[index] = node;
            }}
            className="iso-face-text fw-name"
            data-on={index === 0 ? "" : undefined}
            transform={transform}
            fontSize={7.4}
            textAnchor="middle"
          >
            {STAGES[index].toUpperCase()}
          </text>
        ))}

        {/* Search */}
        <Solid paths={SEARCH_ART.base} tone="mid" inner={<Line d={SEARCH_ART.seam} tone="faint" />} />
        <Box box={SEARCH_ART.box}>
          {SEARCH_ART.cards.map((card, index) => {
            const slot = MATCHES.indexOf(index);
            return (
              <g
                key={index}
                ref={
                  slot < 0
                    ? undefined
                    : (node) => {
                        found.current[slot] = node;
                      }
                }
                transform={slot < 0 ? undefined : raise(LIFT)}
              >
                <Card art={card} tone={card.match ? "hi" : "mid"} />
              </g>
            );
          })}
        </Box>
        <Solid paths={SEARCH_ART.console} tone="mid" />
        <Line d={SEARCH_ART.consoleLine} tone="faint" />
        <Solid paths={SEARCH_ART.plaque} tone="lo" crease="none" />
        <Line d={SEARCH_ART.plaqueRule} tone="lo" free />
        <Dots points={SEARCH_ART.plaqueScrews} size={0.4} />
        <Solid paths={SEARCH_ART.skirt} tone="mid" />
        <Solid paths={SEARCH_ART.knob} tone="hi" crease="lo" />
        <Line d={SEARCH_ART.knurl} tone="lo" />
        <Line d={SEARCH_ART.cap} tone="lo" />
        <Line d={SEARCH_ART.pointer} tone="hi" />
        <Dots points={SEARCH_ART.capDot} size={0.7} tone="hi" />

        {/* Groups */}
        <Solid paths={GROUPS_ART.base} tone="mid" inner={<Line d={GROUPS_ART.seam} tone="faint" />} />
        <Solid paths={GROUPS_ART.feeder} tone="mid" inner={<Line d={GROUPS_ART.feederSeam} tone="faint" />} />
        <Line d={GROUPS_ART.feederSlot} tone="lo" />
        <Dots points={GROUPS_ART.feederScrews} size={0.45} />
        <g ref={lamp} className="fw-lamp">
          <Solid paths={GROUPS_ART.lamp} tone="mid" />
          <Dots points={GROUPS_ART.lampDot} size={0.9} tone="hi" />
        </g>
        <Box box={GROUPS_ART.box}>
          {GROUPS_ART.cards.map((card, index) => (
            <g
              key={index}
              ref={(node) => {
                kept.current[index] = node;
              }}
              opacity={index ? undefined : 0}
              visibility={index ? "hidden" : undefined}
            >
              <Card art={card} lit={index === 0} />
            </g>
          ))}
        </Box>

        {/* Playbooks */}
        <Solid paths={PLAYBOOKS_ART.base} tone="mid" inner={<Line d={PLAYBOOKS_ART.seam} tone="faint" />} />
        <Box box={PLAYBOOKS_ART.box}>
          {PLAYBOOKS_ART.mail.map((envelope, index) => (
            <g
              key={index}
              ref={(node) => {
                mail.current[index] = node;
              }}
              opacity={0}
            >
              <Solid paths={envelope.slab} tone="hi" crease="lo" lit />
              <Line d={envelope.flap} tone="lit" />
            </g>
          ))}
        </Box>
        <Solid paths={PLAYBOOKS_ART.printerBack} tone="mid" />
        <Line d={PLAYBOOKS_ART.printerVents} tone="lo" />
        <Dots points={PLAYBOOKS_ART.printerScrews} size={0.45} />
        <g ref={ticket}>
          <Solid paths={PLAYBOOKS_ART.ticket} tone="hi" crease="lo" />
          <Line d={PLAYBOOKS_ART.ticketMark} tone="mid" free />
          <Line d={PLAYBOOKS_ART.ticketRules} tone="mid" free />
        </g>
        <Solid paths={PLAYBOOKS_ART.printerFront} tone="mid" />
        <Line d={PLAYBOOKS_ART.printerLine} tone="faint" />
        <Solid paths={PLAYBOOKS_ART.button} tone="mid" />
        <Dots points={PLAYBOOKS_ART.buttonDot} size={0.6} tone="hi" />

        {/* The rail, with the query and the goal standing in it */}
        <Solid paths={RAIL_ART.back} tone="mid" />
        <g ref={query}>
          <Solid paths={RAIL_ART.query.slab} tone="hi" lit />
          <Line d={RAIL_ART.query.rule} tone="lit" />
          <text className="iso-face-text fw-slip" transform={RAIL_ART.query.text} fontSize={5.4} textAnchor="middle">
            {QUERY}
          </text>
        </g>
        <g ref={goal} opacity={0} transform={shift(0, DROP)}>
          <Solid paths={RAIL_ART.goal.slab} tone="hi" lit />
          <Line d={RAIL_ART.goal.rule} tone="lit" />
          <text className="iso-face-text fw-slip" transform={RAIL_ART.goal.text} fontSize={5.4} textAnchor="middle">
            {GOAL}
          </text>
        </g>
        <Solid paths={RAIL_ART.front} tone="mid" />
        <Dots points={RAIL_ART.frontScrews} size={0.4} />
        {RAIL_ART.stops.map((paths, index) => (
          <Solid key={index} paths={paths} tone="mid" />
        ))}
        <Dots points={RAIL_ART.stopScrews} size={0.45} />
      </IsoFigure>
      <div ref={tag} className="fig-tag" style={TAG_AT[0]} aria-hidden="true">
        {STATUS_AT_REST}
      </div>
    </div>
  );
}

/** Quinn's three layers as one bench: a search lifts cards, a group takes them in, a playbook emails them. */
export default function FrameworkFigure() {
  return (
    <FigureCard className="framework" ratio={WIDTH / HEIGHT}>
      <Bench />
    </FigureCard>
  );
}
