import React, { useEffect, useState } from 'react';
import { Plus, Filter, CheckCircle } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { ComplianceItem, ComplianceStatus } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../lib/utils';

export const CompliancePage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New item form state
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
    } catch (err) {
      console.error('Error fetching compliance items:', err);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, [selectedMine, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMine) {
      alert('Please select a mine in the top bar before adding compliance records.');
      return;
    }

    try {
      await apiClient.post('/compliance', {
        mine_id: selectedMine.id,
        requirement,
        category,
        due_date: dueDate,
        risk_level: riskLevel,
      });
      setIsModalOpen(false);
      setRequirement('');
      setDueDate('');
      fetchCompliance();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create compliance record');
    }
  };

  const handleStatusChange = async (id: string, newStatus: ComplianceStatus) => {
    try {
      await apiClient.put(`/compliance/${id}`, { status: newStatus });
      fetchCompliance();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance Register</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Statutory & environmental obligations registry with automated deadline escalation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Requirement
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 uppercase">Filter by Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing {items.length} obligations
          </div>
        </CardContent>
      </Card>

      {/* Compliance Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Requirement</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Risk Level</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 max-w-sm font-medium text-slate-900">
                        {item.requirement}
                      </td>
                      <td className="px-6 py-4 uppercase text-[11px] font-semibold text-slate-500">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                        {formatDate(item.due_date)}
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge level={item.risk_level} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.status !== 'completed' ? (
                          <button
                            onClick={() => handleStatusChange(item.id, 'completed')}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Done
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No compliance obligations match criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Requirement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Compliance Obligation</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Obligation / Statutory Requirement
                </label>
                <textarea
                  required
                  rows={3}
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  placeholder="e.g., Annual DGMS Form IV Safety Audit filing"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="statutory">Statutory</option>
                    <option value="environmental">Environmental</option>
                    <option value="safety">Safety</option>
                    <option value="operational">Operational</option>
                    <option value="labor">Labor</option>
                    <option value="financial">Financial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Risk Level
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Requirement</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
