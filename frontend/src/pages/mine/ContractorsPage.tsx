import React, { useEffect, useState } from 'react';
import { Users, Clock, Plus, ShieldCheck, X } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { Contractor } from '../../types';
import { formatDate } from '../../lib/utils';

const inputCls = "w-full text-xs px-3.5 py-2.5 rounded-xl text-coal placeholder:text-slate-300 transition-all duration-150 focus:outline-none";
const inputStyle = { background: 'rgba(253,248,251,0.7)', border: '1px solid rgba(255,192,203,0.25)', color: '#0a0a0a' };

export const ContractorsPage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [workersCount, setWorkersCount] = useState(25);
  const [safetyScore, setSafetyScore] = useState(85);

  const fetchContractors = async () => {
    try {
      const mineParam = selectedMine ? `?mine_id=${selectedMine.id}` : '';
      const res = await apiClient.get(`/contractors${mineParam}`);
      setContractors(res.data.data || []);
    } catch { setContractors([]); }
  };

  useEffect(() => { fetchContractors(); }, [selectedMine]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMine) { alert('Please select a mine first.'); return; }
    try {
      await apiClient.post('/contractors', {
        mine_id: selectedMine.id, name, company_name: companyName,
        license_number: licenseNumber, valid_until: validUntil,
        workers_count: Number(workersCount), safety_score: Number(safetyScore), status: 'active',
      });
      setIsModalOpen(false);
      setName(''); setCompanyName(''); setLicenseNumber(''); setValidUntil('');
      fetchContractors();
    } catch (err: any) { alert(err.response?.data?.detail || 'Failed to add contractor'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mine Operations</span>
          </div>
          <h1 className="text-2xl font-black text-coal tracking-tight">Contractor Safety &amp; Compliance</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Track outsourced manpower agencies, DGMS statutory licenses, and safety scores
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-coal transition-all duration-200 hover:shadow-pink-md hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)', boxShadow: '0 4px 16px rgba(255,192,203,0.4)' }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Contractor Agency
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contractors.length > 0 ? (
          contractors.map((c, i) => (
            <div
              key={c.id}
              className="group rounded-2xl p-5 space-y-4 transition-all duration-200 animate-fade-in-up hover:-translate-y-1"
              style={{
                animationDelay: `${i * 60}ms`,
                background: 'rgba(253,248,251,0.9)',
                border: '1px solid rgba(255,192,203,0.15)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,192,203,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-black text-coal">{c.company_name || c.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">License: {c.license_number || 'DGMS/REG/2026'}</p>
                </div>
                <span
                  className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg"
                  style={c.status === 'active'
                    ? { background: 'rgba(16,185,129,0.1)', color: '#047857' }
                    : { background: 'rgba(239,68,68,0.1)', color: '#B91C1C' }}
                >
                  {c.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 px-3.5 py-3 rounded-xl"
                style={{ background: 'rgba(255,192,203,0.05)', border: '1px solid rgba(255,192,203,0.1)' }}>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Workers</span>
                  <span className="font-black text-coal flex items-center gap-1 mt-0.5 text-sm">
                    <Users className="w-3.5 h-3.5" style={{ color: '#FFC0CB' }} />
                    {c.workers_count || c.worker_count || 0}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Safety</span>
                  <span className="font-black text-emerald-600 flex items-center gap-1 mt-0.5 text-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    {c.safety_score || 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium border-t pt-3"
                style={{ borderColor: 'rgba(255,192,203,0.15)' }}>
                <Clock className="w-3 h-3 flex-shrink-0" style={{ color: '#FFC0CB' }} />
                Valid until: {formatDate(c.valid_until || c.contract_end)}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-float"
              style={{ background: 'rgba(255,192,203,0.1)', border: '1px solid rgba(255,192,203,0.2)' }}>
              <Users className="w-7 h-7" style={{ color: '#FFC0CB' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-coal">No contractors registered</p>
              <p className="text-xs text-slate-400 mt-1">Add agencies to track their compliance and safety scores.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="relative w-full max-w-md rounded-3xl overflow-hidden animate-scale-in"
            style={{ background: 'rgba(253,248,251,0.98)', border: '1px solid rgba(255,192,203,0.3)', boxShadow: '0 40px 80px rgba(0,0,0,0.3)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,192,203,0.8), transparent)' }} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-black text-coal">Register Contractor Agency</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Add DGMS-licensed contractor details</p>
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

              <form onSubmit={handleCreate} className="space-y-3.5">
                {[
                  { label: 'Contact Person', value: name, set: setName, placeholder: 'e.g. Ramesh Kumar', type: 'text' },
                  { label: 'Agency / Company Name', value: companyName, set: setCompanyName, placeholder: 'e.g. Bharat Heavy Earthmovers', type: 'text' },
                ].map(({ label, value, set, placeholder, type }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
                    <input type={type} required value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} className={inputCls} style={inputStyle} />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statutory License</label>
                    <input type="text" required value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="DGMS-LIC-9921" className={inputCls} style={inputStyle} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valid Until</label>
                    <input type="date" required value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deployed Workers</label>
                    <input type="number" min="1" value={workersCount} onChange={(e) => setWorkersCount(Number(e.target.value))} className={inputCls} style={inputStyle} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Safety Score %</label>
                    <input type="number" min="0" max="100" value={safetyScore} onChange={(e) => setSafetyScore(Number(e.target.value))} className={inputCls} style={inputStyle} />
                  </div>
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
                  >Register Agency</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
