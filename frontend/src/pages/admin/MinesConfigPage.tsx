import React from 'react';
import { Layers, Plus } from 'lucide-react';

export const MinesConfigPage: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-coal tracking-tight">Mine Configuration</h1>
          <p className="text-slate-400 text-sm mt-1">Manage mine profiles, zones, and regulatory mappings.</p>
        </div>
        <button className="h-10 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 bg-white text-coal hover:bg-white/90">
          <Plus className="w-4 h-4" />
          <span>Add Mine</span>
        </button>
      </div>

      <div className="p-8 rounded-2xl text-center border-2 border-dashed border-coal/10" style={{ background: 'rgba(253,248,251,0.5)' }}>
        <Layers className="w-12 h-12 text-coal/20 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-coal mb-1">No Mines Configured Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">System mine configuration UI will be available in the next release.</p>
      </div>
    </div>
  );
};

