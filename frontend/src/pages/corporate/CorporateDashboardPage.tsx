import React, { useEffect, useState } from 'react';
import { Building2, ShieldCheck, AlertTriangle, TrendingUp, MapPin, ArrowRight, BarChart3, Layers, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { apiClient } from '../../lib/api';
import { StatCard } from '../../components/ui/StatCard';
import { RiskBadge } from '../../components/ui/RiskBadge';

const PinkTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-3 py-2 text-xs"
        style={{
          background: 'rgba(10,10,10,0.92)',
          border: '1px solid rgba(255,192,203,0.3)',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        <p className="font-bold text-pink-200 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="font-semibold" style={{ color: p.color || '#FFC0CB' }}>
            {p.name}: <span className="font-black">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const CorporateDashboardPage: React.FC = () => {
  const [mines, setMines] = useState<any[]>([]);

  useEffect(() => {
    const fetchCorporateData = async () => {
      try {
        const res = await apiClient.get('/mines');
        setMines(res.data.data || []);
      } catch (err) {
        console.error('Error fetching corporate data:', err);
      }
    };

    fetchCorporateData();
  }, []);

  // Aggregate chart data
  const mineComparisonData = [
    { name: 'Jharia East', compliance: 92, risk: 28, production: 5.2 },
    { name: 'Korba West', compliance: 84, risk: 45, production: 8.1 },
    { name: 'Singrauli North', compliance: 78, risk: 52, production: 6.4 },
    { name: 'Talcher South', compliance: 95, risk: 18, production: 12.0 },
    { name: 'Raniganj Deep', compliance: 88, risk: 36, production: 3.8 },
  ];

  const monthlyTrendData = [
    { month: 'Apr', audits: 18, compliance: 82 },
    { month: 'May', audits: 24, compliance: 85 },
    { month: 'Jun', audits: 20, compliance: 84 },
    { month: 'Jul', audits: 28, compliance: 89 },
    { month: 'Aug', audits: 32, compliance: 91 },
    { month: 'Sep', audits: 35, compliance: 93 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Command</span>
          </div>
          <h1 className="text-2xl font-black text-coal tracking-tight">Corporate Multi-Mine Command Center</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Enterprise-wide statutory compliance oversight across all coal mining subsidiaries
          </p>
        </div>
        <Link
          to="/mine/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-coal transition-all duration-200 hover:shadow-pink-md hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)', boxShadow: '0 4px 16px rgba(255,192,203,0.4)' }}
        >
          <Compass className="w-3.5 h-3.5" />
          Active Mine Portal
        </Link>
      </div>

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Operating Leases"
          value={mines.length || 5}
          icon={Building2}
          subtitle="4 Eastern Coalfield Zones"
        />
        <StatCard
          title="Group Compliance"
          value="89.4%"
          icon={ShieldCheck}
          trend={{ value: '+3.1% YoY', isPositive: true }}
          subtitle="Enterprise statutory benchmark"
        />
        <StatCard
          title="Enterprise Risk Index"
          value="35.8"
          icon={AlertTriangle}
          trend={{ value: 'Low Risk', isPositive: true }}
          subtitle="AI Weighted Safety Score"
        />
        <StatCard
          title="Annual Coal Output"
          value="35.5 MT"
          icon={TrendingUp}
          trend={{ value: '+8.4%', isPositive: true }}
          subtitle="YTD Statutory Permitted"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mine Comparison Bar Chart */}
        <div
          className="rounded-3xl p-6 transition-all duration-200 animate-fade-in-up"
          style={{
            animationDelay: '100ms',
            background: 'rgba(253,248,251,0.9)',
            border: '1px solid rgba(255,192,203,0.2)',
            boxShadow: '0 8px 32px rgba(255,192,203,0.08)'
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-black text-coal flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-pink-400" />
                Mine-Wise Statutory Compliance Score (%)
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Comparative evaluation vs national DGMS threshold</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mineComparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,192,203,0.15)" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip content={<PinkTooltip />} />
                <Bar dataKey="compliance" fill="#FFC0CB" radius={[6, 6, 0, 0]} name="Compliance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Month Trend */}
        <div
          className="rounded-3xl p-6 transition-all duration-200 animate-fade-in-up"
          style={{
            animationDelay: '150ms',
            background: 'rgba(253,248,251,0.9)',
            border: '1px solid rgba(255,192,203,0.2)',
            boxShadow: '0 8px 32px rgba(255,192,203,0.08)'
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-black text-coal flex items-center gap-2">
                <Layers className="w-4 h-4 text-pink-400" />
                6-Month Audit Velocity &amp; Compliance Trend
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Monthly inspection count paired with compliance trajectory</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,192,203,0.15)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} domain={[50, 100]} tickLine={false} axisLine={false} />
                <Tooltip content={<PinkTooltip />} />
                <Line type="monotone" dataKey="compliance" stroke="#059669" strokeWidth={3} dot={{ fill: '#059669', strokeWidth: 2, r: 4 }} name="Compliance Rate (%)" />
                <Line type="monotone" dataKey="audits" stroke="#FFC0CB" strokeWidth={2.5} dot={{ fill: '#FFC0CB', strokeWidth: 2, r: 4 }} name="Audits Conducted" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subsidiary Performance Table */}
      <div
        className="rounded-3xl overflow-hidden animate-fade-in-up"
        style={{
          animationDelay: '200ms',
          background: 'rgba(253,248,251,0.9)',
          border: '1px solid rgba(255,192,203,0.2)',
          boxShadow: '0 8px 32px rgba(255,192,203,0.08)'
        }}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,192,203,0.15)' }}>
          <div>
            <h2 className="text-base font-black text-coal">Subsidiary Coal Block Rankings</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">High-level risk matrix and production targets</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr style={{ background: 'rgba(255,192,203,0.05)', borderBottom: '1px solid rgba(255,192,203,0.15)' }}>
                {['Mine Location', 'Capacity (MTPA)', 'Compliance Score', 'Safety Risk Level', 'Action'].map((h, i) => (
                  <th key={h} className={`px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'rgba(255,192,203,0.1)' }}>
              {mineComparisonData.map((m, idx) => (
                <tr
                  key={idx}
                  className="transition-colors duration-150"
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-6 py-4 font-bold text-coal flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,192,203,0.15)' }}>
                      <MapPin className="w-3.5 h-3.5" style={{ color: '#C08090' }} />
                    </div>
                    {m.name}
                  </td>
                  <td className="px-6 py-4 font-black text-coal">{m.production} MT</td>
                  <td className="px-6 py-4">
                    <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      {m.compliance}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <RiskBadge level={m.risk > 40 ? 'high' : m.risk > 25 ? 'medium' : 'low'} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to="/mine/dashboard"
                      className="inline-flex items-center gap-1.5 text-xs font-black transition-colors duration-150"
                      style={{ color: '#C08090' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#0a0a0a')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#C08090')}
                    >
                      Enter Mine Portal <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
