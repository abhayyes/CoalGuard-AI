import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { ComplianceItem, ComplianceStatus } from '../../types';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDate } from '../../lib/utils';

export const ComplianceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ComplianceItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItem = async () => {
    try {
      if (!id) return;
      const res = await apiClient.get(`/compliance/${id}`);
      setItem(res.data.data || res.data);
    } catch (err) {
      console.error('Error fetching compliance item:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const handleStatusChange = async (newStatus: ComplianceStatus) => {
    if (!id) return;
    try {
      await apiClient.put(`/compliance/${id}`, { status: newStatus });
      fetchItem();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-400">Loading statutory requirement...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm font-bold text-coal">Compliance obligation record not found</p>
        <Link to="/mine/compliance" className="text-xs font-black text-pink-500 underline">
          Return to Compliance Register
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Link
          to="/mine/compliance"
          className="p-2.5 rounded-xl transition-all duration-150 hover:-translate-x-0.5"
          style={{ background: 'rgba(255,192,203,0.15)', color: '#C08090' }}
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statutory Obligation</span>
          </div>
          <h1 className="text-2xl font-black text-coal tracking-tight capitalize">
            {item.category} Compliance Record
          </h1>
        </div>
      </div>

      {/* Main Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 animate-fade-in-up space-y-6"
        style={{
          background: 'rgba(253,248,251,0.95)',
          border: '1px solid rgba(255,192,203,0.2)',
          boxShadow: '0 8px 32px rgba(255,192,203,0.08)'
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5" style={{ borderColor: 'rgba(255,192,203,0.15)' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <RiskBadge level={item.risk_level} />
            <StatusBadge status={item.status} />
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700">
              {item.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            Due: {formatDate(item.due_date)}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Requirement Specification</h3>
          <p className="text-sm font-bold text-coal leading-relaxed bg-white/60 p-4 rounded-2xl border border-pink-100">
            {item.requirement}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255,192,203,0.15)' }}>
          {item.status !== 'completed' && (
            <button
              onClick={() => handleStatusChange('completed')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs text-white transition-all duration-150 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
            >
              <CheckCircle className="w-4 h-4" /> Mark as Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
