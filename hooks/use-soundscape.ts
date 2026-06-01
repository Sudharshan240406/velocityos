"use client";

import { useEffect, useRef, useState } from "react";

type TrackPreset = "lofi" | "rain" | "forest" | "ocean" | "cafe" | "brown";

const trackFrequencies: Record<TrackPreset, number[]> = {
  lofi: [180, 240],
  rain: [320, 480],
  forest: [260, 340],
  ocean: [160, 220],
  cafe: [280, 360],
  brown: [120, 180],
};

export function useSoundscape() {
  const [enabled, setEnabled] = useState(false);
  const [track, setTrack] = useState<TrackPreset>("lofi");
  const [volume, setVolume] = useState(0.35);
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach((oscillator) => oscillator.stop());
      contextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      oscillatorsRef.current.forEach((oscillator) => oscillator.stop());
      oscillatorsRef.current = [];
      return;
    }

    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    const context = contextRef.current ?? new AudioCtx();
    contextRef.current = context;
    const gain = gainRef.current ?? context.createGain();
    gain.gain.value = volume;
    gain.connect(context.destination);
    gainRef.current = gain;

    oscillatorsRef.current.forEach((oscillator) => oscillator.stop());
    oscillatorsRef.current = trackFrequencies[track].map((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start();
      return oscillator;
    });

    return () => {
      oscillatorsRef.current.forEach((oscillator) => oscillator.stop());
      oscillatorsRef.current = [];
    };
  }, [enabled, track, volume]);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume]);

  function playSuccess() {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    const context = contextRef.current ?? new AudioCtx();
    contextRef.current = context;
    const gain = context.createGain();
    gain.gain.value = 0.08;
    gain.connect(context.destination);

    [440, 660, 880].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      oscillator.connect(gain);
      oscillator.start(context.currentTime + index * 0.12);
      oscillator.stop(context.currentTime + index * 0.12 + 0.24);
    });
  }

  return {
    enabled,
    setEnabled,
    track,
    setTrack,
    volume,
    setVolume,
    playSuccess,
  };
}
