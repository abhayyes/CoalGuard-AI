import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppShell: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#F5F0F5] text-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-b from-[#F5F0F5] via-[#FDF8FB] to-[#F5F0F5]">
          <div className="max-w-7xl mx-auto bg-white/60 backdrop-blur-md rounded-3xl border border-[#FFC0CB]/20 shadow-xl shadow-[#FFC0CB]/10 p-6 md:p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
