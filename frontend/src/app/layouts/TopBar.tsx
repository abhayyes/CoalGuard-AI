import React, { useState } from 'react';
import { Bell, LogOut, User as UserIcon, ChevronDown, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useMineStore } from '../../stores/mineStore';

export const TopBar: React.FC = () => {
  const { user, assignedMines, logout } = useAuthStore();
  const { selectedMine, setSelectedMine } = useMineStore();
  const [hasNotif] = useState(true);

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : null;

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-6 animate-fade-in-down"
      style={{
        background: 'rgba(253,248,251,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,192,203,0.25)',
        boxShadow: '0 1px 0 0 rgba(255,192,203,0.12), 0 4px 24px rgba(255,192,203,0.08)',
      }}>

      {/* Left — mine selector */}
      <div className="flex items-center gap-3">
        {assignedMines.length > 0 && (
          <div className="relative flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mine</span>
            <div className="relative">
              <select
                value={selectedMine?.id || ''}
                onChange={(e) => {
                  const mine = assignedMines.find((m) => m.id === e.target.value) || null;
                  setSelectedMine(mine);
                }}
                className="appearance-none text-sm font-semibold text-coal pl-3 pr-8 py-1.5 rounded-xl cursor-pointer
                  focus:outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,192,203,0.1)',
                  border: '1px solid rgba(255,192,203,0.4)',
                }}
              >
                <option value="">All Assigned Mines</option>
                {assignedMines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.state})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">

        {/* Notification bell */}
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 group"
          style={{ background: 'rgba(255,192,203,0.08)', border: '1px solid rgba(255,192,203,0.2)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.18)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.08)')}
        >
          <Bell className="w-4 h-4 text-slate-600 group-hover:text-coal transition-colors" />
          {hasNotif && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-offwhite-warm animate-pulse" />
          )}
        </button>

        {/* Divider */}
        <div className="h-7 w-px" style={{ background: 'rgba(255,192,203,0.35)' }} />

        {/* User info + logout */}
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-coal overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,192,203,0.5), rgba(255,214,220,0.7))',
              border: '1.5px solid rgba(255,192,203,0.6)',
              boxShadow: '0 2px 8px rgba(255,192,203,0.3)',
            }}>
            {initials ?? <UserIcon className="w-3.5 h-3.5" />}
          </div>

          {/* Name & role */}
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-coal leading-none">{user?.full_name || 'User'}</div>
            <div className="text-[10px] text-slate-400 capitalize mt-0.5 font-medium">
              {user?.role?.replace(/_/g, ' ') || 'Official'}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Sign Out"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 group ml-1"
            style={{
              background: 'rgba(10,10,10,0.06)',
              border: '1px solid rgba(10,10,10,0.12)',
              color: '#0a0a0a',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#0a0a0a';
              (e.currentTarget as HTMLButtonElement).style.color = '#FFC0CB';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#0a0a0a';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,10,10,0.06)';
              (e.currentTarget as HTMLButtonElement).style.color = '#0a0a0a';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(10,10,10,0.12)';
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
