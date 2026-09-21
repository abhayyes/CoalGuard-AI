import React from 'react';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalized = status.toLowerCase().replace(/_/g, ' ');

  const getStyle = (s: string) => {
    switch (s) {
      case 'completed':
      case 'verified':
      case 'resolved':
      case 'compliant':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in progress':
      case 'under review':
      case 'action assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
      case 'draft':
      case 'partially compliant':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'overdue':
      case 'non compliant':
      case 'open':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        getStyle(normalized),
        className
      )}
    >
      {normalized}
    </span>
  );
};
