import React, { useEffect, useState } from 'react';
import { Users, Clock, Plus, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { Contractor } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../lib/utils';

export const ContractorsPage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
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
    } catch (err) {
      console.error('Error fetching contractors:', err);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, [selectedMine]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMine) {
      alert('Please select a mine in the top bar.');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contractor Safety & Compliance</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Track outsourced manpower agencies, DGMS statutory licenses, and safety scores
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Contractor Agency
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contractors.length > 0 ? (
          contractors.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{c.company_name || c.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">License: {c.license_number || 'DGMS/REG/2026'}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      c.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Active Workers</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {c.workers_count || c.worker_count || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Safety Score</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {c.safety_score || 0}%
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Valid until: {formatDate(c.valid_until || c.contract_end)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            No registered contractors found for this mine.
          </div>
        )}
      </div>

      {/* Add Contractor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Register Contractor Agency</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Contact Person / Representative
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Agency / Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Bharat Heavy Earthmovers Logistics"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Statutory License
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="DGMS-LIC-9921"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Deployed Workers
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={workersCount}
                    onChange={(e) => setWorkersCount(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Initial Safety Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Register Agency</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
