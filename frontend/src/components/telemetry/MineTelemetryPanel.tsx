import React, { useState } from 'react';
import {
  Activity,
  Flame,
  Wind,
  Thermometer,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  RefreshCw,
  Play,
  Pause,
  Sliders,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMineTelemetry } from '../../services/useMineTelemetry';
import { SensorReading, SensorStatus } from '../../services/telemetryService';

interface MineTelemetryPanelProps {
  mineId?: string;
  mineName?: string;
}

export const MineTelemetryPanel: React.FC<MineTelemetryPanelProps> = ({
  mineId = 'default',
  mineName = 'Active Pit Operations',
}) => {
  const {
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
  } = useMineTelemetry({ mineId });

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState<string | null>(null);

  const sensors = snapshot?.sensors || {};
  const ch4 = sensors.ch4;
  const co = sensors.co;
  const o2 = sensors.o2;
  const velocity = sensors.velocity;
  const temp = sensors.temp;
  const slope = sensors.slope;

  // Determine active statutory breaches
  const activeCriticalBreaches = Object.values(sensors).filter(
    (s) => s.status === 'critical'
  );
  const activeWarningBreaches = Object.values(sensors).filter(
    (s) => s.status === 'warning'
  );

  const handleSimulate = async (type: string, factor: number) => {
    setIsSimulating(true);
    setSimulationMessage('Injecting simulated statutory breach...');
    const res = await triggerBreach(type, factor);
    setSimulationMessage(res.message);
    setIsSimulating(false);
    setTimeout(() => setSimulationMessage(null), 6000);
  };

  const handleResetSim = async () => {
    setIsSimulating(true);
    const res = await resetBreach();
    setSimulationMessage(res.message);
    setIsSimulating(false);
    setTimeout(() => setSimulationMessage(null), 4000);
  };

  const formatChartTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderTrendIcon = (trend?: 'rising' | 'falling' | 'stable') => {
    if (trend === 'rising') return <TrendingUp className="w-3.5 h-3.5 text-rose-400" />;
    if (trend === 'falling') return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getStatusBadge = (status: SensorStatus) => {
    switch (status) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            CRITICAL DGMS BREACH
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            WARNING THRESHOLD
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            SAFE
          </span>
        );
    }
  };

  return (
    <div
      className="rounded-3xl border transition-all duration-300 shadow-xl overflow-hidden mb-8"
      style={{
        background: 'linear-gradient(170deg, #101928 0%, #0B111D 100%)',
        borderColor: 'rgba(255, 192, 203, 0.15)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* Top Header Bar */}
      <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-5 rounded-full bg-gradient-to-b from-rose-400 to-amber-400" />
            <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              Continuous Statutory Monitoring • DGMS CMR 2017
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
            Real-Time Mine Telemetry Stream
            {/* Live Status indicator */}
            {connectionState === 'connected' && (
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm shadow-emerald-950">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                LIVE SSE
              </span>
            )}
            {connectionState === 'polling_fallback' && (
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                POLLING FALLBACK
              </span>
            )}
            {connectionState === 'reconnecting' && (
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                RECONNECTING
              </span>
            )}
            {(connectionState === 'disconnected' || connectionState === 'error') && (
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                OFFLINE
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Location: <span className="text-slate-200 font-semibold">{mineName}</span> &bull; Last packet:{' '}
            <span className="text-slate-200 font-mono">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Awaiting stream...'}
            </span>
          </p>
        </div>

        {/* Controls & Zone Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Zone Selector */}
          <div className="relative">
            <select
              value={activeZone}
              onChange={(e) => switchZone(e.target.value)}
              className="appearance-none bg-slate-900/90 text-white font-semibold text-xs px-3.5 py-2 pr-8 rounded-xl border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-rose-500/40 cursor-pointer shadow-inner"
            >
              {(snapshot?.available_zones || [activeZone]).map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Pause / Resume */}
          <button
            onClick={isPaused ? resume : pause}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
            }`}
            title={isPaused ? 'Resume live streaming' : 'Pause live streaming updates'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Reconnect button */}
          <button
            onClick={reconnect}
            className="p-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 active:scale-95 transition-all"
            title="Force reconnect SSE stream"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Simulation Tools */}
          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={() => handleSimulate('ch4_methane', 2.2)}
              disabled={isSimulating}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 active:scale-95 transition-all flex items-center gap-1"
              title="Test statutory Methane spike alarm (>1.25%)"
            >
              <Flame className="w-3 h-3 text-rose-400" />
              Test CH₄ Breach
            </button>
            <button
              onClick={() => handleSimulate('co_carbon_monoxide', 3.0)}
              disabled={isSimulating}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 active:scale-95 transition-all flex items-center gap-1"
              title="Test spontaneous heating Carbon Monoxide alarm (>50 ppm)"
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Test CO Spike
            </button>
            <button
              onClick={handleResetSim}
              disabled={isSimulating}
              className="px-2 py-1.5 rounded-xl text-[11px] font-medium text-slate-400 bg-slate-800/80 border border-white/10 hover:text-white transition-all"
              title="Reset all test simulation breaches"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Feedback Alert */}
      {simulationMessage && (
        <div className="px-6 py-2.5 bg-rose-950/40 border-b border-rose-500/20 text-rose-200 text-xs font-mono flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-spin" />
            {simulationMessage}
          </span>
          <span className="text-[10px] text-slate-400">Simulation Override Active (45s auto-expire)</span>
        </div>
      )}

      {/* Emergency Statutory Breach Alert Banner */}
      {activeCriticalBreaches.length > 0 && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/80 via-rose-900/60 to-red-950/80 border-b border-red-500/40 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-900">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-2">
                  STATUTORY EMERGENCY ALARM: CRITICAL THRESHOLD BREACHED
                  <span className="px-2 py-0.5 rounded-md bg-black/60 text-red-300 font-mono text-[10px]">
                    EVACUATION CODE 1
                  </span>
                </h4>
                <p className="text-xs text-red-200/90 mt-0.5">
                  {activeCriticalBreaches.map((b) => `${b.sensor_name}: ${b.value} ${b.unit} (${b.statutory_rule})`).join(' | ')}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleResetSim()}
              className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md transition-all whitespace-nowrap"
            >
              Acknowledge &amp; Mitigate
            </button>
          </div>
        </div>
      )}

      {/* Warning Alert Banner (if warning but not critical) */}
      {activeCriticalBreaches.length === 0 && activeWarningBreaches.length > 0 && (
        <div className="px-6 py-3 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <span className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Statutory Warning Triggered:{' '}
            {activeWarningBreaches.map((b) => `${b.sensor_name} at ${b.value} ${b.unit}`).join(', ')}
          </span>
          <span className="text-[11px] font-semibold text-amber-400/80">DGMS Regulation Alert</span>
        </div>
      )}

      {/* Resilient Error / Fallback Banner */}
      {errorMessage && (
        <div className="px-6 py-2.5 bg-sky-950/40 border-b border-sky-500/20 text-sky-200 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            {errorMessage}
          </span>
          <button onClick={reconnect} className="underline hover:text-white font-semibold">
            Retry Connection
          </button>
        </div>
      )}

      {/* Sensor Cards Grid */}
      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Methane CH4 */}
        <SensorCard
          name="Methane (CH₄)"
          reading={ch4}
          icon={<Flame className="w-4 h-4 text-amber-400" />}
          unit="% vol"
          warningLimit={0.75}
          criticalLimit={1.25}
          dgmsRef="CMR 2017 Reg 169"
        />

        {/* 2. Carbon Monoxide CO */}
        <SensorCard
          name="Carbon Monoxide"
          reading={co}
          icon={<AlertTriangle className="w-4 h-4 text-orange-400" />}
          unit="ppm"
          warningLimit={25.0}
          criticalLimit={50.0}
          dgmsRef="DGMS Cir 4/2013"
        />

        {/* 3. Oxygen O2 */}
        <SensorCard
          name="Oxygen (O₂)"
          reading={o2}
          icon={<Wind className="w-4 h-4 text-sky-400" />}
          unit="% vol"
          warningLimit={19.5}
          criticalLimit={19.0}
          dgmsRef="CMR 2017 Reg 153"
          lowerIsWorse={true}
        />

        {/* 4. Air Velocity */}
        <SensorCard
          name="Air Velocity"
          reading={velocity}
          icon={<Activity className="w-4 h-4 text-emerald-400" />}
          unit="m/s"
          warningLimit={0.5}
          criticalLimit={0.3}
          dgmsRef="Min Face Flow 0.5m/s"
          lowerIsWorse={true}
        />

        {/* 5. Ambient Temperature */}
        <SensorCard
          name="Pit Temperature"
          reading={temp}
          icon={<Thermometer className="w-4 h-4 text-rose-400" />}
          unit="°C"
          warningLimit={33.5}
          criticalLimit={37.0}
          dgmsRef="Thermal Safety Limit"
        />

        {/* 6. Slope Stability */}
        <SensorCard
          name="Slope Velocity"
          reading={slope}
          icon={<ShieldCheck className="w-4 h-4 text-indigo-400" />}
          unit="mm/d"
          warningLimit={10.0}
          criticalLimit={25.0}
          dgmsRef="Radar Highwall Prism"
        />
      </div>

      {/* Live Trend Sparkline Chart */}
      <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Live Gas Concentration Telemetry Trend ({activeZone})
            </h4>
            <p className="text-[11px] text-slate-400">
              Real-time multi-gas continuous telemetry stream with statutory safety ceiling lines
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-rose-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>CH₄ Methane (% vol)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span>CO Carbon Monoxide (ppm)</span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-44 w-full">
          {history.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ch4Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB7185" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FB7185" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="coGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatChartTime}
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 2.0]}
                  stroke="#FB7185"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 60]}
                  stroke="#F59E0B"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${v}ppm`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900/95 border border-white/10 p-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md">
                          <p className="text-slate-400 font-mono text-[10px] mb-1">
                            {formatChartTime(label)}
                          </p>
                          <p className="text-rose-400 font-bold">
                            CH₄ Methane: {payload[0]?.value} % vol
                          </p>
                          <p className="text-amber-400 font-bold">
                            CO Level: {payload[1]?.value} ppm
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="ch4_methane"
                  stroke="#FB7185"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#ch4Grad)"
                  isAnimationActive={false}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="co_carbon_monoxide"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#coGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
              Buffering real-time time-series telemetry frames...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SensorCardProps {
  name: string;
  reading?: SensorReading;
  icon: React.ReactNode;
  unit: string;
  warningLimit: number;
  criticalLimit: number;
  dgmsRef: string;
  lowerIsWorse?: boolean;
}

const SensorCard: React.FC<SensorCardProps> = ({
  name,
  reading,
  icon,
  unit,
  warningLimit,
  criticalLimit,
  dgmsRef,
  lowerIsWorse = false,
}) => {
  const value = reading?.value ?? 0;
  const status = reading?.status ?? 'normal';
  const trend = reading?.trend ?? 'stable';

  // Compute percentage towards critical limit
  let pct = 0;
  if (!lowerIsWorse) {
    pct = Math.min(Math.round((value / criticalLimit) * 100), 100);
  } else {
    // If lower is worse, 100% is safe, 0% is critical
    pct = Math.min(Math.round((value / 21.0) * 100), 100);
  }

  const isCritical = status === 'critical';
  const isWarning = status === 'warning';

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
        isCritical
          ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-950/40'
          : isWarning
          ? 'bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-950/20'
          : 'bg-slate-900/60 border-white/10 hover:border-white/20'
      }`}
    >
      {/* Top row */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">{icon}</div>
            <span className="text-xs font-semibold text-slate-300 truncate max-w-[110px]" title={name}>
              {name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {trend === 'rising' && <TrendingUp className="w-3.5 h-3.5 text-rose-400" />}
            {trend === 'falling' && <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />}
            {trend === 'stable' && <Minus className="w-3.5 h-3.5 text-slate-500" />}
          </div>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1.5 my-1">
          <span
            className={`text-2xl font-black font-mono tracking-tight ${
              isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white'
            }`}
          >
            {value.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-semibold">{unit}</span>
        </div>
      </div>

      {/* Progress / Status Bottom */}
      <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5">
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(pct, 5)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span
            className={`font-bold uppercase tracking-wider ${
              isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {status}
          </span>
          <span className="text-slate-500 font-mono" title={dgmsRef}>
            {dgmsRef.slice(0, 14)}
          </span>
        </div>
      </div>
    </div>
  );
};
