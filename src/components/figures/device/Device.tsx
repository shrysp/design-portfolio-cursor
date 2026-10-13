"use client";

import * as React from "react";
import { PIP, profileToPath, screenBox, type Frame } from "@shrysp/cameo";
import { Dots, Line, Solid } from "@/components/iso/react/draw";
import { SCREEN, TO_WORLD, type DeviceArt } from "./geometry";
import "./device.css";

// The character's real screen, and how much smaller it is drawn on the device
const BOX = screenBox(PIP.silhouette);
const SHRINK = SCREEN.w / BOX.width;

/** What a figure holds of the device, to put a face on it each frame. */
export interface DeviceHandle {
  /** Draws the engine's frame: the eyes on the screen, and the body lifted and shifted as the frame has it. */
  show: (frame: Frame) => void;
  /** Tints the screen for a pose: colour is how the real face carries a mood. */
  pose: (id: string) => void;
}

/**
 * The character on the bench. Its eyes are the real engine's, drawn in the
 * plane of its screen, and its body lifts and leans with them. The body is
 * moved, never redrawn: a redrawn outline shimmers as its points round.
 */
export function Device({ art, handle }: { art: DeviceArt; handle: React.RefObject<DeviceHandle | null> }) {
  const face = React.useRef<SVGGElement>(null);
  const body = React.useRef<SVGGElement>(null);
  const tilt = React.useRef<SVGGElement>(null);
  const eyes = React.useRef<(SVGPathElement | null)[]>([]);

  React.useImperativeHandle(handle, () => ({
    show(frame) {
      const { x, y, rotation } = frame.housing;
      body.current?.setAttribute("transform", art.carry(-y * TO_WORLD, x * TO_WORLD));
      // A tilt of the head shows as its face turning in the screen
      tilt.current?.setAttribute("transform", `scale(${SHRINK.toFixed(4)}) rotate(${rotation.toFixed(2)} ${(BOX.width / 2).toFixed(0)} ${(BOX.height / 2).toFixed(0)})`);
      [frame.left, frame.right].forEach((eye, index) => {
        const node = eyes.current[index];
        if (!node) return;
        const cx = BOX.width * 0.5 + (index ? 1 : -1) * eye.spread * BOX.width;
        node.setAttribute("d", profileToPath(eye.profile, eye.size * BOX.height, eye.bend));
        node.setAttribute("transform", `translate(${(cx + eye.x).toFixed(1)} ${(BOX.height * 0.5 + eye.y).toFixed(1)}) rotate(${eye.rotation.toFixed(1)}) scale(${eye.scaleX.toFixed(3)} ${eye.scaleY.toFixed(3)})`);
        node.setAttribute("opacity", eye.opacity.toFixed(2));
      });
    },
    pose(id) {
      face.current?.setAttribute("data-pose", id);
    },
  }));

  return (
    <g>
      <Solid paths={art.pedestal} tone="mid" inner={<Line d={art.pedestalSeam} tone="faint" />} />
      <Line d={art.grille} tone="lo" />
      <Dots points={art.screws} size={0.45} />
      <Solid paths={art.neck} tone="lo" />
      <g ref={body}>
        <Solid paths={art.rest.body} tone="hi" crease="lo" inner={<Line d={art.rest.seams} tone="faint" />} />
        <Line d={art.rest.vents} tone="lo" />
        <path className="dv-bezel" d={art.rest.bezel} />
        <g ref={face} className="dv-face" data-pose="idle">
          <path className="dv-screen" d={art.rest.screen} />
          <g transform={art.rest.plane}>
            <g ref={tilt} transform={`scale(${SHRINK.toFixed(4)})`}>
              {[0, 1].map((index) => (
                <path
                  key={index}
                  ref={(node) => {
                    eyes.current[index] = node;
                  }}
                  className="dv-eye"
                />
              ))}
            </g>
          </g>
        </g>
        <Dots points={[art.rest.lamp]} size={0.8} tone="mid" />
      </g>
    </g>
  );
}
