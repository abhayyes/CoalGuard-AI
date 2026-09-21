import React, { useEffect, useState } from 'react';
import { FileText, Upload, CheckCircle2, Clock, Eye } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useMineStore } from '../../stores/mineStore';
import { DocumentRecord } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../lib/utils';

export const DocumentsPage: React.FC = () => {
  const { selectedMine } = useMineStore();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('dgms_clearance');
  const [fileUrl, setFileUrl] = useState('');

  const fetchDocuments = async () => {
    try {
      const mineParam = selectedMine ? `?mine_id=${selectedMine.id}` : '';
      const res = await apiClient.get(`/documents${mineParam}`);
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedMine]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMine) {
      alert('Please select a mine in the top bar.');
      return;
    }

    try {
      await apiClient.post('/documents', {
        mine_id: selectedMine.id,
        title,
        doc_type: docType,
        file_url: fileUrl || 'https://supabase.co/storage/sample-dgms-clearance.pdf',
        file_size_kb: 1420,
      });
      setIsModalOpen(false);
      setTitle('');
      setFileUrl('');
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to upload document record');
    }
  };

  const getOcrBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" /> OCR Processed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded animate-pulse">
            <Clock className="w-3 h-3" /> OCR Extracting...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3" /> OCR Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Statutory Documents & OCR Vault</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            DGMS clearance certificates, EIA reports, and automated NLP compliance extraction
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </div>

      <div className="space-y-3">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <Card key={doc.id} className="hover:border-slate-300 transition-colors">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold text-[#1E3A5F]">{doc.file_type || 'Unknown'}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-400">{formatDate(doc.created_at)}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.file_name}</h3>
                    {doc.ocr_extracted_text && (
                      <p className="text-xs text-slate-500 line-clamp-1 italic bg-slate-50 p-1.5 rounded">
                        "OCR Snippet: {doc.ocr_extracted_text}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getOcrBadge(doc.ocr_status)}
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A5F] hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-16 text-center text-xs text-slate-400">
            No compliance documents stored.
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Upload Statutory Document</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. DGMS Annual Pit Clearance Certificate 2026"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Category / Classification
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="dgms_clearance">DGMS Clearance</option>
                  <option value="environmental_clearance">Environmental Clearance (EC)</option>
                  <option value="consent_to_operate">Consent to Operate (CTO)</option>
                  <option value="safety_audit">Statutory Safety Audit</option>
                  <option value="mine_plan">Approved Mining Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Document File URL (or Supabase Storage)
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://... /sample-doc.pdf"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Upload & Trigger OCR</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
