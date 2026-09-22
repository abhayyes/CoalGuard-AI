/**
 * CoalGuard AI - Resilient Real-Time Mine Telemetry Service
 *
 * Implements fault-tolerant Server-Sent Events (SSE) streaming with:
 * - Exponential backoff auto-reconnection
 * - Graceful fallback to REST polling when SSE fails or is blocked
 * - Heartbeat watchdog to detect stalled connections
 * - Strict TypeScript typing and comprehensive error handling
 */

export type SensorStatus = 'normal' | 'warning' | 'critical' | 'offline';

export interface SensorReading {
  sensor_id: string;
  sensor_name: string;
  sensor_type: string;
  value: number;
  unit: string;
  status: SensorStatus;
  zone: string;
  timestamp: string;
  threshold_warning: number;
  threshold_critical: number;
  statutory_rule: string;
  trend: 'rising' | 'falling' | 'stable';
}

export interface TelemetrySnapshot {
  mine_id: string;
  timestamp: string;
  active_zone: string;
  hazard_index: number;
  hazard_status: SensorStatus;
  sensors: Record<string, SensorReading>;
  available_zones: string[];
  active_alarms_count: number;
}

export interface TelemetryHistoryPoint {
  timestamp: string;
  ch4_methane: number;
  co_carbon_monoxide: number;
  o2_oxygen: number;
  air_velocity: number;
  ambient_temp: number;
  slope_displacement: number;
}

export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'polling_fallback'
  | 'disconnected'
  | 'error';

