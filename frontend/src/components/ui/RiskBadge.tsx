import React from 'react';
import { RiskLevel } from '../../types';
import { cn } from '../../lib/utils';

interface RiskBadgeProps {
  level?: RiskLevel | string | null;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className }) => {
  if (!level) return null;

  const normalized = level.toLowerCase();

  const configs: Record<string, { bg: string; text: string; border: string }> = {
    low:      { bg: 'rgba(16,185,129,0.08)', text: '#047857', border: 'rgba(16,185,129,0.25)' },
    medium:   { bg: 'rgba(245,158,11,0.08)', text: '#B45309', border: 'rgba(245,158,11,0.25)' },
    high:     { bg: 'rgba(239,100,50,0.1)',  text: '#C2410C', border: 'rgba(239,100,50,0.25)' },
    critical: { bg: 'rgba(124,58,237,0.1)',  text: '#6D28D9', border: 'rgba(124,58,237,0.3)' },
  };

  const cfg = configs[normalized] ?? { bg: 'rgba(148,163,184,0.08)', text: '#475569', border: 'rgba(148,163,184,0.2)' };

  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest', className)}
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
    >
      {level}
    </span>
  );
};
