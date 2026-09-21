import React, { useState } from 'react';
import { MapPin, ShieldAlert, CheckCircle2, Layers, Filter, Compass } from 'lucide-react';

interface MinePoint {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  status: 'COMPLIANT' | 'WARNING' | 'CRITICAL';
  score: number;
  activeWorkforce: number;
}

const MINE_POINTS: MinePoint[] = [
  {
    id: 'MINE-01',
    name: 'Jharia OpenCast Mine 4',
    location: 'Dhanbad, Jharkhand',
    lat: 23.751,
    lng: 86.417,
    status: 'COMPLIANT',
    score: 94,
    activeWorkforce: 420,
  },
  {
    id: 'MINE-02',
    name: 'Korba Underground Shaft 2',
    location: 'Korba, Chhattisgarh',
    lat: 22.359,
    lng: 82.75,
    status: 'WARNING',
    score: 78,
    activeWorkforce: 280,
  },
  {
    id: 'MINE-03',
    name: 'Singrauli Mega Block A',
    location: 'Singrauli, MP',
    lat: 24.2,
    lng: 82.66,
    status: 'CRITICAL',
    score: 62,
    activeWorkforce: 610,
  },
  {
    id: 'MINE-04',
    name: 'Talcher Pit 7',
    location: 'Angul, Odisha',
    lat: 20.95,
    lng: 85.22,
    status: 'COMPLIANT',
    score: 91,
    activeWorkforce: 350,
  },
];

export const MapPage: React.FC = () => {
  const [selectedMine, setSelectedMine] = useState<MinePoint>(MINE_POINTS[0]);
  const [filter, setFilter] = useState<string>('ALL');

  const filteredMines = MINE_POINTS.filter((m) => filter === 'ALL' || m.status === filter);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Compass className="w-4 h-4" /> Spatial Intelligence
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">GIS & Mine Lease Spatial Boundary Map</h1>
          <p className="text-slate-500 text-sm mt-1">
            Interactive PostGIS boundary geofencing, hazard pit mapping, and statutory environmental monitoring overlay.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Lease Boundaries</option>
            <option value="COMPLIANT">High Compliance (&gt;90%)</option>
            <option value="WARNING">Moderate Risk (70-89%)</option>
            <option value="CRITICAL">High Risk (&lt;70%)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Canvas Mock/Container */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 relative overflow-hidden text-white min-h-[460px] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold">
              <Layers className="w-4 h-4 text-blue-400" /> Layer: PostGIS Mine Lease Boundaries & DGMS Pit Zones
            </div>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded border border-slate-700">
              GPS: {selectedMine.lat}°N, {selectedMine.lng}°E
            </div>
          </div>

          {/* Graphical Representation of Map Overlay */}
          <div className="my-8 relative flex items-center justify-center py-16">
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
            
            <div className="relative z-10 grid grid-cols-2 gap-8 w-full max-w-lg">
              {filteredMines.map((mine) => (
                <button
                  key={mine.id}
                  onClick={() => setSelectedMine(mine)}
                  className={`p-4 rounded-xl border text-left transition transform hover:-translate-y-1 ${
                    selectedMine.id === mine.id
                      ? 'bg-blue-600/30 border-blue-500 ring-2 ring-blue-500/50'
                      : 'bg-slate-800/70 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        mine.status === 'COMPLIANT'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : mine.status === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {mine.score}% Score
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white truncate">{mine.name}</div>
                  <div className="text-xs text-slate-400 truncate">{mine.location}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-4 z-10">
            <div>Live Coordinate Sync: Enabled</div>
            <div>Spatial CRS: EPSG:4326 (WGS84)</div>
          </div>
        </div>

        {/* Selected Mine Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selected Mine Lease</div>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">{selectedMine.name}</h2>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedMine.location}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Compliance Health Score</span>
              <span className="font-black text-slate-900">{selectedMine.score}/100</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  selectedMine.score >= 90 ? 'bg-emerald-500' : selectedMine.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${selectedMine.score}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Statutory Status</span>
              <span className="font-bold text-slate-800">{selectedMine.status}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Active Workers On-site</span>
              <span className="font-bold text-slate-800">{selectedMine.activeWorkforce} Personnel</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Latitude / Longitude</span>
              <span className="font-mono text-slate-800">
                {selectedMine.lat}, {selectedMine.lng}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">DGMS Clearance Validity</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid thru 2028
              </span>
            </div>
          </div>

          <button
            onClick={() => alert(`Navigating to full audit log for ${selectedMine.name}...`)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            View Mine Audit Register
          </button>
        </div>
      </div>
    </div>
  );
};
