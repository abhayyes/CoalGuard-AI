import React from 'react';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalized = status.toLowerCase().replace(/_/g, ' ');

  const configs: Record<string, { dot: string; bg: string; text: string }> = {
    completed:   { dot: '#10B981', bg: 'rgba(16,185,129,0.1)',  text: '#047857' },
    verified:    { dot: '#10B981', bg: 'rgba(16,185,129,0.1)',  text: '#047857' },
    resolved:    { dot: '#10B981', bg: 'rgba(16,185,129,0.1)',  text: '#047857' },
    compliant:   { dot: '#10B981', bg: 'rgba(16,185,129,0.1)',  text: '#047857' },
    'in progress':      { dot: '#3B82F6', bg: 'rgba(59,130,246,0.1)', text: '#1D4ED8' },
    'under review':     { dot: '#3B82F6', bg: 'rgba(59,130,246,0.1)', text: '#1D4ED8' },
    'action assigned':  { dot: '#3B82F6', bg: 'rgba(59,130,246,0.1)', text: '#1D4ED8' },
    pending:            { dot: '#F59E0B', bg: 'rgba(245,158,11,0.1)', text: '#B45309' },
    draft:              { dot: '#F59E0B', bg: 'rgba(245,158,11,0.1)', text: '#B45309' },
    'partially compliant': { dot: '#F59E0B', bg: 'rgba(245,158,11,0.1)', text: '#B45309' },
    overdue:            { dot: '#EF4444', bg: 'rgba(239,68,68,0.1)',  text: '#B91C1C' },
    'non compliant':    { dot: '#EF4444', bg: 'rgba(239,68,68,0.1)',  text: '#B91C1C' },
    open:               { dot: '#EF4444', bg: 'rgba(239,68,68,0.1)',  text: '#B91C1C' },
  };

  const cfg = configs[normalized] ?? { dot: '#94A3B8', bg: 'rgba(148,163,184,0.1)', text: '#475569' };

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize tracking-wide', className)}
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {normalized}
    </span>
  );
};
