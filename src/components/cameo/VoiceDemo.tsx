'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PIP } from '@shrysp/cameo';
import { Character, type CharacterHandle } from '@shrysp/cameo/react';
import '@shrysp/cameo/styles.css';
import { Row, lit, resting } from './DemoParts';
import { MOODS, MOOD_REACTIONS, reactionTo, showMood, strengthOf } from './moods';
import { RECORDINGS, type Recording } from './recordings';

// Loudness that fills the meter. Speech sits far below full scale.
const METER_FULL = 0.25;

// Off, listening to the microphone, or playing the recording at this place in the list
type Mode = 'off' | 'mic' | number;

/**
 * The face following sound. A recorded voice makes it speak, with each
 * sentence's reading beside it; the visitor's microphone makes it listen.
 * The bar under the face is the loudness it is following; the bars beside it
 * are the mood reading of the sentence being said, drawn when it came back.
 */
export default function VoiceDemo() {
  const character = useRef<CharacterHandle>(null);
  const meter = useRef<HTMLSpanElement>(null);
  const context = useRef<AudioContext | null>(null);
  const clips = useRef(new Map<string, AudioBuffer>());
  // Everything the running mode set up, undone in one call
  const teardown = useRef<(() => void) | null>(null);

  const [mode, setMode] = useState<Mode>('off');
  const [line, setLine] = useState<number | null>(null);
  // Whether the sentence on show has had its reading back yet
  const [read, setRead] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const lineRef = useRef<number | null>(null);
  useEffect(() => {
    lineRef.current = line;
  }, [line]);

  const stop = useCallback(() => {
    teardown.current?.();
    teardown.current = null;
    setMode('off');
    setLine(null);
    setRead(false);
  }, []);

  useEffect(
    () => () => {
      teardown.current?.();
      void context.current?.close();
    },
    [],
  );

  // Draws the loudness of whatever passes through `node` on the meter
  const follow = (ctx: AudioContext, node: AudioNode) => {
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    node.connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    let level = 0;
    let frame = 0;
    const draw = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) sum += ((sample - 128) / 128) ** 2;
      const raw = Math.min(1, Math.sqrt(sum / samples.length) / METER_FULL);
      // Quick to rise, slower to fall, like the face itself
      level = raw > level ? raw : level + (raw - level) * 0.15;
      if (meter.current) meter.current.style.scale = `${level.toFixed(3)} 1`;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      node.disconnect(analyser);
      if (meter.current) meter.current.style.scale = '0 1';
    };
  };

  const playVoice = async (index: number) => {
    stop();
    setMicError(null);
    setMode(index);
    const recording = RECORDINGS[index];
    const ctx = (context.current ??= new AudioContext());
    await ctx.resume();
    let clip = clips.current.get(recording.src);
    if (!clip) {
      clip = await ctx.decodeAudioData(await (await fetch(recording.src)).arrayBuffer());
      clips.current.set(recording.src, clip);
    }

    // The recording plays out loud, and a copy goes to the character as a
    // stream: it follows a stream without playing it a second time
    const voice = ctx.createGain();
    const copy = ctx.createMediaStreamDestination();
    voice.connect(ctx.destination);
    voice.connect(copy);
    const stopMeter = follow(ctx, voice);
    const stopSpeaking = await character.current?.speakFrom(copy.stream, { hold: 'auto', volume: 0 });

    const source = ctx.createBufferSource();
    source.buffer = clip;
    source.connect(voice);
    source.start(ctx.currentTime + 0.1);
    // Each sentence comes up as it starts being heard; its reading arrives,
    // and the face reacts, when it did in the live session.
    // A short sentence can end before its reading is back, so the next one
    // waits a moment for the label to be seen
    const timers = recording.sentences.flatMap((said, at) => [
      setTimeout(() => {
        setLine(at);
        setRead(false);
      }, 100 + Math.max(said.from, (recording.sentences[at - 1]?.readAt ?? -1) + 0.4) * 1000),
      setTimeout(() => {
        setRead((already) => already || lineRef.current === at);
        showMood(character.current, said.mood, said.moods[said.mood] ?? 1);
      }, 100 + said.readAt * 1000),
    ]);
    timers.push(setTimeout(stop, 100 + clip.duration * 1000 + 400));

    teardown.current = () => {
      timers.forEach(clearTimeout);
      try {
        source.stop();
      } catch {
        // Not started yet: nothing to stop
      }
      stopSpeaking?.();
      stopMeter();
      voice.disconnect();
    };
  };

  const useMic = async () => {
    stop();
    setMicError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicError('The microphone is blocked for this page.');
      return;
    }
    setMode('mic');
    const ctx = (context.current ??= new AudioContext());
    await ctx.resume();
    // The meter's reading needs a path to the output to be drawn at all, so it
    // ends in a silent gain: the visitor never hears themselves
    const mic = ctx.createMediaStreamSource(stream);
    const silent = ctx.createGain();
    silent.gain.value = 0;
    mic.connect(silent);
    silent.connect(ctx.destination);
    const stopMeter = follow(ctx, mic);
    const stopListening = await character.current?.listenTo(stream, { hold: 'auto', volume: 0 });

    teardown.current = () => {
      stopListening?.();
      stopMeter();
      mic.disconnect();
      silent.disconnect();
      stream.getTracks().forEach((track) => track.stop());
    };
  };

  const playing: Recording | null = typeof mode === 'number' ? RECORDINGS[mode] : null;
  const said = playing && line != null ? playing.sentences[line] : null;
  const shown = Boolean(said && read);
  const reaction = said && reactionTo(said.mood, said.moods[said.mood] ?? 1);

  return (
    <figure className="isolate relative w-full surface bg-stone-100 -space-y-2 my-3">
      <div className="isolate relative rounded-[calc(var(--surface-radius)-1px)] bg-white overflow-hidden outline outline-stone-200">
        <div className="grid items-center gap-x-6 md:grid-cols-[13rem_1fr] md:pr-6">
          <div className="flex flex-col items-center gap-4 pb-4 pt-8 md:py-6">
            <Character ref={character} preset={PIP} size={152} reactions={MOOD_REACTIONS} />
            {/* The loudness the face is following */}
            <span aria-hidden className="block h-1 w-28 overflow-hidden rounded-full bg-stone-200">
              <span ref={meter} className="block h-full w-full origin-left rounded-full bg-blue-500" style={{ scale: '0 1' }} />
            </span>
          </div>

          <div className="flex flex-col gap-3 px-4 pb-5 md:px-0 md:py-5">
            <p aria-live="polite" className="min-h-10 text-sm text-stone-700">
              {said ? (
                <>&ldquo;{said.text}&rdquo;</>
              ) : (
                <span className="text-stone-400">
                  {mode === 'mic' ? 'Say something. It listens while you talk and relaxes when you stop.' : 'Play a recording, or talk to it.'}
                </span>
              )}
            </p>

            {/* The reading, drawn when it came back: usually mid-sentence */}
            <ul className="flex flex-col gap-1.5">
              {MOODS.map((mood) => {
                const share = (shown && said?.moods[mood]) || 0;
                const chosen = shown && said?.mood === mood;
                return (
                  <li key={mood} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-2 text-sm">
                    <span className={chosen ? 'font-semibold text-stone-800' : 'text-stone-500'}>{mood}</span>
                    <span className="block h-1.5 overflow-hidden rounded-full bg-stone-200">
                      <span
                        className={`block h-full w-full origin-left rounded-full transition-[scale] duration-300 ease-out ${chosen ? 'bg-blue-500' : 'bg-stone-400'}`}
                        style={{ scale: `${share} 1` }}
                      />
                    </span>
                    <span className={`text-right font-mono text-[13px] tabular-nums ${chosen ? 'text-stone-800' : 'text-stone-400'}`}>
                      {shown ? `${Math.round(share * 100)}%` : '–'}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* What that reading earns */}
            <p className="min-h-10 border-t border-dashed border-stone-200 pt-3 text-sm text-stone-600">
              {!said || !shown ? (
                <span className="text-stone-400">{said ? 'Reading the sentence…' : 'Each sentence is read for its mood as PIP says it.'}</span>
              ) : reaction ? (
                <>
                  <span className="mr-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[13px] font-medium text-blue-600 shadow-[inset_0_0_0_1px_var(--color-blue-200)]">
                    {reaction.pose === 'idle' ? 'settles' : reaction.pose}
                  </span>
                  for {(reaction.duration ?? 0).toFixed(1)} s, at {Math.round(strengthOf(said.moods[said.mood] ?? 1) * 100)}% strength
                </>
              ) : (
                'No reaction. A plain statement is left alone.'
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4 pt-6">
        <Row name="Speaking" note="PIP, recorded live">
          {RECORDINGS.map(({ name }, index) => (
            <button key={name} type="button" aria-pressed={mode === index} onClick={() => (mode === index ? stop() : void playVoice(index))} className={mode === index ? lit : resting}>
              {name}
            </button>
          ))}
        </Row>
        <Row name="Listening" note="Follows you">
          <button type="button" onClick={mode === 'mic' ? stop : useMic} className={mode === 'mic' ? lit : resting}>
            {mode === 'mic' ? 'Stop listening' : 'Use your microphone'}
          </button>
          <span role={micError ? 'alert' : undefined} className={`text-sm ${micError ? 'text-red-700' : 'text-stone-500'}`}>
            {micError ?? 'Nothing is recorded or sent.'}
          </span>
        </Row>
      </div>
    </figure>
  );
}
