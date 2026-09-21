import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardCheck, Calendar, MapPin } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { Inspection } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDate } from '../../lib/utils';

export const InspectionsPage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [inspections, setInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const mineParam = selectedMine ? `?mine_id=${selectedMine.id}` : '';
        const res = await apiClient.get(`/inspections${mineParam}`);
        setInspections(res.data.data || []);
      } catch { setInspections([]); }
    };
    fetchInspections();
  }, [selectedMine]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mine Operations</span>
          </div>
          <h1 className="text-2xl font-black text-coal tracking-tight">Mine Inspections</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Statutory safety audits, hazard logs, and geo-tagged field observations
          </p>
        </div>
        <Link
          to="/mine/inspections/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-coal transition-all duration-200 hover:shadow-pink-md hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)', boxShadow: '0 4px 16px rgba(255,192,203,0.4)' }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Inspection
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inspections.length > 0 ? (
          inspections.map((insp, i) => (
            <div
              key={insp.id}
              className="group rounded-2xl p-5 space-y-4 transition-all duration-200 animate-fade-in-up hover:-translate-y-1 cursor-default"
              style={{
                animationDelay: `${i * 60}ms`,
                background: 'rgba(253,248,251,0.9)',
                border: '1px solid rgba(255,192,203,0.15)',
                boxShadow: '0 2px 12px rgba(255,192,203,0.08)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,192,203,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(255,192,203,0.08)')}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl transition-transform duration-200 group-hover:scale-110"
                    style={{ background: 'rgba(255,192,203,0.15)' }}>
                    <ClipboardCheck className="w-5 h-5" style={{ color: '#C08090' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-coal capitalize">{insp.inspection_type} Inspection</h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 font-medium">
                      <Calendar className="w-3 h-3" />
                      {formatDate(insp.date)}
                    </div>
                  </div>
                </div>
                <StatusBadge status={insp.status} />
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {insp.summary || 'Standard checklist audit across opencast pit sectors.'}
              </p>

              {insp.latitude && insp.longitude && (
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(255,192,203,0.06)', border: '1px solid rgba(255,192,203,0.1)' }}>
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FFC0CB' }} />
                  GPS: {Number(insp.latitude).toFixed(4)}, {Number(insp.longitude).toFixed(4)}
                </div>
              )}

              <div className="pt-3 flex items-center justify-between text-xs border-t"
                style={{ borderColor: 'rgba(255,192,203,0.15)' }}>
                <span className="font-bold text-coal">{insp.observations?.length || 0} Observations</span>
                <Link
                  to={`/mine/inspections/${insp.id}`}
                  className="font-bold transition-colors duration-150"
                  style={{ color: '#C08090' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#0a0a0a')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#C08090')}
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-float"
              style={{ background: 'rgba(255,192,203,0.1)', border: '1px solid rgba(255,192,203,0.2)' }}>
              <ClipboardCheck className="w-7 h-7" style={{ color: '#FFC0CB' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-coal">No inspection logs</p>
              <p className="text-xs text-slate-400 mt-1">Create your first inspection to get started.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