export interface TelemetryServiceOptions {
  mineId?: string;
  zone?: string;
  maxReconnectAttempts?: number;
  pollingFallbackIntervalMs?: number;
  onSnapshot?: (snapshot: TelemetrySnapshot) => void;
  onStateChange?: (state: ConnectionState, errorMsg?: string) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class TelemetryService {
  private eventSource: EventSource | null = null;
  private pollingTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private reconnectTimer: number | null = null;

  private currentMineId: string = 'default';
  private currentZone: string = 'Working Face 4B (Longwall)';
  private connectionState: ConnectionState = 'idle';
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 3;
  private readonly pollingIntervalMs: number = 3000;

  private snapshotListeners: Set<(snapshot: TelemetrySnapshot) => void> = new Set();
  private stateListeners: Set<(state: ConnectionState, errorMsg?: string) => void> = new Set();
  private lastPacketTimestamp: number = 0;

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  public subscribe(
    onSnapshot: (snapshot: TelemetrySnapshot) => void,
    onStateChange?: (state: ConnectionState, errorMsg?: string) => void
  ): () => void {
    this.snapshotListeners.add(onSnapshot);
    if (onStateChange) this.stateListeners.add(onStateChange);

    return () => {
      this.snapshotListeners.delete(onSnapshot);
      if (onStateChange) this.stateListeners.delete(onStateChange);
    };
  }

  public getState(): ConnectionState {
    return this.connectionState;
  }

  public getActiveZone(): string {
    return this.currentZone;
  }

  private setState(newState: ConnectionState, errorMsg?: string) {
    this.connectionState = newState;
    this.stateListeners.forEach((fn) => fn(newState, errorMsg));
  }

  private emitSnapshot(snapshot: TelemetrySnapshot) {
    this.lastPacketTimestamp = Date.now();
    this.snapshotListeners.forEach((fn) => fn(snapshot));
  }

  /**
   * Start streaming telemetry with automatic fallback.
   */
  public connect(mineId: string = 'default', zone?: string) {
    this.currentMineId = mineId;
    if (zone) this.currentZone = zone;

    this.disconnect();
    this.startSSE();
  }

  private startSSE() {
    this.setState(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    try {
      const url = `${API_BASE}/telemetry/stream?mine_id=${encodeURIComponent(
        this.currentMineId
      )}&zone=${encodeURIComponent(this.currentZone)}`;

      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0;
        this.setState('connected');
        this.startHeartbeatWatchdog();
      };

      this.eventSource.addEventListener('telemetry_update', (e: MessageEvent) => {
        try {
          const data: TelemetrySnapshot = JSON.parse(e.data);
          this.emitSnapshot(data);
        } catch (err) {
          console.error('[TelemetryService] Failed to parse SSE payload:', err);
        }
      });

      this.eventSource.onerror = (e) => {
        console.warn('[TelemetryService] SSE connection error:', e);
        this.closeSSE();
        this.handleSSEFailure();
      };
    } catch (err) {
      console.error('[TelemetryService] Failed to initialize EventSource:', err);
      this.handleSSEFailure();
    }
  }

  private handleSSEFailure() {
    this.reconnectAttempts++;

    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      // Exponential backoff: 1.5s, 3s, 6s...
      const delayMs = Math.min(1500 * Math.pow(2, this.reconnectAttempts - 1), 10000);
      this.setState('reconnecting', `Connection lost. Retrying in ${(delayMs / 1000).toFixed(1)}s (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      this.reconnectTimer = window.setTimeout(() => {
        this.startSSE();
      }, delayMs);
    } else {
      // Fallback to REST polling mode to guarantee zero disruption to mine safety monitoring
      console.warn('[TelemetryService] Max SSE reconnect attempts reached. Activating resilient REST polling fallback.');
      this.activatePollingFallback();
    }
  }

  private activatePollingFallback() {
    this.setState('polling_fallback', 'Active via Resilient Polling Fallback (SSE unreachable)');
    this.pollLatest();

    if (this.pollingTimer) window.clearInterval(this.pollingTimer);
    this.pollingTimer = window.setInterval(() => {
      this.pollLatest();
    }, this.pollingIntervalMs);

    // Periodically probe SSE recovery every 30 seconds
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = window.setTimeout(() => {
      console.info('[TelemetryService] Probing SSE stream recovery...');
      this.reconnectAttempts = 0;
      this.startSSE();
    }, 30000);
  }

  public async pollLatest(): Promise<TelemetrySnapshot | null> {
    try {
      const url = `${API_BASE}/telemetry/latest?mine_id=${encodeURIComponent(
        this.currentMineId
      )}&zone=${encodeURIComponent(this.currentZone)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: TelemetrySnapshot = await response.json();
      this.emitSnapshot(data);
      return data;
    } catch (error) {
      console.error('[TelemetryService] REST polling fetch error:', error);
      if (this.connectionState === 'polling_fallback') {
        this.setState('error', 'Unable to fetch telemetry from server.');
      }
      return null;
    }
  }

  public async fetchHistory(
    mineId?: string,
    zone?: string,
    limit: number = 20
  ): Promise<TelemetryHistoryPoint[]> {
    try {
      const mId = mineId || this.currentMineId;
      const z = zone || this.currentZone;
      const url = `${API_BASE}/telemetry/history?mine_id=${encodeURIComponent(
        mId
      )}&zone=${encodeURIComponent(z)}&limit=${limit}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.points || [];
    } catch (err) {
      console.error('[TelemetryService] Failed to load history:', err);
      return [];
    }
  }

  public async simulateBreach(
    sensorType: string = 'ch4_methane',
    spikeFactor: number = 2.0
  ): Promise<{ status: string; message: string }> {
    try {
      const url = `${API_BASE}/telemetry/simulate-breach`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sensor_type: sensorType,
          zone: this.currentZone,
          spike_factor: spikeFactor,
        }),
      });
      return await res.json();
    } catch (err: any) {
      return { status: 'error', message: err.message || 'Simulation call failed' };
    }
  }

  public async resetSimulation(): Promise<{ status: string; message: string }> {
    try {
      const url = `${API_BASE}/telemetry/reset-simulation`;
      const res = await fetch(url, { method: 'POST' });
      return await res.json();
    } catch (err: any) {
      return { status: 'error', message: err.message || 'Reset failed' };
    }
  }

  public switchZone(newZone: string) {
    if (newZone === this.currentZone) return;
    this.currentZone = newZone;
    this.connect(this.currentMineId, newZone);
  }

  private startHeartbeatWatchdog() {
    this.clearHeartbeatWatchdog();
    this.heartbeatTimer = window.setInterval(() => {
      if (this.connectionState === 'connected' && Date.now() - this.lastPacketTimestamp > 12000) {
        console.warn('[TelemetryService] Watchdog: No packet received for 12s. Reconnecting...');
        this.closeSSE();
        this.handleSSEFailure();
      }
    }, 5000);
  }

  private clearHeartbeatWatchdog() {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private closeSSE() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.clearHeartbeatWatchdog();
  }

  public disconnect() {
    this.closeSSE();
    if (this.pollingTimer) {
      window.clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.setState('disconnected');
  }

  private handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      if (this.connectionState === 'disconnected' || this.connectionState === 'error') {
        this.connect(this.currentMineId, this.currentZone);
      }
    }
  }

  public destroy() {
    this.disconnect();
    if (typeof window !== 'undefined') {
      window.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    this.snapshotListeners.clear();
    this.stateListeners.clear();
  }
}

export const telemetryService = new TelemetryService();
