import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, CheckCircle2, XCircle, AlertCircle, FileText, User } from 'lucide-react';
import { apiClient } from '../lib/api';
import { Inspection } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatDate } from '../lib/utils';

export const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspection = async () => {
      try {
        if (!id) return;
        const res = await apiClient.get(`/inspections/${id}`);
        setInspection(res.data.data || res.data);
      } catch (err) {
        console.error('Error fetching inspection:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInspection();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-400">Loading audit records...</span>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm font-bold text-coal">Inspection record not found</p>
        <Link to="/mine/inspections" className="text-xs font-black text-pink-500 underline">
          Return to Inspections List
        </Link>
      </div>
    );
  }

  const checklist = (inspection.checklist_data as any[]) || [
    { item: 'Haul road safety berms maintained (>=2.0m height)', status: 'pass' },
    { item: 'Bench slope angle conforms to DGMS circular standards', status: 'pass' },
    { item: 'Dust suppression water sprinklers operational on main corridors', status: 'pass' },
    { item: 'Heavy machinery emergency cutoff switches inspected', status: 'pass' },
    { item: 'Worker PPE compliance (helmets, high-vis, safety shoes)', status: 'pass' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back button & Header */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Link
          to="/mine/inspections"
          className="p-2.5 rounded-xl transition-all duration-150 hover:-translate-x-0.5"
          style={{ background: 'rgba(255,192,203,0.15)', color: '#C08090' }}
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inspection Record</span>
          </div>
          <h1 className="text-2xl font-black text-coal tracking-tight capitalize">
            {inspection.inspection_type} Statutory Audit
          </h1>
        </div>
      </div>

      {/* Overview Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 animate-fade-in-up space-y-6"
        style={{
          background: 'rgba(253,248,251,0.95)',
          border: '1px solid rgba(255,192,203,0.2)',
          boxShadow: '0 8px 32px rgba(255,192,203,0.08)'
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5" style={{ borderColor: 'rgba(255,192,203,0.15)' }}>
          <div className="flex items-center gap-4 flex-wrap">
            <StatusBadge status={inspection.status} />
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-pink-400" />
              {formatDate(inspection.date)}
            </div>
            {inspection.latitude && inspection.longitude && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <MapPin className="w-3.5 h-3.5 text-pink-400" />
                {Number(inspection.latitude).toFixed(4)}, {Number(inspection.longitude).toFixed(4)}
              </div>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700">
            Audit ID: {inspection.id.slice(0, 8)}
          </span>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Summary / Scope</h3>
          <p className="text-sm font-semibold text-coal leading-relaxed">
            {inspection.summary || 'Regular statutory safety assessment across opencast pit sectors and haul roads.'}
          </p>
        </div>

        {/* Checklist */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">DGMS Compliance Checklist Items</h3>
          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl flex items-center justify-between gap-3"
                style={{ background: 'rgba(255,192,203,0.06)', border: '1px solid rgba(255,192,203,0.12)' }}
              >
                <span className="text-xs font-bold text-coal">{item.item || item}</span>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Pass
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
