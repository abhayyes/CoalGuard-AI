import React, { useEffect, useState } from 'react';
import { ShieldCheck, Users, HardHat, FileText, Plus, X, Globe, Cpu, ChevronRight, Activity } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';

const inputCls = "w-full text-xs px-3.5 py-2.5 rounded-xl text-coal placeholder:text-slate-300 transition-all duration-150 focus:outline-none";
const inputStyle = { background: 'rgba(253,248,251,0.7)', border: '1px solid rgba(255,192,203,0.25)', color: '#0a0a0a' };

export const AdminDashboardPage: React.FC = () => {
  const [mines, setMines] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [isMineModalOpen, setIsMineModalOpen] = useState(false);

  // New Mine Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mineType, setMineType] = useState('opencast');
  const [state, setState] = useState('Jharkhand');
  const [capacity, setCapacity] = useState('5.5');
  const [latitude, setLatitude] = useState('23.7450');
  const [longitude, setLongitude] = useState('86.4140');

  const fetchData = async () => {
    try {
      const [minesRes, usersRes] = await Promise.all([
        apiClient.get('/mines'),
        apiClient.get('/users'),
      ]);
      setMines(minesRes.data.data || []);
      setUsersCount(usersRes.data.meta?.total || (usersRes.data.data?.length || 0));
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/mines', {
        name,
        code,
        mine_type: mineType,
        state,
        annual_capacity_mt: parseFloat(capacity),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
      setIsMineModalOpen(false);
      setName('');
      setCode('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create mine profile');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Governance</span>
          </div>
          <h1 className="text-2xl font-black text-coal tracking-tight">System Administration &amp; Multi-Tenant Control</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Global mining lease registries, granular RBAC permissions, and immutable audit logs
          </p>
        </div>
        <button
          onClick={() => setIsMineModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-coal transition-all duration-200 hover:shadow-pink-md hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)', boxShadow: '0 4px 16px rgba(255,192,203,0.4)' }}
        >
          <Plus className="w-3.5 h-3.5" />
          Register New Mine Lease
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Mines"
          value={mines.length}
          icon={HardHat}
          subtitle="Operational coal leases"
        />
        <StatCard
          title="System Users"
          value={usersCount}
          icon={Users}
          subtitle="Active RBAC accounts"
        />
        <StatCard
          title="Security Perimeter"
          value="100%"
          icon={ShieldCheck}
          subtitle="PostGIS &amp; Supabase Auth"
        />
        <StatCard
          title="Audit Ledger"
          value="Live"
          icon={FileText}
          subtitle="Zero unverified entries"
        />
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(10,10,10,0.95), rgba(26,26,26,0.95))',
            border: '1px solid rgba(255,192,203,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}
        >
          <div className="flex items-center justify-between text-white mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-pink-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Engine Telemetry
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">99.98% UP</span>
          </div>
          <h3 className="text-xl font-black text-white">PostgreSQL + PostGIS</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Real-time geospatial indexing and compliance trigger listeners active.</p>
        </div>

        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'rgba(253,248,251,0.9)',
            border: '1px solid rgba(255,192,203,0.2)',
            boxShadow: '0 4px 20px rgba(255,192,203,0.08)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-pink-400" /> Geospatial Coverage
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">Multi-State</span>
          </div>
          <h3 className="text-xl font-black text-coal">Eastern Coal Belt</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Jharkhand, Odisha, and West Bengal coal sectors monitored.</p>
        </div>

        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'rgba(253,248,251,0.9)',
            border: '1px solid rgba(255,192,203,0.2)',
            boxShadow: '0 4px 20px rgba(255,192,203,0.08)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> Compliance Stream
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Synchronized</span>
          </div>
          <h3 className="text-xl font-black text-coal">Automated AI OCR</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Auto-parsing DGMS forms, EIA reports, and statutory licenses.</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        className="rounded-3xl overflow-hidden animate-fade-in-up"
        style={{
          animationDelay: '150ms',
          background: 'rgba(253,248,251,0.9)',
          border: '1px solid rgba(255,192,203,0.2)',
          boxShadow: '0 8px 32px rgba(255,192,203,0.08)'
        }}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,192,203,0.15)' }}>
          <div>
            <h2 className="text-base font-black text-coal">Registered Mining Operations &amp; Leases</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Central register of DGMS authorized coal production sites</p>
          </div>
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-xl"
            style={{ background: 'rgba(255,192,203,0.15)', color: '#C08090' }}
          >
            {mines.length} operational sites
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr style={{ background: 'rgba(255,192,203,0.05)', borderBottom: '1px solid rgba(255,192,203,0.15)' }}>
                {['Mine Name', 'Code', 'Type', 'State / Province', 'Annual Capacity', 'GPS Coordinates', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'rgba(255,192,203,0.1)' }}>
              {mines.length > 0 ? (
                mines.map((m, i) => (
                  <tr
                    key={m.id}
                    className="transition-colors duration-150"
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs"
                          style={{ background: 'rgba(255,192,203,0.15)', color: '#C08090' }}>
                          <HardHat className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-black text-coal">{m.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {m.id?.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-600">
                      <span className="px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,192,203,0.1)' }}>
                        {m.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 uppercase font-bold text-[10px] tracking-wider text-slate-500">{m.mine_type}</td>
                    <td className="px-6 py-4 font-semibold text-coal">{m.state}</td>
                    <td className="px-6 py-4 font-bold text-coal">{m.annual_capacity_mt || 0} MTPA</td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                      {m.latitude && m.longitude ? `${Number(m.latitude).toFixed(3)}, ${Number(m.longitude).toFixed(3)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {m.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(255,192,203,0.1)' }}>
                        <HardHat className="w-6 h-6" style={{ color: '#FFC0CB' }} />
                      </div>
                      <p className="text-sm font-bold text-coal">No mines registered in system yet.</p>
                      <p className="text-xs text-slate-400">Click "Register New Mine Lease" to add the first mining block.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Mine Modal */}
      {isMineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="relative w-full max-w-lg rounded-3xl overflow-hidden animate-scale-in"
            style={{ background: 'rgba(253,248,251,0.98)', border: '1px solid rgba(255,192,203,0.3)', boxShadow: '0 40px 80px rgba(0,0,0,0.3)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,192,203,0.8), transparent)' }} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-black text-coal">Register New Coal Mine Site</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Statutory lease profile &amp; PostGIS geospatial coordinates</p>
                </div>
                <button onClick={() => setIsMineModalOpen(false)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#94A3B8' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateMine} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mine Name</label>
                  <input
                    type="text" required value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jharia OpenCast Coal Block 04"
                    className={inputCls} style={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mine Code</label>
                    <input
                      type="text" required value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="MINE-JH-01"
                      className={inputCls} style={inputStyle}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mine Type</label>
                    <select
                      value={mineType}
                      onChange={(e) => setMineType(e.target.value)}
                      className={inputCls} style={inputStyle}
                    >
                      <option value="opencast">Opencast</option>
                      <option value="underground">Underground</option>
                      <option value="mixed">Mixed Pit</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">State / Province</label>
                    <input
                      type="text" required value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Jharkhand"
                      className={inputCls} style={inputStyle}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Annual Capacity (MTPA)</label>
                    <input
                      type="number" step="0.1" required value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className={inputCls} style={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latitude</label>
                    <input
                      type="text" value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className={inputCls} style={inputStyle}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Longitude</label>
                    <input
                      type="text" value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className={inputCls} style={inputStyle}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,192,203,0.2)' }}>
                  <button type="button" onClick={() => setIsMineModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 transition-all duration-150"
                    style={{ border: '1px solid rgba(255,192,203,0.25)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >Cancel</button>
                  <button type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black text-coal transition-all duration-150 active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)', boxShadow: '0 4px 14px rgba(255,192,203,0.4)' }}
                  >Create Mine Entry</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
