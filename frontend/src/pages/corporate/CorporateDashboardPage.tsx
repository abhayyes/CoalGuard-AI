import React, { useEffect, useState } from 'react';
import { Building2, ShieldCheck, AlertTriangle, TrendingUp, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { apiClient } from '../../lib/api';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { RiskBadge } from '../../components/ui/RiskBadge';

export const CorporateDashboardPage: React.FC = () => {
  const [mines, setMines] = useState<any[]>([]);

  useEffect(() => {
    const fetchCorporateData = async () => {
      try {
        const res = await apiClient.get('/mines');
        setMines(res.data.data || []);
      } catch (err) {
        console.error('Error fetching corporate data:', err);
      }
    };

    fetchCorporateData();
  }, []);

  // Sample aggregate chart data
  const mineComparisonData = [
    { name: 'Jharia East', compliance: 92, risk: 28, production: 5.2 },
    { name: 'Korba West', compliance: 84, risk: 45, production: 8.1 },
    { name: 'Singrauli North', compliance: 78, risk: 52, production: 6.4 },
    { name: 'Talcher South', compliance: 95, risk: 18, production: 12.0 },
    { name: 'Raniganj Deep', compliance: 88, risk: 36, production: 3.8 },
  ];

  const monthlyTrendData = [
    { month: 'Apr', audits: 18, compliance: 82 },
    { month: 'May', audits: 24, compliance: 85 },
    { month: 'Jun', audits: 20, compliance: 84 },
    { month: 'Jul', audits: 28, compliance: 89 },
    { month: 'Aug', audits: 32, compliance: 91 },
    { month: 'Sep', audits: 35, compliance: 93 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Corporate Multi-Mine Command Center</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Enterprise-wide statutory compliance oversight across all coal mining subsidiaries
          </p>
        </div>
      </div>

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Operating Mines"
          value={mines.length || 5}
          icon={Building2}
          variant="default"
          subtitle="Across 4 Coalfield Zones"
        />
        <StatCard
          title="Group Compliance Rate"
          value="89.4%"
          icon={ShieldCheck}
          trend={{ value: '+3.1%', isPositive: true }}
          variant="success"
          subtitle="Target: 95% across all pits"
        />
        <StatCard
          title="Enterprise Risk Index"
          value="35.8"
          icon={AlertTriangle}
          trend={{ value: 'Low-Medium', isNeutral: true }}
          variant="warning"
          subtitle="AI Weighted Safety Index"
        />
        <StatCard
          title="Annual Coal Output"
          value="35.5 MT"
          icon={TrendingUp}
          trend={{ value: '+8.4%', isPositive: true }}
          variant="success"
          subtitle="YTD Statutory Approved"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mine Comparison Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Mine-Wise Statutory Compliance Score (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mineComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="compliance" fill="#1E3A5F" radius={[4, 4, 0, 0]} name="Compliance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Month Trend */}
        <Card>
          <CardHeader>
            <CardTitle>6-Month Audit Velocity & Compliance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} domain={[50, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="compliance" stroke="#10B981" strokeWidth={3} name="Compliance Rate (%)" />
                  <Line type="monotone" dataKey="audits" stroke="#3B82F6" strokeWidth={2} name="Audits Conducted" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subsidiary Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Subsidiary Coal Block Rankings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Mine Location</th>
                  <th className="px-6 py-3">Capacity (MTPA)</th>
                  <th className="px-6 py-3">Compliance Score</th>
                  <th className="px-6 py-3">Safety Risk Level</th>
                  <th className="px-6 py-3 text-right">Drill-down</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mineComparisonData.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {m.name}
                    </td>
                    <td className="px-6 py-3.5 font-semibold">{m.production} MT</td>
                    <td className="px-6 py-3.5">
                      <span className="text-emerald-700 font-bold">{m.compliance}%</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <RiskBadge level={m.risk > 40 ? 'high' : m.risk > 25 ? 'medium' : 'low'} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link to="/mine/dashboard" className="text-[#1E3A5F] hover:underline font-semibold flex items-center gap-1 justify-end">
                        Enter Mine Portal <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
