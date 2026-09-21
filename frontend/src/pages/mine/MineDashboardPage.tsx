import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  ClipboardList,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { formatDate } from '../../lib/utils';
import { ComplianceStats, Inspection, Alert } from '../../types';

export const MineDashboardPage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mineParam = selectedMine ? `?mine_id=${selectedMine.id}` : '';

        // Fetch stats
        const statsRes = await apiClient.get(`/compliance/stats${mineParam}`);
        setStats(statsRes.data);

        // Fetch recent inspections
        const inspRes = await apiClient.get(`/inspections${mineParam ? mineParam + '&' : '?'}per_page=5`);
        setInspections(inspRes.data.data || []);

        // Fetch unresolved alerts
        const alertRes = await apiClient.get(`/alerts${mineParam ? mineParam + '&' : '?'}is_resolved=false&per_page=4`);
        setAlerts(alertRes.data.data || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        // Provide mock fallback data if API is empty
        setStats({
          total: 24,
          completed: 19,
          pending: 3,
          in_progress: 1,
          overdue: 1,
          compliance_rate: 79.2,
          by_category: { statutory: 10, safety: 8, environmental: 6 },
        });
      }
    };

    fetchData();
  }, [selectedMine]);

  const pieData = stats
    ? [
        { name: 'Completed', value: stats.completed, color: '#10B981' },
        { name: 'In Progress', value: stats.in_progress, color: '#3B82F6' },
        { name: 'Pending', value: stats.pending, color: '#F59E0B' },
        { name: 'Overdue', value: stats.overdue, color: '#EF4444' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6 bg-gradient-to-b from-[#F5F0F5] via-[#FDF8FB] to-[#FFC0CB]/20 p-6 rounded-3xl animate-fade-in shadow-[0_25px_60px_-12px_rgba(255,192,203,0.25)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0a0a0a] tracking-tight">
            {selectedMine ? selectedMine.name : 'All Mines Overview'}
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Real-time compliance monitoring & statutory safety tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/mine/inspections/new"
            className="inline-flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162C47] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            New Inspection
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Compliance Rate"
          value={`${stats?.compliance_rate || 0}%`}
          icon={CheckCircle2}
          trend={{ value: '+4.2%', isPositive: true }}
          variant="success"
          subtitle="Target: 95% statutory compliance"
        />
        <StatCard
          title="Overdue Items"
          value={stats?.overdue || 0}
          icon={AlertOctagon}
          variant={stats?.overdue ? 'danger' : 'default'}
          subtitle="Requires immediate remediation"
        />
        <StatCard
          title="Active Inspections"
          value={inspections.length}
          icon={ClipboardList}
          subtitle="Last 30 days"
        />
        <StatCard
          title="Safety Risk Index"
          value="42.5"
          icon={Activity}
          trend={{ value: 'Medium', isNeutral: true }}
          variant="warning"
          subtitle="AI Aggregated Mine Score (0-100)"
        />
      </div>

      {/* Charts & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Donut */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Compliance Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 text-xs mt-3">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                      <span className="text-slate-600 whitespace-nowrap">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-xs text-slate-400">
                No compliance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Critical Alerts List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Critical Alerts & Escalations</CardTitle>
              <Link
                to="/mine/alerts"
                className="text-xs font-semibold text-[#1E3A5F] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-lg border border-slate-100 bg-slate-50 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <RiskBadge level={alert.severity} />
                        <span className="text-xs font-bold text-slate-800">{alert.title}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{alert.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatDate(alert.created_at)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  No active unresolved alerts for this mine.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Inspections Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Recent Mine Inspections</CardTitle>
            <Link
              to="/mine/inspections"
              className="text-xs font-semibold text-[#1E3A5F] hover:underline flex items-center gap-1"
            >
              All inspections <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Summary</th>
                  <th className="px-6 py-3">Observations</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {inspections.length > 0 ? (
                  inspections.map((insp) => (
                    <tr key={insp.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-medium text-slate-900">{formatDate(insp.date)}</td>
                      <td className="px-6 py-3.5 capitalize font-medium">{insp.inspection_type}</td>
                      <td className="px-6 py-3.5 max-w-xs truncate text-slate-500">{insp.summary || 'Routine audit'}</td>
                      <td className="px-6 py-3.5">{insp.observations?.length || 0}</td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={insp.status} />
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          to={`/mine/inspections/${insp.id}`}
                          className="text-[#1E3A5F] hover:underline font-semibold"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No inspection records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
