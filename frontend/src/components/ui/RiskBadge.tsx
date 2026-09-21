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

  const styles = {
    low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-purple-100 text-purple-800 border-purple-200 font-semibold',
  };

  const currentStyle = styles[normalized as keyof typeof styles] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider',
        currentStyle,
        className
      )}
    >
      {level}
    </span>
  );
};
