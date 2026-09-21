import React from 'react';
import { FileText, Download } from 'lucide-react';

export const CorporateReportsPage: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-coal tracking-tight">Executive Reports</h1>
          <p className="text-slate-400 text-sm mt-1">Download and view comprehensive corporate compliance reports.</p>
        </div>
        <button className="h-10 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 bg-pink-baby text-coal hover:shadow-pink-md">
          <Download className="w-4 h-4" />
          <span>Export All</span>
        </button>
      </div>

      <div className="p-8 rounded-2xl text-center border-2 border-dashed border-coal/10" style={{ background: 'rgba(253,248,251,0.5)' }}>
        <FileText className="w-12 h-12 text-pink-baby/50 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-coal mb-1">Reports Dashboard Under Construction</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">This module is currently being finalized. Check back soon for detailed executive insights.</p>
      </div>
    </div>
  );
};

