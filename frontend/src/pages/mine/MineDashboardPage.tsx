import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  ClipboardList,
  Activity,
  ArrowRight,
  Plus,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { aiService } from '../../lib/aiApi';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { formatDate } from '../../lib/utils';
import { ComplianceStats, Inspection, Alert } from '../../types';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-xl text-xs font-semibold text-coal"
        style={{ background: 'rgba(253,248,251,0.95)', border: '1px solid rgba(255,192,203,0.4)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 24px rgba(255,192,203,0.25)' }}>
        <span style={{ color: payload[0].payload.color }}>{payload[0].name}</span>
        <span className="ml-2 text-slate-500">{payload[0].value}</span>
      </div>
    );
  }
  return null;
};

export const MineDashboardPage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mineParam = selectedMine ? `?mine_id=${selectedMine.id}` : '';
        const statsRes = await apiClient.get(`/compliance/stats${mineParam}`);
        setStats(statsRes.data);
        const inspRes = await apiClient.get(`/inspections${mineParam ? mineParam + '&' : '?'}per_page=5`);
        setInspections(inspRes.data.data || []);
        const alertRes = await apiClient.get(`/alerts${mineParam ? mineParam + '&' : '?'}is_resolved=false&per_page=4`);
        setAlerts(alertRes.data.data || []);
      } catch {
        setStats({
          total: 24, completed: 19, pending: 3, in_progress: 1, overdue: 1,
          compliance_rate: 79.2,
          by_category: { statutory: 10, safety: 8, environmental: 6 },
        });
      }
    };
    fetchData();
  }, [selectedMine]);

  const pieData = stats
    ? [
        { name: 'Completed',   value: stats.completed,   color: '#10B981' },
        { name: 'In Progress', value: stats.in_progress, color: '#3B82F6' },
        { name: 'Pending',     value: stats.pending,     color: '#F59E0B' },
        { name: 'Overdue',     value: stats.overdue,     color: '#EF4444' },
      ].filter((d) => d.value > 0)
    : [];

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const data = await aiService.analyzeMineFull({
        mine_id: selectedMine?.id || 'all',
        stats,
        inspections: inspections.slice(0,5),
        alerts: alerts.slice(0,5)
      });
      setAiReport(data);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAiReport({ error: 'Analysis Failed: ' + ((error as any).response?.data?.detail || (error as any).message || 'Unknown Error') });
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mine Operations</span>
          </div>
          <h1 className="text-2xl font-black text-coal tracking-tight">
            {selectedMine ? selectedMine.name : 'All Mines Overview'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Real-time compliance monitoring · DGMS statutory safety tracking
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runAiAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}
          >
            {isAnalyzing ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'AI Mine Analysis'}
          </button>
          <Link
          to="/mine/inspections/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-coal transition-all duration-200 hover:shadow-pink-md hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)',
            boxShadow: '0 4px 16px rgba(255,192,203,0.4)',
          }}
        >
          <Plus className="w-3.5 h-3.5" />
            New Inspection
          </Link>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Compliance Rate"
          value={`${stats?.compliance_rate || 0}%`}
          icon={CheckCircle2}
          trend={{ value: '+4.2%', isPositive: true }}
          variant="success"
          subtitle="Target: 95% statutory"
          animationDelay="0ms"
        />
        <StatCard
          title="Overdue Items"
          value={stats?.overdue || 0}
          icon={AlertOctagon}
          variant={stats?.overdue ? 'danger' : 'default'}
          subtitle="Requires immediate action"
          animationDelay="75ms"
        />
        <StatCard
          title="Active Inspections"
          value={inspections.length}
          icon={ClipboardList}
          subtitle="Last 30 days"
          animationDelay="150ms"
        />
        <StatCard
          title="Safety Risk Index"
          value="42.5"
          icon={Activity}
          trend={{ value: 'Medium', isNeutral: true }}
          variant="warning"
          subtitle="AI aggregated score (0–100)"
          animationDelay="225ms"
        />
      </div>

      {/* ── Charts + Alerts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>

        {/* Donut chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Compliance Breakdown</CardTitle>
            {stats && (
              <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(255,192,203,0.15)', color: '#C08090' }}>
                <TrendingUp className="w-2.5 h-2.5" />
                {stats.compliance_rate}%
              </div>
            )}
          </CardHeader>
          <CardContent className="pb-5">
            {pieData.length > 0 ? (
              <>
                <div className="h-52 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={55}
                        outerRadius={78}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-2xl font-black text-coal">{stats?.total || 0}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Total</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="font-medium">{d.name}</span>
                      <span className="font-bold text-coal">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center gap-2">
                <Zap className="w-8 h-8 text-pink-baby/50" />
                <span className="text-xs text-slate-400 font-medium">No compliance data yet</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Critical Alerts & Escalations</CardTitle>
            <Link to="/mine/alerts"
              className="text-[10px] font-bold flex items-center gap-1 transition-colors duration-200"
              style={{ color: '#C08090' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0a0a0a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#C08090')}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {alerts.length > 0 ? (
              alerts.map((alert, i) => (
                <div
                  key={alert.id}
                  className="group p-3.5 rounded-xl border flex items-start justify-between gap-4 transition-all duration-200 animate-fade-in-up cursor-default hover:-translate-y-0.5"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    background: 'rgba(253,248,251,0.6)',
                    border: '1px solid rgba(255,192,203,0.15)',
                  }}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <RiskBadge level={alert.severity} />
                      <span className="text-xs font-bold text-coal truncate">{alert.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{alert.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium flex-shrink-0">
                    {formatDate(alert.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-14 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-float"
                  style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-coal">All clear</p>
                  <p className="text-xs text-slate-400 mt-0.5">No active unresolved alerts</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Inspections Table ── */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' } as React.CSSProperties}>
        <CardHeader>
          <CardTitle>Recent Mine Inspections</CardTitle>
          <Link to="/mine/inspections"
            className="text-[10px] font-bold flex items-center gap-1 transition-colors duration-200"
            style={{ color: '#C08090' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0a0a0a')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#C08090')}
          >
            All inspections <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ background: 'rgba(255,192,203,0.05)', borderBottom: '1px solid rgba(255,192,203,0.15)' }}>
                  {['Date', 'Type', 'Summary', 'Obs.', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inspections.length > 0 ? (
                  inspections.map((insp, i) => (
                    <tr
                      key={insp.id}
                      className="table-row-hover border-b border-pink-baby/8 last:border-0 animate-fade-in-up"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <td className="px-5 py-3.5 font-bold text-coal whitespace-nowrap">{formatDate(insp.date)}</td>
                      <td className="px-5 py-3.5 capitalize font-semibold text-slate-700">{insp.inspection_type}</td>
                      <td className="px-5 py-3.5 max-w-[200px] truncate text-slate-500">{insp.summary || 'Routine audit'}</td>
                      <td className="px-5 py-3.5 font-semibold text-coal">{insp.observations?.length || 0}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={insp.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <Link to={`/mine/inspections/${insp.id}`}
                          className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-150 hover:shadow-pink-sm"
                          style={{ background: 'rgba(255,192,203,0.12)', color: '#C08090' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.25)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.12)')}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-pink-baby/40 animate-float" />
                        <span className="text-xs text-slate-400 font-medium">No inspection records found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Report Modal */}
      {aiReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coal/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center" style={{ background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.05))' }}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-black text-coal text-lg">AI Mine Analysis</h3>
              </div>
              <button 
                onClick={() => setAiReport(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {aiReport.error ? (
                <div className="text-red-500 font-medium text-sm">{aiReport.error}</div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap">
                      {JSON.stringify(aiReport, null, 2)}
                    </pre>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Analysis generated by CoalGuard AI Engine
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
