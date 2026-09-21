import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AssistantModal } from '../../components/ai/AssistantModal';

export const AppShell: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-mesh text-coal relative overflow-hidden">
      {/* Global ambient glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle at 80% 10%, rgba(255,192,203,0.18) 0%, transparent 65%)', animation: 'glowPulse 7s ease-in-out infinite' }} />
      <div className="fixed bottom-0 left-64 w-[400px] h-[400px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle at 20% 90%, rgba(255,192,203,0.12) 0%, transparent 65%)', animation: 'glowPulse 9s 2s ease-in-out infinite' }} />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopBar />
        <main className="flex-1 p-5 md:p-7 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Multilingual Conversational AI Assistant */}
      <AssistantModal />
    </div>
  );
};
