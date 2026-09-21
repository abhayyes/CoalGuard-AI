import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  variant?: 'default' | 'danger' | 'warning' | 'success';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}) => {
  const variantStyles = {
    default: 'bg-white border-slate-200 text-slate-800',
    danger: 'bg-red-50/60 border-red-200 text-red-900',
    warning: 'bg-amber-50/60 border-amber-200 text-amber-900',
    success: 'bg-emerald-50/60 border-emerald-200 text-emerald-900',
  };

  const iconBgStyles = {
    default: 'bg-slate-100 text-slate-700',
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-600',
    success: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div
      className={cn(
        'p-5 rounded-lg border shadow-sm transition-all hover:shadow-md',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={cn('p-2 rounded-lg', iconBgStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-1.5 py-0.5 rounded',
              trend.isNeutral
                ? 'bg-slate-100 text-slate-600'
                : trend.isPositive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
