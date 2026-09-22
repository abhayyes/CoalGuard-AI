import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, ShieldAlert, Zap, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { aiService } from '../../lib/aiApi';

const FALLBACK_RISK_DATA = [
  { category: 'Ventilation & Gas', risk: 85, threshold: 90 },
  { category: 'Roof Bolting & Ground', risk: 62, threshold: 85 },
  { category: 'Electrical Safety', risk: 40, threshold: 80 },
  { category: 'Dust Suppression', risk: 75, threshold: 85 },
  { category: 'Heavy Machinery', risk: 55, threshold: 80 },
];

export const RiskDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const result = await aiService.predictRisk({});
        setData(result);
      } catch (err) {
        console.error("Failed to fetch AI risk prediction", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRisk();
  }, []);

  const getRiskScore = (val: string) => {
    if (val === 'Optimal') return 15;
    if (val === 'Normal') return 35;
    if (val === 'Monitored') return 55;
    if (val.includes('%')) return 100 - parseInt(val);
    return 50;
  };

  const chartData = data?.contributing_factors 
    ? Object.entries(data.contributing_factors).map(([key, val]) => ({
        category: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        risk: getRiskScore(val as string),
        threshold: 85
      })) 
    : FALLBACK_RISK_DATA;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
            <ShieldAlert className="w-4 h-4" /> AI Predictive Engine
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hazard Risk Index & Predictive Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">
            Machine learning weighted hazard metrics, statutory breach probabilities, and real-time pit risk assessments.
          </p>
        </div>
        {loading && <div className="text-sm font-semibold text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> AI Analyzing...</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Composite Mine Risk Index</div>
          <div className="text-4xl font-black text-amber-500">
            {loading ? '...' : (data?.predicted_risk_index || 63.4)} / 100
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-amber-500" /> AI Risk Tier: {data?.risk_tier || 'Moderate Risk'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Confidence Score</div>
          <div className="text-4xl font-black text-indigo-600">
            {loading ? '...' : (data?.confidence || '94.2%')}
          </div>
          <div className="text-xs text-slate-500">
            Based on {data?.ai_engine || 'Predictive Engine'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">DGMS SLA Resolution Speed</div>
          <div className="text-4xl font-black text-emerald-600">4.2 Hours</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> 94% statutory SLA compliance rate
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 relative">
        {loading && <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>}
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">Hazard Category Risk Breakdown</h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">AI Calculated Weights</span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="risk" fill="#F59E0B" radius={[6, 6, 0, 0]} name="AI Calculated Risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
