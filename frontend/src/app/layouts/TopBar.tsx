import React from 'react';
import { Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useMineStore } from '../../stores/mineStore';

export const TopBar: React.FC = () => {
  const { user, assignedMines, logout } = useAuthStore();
  const { selectedMine, setSelectedMine } = useMineStore();

  return (
    <header className="h-16 bg-[#FDF8FB]/90 backdrop-blur-xl border-b border-[#FFC0CB]/30 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {assignedMines.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Mine:</span>
            <select
              value={selectedMine?.id || ''}
              onChange={(e) => {
                const mine = assignedMines.find((m) => m.id === e.target.value) || null;
                setSelectedMine(mine);
              }}
              className="text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Assigned Mines</option>
              {assignedMines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.state})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-sm">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-semibold text-slate-800">{user?.full_name || 'User'}</div>
            <div className="text-xs text-slate-600 capitalize">{user?.role?.replace(/_/g, ' ') || 'Official'}</div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#0a0a0a] bg-[#FFC0CB]/20 hover:bg-[#FFC0CB]/40 rounded-full border border-[#FFC0CB]/30 transition-colors shadow-sm shadow-[#FFC0CB]/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
