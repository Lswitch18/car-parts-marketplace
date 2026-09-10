import { useCallback, useEffect, useRef } from 'react';
import { driver, Driver, DriveStep, Config } from 'driver.js';
import '@/modules/shared/styles/driver-cyber-theme.css';

export interface UseDriverTourOptions {
  steps: DriveStep[];
  language?: 'pt' | 'ja';
  soundEnabled?: boolean;
  onComplete?: () => void;
  onDestroy?: () => void;
  configOverrides?: Partial<Config>;
}

export function useDriverTour({
  steps,
  language = 'pt',
  soundEnabled = true,
  onComplete,
  onDestroy,
  configOverrides = {}
}: UseDriverTourOptions) {
  const driverInstanceRef = useRef<Driver | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Subtle Web Audio Chime
  const playChime = useCallback((freq = 600, duration = 0.12) => {
    if (!soundEnabled) return;
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
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy catch
    }
  }, [soundEnabled]);

  const startTour = useCallback((startIndex = 0) => {
    playChime(520);
    const isJa = language === 'ja';

    const defaultTexts = {
      nextBtnText: isJa ? '次へ ▶' : 'Próximo ▶',
      prevBtnText: isJa ? '◀ 戻る' : '◀ Anterior',
      doneBtnText: isJa ? '完了 🏁' : 'Concluir Tour 🏁',
      progressText: isJa ? 'ステップ {{current}} / {{total}}' : 'Passo {{current}} de {{total}}'
    };

    const instance = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(5, 8, 14, 0.85)',
      stagePadding: 8,
      stageRadius: 14,
      popoverClass: 'daig-cyber-popover',
      ...defaultTexts,
      steps,
      onHighlightStarted: () => {
        playChime(640, 0.09);
      },
      onDestroyed: () => {
        playChime(840, 0.18);
        onDestroy?.();
      },
      onDoneClick: () => {
        playChime(960, 0.25);
        onComplete?.();
        instance.destroy();
      },
      ...configOverrides
    });

    driverInstanceRef.current = instance;
    instance.drive(startIndex);
  }, [steps, language, playChime, onComplete, onDestroy, configOverrides]);

  const stopTour = useCallback(() => {
    driverInstanceRef.current?.destroy();
  }, []);

  const moveToStep = useCallback((stepIndex: number) => {
    driverInstanceRef.current?.moveTo(stepIndex);
  }, []);

  useEffect(() => {
    return () => {
      driverInstanceRef.current?.destroy();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    startTour,
    stopTour,
    moveToStep,
    driver: driverInstanceRef.current
  };
}
