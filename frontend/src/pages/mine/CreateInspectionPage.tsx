import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export const CreateInspectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedMine } = useMineStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [inspectionType, setInspectionType] = useState('safety');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [latitude, setLatitude] = useState('23.7450');
  const [longitude, setLongitude] = useState('86.4140');

  // Checklist Items
  const [checklist, setChecklist] = useState([
    { id: '1', item: 'Haul road safety berms maintained (>=2.0m height)', status: 'pass', notes: '' },
    { id: '2', item: 'Bench slope angle conforms to DGMS circular standards', status: 'pass', notes: '' },
    { id: '3', item: 'Dust suppression water sprinklers operational on main corridors', status: 'pass', notes: '' },
    { id: '4', item: 'Heavy machinery emergency cutoff switches inspected', status: 'pass', notes: '' },
    { id: '5', item: 'Worker PPE compliance (helmets, high-vis, safety shoes)', status: 'pass', notes: '' },
  ]);

  // Observations
  const [obsDescription, setObsDescription] = useState('');
  const [obsSeverity, setObsSeverity] = useState('medium');
  const [obsCategory, setObsCategory] = useState('safety');

  const captureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(7));
          setLongitude(pos.coords.longitude.toFixed(7));
        },
        (err) => console.warn('GPS error:', err)
      );
    }
  };

  const handleChecklistChange = (id: string, status: string) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  const handleSubmit = async () => {
    if (!selectedMine) {
      alert('Please select a mine in the top bar before submitting.');
      return;
    }

    try {
      setIsLoading(true);
      // 1. Create inspection
      const inspRes = await apiClient.post('/inspections', {
        mine_id: selectedMine.id,
        inspection_type: inspectionType,
        date,
        summary,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        checklist_data: checklist,
      });

      const inspectionId = inspRes.data.id;

      // 2. Add observation if entered
      if (obsDescription) {
        await apiClient.post('/observations', {
          inspection_id: inspectionId,
          description: obsDescription,
          severity: obsSeverity,
          category: obsCategory,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        });
      }

      navigate('/mine/inspections');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit inspection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Conduct Mine Inspection</h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Step {step} of 3: {step === 1 ? 'Inspection Details' : step === 2 ? 'Safety Checklist' : 'Log Observations & Submit'}
        </p>
      </div>

      {/* Steps Progress Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs font-semibold">
        <span className={step === 1 ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F] pb-1' : 'text-slate-400'}>
          1. Basic Details
        </span>
        <span className={step === 2 ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F] pb-1' : 'text-slate-400'}>
          2. Mandatory Checklist
        </span>
        <span className={step === 3 ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F] pb-1' : 'text-slate-400'}>
          3. Observations & Review
        </span>
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Inspection Category
                </label>
                <select
                  value={inspectionType}
                  onChange={(e) => setInspectionType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="safety">Statutory Safety Audit</option>
                  <option value="routine">Routine Pit Inspection</option>
                  <option value="environmental">Environmental Compliance Audit</option>
                  <option value="special">Special DGMS Directed Audit</option>
                  <option value="follow_up">Corrective Action Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Inspection Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Summary / Scope of Inspection
                </label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="e.g. Auditing haul road conditions, slope stability, and heavy earthmoving machinery safety."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    GPS Latitude
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
                    GPS Longitude
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <Button type="button" variant="outline" size="sm" onClick={captureGPS} className="gap-2">
                <MapPin className="w-3.5 h-3.5" /> Auto-Capture Geo-Location
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 mb-2">DGMS Safety Standards Verification</h3>
              <div className="space-y-3">
                {checklist.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-800 font-medium">{c.item}</span>
                    <div className="flex items-center gap-1">
                      {['pass', 'fail', 'na'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleChecklistChange(c.id, status)}
                          className={`text-[11px] uppercase font-semibold px-2.5 py-1 rounded transition-colors ${
                            c.status === status
                              ? status === 'pass'
                                ? 'bg-emerald-600 text-white'
                                : status === 'fail'
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-700 text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Record Identified Safety Hazards</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Observation / Defect Description
                </label>
                <textarea
                  rows={3}
                  value={obsDescription}
                  onChange={(e) => setObsDescription(e.target.value)}
                  placeholder="e.g. Inadequate berm height (<1.5m) observed along 200m haul road curve near Dump-3."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Hazard Severity
                  </label>
                  <select
                    value={obsSeverity}
                    onChange={(e) => setObsSeverity(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (48h Escalation)</option>
                    <option value="critical">Critical (Immediate Stop-Work)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={obsCategory}
                    onChange={(e) => setObsCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="safety">Safety</option>
                    <option value="structural">Structural Stability</option>
                    <option value="equipment">Heavy Machinery</option>
                    <option value="environmental">Environmental</option>
                    <option value="procedural">Procedural / Standard</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                isLoading={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Submit Inspection Record
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
