import { useState, useEffect, useRef } from 'react';

export function useTimer(initialSeconds: number = 0) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setIsActive(false);
  }, [initialSeconds]);

  const playChime = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio fallback silent
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      setIsActive(false);
      playChime();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const startTimer = (secs?: number) => {
    if (secs !== undefined) setSecondsLeft(secs);
    setIsActive(true);
  };

  const pauseTimer = () => setIsActive(false);

  const resetTimer = (secs?: number) => {
    setIsActive(false);
    setSecondsLeft(secs !== undefined ? secs : initialSeconds);
  };

  const addMinutes = (mins: number) => {
    setSecondsLeft((prev) => prev + mins * 60);
  };

  const formatTime = () => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return {
    secondsLeft,
    isActive,
    startTimer,
    pauseTimer,
    resetTimer,
    addMinutes,
    formatTime,
  };
}
