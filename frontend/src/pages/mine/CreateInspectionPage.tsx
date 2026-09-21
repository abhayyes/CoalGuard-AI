import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  ClipboardCheck,
  ShieldAlert,
  FileSpreadsheet,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';

const inputCls = "w-full text-xs px-3.5 py-2.5 rounded-xl text-coal placeholder:text-slate-300 transition-all duration-150 focus:outline-none";
const inputStyle = { background: 'rgba(253,248,251,0.7)', border: '1px solid rgba(255,192,203,0.25)', color: '#0a0a0a' };

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
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Field Audit Workflow</span>
        </div>
        <h1 className="text-2xl font-black text-coal tracking-tight">Conduct Mine Inspection</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Step {step} of 3: {step === 1 ? 'Inspection Details & Geolocation' : step === 2 ? 'DGMS Safety Checklist' : 'Log Observations & Submit'}
        </p>
      </div>

      {/* Steps Progress Indicator */}
      <div className="flex items-center justify-between p-4 rounded-2xl animate-fade-in-up"
        style={{ background: 'rgba(253,248,251,0.9)', border: '1px solid rgba(255,192,203,0.2)' }}>
        {[
          { num: 1, title: 'Details & GPS', icon: FileSpreadsheet },
          { num: 2, title: 'Checklist', icon: ClipboardCheck },
          { num: 3, title: 'Observations', icon: ShieldAlert },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-200 ${
                  isActive
                    ? 'text-coal shadow-pink-sm scale-105'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
                style={isActive ? { background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)' } : {}}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs font-bold ${isActive ? 'text-coal' : 'text-slate-400'}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Container Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 animate-fade-in-up"
        style={{
          background: 'rgba(253,248,251,0.98)',
          border: '1px solid rgba(255,192,203,0.25)',
          boxShadow: '0 8px 32px rgba(255,192,203,0.08)'
        }}
      >
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inspection Category</label>
              <select
                value={inspectionType}
                onChange={(e) => setInspectionType(e.target.value)}
                className={inputCls} style={inputStyle}
              >
                <option value="safety">Statutory Safety Audit</option>
                <option value="routine">Routine Pit Inspection</option>
                <option value="environmental">Environmental Compliance Audit</option>
                <option value="special">Special DGMS Directed Audit</option>
                <option value="follow_up">Corrective Action Follow-up</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inspection Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls} style={inputStyle}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Summary / Scope of Inspection</label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="e.g. Auditing haul road conditions, slope stability, and heavy earthmoving machinery safety."
                className={inputCls} style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GPS Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className={inputCls} style={inputStyle}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GPS Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className={inputCls} style={inputStyle}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={captureGPS}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all duration-150"
              style={{ background: 'rgba(255,192,203,0.15)', color: '#C08090' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.15)')}
            >
              <MapPin className="w-3.5 h-3.5" /> Auto-Capture Geo-Location
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-black text-coal">DGMS Safety Standards Verification</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Mark verification criteria as Pass, Fail, or N/A</p>
            </div>

            <div className="space-y-2.5">
              {checklist.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-150"
                  style={{ background: 'rgba(255,192,203,0.06)', border: '1px solid rgba(255,192,203,0.15)' }}
                >
                  <span className="text-xs font-bold text-coal flex-1">{c.item}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {['pass', 'fail', 'na'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleChecklistChange(c.id, status)}
                        className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-xl transition-all duration-150 ${
                          c.status === status
                            ? status === 'pass'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : status === 'fail'
                              ? 'bg-red-500 text-white shadow-sm'
                              : 'bg-slate-700 text-white shadow-sm'
                            : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white'
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
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-black text-coal">Record Identified Safety Hazards</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Optional hazard log attached to this inspection audit</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observation / Defect Description</label>
              <textarea
                rows={3}
                value={obsDescription}
                onChange={(e) => setObsDescription(e.target.value)}
                placeholder="e.g. Inadequate berm height (<1.5m) observed along 200m haul road curve near Dump-3."
                className={inputCls} style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hazard Severity</label>
                <select
                  value={obsSeverity}
                  onChange={(e) => setObsSeverity(e.target.value)}
                  className={inputCls} style={inputStyle}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (48h Escalation)</option>
                  <option value="critical">Critical (Immediate Stop-Work)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                <select
                  value={obsCategory}
                  onChange={(e) => setObsCategory(e.target.value)}
                  className={inputCls} style={inputStyle}
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
        <div className="flex items-center justify-between pt-6 mt-6 border-t" style={{ borderColor: 'rgba(255,192,203,0.2)' }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 transition-all duration-150 hover:-translate-y-0.5"
              style={{ border: '1px solid rgba(255,192,203,0.25)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black text-coal transition-all duration-150 hover:shadow-pink-md hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)', boxShadow: '0 4px 14px rgba(255,192,203,0.4)' }}
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black text-white transition-all duration-150 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? 'Submitting...' : 'Submit Inspection Record'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
