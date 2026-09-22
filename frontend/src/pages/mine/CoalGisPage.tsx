import React, { useRef, useState } from 'react';
import {
  Compass,
  Maximize2,
  ExternalLink,
  RotateCw,
  Radio,
  Flame,
  ShieldCheck,
  Eye,
  Volume2,
} from 'lucide-react';

export const CoalGisPage: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open('/coal-gis/index.html', '_blank', 'noopener,noreferrer');
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1700px] mx-auto animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-black/40 border border-white/10 p-5 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-baby flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Coal GIS 33 Spatial Intelligence
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              14 Nodes Online
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Jharkhand Coalfields GIS & Early Warning Portal
          </h1>
          <p className="text-white/60 text-xs md:text-sm max-w-3xl leading-relaxed">
            Integrated spatial geofencing covering 14 key Jharkhand coal mining operations with real-time CH4 telemetry, 
            Web Audio emergency siren alerts, speech synthesis dispatch, and on-device Tesseract OCR field scanning.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 pt-2 lg:pt-0">
          <button
            onClick={handleReload}
            title="Reload GIS Map Layers"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all duration-200"
          >
            <RotateCw className="w-3.5 h-3.5" /> Reload
          </button>
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all duration-200"
          >
            <Maximize2 className="w-3.5 h-3.5" /> {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          <button
            onClick={handleOpenExternal}
            title="Launch Full View in New Tab"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-pink-baby text-black hover:bg-pink-hover shadow-pink-sm transition-all duration-200"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Direct GIS Window
          </button>
        </div>
      </div>

      {/* Feature telemetry chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-white/50 uppercase font-semibold">Methane Telemetry</div>
            <div className="text-white font-bold">Jharia & Karanpura CH4</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-white/50 uppercase font-semibold">Acoustic Siren</div>
            <div className="text-white font-bold">Web Audio & TTS Voice</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
          <div className="w-8 h-8 rounded-lg bg-pink-baby/20 text-pink-baby flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-white/50 uppercase font-semibold">Field OCR Engine</div>
            <div className="text-white font-bold">Tesseract.js v5 Client</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-white/50 uppercase font-semibold">Spatial Engine</div>
            <div className="text-white font-bold">Leaflet + OpenStreetMap</div>
          </div>
        </div>
      </div>

      {/* Embedded Coal GIS 33 Map Container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl transition-all duration-300"
        style={{ height: 'calc(100vh - 280px)', minHeight: '650px' }}
      >
        <iframe
          ref={iframeRef}
          key={iframeKey}
          src="/coal-gis/index.html"
          title="Coal GIS 33 Early Warning Portal"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone"
        />
      </div>
    </div>
  );
};
