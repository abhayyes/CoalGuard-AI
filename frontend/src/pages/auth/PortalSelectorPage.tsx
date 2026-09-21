import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, HardHat, Sparkles } from 'lucide-react';

export const PortalSelectorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%)' }}>
      
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,192,203,0.15) 0%, transparent 70%)', animation: 'glowPulse 6s ease-in-out infinite', filter: 'blur(40px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,192,203,0.1) 0%, transparent 70%)', animation: 'glowPulse 8s 2s ease-in-out infinite', filter: 'blur(50px)' }} />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,192,203,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,192,203,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 text-center mb-16 animate-fade-in-down">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FFC0CB, #F9B8C3)', color: '#0a0a0a' }}>
            <span className="relative z-10">CG</span>
            <div className="absolute inset-0 shimmer-bg opacity-50" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Select Your Portal<span style={{ color: '#FFC0CB' }}>.</span>
        </h1>
        <p className="text-white/40 text-base mt-3 font-medium">Choose your workspace to continue to CoalGuard AI</p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        
        {/* Mine Operations Portal */}
        <div 
          onClick={() => navigate('/login/mine_official')}
          className="group relative rounded-3xl p-8 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'rgba(18,18,18,0.95)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,192,203,0.15)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,192,203,0.05) inset',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300 opacity-50 group-hover:opacity-100"
            style={{ background: 'linear-gradient(to right, transparent, rgba(255,192,203,0.8), transparent)' }} />
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
            <HardHat className="w-8 h-8 text-pink-baby" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Mine Operations</h2>
          <p className="text-white/40 text-sm leading-relaxed">Access daily compliance tracking, safety inspections, and operational reports.</p>
        </div>

        {/* Corporate Portal */}
        <div 
          onClick={() => navigate('/login/corporate')}
          className="group relative rounded-3xl p-8 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'rgba(18,18,18,0.95)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,192,203,0.15)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,192,203,0.05) inset',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300 opacity-50 group-hover:opacity-100"
            style={{ background: 'linear-gradient(to right, transparent, rgba(255,192,203,0.8), transparent)' }} />
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
            <Building2 className="w-8 h-8 text-pink-baby" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Corporate Executive</h2>
          <p className="text-white/40 text-sm leading-relaxed">Enterprise-wide analytics, subsidiary oversight, and high-level governance.</p>
        </div>

        {/* Admin Portal */}
        <div 
          onClick={() => navigate('/login/admin')}
          className="group relative rounded-3xl p-8 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'rgba(18,18,18,0.95)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,192,203,0.15)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,192,203,0.05) inset',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300 opacity-50 group-hover:opacity-100"
            style={{ background: 'linear-gradient(to right, transparent, rgba(255,192,203,0.8), transparent)' }} />
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
            <Shield className="w-8 h-8 text-pink-baby" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">System Admin</h2>
          <p className="text-white/40 text-sm leading-relaxed">Master system configuration, user management, and audit trail oversight.</p>
        </div>

      </div>
    </div>
  );
};
