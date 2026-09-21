import React, { useEffect, useState } from 'react';
import { FileText, Upload, CheckCircle2, Clock, Eye, X } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { DocumentRecord } from '../../types';
import { formatDate } from '../../lib/utils';

const inputCls = "w-full text-xs px-3.5 py-2.5 rounded-xl text-coal placeholder:text-slate-300 transition-all duration-150 focus:outline-none";
const inputStyle = { background: 'rgba(253,248,251,0.7)', border: '1px solid rgba(255,192,203,0.25)', color: '#0a0a0a' };

const OcrBadge: React.FC<{ status: string }> = ({ status }) => {
  const configs: Record<string, { bg: string; color: string; label: string; pulse?: boolean }> = {
    completed:  { bg: 'rgba(16,185,129,0.1)',  color: '#047857', label: 'OCR Processed' },
    processing: { bg: 'rgba(59,130,246,0.1)',  color: '#1D4ED8', label: 'OCR Extracting…', pulse: true },
  };
  const cfg = configs[status] ?? { bg: 'rgba(148,163,184,0.1)', color: '#64748B', label: 'OCR Pending' };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg ${cfg.pulse ? 'animate-pulse' : ''}`}
      style={{ background: cfg.bg, color: cfg.color }}>
      {status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {cfg.label}
    </span>
  );
};

export const DocumentsPage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('dgms_clearance');
  const [fileUrl, setFileUrl] = useState('');

  const fetchDocuments = async () => {
    try {
      const mineParam = selectedMine ? `?mine_id=${selectedMine.id}` : '';
      const res = await apiClient.get(`/documents${mineParam}`);
      setDocuments(res.data.data || []);
    } catch { setDocuments([]); }
  };

  useEffect(() => { fetchDocuments(); }, [selectedMine]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMine) { alert('Please select a mine first.'); return; }
    try {
      await apiClient.post('/documents', {
        mine_id: selectedMine.id, title, doc_type: docType,
        file_url: fileUrl || 'https://supabase.co/storage/sample-dgms-clearance.pdf',
        file_size_kb: 1420,
      });
      setIsModalOpen(false); setTitle(''); setFileUrl('');
      fetchDocuments();
    } catch (err: any) { alert(err.response?.data?.detail || 'Failed to upload'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mine Documents</span>
          </div>
          <h1 className="text-2xl font-black text-coal tracking-tight">Statutory Documents &amp; OCR Vault</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            DGMS clearances, EIA reports, and automated NLP compliance extraction
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-coal transition-all duration-200 hover:shadow-pink-md hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)', boxShadow: '0 4px 16px rgba(255,192,203,0.4)' }}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Document
        </button>
      </div>

      {/* Document list */}
      <div className="space-y-3">
        {documents.length > 0 ? (
          documents.map((doc, i) => (
            <div
              key={doc.id}
              className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 animate-fade-in-up hover:-translate-y-0.5"
              style={{
                animationDelay: `${i * 60}ms`,
                background: 'rgba(253,248,251,0.9)',
                border: '1px solid rgba(255,192,203,0.15)',
              }}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2.5 rounded-xl flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(255,192,203,0.12)' }}>
                  <FileText className="w-5 h-5" style={{ color: '#C08090' }} />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#C08090' }}>
                      {doc.file_type || 'Document'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400 font-medium">{formatDate(doc.created_at)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-coal truncate">{doc.file_name}</h3>
                  {doc.ocr_extracted_text && (
                    <p className="text-[11px] text-slate-400 line-clamp-1 italic px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(255,192,203,0.06)' }}>
                      "{doc.ocr_extracted_text}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <OcrBadge status={doc.ocr_status} />
                <a
                  href={doc.file_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-150 hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,192,203,0.12)', color: '#C08090' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.25)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.12)')}
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-float"
              style={{ background: 'rgba(255,192,203,0.1)', border: '1px solid rgba(255,192,203,0.2)' }}>
              <FileText className="w-7 h-7" style={{ color: '#FFC0CB' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-coal">No documents stored</p>
              <p className="text-xs text-slate-400 mt-1">Upload your first statutory document to get started.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="relative w-full max-w-md rounded-3xl overflow-hidden animate-scale-in"
            style={{ background: 'rgba(253,248,251,0.98)', border: '1px solid rgba(255,192,203,0.3)', boxShadow: '0 40px 80px rgba(0,0,0,0.3)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,192,203,0.8), transparent)' }} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-black text-coal">Upload Statutory Document</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">OCR extraction will run automatically after upload</p>
                </div>
                <button onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg transition-colors" style={{ color: '#94A3B8' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Title</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. DGMS Annual Pit Clearance Certificate 2026" className={inputCls} style={inputStyle} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category / Classification</label>
                  <select value={docType} onChange={(e) => setDocType(e.target.value)} className={inputCls} style={inputStyle}>
                    <option value="dgms_clearance">DGMS Clearance</option>
                    <option value="environmental_clearance">Environmental Clearance (EC)</option>
                    <option value="consent_to_operate">Consent to Operate (CTO)</option>
                    <option value="safety_audit">Statutory Safety Audit</option>
                    <option value="mine_plan">Approved Mining Plan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">File URL (Supabase / CDN)</label>
                  <input type="url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://... /sample-doc.pdf" className={inputCls} style={inputStyle} />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,192,203,0.2)' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 transition-all duration-150"
                    style={{ border: '1px solid rgba(255,192,203,0.25)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >Cancel</button>
                  <button type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black text-coal transition-all duration-150 active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)', boxShadow: '0 4px 14px rgba(255,192,203,0.4)' }}
                  >Upload &amp; Trigger OCR</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
