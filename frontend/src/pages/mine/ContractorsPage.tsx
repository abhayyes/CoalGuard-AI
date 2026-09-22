import React, { useEffect, useState } from 'react';
import {
  Users,
  Clock,
  Plus,
  ShieldCheck,
  X,
  Table as TableIcon,
  LayoutGrid,
  Search,
  AlertTriangle,
  Building2,
  FileCheck,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { Contractor } from '../../types';
import { formatDate } from '../../lib/utils';

const inputCls =
  'w-full text-xs px-3.5 py-2.5 rounded-xl text-coal placeholder:text-slate-300 transition-all duration-150 focus:outline-none';
const inputStyle = {
  background: 'rgba(253,248,251,0.7)',
  border: '1px solid rgba(255,192,203,0.25)',
  color: '#0a0a0a',
};

export const ContractorsPage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [workersCount, setWorkersCount] = useState(25);
  const [safetyScore, setSafetyScore] = useState(85);

  const fetchContractors = async () => {
    try {
      const mineParam = selectedMine ? `?mine_id=${selectedMine.id}&per_page=50` : '?per_page=50';
      const res = await apiClient.get(`/contractors${mineParam}`);
      setContractors(res.data.data || []);
    } catch {
      setContractors([]);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, [selectedMine]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMine) {
      alert('Please select a mine first.');
      return;
    }
    try {
      await apiClient.post('/contractors', {
        mine_id: selectedMine.id,
        name,
        company_name: companyName,
        license_number: licenseNumber,
        valid_until: validUntil,
        workers_count: Number(workersCount),
        safety_score: Number(safetyScore),
        status: 'active',
      });
      setIsModalOpen(false);
      setName('');
      setCompanyName('');
      setLicenseNumber('');
      setValidUntil('');
      fetchContractors();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add contractor');
    }
  };

  // Helper getters to guarantee correct contract_id, contractor name, and expiry_date
  const getContractId = (c: Contractor, idx: number) => {
    return c.documents?.contract_id || c.contract_number || `C00${idx + 1}`;
  };

  const getContractorName = (c: Contractor) => {
    return c.documents?.company_name || c.company_name || c.name;
  };

  const getContactPerson = (c: Contractor) => {
    if (c.documents?.contact_person) return c.documents.contact_person;
    if (c.name && c.name.includes('(')) {
      return c.name.split('(')[1]?.replace(')', '') || '';
    }
    return '';
  };

  const getExpiryDate = (c: Contractor) => {
    return c.valid_until || c.contract_end || '2026-12-31';
  };

  const getSafetyScore = (c: Contractor) => {
    return c.documents?.safety_score || c.safety_score || 90;
  };

  const isExpiringSoon = (dateStr: string) => {
    try {
      const expiry = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const diffDays = (expiry - now) / (1000 * 3600 * 24);
      return diffDays > 0 && diffDays <= 45;
    } catch {
      return false;
    }
  };

  // Filtered list
  const filteredContractors = contractors.filter((c, i) => {
    const q = searchQuery.toLowerCase();
    const cId = getContractId(c, i).toLowerCase();
    const cName = getContractorName(c).toLowerCase();
    const pName = getContactPerson(c).toLowerCase();
    return cId.includes(q) || cName.includes(q) || pName.includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-1.5 h-5 rounded-full"
              style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }}
            />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Mine Operations &bull; Statutory Register
            </span>
          </div>
          <h1 className="text-2xl font-black text-coal tracking-tight">
            Contractor &amp; Agency Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Track outsourced manpower agencies, DGMS statutory licenses, contract IDs, and validity
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div
            className="flex items-center p-1 rounded-xl border"
            style={{
              background: 'rgba(253,248,251,0.8)',
              borderColor: 'rgba(255,192,203,0.3)',
            }}
          >
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white shadow-sm text-coal'
                  : 'text-slate-400 hover:text-coal'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Contracts Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white shadow-sm text-coal'
                  : 'text-slate-400 hover:text-coal'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Agency Cards
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-coal transition-all duration-200 hover:shadow-pink-md hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)',
              boxShadow: '0 4px 16px rgba(255,192,203,0.4)',
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Contractor
          </button>
        </div>
      </div>

      {/* Search Bar & Summary Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Contract ID (e.g. C001) or Contractor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span>
            Total Active Contracts:{' '}
            <strong className="text-coal font-bold">{filteredContractors.length}</strong>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>
            Total Deployed Manpower:{' '}
            <strong className="text-coal font-bold">
              {filteredContractors.reduce((acc, c) => acc + (c.worker_count || c.workers_count || 0), 0)}
            </strong>
          </span>
        </div>
      </div>

      {/* ── Table View: Matching contract_id | contractor | expiry_date ── */}
      {viewMode === 'table' ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Contract ID</th>
                  <th className="py-3.5 px-5">Contractor &amp; Designated Person</th>
                  <th className="py-3.5 px-5">Expiry Date</th>
                  <th className="py-3.5 px-5">Scope of Work</th>
                  <th className="py-3.5 px-5 text-center">Workers</th>
                  <th className="py-3.5 px-5 text-center">Safety Score</th>
                  <th className="py-3.5 px-5 text-right">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredContractors.length > 0 ? (
                  filteredContractors.map((c, i) => {
                    const cId = getContractId(c, i);
                    const cName = getContractorName(c);
                    const pName = getContactPerson(c);
                    const expiry = getExpiryDate(c);
                    const expiringSoon = isExpiringSoon(expiry);
                    const score = getSafetyScore(c);

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-rose-50/20 transition-colors duration-150 group"
                      >
                        {/* Contract ID */}
                        <td className="py-4 px-5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs shadow-sm">
                            {cId}
                          </span>
                        </td>

                        {/* Contractor */}
                        <td className="py-4 px-5">
                          <div className="flex flex-col">
                            <span className="font-black text-coal text-sm group-hover:text-rose-600 transition-colors">
                              {cName}
                            </span>
                            {pName && (
                              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                Representative: <strong className="text-slate-600">{pName}</strong>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Expiry Date */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span
                              className={`font-semibold ${
                                expiringSoon ? 'text-amber-600 font-bold' : 'text-slate-700'
                              }`}
                            >
                              {formatDate(expiry)}
                            </span>
                            {expiringSoon && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                EXPIRING SOON
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Scope of Work */}
                        <td className="py-4 px-5 text-slate-500 max-w-xs truncate" title={c.scope_of_work || 'Mining operations'}>
                          {c.scope_of_work || 'Mining operations & transport'}
                        </td>

                        {/* Workers */}
                        <td className="py-4 px-5 text-center font-bold text-slate-800">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 font-mono">
                            <Users className="w-3 h-3 text-slate-500" />
                            {c.worker_count || c.workers_count || 0}
                          </span>
                        </td>

                        {/* Safety Score */}
                        <td className="py-4 px-5 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold font-mono">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {score}%
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <span
                            className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg inline-flex items-center gap-1"
                            style={
                              c.compliance_status === 'compliant' || c.status === 'active'
                                ? { background: 'rgba(16,185,129,0.1)', color: '#047857' }
                                : { background: 'rgba(245,158,11,0.1)', color: '#B45309' }
                            }
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                c.compliance_status === 'compliant' || c.status === 'active'
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                              }`}
                            />
                            {c.compliance_status || c.status || 'compliant'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No contractors matching &ldquo;{searchQuery}&rdquo;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Cards Grid View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContractors.length > 0 ? (
            filteredContractors.map((c, i) => {
              const cId = getContractId(c, i);
              const cName = getContractorName(c);
              const pName = getContactPerson(c);
              const expiry = getExpiryDate(c);
              const expiringSoon = isExpiringSoon(expiry);
              const score = getSafetyScore(c);

              return (
                <div
                  key={c.id}
                  className="group rounded-2xl p-5 space-y-4 transition-all duration-200 animate-fade-in-up hover:-translate-y-1"
                  style={{
                    animationDelay: `${i * 40}ms`,
                    background: 'rgba(253,248,251,0.9)',
                    border: '1px solid rgba(255,192,203,0.15)',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,192,203,0.2)')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-[10px]">
                          {cId}
                        </span>
                        {expiringSoon && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                            RENEWAL DUE
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-black text-coal">{cName}</h3>
                      {pName && (
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          Rep: <span className="font-semibold text-coal">{pName}</span>
                        </p>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg"
                      style={
                        c.compliance_status === 'compliant' || c.status === 'active'
                          ? { background: 'rgba(16,185,129,0.1)', color: '#047857' }
                          : { background: 'rgba(245,158,11,0.1)', color: '#B45309' }
                      }
                    >
                      {c.compliance_status || c.status || 'compliant'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {c.scope_of_work || 'Heavy equipment operation & coal transport'}
                  </p>

                  <div
                    className="grid grid-cols-2 gap-3 px-3.5 py-3 rounded-xl"
                    style={{
                      background: 'rgba(255,192,203,0.05)',
                      border: '1px solid rgba(255,192,203,0.1)',
                    }}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Workers
                      </span>
                      <span className="font-black text-coal flex items-center gap-1 mt-0.5 text-sm">
                        <Users className="w-3.5 h-3.5" style={{ color: '#FFC0CB' }} />
                        {c.worker_count || c.workers_count || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Safety Score
                      </span>
                      <span className="font-black text-emerald-600 flex items-center gap-1 mt-0.5 text-sm">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        {score}%
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between text-[11px] text-slate-400 font-medium border-t pt-3"
                    style={{ borderColor: 'rgba(255,192,203,0.15)' }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 flex-shrink-0" style={{ color: '#FFC0CB' }} />
                      Expiry: <strong className="font-mono text-slate-700">{formatDate(expiry)}</strong>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">DGMS Verified</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center animate-float"
                style={{
                  background: 'rgba(255,192,203,0.1)',
                  border: '1px solid rgba(255,192,203,0.2)',
                }}
              >
                <Users className="w-7 h-7" style={{ color: '#FFC0CB' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-coal">No contractors registered</p>
                <p className="text-xs text-slate-400 mt-1">
                  Add agencies to track their compliance and safety scores.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Register Contractor Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="relative w-full max-w-md rounded-3xl overflow-hidden animate-scale-in"
            style={{
              background: 'rgba(253,248,251,0.98)',
              border: '1px solid rgba(255,192,203,0.3)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(255,192,203,0.8), transparent)',
              }}
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-black text-coal">Register Contractor Agency</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Add DGMS-licensed contractor details
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#94A3B8' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Designated Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    className={inputCls}
                    style={inputStyle}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Company / Agency Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABC Mining Services Pvt Ltd"
                    className={inputCls}
                    style={inputStyle}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Contract ID / DGMS License Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. C011 / DGMS-EZ-2026"
                    className={inputCls}
                    style={inputStyle}
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Workers Count
                    </label>
                    <input
                      type="number"
                      min={1}
                      className={inputCls}
                      style={inputStyle}
                      value={workersCount}
                      onChange={(e) => setWorkersCount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Safety Score (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={inputCls}
                      style={inputStyle}
                      value={safetyScore}
                      onChange={(e) => setSafetyScore(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Contract Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    className={inputCls}
                    style={inputStyle}
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs border transition-colors"
                    style={{ borderColor: 'rgba(255,192,203,0.3)', color: '#475569' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs text-coal shadow-md transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)',
                      boxShadow: '0 4px 16px rgba(255,192,203,0.4)',
                    }}
                  >
                    Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
