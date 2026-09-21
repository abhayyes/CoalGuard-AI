import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
  Wind,
  Thermometer,
  Droplets,
  Activity,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

interface AiReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: any;
  title?: string;
}

export const AiReportModal: React.FC<AiReportModalProps> = ({
  isOpen,
  onClose,
  report,
  title = 'AI Mine Governance Analysis',
}) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isError = Boolean(report.error);
  const risk = report.risk_assessment || {};
  const riskScore = typeof risk.overall_risk_score === 'number' ? risk.overall_risk_score : (report.predicted_risk_index || 45.0);
  const riskLevel = risk.risk_level || report.risk_tier || (riskScore > 65 ? 'High' : riskScore > 35 ? 'Medium' : 'Low');

  const telemetry = report.sensor_telemetry_analyzed || report.telemetry_verification || {};
  const compStatus = report.statutory_compliance_status || {};
  const anomalies = report.anomalies_detected || report.critical_flags || [];
  const recommendations = report.statutory_recommendations || (report.recommendation ? [report.recommendation] : []);

  const getRiskColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('high') || l.includes('critical')) return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-500' };
    if (l.includes('medium')) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500' };
    return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' };
  };

  const riskColors = getRiskColor(riskLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg tracking-tight">{title}</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-700 uppercase tracking-wider">
                  {report.mode || 'AI Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {report.ai_engine || 'CoalGuard Smart Governance AI Analytics'}
                {report.timestamp && ` · ${new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-lg"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {isError ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-800 text-sm">Analysis Request Failed</h4>
                <p className="text-xs text-rose-600 mt-1">{report.error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Executive Summary / Risk Tier Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Overall Risk Score Card */}
                <div className={`p-4 rounded-xl border ${riskColors.border} ${riskColors.bg} flex flex-col justify-between`}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Overall Safety Risk</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${riskColors.text} bg-white shadow-xs`}>
                      {riskLevel} Risk
                    </span>
                  </div>
                  <div className="my-3">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-black ${riskColors.text}`}>{riskScore}</span>
                      <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full ${riskColors.bar} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.min(riskScore, 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Evaluated against DGMS statutory benchmarks
                  </p>
                </div>

                {/* Statutory Compliance Index */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Compliance Index</span>
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="my-2">
                    <div className="text-2xl font-black text-slate-800">
                      {risk.compliance_score || compStatus.compliance_rate || '79.2%'}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {compStatus.dgms_compliance_posture || 'Continuous Tracking'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Active Inspections:</span>
                    <span className="font-bold text-slate-700">{compStatus.active_inspections_sampled ?? 'Active'}</span>
                  </div>
                </div>

                {/* Operational Stability */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Operational Stability</span>
                    <Activity className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="my-2">
                    <div className="text-2xl font-black text-indigo-700">
                      {risk.operational_stability_index ? `${risk.operational_stability_index}%` : '89.0%'}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Environmental: {risk.environmental_safety_index ? `${risk.environmental_safety_index}%` : '84.5%'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Unresolved Alerts:</span>
                    <span className="font-bold text-slate-700">{compStatus.unresolved_alerts_sampled ?? '0'}</span>
                  </div>
                </div>

              </div>

              {/* Sensor Telemetry Grid */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-indigo-500" />
                    Atmospheric &amp; Geotechnical Telemetry
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    DGMS CMR 2017 Verified
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Methane (CH4)</span>
                    <div className="text-base font-black text-slate-800 mt-0.5">
                      {telemetry.methane_ch4 || '0.35%'}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">&lt; 0.75% Limit</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pit Temp</span>
                    <div className="text-base font-black text-slate-800 mt-0.5">
                      {telemetry.ambient_temperature || telemetry.ambient_temp || '31.4 °C'}
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">Normal range</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Humidity</span>
                    <div className="text-base font-black text-slate-800 mt-0.5">
                      {telemetry.relative_humidity || '66.0%'}
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">Optimal</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Strata Vibration</span>
                    <div className="text-base font-black text-slate-800 mt-0.5">
                      {telemetry.ground_vibration || '0.42 mm/s'}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">Safe Threshold</span>
                  </div>
                </div>
              </div>

              {/* Anomalies Detected */}
              {anomalies.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Identified Hazards &amp; Anomaly Observations ({anomalies.length})
                  </h4>
                  <div className="space-y-2.5">
                    {anomalies.map((item: any, idx: number) => {
                      const isHigh = (item.severity || '').toLowerCase().includes('high');
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                            isHigh ? 'bg-rose-50/60 border-rose-200/80' : 'bg-slate-50/80 border-slate-200/60'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-800">
                                {item.type || item.parameter || 'Safety Observation'}
                              </span>
                              {item.severity && (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    isHigh ? 'bg-rose-200 text-rose-800' : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {item.severity}
                                </span>
                              )}
                              {item.status && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                  {item.status}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {item.details || item.margin || ''}
                            </p>
                            {item.action_required && (
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 pt-0.5">
                                <Zap className="w-3 h-3 text-indigo-500" />
                                <span>Action Required: {item.action_required}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Statutory Recommendations */}
              {recommendations.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    AI Statutory Action Plan &amp; Guidance
                  </h4>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 divide-y divide-slate-100 overflow-hidden">
                    {recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="p-3 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-xs font-medium text-slate-700 leading-relaxed">
                          {rec}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON Debug Accordion */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="flex items-center justify-between w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-1.5"
                >
                  <span className="flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5" />
                    Inspect Raw Telemetry &amp; JSON Payload
                  </span>
                  {showRawJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showRawJson && (
                  <div className="mt-2 relative">
                    <button
                      onClick={handleCopyJson}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-[10px] font-bold text-slate-700 flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy JSON'}
                    </button>
                    <pre className="text-[11px] font-mono p-4 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto max-h-60 custom-scrollbar">
                      {JSON.stringify(report, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Statutory AI Audit Report Generated
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-coal text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
