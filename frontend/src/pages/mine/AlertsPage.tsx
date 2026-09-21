import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { Alert } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../lib/utils';

export const AlertsPage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filterResolved, setFilterResolved] = useState<string>('false');

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedMine) params.append('mine_id', selectedMine.id);
      if (filterResolved !== '') params.append('is_resolved', filterResolved);

      const res = await apiClient.get(`/alerts?${params.toString()}`);
      setAlerts(res.data.data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [selectedMine, filterResolved]);

  const handleResolveAlert = async (id: string) => {
    try {
      await apiClient.put(`/alerts/${id}/resolve`);
      fetchAlerts();
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Safety & Compliance Alerts</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Automated statutory threshold triggers and escalation notifications
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilterResolved('false')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterResolved === 'false'
              ? 'bg-[#1E3A5F] text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Active Unresolved
        </button>
        <button
          onClick={() => setFilterResolved('true')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterResolved === 'true'
              ? 'bg-[#1E3A5F] text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Resolved History
        </button>
        <button
          onClick={() => setFilterResolved('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterResolved === ''
              ? 'bg-[#1E3A5F] text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Alerts
        </button>
      </div>

      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`transition-all ${
                !alert.is_resolved
                  ? alert.severity === 'critical'
                    ? 'border-red-300 bg-red-50/20'
                    : 'border-amber-200 bg-amber-50/10'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <RiskBadge level={alert.severity} />
                    <span className="text-xs uppercase font-bold text-slate-800">{alert.type}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-400">{formatDate(alert.created_at)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                  <p className="text-xs text-slate-600">{alert.message}</p>
                </div>

                <div className="flex items-center gap-3">
                  {!alert.is_resolved ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                      className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Resolved
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-16 text-center text-xs text-slate-400">
            No alerts found for selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
