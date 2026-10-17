"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  /**
   * In the flow of a page rather than alone on a stage: it plays, muted, only
   * while it is in view (never for someone who has asked for less motion),
   * and its keys work only once it has focus, so Space and the arrows still
   * scroll the page.
   */
  inline?: boolean;
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
export default function VideoPlayer({ src, poster, inline = false }: VideoPlayerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(!inline);
  const [isMuted, setIsMuted] = useState(true);
  /** Paused by the visitor, inline: scrolling back to it must not start it again. */
  const heldByVisitor = useRef(false);
  const [hasSound, setHasSound] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isAwake, setIsAwake] = useState(true);
  const [pressedKey, flashKey] = useKeyFlash<"play" | "mute" | "fullscreen">();
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fillRef = useRef<HTMLDivElement>(null);
  const beadRef = useRef<HTMLDivElement>(null);

  // Draws the scrubber at a share (0..1) of the video, straight onto the fill and
  // the bead, so a playing video doesn't re-render the player every frame. The
  // fill is clipped rather than sized and the bead translated rather than placed.
  const paint = (share: number) => {
    const fill = fillRef.current;
    const bead = beadRef.current;
    const groove = fill?.parentElement;
    if (!fill || !bead || !groove) return;
    fill.style.clipPath = `inset(0 ${(1 - share) * 100}% 0 0 round 999px)`;
    bead.style.translate = `calc(${share * groove.clientWidth}px - 50%) -50%`;
  };

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    heldByVisitor.current = !video.paused;
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
    paint(video.currentTime / duration);
  };

  // Shows the controls, and lets them go again once things have been still
  const wake = () => {
    setIsAwake(true);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsAwake(false), IDLE_MS);
  };
  useEffect(() => {
    wake();
    // Rendered on the server, the video can know its length before React is
    // listening for it, and the total would read 0:00
    const video = videoRef.current;
    if (video && video.readyState >= 1) setDuration(video.duration);
    return () => clearTimeout(idleTimer.current);
  }, []);

  // The scrubber moves every frame, not at the few-times-a-second pace of the
  // video's own time events, so it glides. The clock only needs whole seconds.
  useEffect(() => {
    if (!isPlaying || isScrubbing) return;
    let frame = requestAnimationFrame(function tick() {
      const video = videoRef.current;
      if (video) {
        if (video.duration) paint(Math.min(1, video.currentTime / video.duration));
        const now = video.currentTime;
        setTime((shown) => (Math.floor(shown) === Math.floor(now) ? shown : now));
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

  // Inline, it plays while at least half of it is on screen and pauses once it
  // scrolls away, unless the visitor paused it themselves
  useEffect(() => {
    const video = videoRef.current;
    if (!inline || !video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !heldByVisitor.current) {
          // Starts silent, as autoplay must, unless the visitor has turned the sound on
          if (!video.dataset.unmuted) video.muted = true;
          video.play().catch(() => {});
        } else if (!entry.isIntersecting && !video.paused) {
          video.pause();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [inline]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // On the stage the keys work wherever focus is, since it shows nothing
  // else; inline, only once the player has focus. A focused button keeps
  // Space for itself.
  useEffect(() => {
    const target: HTMLElement | Window | null = inline ? frameRef.current : window;
    if (!target) return;
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
    const listener = onKey as EventListener;
    target.addEventListener("keydown", listener);
    return () => target.removeEventListener("keydown", listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, hasSound, inline]);

  const seekFromPointer = (clientX: number) => {
    const track = trackRef.current?.getBoundingClientRect();
    if (track) seekTo(((clientX - track.left) / track.width) * duration);
  };

  const progress = duration ? Math.min(1, time / duration) : 0;
  // Drawn again whenever the time or length changes outside the frame loop, and
  // when the groove changes size, since the bead is placed in pixels
  useLayoutEffect(() => {
    const video = videoRef.current;
    paint(video && duration ? Math.min(1, video.currentTime / duration) : 0);
  }, [time, duration]);
  useEffect(() => {
    const groove = fillRef.current?.parentElement;
    if (!groove) return;
    const observer = new ResizeObserver(() => {
      const video = videoRef.current;
      paint(video?.duration ? Math.min(1, video.currentTime / video.duration) : 0);
    });
    observer.observe(groove);
    return () => observer.disconnect();
  }, []);
  const showControls = isAwake || !isPlaying || isScrubbing;
  const pill = "aqua aqua-round aqua-to-blue size-8 shrink-0";

  return (
    <div
      ref={frameRef}
      onPointerMove={wake}
      onPointerLeave={() => isPlaying && setIsAwake(false)}
      tabIndex={inline ? 0 : undefined}
      aria-label={inline ? "Video player" : undefined}
      className={`absolute inset-0 bg-black select-none outline-none ${showControls ? "" : "cursor-none"}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={!inline}
        muted
        loop
        preload={inline ? "metadata" : undefined}
        playsInline
        onClick={toggle}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={(event) => {
          setIsMuted(event.currentTarget.muted);
          // Sound turned on stays on when it scrolls out of view and back
          if (!event.currentTarget.muted) event.currentTarget.dataset.unmuted = "1";
        }}
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
              const now = videoRef.current?.currentTime ?? time;
              if (event.key === "ArrowLeft") seekTo(now - SEEK_STEP);
              else if (event.key === "ArrowRight") seekTo(now + SEEK_STEP);
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
                ref={fillRef}
                className="absolute inset-0 rounded-full bg-linear-to-b from-blue-400 to-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
                style={{ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0 round 999px)` }}
              />
              <div
                className={`absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial-[at_50%_75%] from-blue-400 to-blue-600 shadow-[0_0_0_1px_var(--color-blue-700),inset_0_1.5px_0.5px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.3)] transition-transform duration-150 ease-out group-hover:scale-115 group-focus-visible:scale-115 ${isScrubbing ? "scale-125!" : ""}`}
                ref={beadRef}
                style={{ left: 0 }}
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
