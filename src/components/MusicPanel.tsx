"use client";

import React, { useEffect, useRef } from "react";
import { useFocusStore } from "../store/focusStore";
import { MusicTrack } from "../types";
import { Volume2, VolumeX, Play, Pause, Disc, CloudRain, TreePine } from "lucide-react";

export default function MusicPanel() {
  const { currentTrack, volume, isMusicPlaying, setMusicTrack, setVolume, toggleMusic } = useFocusStore();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sourceNodesRef = useRef<any[]>([]);
  const loFiIntervalRef = useRef<any>(null);

  // Initialize Audio Context and Master Gain Node
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

  // Stop all running audio nodes
  const stopAllAudio = () => {
    if (loFiIntervalRef.current) {
      clearInterval(loFiIntervalRef.current);
      loFiIntervalRef.current = null;
    }
    sourceNodesRef.current.forEach((node) => {
      try {
        node.stop();
      } catch (e) {}
      try {
        node.disconnect();
      } catch (e) {}
    });
    sourceNodesRef.current = [];
  };

  // 1. Synthesize Rain (Brownian / white noise with a low pass filter)
  const playRain = (ctx: AudioContext, destination: AudioNode) => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate loss
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    
    // Slight modulation for dynamic rain gusts
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(0.15, ctx.currentTime);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(120, ctx.currentTime);

    osc.connect(oscGain);
    oscGain.connect(filter.frequency);
    
    noiseSource.connect(filter);
    filter.connect(destination);

    osc.start();
    noiseSource.start();

    sourceNodesRef.current.push(noiseSource, osc);
  };

  // 2. Synthesize Forest (Gentle wind & procedural bird chirps)
  const playForest = (ctx: AudioContext, destination: AudioNode) => {
    // Wind: Low-pass filtered pink noise
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
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.setValueAtTime(300, ctx.currentTime);

    // Wind LFO
    const windOsc = ctx.createOscillator();
    windOsc.frequency.setValueAtTime(0.08, ctx.currentTime);
    const windOscGain = ctx.createGain();
    windOscGain.gain.setValueAtTime(80, ctx.currentTime);

    windOsc.connect(windOscGain);
    windOscGain.connect(windFilter.frequency);

    windSource.connect(windFilter);
    windFilter.connect(destination);

    windOsc.start();
    windSource.start();

    sourceNodesRef.current.push(windSource, windOsc);

    // Procedural Bird Chirps
    const chirp = () => {
      if (!isMusicPlaying || currentTrack !== "Forest") return;
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Sweet frequency sweep for bird sounds
      const startFreq = 2500 + Math.random() * 1500;
      const endFreq = 1800 + Math.random() * 500;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.15);

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(destination);

      osc.start();
      osc.stop(now + 0.16);

      // Schedule next chirp randomly
      setTimeout(chirp, Math.random() * 4000 + 2000);
    };

    chirp();
  };

  // 3. Synthesize LoFi ambient chord sequence
  const playLoFi = (ctx: AudioContext, destination: AudioNode) => {
    // 7th chords: Cmaj7 (C4, E4, G4, B4), Am7 (A3, C4, E4, G4), Fmaj7 (F3, A3, C4, E4), G7 (G3, B3, D4, F4)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];

    let chordIndex = 0;

    // Gentle vinyl crackle in background
    const bufferSize = 1 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() < 0.0015 ? (Math.random() * 2 - 1) * 0.1 : 0;
    }
    const crackleSource = ctx.createBufferSource();
    crackleSource.buffer = noiseBuffer;
    crackleSource.loop = true;
    
    const crackleGain = ctx.createGain();
    crackleGain.gain.setValueAtTime(0.08, ctx.currentTime);
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

        // Safe warmth via Triangle waves
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);

        // Warm LP filter
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, now);

        // Very slow attack, long release
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 2.0); // 2s attack
        gain.gain.setValueAtTime(0.06, now + 5.0);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 7.8); // fade out

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc.start(now);
        osc.stop(now + 8.0);
      });
    };

    // Play immediately, then every 8 seconds
    playNextChord();
    const interval = setInterval(playNextChord, 8000);
    loFiIntervalRef.current = interval;
  };

  // Control Audio playback based on state
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
    }

    return () => stopAllAudio();
  }, [isMusicPlaying, currentTrack]);

  // Handle master volume adjustments
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(volume, audioCtxRef.current.currentTime + 0.1);
    }
  }, [volume]);

  const tracks = [
    { name: "LoFi" as MusicTrack, icon: Disc, label: "Lofi Beats" },
    { name: "Rain" as MusicTrack, icon: CloudRain, label: "Rainstorm" },
    { name: "Forest" as MusicTrack, icon: TreePine, label: "Deep Forest" },
  ];

  return (
    <div className="flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] h-full justify-between">
      <div>
        {/* Title */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Atmospheric Sounds
          </span>
        </div>

        {/* Tracks List */}
        <div className="flex flex-col gap-3">
          {tracks.map((track) => {
            const TrackIcon = track.icon;
            const isSelected = currentTrack === track.name;

            return (
              <button
                key={track.name}
                onClick={() => setMusicTrack(track.name)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 w-full ${
                  isSelected
                    ? "border-purple-500/50 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    : "border-white/5 bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                    isSelected ? "bg-purple-500/20" : "bg-white/5"
                  }`}
                >
                  <TrackIcon
                    className={`w-4.5 h-4.5 ${
                      isSelected && isMusicPlaying ? "animate-spin [animation-duration:10s]" : ""
                    }`}
                  />
                </div>
                <span className="text-sm font-medium tracking-wide">{track.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Bar & Volume */}
      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-4">
        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              Currently playing
            </span>
            <span className="text-xs font-semibold text-white mt-0.5">
              {isMusicPlaying ? `${currentTrack} (Synthesized)` : "Paused"}
            </span>
          </div>

          <button
            onClick={toggleMusic}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            {isMusicPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
            className="text-gray-400 hover:text-white transition"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/20 transition-all [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white"
          />
        </div>
      </div>
    </div>
  );
}
