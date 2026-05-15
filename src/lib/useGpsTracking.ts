import { useEffect, useRef, useCallback } from 'react';

interface GpsOptions {
  interval?: number;
  enableHighAccuracy?: boolean;
  motoristaId?: string;
  onError?: (err: string) => void;
}

export function useGpsTracking(options: GpsOptions = {}) {
  const {
    interval = 30000,
    enableHighAccuracy = true,
    motoristaId,
    onError,
  } = options;

  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendPosition = useCallback(async (lat: number, lng: number, precisao?: number, velocidade?: number) => {
    if (!motoristaId) return;
    try {
      const { logisticsApi } = await import('./logisticsApi');
      await logisticsApi.tracking.gps(motoristaId, lat, lng, precisao, velocidade);
    } catch (e: any) {
      console.warn('[GPS] Erro ao enviar posição:', e.message);
    }
  }, [motoristaId]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      onError?.('GPS não disponível neste dispositivo');
      return;
    }

    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        sendPosition(latitude, longitude, accuracy, speed ?? undefined);
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: 'Permissão GPS negada',
          2: 'Sinal GPS indisponível',
          3: 'Timeout ao obter GPS',
        };
        onError?.(msgs[err.code] || `Erro GPS: ${err.code}`);
      },
      { enableHighAccuracy, timeout: 10000, maximumAge: 5000 },
    );

    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy, speed } = pos.coords;
          sendPosition(latitude, longitude, accuracy, speed ?? undefined);
        },
        () => {},
        { enableHighAccuracy, timeout: 10000, maximumAge: 5000 },
      );
    }, interval);
  }, [sendPosition, enableHighAccuracy, interval, onError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  return { startTracking, stopTracking };
}
