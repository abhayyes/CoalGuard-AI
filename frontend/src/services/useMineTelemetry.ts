import { useState, useEffect, useCallback, useRef } from 'react';
import {
  telemetryService,
  TelemetrySnapshot,
  TelemetryHistoryPoint,
  ConnectionState,
} from './telemetryService';

interface UseMineTelemetryOptions {
  mineId?: string;
  initialZone?: string;
  autoConnect?: boolean;
}

export function useMineTelemetry({
  mineId = 'default',
  initialZone = 'Working Face 4B (Longwall)',
  autoConnect = true,
}: UseMineTelemetryOptions = {}) {
  const [snapshot, setSnapshot] = useState<TelemetrySnapshot | null>(null);
  const [history, setHistory] = useState<TelemetryHistoryPoint[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeZone, setActiveZoneState] = useState<string>(initialZone);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  // Handle incoming snapshots
  const handleSnapshot = useCallback((data: TelemetrySnapshot) => {
    if (isPausedRef.current) return;
    setSnapshot(data);
    setLastUpdated(new Date());

    // Update rolling history
    if (data.sensors) {
      setHistory((prev) => {
        const newPoint: TelemetryHistoryPoint = {
          timestamp: data.timestamp,
          ch4_methane: data.sensors.ch4?.value ?? 0.35,
          co_carbon_monoxide: data.sensors.co?.value ?? 8.0,
          o2_oxygen: data.sensors.o2?.value ?? 20.8,
          air_velocity: data.sensors.velocity?.value ?? 1.6,
          ambient_temp: data.sensors.temp?.value ?? 29.0,
          slope_displacement: data.sensors.slope?.value ?? 2.2,
        };
        const updated = [...prev, newPoint];
        return updated.length > 25 ? updated.slice(updated.length - 25) : updated;
      });
    }
  }, []);

  // Handle connection state changes
  const handleStateChange = useCallback((state: ConnectionState, msg?: string) => {
    setConnectionState(state);
    if (msg) {
      setErrorMessage(msg);
    } else if (state === 'connected') {
      setErrorMessage(null);
    }
  }, []);

  // Initialize and subscribe
  useEffect(() => {
    const unsubscribe = telemetryService.subscribe(handleSnapshot, handleStateChange);

    if (autoConnect) {
      telemetryService.connect(mineId, activeZone);
      // Fetch initial history for charts
      telemetryService.fetchHistory(mineId, activeZone, 20).then((pts) => {
        if (pts.length > 0) setHistory(pts);
      });
    }

    return () => {
      unsubscribe();
    };
  }, [mineId, activeZone, autoConnect, handleSnapshot, handleStateChange]);

  const switchZone = useCallback(
    (zone: string) => {
      setActiveZoneState(zone);
      telemetryService.switchZone(zone);
      telemetryService.fetchHistory(mineId, zone, 20).then((pts) => {
        if (pts.length > 0) setHistory(pts);
      });
    },
    [mineId]
  );

  const reconnect = useCallback(() => {
    setErrorMessage(null);
    telemetryService.connect(mineId, activeZone);
  }, [mineId, activeZone]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const triggerBreach = useCallback(
    async (sensorType: string = 'ch4_methane', spikeFactor: number = 2.0) => {
      return await telemetryService.simulateBreach(sensorType, spikeFactor);
    },
    []
  );

  const resetBreach = useCallback(async () => {
    return await telemetryService.resetSimulation();
  }, []);

  return {
    snapshot,
    history,
    connectionState,
    errorMessage,
    activeZone,
    isPaused,
    lastUpdated,
    switchZone,
    reconnect,
    pause,
    resume,
    triggerBreach,
    resetBreach,
  };
}
