"use client";

import React, { useEffect, useRef } from "react";
import { useFocusStore } from "../store/focusStore";
import { MusicTrack } from "../types";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

interface SoundTrack {
  id: MusicTrack;
  title: string;
  description: string;
  artClass: string;
  artElements: React.ReactNode;
}

export default function MusicPanel() {
  const { currentTrack, volume, isMusicPlaying, setMusicTrack, setVolume, toggleMusic } = useFocusStore();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sourceNodesRef = useRef<any[]>([]);
  const loFiIntervalRef = useRef<any>(null);
  const nightTimeoutRef = useRef<any>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const stopAllAudio = () => {
    if (loFiIntervalRef.current) {
      clearInterval(loFiIntervalRef.current);
      loFiIntervalRef.current = null;
    }
    if (nightTimeoutRef.current) {
      clearTimeout(nightTimeoutRef.current);
      nightTimeoutRef.current = null;
    }
    sourceNodesRef.current.forEach((node) => {
      try { node.stop(); } catch (e) {}
      try { node.disconnect(); } catch (e) {}
    });
    sourceNodesRef.current = [];
  };

  // Synthesize Rain
  const playRain = (ctx: AudioContext, destination: AudioNode) => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.025 * white) / 1.025;
      lastOut = output[i];
      output[i] *= 3.8;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(0.12, ctx.currentTime);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(100, ctx.currentTime);

    osc.connect(oscGain);
    oscGain.connect(filter.frequency);
    noiseSource.connect(filter);
    filter.connect(destination);

    osc.start();
    noiseSource.start();
    sourceNodesRef.current.push(noiseSource, osc);
  };

  // Synthesize Forest
  const playForest = (ctx: AudioContext, destination: AudioNode) => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.12;
      b6 = white * 0.115926;
    }

    const windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.setValueAtTime(250, ctx.currentTime);

    const windOsc = ctx.createOscillator();
    windOsc.frequency.setValueAtTime(0.06, ctx.currentTime);
    const windOscGain = ctx.createGain();
    windOscGain.gain.setValueAtTime(60, ctx.currentTime);

    windOsc.connect(windOscGain);
    windOscGain.connect(windFilter.frequency);
    windSource.connect(windFilter);
    windFilter.connect(destination);

    windOsc.start();
    windSource.start();
    sourceNodesRef.current.push(windSource, windOsc);

    const chirp = () => {
      if (!isMusicPlaying || currentTrack !== "Forest") return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const startFreq = 2600 + Math.random() * 1200;
      const endFreq = 1700 + Math.random() * 400;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.14);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      osc.stop(now + 0.15);

      nightTimeoutRef.current = setTimeout(chirp, Math.random() * 5000 + 3000);
    };
    chirp();
  };

  // Synthesize Ocean
  const playOcean = (ctx: AudioContext, destination: AudioNode) => {
    // Generate pink noise for a softer ocean wave crash
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.16;
      b6 = white * 0.115926;
    }

    const waveSource = ctx.createBufferSource();
    waveSource.buffer = noiseBuffer;
    waveSource.loop = true;

    // Modulate lowpass filter frequency (200Hz to 800Hz) periodically to represent wave movement
    const waveFilter = ctx.createBiquadFilter();
    waveFilter.type = "lowpass";
    waveFilter.frequency.setValueAtTime(350, ctx.currentTime);

    // Wave oscillator: 0.08Hz is roughly an 12-second wave cycle
    const waveOsc = ctx.createOscillator();
    waveOsc.frequency.setValueAtTime(0.08, ctx.currentTime);
    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(250, ctx.currentTime);

    waveOsc.connect(waveGain);
    waveGain.connect(waveFilter.frequency);
    waveSource.connect(waveFilter);
    waveFilter.connect(destination);

    waveOsc.start();
    waveSource.start();
    sourceNodesRef.current.push(waveSource, waveOsc);
  };

  // Synthesize Night Ambience
  const playNight = (ctx: AudioContext, destination: AudioNode) => {
    // Warm, deep background rumble at 55Hz (A1) and 110Hz (A2)
    const subOsc1 = ctx.createOscillator();
    subOsc1.type = "sine";
    subOsc1.frequency.setValueAtTime(55, ctx.currentTime);
    const subGain1 = ctx.createGain();
    subGain1.gain.setValueAtTime(0.12, ctx.currentTime);

    const subOsc2 = ctx.createOscillator();
    subOsc2.type = "triangle";
    subOsc2.frequency.setValueAtTime(110, ctx.currentTime);
    const subGain2 = ctx.createGain();
    subGain2.gain.setValueAtTime(0.06, ctx.currentTime);

    subOsc1.connect(subGain1);
    subGain1.connect(destination);
    subOsc2.connect(subGain2);
    subGain2.connect(destination);

    subOsc1.start();
    subOsc2.start();
    sourceNodesRef.current.push(subOsc1, subOsc2);

    // Procedural crickets chirps
    const cricket = () => {
      if (!isMusicPlaying || currentTrack !== "Night") return;
      const now = ctx.currentTime;
      
      // A cricket chirp is composed of 3 to 4 fast pulses
      const pulses = 3 + Math.floor(Math.random() * 2);
      let timeOffset = 0;

      for (let p = 0; p < pulses; p++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        // Crickets chirp at high pitch (around 4500Hz)
        osc.frequency.setValueAtTime(4500 + Math.random() * 100, now + timeOffset);
        
        gain.gain.setValueAtTime(0, now + timeOffset);
        gain.gain.linearRampToValueAtTime(0.008, now + timeOffset + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + 0.04);
        
        osc.connect(gain);
        gain.connect(destination);
        
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.05);
        
        timeOffset += 0.06;
      }

      nightTimeoutRef.current = setTimeout(cricket, Math.random() * 3000 + 1500);
    };
    cricket();
  };

  // Synthesize LoFi
  const playLoFi = (ctx: AudioContext, destination: AudioNode) => {
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];
    let chordIndex = 0;

    // Vinyl crackle
    const bufferSize = 1 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() < 0.002 ? (Math.random() * 2 - 1) * 0.08 : 0;
    }
    const crackleSource = ctx.createBufferSource();
    crackleSource.buffer = noiseBuffer;
    crackleSource.loop = true;
    
    const crackleGain = ctx.createGain();
    crackleGain.gain.setValueAtTime(0.06, ctx.currentTime);
    crackleSource.connect(crackleGain);
    crackleGain.connect(destination);
    crackleSource.start();
    sourceNodesRef.current.push(crackleSource);

    const playNextChord = () => {
      const now = ctx.currentTime;
      const notes = chords[chordIndex];
      chordIndex = (chordIndex + 1) % chords.length;

      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(550, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 1.8);
        gain.gain.setValueAtTime(0.05, now + 5.0);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 7.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc.start(now);
        osc.stop(now + 8.0);
      });
    };

    playNextChord();
    loFiIntervalRef.current = setInterval(playNextChord, 8000);
  };

  useEffect(() => {
    if (!isMusicPlaying) {
      stopAllAudio();
      return;
    }

    initAudio();
    const ctx = audioCtxRef.current;
    const dest = masterGainRef.current;
    if (!ctx || !dest) return;

    stopAllAudio();

    if (currentTrack === "LoFi") {
      playLoFi(ctx, dest);
    } else if (currentTrack === "Rain") {
      playRain(ctx, dest);
    } else if (currentTrack === "Forest") {
      playForest(ctx, dest);
    } else if (currentTrack === "Ocean") {
      playOcean(ctx, dest);
    } else if (currentTrack === "Night") {
      playNight(ctx, dest);
    }

    return () => stopAllAudio();
  }, [isMusicPlaying, currentTrack]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(volume, audioCtxRef.current.currentTime + 0.1);
    }
  }, [volume]);

  const soundTracks: SoundTrack[] = [
    {
      id: "LoFi",
      title: "LoFi Beats",
      description: "Warm procedural vintage hip-hop chords & crackles.",
      artClass: "from-purple-900 to-pink-800",
      artElements: (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-dashed border-pink-400 animate-spin [animation-duration:15s] flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-pink-400" />
          </div>
        </div>
      ),
    },
    {
      id: "Rain",
      title: "Rainstorm",
      description: "Low-frequency filtered atmospheric drizzle & wind.",
      artClass: "from-blue-950 to-cyan-900",
      artElements: (
        <div className="absolute inset-0 flex flex-col justify-around px-4 py-3 opacity-30">
          <div className="w-full h-0.5 bg-cyan-400 translate-x-2 rotate-12" />
          <div className="w-full h-0.5 bg-cyan-400 -translate-x-1 rotate-12" />
          <div className="w-full h-0.5 bg-cyan-400 translate-x-4 rotate-12" />
        </div>
      ),
    },
    {
      id: "Forest",
      title: "Deep Forest",
      description: "Gentle forest wind with procedural bird sweeps.",
      artClass: "from-emerald-950 to-green-900",
      artElements: (
        <div className="absolute bottom-2 left-2 right-2 flex justify-around items-end opacity-20">
          <div className="w-3 h-8 bg-green-400 rounded-t-full" />
          <div className="w-4 h-12 bg-green-400 rounded-t-full" />
          <div className="w-3 h-10 bg-green-400 rounded-t-full" />
        </div>
      ),
    },
    {
      id: "Ocean",
      title: "Ocean Waves",
      description: "Slow breaking wave cycles synthesized via pink noise.",
      artClass: "from-cyan-950 to-blue-900",
      artElements: (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-cyan-400/20 to-transparent animate-pulse" />
      ),
    },
    {
      id: "Night",
      title: "Night Ambience",
      description: "Deep frequency sub drone combined with cricket chirps.",
      artClass: "from-slate-950 to-indigo-950",
      artElements: (
        <div className="absolute top-2 right-3 w-4 h-4 rounded-full bg-indigo-300/20 blur-[2px]" />
      ),
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-4 border border-white/8 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Soundscapes
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
              className="text-gray-400 hover:text-white transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/20 transition-all [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
        </div>

        {/* Grid of Artwork cards */}
        <div className="flex flex-col gap-3">
          {soundTracks.map((track) => {
            const isSelected = currentTrack === track.id;
            const isPlaying = isSelected && isMusicPlaying;

            return (
              <div
                key={track.id}
                onClick={() => {
                  setMusicTrack(track.id);
                  if (!isMusicPlaying) toggleMusic();
                }}
                className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-purple-500/40 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10"
                }`}
              >
                {/* Artwork Card */}
                <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${track.artClass} relative overflow-hidden border border-white/10 shrink-0`}>
                  {track.artElements}
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                    {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-black text-white">{track.title}</h4>
                    {/* Animated Equalizer */}
                    {isPlaying && (
                      <div className="flex items-end gap-0.5 h-3">
                        <div className="w-0.5 bg-purple-400 rounded-full animate-bounce [animation-duration:0.6s]" />
                        <div className="w-0.5 bg-purple-400 rounded-full h-2 animate-bounce [animation-duration:0.8s]" />
                        <div className="w-0.5 bg-purple-400 rounded-full animate-bounce [animation-duration:0.5s]" />
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-400 font-medium leading-tight mt-0.5">
                    {track.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Currently Playing</span>
          <span className="text-[10px] font-black text-white">{isMusicPlaying ? currentTrack : "Paused"}</span>
        </div>
        <button
          onClick={toggleMusic}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition"
        >
          {isMusicPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
