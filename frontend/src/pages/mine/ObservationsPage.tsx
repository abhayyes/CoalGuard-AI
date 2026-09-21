import React, { useEffect, useState } from 'react';
import { MapPin, CheckCircle } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { Observation } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDate } from '../../lib/utils';

export const ObservationsPage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [observations, setObservations] = useState<Observation[]>([]);

  const fetchObservations = async () => {
    try {
      const mineParam = selectedMine ? `?mine_id=${selectedMine.id}` : '';
      const res = await apiClient.get(`/observations${mineParam}`);
      setObservations(res.data.data || []);
    } catch (err) {
      console.error('Error fetching observations:', err);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, [selectedMine]);

  const handleResolve = async (id: string) => {
    try {
      await apiClient.put(`/observations/${id}`, { status: 'resolved' });
      fetchObservations();
    } catch (err) {
      console.error('Error resolving observation:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Safety & Hazard Observations</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Defects identified during audits requiring corrective action tracking
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {observations.length > 0 ? (
          observations.map((obs) => (
            <Card key={obs.id} className="hover:border-slate-300 transition-colors">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <RiskBadge level={obs.severity} />
                    <span className="text-xs uppercase font-semibold text-slate-500">{obs.category}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400">{formatDate(obs.created_at)}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{obs.description}</p>
                  {obs.latitude && obs.longitude && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Location: {Number(obs.latitude).toFixed(4)}, {Number(obs.longitude).toFixed(4)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <StatusBadge status={obs.status} />
                  {obs.status !== 'resolved' && obs.status !== 'verified' && (
                    <button
                      onClick={() => handleResolve(obs.id)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-xs font-semibold flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Resolve
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-16 text-center text-xs text-slate-400">
            No safety hazard observations recorded.
          </div>
        )}
      </div>
    </div>
  );
};