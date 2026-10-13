"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconFullScreen,
  IconMediaPauseFilled,
  IconMediaPlayFilled,
  IconMinimizeWindow,
  IconVolumeFilled,
  IconVolumeUpFilled,
} from "nucleo-micro-bold-essential";
import Glass from "@/components/Glass";
import { useKeyFlash } from "@/lib/useKeyFlash";

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

// The dock's glass
const glass = { blur: 2, saturate: 2, tint: 1, refraction: 26, bezel: 10 };

// How long the controls stay up after the pointer stops, while the video plays
const IDLE_MS = 2200;
// How far an arrow key moves through the video, in seconds
const SEEK_STEP = 5;

const clock = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

// A recording with the site's own controls in place of the browser's: a pane
// of the dock's glass carrying gel buttons and a scrubber whose handle is the
// blue gel bead. Space plays and pauses, the arrows step through, M mutes and
// F fills the screen; each shows on its button. The controls step back while
// the video plays and nothing is moving.
export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasSound, setHasSound] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isAwake, setIsAwake] = useState(true);
  const [pressedKey, flashKey] = useKeyFlash<"play" | "mute" | "fullscreen">();
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };
  const toggleMute = () => {
    const video = videoRef.current;
    if (video) video.muted = !video.muted;
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else frameRef.current?.requestFullscreen?.().catch(() => {});
  };
  const seekTo = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = Math.min(duration, Math.max(0, seconds));
    setTime(video.currentTime);
  };

  // Shows the controls, and lets them go again once things have been still
  const wake = () => {
    setIsAwake(true);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsAwake(false), IDLE_MS);
  };
  useEffect(() => {
    wake();
    return () => clearTimeout(idleTimer.current);
  }, []);

  // The time moves every frame, not at the few-times-a-second pace of the
  // video's own time events, so the scrubber glides
  useEffect(() => {
    if (!isPlaying || isScrubbing) return;
    let frame = requestAnimationFrame(function tick() {
      const video = videoRef.current;
      if (video) {
        setTime(video.currentTime);
        // A video gets a mute button once it turns out to carry sound, or
        // straight away in a browser that can't say either way
        const decoded = video as HTMLVideoElement & { webkitAudioDecodedByteCount?: number; mozHasAudio?: boolean };
        const canTell = "webkitAudioDecodedByteCount" in decoded || "mozHasAudio" in decoded;
        if (!canTell || decoded.mozHasAudio || (decoded.webkitAudioDecodedByteCount ?? 0) > 0) setHasSound(true);
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, isScrubbing]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // The keys work wherever focus is, since the stage shows nothing else. A
  // focused button keeps Space for itself.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const onControl = (event.target as HTMLElement | null)?.closest?.("button, [role='slider']");
      if (event.key === " " || event.key === "k") {
        if (onControl?.tagName === "BUTTON" && event.key === " ") return;
        event.preventDefault();
        flashKey("play");
        toggle();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        if (onControl?.getAttribute("role") === "slider") return;
        event.preventDefault();
        seekTo((videoRef.current?.currentTime ?? 0) + (event.key === "ArrowRight" ? SEEK_STEP : -SEEK_STEP));
      } else if (event.key === "m" && hasSound) {
        flashKey("mute");
        toggleMute();
      } else if (event.key === "f") {
        flashKey("fullscreen");
        toggleFullscreen();
      } else return;
      wake();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, hasSound]);

  const seekFromPointer = (clientX: number) => {
    const track = trackRef.current?.getBoundingClientRect();
    if (track) seekTo(((clientX - track.left) / track.width) * duration);
  };

  const progress = duration ? Math.min(1, time / duration) : 0;
  const showControls = isAwake || !isPlaying || isScrubbing;
  const pill = "aqua aqua-round aqua-to-blue size-8 shrink-0";

  return (
    <div
      ref={frameRef}
      onPointerMove={wake}
      onPointerLeave={() => isPlaying && setIsAwake(false)}
      className={`absolute inset-0 bg-black select-none ${showControls ? "" : "cursor-none"}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        onClick={toggle}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* The controls: fading the wrapper would leave the glass nothing to blur,
          so the glass fades itself (as the dock's project row does) */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center p-3 md:p-4 pointer-events-none">
        <Glass
          {...glass}
          initial={false}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onFocus={wake}
          className={`flex items-center gap-2 p-1.5 w-full max-w-xl ${showControls ? "pointer-events-auto" : ""}`}
        >
          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className={`${pill} ${pressedKey === "play" ? "aqua-pressed" : ""}`}
          >
            {isPlaying ? <IconMediaPauseFilled size={14} /> : <IconMediaPlayFilled size={14} />}
          </button>

          <span className="w-9 text-right text-[13px] font-medium tabular-nums text-stone-600">{clock(time)}</span>

          {/* The scrubber: a groove in the glass, filled in blue up to a gel bead */}
          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${clock(time)} of ${clock(duration)}`}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") seekTo(time - SEEK_STEP);
              else if (event.key === "ArrowRight") seekTo(time + SEEK_STEP);
              else if (event.key === "Home") seekTo(0);
              else if (event.key === "End") seekTo(duration);
              else return;
              event.preventDefault();
            }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setIsScrubbing(true);
              seekFromPointer(event.clientX);
            }}
            onPointerMove={(event) => isScrubbing && seekFromPointer(event.clientX)}
            onPointerUp={() => setIsScrubbing(false)}
            onPointerCancel={() => setIsScrubbing(false)}
            className="group relative flex-1 h-8 flex items-center cursor-pointer touch-none outline-none"
          >
            <div className="relative w-full h-1.5 rounded-full bg-stone-900/15 shadow-[inset_0_1px_1px_rgba(0,0,0,0.25),0_1px_0_rgba(255,255,255,0.7)]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-linear-to-b from-blue-400 to-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
                style={{ width: `${progress * 100}%` }}
              />
              <div
                className={`absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial-[at_50%_75%] from-blue-400 to-blue-600 shadow-[0_0_0_1px_var(--color-blue-700),inset_0_1.5px_0.5px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.3)] transition-transform duration-150 ease-out group-hover:scale-115 group-focus-visible:scale-115 ${isScrubbing ? "scale-125!" : ""}`}
                style={{ left: `${progress * 100}%` }}
              />
            </div>
          </div>

          <span className="w-9 text-[13px] font-medium tabular-nums text-stone-500">{clock(duration)}</span>

          {hasSound && (
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              aria-pressed={!isMuted}
              className={`${pill} ${pressedKey === "mute" ? "aqua-pressed" : ""}`}
            >
              {isMuted ? (
                <span className="relative flex">
                  <IconVolumeFilled size={14} />
                  {/* Struck through: the icon set has no muted speaker */}
                  <span aria-hidden className="absolute left-1/2 top-1/2 h-[2px] w-[18px] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current shadow-[0_0_0_1px_var(--color-stone-200)]" />
                </span>
              ) : (
                <IconVolumeUpFilled size={14} />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Leave full screen" : "Full screen"}
            className={`${pill} ${pressedKey === "fullscreen" ? "aqua-pressed" : ""}`}
          >
            {isFullscreen ? <IconMinimizeWindow size={14} /> : <IconFullScreen size={14} />}
          </button>
        </Glass>
      </div>
    </div>
  );
}
