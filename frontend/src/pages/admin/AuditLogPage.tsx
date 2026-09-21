import React from 'react';
import { FileCheck } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-coal tracking-tight">Audit Trail</h1>
          <p className="text-slate-400 text-sm mt-1">System-wide immutable activity logs and compliance tracking.</p>
        </div>
      </div>

      <div className="p-8 rounded-2xl text-center border-2 border-dashed border-coal/10" style={{ background: 'rgba(253,248,251,0.5)' }}>
        <FileCheck className="w-12 h-12 text-coal/20 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-coal mb-1">Audit Logs Loading</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">Connecting to secure audit datastore...</p>
      </div>
    </div>
  );
};

