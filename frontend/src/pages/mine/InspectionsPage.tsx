import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardCheck, Calendar, MapPin } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { Inspection } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../lib/utils';

export const InspectionsPage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [inspections, setInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const mineParam = selectedMine ? `?mine_id=${selectedMine.id}` : '';
        const res = await apiClient.get(`/inspections${mineParam}`);
        setInspections(res.data.data || []);
      } catch (err) {
        console.error('Error fetching inspections:', err);
      }
    };

    fetchInspections();
  }, [selectedMine]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mine Inspections</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Statutory safety audits, hazard logs, and geo-tagged field observations
          </p>
        </div>
        <Link to="/mine/inspections/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Inspection
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inspections.length > 0 ? (
          inspections.map((insp) => (
            <Card key={insp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 capitalize">
                        {insp.inspection_type} Inspection
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(insp.date)}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={insp.status} />
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {insp.summary || 'Standard checklist audit across opencast pit sectors.'}
                </p>

                {insp.latitude && insp.longitude && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-md">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    GPS: {Number(insp.latitude).toFixed(4)}, {Number(insp.longitude).toFixed(4)}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    {insp.observations?.length || 0} Observations
                  </span>
                  <span className="text-[#1E3A5F] font-semibold hover:underline cursor-pointer">
                    View Details →
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            No inspection logs found.
          </div>
        )}
      </div>
    </div>
  );
};
