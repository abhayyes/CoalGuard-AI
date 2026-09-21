import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  ClipboardList,
  AlertTriangle,
  Users,
  FileText,
  Shield,
  Layers,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

const NavItem: React.FC<{ to: string; label: string; icon: React.ElementType; delay?: string }> = ({
  to, label, icon: Icon, delay = '',
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 animate-fade-in-up',
        delay,
        isActive
          ? 'bg-pink-baby/20 text-white font-semibold shadow-pink-sm nav-active-dot'
          : 'text-white/60 hover:bg-white/8 hover:text-white/90'
      )
    }
  >
    <span
      className={cn(
        'flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200',
        'group-[.nav-active-dot]:bg-pink-baby/25 group-hover:bg-white/10'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </span>
    <span className="truncate">{label}</span>
    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-baby opacity-0 transition-opacity duration-200 group-[.nav-active-dot]:opacity-100" />
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'mine_official';

  const mineNavItems = [
    { to: '/mine/dashboard',    label: 'Dashboard',         icon: LayoutDashboard },
    { to: '/mine/compliance',   label: 'Compliance',        icon: CheckSquare },
    { to: '/mine/inspections',  label: 'Inspections',       icon: ClipboardList },
    { to: '/mine/observations', label: 'Observations',      icon: AlertTriangle },
    { to: '/mine/contractors',  label: 'Contractors',       icon: Users },
    { to: '/mine/documents',    label: 'Documents & OCR',   icon: FileText },
    { to: '/mine/alerts',       label: 'Alerts',            icon: Shield },
  ];

  const adminNavItems = [
    { to: '/admin/dashboard',   label: 'Admin Overview',    icon: LayoutDashboard },
    { to: '/admin/users',       label: 'User Directory',    icon: Users },
    { to: '/admin/mines',       label: 'Mine Config',       icon: Layers },
    { to: '/admin/audit-log',   label: 'Audit Trail',       icon: FileCheck },
  ];

  const corporateNavItems = [
    { to: '/corporate/dashboard', label: 'National Dashboard', icon: LayoutDashboard },
    { to: '/corporate/reports',   label: 'Executive Reports',  icon: FileText },
  ];

  const delays = ['delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300', 'delay-400', 'delay-500'];

  return (
    <aside className="w-64 flex-shrink-0 min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 60%, #0d0d0d 100%)' }}>

      {/* Ambient glow blobs */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,192,203,0.12) 0%, transparent 70%)', animation: 'glowPulse 5s ease-in-out infinite' }} />
      <div className="absolute bottom-32 left-0 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,192,203,0.08) 0%, transparent 70%)', animation: 'glowPulse 7s 1.5s ease-in-out infinite' }} />

      {/* Brand */}
      <div className="relative h-16 flex items-center px-5 border-b border-white/5 gap-3 animate-fade-in">
        <div className="relative w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs z-10 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #FFC0CB, #F9B8C3)', color: '#0a0a0a' }}>
          <span className="relative z-10">CG</span>
          <div className="absolute inset-0 shimmer-bg opacity-60" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-sm tracking-widest text-white truncate">COALGUARD AI</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Sparkles className="w-2.5 h-2.5 text-pink-baby opacity-70" />
            <span className="text-[9px] text-white/40 tracking-widest font-medium uppercase">Mine Governance</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 py-5 px-3 space-y-5 overflow-y-auto">
        <div>
          <div className="px-3 text-[9px] font-bold text-white/25 uppercase tracking-[0.15em] mb-2">
            Mine Operations
          </div>
          <nav className="space-y-0.5">
            {mineNavItems.map((item, i) => (
              <NavItem key={item.to} {...item} delay={delays[i] || ''} />
            ))}
          </nav>
        </div>

        {(role === 'admin' || role === 'corporate') && (
          <div>
            <div className="px-3 text-[9px] font-bold text-white/25 uppercase tracking-[0.15em] mb-2">
              Corporate & Analytics
            </div>
            <nav className="space-y-0.5">
              {corporateNavItems.map((item, i) => (
                <NavItem key={item.to} {...item} delay={delays[i] || ''} />
              ))}
            </nav>
          </div>
        )}

        {role === 'admin' && (
          <div>
            <div className="px-3 text-[9px] font-bold text-white/25 uppercase tracking-[0.15em] mb-2">
              Administration
            </div>
            <nav className="space-y-0.5">
              {adminNavItems.map((item, i) => (
                <NavItem key={item.to} {...item} delay={delays[i] || ''} />
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative p-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-white/30 font-medium">CoalGuard AI v1.0 · DGMS Compliant</span>
        </div>
      </div>
    </aside>
  );
};

