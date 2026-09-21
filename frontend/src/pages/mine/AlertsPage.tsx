import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertOctagon, Bell, Zap } from 'lucide-react';
import { aiService } from '../../lib/aiApi';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { Alert } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { formatDate } from '../../lib/utils';

const FILTERS = [
  { label: 'Active', value: 'false' },
  { label: 'Resolved', value: 'true' },
  { label: 'All', value: '' },
];

export const AlertsPage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filterResolved, setFilterResolved] = useState<string>('false');
  const [isScanning, setIsScanning] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedMine) params.append('mine_id', selectedMine.id);
      if (filterResolved !== '') params.append('is_resolved', filterResolved);
      const res = await apiClient.get(`/alerts?${params.toString()}`);
      setAlerts(res.data.data || []);
    } catch {
      setAlerts([]);
    }
  };

  useEffect(() => { fetchAlerts(); }, [selectedMine, filterResolved]);

  const handleResolve = async (id: string) => {
    try {
      await apiClient.put(`/alerts/${id}/resolve`);
      fetchAlerts();
    } catch { /* silent */ }
  };

  const runAiScan = async () => {
    setIsScanning(true);
    try {
      const data = await aiService.detectAnomaly({
        mine_id: selectedMine?.id || 'all',
        alerts: alerts.slice(0, 10)
      });
      setAiReport(data);
    } catch (error) {
      console.error('AI Scan failed:', error);
      setAiReport({ error: 'Scan Failed: ' + ((error as any).response?.data?.detail || (error as any).message || 'Unknown Error') });
    }
    setIsScanning(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mine Safety</span>
          </div>
          <h1 className="text-2xl font-black text-coal tracking-tight">Safety &amp; Compliance Alerts</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Automated statutory threshold triggers and escalation notifications
          </p>
        </div>
        <button
          onClick={runAiScan}
          disabled={isScanning}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}
        >
          {isScanning ? (
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {isScanning ? 'Scanning...' : 'AI Deep Scan'}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterResolved(f.value)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
            style={
              filterResolved === f.value
                ? { background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)', color: '#0a0a0a', boxShadow: '0 4px 12px rgba(255,192,203,0.4)' }
                : { background: 'rgba(255,192,203,0.08)', color: '#94A3B8', border: '1px solid rgba(255,192,203,0.15)' }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert, i) => (
            <div
              key={alert.id}
              className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 animate-fade-in-up hover:-translate-y-0.5"
              style={{
                animationDelay: `${i * 60}ms`,
                background: !alert.is_resolved
                  ? alert.severity === 'critical'
                    ? 'rgba(239,68,68,0.05)'
                    : 'rgba(253,248,251,0.9)'
                  : 'rgba(253,248,251,0.6)',
                border: `1px solid ${alert.severity === 'critical' && !alert.is_resolved ? 'rgba(239,68,68,0.2)' : 'rgba(255,192,203,0.15)'}`,
              }}
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskBadge level={alert.severity} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{alert.type}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] text-slate-400 font-medium">{formatDate(alert.created_at)}</span>
                </div>
                <h3 className="text-sm font-bold text-coal">{alert.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{alert.message}</p>
              </div>

              <div className="flex-shrink-0">
                {!alert.is_resolved ? (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#047857', border: '1px solid rgba(16,185,129,0.2)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.18)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
                    <CheckCircle2 className="w-3 h-3" /> Resolved
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-float"
              style={{ background: 'rgba(255,192,203,0.1)', border: '1px solid rgba(255,192,203,0.2)' }}>
              <Bell className="w-7 h-7" style={{ color: '#FFC0CB' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-coal">No alerts</p>
              <p className="text-xs text-slate-400 mt-1">No alerts match the selected filter.</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Report Modal */}
      {aiReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coal/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center" style={{ background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.05))' }}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-black text-coal text-lg">AI Anomaly Scan Results</h3>
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
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Deep scan completed by CoalGuard AI Engine
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
