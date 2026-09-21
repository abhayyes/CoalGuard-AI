import React, { useEffect, useState } from 'react';
import { ShieldCheck, Users, HardHat, FileText, Plus } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const [mines, setMines] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [isMineModalOpen, setIsMineModalOpen] = useState(false);

  // New Mine Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mineType, setMineType] = useState('opencast');
  const [state, setState] = useState('Jharkhand');
  const [capacity, setCapacity] = useState('5.5');
  const [latitude, setLatitude] = useState('23.7450');
  const [longitude, setLongitude] = useState('86.4140');

  const fetchData = async () => {
    try {
      const [minesRes, usersRes] = await Promise.all([
        apiClient.get('/mines'),
        apiClient.get('/users'),
      ]);
      setMines(minesRes.data.data || []);
      setUsersCount(usersRes.data.meta?.total || (usersRes.data.data?.length || 0));
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/mines', {
        name,
        code,
        mine_type: mineType,
        state,
        annual_capacity_mt: parseFloat(capacity),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
      setIsMineModalOpen(false);
      setName('');
      setCode('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create mine profile');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Administration & Tenant Governance</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Global mining site registration, user RBAC management, and platform audit logs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsMineModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Register New Coal Mine
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Mines"
          value={mines.length}
          icon={HardHat}
          variant="default"
          subtitle="Active coal mining leases"
        />
        <StatCard
          title="System Users"
          value={usersCount}
          icon={Users}
          variant="success"
          subtitle="RBAC enabled profiles"
        />
        <StatCard
          title="Security Enforcement"
          value="100%"
          icon={ShieldCheck}
          variant="success"
          subtitle="Supabase Auth + PostGIS"
        />
        <StatCard
          title="Audit Trail Logs"
          value="Active"
          icon={FileText}
          variant="default"
          subtitle="Immutable compliance logs"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Registered Mining Operations</CardTitle>
            <span className="text-xs text-slate-500 font-medium">{mines.length} operational sites</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Mine Name</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">State</th>
                  <th className="px-6 py-3">Capacity (MTPA)</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mines.length > 0 ? (
                  mines.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-bold text-slate-900">{m.name}</td>
                      <td className="px-6 py-3.5 font-mono text-slate-600">{m.code}</td>
                      <td className="px-6 py-3.5 uppercase font-medium">{m.mine_type}</td>
                      <td className="px-6 py-3.5">{m.state}</td>
                      <td className="px-6 py-3.5 font-semibold">{m.annual_capacity_mt || 0} MT</td>
                      <td className="px-6 py-3.5">
                        <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          {m.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No mines registered in system yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Mine Modal */}
      {isMineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Register New Coal Mine Site</h3>
            <form onSubmit={handleCreateMine} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Mine Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jharia OpenCast Coal Block"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Mine Code
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="MINE-JH-01"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Mine Type
                  </label>
                  <select
                    value={mineType}
                    onChange={(e) => setMineType(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="opencast">Opencast</option>
                    <option value="underground">Underground</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Annual Capacity (MTPA)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsMineModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Mine Entry</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
