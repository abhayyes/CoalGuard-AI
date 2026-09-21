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
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'mine_official';

  const mineNavItems = [
    { to: '/mine/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/mine/compliance', label: 'Compliance Register', icon: CheckSquare },
    { to: '/mine/inspections', label: 'Inspections', icon: ClipboardList },
    { to: '/mine/observations', label: 'Observations', icon: AlertTriangle },
    { to: '/mine/contractors', label: 'Contractors', icon: Users },
    { to: '/mine/documents', label: 'Documents & OCR', icon: FileText },
    { to: '/mine/alerts', label: 'Alerts', icon: Shield },
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/mines', label: 'Mine Config', icon: Layers },
    { to: '/admin/audit-log', label: 'Audit Trail', icon: FileCheck },
  ];

  const corporateNavItems = [
    { to: '/corporate/dashboard', label: 'National Dashboard', icon: LayoutDashboard },
    { to: '/corporate/reports', label: 'Executive Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-[#1E3A5F] text-white flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-900">
          CG
        </div>
        <div>
          <div className="font-bold text-sm tracking-wide text-white">COALGUARD AI</div>
          <div className="text-[10px] text-white/60 tracking-wider">MINE GOVERNANCE</div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
            Mine Operations
          </div>
          <nav className="space-y-1">
            {mineNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {(role === 'admin' || role === 'corporate') && (
          <div>
            <div className="px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
              Corporate & Analytics
            </div>
            <nav className="space-y-1">
              {corporateNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-white/15 text-white font-semibold'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {role === 'admin' && (
          <div>
            <div className="px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
              Administration
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-white/15 text-white font-semibold'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 text-[11px] text-white/50 text-center">
        CoalGuard AI v1.0 • DGMS Compliant
      </div>
    </aside>
  );
};
