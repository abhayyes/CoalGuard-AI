import React, { useEffect, useState } from 'react';
import { Plus, Filter, CheckCircle, FileCheck2, X } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { ComplianceItem, ComplianceStatus } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { formatDate } from '../../lib/utils';

const inputCls = "w-full text-xs px-3.5 py-2.5 rounded-xl text-coal placeholder:text-slate-300 transition-all duration-150 focus:outline-none";
const inputStyle = { background: 'rgba(253,248,251,0.7)', border: '1px solid rgba(255,192,203,0.25)', color: '#0a0a0a' };

export const CompliancePage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [requirement, setRequirement] = useState('');
  const [category, setCategory] = useState('statutory');
  const [dueDate, setDueDate] = useState('');
  const [riskLevel, setRiskLevel] = useState('medium');

  const fetchCompliance = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedMine) params.append('mine_id', selectedMine.id);
      if (statusFilter) params.append('status', statusFilter);
      const res = await apiClient.get(`/compliance?${params.toString()}`);
      setItems(res.data.data || []);
    } catch { setItems([]); }
  };

  useEffect(() => { fetchCompliance(); }, [selectedMine, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMine) { alert('Please select a mine first.'); return; }
    try {
      await apiClient.post('/compliance', { mine_id: selectedMine.id, requirement, category, due_date: dueDate, risk_level: riskLevel });
      setIsModalOpen(false);
      setRequirement(''); setDueDate('');
      fetchCompliance();
    } catch (err: any) { alert(err.response?.data?.detail || 'Failed to create record'); }
  };

  const handleStatusChange = async (id: string, newStatus: ComplianceStatus) => {
    try {
      await apiClient.put(`/compliance/${id}`, { status: newStatus });
      fetchCompliance();
    } catch { /* silent */ }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mine Compliance</span>
          </div>
          <h1 className="text-2xl font-black text-coal tracking-tight">Compliance Register</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Statutory &amp; environmental obligations with automated deadline escalation
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-coal transition-all duration-200 hover:shadow-pink-md hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)', boxShadow: '0 4px 16px rgba(255,192,203,0.4)' }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Requirement
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 rounded-2xl animate-fade-in-up"
        style={{ background: 'rgba(253,248,251,0.9)', border: '1px solid rgba(255,192,203,0.15)' }}>
        <div className="flex items-center gap-3">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg px-3 py-1.5 focus:outline-none font-semibold"
            style={{ background: 'rgba(255,192,203,0.1)', border: '1px solid rgba(255,192,203,0.25)', color: '#0a0a0a' }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <span className="text-[11px] text-slate-400 font-semibold">Showing {items.length} obligations</span>
      </div>

      {/* Table card */}
      <div className="rounded-2xl overflow-hidden animate-fade-in-up"
        style={{ background: 'rgba(253,248,251,0.9)', border: '1px solid rgba(255,192,203,0.15)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr style={{ background: 'rgba(255,192,203,0.05)', borderBottom: '1px solid rgba(255,192,203,0.15)' }}>
                {['Requirement', 'Category', 'Due Date', 'Risk', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, i) => (
                  <tr key={item.id}
                    className="border-b last:border-0 transition-colors duration-150 animate-fade-in-up"
                    style={{ borderColor: 'rgba(255,192,203,0.1)', animationDelay: `${i * 40}ms` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-5 py-4 max-w-xs font-semibold text-coal">{item.requirement}</td>
                    <td className="px-5 py-4 uppercase font-bold text-[10px] tracking-widest text-slate-400">{item.category}</td>
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-coal">{formatDate(item.due_date)}</td>
                    <td className="px-5 py-4"><RiskBadge level={item.risk_level} /></td>
                    <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-4">
                      {item.status !== 'completed' ? (
                        <button
                          onClick={() => handleStatusChange(item.id, 'completed')}
                          className="inline-flex items-center gap-1 text-[11px] font-bold transition-colors"
                          style={{ color: '#047857' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#0a0a0a')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#047857')}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Mark Done
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-300">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileCheck2 className="w-8 h-8 animate-float" style={{ color: 'rgba(255,192,203,0.5)' }} />
                      <span className="text-xs text-slate-400 font-medium">No compliance obligations match criteria.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="relative w-full max-w-lg rounded-3xl overflow-hidden animate-scale-in"
            style={{ background: 'rgba(253,248,251,0.98)', border: '1px solid rgba(255,192,203,0.3)', boxShadow: '0 40px 80px rgba(0,0,0,0.3)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,192,203,0.8), transparent)' }} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-black text-coal">Add Compliance Obligation</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Add a statutory or environmental requirement</p>
                </div>
                <button onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#94A3B8' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statutory Requirement</label>
                  <textarea
                    required rows={3} value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="e.g., Annual DGMS Form IV Safety Audit filing"
                    className={inputCls} style={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} style={inputStyle}>
                      <option value="statutory">Statutory</option>
                      <option value="environmental">Environmental</option>
                      <option value="safety">Safety</option>
                      <option value="operational">Operational</option>
                      <option value="labor">Labor</option>
                      <option value="financial">Financial</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</label>
                    <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Level</label>
                  <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)} className={inputCls} style={inputStyle}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,192,203,0.2)' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 transition-all duration-150"
                    style={{ border: '1px solid rgba(255,192,203,0.25)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >Cancel</button>
                  <button type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black text-coal transition-all duration-150 active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)', boxShadow: '0 4px 14px rgba(255,192,203,0.4)' }}
                  >Save Requirement</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
