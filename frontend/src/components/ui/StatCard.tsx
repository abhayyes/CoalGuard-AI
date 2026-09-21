import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'pink';
  className?: string;
  animationDelay?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  animationDelay = '0ms',
}) => {
  const configs = {
    default: {
      card: 'bg-white/90 border-pink-baby/15',
      icon: 'bg-slate-100 text-slate-600',
      glow: 'rgba(255,192,203,0.15)',
      accent: '#FFC0CB',
    },
    success: {
      card: 'bg-white/90 border-emerald-200/60',
      icon: 'bg-emerald-50 text-emerald-600',
      glow: 'rgba(16,185,129,0.1)',
      accent: '#10B981',
    },
    danger: {
      card: 'bg-white/90 border-red-200/60',
      icon: 'bg-red-50 text-red-600',
      glow: 'rgba(239,68,68,0.1)',
      accent: '#EF4444',
    },
    warning: {
      card: 'bg-white/90 border-amber-200/60',
      icon: 'bg-amber-50 text-amber-600',
      glow: 'rgba(245,158,11,0.1)',
      accent: '#F59E0B',
    },
    pink: {
      card: 'bg-white/90 border-pink-baby/40',
      icon: 'bg-pink-baby/20 text-pink-deep',
      glow: 'rgba(255,192,203,0.25)',
      accent: '#FFC0CB',
    },
  };

  const cfg = configs[variant];

  const TrendIcon = trend?.isNeutral ? Minus : trend?.isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      style={{ animationDelay }}
      className={cn(
        'group relative p-5 rounded-2xl border overflow-hidden transition-all duration-300 animate-fade-in-up cursor-default',
        'hover:-translate-y-1 hover:shadow-pink-md',
        cfg.card,
        className
      )}
    >
      {/* Background glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 30%, ${cfg.glow} 0%, transparent 70%)` }}
      />

      {/* Accent stripe top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300"
        style={{ background: `linear-gradient(to right, ${cfg.accent}, transparent)` }}
      />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-tight mt-0.5">
            {title}
          </span>
          <div className={cn('flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110', cfg.icon)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Value */}
        <div className="mt-3 flex items-end gap-2">
          <div className="text-2xl font-black tracking-tight text-coal leading-none animate-count-up">
            {value}
          </div>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold mb-0.5',
              trend.isNeutral
                ? 'bg-slate-100 text-slate-500'
                : trend.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            )}>
              <TrendIcon className="w-2.5 h-2.5" />
              {trend.value}
            </div>
          )}
        </div>

        {subtitle && (
          <p className="mt-1.5 text-[11px] text-slate-400 font-medium leading-tight">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
