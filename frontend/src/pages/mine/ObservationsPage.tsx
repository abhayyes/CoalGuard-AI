import React, { useEffect, useState } from 'react';
import { MapPin, CheckCircle, Eye, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { Observation } from '../../types';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDate } from '../../lib/utils';

export const ObservationsPage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [observations, setObservations] = useState<Observation[]>([]);

  const fetchObservations = async () => {
    try {
      const mineParam = selectedMine ? `?mine_id=${selectedMine.id}` : '';
      const res = await apiClient.get(`/observations${mineParam}`);
      setObservations(res.data.data || []);
    } catch { setObservations([]); }
  };

  useEffect(() => { fetchObservations(); }, [selectedMine]);

  const handleResolve = async (id: string) => {
    try {
      await apiClient.put(`/observations/${id}`, { status: 'resolved' });
      fetchObservations();
    } catch { /* silent */ }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mine Safety</span>
        </div>
        <h1 className="text-2xl font-black text-coal tracking-tight">Safety &amp; Hazard Observations</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Defects identified during audits requiring corrective action tracking
        </p>
      </div>

      {/* List */}
      <div className="space-y-3">
        {observations.length > 0 ? (
          observations.map((obs, i) => (
            <div
              key={obs.id}
              className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 animate-fade-in-up hover:-translate-y-0.5"
              style={{
                animationDelay: `${i * 60}ms`,
                background: 'rgba(253,248,251,0.9)',
                border: '1px solid rgba(255,192,203,0.15)',
              }}
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskBadge level={obs.severity} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{obs.category}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] text-slate-400 font-medium">{formatDate(obs.created_at)}</span>
                </div>
                <p className="text-sm font-bold text-coal leading-snug">{obs.description}</p>
                {obs.latitude && obs.longitude && (
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                    <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: '#FFC0CB' }} />
                    Location: {Number(obs.latitude).toFixed(4)}, {Number(obs.longitude).toFixed(4)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center flex-shrink-0">
                <StatusBadge status={obs.status} />
                {obs.status !== 'resolved' && obs.status !== 'verified' && (
                  <button
                    onClick={() => handleResolve(obs.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-150 hover:-translate-y-0.5"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#047857', border: '1px solid rgba(16,185,129,0.2)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.18)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-float"
              style={{ background: 'rgba(255,192,203,0.1)', border: '1px solid rgba(255,192,203,0.2)' }}>
              <AlertTriangle className="w-7 h-7" style={{ color: '#FFC0CB' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-coal">No observations recorded</p>
              <p className="text-xs text-slate-400 mt-1">Safety hazard observations will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
